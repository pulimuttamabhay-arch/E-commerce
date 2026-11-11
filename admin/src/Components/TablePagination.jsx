export default function TablePagination({
  totalItems,
  page,
  pageCount,
  pageSize,
  onPageChange,
  onPageSizeChange
}) {
  const firstItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const lastItem = Math.min(page * pageSize, totalItems)
  const startPage = Math.max(1, Math.min(page - 2, pageCount - 4))
  const endPage = Math.min(pageCount, startPage + 4)
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index)

  return (
    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 p-3 border-top table-pagination">
      <div className="d-flex align-items-center gap-3 text-secondary small">
        <span aria-live="polite">
          Showing {firstItem}-{lastItem} of {totalItems}
        </span>
        <label className="d-flex align-items-center gap-2">
          Rows
          <select
            className="form-select form-select-sm"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            aria-label="Rows per page"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </label>
      </div>

      <nav aria-label="Table pagination">
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              aria-label="Previous page"
            >
              Previous
            </button>
          </li>
          {startPage > 1 && (
            <>
              <li className="page-item">
                <button type="button" className="page-link" onClick={() => onPageChange(1)}>1</button>
              </li>
              {startPage > 2 && <li className="page-item disabled"><span className="page-link">…</span></li>}
            </>
          )}
          {pages.map((pageNumber) => (
            <li key={pageNumber} className={`page-item${pageNumber === page ? ' active' : ''}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => onPageChange(pageNumber)}
                aria-current={pageNumber === page ? 'page' : undefined}
                aria-label={`Page ${pageNumber}`}
              >
                {pageNumber}
              </button>
            </li>
          ))}
          {endPage < pageCount && (
            <>
              {endPage < pageCount - 1 && <li className="page-item disabled"><span className="page-link">…</span></li>}
              <li className="page-item">
                <button type="button" className="page-link" onClick={() => onPageChange(pageCount)}>{pageCount}</button>
              </li>
            </>
          )}
          <li className={`page-item${page === pageCount ? ' disabled' : ''}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => onPageChange(page + 1)}
              disabled={page === pageCount}
              aria-label="Next page"
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}
