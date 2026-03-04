"use client"

import React from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from "@tanstack/react-table"
import { utils as XLSXUtils, writeFile as XLSXWriteFile } from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

type ExportableTableProps<T> = {
  columns: ColumnDef<T>[]
  data: T[]
  searchPlaceholder?: string
}

export function ExportableTable<T>({ columns, data, searchPlaceholder }: ExportableTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const columnKeys = columns.map(c => c.accessorKey || c.id)

  const exportExcel = () => {
    const excelData = table.getRowModel().rows.map(row =>
      columnKeys.reduce((acc, key) => ({ ...acc, [key]: row.getValue(key) }), {})
    )
    const ws = XLSXUtils.json_to_sheet(excelData)
    const wb = XLSXUtils.book_new()
    XLSXUtils.book_append_sheet(wb, ws, "Sheet1")
    XLSXWriteFile(wb, "data.xlsx")
  }

  const exportPDF = () => {
    const pdfData = table.getRowModel().rows.map(row =>
      columnKeys.map(key => row.getValue(key))
    )
    const doc = new jsPDF()
    autoTable(doc, {
      head: [columnKeys],
      body: pdfData,
    })
    doc.save("data.pdf")
  }

  return (
    <div className="space-y-4">
      {/* Search input */}
      <input
        type="text"
        placeholder={searchPlaceholder || "Search..."}
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="p-2 border rounded w-full"
      />

      {/* Export buttons */}
      <div className="flex space-x-2 mb-2">
        <button
          onClick={exportExcel}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Export Excel
        </button>
        <button
          onClick={exportPDF}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Export PDF
        </button>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="bg-gray-200">
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="border p-2 cursor-pointer"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{
                    asc: " 🔼",
                    desc: " 🔽",
                  }[header.column.getIsSorted() as string] ?? null}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="hover:bg-gray-100">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="border p-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex space-x-2 items-center">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="px-2 py-1 border rounded"
        >
          Prev
        </button>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-2 py-1 border rounded"
        >
          Next
        </button>
      </div>
    </div>
  )
}