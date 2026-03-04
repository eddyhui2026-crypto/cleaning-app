import { utils as XLSXUtils, writeFile as XLSXWriteFile } from "xlsx"
import jsPDF from "jspdf"
import "jspdf-autotable"

export const exportExcel = (data: any[], fileName = "data.xlsx") => {
  const ws = XLSXUtils.json_to_sheet(data)
  const wb = XLSXUtils.book_new()
  XLSXUtils.book_append_sheet(wb, ws, "Sheet1")
  XLSXWriteFile(wb, fileName)
}

export const exportPDF = (columns: string[], data: any[], fileName = "data.pdf") => {
  const doc = new jsPDF()
  // @ts-ignore
  doc.autoTable({ head: [columns], body: data })
  doc.save(fileName)
}