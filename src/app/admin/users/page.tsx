"use client";

import { useState } from "react";
import {
  users,
  organizations,
  permissionGroups,
  entities,
  User,
} from "@/lib/mock-data";
import { useRole } from "@/components/Sidebar";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getOrganizationName(orgId: string) {
  return organizations.find((o) => o.id === orgId)?.name ?? orgId;
}

function getGroupsForUser(groupIds: string[]) {
  return permissionGroups.filter((g) => groupIds.includes(g.id));
}

function getEntitiesForUser(entityIds: string[]) {
  return entities.filter((e) => entityIds.includes(e.id));
}

// ─────────────────────────────────────────────
// Create User Modal
// ─────────────────────────────────────────────

interface CreateUserFormData {
  name: string;
  email: string;
  user_type: "client" | "manager";
  organization_id: string;
  group_ids: string[];
  entity_ids: string[];
}

function CreateUserModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<CreateUserFormData>({
    name: "",
    email: "",
    user_type: "client",
    organization_id: organizations[0]?.id ?? "",
    group_ids: [],
    entity_ids: [],
  });

  const availableGroups = permissionGroups.filter(
    (g) => g.organization_id === form.organization_id
  );
  const availableEntities = entities.filter(
    (e) => e.organization_id === form.organization_id
  );

  function toggleGroupId(id: string) {
    setForm((prev) => ({
      ...prev,
      group_ids: prev.group_ids.includes(id)
        ? prev.group_ids.filter((g) => g !== id)
        : [...prev.group_ids, id],
    }));
  }

  function toggleEntityId(id: string) {
    setForm((prev) => ({
      ...prev,
      entity_ids: prev.entity_ids.includes(id)
        ? prev.entity_ids.filter((e) => e !== id)
        : [...prev.entity_ids, id],
    }));
  }

  function handleOrgChange(orgId: string) {
    setForm((prev) => ({
      ...prev,
      organization_id: orgId,
      group_ids: [],
      entity_ids: [],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Mock: just close
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Create User</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Add a new user and assign access
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Jane Doe"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="e.g. jane@acmecorp.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* User Type + Organization row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                User Type
              </label>
              <select
                value={form.user_type}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    user_type: e.target.value as "client" | "manager",
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="client">Client</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Organization
              </label>
              <select
                value={form.organization_id}
                onChange={(e) => handleOrgChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Groups multi-select */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Permission Groups
            </label>
            {availableGroups.length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                No groups for selected organization
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableGroups.map((g) => {
                  const selected = form.group_ids.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleGroupId(g.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selected
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"
                      }`}
                    >
                      {selected && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {g.name}
                      {g.is_super_admin && (
                        <span className="ml-0.5 text-yellow-300">★</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Entities multi-select */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Entities / Spaces
            </label>
            {availableEntities.length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                No entities for selected organization
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableEntities.map((ent) => {
                  const selected = form.entity_ids.includes(ent.id);
                  return (
                    <button
                      key={ent.id}
                      type="button"
                      onClick={() => toggleEntityId(ent.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selected
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-gray-600 border-gray-300 hover:border-emerald-400 hover:text-emerald-600"
                      }`}
                    >
                      {selected && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {ent.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Action button
// ─────────────────────────────────────────────

function ActionButton({
  label,
  onClick,
  disabled,
  variant = "default",
}: {
  label: string;
  onClick?: () => void;
  disabled: boolean;
  variant?: "default" | "danger";
}) {
  const base =
    "px-2.5 py-1 rounded-md text-xs font-medium transition-colors border";
  const active =
    variant === "danger"
      ? "text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
      : "text-gray-600 border-gray-200 bg-white hover:bg-gray-50";
  const disabledCls = "text-gray-300 border-gray-100 bg-gray-50 cursor-not-allowed";

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${base} ${disabled ? disabledCls : active}`}
    >
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────
// User row
// ─────────────────────────────────────────────

function UserRow({
  user,
  isEven,
  actionsDisabled,
}: {
  user: User;
  isEven: boolean;
  actionsDisabled: boolean;
}) {
  const org = getOrganizationName(user.organization_id);
  const groups = getGroupsForUser(user.group_ids);
  const userEntities = getEntitiesForUser(user.entity_ids);

  return (
    <tr className={isEven ? "bg-gray-50" : "bg-white"}>
      {/* Name */}
      <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
        {user.name}
      </td>

      {/* Email */}
      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
        {user.email}
      </td>

      {/* User Type */}
      <td className="px-4 py-3 whitespace-nowrap">
        {user.user_type === "client" ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
            Client
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
            Manager
          </span>
        )}
      </td>

      {/* Organization */}
      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
        {org}
      </td>

      {/* Groups */}
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {groups.length === 0 ? (
            <span className="text-xs text-gray-400 italic">None</span>
          ) : (
            groups.map((g) => (
              <span
                key={g.id}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${
                  g.is_super_admin
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {g.is_super_admin && <span className="text-amber-500">★</span>}
                {g.name}
              </span>
            ))
          )}
        </div>
      </td>

      {/* Entities */}
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {userEntities.length === 0 ? (
            <span className="text-xs text-gray-400 italic">None</span>
          ) : (
            userEntities.map((ent) => (
              <span
                key={ent.id}
                className="inline-block px-1.5 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200"
              >
                {ent.name}
              </span>
            ))
          )}
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
            user.status === "active" ? "text-emerald-700" : "text-red-600"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              user.status === "active" ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          {user.status === "active" ? "Active" : "Inactive"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <ActionButton label="Edit" disabled={actionsDisabled} />
          <ActionButton label="Reset Password" disabled={actionsDisabled} />
          <ActionButton label="Reset 2FA" disabled={actionsDisabled} />
          <ActionButton
            label={user.status === "active" ? "Deactivate" : "Activate"}
            disabled={actionsDisabled}
            variant="danger"
          />
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────

export default function UsersPage() {
  const { role } = useRole();

  const [filterOrg, setFilterOrg] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isUser = role === "User";
  const isAdmin = role === "Admin";

  // For the "Admin" mock: treat org-acme as the admin's own org
  const adminOwnOrg = "org-acme";

  const filteredUsers = users.filter((u) => {
    if (filterOrg !== "all" && u.organization_id !== filterOrg) return false;
    if (filterType !== "all" && u.user_type !== filterType) return false;
    if (filterStatus !== "all" && u.status !== filterStatus) return false;
    return true;
  });

  // For Admin: "Create User" is visually disabled for users outside own org
  const createButtonDisabled =
    isUser ||
    (isAdmin && filterOrg !== "all" && filterOrg !== adminOwnOrg);

  const createButtonTitle = isUser
    ? "Insufficient permissions"
    : isAdmin && filterOrg !== "all" && filterOrg !== adminOwnOrg
    ? "Admins can only create users within their own organization"
    : undefined;

  return (
    <div className="max-w-full pb-20">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              User Management
            </h1>
          </div>
          <p className="text-sm text-gray-500 ml-4 pl-3">
            Manage users, assign groups, and control access
          </p>
        </div>

        <button
          onClick={() => !createButtonDisabled && setShowCreateModal(true)}
          disabled={createButtonDisabled}
          title={createButtonTitle}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            createButtonDisabled
              ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create User
        </button>
      </div>

      {/* Restricted access banner */}
      {isUser && (
        <div className="mb-5 flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-700">Restricted Access</p>
            <p className="text-xs text-red-600 mt-0.5">
              Your current role (<strong>User</strong>) does not have permission to manage users
              or perform administrative actions. Contact your administrator.
            </p>
          </div>
        </div>
      )}

      {/* Admin notice */}
      {isAdmin && (
        <div className="mb-5 flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-700">Admin Access</p>
            <p className="text-xs text-amber-600 mt-0.5">
              You can manage users within <strong>Acme Corp</strong> (your organization). Creating
              users in other organizations is restricted.
            </p>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">
          Filters
        </span>

        {/* Organization filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">Org</label>
          <select
            value={filterOrg}
            onChange={(e) => setFilterOrg(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Organizations</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        {/* User type filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Types</option>
            <option value="client">Client</option>
            <option value="manager">Manager</option>
          </select>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Result count */}
        <span className="ml-auto text-xs text-gray-400 font-medium">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
        </span>

        {/* Clear filters */}
        {(filterOrg !== "all" || filterType !== "all" || filterStatus !== "all") && (
          <button
            onClick={() => {
              setFilterOrg("all");
              setFilterType("all");
              setFilterStatus("all");
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Name
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Email
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Type
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Organization
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Groups
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Entities
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium">No users match the current filters</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isEven={index % 2 !== 0}
                    actionsDisabled={isUser}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {filteredUsers.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Showing {filteredUsers.length} of {users.length} users
            </span>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Client
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Manager
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Active
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Inactive
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-amber-500">★</span>
                Super Admin group
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
