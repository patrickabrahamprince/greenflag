export interface UserPaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function UserPagination({ page, total, pageSize, onPageChange }: UserPaginationProps) {
  if (total <= pageSize) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <button
        onClick={() => onPageChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="btn-secondary text-xs py-2 disabled:opacity-30"
      >
        Previous
      </button>
      <span className="text-xs text-gray-500">
        Page {page + 1} of {Math.ceil(total / pageSize)}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={(page + 1) * pageSize >= total}
        className="btn-secondary text-xs py-2 disabled:opacity-30"
      >
        Next
      </button>
    </div>
  );
}
