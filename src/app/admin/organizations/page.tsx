"use client";

import { useState } from "react";
import { organizations, entities, users, permissionGroups } from "@/lib/mock-data";
import type { Organization } from "@/lib/mock-data";
import { useRole } from "@/components/Sidebar";
import {
  Building2,
  Users,
  Layers,
  ChevronDown,
  Plus,
  Lock,
  AlertTriangle,
  X,
  Calendar,
  CheckCircle2,
  Circle,
} from "lucide-react";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getOrgEntities(orgId: string) {
  return entities.filter((e) => e.organization_id === orgId);
}

function getOrgUsers(orgId: string) {
  return users.filter((u) => u.organization_id === orgId);
}

function getUserGroupNames(groupIds: string[]) {
  return groupIds
    .map((id) => permissionGroups.find((g) => g.id === id)?.name)
    .filter(Boolean)
    .join(", ");
}

// ─────────────────────────────────────────────
// Type badge
// ─────────────────────────────────────────────

function TypeBadge({ type }: { type: Organization["type"] }) {
  if (type === "client") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
        Client
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
      Manager
    </span>
  );
}

// ─────────────────────────────────────────────
// Create Entity placeholder form
// ─────────────────────────────────────────────

function CreateEntityForm({
  orgId,
  onClose,
}: {
  orgId: string;
  onClose: () => void;
}) {
  const [name, setName] = useState("");

  return (
    <div className="mt-4 p-4 bg-white border border-dashed border-gray-300 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">New Entity / Space</h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close form"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-gray-400 mb-3 italic">
        Organization ID: <span className="font-mono text-gray-500">{orgId}</span>
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Entity name (e.g. Acme APAC)"
          className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 placeholder:text-gray-400"
        />
        <button
          className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={!name.trim()}
          onClick={() => {
            // mock — no real action
            onClose();
          }}
        >
          Create
        </button>
      </div>
      <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        Mock UI — no data will be saved
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Organization card
// ─────────────────────────────────────────────

function OrgCard({
  org,
  canManage,
}: {
  org: Organization;
  canManage: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showEntityForm, setShowEntityForm] = useState(false);

  const orgEntities = getOrgEntities(org.id);
  const orgUsers = getOrgUsers(org.id);

  const accentBg = org.type === "client" ? "from-blue-500 to-blue-600" : "from-purple-500 to-purple-600";
  const accentBorder = org.type === "client" ? "border-blue-200 hover:border-blue-400" : "border-purple-200 hover:border-purple-400";
  const accentStat = org.type === "client" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700";

  return (
    <div
      className={`rounded-2xl border-2 bg-white shadow-sm transition-all duration-200 ${accentBorder} ${
        expanded ? "shadow-lg" : "hover:shadow-md"
      }`}
    >
      {/* Card header stripe */}
      <div className={`h-1.5 rounded-t-2xl bg-gradient-to-r ${accentBg}`} />

      {/* Main card content */}
      <div className="p-5">
        {/* Top row: name + type badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${accentBg} flex items-center justify-center shadow-sm`}
            >
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-gray-900 leading-tight truncate">
                {org.name}
              </h3>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{org.id}</p>
            </div>
          </div>
          <TypeBadge type={org.type} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className={`rounded-lg px-3 py-2 text-center ${accentStat}`}>
            <div className="text-xl font-bold">{orgEntities.length}</div>
            <div className="text-xs font-medium opacity-80 flex items-center justify-center gap-1 mt-0.5">
              <Layers className="w-3 h-3" />
              Entities
            </div>
          </div>
          <div className="rounded-lg px-3 py-2 text-center bg-gray-50 text-gray-700">
            <div className="text-xl font-bold">{orgUsers.length}</div>
            <div className="text-xs font-medium opacity-70 flex items-center justify-center gap-1 mt-0.5">
              <Users className="w-3 h-3" />
              Users
            </div>
          </div>
          <div className="rounded-lg px-3 py-2 text-center bg-gray-50 text-gray-700">
            <div className="text-xl font-bold">
              {orgUsers.filter((u) => u.status === "active").length}
            </div>
            <div className="text-xs font-medium opacity-70 flex items-center justify-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              Active
            </div>
          </div>
        </div>

        {/* Created date */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <Calendar className="w-3.5 h-3.5" />
          Created {formatDate(org.created_at)}
        </div>

        {/* Manage button */}
        <button
          onClick={() => {
            setExpanded((v) => !v);
            if (expanded) setShowEntityForm(false);
          }}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
            canManage
              ? org.type === "client"
                ? "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
              : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
          }`}
          disabled={!canManage}
        >
          {canManage ? (
            <>
              Manage
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              />
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              Restricted
            </>
          )}
        </button>
      </div>

      {/* Expanded panel */}
      {expanded && canManage && (
        <div className="border-t border-gray-100 bg-gray-50 rounded-b-2xl px-5 py-5 space-y-5">

          {/* Entities list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Entities / Spaces
              </h4>
              <span className="text-xs text-gray-400">{orgEntities.length} total</span>
            </div>

            {orgEntities.length === 0 ? (
              <p className="text-sm text-gray-400 italic px-3 py-2">No entities found.</p>
            ) : (
              <ul className="space-y-1.5">
                {orgEntities.map((ent) => (
                  <li
                    key={ent.id}
                    className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          org.type === "client" ? "bg-blue-400" : "bg-purple-400"
                        }`}
                      />
                      <span className="font-medium text-gray-800">{ent.name}</span>
                    </div>
                    <span className="text-xs font-mono text-gray-400">{ent.id}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Create new entity */}
            {!showEntityForm ? (
              <button
                onClick={() => setShowEntityForm(true)}
                className={`mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed text-xs font-semibold transition-colors ${
                  org.type === "client"
                    ? "border-blue-300 text-blue-600 hover:bg-blue-50"
                    : "border-purple-300 text-purple-600 hover:bg-purple-50"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Create New Entity
              </button>
            ) : (
              <CreateEntityForm
                orgId={org.id}
                onClose={() => setShowEntityForm(false)}
              />
            )}
          </div>

          {/* Users list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Users
              </h4>
              <span className="text-xs text-gray-400">{orgUsers.length} total</span>
            </div>

            {orgUsers.length === 0 ? (
              <p className="text-sm text-gray-400 italic px-3 py-2">No users found.</p>
            ) : (
              <ul className="space-y-1.5">
                {orgUsers.map((user) => {
                  const groupNames = getUserGroupNames(user.group_ids);
                  return (
                    <li
                      key={user.id}
                      className="bg-white rounded-lg border border-gray-200 px-3 py-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-800 truncate">
                              {user.name}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                user.status === "active"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {user.status === "active" ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <Circle className="w-3 h-3" />
                              )}
                              {user.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{user.email}</p>
                        </div>
                        {groupNames && (
                          <span
                            className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                              org.type === "client"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-purple-50 text-purple-700"
                            }`}
                          >
                            {groupNames}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Create Organization modal / form
// ─────────────────────────────────────────────

function CreateOrgModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<Organization["type"]>("client");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Create Organization</h2>
            <p className="text-xs text-gray-400 mt-0.5">Add a new client or manager organization</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
              Organization Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 placeholder:text-gray-400"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
              Organization Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("client")}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  type === "client"
                    ? "bg-blue-50 border-blue-400 text-blue-700"
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Building2 className="w-4 h-4" />
                Client
              </button>
              <button
                type="button"
                onClick={() => setType("manager")}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  type === "manager"
                    ? "bg-purple-50 border-purple-400 text-purple-700"
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Layers className="w-4 h-4" />
                Manager
              </button>
            </div>
          </div>

          <p className="text-xs text-amber-600 flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            Mock UI — submitting this form will not save any data
          </p>
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!name.trim()}
            onClick={onClose}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              type === "client"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Create Organization
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────

export default function OrganizationsPage() {
  const { role } = useRole();
  const isSuperAdmin = role === "Super Admin";
  const [showCreateModal, setShowCreateModal] = useState(false);

  const clientOrgs = organizations.filter((o) => o.type === "client");
  const managerOrgs = organizations.filter((o) => o.type === "manager");

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Organizations</h1>
          </div>
          <p className="text-sm text-gray-500 ml-4 pl-3">
            Manage client and manager organizations
          </p>
        </div>

        <button
          onClick={() => isSuperAdmin && setShowCreateModal(true)}
          disabled={!isSuperAdmin}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all ${
            isSuperAdmin
              ? "bg-gray-900 text-white hover:bg-gray-700 hover:shadow-md"
              : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
          }`}
          title={!isSuperAdmin ? "Only Super Admins can create organizations" : undefined}
        >
          {isSuperAdmin ? (
            <Plus className="w-4 h-4" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
          Create Organization
        </button>
      </div>

      {/* Restricted access banner */}
      {!isSuperAdmin && (
        <div className="mb-6 flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-xl shadow-sm">
          <Lock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Restricted Access</p>
            <p className="text-xs text-amber-700 mt-0.5">
              You are viewing as <span className="font-semibold">{role}</span>. Only{" "}
              <span className="font-semibold">Super Admins</span> can create organizations or manage
              their contents. Switch your role in the sidebar to unlock these actions.
            </p>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Orgs",
            value: organizations.length,
            bg: "bg-white border border-gray-200",
            text: "text-gray-800",
          },
          {
            label: "Client Orgs",
            value: clientOrgs.length,
            bg: "bg-blue-50 border border-blue-200",
            text: "text-blue-700",
          },
          {
            label: "Manager Orgs",
            value: managerOrgs.length,
            bg: "bg-purple-50 border border-purple-200",
            text: "text-purple-700",
          },
          {
            label: "Total Users",
            value: users.length,
            bg: "bg-gray-50 border border-gray-200",
            text: "text-gray-700",
          },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl px-5 py-4 shadow-sm ${stat.bg}`}>
            <div className={`text-3xl font-bold ${stat.text}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Client organizations section */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Client Organizations
          </h2>
          <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
            {clientOrgs.length}
          </span>
        </div>

        {clientOrgs.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-12 text-center">
            <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No client organizations yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientOrgs.map((org) => (
              <OrgCard key={org.id} org={org} canManage={isSuperAdmin} />
            ))}
          </div>
        )}
      </section>

      {/* Manager organizations section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Manager Organizations
          </h2>
          <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
            {managerOrgs.length}
          </span>
        </div>

        {managerOrgs.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-12 text-center">
            <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No manager organizations yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {managerOrgs.map((org) => (
              <OrgCard key={org.id} org={org} canManage={isSuperAdmin} />
            ))}
          </div>
        )}
      </section>

      {/* Create org modal */}
      {showCreateModal && (
        <CreateOrgModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
