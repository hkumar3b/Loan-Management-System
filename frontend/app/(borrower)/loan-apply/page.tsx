"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { ApiResponse, Loan } from "@/types";
import { Button } from "@/components/ui/Button";

const calculateSI = (principal: number, tenureDays: number): number => {
  return (principal * 12 * tenureDays) / (365 * 100);
};

export default function LoanApplyPage() {
  const router = useRouter();

  const [amount, setAmount] = useState(50000);
  const [tenure, setTenure] = useState(30);
  const [salarySlipUrl, setSalarySlipUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const si = calculateSI(amount, tenure);
  const totalRepayment = amount + si;

  useEffect(() => {
    const url = sessionStorage.getItem("salarySlipUrl");
    if (!url) {
      router.push("/upload-salary-slip");
      return;
    }
    setSalarySlipUrl(url);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await apiClient<ApiResponse<Loan>>("/loan/apply", {
        method: "POST",
        body: { amount, tenure, salarySlipUrl },
      });

      if (!res.success) {
        setError(res.message);
        return;
      }

      sessionStorage.removeItem("salarySlipUrl");
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Application Submitted!
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Your loan application is under review. You&apos;ll be notified once
          it&apos;s processed.
        </p>
        <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-500">Loan Amount</span>
            <span className="font-medium">₹{amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-500">Tenure</span>
            <span className="font-medium">{tenure} days</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-500">Interest (12% p.a.)</span>
            <span className="font-medium">₹{si.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-sm font-semibold">
            <span>Total Repayment</span>
            <span className="text-blue-700">₹{totalRepayment.toFixed(2)}</span>
          </div>
        </div>
        <Button
          onClick={() => router.push("/login")}
          variant="outline"
          className="w-full"
        >
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Configure Your Loan</h2>
        <p className="text-sm text-gray-500 mt-1">
          Adjust the sliders to configure your loan amount and tenure.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Amount Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">
              Loan Amount
            </label>
            <span className="text-blue-700 font-semibold text-sm">
              ₹{amount.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={50000}
            max={500000}
            step={10000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>₹50,000</span>
            <span>₹5,00,000</span>
          </div>
        </div>

        {/* Tenure Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">Tenure</label>
            <span className="text-blue-700 font-semibold text-sm">
              {tenure} days
            </span>
          </div>
          <input
            type="range"
            min={30}
            max={365}
            step={5}
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>30 days</span>
            <span>365 days</span>
          </div>
        </div>

        {/* Live Calculation Panel */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <p className="text-xs font-semibold text-blue-700 mb-3 uppercase tracking-wide">
            Loan Summary
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Principal</span>
              <span className="font-medium">₹{amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tenure</span>
              <span className="font-medium">{tenure} days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Interest Rate</span>
              <span className="font-medium">12% p.a.</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Simple Interest{" "}
                <span className="text-xs text-gray-400">(P×R×T / 365×100)</span>
              </span>
              <span className="font-medium">₹{si.toFixed(2)}</span>
            </div>
            <div className="border-t border-blue-200 pt-2 mt-1 flex justify-between">
              <span className="font-semibold text-gray-900">
                Total Repayment
              </span>
              <span className="font-bold text-blue-700 text-lg">
                ₹{totalRepayment.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-sm text-red-600">❌ {error}</p>
          </div>
        )}

        <Button type="submit" isLoading={isLoading} className="w-full">
          Submit Loan Application
        </Button>
      </form>
    </div>
  );
}
