"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { ApiResponse, Loan } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface LoanWithBalance extends Loan {
  totalPaid: number;
  outstanding: number;
}

export default function CollectionPage() {
  const [loans, setLoans] = useState<LoanWithBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    utrNumber: "",
    amount: "",
    paymentDate: "",
  });
  const [error, setError] = useState("");

  const fetchLoans = async () => {
    try {
      const res = await apiClient<ApiResponse<LoanWithBalance[]>>(
        "/loan/dashboard/disbursed",
      );
      if (res.success && res.data) setLoans(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModal) return;
    setActionLoading(true);
    setError("");

    try {
      const res = await apiClient<ApiResponse>(
        `/loan/dashboard/${paymentModal}/payment`,
        {
          method: "POST",
          body: {
            utrNumber: paymentForm.utrNumber,
            amount: Number(paymentForm.amount),
            paymentDate: paymentForm.paymentDate,
          },
        },
      );

      if (!res.success) {
        setError(res.message);
        return;
      }

      setPaymentModal(null);
      setPaymentForm({ utrNumber: "", amount: "", paymentDate: "" });
      await fetchLoans();
    } finally {
      setActionLoading(false);
    }
  };

  const getBorrowerName = (loan: Loan) => {
    if (typeof loan.borrowerId === "object") return loan.borrowerId.name;
    return "—";
  };

  const activeLoan = paymentModal
    ? loans.find((l) => l._id === paymentModal)
    : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Collection</h1>
        <p className="text-gray-500 text-sm mt-1">
          Record payments for disbursed loans.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">No disbursed loans found.</p>
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
                    Disbursed{" "}
                    {loan.disbursedAt
                      ? new Date(loan.disbursedAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <Badge status={loan.status} />
              </div>

              <div className="grid grid-cols-4 gap-3 mb-5">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Loan Amount</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    ₹{loan.amount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Total Repayment</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    ₹{loan.totalRepayment.toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Total Paid</p>
                  <p className="text-sm font-semibold text-green-700 mt-0.5">
                    ₹{loan.totalPaid.toFixed(2)}
                  </p>
                </div>
                <div className="bg-red-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Outstanding</p>
                  <p className="text-sm font-semibold text-red-700 mt-0.5">
                    ₹{loan.outstanding.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Repayment Progress</span>
                  <span>
                    {Math.min(
                      100,
                      Math.round((loan.totalPaid / loan.totalRepayment) * 100),
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (loan.totalPaid / loan.totalRepayment) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {loan.status === "DISBURSED" && (
                <Button
                  onClick={() => setPaymentModal(loan._id)}
                  className="w-full"
                >
                  Record Payment
                </Button>
              )}

              {loan.status === "CLOSED" && (
                <div className="text-center py-2 text-sm text-green-600 font-semibold">
                  ✅ Loan fully repaid and closed
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {paymentModal && activeLoan && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Record Payment
            </h3>
            <p className="text-sm text-gray-500 mb-1">
              Outstanding:{" "}
              <span className="font-semibold text-red-600">
                ₹{activeLoan.outstanding.toFixed(2)}
              </span>
            </p>

            <form
              onSubmit={handlePaymentSubmit}
              className="flex flex-col gap-4 mt-4"
            >
              <Input
                label="UTR Number"
                type="text"
                placeholder="UTR123456789"
                value={paymentForm.utrNumber}
                onChange={(e) =>
                  setPaymentForm((p) => ({
                    ...p,
                    utrNumber: e.target.value,
                  }))
                }
                required
              />
              <Input
                label="Amount (₹)"
                type="number"
                placeholder="5000"
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm((p) => ({ ...p, amount: e.target.value }))
                }
                min={1}
                max={activeLoan.outstanding}
                required
              />
              <Input
                label="Payment Date"
                type="date"
                value={paymentForm.paymentDate}
                onChange={(e) =>
                  setPaymentForm((p) => ({
                    ...p,
                    paymentDate: e.target.value,
                  }))
                }
                required
              />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-red-600">❌ {error}</p>
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <Button
                  type="submit"
                  isLoading={actionLoading}
                  className="flex-1"
                >
                  Record Payment
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setPaymentModal(null);
                    setError("");
                    setPaymentForm({
                      utrNumber: "",
                      amount: "",
                      paymentDate: "",
                    });
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
