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
    const value = e.target.name === "pan" ? e.target.value.toUpperCase() : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: value }));
    setError("");
  };

  const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

  const getAge = (dobString: string): number | null => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const age = getAge(form.dob);

  const checkAge = form.dob ? (age !== null && age >= 23 && age <= 50) : null;
  const checkSalary = form.monthlySalary ? (Number(form.monthlySalary) >= 25000) : null;
  const checkPan = form.pan ? PAN_REGEX.test(form.pan.toUpperCase()) : null;
  const checkEmployment = form.employmentMode ? (form.employmentMode !== "unemployed") : null;

  const hasError = checkAge === false || checkSalary === false || checkPan === false || checkEmployment === false;
  const allPassed = checkAge === true && checkSalary === true && checkPan === true && checkEmployment === true;

  const getRuleStyles = (isValid: boolean | null) => {
    if (isValid === true) {
      return {
        icon: "✓",
        colorClass: "text-green-700 font-medium",
        iconClass: "text-green-600 font-bold mr-1.5",
      };
    }
    if (isValid === false) {
      return {
        icon: "✗",
        colorClass: "text-red-600 font-medium",
        iconClass: "text-red-500 font-bold mr-1.5",
      };
    }
    return {
      icon: "•",
      colorClass: "text-gray-500",
      iconClass: "text-gray-400 mr-2 font-bold",
    };
  };

  const renderRule = (label: string, isValid: boolean | null) => {
    const styles = getRuleStyles(isValid);
    return (
      <li className={`flex items-center text-xs ${styles.colorClass}`}>
        <span className={styles.iconClass}>{styles.icon}</span>
        {label}
      </li>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Local BRE validation checks
    const currentAge = getAge(form.dob);
    if (currentAge === null || currentAge < 23 || currentAge > 50) {
      setError(currentAge === null ? "Please enter a valid Date of Birth." : "Age must be between 23 and 50 years.");
      setIsLoading(false);
      return;
    }
    if (!form.monthlySalary || Number(form.monthlySalary) < 25000) {
      setError("Monthly salary must be at least ₹25,000.");
      setIsLoading(false);
      return;
    }
    if (!PAN_REGEX.test(form.pan.toUpperCase())) {
      setError("Invalid PAN format. Expected format: ABCDE1234F");
      setIsLoading(false);
      return;
    }
    if (form.employmentMode === "unemployed") {
      setError("Unemployed applicants are not eligible for a loan.");
      setIsLoading(false);
      return;
    }

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
          className="uppercase"
          error={checkPan === false ? "Invalid PAN format. Expected: ABCDE1234F" : undefined}
          required
        />

        <Input
          label="Date of Birth"
          name="dob"
          type="date"
          value={form.dob}
          onChange={handleChange}
          error={checkAge === false ? "Age must be between 23 and 50 years." : undefined}
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
          error={checkSalary === false ? "Monthly salary must be at least ₹25,000." : undefined}
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
            className={`border rounded-lg px-3 py-2 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              checkEmployment === false ? "border-red-400" : "border-gray-400"
            }`}
            required
          >
            <option value="salaried">Salaried</option>
            <option value="self-employed">Self Employed</option>
            <option value="unemployed">Unemployed</option>
          </select>
          {checkEmployment === false && (
            <p className="text-xs text-red-500 mt-0.5">Unemployed applicants are not eligible for a loan.</p>
          )}
        </div>

        {/* Dynamic BRE Rules checklist */}
        <div className={`rounded-xl p-4 border transition-all duration-200 ${
          allPassed 
            ? "bg-green-50 border-green-100" 
            : hasError 
              ? "bg-red-50 border-red-100" 
              : "bg-blue-50 border-blue-100"
        }`}>
          <p className={`text-xs font-semibold mb-2 ${
            allPassed 
              ? "text-green-800" 
              : hasError 
                ? "text-red-800" 
                : "text-blue-700"
          }`}>
            Eligibility Criteria
          </p>
          <ul className="flex flex-col gap-1.5">
            {renderRule("Age must be between 23 and 50 years", checkAge)}
            {renderRule("Monthly salary must be at least ₹25,000", checkSalary)}
            {renderRule("Valid PAN format (e.g. ABCDE1234F)", checkPan)}
            {renderRule("Must be employed (salaried or self-employed)", checkEmployment)}
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
