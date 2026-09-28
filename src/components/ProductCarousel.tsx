import { useRef } from 'react';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight } from './Icons';
import type { Product } from '../data/products';

export default function ProductCarousel({ products }: { products: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  if (products.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none"
      >
        {products.map(p => (
          <div
            key={p.id}
            className="flex-none snap-start w-[45%] sm:w-[31%] md:w-[23%] lg:w-[calc((100%-4*1rem)/5)]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {products.length > 3 && (
        <>
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Anterior"
            className="hidden sm:flex absolute -left-4 top-[38%] -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-gray-100 shadow-md items-center justify-center text-[#0B2D6B] hover:bg-gray-50 transition-colors z-10"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Siguiente"
            className="hidden sm:flex absolute -right-4 top-[38%] -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-gray-100 shadow-md items-center justify-center text-[#0B2D6B] hover:bg-gray-50 transition-colors z-10"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}
    </div>
  );
}
