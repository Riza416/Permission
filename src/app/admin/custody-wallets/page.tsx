"use client";

import { useState } from "react";
import {
  Wallet,
  Plus,
  Users,
  Shield,
  Lock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  X,
  Snowflake,
} from "lucide-react";
import {
  custodyWallets,
  CustodyWallet,
  permissionGroups,
  organizations,
  users,
  permissions,
} from "@/lib/mock-data";
import { useRole } from "@/components/Sidebar";

// ─────────────────────────────────────────────
// Currency config
// ─────────────────────────────────────────────

const currencies = [
  { code: "BTC", name: "Bitcoin", color: "bg-orange-100 text-orange-700 border-orange-300" },
  { code: "ETH", name: "Ethereum", color: "bg-indigo-100 text-indigo-700 border-indigo-300" },
  { code: "USDC", name: "USD Coin", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  { code: "USDT", name: "Tether", color: "bg-teal-100 text-teal-700 border-teal-300" },
  { code: "SOL", name: "Solana", color: "bg-purple-100 text-purple-700 border-purple-300" },
  { code: "MATIC", name: "Polygon", color: "bg-violet-100 text-violet-700 border-violet-300" },
];

function getCurrencyStyle(code: string) {
  return currencies.find((c) => c.code === code)?.color ?? "bg-gray-100 text-gray-700 border-gray-300";
}

// ─────────────────────────────────────────────
// Permission helpers
// ─────────────────────────────────────────────

function hasPermission(role: string, permName: string): boolean {
  if (role === "Super Admin") return true;
  if (role === "Admin") {
    // Admin has wallet.create but not assign_group
    return permName === "custody.wallet.create";
  }
  return false;
}

// ─────────────────────────────────────────────
// Stats
// ─────────────────────────────────────────────

function StatsCards({ wallets }: { wallets: CustodyWallet[] }) {
  const active = wallets.filter((w) => w.status === "active").length;
  const frozen = wallets.filter((w) => w.status === "frozen").length;
  const totalGroups = new Set(wallets.flatMap((w) => w.assigned_group_ids)).size;
  const uniqueCurrencies = new Set(wallets.map((w) => w.currency)).size;

  const stats = [
    { label: "Total Wallets", value: wallets.length, icon: Wallet, bg: "bg-blue-50 border-blue-200", text: "text-blue-600" },
    { label: "Active", value: active, icon: CheckCircle2, bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-600" },
    { label: "Frozen", value: frozen, icon: Snowflake, bg: "bg-red-50 border-red-200", text: "text-red-600" },
    { label: "Currencies", value: uniqueCurrencies, icon: Shield, bg: "bg-amber-50 border-amber-200", text: "text-amber-600" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${s.bg}`}>
                <Icon className={`w-5 h-5 ${s.text}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Wallet card
// ─────────────────────────────────────────────

function WalletCard({
  wallet,
  canAssignGroups,
  onAssignGroup,
  onUnassignGroup,
}: {
  wallet: CustodyWallet;
  canAssignGroups: boolean;
  onAssignGroup: (walletId: string, groupId: string) => void;
  onUnassignGroup: (walletId: string, groupId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showGroupPicker, setShowGroupPicker] = useState(false);

  const org = organizations.find((o) => o.id === wallet.organization_id);
  const createdBy = users.find((u) => u.id === wallet.created_by);
  const assignedGroups = permissionGroups.filter((g) =>
    wallet.assigned_group_ids.includes(g.id)
  );
  const availableGroups = permissionGroups.filter(
    (g) =>
      g.organization_id === wallet.organization_id &&
      !wallet.assigned_group_ids.includes(g.id)
  );

  return (
    <div
      className={`rounded-xl border-2 bg-white shadow-sm transition-all duration-200 ${
        wallet.status === "frozen"
          ? "border-red-200 opacity-75"
          : "border-gray-200 hover:border-blue-300 hover:shadow-md"
      }`}
    >
      {/* Header */}
      <div
        className="flex items-start gap-4 p-5 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Currency badge */}
        <div className={`flex-shrink-0 rounded-xl px-3 py-2 border font-bold text-lg ${getCurrencyStyle(wallet.currency)}`}>
          {wallet.currency}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-900">
              {wallet.currency_name} Wallet
            </h3>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                wallet.status === "active"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {wallet.status === "frozen" && <Snowflake className="w-3 h-3" />}
              {wallet.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-400 font-mono truncate">
            {wallet.address}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
            <span>{org?.name}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{assignedGroups.length} group{assignedGroups.length !== 1 ? "s" : ""} assigned</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>Created by {createdBy?.name ?? "Unknown"}</span>
          </div>
        </div>

        <div className="flex-shrink-0">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 rounded-b-xl p-5 space-y-4">
          {/* Wallet details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-gray-500 font-medium">Wallet ID</span>
              <p className="font-mono text-gray-700 text-xs mt-0.5">{wallet.id}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium">Created</span>
              <p className="text-gray-700 text-xs mt-0.5">
                {new Date(wallet.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Assigned groups */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Assigned Groups
              </h4>
              {canAssignGroups && wallet.status === "active" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowGroupPicker((v) => !v);
                  }}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  <Plus className="w-3 h-3" />
                  Assign Group
                </button>
              )}
              {!canAssignGroups && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Lock className="w-3 h-3" />
                  No permission
                </span>
              )}
            </div>

            {assignedGroups.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No groups assigned</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {assignedGroups.map((group) => (
                  <span
                    key={group.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                      group.is_super_admin
                        ? "bg-amber-50 text-amber-800 border-amber-300"
                        : "bg-white text-gray-700 border-gray-200"
                    }`}
                  >
                    <Users className="w-3 h-3" />
                    {group.name}
                    {group.is_super_admin && (
                      <Shield className="w-3 h-3 text-amber-500" />
                    )}
                    {canAssignGroups && wallet.status === "active" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnassignGroup(wallet.id, group.id);
                        }}
                        className="ml-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}

            {/* Group picker dropdown */}
            {showGroupPicker && availableGroups.length > 0 && (
              <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 space-y-1">
                <p className="text-xs text-gray-500 font-medium px-2 py-1">
                  Select a group to assign:
                </p>
                {availableGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAssignGroup(wallet.id, group.id);
                      setShowGroupPicker(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <Users className="w-3 h-3" />
                    {group.name}
                  </button>
                ))}
                {availableGroups.length === 0 && (
                  <p className="text-xs text-gray-400 px-2 py-1">All groups already assigned</p>
                )}
              </div>
            )}
            {showGroupPicker && availableGroups.length === 0 && (
              <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                <p className="text-xs text-gray-400">All groups are already assigned to this wallet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Create wallet modal
// ─────────────────────────────────────────────

function CreateWalletModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (currency: string) => void;
}) {
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Create Custody Wallet</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Currency
            </label>
            <div className="grid grid-cols-2 gap-2">
              {currencies.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setSelectedCurrency(c.code)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    selectedCurrency === c.code
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className={`px-2 py-1 rounded text-xs font-bold border ${c.color}`}>
                    {c.code}
                  </span>
                  <span className="text-sm text-gray-700">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              This is a mock UI. In production, wallet creation will provision a real custody wallet on the blockchain.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedCurrency) onCreate(selectedCurrency);
            }}
            disabled={!selectedCurrency}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Wallet
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────

export default function CustodyWalletsPage() {
  const { role } = useRole();
  const canCreate = hasPermission(role, "custody.wallet.create");
  const canAssign = hasPermission(role, "custody.wallet.assign_group");

  const [wallets, setWallets] = useState<CustodyWallet[]>(custodyWallets);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterCurrency, setFilterCurrency] = useState<string>("all");

  const filteredWallets =
    filterCurrency === "all"
      ? wallets
      : wallets.filter((w) => w.currency === filterCurrency);

  const uniqueCurrenciesInWallets = Array.from(new Set(wallets.map((w) => w.currency)));

  function handleCreate(currency: string) {
    const curr = currencies.find((c) => c.code === currency);
    const newWallet: CustodyWallet = {
      id: `wallet-${currency.toLowerCase()}-${String(wallets.length + 1).padStart(2, "0")}`,
      currency,
      currency_name: curr?.name ?? currency,
      address: `0x${Math.random().toString(16).slice(2, 42)}`,
      organization_id: "org-acme",
      assigned_group_ids: [],
      status: "active",
      created_by: "usr-alice",
      created_at: new Date().toISOString(),
    };
    setWallets((prev) => [newWallet, ...prev]);
    setShowCreateModal(false);
  }

  function handleAssignGroup(walletId: string, groupId: string) {
    setWallets((prev) =>
      prev.map((w) =>
        w.id === walletId
          ? { ...w, assigned_group_ids: [...w.assigned_group_ids, groupId] }
          : w
      )
    );
  }

  function handleUnassignGroup(walletId: string, groupId: string) {
    setWallets((prev) =>
      prev.map((w) =>
        w.id === walletId
          ? { ...w, assigned_group_ids: w.assigned_group_ids.filter((id) => id !== groupId) }
          : w
      )
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-rose-500 to-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900">Custody Wallets</h1>
          </div>
          <p className="mt-1 ml-4 text-sm text-gray-500">
            Create and manage crypto custody wallets with group-based access control
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Wallet
          </button>
        )}
      </div>

      {/* Role restriction banners */}
      {role === "User" && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <Lock className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Restricted Access</p>
            <p className="text-xs text-red-600">
              You do not have custody wallet permissions. Contact your administrator to request access.
            </p>
          </div>
        </div>
      )}

      {role === "Admin" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Limited Access</p>
            <p className="text-xs text-amber-600">
              You can create wallets (<code className="bg-amber-100 px-1 rounded">custody.wallet.create</code>) but cannot assign groups. Contact a Super Admin for group assignment.
            </p>
          </div>
        </div>
      )}

      {/* Feature flag banner */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex items-center gap-3">
        <svg className="w-5 h-5 text-rose-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10l-1.5 2L16 7H6a1 1 0 00-1 1v7a1 1 0 001 1H3V6z" clipRule="evenodd" />
        </svg>
        <p className="text-xs text-rose-700">
          <span className="font-semibold">Feature Flag:</span>{" "}
          <code className="bg-rose-100 px-1.5 py-0.5 rounded font-mono">custody_wallet_permissions</code>{" "}
          &mdash; This feature is gated behind a feature flag and requires RBAC-12 through RBAC-15 to be completed.
        </p>
      </div>

      {/* Stats */}
      <StatsCards wallets={wallets} />

      {/* Permission indicator */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Your Custody Permissions
        </h3>
        <div className="flex flex-wrap gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
              canCreate
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-gray-50 border-gray-200 text-gray-400"
            }`}
          >
            {canCreate ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            <code className="text-xs font-mono">custody.wallet.create</code>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
              canAssign
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-gray-50 border-gray-200 text-gray-400"
            }`}
          >
            {canAssign ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            <code className="text-xs font-mono">custody.wallet.assign_group</code>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Filter by currency:</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCurrency("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filterCurrency === "all"
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            All ({wallets.length})
          </button>
          {uniqueCurrenciesInWallets.map((curr) => {
            const count = wallets.filter((w) => w.currency === curr).length;
            return (
              <button
                key={curr}
                onClick={() => setFilterCurrency(curr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  filterCurrency === curr
                    ? "bg-gray-900 text-white border-gray-900"
                    : `${getCurrencyStyle(curr)} hover:opacity-80`
                }`}
              >
                {curr} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Wallet list */}
      <div className="space-y-3">
        {filteredWallets.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <Wallet className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No wallets found</p>
            {canCreate && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first wallet
              </button>
            )}
          </div>
        ) : (
          filteredWallets.map((wallet) => (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              canAssignGroups={canAssign}
              onAssignGroup={handleAssignGroup}
              onUnassignGroup={handleUnassignGroup}
            />
          ))
        )}
      </div>

      {/* Audit note */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-start gap-2 text-xs text-gray-500">
        <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          All wallet creation and group assignment actions are logged to the immutable audit trail for compliance purposes.
        </span>
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <CreateWalletModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
