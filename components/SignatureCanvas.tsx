
import React, { useRef, useEffect, useState } from 'react';

interface SignatureCanvasProps {
  name: string;
  registration: string;
  signatureImage: string | null;
  onSignatureGenerated: (blob: Blob) => void;
  targetWidth: number;
  targetHeight: number;
  zoom: number;
  rotation: number;
  fontSize: number;
  letterSpacing: number;
  contrast: number;
  brightness: number;
  sharpness: number;
  threshold: number;
  strokeWeight: number;
}

const applySharpen = (ctx: CanvasRenderingContext2D, width: number, height: number, weight: number) => {
  if (weight <= 0) return;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const output = new Uint8ClampedArray(data.length);
  const kernel = [0, -weight, 0, -weight, 1 + 4 * weight, -weight, 0, -weight, 0];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = 0; ky < 3; ky++) {
          for (let kx = 0; kx < 3; kx++) {
            const pos = ((y + ky - 1) * width + (x + kx - 1)) * 4 + c;
            sum += data[pos] * kernel[ky * 3 + kx];
          }
        }
        output[(y * width + x) * 4 + c] = sum;
      }
      output[(y * width + x) * 4 + 3] = data[(y * width + x) * 4 + 3];
    }
  }
  ctx.putImageData(new ImageData(output, width, height), 0, 0);
};

const applyThreshold = (ctx: CanvasRenderingContext2D, width: number, height: number, threshold: number) => {
  if (threshold <= 0) return;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const val = avg > threshold ? 255 : 0;
    data[i] = data[i+1] = data[i+2] = val;
  }
  ctx.putImageData(imageData, 0, 0);
};

