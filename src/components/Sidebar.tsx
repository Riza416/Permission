"use client";

import React, { createContext, useContext, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Map,
  LayoutDashboard,
  Building2,
  Users,
  Layers,
  Key,
  FolderKey,
  RotateCcw,
  FileText,
  Lock,
  ChevronDown,
  Wallet,
} from "lucide-react";

// --- Role Context ---

export type Role = "Super Admin" | "Admin" | "User";

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
}

export const RoleContext = createContext<RoleContextValue>({
  role: "Super Admin",
  setRole: () => {},
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("Super Admin");
  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}

// --- Nav config ---

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
  restricted: (role: Role) => boolean;
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    restricted: () => false,
    items: [
      { label: "Roadmap", href: "/admin/roadmap", icon: Map },
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Management",
    restricted: (role) => role === "User",
    items: [
      { label: "Organizations", href: "/admin/organizations", icon: Building2 },
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Spaces / Entities", href: "/admin/spaces", icon: Layers },
    ],
  },
  {
    title: "Permissions",
    restricted: (role) => role === "User",
    items: [
      { label: "Permission Registry", href: "/admin/permissions", icon: Key },
      { label: "Permission Groups", href: "/admin/groups", icon: FolderKey },
    ],
  },
  {
    title: "Operations",
    restricted: () => false,
    items: [
      { label: "Custody Wallets", href: "/admin/custody-wallets", icon: Wallet },
      { label: "Reset Requests", href: "/admin/resets", icon: RotateCcw },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
    ],
  },
];

// For Admin role: Organizations is locked
function isItemLockedForAdmin(href: string): boolean {
  return href === "/admin/organizations";
}

// --- Sidebar Component ---

export default function Sidebar() {
  const { role, setRole } = useRole();
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-slate-900 text-white flex flex-col z-50">
      {/* Role Switcher */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-700">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Viewing as
        </label>
        <div className="relative">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full appearance-none bg-slate-800 text-white text-sm rounded-md px-3 py-2 pr-8 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 cursor-pointer"
          >
            <option value="Super Admin">Super Admin</option>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* App Title */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-slate-700">
        <Shield className="w-6 h-6 text-blue-400 flex-shrink-0" />
        <span className="text-lg font-bold tracking-tight">RBAC Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-6 px-3">
        {navSections.map((section) => {
          const sectionRestricted = section.restricted(role);

          return (
            <div key={section.title}>
              {/* Section Header */}
              <div
                className={`flex items-center justify-between px-2 mb-1 ${
                  sectionRestricted ? "opacity-50" : ""
                }`}
              >
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {section.title}
                </span>
                {sectionRestricted && (
                  <span className="flex items-center gap-1 text-xs bg-red-900/60 text-red-300 px-1.5 py-0.5 rounded-full">
                    <Lock className="w-3 h-3" />
                    Restricted
                  </span>
                )}
              </div>

              {/* Section Items */}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isAdminLocked =
                    role === "Admin" && isItemLockedForAdmin(item.href);
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  const dimmed = sectionRestricted || isAdminLocked;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : dimmed
                            ? "text-slate-500 hover:bg-slate-800 hover:text-slate-400"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        } ${dimmed ? "opacity-60" : ""}`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {isAdminLocked && (
                          <Lock className="w-3 h-3 text-amber-400" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          Role:{" "}
          <span className="text-slate-300 font-medium">{role}</span>
        </p>
      </div>
    </aside>
  );
}
