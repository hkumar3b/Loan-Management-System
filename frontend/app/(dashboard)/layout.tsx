"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types";

const NAV_ITEMS: {
  label: string;
  path: string;
  roles: Role[];
  color: string;
}[] = [
  {
    label: "Sales",
    path: "/sales",
    roles: ["admin", "sales"],
    color: "text-orange-600",
  },
  {
    label: "Sanction",
    path: "/sanction",
    roles: ["admin", "sanction"],
    color: "text-blue-600",
  },
  {
    label: "Disbursement",
    path: "/disbursement",
    roles: ["admin", "disbursement"],
    color: "text-purple-600",
  },
  {
    label: "Collection",
    path: "/collection",
    roles: ["admin", "collection"],
    color: "text-green-600",
  },
];

const ROLE_ICONS: Record<string, string> = {
  admin: "👑",
  sales: "📋",
  sanction: "✅",
  disbursement: "💸",
  collection: "💰",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const DASHBOARD_ROLES: Role[] = [
    "admin",
    "sales",
    "sanction",
    "disbursement",
    "collection",
  ];

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (!DASHBOARD_ROLES.includes(user.role)) {
      router.push("/personal-details");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !DASHBOARD_ROLES.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">L</span>
            </div>
            <span className="font-bold text-gray-900">LMS Dashboard</span>
          </div>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-lg">
              {ROLE_ICONS[user.role] || "👤"}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {visibleNav.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 flex-1 p-8">{children}</main>
    </div>
  );
}
