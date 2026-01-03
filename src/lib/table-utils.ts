import { ColumnDef } from "@tanstack/react-table"

// Helper function to create sortable columns
export function createSortableColumn<T>(
  accessorKey: keyof T,
  header: string,
  cell?: (value: any, row: T) => React.ReactNode
): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header,
    cell: cell
      ? ({ row }) => cell(row.original[accessorKey], row.original)
      : ({ getValue }) => getValue(),
    enableSorting: true,
  }
}

// Helper function for number formatting
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-"
  return new Intl.NumberFormat("vi-VN").format(value)
}

// Helper function for currency formatting
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-"
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value)
}

// Helper function for percentage formatting
export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-"
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
}

