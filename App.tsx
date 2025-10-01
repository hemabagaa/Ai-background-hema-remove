
import React, { useState, useCallback, useRef } from 'react';
import { removeImageBackground } from './services/geminiService';
import { fileToDataUrl } from './utils/fileUtils';
import ImageDisplay from './components/ImageDisplay';
import { UploadIcon, DownloadIcon, SparklesIcon, XCircleIcon, ArrowPathIcon } from './components/Icons';

type AppState = 'idle' | 'processing' | 'success' | 'error';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };
  
  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
        setErrorMessage('Please upload a valid image file.');
        setAppState('error');
        return;
    }
    setAppState('processing');
    setProcessedImage(null);
    setErrorMessage('');

    try {
        const dataUrl = await fileToDataUrl(file);
        setOriginalImage(dataUrl);

        const resultBase64 = await removeImageBackground(dataUrl);
        const resultDataUrl = `data:image/png;base64,${resultBase64}`;
        setProcessedImage(resultDataUrl);
        setAppState('success');
    } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        setErrorMessage(`Failed to process image. ${message}`);
        setAppState('error');
        setOriginalImage(null);
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (appState === 'processing') return;

    const file = event.dataTransfer.files?.[0];
    if (file) {
        processFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleReset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setAppState('idle');
    setErrorMessage('');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'background-removed.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-2">
                <SparklesIcon className="w-8 h-8 text-indigo-400" />
                <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                    AI Background Remover
                </h1>
            </div>
            <p className="text-lg text-gray-400">Instantly remove backgrounds with pixel-perfect precision.</p>
        </header>
        
        <main className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <ImageDisplay title="Original" imageSrc={originalImage} onDrop={handleDrop} onDragOver={handleDragOver}>
              {appState === 'idle' && !originalImage && (
                 <UploadButton onClick={handleUploadClick} />
              )}
            </ImageDisplay>

            <ImageDisplay title="Result" isLoading={appState === 'processing'}>
              {appState === 'success' && processedImage ? (
                <img src={processedImage} alt="Processed result" className="w-full h-full object-contain" />
              ) : appState === 'error' ? (
                <ErrorDisplay message={errorMessage} onRetry={handleUploadClick} />
              ) : null}
            </ImageDisplay>
        </main>
        
        {appState !== 'idle' && (
             <footer className="mt-8 flex justify-center items-center gap-4">
                 <button 
                    onClick={handleReset}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                     <ArrowPathIcon className="w-5 h-5"/>
                     Remove Another
                 </button>

                {appState === 'success' && (
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-indigo-600/30">
                        <DownloadIcon className="w-5 h-5"/>
                        Download PNG
                    </button>
                )}
            </footer>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
    </div>
  );
};

const UploadButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <div className="text-center">
        <button
            onClick={onClick}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
        >
            <div className="absolute -inset-px bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-lg group-hover:opacity-100 group-hover:-inset-1.5 group-hover:duration-200 animate-tilt"></div>
            <div className="relative flex items-center gap-3">
              <UploadIcon className="w-6 h-6"/>
              <span>Upload Image</span>
            </div>
        </button>
        <p className="mt-4 text-sm text-gray-500">or drag and drop here</p>
    </div>
);

const ErrorDisplay: React.FC<{ message: string; onRetry: () => void; }> = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <XCircleIcon className="w-16 h-16 text-red-500 mb-4"/>
        <p className="text-lg font-semibold text-red-400">An Error Occurred</p>
        <p className="text-sm text-gray-400 mb-6 max-w-xs">{message}</p>
        <button 
            onClick={onRetry}
            className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg focus:ring-4 focus:outline-none focus:ring-indigo-800">
            Try Again
        </button>
    </div>
);


export default App;
