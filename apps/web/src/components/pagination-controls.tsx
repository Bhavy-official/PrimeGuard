interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const PaginationControls = ({
  currentPage,
  onPageChange,
  totalPages,
}: PaginationControlsProps) => {
  return (
    <div className="panel mt-5 flex items-center justify-between p-4 text-sm text-slate-300">
      <p>
        Page <span className="font-bold text-white">{currentPage}</span> of{" "}
        <span className="font-bold text-white">{totalPages}</span>
      </p>
      <div className="flex gap-3">
        <button
          className="button-secondary"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          type="button"
        >
          Previous
        </button>
        <button
          className="button-secondary"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
};
