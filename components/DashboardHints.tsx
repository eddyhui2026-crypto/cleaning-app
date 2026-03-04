// components/DashboardHints.tsx
import React from "react";

export default function DashboardHints() {
  return (
    <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4 rounded shadow">
      <h2 className="font-bold text-lg mb-2">Dashboard 提示 / Tips</h2>
      <ul className="list-disc ml-6 space-y-1 text-sm">
        <li><strong>Client:</strong> 客戶名稱，例如 John Doe, Jane Smith</li>
        <li><strong>Postcode:</strong> 英國郵區，例如 SW1A 1AA, EC1A 1BB</li>
        <li><strong>Days:</strong> 星期幾，多選，例如 Mon, Wed, Fri</li>
        <li><strong>Hours:</strong> 每次工作小時數，例如 2 → 每次做 2 小時</li>
        <li><strong>Cleaners:</strong> 員工人數，例如 1 → 一個員工，2 → 兩個員工</li>
        <li><strong>Rate (£/hr):</strong> 每小時收費，例如 18 → £18/hr</li>
        <li><strong>Total (£):</strong> 系統自動計算：<code>Total = Hours * Cleaners * Rate</code></li>
      </ul>
      <p className="mt-2 text-sm text-gray-600">
        星期幾下面嘅數字會自動計算，唔需要手動填。
      </p>
    </div>
  );
}