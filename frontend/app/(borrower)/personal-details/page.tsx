"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { ApiResponse } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function PersonalDetailsPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    pan: "",
    dob: "",
    monthlySalary: "",
    employmentMode: "salaried",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await apiClient<ApiResponse>("/user/personal-details", {
        method: "POST",
        body: {
          ...form,
          monthlySalary: Number(form.monthlySalary),
        },
      });

      if (!res.success) {
        setError(res.message);
        return;
      }

      router.push("/upload-salary-slip");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Personal Details</h2>
        <p className="text-sm text-gray-500 mt-1">
          We&apos;ll run an eligibility check based on your details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="PAN Number"
          name="pan"
          type="text"
          placeholder="ABCDE1234F"
          value={form.pan}
          onChange={handleChange}
          maxLength={10}
          required
        />

        <Input
          label="Date of Birth"
          name="dob"
          type="date"
          value={form.dob}
          onChange={handleChange}
          required
        />

        <Input
          label="Monthly Salary (₹)"
          name="monthlySalary"
          type="number"
          placeholder="50000"
          value={form.monthlySalary}
          onChange={handleChange}
          min={0}
          required
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Employment Mode
          </label>
          <select
            name="employmentMode"
            value={form.employmentMode}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="salaried">Salaried</option>
            <option value="self-employed">Self Employed</option>
            <option value="unemployed">Unemployed</option>
          </select>
        </div>

        {/* BRE Rules info */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-blue-700 mb-2">
            Eligibility Criteria
          </p>
          <ul className="text-xs text-blue-600 flex flex-col gap-1">
            <li>• Age must be between 23 and 50 years</li>
            <li>• Monthly salary must be at least ₹25,000</li>
            <li>• Valid PAN format (e.g. ABCDE1234F)</li>
            <li>• Must be employed (salaried or self-employed)</li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-sm text-red-600">❌ {error}</p>
          </div>
        )}

        <Button type="submit" isLoading={isLoading} className="w-full">
          Check Eligibility & Continue
        </Button>
      </form>
    </div>
  );
}
