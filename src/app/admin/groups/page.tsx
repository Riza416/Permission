"use client";

import React, { useState } from "react";
import {
  permissionGroups,
  permissions,
  organizations,
  users,
  type PermissionGroup,
  type Permission,
} from "@/lib/mock-data";
import { useRole } from "@/components/Sidebar";
import {
  Crown,
  ChevronDown,
  ChevronUp,
  Plus,
  Lock,
  Users as UsersIcon,
  ShieldAlert,
  Shield,
  X,
  Check,
  FolderKey,
  AlertTriangle,
  Info,
} from "lucide-react";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getOrgName(orgId: string): string {
  return organizations.find((o) => o.id === orgId)?.name ?? orgId;
}

function getPermission(permId: string): Permission | undefined {
  return permissions.find((p) => p.id === permId);
}

function getUsersInGroup(groupId: string) {
  return users.filter((u) => u.group_ids.includes(groupId));
}

// ─────────────────────────────────────────────
// Permission Badge
// ─────────────────────────────────────────────

function PermBadge({ permId }: { permId: string }) {
  const perm = getPermission(permId);
  if (!perm) return null;
  const isManager = perm.scope === "manager";
  return (
    <span
      title={perm.description}
      className={`inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full border ${
        isManager
          ? "bg-violet-50 border-violet-200 text-violet-700"
          : "bg-sky-50 border-sky-200 text-sky-700"
      }`}
    >
      {perm.name}
    </span>
  );
}

// ─────────────────────────────────────────────
// Multi-group membership diagram
// ─────────────────────────────────────────────

