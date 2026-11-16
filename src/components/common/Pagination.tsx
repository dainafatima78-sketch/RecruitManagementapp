import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-[#E3E8F0] text-xs text-[#697386]">
      <div>
        {totalItems !== undefined && itemsPerPage !== undefined ? (
          <span>
            Showing <strong className="font-semibold text-[#202638] font-mono tabular-nums">{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
            <strong className="font-semibold text-[#202638] font-mono tabular-nums">{Math.min(currentPage * itemsPerPage, totalItems)}</strong> of{' '}
            <strong className="font-semibold text-[#202638] font-mono tabular-nums">{totalItems}</strong> entries
          </span>
        ) : (
          <span>Page {currentPage} of {totalPages}</span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-md border border-[#E3E8F0] hover:bg-[#F8FAFD] disabled:opacity-40 disabled:cursor-not-allowed text-[#202638] transition-colors cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-2 font-mono tabular-nums font-medium text-[#202638]">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-md border border-[#E3E8F0] hover:bg-[#F8FAFD] disabled:opacity-40 disabled:cursor-not-allowed text-[#202638] transition-colors cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
