"use client";

import { useState } from "react";
import {
  Lock,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Search,
  Calendar,
  Building2,
  Filter,
} from "lucide-react";
import { auditLogs, organizations, AuditLog } from "@/lib/mock-data";

// ─────────────────────────────────────────────
// Action metadata helpers
// ─────────────────────────────────────────────

type ActionCategory = "create" | "update" | "delete" | "reset" | "approve" | "other";

interface ActionMeta {
  label: string;
  category: ActionCategory;
}

const ACTION_META: Record<string, ActionMeta> = {
  USER_CREATED:              { label: "User Created",              category: "create"  },
  USER_DEACTIVATED:          { label: "User Deactivated",          category: "delete"  },
  GROUP_CREATED:             { label: "Group Created",             category: "create"  },
  GROUP_PERMISSION_UPDATED:  { label: "Permissions Updated",       category: "update"  },
  PERMISSION_UPDATED:        { label: "Permission Updated",        category: "update"  },
  RESET_REQUESTED:           { label: "Reset Requested",           category: "reset"   },
  RESET_COMPLETED:           { label: "Reset Completed",           category: "reset"   },
  COMPLIANCE_STATUS_UPDATED: { label: "Compliance Updated",        category: "update"  },
  WIRE_DETAILS_APPROVED:     { label: "Wire Approved",             category: "approve" },
};

function getActionMeta(action: string): ActionMeta {
  return ACTION_META[action] ?? { label: action.replace(/_/g, " "), category: "other" };
}

const CATEGORY_STYLES: Record<ActionCategory, { badge: string; dot: string; timeline: string }> = {
  create:  { badge: "bg-emerald-100 text-emerald-800 border border-emerald-200", dot: "bg-emerald-500", timeline: "border-emerald-200" },
  update:  { badge: "bg-blue-100 text-blue-800 border border-blue-200",          dot: "bg-blue-500",    timeline: "border-blue-200"    },
  delete:  { badge: "bg-red-100 text-red-800 border border-red-200",             dot: "bg-red-500",     timeline: "border-red-200"     },
  reset:   { badge: "bg-amber-100 text-amber-800 border border-amber-200",       dot: "bg-amber-500",   timeline: "border-amber-200"   },
  approve: { badge: "bg-purple-100 text-purple-800 border border-purple-200",    dot: "bg-purple-500",  timeline: "border-purple-200"  },
  other:   { badge: "bg-gray-100 text-gray-700 border border-gray-200",          dot: "bg-gray-400",    timeline: "border-gray-200"    },
};

// ─────────────────────────────────────────────
// Formatting helpers
// ─────────────────────────────────────────────

function formatTimestamp(iso: string): { date: string; time: string; relative: string } {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const now = new Date("2024-03-20T12:00:00Z"); // fixed "now" for mock
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  const relative =
    diffDays === 0 ? "Today" :
    diffDays === 1 ? "Yesterday" :
    `${diffDays}d ago`;

  return { date, time, relative };
}

function formatTargetType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─────────────────────────────────────────────
// Action type filter options
// ─────────────────────────────────────────────

const ACTION_FILTER_OPTIONS = [
  { value: "all",                       label: "All Actions"           },
  { value: "USER_CREATED",              label: "User Created"          },
  { value: "USER_DEACTIVATED",          label: "User Deactivated"      },
  { value: "GROUP_CREATED",             label: "Group Created"         },
  { value: "GROUP_PERMISSION_UPDATED",  label: "Permissions Updated"   },
  { value: "RESET_REQUESTED",           label: "Reset Requested"       },
  { value: "COMPLIANCE_STATUS_UPDATED", label: "Compliance Updated"    },
  { value: "WIRE_DETAILS_APPROVED",     label: "Wire Approved"         },
];

// ─────────────────────────────────────────────
// ExpandableDetails sub-component
// ─────────────────────────────────────────────

