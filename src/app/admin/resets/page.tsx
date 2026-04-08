"use client";

import { useState } from "react";
import { resetRequests, users, ResetRequest, ResetType } from "@/lib/mock-data";
import { useRole } from "@/components/Sidebar";
import {
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  ListFilter,
  ShieldAlert,
  Info,
  KeyRound,
  Smartphone,
  Plus,
  X,
} from "lucide-react";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─────────────────────────────────────────────
// Stats Cards
// ─────────────────────────────────────────────

function StatsCards({ requests }: { requests: ResetRequest[] }) {
  const total = requests.length;
  const pending = requests.filter((r) => r.status === "pending").length;
  const completed = requests.filter((r) => r.status === "completed").length;
  const rejected = requests.filter((r) => r.status === "rejected").length;

  const stats = [
    {
      label: "Total Requests",
      value: total,
      icon: ListFilter,
      bg: "bg-white border border-gray-200",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-600",
      valueColor: "text-gray-900",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      bg: "bg-amber-50 border border-amber-200",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      valueColor: "text-amber-700",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle2,
      bg: "bg-emerald-50 border border-emerald-200",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      valueColor: "text-emerald-700",
    },
    {
      label: "Rejected",
      value: rejected,
      icon: XCircle,
      bg: "bg-red-50 border border-red-200",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      valueColor: "text-red-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`rounded-xl px-5 py-4 shadow-sm flex items-center gap-4 ${stat.bg}`}
          >
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.iconBg}`}>
              <Icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <div>
              <div className={`text-3xl font-bold leading-none ${stat.valueColor}`}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Reset Type Badge
// ─────────────────────────────────────────────

function ResetTypeBadge({ type }: { type: ResetType }) {
  if (type === "password") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
        <KeyRound className="w-3 h-3" />
        Password
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
      <Smartphone className="w-3 h-3" />
      2FA
    </span>
  );
}

// ─────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────

function StatusBadge({ status }: { status: ResetRequest["status"] }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
        Pending
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      Rejected
    </span>
  );
}

// ─────────────────────────────────────────────
// Submit Request Modal
// ─────────────────────────────────────────────

interface SubmitModalProps {
  onClose: () => void;
  onSubmit: (targetUserId: string, resetType: ResetType, reason: string) => void;
}

function SubmitModal({ onClose, onSubmit }: SubmitModalProps) {
  const [targetUserId, setTargetUserId] = useState("");
  const [resetType, setResetType] = useState<ResetType>("password");
  const [reason, setReason] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!targetUserId) return;
    onSubmit(targetUserId, resetType, reason);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">
              Submit Reset Request
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Target user */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Target User <span className="text-red-500">*</span>
            </label>
            <select
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="">Select a user…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.email}
                </option>
              ))}
            </select>
          </div>

          {/* Reset type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reset Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {(["password", "2fa"] as ResetType[]).map((type) => (
                <label
                  key={type}
                  className={`flex-1 flex items-center gap-2.5 border rounded-lg px-4 py-3 cursor-pointer transition-all ${
                    resetType === type
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="resetType"
                    value={type}
                    checked={resetType === type}
                    onChange={() => setResetType(type)}
                    className="sr-only"
                  />
                  {type === "password" ? (
                    <KeyRound className={`w-4 h-4 ${resetType === type ? "text-blue-600" : "text-gray-400"}`} />
                  ) : (
                    <Smartphone className={`w-4 h-4 ${resetType === type ? "text-blue-600" : "text-gray-400"}`} />
                  )}
                  <span className={`text-sm font-medium ${resetType === type ? "text-blue-700" : "text-gray-600"}`}>
                    {type === "password" ? "Password" : "2FA"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly explain why this reset is needed…"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!targetUserId}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Requests Table
// ─────────────────────────────────────────────

interface RequestsTableProps {
  requests: ResetRequest[];
  canApprove: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

function RequestsTable({ requests, canApprove, onApprove, onReject }: RequestsTableProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <RotateCcw className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium">No reset requests yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3 pr-4">
              Date
            </th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3 pr-4">
              Requester
            </th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3 pr-4">
              Target User
            </th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3 pr-4">
              Type
            </th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3 pr-4">
              Status
            </th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3 pr-4">
              Completed At
            </th>
            {canApprove && (
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {requests.map((req) => (
            <tr key={req.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-3.5 pr-4 text-gray-600 whitespace-nowrap">
                {formatDate(req.created_at)}
              </td>
              <td className="py-3.5 pr-4 font-medium text-gray-800 whitespace-nowrap">
                {req.requester_name}
              </td>
              <td className="py-3.5 pr-4 text-gray-700 whitespace-nowrap">
                {req.target_user_name}
              </td>
              <td className="py-3.5 pr-4">
                <ResetTypeBadge type={req.reset_type} />
              </td>
              <td className="py-3.5 pr-4">
                <StatusBadge status={req.status} />
              </td>
              <td className="py-3.5 pr-4 text-gray-500 whitespace-nowrap">
                {req.completed_at ? formatDateTime(req.completed_at) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
              {canApprove && (
                <td className="py-3.5">
                  {req.status === "pending" ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onApprove(req.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border border-emerald-200 rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onReject(req.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 border border-red-200 rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export default function ResetsPage() {
  const { role } = useRole();
  const [requests, setRequests] = useState<ResetRequest[]>(resetRequests);
  const [showModal, setShowModal] = useState(false);

  const isUser = role === "User";
  const canApprove = role === "Super Admin" || role === "Admin";

  function handleSubmit(targetUserId: string, resetType: ResetType, _reason: string) {
    const targetUser = users.find((u) => u.id === targetUserId);
    if (!targetUser) return;

    const newRequest: ResetRequest = {
      id: `reset-${Date.now()}`,
      requester_id: "usr-alice",
      requester_name: "Alice Nguyen",
      target_user_id: targetUserId,
      target_user_name: targetUser.name,
      reset_type: resetType,
      status: "pending",
      created_at: new Date().toISOString(),
      completed_at: null,
    };
    setRequests((prev) => [newRequest, ...prev]);
  }

  function handleApprove(id: string) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "completed", completed_at: new Date().toISOString() }
          : r
      )
    );
  }

  function handleReject(id: string) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "rejected", completed_at: new Date().toISOString() }
          : r
      )
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-500 to-amber-500" />
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Reset Requests
            </h1>
          </div>
          <p className="text-sm text-gray-500 ml-4 pl-3">
            Manage password and 2FA reset requests
          </p>
        </div>

        {!isUser && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Submit Reset Request
          </button>
        )}
      </div>

      {/* Restricted Banner for User role */}
      {isUser && (
        <div className="flex items-start gap-3 mb-6 px-4 py-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <div>
            <p className="font-semibold">Restricted Access</p>
            <p className="text-red-600 mt-0.5">
              You do not have permission to submit reset requests. Contact a Super Admin or Admin to request a reset on your behalf.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <StatsCards requests={requests} />

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">All Requests</h2>
          <span className="text-xs text-gray-400 font-medium">
            {requests.length} total
          </span>
        </div>
        <div className="px-6 py-4">
          <RequestsTable
            requests={requests}
            canApprove={canApprove}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      </div>

      {/* Audit trail note */}
      <div className="mt-5 flex items-start gap-2.5 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
        <span>
          All reset requests are logged to the audit trail for compliance.
        </span>
      </div>

      {/* Submit Modal */}
      {showModal && (
        <SubmitModal
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
