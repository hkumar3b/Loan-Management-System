"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { ApiResponse, Loan } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function DisbursementPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchLoans = async () => {
    try {
      const res = await apiClient<ApiResponse<Loan[]>>(
        "/loan/dashboard/sanctioned",
      );
      if (res.success && res.data) setLoans(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleDisburse = async (loanId: string) => {
    setActionLoading(loanId);
    try {
      const res = await apiClient<ApiResponse>(
        `/loan/dashboard/${loanId}/disburse`,
        { method: "PATCH" },
      );
      if (res.success) await fetchLoans();
    } finally {
      setActionLoading(null);
    }
  };

  const getBorrowerName = (loan: Loan) => {
    if (typeof loan.borrowerId === "object") return loan.borrowerId.name;
    return "—";
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Disbursement</h1>
        <p className="text-gray-500 text-sm mt-1">
          Mark sanctioned loans as disbursed.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">
            No sanctioned loans pending disbursement.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {loans.map((loan) => (
            <div
              key={loan._id}
              className="bg-white rounded-2xl border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-900">
                    {getBorrowerName(loan)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Sanctioned{" "}
                    {loan.sanctionedAt
                      ? new Date(loan.sanctionedAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <Badge status={loan.status} />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Loan Amount</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    ₹{loan.amount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Tenure</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    {loan.tenure} days
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Total Repayment</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    ₹{loan.totalRepayment.toFixed(2)}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => handleDisburse(loan._id)}
                isLoading={actionLoading === loan._id}
                className="w-full"
              >
                Mark as Disbursed
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
