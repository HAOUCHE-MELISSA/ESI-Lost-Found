import React, { useState } from 'react';
import {
  Backpack,
  Calculator,
  Headphones,
  Key,
  BookOpen,
  Shirt,
  Plug,
  Package,
  Droplets,
  Wallet,
  FileText,
} from 'lucide-react';

interface SafeItemImageProps {
  src?: string;
  alt: string;
  category?: string;
  className?: string;
}

export const SafeItemImage: React.FC<SafeItemImageProps> = ({
  src,
  alt,
  category = 'Other',
  className = 'w-full h-48 object-cover',
}) => {
  const [hasError, setHasError] = useState(false);

  const renderCategoryIcon = () => {
    const cat = category.toLowerCase();
    const title = alt.toLowerCase();
    if (title.includes('calculator')) return <Calculator className="w-10 h-10 text-slate-500" />;
    if (title.includes('airpods') || title.includes('headphone'))
      return <Headphones className="w-10 h-10 text-slate-500" />;
    if (title.includes('charger') || title.includes('usb'))
      return <Plug className="w-10 h-10 text-slate-500" />;
    if (title.includes('bottle')) return <Droplets className="w-10 h-10 text-slate-500" />;
    if (cat.includes('bag') || title.includes('backpack'))
      return <Backpack className="w-10 h-10 text-slate-500" />;
    if (cat.includes('key')) return <Key className="w-10 h-10 text-slate-500" />;
    if (cat.includes('book') || title.includes('notebook'))
      return <BookOpen className="w-10 h-10 text-slate-500" />;
    if (cat.includes('cloth') || title.includes('hoodie') || title.includes('jacket'))
      return <Shirt className="w-10 h-10 text-slate-500" />;
    if (cat.includes('wallet')) return <Wallet className="w-10 h-10 text-slate-500" />;
    if (cat.includes('document')) return <FileText className="w-10 h-10 text-slate-500" />;
    return <Package className="w-10 h-10 text-slate-500" />;
  };

  if (!src || hasError) {
    return (
      <div
        className={`${className} bg-slate-100 border-b border-slate-200/80 flex flex-col items-center justify-center p-6 text-center select-none`}
      >
        <div className="w-16 h-16 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center mb-2.5 shadow-2xs">
          {renderCategoryIcon()}
        </div>
        <span className="text-xs font-medium text-slate-600 line-clamp-1 max-w-[200px]">
          {alt}
        </span>
        <span className="text-[11px] text-slate-400 mt-0.5">{category}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
