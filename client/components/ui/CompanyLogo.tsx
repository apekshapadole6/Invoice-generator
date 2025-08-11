import React from 'react';

interface CompanyLogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function CompanyLogo({ size = 'medium', className = '' }: CompanyLogoProps) {
  const sizeClasses = {
    small: 'w-16 h-auto',
    medium: 'w-20 h-auto',
    large: 'w-24 h-auto'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2F55b229a52c0444268b0b5f1318fee335%2F348c765c32b5495094a7b58c5d2b32be?format=png&width=800&background=transparent"
        alt="Kizora Software Private Limited"
        className="w-full h-auto object-contain"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
      />
    </div>
  );
}

// Image-based logo for print/download versions
export function CompanyLogoSVG({ width = 80, height = 80, className = '' }: { width?: number; height?: number; className?: string }) {
  return (
    <img
      src="https://cdn.builder.io/api/v1/image/assets%2F55b229a52c0444268b0b5f1318fee335%2F348c765c32b5495094a7b58c5d2b32be?format=png&width=800&background=transparent"
      alt="Kizora Software Private Limited"
      width={width}
      height={height}
      className={className}
      style={{ objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }}
    />
  );
}

// HTML string version for downloads
export function getCompanyLogoHTML(width: number = 80, height: number = 80): string {
  return `
    <img
      src="https://cdn.builder.io/api/v1/image/assets%2F55b229a52c0444268b0b5f1318fee335%2F348c765c32b5495094a7b58c5d2b32be?format=png&width=800&background=transparent"
      alt="Kizora Software Private Limited"
      width="${width}"
      height="${height}"
      style="object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1)); max-width: 100%;"
    />
  `;
}
