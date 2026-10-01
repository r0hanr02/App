import React from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  SortingState,
  ColumnDef
} from "@tanstack/react-table";
import "./style.scss"



export type { ColumnDef };

export interface TableProps<T> {
  columns: ColumnDef<T, any>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  className?: string;
  stickyHeader?: boolean;
  striped?: boolean;
  disableHover?: boolean;
  dense?: boolean;
  enableSorting?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
}


export function Table<T>({
  columns,
  data,
  onRowClick,
  emptyState = "No records found.",
  className = "",
  stickyHeader = false,
  striped = false,
  disableHover = false,
  dense = false,
  enableSorting = false,
  enablePagination = false,
  pageSize = 10,
}: TableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    ...(enableSorting ? { getSortedRowModel: getSortedRowModel() } : {}),
    ...(enablePagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    ...(enablePagination ? { initialState: { pagination: { pageSize } } } : {}),
  });

  const wrapperClasses = [
    "data-table-wrapper",
    stickyHeader ? "data-table-wrapper--sticky-header" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const tableClasses = [
    "data-table",
    striped ? "data-table--striped" : "",
    disableHover ? "data-table--no-hover" : "",
    dense ? "data-table--dense" : "",
    onRowClick ? "data-table--clickable-rows" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const rows = table.getRowModel().rows;

  return (
    <div className={wrapperClasses}>
      <table className={tableClasses}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = enableSorting && header.column.getCanSort();
                const sortDir = header.column.getIsSorted();

                return (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    className={canSort ? "is-sortable" : ""}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                  >
                    {header.isPlaceholder ? null : (
                      <span className="th-content">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span className="sort-icon" aria-hidden="true">
                            {sortDir === "asc" ? "▲" : sortDir === "desc" ? "▼" : "↕"}
                          </span>
                        )}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr className="data-table__empty-row">
              <td colSpan={columns.length}>{emptyState}</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {enablePagination && rows.length > 0 && (
        <div className="data-table-pagination">
          <button
            type="button"
            className="dt-icon-btn"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            ‹
          </button>
          <span className="para-xs">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <button
            type="button"
            className="dt-icon-btn"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

export default Table;