"use client";

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

type TripsPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function TripsPagination({ page, totalPages, onPageChange }: TripsPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="d-flex align-items-center justify-content-center gap-3 mt-4">
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <IconChevronLeft size={16} />
        <span>Previous</span>
      </button>
      <span className="text-secondary small">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <span>Next</span>
        <IconChevronRight size={16} />
      </button>
    </div>
  );
}
