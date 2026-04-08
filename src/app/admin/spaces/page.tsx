"use client";

import { useState } from "react";
import {
  entities,
  organizations,
  users,
  Entity,
  Organization,
  User,
} from "@/lib/mock-data";
import { useRole } from "@/components/Sidebar";
import {
  Layers,
  Lock,
  Plus,
  Pencil,
  UserPlus,
  X,
  ShieldAlert,
  ShieldCheck,
  Building2,
  AlertTriangle,
} from "lucide-react";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getUsersForEntity(entityId: string): User[] {
  return users.filter((u) => u.entity_ids.includes(entityId));
}

const avatarColors = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-fuchsia-500",
  "bg-teal-500",
];

function avatarColor(userId: string): string {
  const index = userId.charCodeAt(userId.length - 1) % avatarColors.length;
  return avatarColors[index];
}

const orgAccentMap: Record<string, { border: string; header: string; badge: string; pill: string }> = {
  "org-acme": {
    border: "border-blue-300",
    header: "bg-blue-600",
    badge: "bg-blue-100 text-blue-700",
    pill: "bg-blue-50 border-blue-200 text-blue-700",
  },
  "org-flux": {
    border: "border-violet-300",
    header: "bg-violet-600",
    badge: "bg-violet-100 text-violet-700",
    pill: "bg-violet-50 border-violet-200 text-violet-700",
  },
};