function MultiGroupDiagram({ orgId }: { orgId: string }) {
  const orgGroups = permissionGroups.filter((g) => g.organization_id === orgId);
  // Show only users that belong to more than one group in this org
  const multiUsers = users.filter(
    (u) =>
      u.organization_id === orgId &&
      u.group_ids.filter((gid) => orgGroups.some((g) => g.id === gid)).length > 1
  );

  if (multiUsers.length === 0) {
    return (
      <p className="text-xs text-slate-400 italic">
        No users currently belong to multiple groups in this organization.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {multiUsers.map((u) => {
        const memberGroups = orgGroups.filter((g) => u.group_ids.includes(g.id));
        return (
          <div key={u.id} className="flex items-center gap-2 flex-wrap">
            {/* User pill */}
            <span className="inline-flex items-center gap-1.5 bg-slate-700 text-white text-xs font-medium px-3 py-1 rounded-full">
              <UsersIcon className="w-3 h-3" />
              {u.name}
            </span>
            <span className="text-slate-400 text-xs">belongs to</span>
            {memberGroups.map((g, i) => (
              <React.Fragment key={g.id}>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                    g.is_super_admin
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-blue-100 text-blue-800 border border-blue-200"
                  }`}
                >
                  {g.is_super_admin && <Crown className="w-3 h-3" />}
                  {g.name}
                </span>
                {i < memberGroups.length - 1 && (
                  <span className="text-slate-400 text-xs">+</span>
                )}
              </React.Fragment>
            ))}
            <span className="text-slate-400 text-xs ml-1">
              → effective permissions are the{" "}
              <span className="font-semibold text-slate-600">union</span> of all
              groups
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Create Group Modal
// ─────────────────────────────────────────────

interface CreateGroupModalProps {
  onClose: () => void;
}

function CreateGroupModal({ onClose }: CreateGroupModalProps) {
  const [name, setName] = useState("");
  const [orgId, setOrgId] = useState(organizations[0].id);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const orgPerms = permissions.filter((p) => {
    const org = organizations.find((o) => o.id === orgId);
    return org?.type === "manager" ? p.scope === "manager" : p.scope === "client";
  });

  function togglePerm(id: string) {
    setSelectedPerms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Group Created
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            <span className="font-medium text-slate-700">{name || "New Group"}</span> has
            been created for{" "}
            <span className="font-medium text-slate-700">{getOrgName(orgId)}</span> with{" "}
            {selectedPerms.length} permission{selectedPerms.length !== 1 ? "s" : ""}.
          </p>
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-6">
            This is a mock UI — no data has been persisted.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FolderKey className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Create Permission Group
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Group Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Group Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Finance, Compliance, Operations"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Organization */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Organization
            </label>
            <select
              value={orgId}
              onChange={(e) => {
                setOrgId(e.target.value);
                setSelectedPerms([]);
              }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.type})
                </option>
              ))}
            </select>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Permissions{" "}
              <span className="text-slate-400 font-normal normal-case">
                ({selectedPerms.length} selected)
              </span>
            </label>
            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
              {orgPerms.map((perm) => {
                const checked = selectedPerms.includes(perm.id);
                return (
                  <label
                    key={perm.id}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      checked ? "bg-blue-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePerm(perm.id)}
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-mono text-slate-800 leading-tight">
                        {perm.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {perm.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Note about Super Admin */}
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Super Admin groups are system-protected and cannot be created
              manually. Each organization has exactly one Super Admin group that
              holds all permissions for its type.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => name.trim() && setSubmitted(true)}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Edit Permissions Modal
// ─────────────────────────────────────────────

interface EditPermsModalProps {
  group: PermissionGroup;
  onClose: () => void;
}

function EditPermsModal({ group, onClose }: EditPermsModalProps) {
  const org = organizations.find((o) => o.id === group.organization_id);
  const orgPerms = permissions.filter((p) =>
    org?.type === "manager" ? p.scope === "manager" : p.scope === "client"
  );
  const [selected, setSelected] = useState<string[]>(group.permission_ids);
  const [saved, setSaved] = useState(false);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  if (saved) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Permissions Updated
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            <span className="font-medium text-slate-700">{group.name}</span> now
            has {selected.length} permission{selected.length !== 1 ? "s" : ""}.
            Changes take effect immediately for all members.
          </p>
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-6">
            This is a mock UI — no data has been persisted.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Edit Permissions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {group.name} &middot; {getOrgName(group.organization_id)}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
            {orgPerms.map((perm) => {
              const checked = selected.includes(perm.id);
              return (
                <label
                  key={perm.id}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    checked ? "bg-blue-50" : "hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(perm.id)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-sm font-mono text-slate-800 leading-tight">
                      {perm.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {perm.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            {selected.length} of {orgPerms.length} permissions selected
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setSaved(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Add User Modal
// ─────────────────────────────────────────────

interface AddUserModalProps {
  group: PermissionGroup;
  onClose: () => void;
}

function AddUserModal({ group, onClose }: AddUserModalProps) {
  const orgUsers = users.filter((u) => u.organization_id === group.organization_id);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [saved, setSaved] = useState(false);

  const selectedUser = orgUsers.find((u) => u.id === selectedUserId);

  if (saved && selectedUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">User Added</h3>
          <p className="text-sm text-slate-500 mb-6">
            <span className="font-medium text-slate-700">{selectedUser.name}</span> has
            been added to <span className="font-medium text-slate-700">{group.name}</span>.
          </p>
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-6">
            This is a mock UI — no data has been persisted.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Add User to Group</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {group.name} &middot; {getOrgName(group.organization_id)}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Select User
            </label>
            <div className="space-y-2">
              {orgUsers.map((u) => {
                const alreadyMember = u.group_ids.includes(group.id);
                return (
                  <label
                    key={u.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                      alreadyMember
                        ? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                        : selectedUserId === u.id
                        ? "border-blue-400 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="user"
                      value={u.id}
                      disabled={alreadyMember}
                      checked={selectedUserId === u.id}
                      onChange={() => setSelectedUserId(u.id)}
                      className="text-blue-600"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {u.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{u.email}</p>
                    </div>
                    {alreadyMember && (
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        Already a member
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedUserId && setSaved(true)}
              disabled={!selectedUserId}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Add User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Group Card
// ─────────────────────────────────────────────

interface GroupCardProps {
  group: PermissionGroup;
  canModify: boolean;
}

function GroupCard({ group, canModify }: GroupCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showEditPerms, setShowEditPerms] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);

  const groupUsers = getUsersInGroup(group.id);
  const orgName = getOrgName(group.organization_id);
  const isSuperAdmin = group.is_super_admin;

  return (
    <>
      {showEditPerms && (
        <EditPermsModal group={group} onClose={() => setShowEditPerms(false)} />
      )}
      {showAddUser && (
        <AddUserModal group={group} onClose={() => setShowAddUser(false)} />
      )}

      <div
        className={`bg-white rounded-xl shadow-sm flex flex-col overflow-hidden transition-all duration-200 ${
          isSuperAdmin
            ? "border-2 border-amber-400 ring-1 ring-amber-200"
            : "border border-slate-200"
        }`}
      >
        {/* Super Admin ribbon */}
        {isSuperAdmin && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">
              System-protected &mdash; exactly one per organization
            </span>
          </div>
        )}

        {/* Card body */}
        <div className="px-5 py-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {isSuperAdmin ? (
                <Crown className="w-5 h-5 text-amber-500 flex-shrink-0" />
              ) : (
                <Shield className="w-5 h-5 text-blue-500 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 leading-tight truncate">
                  {group.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{orgName}</p>
              </div>
            </div>

            {/* Expand button */}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors flex-shrink-0 mt-0.5"
            >
              {expanded ? (
                <>
                  Collapse <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  Expand <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center">
                <Lock className="w-3 h-3 text-blue-600" />
              </div>
              <span>
                <span className="font-semibold text-slate-900">
                  {group.permission_ids.length}
                </span>{" "}
                permission{group.permission_ids.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <div className="w-5 h-5 rounded-md bg-green-100 flex items-center justify-center">
                <UsersIcon className="w-3 h-3 text-green-600" />
              </div>
              <span>
                <span className="font-semibold text-slate-900">
                  {groupUsers.length}
                </span>{" "}
                user{groupUsers.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Expanded panel */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            expanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-slate-100 px-5 py-4 space-y-5">
            {/* Permissions */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Permissions
              </p>
              {group.permission_ids.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {group.permission_ids.map((pid) => (
                    <PermBadge key={pid} permId={pid} />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No permissions assigned</p>
              )}
            </div>

            {/* Users */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Members
              </p>
              {groupUsers.length > 0 ? (
                <div className="space-y-1.5">
                  {groupUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-2 text-xs text-slate-700"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                          u.status === "active" ? "bg-blue-500" : "bg-slate-400"
                        }`}
                      >
                        {u.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium truncate">{u.name}</span>
                        <span className="text-slate-400 ml-1.5 truncate">
                          {u.email}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full ${
                          u.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {u.status}
                      </span>
                      {u.group_ids.length > 1 && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 flex-shrink-0">
                          +{u.group_ids.length - 1} other group
                          {u.group_ids.length - 1 !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No users in this group</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              {canModify && !isSuperAdmin ? (
                <>
                  <button
                    onClick={() => setShowEditPerms(true)}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <Lock className="w-3 h-3" />
                    Edit Permissions
                  </button>
                  <button
                    onClick={() => setShowAddUser(true)}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add User
                  </button>
                </>
              ) : isSuperAdmin ? (
                <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                  <Lock className="w-3 h-3 text-amber-500" />
                  {canModify
                    ? "Super Admin groups cannot be modified"
                    : "You don't have permission to modify this group"}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                  <Lock className="w-3 h-3" />
                  Read-only — Admin role required to edit
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ───────────────────────────────────────���─────

export default function GroupsPage() {
  const { role } = useRole();
  const [filterOrg, setFilterOrg] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);

  const isUser = role === "User";
  const canModify = role === "Super Admin" || role === "Admin";

  const filteredGroups =
    filterOrg === "all"
      ? permissionGroups
      : permissionGroups.filter((g) => g.organization_id === filterOrg);

  // Determine which org to show the diagram for
  const diagramOrgId =
    filterOrg !== "all" ? filterOrg : organizations[0].id;

  return (
    <>
      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} />}

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Permission Groups
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Create and manage permission groups for organizations
            </p>
          </div>
          {!isUser && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              Create Group
            </button>
          )}
        </div>

        {/* Restricted banner for User role */}
        {isUser && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                Restricted Access
              </p>
              <p className="text-sm text-red-600 mt-0.5">
                You are viewing as <span className="font-medium">User</span>.
                Permission group management requires Admin or Super Admin role.
                You can view groups but cannot create, edit, or modify them.
              </p>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500" />
            <span>Super Admin group (gold border)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-sky-300 border border-sky-400" />
            <span>Client-scope permission</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-violet-300 border border-violet-400" />
            <span>Manager-scope permission</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-purple-300 border border-purple-400" />
            <span>User belongs to multiple groups</span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Filter by organization
          </label>
          <select
            value={filterOrg}
            onChange={(e) => setFilterOrg(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Organizations</option>
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-400">
            {filteredGroups.length} group{filteredGroups.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Groups Grid */}
        {filteredGroups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredGroups.map((g) => (
              <GroupCard key={g.id} group={g} canModify={canModify} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <FolderKey className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No groups found</p>
            <p className="text-xs mt-1">Try changing the organization filter</p>
          </div>
        )}

        {/* Multi-group membership diagram */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-semibold text-slate-900">
              Multi-Group Membership
            </h2>
            <span className="text-xs text-slate-400 font-normal">
              — a user can belong to multiple groups; their effective permissions
              are the union of all assigned groups
            </span>
          </div>

          {filterOrg !== "all" ? (
            <MultiGroupDiagram orgId={filterOrg} />
          ) : (
            <div className="space-y-4">
              {organizations.map((org) => (
                <div key={org.id}>
                  <p className="text-xs font-medium text-slate-500 mb-2">
                    {org.name}
                  </p>
                  <MultiGroupDiagram orgId={org.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
