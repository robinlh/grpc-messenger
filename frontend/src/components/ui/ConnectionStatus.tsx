import React from 'react';

interface ConnectionStatusProps {
  isConnected: boolean;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  isConnected, 
  className = '' 
}) => {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div 
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-gray-400'
        }`}
      />
      <span className="text-xs text-gray-500">
        {isConnected ? 'Live' : 'Offline'}
      </span>
    </div>
  );
};