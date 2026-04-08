"use client";

import {
  Building2,
  Users,
  Layers,
  Key,
  FolderKey,
  Shield,
  FileText,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  organizations,
  users,
  entities,
  permissions,
  permissionGroups,
  auditLogs,
  resetRequests,
} from "@/lib/mock-data";
import { useRole } from "@/components/Sidebar";

const stats = [
  {
    label: "Organizations",
    value: organizations.length,
    icon: Building2,
    color: "blue",
    href: "/admin/organizations",
  },
  {
    label: "Users",
    value: users.length,
    icon: Users,
    color: "emerald",
    href: "/admin/users",
  },
  {
    label: "Spaces / Entities",
    value: entities.length,
    icon: Layers,
    color: "violet",
    href: "/admin/spaces",
  },
  {
    label: "Permissions",
    value: permissions.length,
    icon: Key,
    color: "amber",
    href: "/admin/permissions",
  },
  {
    label: "Permission Groups",
    value: permissionGroups.length,
    icon: FolderKey,
    color: "cyan",
    href: "/admin/groups",
  },
  {
    label: "Super Admin Groups",
    value: permissionGroups.filter((g) => g.is_super_admin).length,
    icon: Shield,
    color: "rose",
    href: "/admin/groups",
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  cyan: { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-200" },
  rose: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" },
};

export default function DashboardPage() {
  const { role } = useRole();

  const recentAudit = [...auditLogs]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const pendingResets = resetRequests.filter((r) => r.status === "pending");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">
          RBAC overview for your organization &mdash; viewing as{" "}
          <span className="font-semibold text-gray-700">{role}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const c = colorMap[stat.color];
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className={`group flex items-center gap-4 rounded-xl border ${c.border} ${c.bg} p-5 transition-shadow hover:shadow-md`}
            >
              <div className={`rounded-lg ${c.bg} p-3`}>
                <Icon className={`w-6 h-6 ${c.text}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </Link>
          );
        })}
      </div>

      {/* Two-column: Recent Audit + Pending Resets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Audit Logs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Recent Audit Logs</h2>
            </div>
            <Link
              href="/admin/audit-logs"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all
            </Link>
          </div>
          <ul className="divide-y divide-gray-50">
            {recentAudit.map((log) => (
              <li key={log.id} className="px-5 py-3 flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 font-medium truncate">
                    {log.action.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {log.actor_name} &rarr; {log.target_name}
                  </p>
                </div>
                <time className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(log.created_at).toLocaleDateString()}
                </time>
              </li>
            ))}
          </ul>
        </div>

        {/* Pending Resets */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Pending Resets</h2>
              {pendingResets.length > 0 && (
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingResets.length}
                </span>
              )}
            </div>
            <Link
              href="/admin/resets"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all
            </Link>
          </div>
          {pendingResets.length === 0 ? (
            <p className="px-5 py-8 text-center text-gray-400 text-sm">
              No pending reset requests
            </p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {pendingResets.map((req) => (
                <li key={req.id} className="px-5 py-3 flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      req.reset_type === "password" ? "bg-blue-400" : "bg-amber-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium">
                      {req.target_user_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {req.reset_type === "password" ? "Password" : "2FA"} reset
                      requested by {req.requester_name}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      req.reset_type === "password"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {req.reset_type}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick Access */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Create User", href: "/admin/users", icon: Users },
            { label: "Create Group", href: "/admin/groups", icon: FolderKey },
            { label: "View Permissions", href: "/admin/permissions", icon: Key },
            { label: "Submit Reset", href: "/admin/resets", icon: RotateCcw },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:shadow-sm transition-all"
              >
                <Icon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
