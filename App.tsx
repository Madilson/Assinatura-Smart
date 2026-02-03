
import React, { useState } from 'react';
import { SignatureCanvas } from './components/SignatureCanvas';
import { InputField } from './components/InputField';
import { FileUpload } from './components/FileUpload';
import { Button } from './components/Button';
import { DownloadIcon, ImageIcon } from './components/Icons';
import { Slider } from './components/Slider';

const App: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [registration, setRegistration] = useState<string>('');
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [generatedSignatureBlob, setGeneratedSignatureBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // States para dimensões
  const [targetWidth, setTargetWidth] = useState<number>(96);
  const [targetHeight, setTargetHeight] = useState<number>(68);

  // States para ajustes de imagem
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(1.5);
  const [brightness, setBrightness] = useState<number>(1.0);
  const [sharpness, setSharpness] = useState<number>(0.5);
  const [threshold, setThreshold] = useState<number>(0);
  const [strokeWeight, setStrokeWeight] = useState<number>(0); 
  
  // States para ajustes de texto
  const [fontSize, setFontSize] = useState<number>(7);
  const [letterSpacing, setLetterSpacing] = useState<number>(0.2);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setSignatureImage(reader.result as string);
          setError(null);
        };
        reader.onerror = () => setError('Falha ao ler o arquivo.');
        reader.readAsDataURL(file);
      } else {
        setError('Selecione uma imagem válida.');
      }
    }
  };

  const handleDownload = () => {
    if (generatedSignatureBlob) {
      const url = URL.createObjectURL(generatedSignatureBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `assinatura_${targetWidth}x${targetHeight}_${name.replace(/\s/g, '_') || 'digital'}.bmp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const isFormValid = name.trim() !== '' && registration.trim() !== '' && !!signatureImage;

  return (
    <main className="bg-slate-100 min-h-screen w-full flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-200">
        
        {/* Painel de Controles */}
        <div className="w-full md:w-1/2 p-6 md:p-8 space-y-6 border-r border-slate-100 overflow-y-auto max-h-[95vh]">
          <header className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-black tracking-tight text-indigo-600">Assinatura Pro HD</h1>
            <p className="text-slate-500 text-xs">Sem contornos. Ajuste fino para exportação BMP.</p>
          </header>

          <section className="space-y-4">
            <FileUpload onFileChange={handleFileChange} />
            {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField id="name" label="Nome Completo" value={name} onChange={(e) => setName(e.target.value)} placeholder="JOÃO SILVA" />
              <InputField id="registration" label="Registro" value={registration} onChange={(e) => setRegistration(e.target.value)} placeholder="000.000-0" />
            </div>
          </section>

          <section className="space-y-6 pt-4">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                <span className="w-8 h-px bg-slate-200 mr-2"></span> Dimensões de Saída <span className="w-full h-px bg-slate-200 ml-2"></span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Slider label="Largura (px)" value={targetWidth} onChange={(e) => setTargetWidth(parseInt(e.target.value))} min={40} max={400} step={1} displayValue={targetWidth + 'px'} />
                <Slider label="Altura (px)" value={targetHeight} onChange={(e) => setTargetHeight(parseInt(e.target.value))} min={20} max={200} step={1} displayValue={targetHeight + 'px'} />
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                <span className="w-8 h-px bg-slate-200 mr-2"></span> Ajustes da Imagem <span className="w-full h-px bg-slate-200 ml-2"></span>
              </h3>
              <div className="space-y-3">
                <Slider label="Tamanho da Assinatura" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} min={0.1} max={3} step={0.01} displayValue={Math.round(zoom * 100) + '%'} />
                <Slider label="Rotação" value={rotation} onChange={(e) => setRotation(parseFloat(e.target.value))} min={-180} max={180} step={1} displayValue={rotation + '°'} />
                <Slider label="Espessura do Traço" value={strokeWeight} onChange={(e) => setStrokeWeight(parseFloat(e.target.value))} min={0} max={1.5} step={0.1} displayValue={strokeWeight > 0 ? '+' + (strokeWeight * 10).toFixed(0) : 'Original'} />
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                <span className="w-8 h-px bg-slate-200 mr-2"></span> Processamento Visual <span className="w-full h-px bg-slate-200 ml-2"></span>
              </h3>
              <div className="space-y-3">
                <Slider label="Brilho" value={brightness} onChange={(e) => setBrightness(parseFloat(e.target.value))} min={0.5} max={2} step={0.05} displayValue={brightness.toFixed(2)} />
                <Slider label="Contraste" value={contrast} onChange={(e) => setContrast(parseFloat(e.target.value))} min={1} max={4} step={0.1} displayValue={contrast.toFixed(1)} />
                <Slider label="Nitidez (Sharpen)" value={sharpness} onChange={(e) => setSharpness(parseFloat(e.target.value))} min={0} max={2} step={0.1} displayValue={sharpness.toFixed(1)} />
                <Slider label="Limiar (P&B)" value={threshold} onChange={(e) => setThreshold(parseInt(e.target.value))} min={0} max={255} step={1} displayValue={threshold === 0 ? 'Off' : threshold} />
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                <span className="w-8 h-px bg-slate-200 mr-2"></span> Tipografia <span className="w-full h-px bg-slate-200 ml-2"></span>
              </h3>
              <div className="space-y-3">
                <Slider label="Tamanho da Fonte" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} min={4} max={16} step={1} displayValue={fontSize + 'px'} />
                <Slider label="Espaçamento" value={letterSpacing} onChange={(e) => setLetterSpacing(parseFloat(e.target.value))} min={-1} max={3} step={0.1} displayValue={letterSpacing.toFixed(1)} />
              </div>
            </div>
          </section>
        </div>

        {/* Área de Preview */}
        <div className="w-full md:w-1/2 bg-slate-900 p-8 flex flex-col items-center justify-center space-y-8 relative">
          <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          </div>

          <div className="text-center z-10 w-full overflow-auto flex flex-col items-center">
            <h2 className="text-white text-xs font-bold uppercase tracking-[0.2em] mb-4 opacity-50">Visualização Real ({targetWidth}x{targetHeight})</h2>
            
            <div className="flex justify-center items-center min-h-[300px]">
              {isFormValid ? (
                <div className="relative group transition-all">
                  <SignatureCanvas 
                    name={name}
                    registration={registration}
                    signatureImage={signatureImage}
                    onSignatureGenerated={setGeneratedSignatureBlob}
                    targetWidth={targetWidth}
                    targetHeight={targetHeight}
                    zoom={zoom}
                    rotation={rotation}
                    fontSize={fontSize}
                    letterSpacing={letterSpacing}
                    contrast={contrast}
                    brightness={brightness}
                    sharpness={sharpness}
                    threshold={threshold}
                    strokeWeight={strokeWeight}
                  />
                  <div className="mt-4 flex flex-col items-center space-y-1">
                    <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">Arraste para posicionar</p>
                  </div>
                </div>
              ) : (
                <div className="w-[240px] h-[170px] border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-700">
                  <ImageIcon className="w-10 h-10 mb-4 opacity-10" />
                  <span className="text-[10px] uppercase font-black tracking-widest">Aguardando Imagem</span>
                </div>
              )}
            </div>
          </div>

          <div className="w-full max-w-xs z-10 space-y-4">
            <Button onClick={handleDownload} disabled={!isFormValid || !generatedSignatureBlob}>
              <DownloadIcon className="w-5 h-5 mr-2" />
              BAIXAR ASSINATURA (.BMP)
            </Button>
            <p className="text-[9px] text-slate-500 text-center leading-relaxed">
              Exportação profissional em 24-bit compatível com scanners e sistemas legados industriais.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default App;
