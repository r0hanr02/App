import type { CSSProperties, ReactNode } from "react";

export interface TableCellArgs<T> {
  value: unknown;
  row: T;
  rowIndex: number;
}

export interface TableColumn<T> {
  /** Unique key for the column. Dot-paths (e.g. "user.name") are resolved. */
  accessor: string;
  label: ReactNode;
  render?: (args: TableCellArgs<T>) => ReactNode;
  colWidth?: string | number;
  colCenter?: boolean;
  style?: CSSProperties;
}

export interface TablePagination {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange?: (page: number) => void;
}

export interface TableRowSelection<T> {
  selectedRows: T[];
  onSelectionChange?: (rows: T[]) => void;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  rowKey?: keyof T;
  isLoading?: boolean;
  /** Empty-state content. Defaults to "No data found". */
  noDataMessage?: ReactNode;
  pagination?: TablePagination;
  showPagination?: boolean;
  rowSelection?: boolean;
  showRowSelection?: TableRowSelection<T>;
  onRowClick?: (row: T) => void;
  rowClassName?: (args: { row: T; rowIndex: number }) => string | undefined;
  rowStyle?: CSSProperties;
  tableStyle?: CSSProperties;
  bodyClassName?: string;
  renderExpandedRow?: (args: {
    row: T;
    rowIndex: number;
    colSpan: number;
  }) => ReactNode;
}
