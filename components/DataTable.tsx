"use client"

import React from "react"

type DataTableProps = {
  columns: string[]
  data: any[]
}

export default function DataTable({ columns, data }: DataTableProps) {
  return (
    <table className="w-full border-collapse border">
      <thead>
        <tr className="bg-gray-200">
          {columns.map((col) => (
            <th key={col} className="border p-2">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="hover:bg-gray-100">
            {columns.map((col) => (
              <td key={col} className="border p-2">{row[col]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}