const createBMPBlob = (canvas: HTMLCanvasElement): Blob => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return new Blob();
  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const fileSize = 54 + rowSize * height;
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);
  
  view.setUint16(0, 0x4D42, true);
  view.setUint32(2, fileSize, true);
  view.setUint32(10, 54, true);
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);

  for (let y = 0; y < height; y++) {
    const rowOffset = 54 + (height - 1 - y) * rowSize;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const pixelOffset = rowOffset + x * 3;
      view.setUint8(pixelOffset, data[i + 2]);
      view.setUint8(pixelOffset + 1, data[i + 1]);
      view.setUint8(pixelOffset + 2, data[i]);
    }
  }
  return new Blob([buffer], { type: 'image/bmp' });
};

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({ 
  name, registration, signatureImage, onSignatureGenerated,
  targetWidth, targetHeight,
  zoom, rotation, fontSize, letterSpacing, contrast, brightness, sharpness, threshold, strokeWeight
}) => {
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imagePos, setImagePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const SCALE = 4;

  useEffect(() => {
    if (!signatureImage) { setImage(null); return; }
    const img = new Image();
    img.src = signatureImage;
    img.onload = () => {
      setImage(img);
      const textBufferHeight = Math.max(25, targetHeight * 0.35);
      const signatureAreaHeight = targetHeight - textBufferHeight;
      const ratio = Math.min(targetWidth / img.width, signatureAreaHeight / img.height);
      
      setImagePos({ 
        x: (targetWidth - img.width * ratio) / 2, 
        y: (signatureAreaHeight - img.height * ratio) / 2 
      });
    };
  }, [signatureImage, targetWidth, targetHeight]);

  useEffect(() => {
    if (!image || !displayCanvasRef.current) return;

    const buffer = document.createElement('canvas');
    buffer.width = targetWidth * SCALE;
    buffer.height = targetHeight * SCALE;
    const bctx = buffer.getContext('2d', { willReadFrequently: true });
    if (!bctx) return;

    bctx.fillStyle = 'white';
    bctx.fillRect(0, 0, buffer.width, buffer.height);

    // 2. Desenhar Assinatura com Reforço de Traço
    bctx.save();
    bctx.scale(SCALE, SCALE);
    bctx.filter = `brightness(${brightness}) contrast(${contrast})`;
    
    const textBufferHeight = Math.max(25, targetHeight * 0.35);
    const signatureAreaHeight = targetHeight - textBufferHeight;

    const ratio = Math.min(targetWidth / image.width, signatureAreaHeight / image.height);
    const drawWidth = image.width * ratio * zoom;
    const drawHeight = image.height * ratio * zoom;

    bctx.translate(imagePos.x + (drawWidth/zoom)/2, imagePos.y + (drawHeight/zoom)/2);
    bctx.rotate((rotation * Math.PI) / 180);
    
    if (strokeWeight > 0) {
      for (let ox = -strokeWeight; ox <= strokeWeight; ox += 0.3) {
        for (let oy = -strokeWeight; oy <= strokeWeight; oy += 0.3) {
          bctx.drawImage(image, -drawWidth / 2 + ox, -drawHeight / 2 + oy, drawWidth, drawHeight);
        }
      }
    } else {
      bctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    }
    
    bctx.restore();

    // 3. Desenhar Texto com Super-sampling
    bctx.save();
    bctx.scale(SCALE, SCALE);
    bctx.fillStyle = 'black';
    bctx.textAlign = 'center';
    bctx.font = `bold ${fontSize}px "Roboto", sans-serif`;
    
    const drawText = (text: string, x: number, y: number, spacing: number) => {
      const chars = text.split('');
      let w = 0; 
      chars.forEach((c, i) => w += bctx.measureText(c).width + (i < chars.length - 1 ? spacing : 0));
      let cur = x - w / 2;
      chars.forEach((c, i) => {
        bctx.fillText(c, cur + bctx.measureText(c).width / 2, y);
        cur += bctx.measureText(c).width + spacing;
      });
    };
    
    const textBaseY = targetHeight - (textBufferHeight * 0.6);
    drawText(name.toUpperCase(), targetWidth / 2, textBaseY, letterSpacing);
    drawText(registration, targetWidth / 2, textBaseY + fontSize + 1, letterSpacing);
    bctx.restore();

    // 4. Downscale e Pós-processamento
    const displayCanvas = displayCanvasRef.current;
    const dctx = displayCanvas.getContext('2d', { willReadFrequently: true });
    if (!dctx) return;
    dctx.imageSmoothingEnabled = true;
    dctx.imageSmoothingQuality = 'high';
    dctx.drawImage(buffer, 0, 0, targetWidth, targetHeight);

    applySharpen(dctx, targetWidth, targetHeight, sharpness);
    applyThreshold(dctx, targetWidth, targetHeight, threshold);

    onSignatureGenerated(createBMPBlob(displayCanvas));
  }, [image, imagePos, name, registration, onSignatureGenerated, targetWidth, targetHeight, zoom, rotation, fontSize, letterSpacing, contrast, brightness, sharpness, threshold, strokeWeight]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = displayCanvasRef.current?.getBoundingClientRect();
    if (rect) {
      const mx = (e.clientX - rect.left) / (rect.width / targetWidth);
      const my = (e.clientY - rect.top) / (rect.height / targetHeight);
      setDragStart({ x: mx - imagePos.x, y: my - imagePos.y });
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const rect = displayCanvasRef.current?.getBoundingClientRect();
    if (rect) {
      const mx = (e.clientX - rect.left) / (rect.width / targetWidth);
      const my = (e.clientY - rect.top) / (rect.height / targetHeight);
      setImagePos({ x: mx - dragStart.x, y: my - dragStart.y });
    }
  };

  return (
    <canvas
      ref={displayCanvasRef}
      width={targetWidth}
      height={targetHeight}
      style={{ 
        width: Math.min(window.innerWidth * 0.4, targetWidth * 4) + 'px', 
        height: 'auto', 
        aspectRatio: `${targetWidth}/${targetHeight}`,
        imageRendering: 'pixelated'
      }}
      className="bg-white cursor-move rounded-sm"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    />
  );
};
