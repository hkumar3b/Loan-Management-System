"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function BorrowerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // wait until auth is resolved

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "borrower") {
      router.push(`/${user.role}`);
    }
  }, [user, isLoading, router]);

  // Show spinner while auth is loading OR user not yet confirmed
  if (isLoading || !user || user.role !== "borrower") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">L</span>
          </div>
          <span className="font-semibold text-gray-900">LMS Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Welcome,{" "}
            <span className="font-medium text-gray-900">{user.name}</span>
          </span>
          <button
            onClick={() => {
              localStorage.clear();
              router.push("/login");
            }}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Steps indicator */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          {[
            { label: "Personal Details", path: "/personal-details" },
            { label: "Upload Salary Slip", path: "/upload-salary-slip" },
            { label: "Loan Apply", path: "/loan-apply" },
          ].map((step, index) => (
            <div key={step.path} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </div>
                <span className="text-xs text-gray-600 hidden sm:block">
                  {step.label}
                </span>
              </div>
              {index < 2 && <div className="w-8 h-px bg-gray-300" />}
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-3xl mx-auto p-6">{children}</main>
    </div>
  );
}
