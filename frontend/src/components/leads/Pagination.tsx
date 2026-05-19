import React from 'react';
import { Button } from '../ui/Button';
import { PaginationMeta } from '../../types';

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ pagination, onPageChange }: PaginationProps) => {
  const { page, totalPages, total, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing <span className="font-medium">{from}–{to}</span> of <span className="font-medium">{total}</span> leads
      </p>
      <div className="flex items-center gap-1">
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page - 1)} disabled={!pagination.hasPrevPage}>
          ← Prev
        </Button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let p: number;
          if (totalPages <= 5) p = i + 1;
          else if (page <= 3) p = i + 1;
          else if (page >= totalPages - 2) p = totalPages - 4 + i;
          else p = page - 2 + i;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {p}
            </button>
          );
        })}
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page + 1)} disabled={!pagination.hasNextPage}>
          Next →
        </Button>
      </div>
    </div>
  );
};
