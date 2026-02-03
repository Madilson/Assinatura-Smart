
import React from 'react';
import { UploadIcon } from './Icons';

interface FileUploadProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Imagem da Assinatura
      </label>
      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
        <div className="flex items-center justify-center w-full px-3 py-4 border-2 border-slate-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <UploadIcon className="mx-auto h-10 w-10 text-slate-400" />
            <div className="flex text-sm text-slate-600">
              <span className="text-indigo-600 font-semibold">Clique para carregar</span>
              <p className="pl-1">ou arraste e solte</p>
            </div>
            <p className="text-xs text-slate-500">PNG, JPG, GIF até 10MB</p>
          </div>
        </div>
        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={onFileChange} />
      </label>
    </div>
  );
};