function getOrgAccent(orgId: string) {
  return (
    orgAccentMap[orgId] ?? {
      border: "border-slate-300",
      header: "bg-slate-600",
      badge: "bg-slate-100 text-slate-700",
      pill: "bg-slate-50 border-slate-200 text-slate-700",
    }
  );
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

interface UserPickerModalProps {
  entity: Entity;
  assignedUsers: User[];
  onClose: () => void;
  onAssign: (userId: string) => void;
}

function UserPickerModal({
  entity,
  assignedUsers,
  onClose,
  onAssign,
}: UserPickerModalProps) {
  const orgUsers = users.filter(
    (u) => u.organization_id === entity.organization_id
  );
  const unassigned = orgUsers.filter(
    (u) => !assignedUsers.some((a) => a.id === u.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Assign User to {entity.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a user from this organization to add
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-72 overflow-y-auto">
          {unassigned.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">
              All users in this organization are already assigned.
            </p>
          ) : (
            <ul className="space-y-2">
              {unassigned.map((u) => (
                <li key={u.id}>
                  <button
                    onClick={() => onAssign(u.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all text-left group"
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 ${avatarColor(u.id)}`}
                    >
                      {getInitials(u.name)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {u.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {u.email}
                      </p>
                    </div>
                    <span className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Assign
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────

interface EditEntityModalProps {
  entity: Entity;
  onClose: () => void;
}

function EditEntityModal({ entity, onClose }: EditEntityModalProps) {
  const [name, setName] = useState(entity.name);
  const org = organizations.find((o) => o.id === entity.organization_id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Edit Entity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Update the entity name
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Entity Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Organization
            </label>
            <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500">
              {org?.name ?? entity.organization_id}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────

interface CreateEntityModalProps {
  onClose: () => void;
}

function CreateEntityModal({ onClose }: CreateEntityModalProps) {
  const [name, setName] = useState("");
  const [orgId, setOrgId] = useState(organizations[0]?.id ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Create Entity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add a new operational space within an organization
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Entity Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme LATAM"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Organization
            </label>
            <select
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            >
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Create Entity
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Data isolation diagram
// ─────────────────────────────────────────────

function DataIsolationDiagram({ orgId }: { orgId: string }) {
  const orgEntities = entities.filter((e) => e.organization_id === orgId);
  if (orgEntities.length < 2) return null;

  const [entityA, entityB] = orgEntities;
  const usersA = getUsersForEntity(entityA.id);
  const usersB = getUsersForEntity(entityB.id);

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-4 h-4 text-slate-500" />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Data Isolation — Entities are fully isolated from each other
        </span>
      </div>

      <div className="flex items-stretch gap-0">
        {/* Entity A */}
        <div className="flex-1 rounded-xl border-2 border-blue-400 bg-white overflow-hidden">
          <div className="bg-blue-500 px-4 py-2 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-white" />
            <span className="text-xs font-bold text-white">{entityA.name}</span>
          </div>
          <div className="px-4 py-3 space-y-1.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Users with access
            </p>
            {usersA.slice(0, 3).map((u) => (
              <div key={u.id} className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center flex-shrink-0 ${avatarColor(u.id)}`}
                >
                  {getInitials(u.name)}
                </span>
                <span className="text-xs text-slate-600 truncate">
                  {u.name}
                </span>
              </div>
            ))}
            <div className="mt-2 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1.5">
              <p className="text-[10px] text-blue-700 font-medium">
                Transactions, invoices, and reporting for {entityA.name} only
              </p>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="flex flex-col items-center justify-center px-3 gap-1.5 z-10">
          <div className="w-px h-6 bg-red-300" />
          <div className="rounded-full bg-red-100 border-2 border-red-400 p-2">
            <Lock className="w-4 h-4 text-red-600" />
          </div>
          <div className="w-px h-6 bg-red-300" />
          <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest rotate-0 whitespace-nowrap">
            Isolated
          </span>
        </div>

        {/* Entity B */}
        <div className="flex-1 rounded-xl border-2 border-violet-400 bg-white overflow-hidden">
          <div className="bg-violet-500 px-4 py-2 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-white" />
            <span className="text-xs font-bold text-white">{entityB.name}</span>
          </div>
          <div className="px-4 py-3 space-y-1.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Users with access
            </p>
            {usersB.slice(0, 3).map((u) => (
              <div key={u.id} className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center flex-shrink-0 ${avatarColor(u.id)}`}
                >
                  {getInitials(u.name)}
                </span>
                <span className="text-xs text-slate-600 truncate">
                  {u.name}
                </span>
              </div>
            ))}
            <div className="mt-2 rounded-lg bg-violet-50 border border-violet-200 px-2.5 py-1.5">
              <p className="text-[10px] text-violet-700 font-medium">
                Transactions, invoices, and reporting for {entityB.name} only
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-slate-500 text-center">
        A user assigned to <strong>{entityA.name}</strong> cannot read or write
        data belonging to <strong>{entityB.name}</strong>, and vice versa.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Entity card
// ─────────────────────────────────────────────

interface EntityCardProps {
  entity: Entity;
  canEdit: boolean;
  onAssignUser: (entity: Entity) => void;
  onEditEntity: (entity: Entity) => void;
  assignedUsers: User[];
}

function EntityCard({
  entity,
  canEdit,
  onAssignUser,
  onEditEntity,
  assignedUsers,
}: EntityCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all overflow-hidden flex flex-col">
      {/* Card header strip */}
      <div className="h-1.5 bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400" />

      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Entity name + count */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                {entity.name}
              </h4>
              <p className="text-xs text-slate-400">
                ID: {entity.id}
              </p>
            </div>
          </div>
          <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm4.5 5a4.5 4.5 0 0 0-9 0h9Z" />
            </svg>
            {assignedUsers.length}{" "}
            {assignedUsers.length === 1 ? "user" : "users"}
          </span>
        </div>

        {/* User avatars */}
        <div className="flex-1">
          {assignedUsers.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No users assigned yet</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {assignedUsers.map((u) => (
                <div
                  key={u.id}
                  className="group relative"
                  title={u.name}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white cursor-default select-none ${avatarColor(u.id)} ${u.status === "inactive" ? "opacity-40 grayscale" : ""}`}
                  >
                    {getInitials(u.name)}
                  </span>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-10">
                    <div className="bg-slate-800 text-white text-[10px] rounded-md px-2 py-1 whitespace-nowrap shadow-lg">
                      {u.name}
                      {u.status === "inactive" && (
                        <span className="ml-1 text-slate-400">(inactive)</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        {canEdit ? (
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onAssignUser(entity)}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-lg px-3 py-2 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Assign User
            </button>
            <button
              onClick={() => onEditEntity(entity)}
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 transition-all"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
            <Lock className="w-3 h-3" />
            <span>Read-only — insufficient permissions</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Organization block
// ─────────────────────────────────────────────

interface OrgBlockProps {
  org: Organization;
  canEdit: boolean;
  onAssignUser: (entity: Entity) => void;
  onEditEntity: (entity: Entity) => void;
}

function OrgBlock({ org, canEdit, onAssignUser, onEditEntity }: OrgBlockProps) {
  const accent = getOrgAccent(org.id);
  const orgEntities = entities.filter((e) => e.organization_id === org.id);

  return (
    <div className={`rounded-2xl border-2 ${accent.border} overflow-hidden`}>
      {/* Org header */}
      <div className={`${accent.header} px-6 py-4 flex items-center gap-3`}>
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-white">{org.name}</h3>
          <p className="text-xs text-white/70 capitalize">{org.type} organization</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white border border-white/30`}
          >
            {orgEntities.length}{" "}
            {orgEntities.length === 1 ? "entity" : "entities"}
          </span>
          {!canEdit && (
            <span className="flex items-center gap-1 text-xs bg-black/20 text-white/80 px-2 py-1 rounded-full">
              <Lock className="w-3 h-3" />
              Own org only
            </span>
          )}
        </div>
      </div>

      {/* Entity grid */}
      <div className="p-5 bg-white/50">
        {orgEntities.length === 0 ? (
          <p className="text-sm text-slate-500 italic text-center py-6">
            No entities in this organization yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {orgEntities.map((entity) => {
              const assignedUsers = getUsersForEntity(entity.id);
              return (
                <EntityCard
                  key={entity.id}
                  entity={entity}
                  canEdit={canEdit}
                  assignedUsers={assignedUsers}
                  onAssignUser={onAssignUser}
                  onEditEntity={onEditEntity}
                />
              );
            })}
          </div>
        )}

        {/* Data isolation diagram */}
        <DataIsolationDiagram orgId={org.id} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────

export default function SpacesPage() {
  const { role } = useRole();

  const [selectedOrgId, setSelectedOrgId] = useState<string>("all");
  const [assignUserTarget, setAssignUserTarget] = useState<Entity | null>(null);
  const [editEntityTarget, setEditEntityTarget] = useState<Entity | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mockAssignments, setMockAssignments] = useState<
    Record<string, string[]>
  >({});

  const isUser = role === "User";
  const isSuperAdmin = role === "Super Admin";

  // Derive visible orgs
  const visibleOrgs =
    selectedOrgId === "all"
      ? organizations
      : organizations.filter((o) => o.id === selectedOrgId);

  // For "Admin" role, only their own org can be edited
  function canEditOrg(org: Organization): boolean {
    if (isUser) return false;
    if (isSuperAdmin) return true;
    // Admin: can manage within their own org only (simulated as org-acme)
    return org.id === "org-acme";
  }

  function handleAssignUser(userId: string) {
    if (!assignUserTarget) return;
    setMockAssignments((prev) => {
      const existing = prev[assignUserTarget.id] ?? [];
      if (existing.includes(userId)) return prev;
      return { ...prev, [assignUserTarget.id]: [...existing, userId] };
    });
    setAssignUserTarget(null);
  }

  // For the user picker, compute effective assigned users (mock state + real data)
  function getEffectiveUsers(entityId: string): User[] {
    const base = getUsersForEntity(entityId);
    const extra = (mockAssignments[entityId] ?? [])
      .map((id) => users.find((u) => u.id === id))
      .filter((u): u is User => !!u);
    const seen = new Set(base.map((u) => u.id));
    return [...base, ...extra.filter((u) => !seen.has(u.id))];
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Layers className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Spaces / Entities
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage operational entities within organizations
            </p>
          </div>
        </div>

        {!isUser && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Entity
          </button>
        )}
      </div>

      {/* Role banner */}
      {isUser && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3.5">
          <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              Restricted Access
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              You have read-only access to this section. Contact your
              organization admin to manage entities or assign users.
            </p>
          </div>
        </div>
      )}

      {role === "Admin" && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5">
          <ShieldCheck className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Admin — Limited to Own Organization
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              You can manage entities within{" "}
              <strong>Acme Corp</strong> only. Other organizations are
              read-only.
            </p>
          </div>
        </div>
      )}

      {/* Organization filter tabs */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setSelectedOrgId("all")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            selectedOrgId === "all"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          All Organizations
        </button>
        {organizations.map((org) => (
          <button
            key={org.id}
            onClick={() => setSelectedOrgId(org.id)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              selectedOrgId === org.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {org.name}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Entities
          </p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {entities.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Organizations
          </p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {organizations.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Assigned Users
          </p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {users.filter((u) => u.entity_ids.length > 0).length}
          </p>
        </div>
      </div>

      {/* Organization blocks */}
      <div className="space-y-8">
        {visibleOrgs.map((org) => (
          <OrgBlock
            key={org.id}
            org={org}
            canEdit={canEditOrg(org)}
            onAssignUser={setAssignUserTarget}
            onEditEntity={setEditEntityTarget}
          />
        ))}
      </div>

      {/* Concept callout */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              How Entity Isolation Works
            </h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              Each entity (space) is a fully isolated operational environment.
              Users assigned to <strong>Acme US</strong> can only access
              transactions, invoices, and reports belonging to that entity. They
              have zero visibility into <strong>Acme EU</strong> data, even
              within the same organization. Entity assignment is enforced at the
              API level via row-level scoping.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {assignUserTarget && (
        <UserPickerModal
          entity={assignUserTarget}
          assignedUsers={getEffectiveUsers(assignUserTarget.id)}
          onClose={() => setAssignUserTarget(null)}
          onAssign={handleAssignUser}
        />
      )}

      {editEntityTarget && (
        <EditEntityModal
          entity={editEntityTarget}
          onClose={() => setEditEntityTarget(null)}
        />
      )}

      {showCreateModal && (
        <CreateEntityModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
