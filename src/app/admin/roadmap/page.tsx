"use client";

import { useState } from "react";
import { tickets, Ticket } from "@/lib/mock-data";

// ─────────────────────────────────────────────
// Phase configuration
// ─────────────────────────────────────────────

const phases = [
  {
    id: 1,
    label: "Phase 1",
    name: "Foundation",
    ticketIds: ["RBAC-1", "RBAC-2", "RBAC-3"],
    color: {
      section: "bg-blue-50 border-blue-200",
      header: "bg-blue-600",
      badge: "bg-blue-600 text-white",
      ring: "ring-blue-300",
      dot: "bg-blue-500",
      connector: "border-blue-300",
      priorityBg: "bg-blue-600",
      cardBorder: "border-blue-200 hover:border-blue-400",
      tagBg: "bg-blue-100 text-blue-700",
    },
  },
  {
    id: 2,
    label: "Phase 2",
    name: "Permissions Core",
    ticketIds: ["RBAC-4", "RBAC-5", "RBAC-6"],
    color: {
      section: "bg-purple-50 border-purple-200",
      header: "bg-purple-600",
      badge: "bg-purple-600 text-white",
      ring: "ring-purple-300",
      dot: "bg-purple-500",
      connector: "border-purple-300",
      priorityBg: "bg-purple-600",
      cardBorder: "border-purple-200 hover:border-purple-400",
      tagBg: "bg-purple-100 text-purple-700",
    },
  },
  {
    id: 3,
    label: "Phase 3",
    name: "Enforcement",
    ticketIds: ["RBAC-7", "RBAC-8"],
    color: {
      section: "bg-amber-50 border-amber-200",
      header: "bg-amber-600",
      badge: "bg-amber-600 text-white",
      ring: "ring-amber-300",
      dot: "bg-amber-500",
      connector: "border-amber-300",
      priorityBg: "bg-amber-600",
      cardBorder: "border-amber-200 hover:border-amber-400",
      tagBg: "bg-amber-100 text-amber-700",
    },
  },
  {
    id: 4,
    label: "Phase 4",
    name: "Operations",
    ticketIds: ["RBAC-9", "RBAC-10", "RBAC-11"],
    color: {
      section: "bg-emerald-50 border-emerald-200",
      header: "bg-emerald-600",
      badge: "bg-emerald-600 text-white",
      ring: "ring-emerald-300",
      dot: "bg-emerald-500",
      connector: "border-emerald-300",
      priorityBg: "bg-emerald-600",
      cardBorder: "border-emerald-200 hover:border-emerald-400",
      tagBg: "bg-emerald-100 text-emerald-700",
    },
  },
  {
    id: 5,
    label: "Phase 5",
    name: "Custody Wallets",
    ticketIds: ["RBAC-12", "RBAC-13", "RBAC-14", "RBAC-15"],
    color: {
      section: "bg-rose-50 border-rose-200",
      header: "bg-rose-600",
      badge: "bg-rose-600 text-white",
      ring: "ring-rose-300",
      dot: "bg-rose-500",
      connector: "border-rose-300",
      priorityBg: "bg-rose-600",
      cardBorder: "border-rose-200 hover:border-rose-400",
      tagBg: "bg-rose-100 text-rose-700",
    },
  },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getStatusStyle(status: Ticket["status"]) {
  switch (status) {
    case "done":
      return {
        bg: "bg-emerald-100 text-emerald-700 border border-emerald-300",
        dot: "bg-emerald-500",
        label: "Done",
      };
    case "in-progress":
      return {
        bg: "bg-blue-100 text-blue-700 border border-blue-300",
        dot: "bg-blue-500",
        label: "In Progress",
      };
    default:
      return {
        bg: "bg-gray-100 text-gray-500 border border-gray-300",
        dot: "bg-gray-400",
        label: "Not Started",
      };
  }
}

function getPhaseForTicket(ticketId: string) {
  return phases.find((p) => p.ticketIds.includes(ticketId));
}

// ─────────────────────────────────────────────
// TicketCard component
// ─────────────────────────────────────────────

function TicketCard({
  ticket,
  phaseColor,
  isLast,
}: {
  ticket: Ticket;
  phaseColor: (typeof phases)[0]["color"];
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const status = getStatusStyle(ticket.status);

  return (
    <div className="relative flex flex-col items-center w-full">
      {/* Card */}
      <div
        className={`w-full rounded-xl border-2 bg-white shadow-sm transition-all duration-200 cursor-pointer select-none ${phaseColor.cardBorder} ${expanded ? "shadow-lg" : "hover:shadow-md"}`}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Card header row */}
        <div className="flex items-start gap-3 p-4">
          {/* Priority badge */}
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm ${phaseColor.priorityBg}`}
          >
            {ticket.priority}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-wider">
                  {ticket.id}
                </span>
                {ticket.featureFlag && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-300">
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 6a3 3 0 013-3h10l-1.5 2L16 7H6a1 1 0 00-1 1v7a1 1 0 001 1H3V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Feature Flag
                  </span>
                )}
              </div>
              {/* Status badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                />
                {status.label}
              </span>
            </div>

            <h3 className="mt-1 text-sm font-semibold text-gray-800 leading-tight">
              {ticket.title}
            </h3>

            <p className="mt-1 text-xs text-gray-500 leading-relaxed line-clamp-2">
              {ticket.description}
            </p>

            {/* Dependencies */}
            {ticket.dependencies.length > 0 && (
              <div className="mt-2 flex items-center flex-wrap gap-1">
                <span className="text-xs text-gray-400 font-medium mr-1">
                  Depends on:
                </span>
                {ticket.dependencies.map((dep) => {
                  const depPhase = getPhaseForTicket(dep);
                  return (
                    <span
                      key={dep}
                      className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold border ${depPhase ? depPhase.color.tagBg : "bg-gray-100 text-gray-600"}`}
                    >
                      {dep}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Expand chevron */}
          <div className="flex-shrink-0 mt-1">
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Expanded detail panel */}
        {expanded && (
          <div className="border-t border-gray-100 px-4 py-4 bg-gray-50 rounded-b-xl space-y-4">
            {/* User Story */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                User Story
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed italic bg-white border border-gray-200 rounded-lg px-3 py-2">
                &ldquo;{ticket.userStory}&rdquo;
              </p>
            </div>

            {/* Definition of Done */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Definition of Done
              </h4>
              <ul className="space-y-1.5">
                {ticket.definitionOfDone.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg
                      className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Vertical connector arrow to next ticket (within same phase) */}
      {!isLast && (
        <div className="flex flex-col items-center my-1">
          <div className={`w-0.5 h-5 border-l-2 border-dashed ${phaseColor.connector}`} />
          <svg
            className={`w-3 h-3 -mt-1`}
            viewBox="0 0 12 12"
            fill="currentColor"
          >
            <path
              d="M6 9L1 3h10z"
              className={phaseColor.dot.replace("bg-", "fill-").replace("text-", "fill-")}
            />
          </svg>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Phase connector (between phases)
// ─────────────────────────────────────────────

function PhaseConnector({ fromColor, toColor }: { fromColor: string; toColor: string }) {
  return (
    <div className="flex flex-col items-center py-2">
      <div className={`w-px h-6 bg-gradient-to-b ${fromColor} ${toColor}`} />
      <div className="flex items-center gap-2 my-1">
        <div className="h-px w-12 border-t-2 border-dashed border-gray-300" />
        <span className="text-xs text-gray-400 font-medium px-2 py-0.5 bg-white border border-gray-200 rounded-full shadow-sm">
          next phase
        </span>
        <div className="h-px w-12 border-t-2 border-dashed border-gray-300" />
      </div>
      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 12L2 5h12z" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────
// Legend
// ─────────────────────────────────────────────

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-gray-400" />
        Not Started
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-blue-500" />
        In Progress
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Done
      </div>
      <div className="w-px h-4 bg-gray-200 mx-1" />
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-300">
          <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10l-1.5 2L16 7H6a1 1 0 00-1 1v7a1 1 0 001 1H3V6z" clipRule="evenodd" />
          </svg>
          Feature Flag
        </span>
        Gated by feature flag
      </div>
      <div className="w-px h-4 bg-gray-200 mx-1" />
      <div className="flex items-center gap-1.5">
        <div className="w-6 border-t-2 border-dashed border-gray-400" />
        Dependency flow
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-gray-400 font-medium">Click card</span>
        to expand details
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Stats bar
// ─────────────────────────────────────────────

function StatsBar() {
  const total = tickets.length;
  const done = tickets.filter((t) => t.status === "done").length;
  const inProgress = tickets.filter((t) => t.status === "in-progress").length;
  const notStarted = tickets.filter((t) => t.status === "not-started").length;
  const flagged = tickets.filter((t) => t.featureFlag).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      {[
        { label: "Total Tickets", value: total, color: "text-gray-800", bg: "bg-white border border-gray-200" },
        { label: "Not Started", value: notStarted, color: "text-gray-600", bg: "bg-gray-50 border border-gray-200" },
        { label: "In Progress", value: inProgress, color: "text-blue-600", bg: "bg-blue-50 border border-blue-200" },
        { label: "Done", value: done, color: "text-emerald-600", bg: "bg-emerald-50 border border-emerald-200" },
      ].map((stat) => (
        <div key={stat.label} className={`rounded-xl px-5 py-4 shadow-sm ${stat.bg}`}>
          <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
          <div className="text-xs text-gray-500 mt-0.5 font-medium">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────

export default function RoadmapPage() {
  const sortedTickets = [...tickets].sort((a, b) => a.priority - b.priority);

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-500 via-purple-500 to-emerald-500" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Implementation Roadmap
          </h1>
        </div>
        <p className="text-sm text-gray-500 ml-4 pl-3">
          RBAC ticket sequencing by dependency order
        </p>
      </div>

      {/* Stats */}
      <StatsBar />

      {/* Legend */}
      <div className="mb-8 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm">
        <Legend />
      </div>

      {/* Phases */}
      <div className="space-y-2">
        {phases.map((phase, phaseIndex) => {
          const phaseTickets = sortedTickets.filter((t) =>
            phase.ticketIds.includes(t.id)
          );
          const isLastPhase = phaseIndex === phases.length - 1;

          return (
            <div key={phase.id}>
              {/* Phase section */}
              <div className={`rounded-2xl border-2 ${phase.color.section} overflow-hidden shadow-sm`}>
                {/* Phase header */}
                <div className={`${phase.color.header} px-5 py-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold text-sm uppercase tracking-widest opacity-80">
                      {phase.label}
                    </span>
                    <span className="text-white font-bold text-base">
                      {phase.name}
                    </span>
                  </div>
                  <span className="text-white text-xs font-medium opacity-70 bg-white/20 px-2.5 py-1 rounded-full">
                    {phaseTickets.length} ticket{phaseTickets.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Tickets */}
                <div className="p-4 space-y-0">
                  {phaseTickets.map((ticket, i) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      phaseColor={phase.color}
                      isLast={i === phaseTickets.length - 1}
                    />
                  ))}
                </div>
              </div>

              {/* Phase-to-phase connector */}
              {!isLastPhase && (
                <PhaseConnector
                  fromColor={phase.color.dot}
                  toColor={phases[phaseIndex + 1].color.dot}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="mt-10 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 flex items-start gap-2">
        <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          Tickets within each phase must be completed before the next phase can begin. Dependency badges reference the ticket IDs that must be done first. Feature-flagged tickets can be deployed to production but remain inactive until the flag is enabled.
        </span>
      </div>
    </div>
  );
}
