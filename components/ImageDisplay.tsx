
import React from 'react';
import Spinner from './Spinner';

interface ImageDisplayProps {
  title: string;
  imageSrc?: string | null;
  isLoading?: boolean;
  children?: React.ReactNode;
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ title, imageSrc, isLoading = false, children, onDrop, onDragOver }) => {
  return (
    <div className="w-full">
        <h2 className="text-lg font-semibold text-center mb-4 text-gray-300">{title}</h2>
        <div 
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="aspect-square w-full rounded-2xl bg-gray-800 border-2 border-dashed border-gray-700 flex items-center justify-center relative overflow-hidden group transition-colors duration-300 hover:border-indigo-500"
            style={{
                backgroundImage: 'repeating-conic-gradient(#374151 0% 25%, #4b5563 0% 50%)',
                backgroundSize: '20px 20px',
            }}
        >
            <div className="absolute inset-0 bg-gray-800/50 backdrop-blur-sm group-hover:backdrop-blur-[2px] transition-all duration-300"></div>

            <div className="z-10 w-full h-full flex items-center justify-center">
                {isLoading ? (
                    <div className="flex flex-col items-center text-center">
                        <Spinner />
                        <p className="mt-4 text-lg font-medium text-gray-300 animate-pulse">Removing background...</p>
                        <p className="text-sm text-gray-500">This may take a moment.</p>
                    </div>
                ) : imageSrc ? (
                    <img src={imageSrc} alt={title} className="w-full h-full object-contain" />
                ) : (
                    children
                )}
            </div>
        </div>
    </div>
  );
};

export default ImageDisplay;
