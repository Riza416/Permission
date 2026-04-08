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
  Eye,
  Send,
  Settings,
} from "lucide-react";
import {
  custodyWallets,
  CustodyWallet,
  WalletCapability,
  WalletGroupAssignment,
  walletCapabilities,
  permissionGroups,
  organizations,
  users,
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
// Capability helpers
// ─────────────────────────────────────────────

const capabilityStyles: Record<WalletCapability, { icon: typeof Eye; bg: string; text: string; border: string }> = {
  view: { icon: Eye, bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  send_transactions: { icon: Send, bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  manage: { icon: Settings, bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

function CapabilityBadge({ cap, small }: { cap: WalletCapability; small?: boolean }) {
  const style = capabilityStyles[cap];
  const capInfo = walletCapabilities.find((c) => c.id === cap);
  const Icon = style.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-medium ${style.bg} ${style.text} ${style.border} ${
        small ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"
      }`}
      title={capInfo?.description}
    >
      <Icon className={small ? "w-2.5 h-2.5" : "w-3 h-3"} />
      {capInfo?.label ?? cap}
    </span>
  );
}

// ─────────────────────────────────────────────
// Permission helpers
// ─────────────────────────────────────────────

function hasPermission(role: string, permName: string): boolean {
  if (role === "Super Admin") return true;
  if (role === "Admin") {
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
  const uniqueCurrencies = new Set(wallets.map((w) => w.currency)).size;
  const totalAssignments = wallets.reduce((sum, w) => sum + w.group_assignments.length, 0);

  const stats = [
    { label: "Total Wallets", value: wallets.length, icon: Wallet, bg: "bg-blue-50 border-blue-200", text: "text-blue-600" },
    { label: "Active", value: active, icon: CheckCircle2, bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-600" },
    { label: "Frozen", value: frozen, icon: Snowflake, bg: "bg-red-50 border-red-200", text: "text-red-600" },
    { label: "Group Assignments", value: totalAssignments, icon: Users, bg: "bg-amber-50 border-amber-200", text: "text-amber-600" },
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
// Assign Group Modal
// ─────────────────────────────────────────────

function AssignGroupModal({
  wallet,
  onClose,
  onAssign,
}: {
  wallet: CustodyWallet;
  onClose: () => void;
  onAssign: (walletId: string, groupId: string, capabilities: WalletCapability[]) => void;
}) {
  const assignedGroupIds = wallet.group_assignments.map((a) => a.group_id);
  const availableGroups = permissionGroups.filter(
    (g) => g.organization_id === wallet.organization_id && !assignedGroupIds.includes(g.id)
  );
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedCaps, setSelectedCaps] = useState<WalletCapability[]>(["view"]);

  function toggleCap(cap: WalletCapability) {
    setSelectedCaps((prev) => {
      if (cap === "view") return prev; // view is always included
      if (cap === "manage") {
        // manage implies all
        return prev.includes("manage")
          ? prev.filter((c) => c !== "manage")
          : ["view", "send_transactions", "manage"];
      }
      if (cap === "send_transactions") {
        return prev.includes("send_transactions")
          ? prev.filter((c) => c !== "send_transactions" && c !== "manage")
          : [...prev.filter((c) => c !== "manage"), "send_transactions"];
      }
      return prev;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Assign Group to Wallet</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {wallet.label} ({wallet.currency})
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Group selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Group</label>
            {availableGroups.length === 0 ? (
              <p className="text-xs text-gray-400 italic">All groups are already assigned to this wallet.</p>
            ) : (
              <div className="space-y-2">
                {availableGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroup(group.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                      selectedGroup === group.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-800">{group.name}</span>
                      {group.is_super_admin && (
                        <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">
                          SUPER ADMIN
                        </span>
                      )}
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {group.permission_ids.length} permissions
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Capability selection */}
          {selectedGroup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wallet Capabilities for this Group
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Choose what this group can do with the <strong>{wallet.label}</strong> wallet
              </p>
              <div className="space-y-2">
                {walletCapabilities.map((cap) => {
                  const isSelected = selectedCaps.includes(cap.id);
                  const isView = cap.id === "view";
                  const style = capabilityStyles[cap.id];
                  const Icon = style.icon;
                  return (
                    <button
                      key={cap.id}
                      onClick={() => toggleCap(cap.id)}
                      disabled={isView}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? `${style.border} ${style.bg}`
                          : "border-gray-200 hover:border-gray-300"
                      } ${isView ? "opacity-80 cursor-default" : ""}`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? `${style.border} ${style.bg}` : "border-gray-300"
                      }`}>
                        {isSelected && <CheckCircle2 className={`w-3.5 h-3.5 ${style.text}`} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isSelected ? style.text : "text-gray-400"}`} />
                          <span className={`text-sm font-medium ${isSelected ? style.text : "text-gray-700"}`}>
                            {cap.label}
                          </span>
                          {isView && (
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                              Always included
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{cap.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">
                &quot;Send Transactions&quot; includes View. &quot;Full Manage&quot; includes all capabilities.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedGroup) onAssign(wallet.id, selectedGroup, selectedCaps);
            }}
            disabled={!selectedGroup}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Assign Group
          </button>
        </div>
      </div>
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
  onUpdateCapabilities,
}: {
  wallet: CustodyWallet;
  canAssignGroups: boolean;
  onAssignGroup: (wallet: CustodyWallet) => void;
  onUnassignGroup: (walletId: string, groupId: string) => void;
  onUpdateCapabilities: (walletId: string, groupId: string, caps: WalletCapability[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);

  const org = organizations.find((o) => o.id === wallet.organization_id);
  const createdBy = users.find((u) => u.id === wallet.created_by);

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
            <h3 className="text-sm font-semibold text-gray-900">{wallet.label}</h3>
            <span className="text-xs text-gray-400">({wallet.currency_name})</span>
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
          <p className="mt-1 text-xs text-gray-400 font-mono truncate">{wallet.address}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 flex-wrap">
            <span>{org?.name}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>
              {wallet.group_assignments.length} group{wallet.group_assignments.length !== 1 ? "s" : ""} assigned
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>Created by {createdBy?.name ?? "Unknown"}</span>
          </div>
          {/* Summary of group capabilities */}
          {wallet.group_assignments.length > 0 && !expanded && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {wallet.group_assignments.map((assignment) => {
                const group = permissionGroups.find((g) => g.id === assignment.group_id);
                if (!group) return null;
                return (
                  <span key={group.id} className="inline-flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {group.name}:
                    {assignment.capabilities.map((cap) => (
                      <CapabilityBadge key={cap} cap={cap} small />
                    ))}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 rounded-b-xl p-5 space-y-5">
          {/* Wallet details */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-xs text-gray-500 font-medium">Wallet ID</span>
              <p className="font-mono text-gray-700 text-xs mt-0.5">{wallet.id}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium">Label</span>
              <p className="text-gray-700 text-xs mt-0.5">{wallet.label}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium">Created</span>
              <p className="text-gray-700 text-xs mt-0.5">
                {new Date(wallet.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </p>
            </div>
          </div>

          {/* Capability legend */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Capability Levels</p>
            <div className="flex flex-wrap gap-2">
              {walletCapabilities.map((cap) => (
                <div key={cap.id} className="flex items-center gap-1.5">
                  <CapabilityBadge cap={cap.id} small />
                  <span className="text-[10px] text-gray-400">{cap.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Group assignments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Group Access
              </h4>
              {canAssignGroups && wallet.status === "active" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssignGroup(wallet);
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

            {wallet.group_assignments.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No groups assigned to this wallet</p>
            ) : (
              <div className="space-y-2">
                {wallet.group_assignments.map((assignment) => {
                  const group = permissionGroups.find((g) => g.id === assignment.group_id);
                  if (!group) return null;
                  const isEditing = editingGroup === group.id;

                  return (
                    <div
                      key={group.id}
                      className={`bg-white border rounded-lg p-3 ${
                        group.is_super_admin ? "border-amber-300" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-800">{group.name}</span>
                          {group.is_super_admin && (
                            <Shield className="w-3.5 h-3.5 text-amber-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Capability badges */}
                          <div className="flex gap-1">
                            {assignment.capabilities.map((cap) => (
                              <CapabilityBadge key={cap} cap={cap} small />
                            ))}
                          </div>
                          {canAssignGroups && wallet.status === "active" && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingGroup(isEditing ? null : group.id);
                                }}
                                className="text-xs text-gray-400 hover:text-blue-600 px-1.5 py-0.5 rounded hover:bg-blue-50"
                              >
                                {isEditing ? "Done" : "Edit"}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUnassignGroup(wallet.id, group.id);
                                }}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Inline capability editor */}
                      {isEditing && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-[10px] text-gray-500 font-medium mb-2">
                            Update capabilities for <strong>{group.name}</strong> on this wallet:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {walletCapabilities.map((cap) => {
                              const isActive = assignment.capabilities.includes(cap.id);
                              const style = capabilityStyles[cap.id];
                              const Icon = style.icon;
                              const isView = cap.id === "view";
                              return (
                                <button
                                  key={cap.id}
                                  disabled={isView}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    let newCaps: WalletCapability[];
                                    if (cap.id === "manage") {
                                      newCaps = isActive
                                        ? assignment.capabilities.filter((c) => c !== "manage")
                                        : ["view", "send_transactions", "manage"];
                                    } else if (cap.id === "send_transactions") {
                                      newCaps = isActive
                                        ? assignment.capabilities.filter((c) => c !== "send_transactions" && c !== "manage")
                                        : [...assignment.capabilities.filter((c) => c !== "manage"), "send_transactions"];
                                    } else {
                                      newCaps = assignment.capabilities;
                                    }
                                    onUpdateCapabilities(wallet.id, group.id, newCaps);
                                  }}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 transition-all text-xs font-medium ${
                                    isActive
                                      ? `${style.bg} ${style.text} ${style.border}`
                                      : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                                  } ${isView ? "cursor-default" : ""}`}
                                >
                                  <Icon className="w-3 h-3" />
                                  {cap.label}
                                  {isView && <Lock className="w-2.5 h-2.5 ml-0.5" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
  onCreate: (currency: string, label: string) => void;
}) {
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [label, setLabel] = useState("");

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Treasury Wallet, Payments Wallet"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Currency</label>
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
                  <span className={`px-2 py-1 rounded text-xs font-bold border ${c.color}`}>{c.code}</span>
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
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Cancel</button>
          <button
            onClick={() => {
              if (selectedCurrency && label.trim()) onCreate(selectedCurrency, label.trim());
            }}
            disabled={!selectedCurrency || !label.trim()}
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
  const [assignModalWallet, setAssignModalWallet] = useState<CustodyWallet | null>(null);
  const [filterCurrency, setFilterCurrency] = useState<string>("all");

  const filteredWallets = filterCurrency === "all" ? wallets : wallets.filter((w) => w.currency === filterCurrency);
  const uniqueCurrenciesInWallets = Array.from(new Set(wallets.map((w) => w.currency)));

  function handleCreate(currency: string, label: string) {
    const curr = currencies.find((c) => c.code === currency);
    const newWallet: CustodyWallet = {
      id: `wallet-${currency.toLowerCase()}-${String(wallets.length + 1).padStart(2, "0")}`,
      currency,
      currency_name: curr?.name ?? currency,
      label,
      address: `0x${Math.random().toString(16).slice(2, 42)}`,
      organization_id: "org-acme",
      group_assignments: [],
      status: "active",
      created_by: "usr-alice",
      created_at: new Date().toISOString(),
    };
    setWallets((prev) => [newWallet, ...prev]);
    setShowCreateModal(false);
  }

  function handleAssignGroup(walletId: string, groupId: string, capabilities: WalletCapability[]) {
    setWallets((prev) =>
      prev.map((w) =>
        w.id === walletId
          ? { ...w, group_assignments: [...w.group_assignments, { group_id: groupId, capabilities }] }
          : w
      )
    );
    setAssignModalWallet(null);
  }

  function handleUnassignGroup(walletId: string, groupId: string) {
    setWallets((prev) =>
      prev.map((w) =>
        w.id === walletId
          ? { ...w, group_assignments: w.group_assignments.filter((a) => a.group_id !== groupId) }
          : w
      )
    );
  }

  function handleUpdateCapabilities(walletId: string, groupId: string, caps: WalletCapability[]) {
    setWallets((prev) =>
      prev.map((w) =>
        w.id === walletId
          ? {
              ...w,
              group_assignments: w.group_assignments.map((a) =>
                a.group_id === groupId ? { ...a, capabilities: caps } : a
              ),
            }
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
            Create crypto wallets and assign groups with specific capabilities (view, send, manage)
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
            <p className="text-xs text-red-600">You do not have custody wallet permissions. Contact your administrator.</p>
          </div>
        </div>
      )}

      {role === "Admin" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Limited Access</p>
            <p className="text-xs text-amber-600">
              You can create wallets but cannot assign groups or manage capabilities. Contact a Super Admin.
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
          <code className="bg-rose-100 px-1.5 py-0.5 rounded font-mono">custody_wallet_permissions</code>
        </p>
      </div>

      {/* Stats */}
      <StatsCards wallets={wallets} />

      {/* Capability explainer */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Wallet Capability Levels
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {walletCapabilities.map((cap) => {
            const style = capabilityStyles[cap.id];
            const Icon = style.icon;
            return (
              <div key={cap.id} className={`flex items-start gap-3 p-3 rounded-lg border ${style.border} ${style.bg}`}>
                <Icon className={`w-5 h-5 ${style.text} flex-shrink-0 mt-0.5`} />
                <div>
                  <p className={`text-sm font-semibold ${style.text}`}>{cap.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{cap.description}</p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[10px] text-gray-400">
          Example: Assign your <strong>Accounting</strong> group with <strong>View Only</strong> on the Treasury Wallet so they can see balances.
          Assign <strong>Finance</strong> with <strong>Send Transactions</strong> so they can submit payments.
          Only <strong>Super Admins</strong> should have <strong>Full Manage</strong>.
        </p>
      </div>

      {/* Your permissions */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Your Custody Permissions
        </h3>
        <div className="flex flex-wrap gap-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${canCreate ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-400"}`}>
            {canCreate ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <code className="text-xs font-mono">custody.wallet.create</code>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${canAssign ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-400"}`}>
            {canAssign ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
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
              filterCurrency === "all" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
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
                  filterCurrency === curr ? "bg-gray-900 text-white border-gray-900" : `${getCurrencyStyle(curr)} hover:opacity-80`
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
              <button onClick={() => setShowCreateModal(true)} className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium">
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
              onAssignGroup={(w) => setAssignModalWallet(w)}
              onUnassignGroup={handleUnassignGroup}
              onUpdateCapabilities={handleUpdateCapabilities}
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
          All wallet creation, group assignment, and capability changes are logged to the immutable audit trail.
        </span>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateWalletModal onClose={() => setShowCreateModal(false)} onCreate={handleCreate} />
      )}
      {assignModalWallet && (
        <AssignGroupModal
          wallet={assignModalWallet}
          onClose={() => setAssignModalWallet(null)}
          onAssign={handleAssignGroup}
        />
      )}
    </div>
  );
}
