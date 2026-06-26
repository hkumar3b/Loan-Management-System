"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { ApiResponse, User } from "@/types";

export default function SalesPage() {
  const [leads, setLeads] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await apiClient<ApiResponse<User[]>>("/user/leads");
        if (res.success && res.data) setLeads(res.data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeads();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sales — Leads</h1>
        <p className="text-gray-500 text-sm mt-1">
          Borrowers who registered but haven&apos;t applied yet.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">No leads found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">All Leads</p>
            <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-1 rounded-full">
              {leads.length} total
            </span>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Eligible</th>
                <th className="px-6 py-3 text-left">Employment</th>
                <th className="px-6 py-3 text-left">Salary</th>
                <th className="px-6 py-3 text-left">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((lead) => (
                <tr
                  key={lead._id || lead.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {lead.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {lead.email}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        lead.isEligible
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {lead.isEligible ? "Eligible" : "Not checked"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                    {lead.employmentMode || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {lead.monthlySalary
                      ? `₹${lead.monthlySalary.toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(lead.createdAt!).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
