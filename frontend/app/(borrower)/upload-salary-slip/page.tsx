"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { ApiResponse } from "@/types";
import { Button } from "@/components/ui/Button";

export default function UploadSalarySlipPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setError("");

    if (!selected) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(selected.type)) {
      setError("Only PDF, JPG, and PNG files are allowed");
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError("File size must be under 5 MB");
      return;
    }

    setFile(selected);
    setPreview(selected.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("salarySlip", file);

      const res = await apiClient<ApiResponse<{ salarySlipUrl: string }>>(
        "/loan/upload-salary-slip",
        { method: "POST", body: formData, isFormData: true },
      );

      if (!res.success || !res.data) {
        setError(res.message);
        return;
      }

      // Store url in sessionStorage to use on next page
      sessionStorage.setItem("salarySlipUrl", res.data.salarySlipUrl);
      router.push("/loan-apply");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Upload Salary Slip</h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload your latest salary slip. Accepted: PDF, JPG, PNG (max 5 MB).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Drop zone */}
        <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          {preview ? (
            <div className="text-center">
              <p className="text-sm font-medium text-blue-700">{preview}</p>
              <p className="text-xs text-gray-400 mt-1">Click to change file</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PDF, JPG, PNG up to 5MB
              </p>
            </div>
          )}
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-sm text-red-600">❌ {error}</p>
          </div>
        )}

        <Button type="submit" isLoading={isLoading} className="w-full">
          Upload & Continue
        </Button>
      </form>
    </div>
  );
}
