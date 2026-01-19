
import React from 'react';

export const ProductSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-3 border border-gray-100 flex-shrink-0 w-48 animate-pulse-soft">
      <div className="bg-gray-200 h-32 rounded-lg mb-3"></div>
      <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
      <div className="bg-gray-200 h-3 rounded w-1/2 mb-3"></div>
      <div className="bg-gray-200 h-8 rounded"></div>
    </div>
  );
};

export const CategorySkeleton: React.FC = () => {
  return (
    <div className="mb-8 px-4">
      <div className="bg-gray-200 h-6 w-40 rounded mb-4 animate-pulse-soft"></div>
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4].map(i => <ProductSkeleton key={i} />)}
      </div>
    </div>
  );
};
