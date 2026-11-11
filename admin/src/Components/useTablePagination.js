import { useState } from 'react'

export default function useTablePagination(items, initialPageSize = 10) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const changePageSize = (size) => {
    setPageSize(size)
    setPage(1)
  }

  return {
    pageItems,
    page: currentPage,
    pageCount,
    pageSize,
    setPage,
    setPageSize: changePageSize
  }
}
