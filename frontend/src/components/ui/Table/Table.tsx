import { Fragment } from "react";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import "./style.scss";
import { Button } from "../Button/Button";
import type { TableProps } from "./table.types";

export type { TableColumn, TablePagination, TableProps } from "./table.types";

/** Read a cell value; supports dot-path accessors like "user.name". */
function getValue<T>(row: T, accessor: string): unknown {
  if (!accessor.includes(".")) return (row as Record<string, unknown>)[accessor];
  return accessor
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc !== null && typeof acc === "object"
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      row,
    );
}

const Table = <T,>({
  data,
  columns,
  pagination,
  showPagination,
  rowSelection,
  showRowSelection,
  noDataMessage,
  isLoading,
  rowStyle,
  tableStyle,
  bodyClassName,
  rowClassName,
  renderExpandedRow,
  onRowClick,
  rowKey = "id" as keyof T,
}: TableProps<T>) => {
  const handleSelectAllRows = (selected: boolean) => {
    if (selected) {
      showRowSelection?.onSelectionChange?.([...data]);
    } else {
      showRowSelection?.onSelectionChange?.([]);
    }
  };

  const isRowInSelection = (row: T) =>
    showRowSelection?.selectedRows?.some((r) => r[rowKey] === row[rowKey]) ??
    false;

  const allRowsSelected =
    data.length > 0 && data.every((row) => isRowInSelection(row));
  const skeletonRowCount = pagination?.pageSize ?? 10;
  const totalColSpan = columns.length + (rowSelection ? 1 : 0);
  const currentPage = pagination?.currentPage ?? 1;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);

  return (
    <div className="table-root">
      <div className="table-scroll-area">
        <table className="table" style={tableStyle}>
          <thead className="table-thead">
            <tr className="table-thead-tr">
              {rowSelection && (
                <th className="table-thead-th checkbox-th">
                  <input
                    type="checkbox"
                    className="table-check"
                    aria-label="Select all rows"
                    checked={allRowsSelected}
                    onChange={(e) => handleSelectAllRows(e.target.checked)}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  className="table-thead-th"
                  key={column.accessor}
                  style={{
                    width: column.colWidth,
                    textAlign: column.colCenter ? "center" : "left",
                    ...column.style,
                  }}
                >
                  <span className="table-thead-th-span para-sm">
                    {column.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {isLoading && (
            <tbody className="table-tbody">
              {Array.from({ length: skeletonRowCount }).map((_, rowIndex) => (
                <tr key={rowIndex} className="table-tbody-tr">
                  {rowSelection && (
                    <td className="table-tbody-td checkbox-td">
                      <span className="table-skeleton table-skeleton--box" />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.accessor} className="table-tbody-td">
                      <span
                        className="table-skeleton table-skeleton--line"
                        style={
                          typeof column.colWidth === "number"
                            ? { maxWidth: column.colWidth }
                            : undefined
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}

          {!isLoading && data.length === 0 && (
            <tbody>
              <tr>
                <td colSpan={totalColSpan} className="table-no-data-cell">
                  <div className="table-no-data">
                    <SearchX size={28} strokeWidth={1.5} aria-hidden="true" />
                    <span className="table-no-data-text">
                      {noDataMessage ?? "No data found"}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          )}

          {!isLoading && data.length > 0 && (
            <tbody
              className={["table-tbody", bodyClassName]
                .filter(Boolean)
                .join(" ")}
            >
              {data.map((row, rowIndex) => (
                <Fragment key={String(row[rowKey] ?? rowIndex)}>
                  <tr
                    className={[
                      "table-tbody-tr",
                      onRowClick ? "table-tbody-tr--clickable" : "",
                      rowClassName?.({ row, rowIndex }),
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{ ...rowStyle }}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {rowSelection && (
                      <td
                        className="table-tbody-td checkbox-td"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="table-check"
                          aria-label={`Select row ${rowIndex + 1}`}
                          checked={isRowInSelection(row)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              showRowSelection?.onSelectionChange?.([
                                ...(showRowSelection?.selectedRows ?? []),
                                row,
                              ]);
                            } else {
                              showRowSelection?.onSelectionChange?.(
                                showRowSelection?.selectedRows?.filter(
                                  (r) => r[rowKey] !== row[rowKey],
                                ) ?? [],
                              );
                            }
                          }}
                        />
                      </td>
                    )}

                    {columns.map((column) => {
                      const value = getValue(row, column.accessor);
                      return (
                        <td
                          key={column.accessor}
                          data-label={
                            typeof column.label === "string"
                              ? column.label
                              : undefined
                          }
                          className="table-tbody-td para-sm"
                          style={{
                            ...column.style,
                            textAlign: column.colCenter ? "center" : "left",
                          }}
                        >
                          {column.render
                            ? column.render({ value, row, rowIndex })
                            : (value as string)}
                        </td>
                      );
                    })}
                  </tr>
                  {renderExpandedRow?.({
                    row,
                    rowIndex,
                    colSpan: totalColSpan,
                  })}
                </Fragment>
              ))}
            </tbody>
          )}
        </table>
      </div>
      {showPagination && !isLoading && (
        <div className="table-pagination">
          <Button
            variant="secondary"
            size="sm"
            aria-label="Previous page"
            isDisabled={currentPage <= 1}
            onPress={() => pagination?.onPageChange?.(currentPage - 1)}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="para-xs">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            aria-label="Next page"
            isDisabled={currentPage >= totalPages}
            onPress={() => pagination?.onPageChange?.(currentPage + 1)}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
};

export { Table };
export default Table;