function ExpandableDetails({ details }: { details: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors group"
      >
        <span className="group-hover:underline">Details</span>
        {open ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>
      {open && (
        <p className="mt-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 leading-relaxed max-w-xs">
          {details}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

const PAGE_SIZE = 8;

export default function AuditLogsPage() {
  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");
  const [orgFilter, setOrgFilter]     = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [actorSearch, setActorSearch]   = useState("");
  const [page, setPage] = useState(1);

  // Sort newest first
  const sorted = [...auditLogs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Apply filters
  const filtered = sorted.filter((log) => {
    if (orgFilter !== "all" && log.organization_id !== orgFilter) return false;
    if (actionFilter !== "all" && log.action !== actionFilter) return false;
    if (actorSearch && !log.actor_name.toLowerCase().includes(actorSearch.toLowerCase())) return false;
    if (dateFrom) {
      const from = new Date(dateFrom);
      if (new Date(log.created_at) < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(log.created_at) > to) return false;
    }
    return true;
  });

  const totalEntries = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, totalEntries);
  const paginated = filtered.slice(pageStart, pageEnd);

  const orgName = (id: string) =>
    organizations.find((o) => o.id === id)?.name ?? id;

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setOrgFilter("all");
    setActionFilter("all");
    setActorSearch("");
    setPage(1);
  };

  const hasActiveFilters =
    dateFrom || dateTo || orgFilter !== "all" || actionFilter !== "all" || actorSearch;

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Logs</h1>
          <p className="mt-1 text-sm text-slate-500">
            Immutable record of all RBAC actions across your organizations.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* ── Immutability Banner ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="flex items-center justify-center w-8 h-8 bg-slate-200 rounded-full flex-shrink-0">
          <Lock className="w-4 h-4 text-slate-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">
            Audit logs are immutable and cannot be modified or deleted.
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            All entries are append-only and cryptographically sealed to ensure tamper-evidence.
          </p>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">Filters</span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

          {/* Date From */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              <Calendar className="inline w-3 h-3 mr-1" />
              From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-slate-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              <Calendar className="inline w-3 h-3 mr-1" />
              To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-slate-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Organization */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              <Building2 className="inline w-3 h-3 mr-1" />
              Organization
            </label>
            <select
              value={orgFilter}
              onChange={(e) => { setOrgFilter(e.target.value); setPage(1); }}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-slate-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Organizations</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          {/* Action Type */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              <FileText className="inline w-3 h-3 mr-1" />
              Action Type
            </label>
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-slate-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {ACTION_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Actor Search */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              <Search className="inline w-3 h-3 mr-1" />
              Actor
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name…"
                value={actorSearch}
                onChange={(e) => { setActorSearch(e.target.value); setPage(1); }}
                className="w-full text-sm border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-slate-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
              />
            </div>
          </div>

        </div>
      </div>

      {/* ── Log Table ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

        {/* Table Header */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-[160px_1fr_1fr_1fr_140px_120px] gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Timestamp</span>
            <span>Action</span>
            <span>Actor</span>
            <span>Target</span>
            <span>Details</span>
            <span>Organization</span>
          </div>
        </div>

        {/* Rows */}
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FileText className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No log entries match your filters.</p>
            <button
              onClick={clearFilters}
              className="mt-2 text-xs text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {paginated.map((log: AuditLog, idx) => {
              const meta = getActionMeta(log.action);
              const styles = CATEGORY_STYLES[meta.category];
              const ts = formatTimestamp(log.created_at);
              const isLast = idx === paginated.length - 1;

              return (
                <li
                  key={log.id}
                  className="px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="grid grid-cols-[160px_1fr_1fr_1fr_140px_120px] gap-4 items-start">

                    {/* Timestamp */}
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Timeline dot + line */}
                      <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-white ${styles.dot}`} />
                        {!isLast && (
                          <div className="w-px flex-1 bg-gray-200 mt-1" style={{ minHeight: "2.5rem" }} />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">{ts.date}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{ts.time}</p>
                        <p className="text-xs text-slate-400 mt-0.5 italic">{ts.relative}</p>
                      </div>
                    </div>

                    {/* Action Badge */}
                    <div className="pt-0.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${styles.badge}`}>
                        {meta.label}
                      </span>
                      <p className="mt-1 text-xs text-slate-400 font-mono">
                        {log.action}
                      </p>
                    </div>

                    {/* Actor */}
                    <div className="pt-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-slate-600">
                            {log.actor_name.charAt(0)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-800 truncate">{log.actor_name}</p>
                      </div>
                      <p className="mt-1 text-xs text-slate-400 pl-8 font-mono truncate">{log.actor_id}</p>
                    </div>

                    {/* Target */}
                    <div className="pt-0.5 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{log.target_name}</p>
                      <span className="inline-flex items-center mt-1 text-xs text-slate-500 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-medium">
                        {formatTargetType(log.target_type)}
                      </span>
                    </div>

                    {/* Details (expandable) */}
                    <div className="pt-0.5">
                      <ExpandableDetails details={log.details} />
                    </div>

                    {/* Organization */}
                    <div className="pt-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <p className="text-sm text-slate-700 truncate">{orgName(log.organization_id)}</p>
                      </div>
                      <p className="mt-1 text-xs text-slate-400 font-mono truncate">{log.organization_id}</p>
                    </div>

                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* ── Pagination ── */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            {totalEntries === 0 ? (
              "No entries"
            ) : (
              <>
                Showing{" "}
                <span className="font-semibold text-slate-800">{pageStart + 1}–{pageEnd}</span>
                {" "}of{" "}
                <span className="font-semibold text-slate-800">{totalEntries}</span>
                {" "}entries
              </>
            )}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {/* Page indicator */}
            <span className="px-3 py-1.5 text-sm font-semibold text-slate-700 bg-white border border-gray-200 rounded-lg min-w-[2.5rem] text-center">
              {safePage}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
