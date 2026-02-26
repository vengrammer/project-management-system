


import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";

//  GRAPHQL QUERIES

const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      title
      status
      priority
      startDate
      endDate
      client
      projectManager {
        id
        fullname
      }
    }
  }
`;

const GET_LOGS_BY_PROJECT = gql`
  query GetLogsByProject(
    $projectId: String!
    $startDate: String
    $endDate: String
  ) {
    taskLogsByProject(
      projectId: $projectId
      startDate: $startDate
      endDate: $endDate
    ) {
      id
      content
      status
      createdAt
      task {
        id
        title
        priority
        status
      }
      author {
        id
        fullname
      }
    }
  }
`;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];


const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_STYLE = {
  "not started": "bg-slate-100 text-slate-500",
  "in progress": "bg-blue-100 text-blue-600",
  completed: "bg-green-100 text-green-600",
};

const LOG_STATUS = {
  in_progress: {
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-600",
    label: "In Progress",
  },
  done: {
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-600",
    label: "Done",
  },
  stuck: { dot: "bg-red-500", badge: "bg-red-50 text-red-600", label: "Stuck" },
};

const PRIORITY_BORDER = {
  high: "border-l-red-400",
  medium: "border-l-amber-400",
  low: "border-l-green-400",
};

const PRIORITY_LABEL = {
  high: { bg: "bg-red-50", text: "text-red-500", label: "High" },
  medium: { bg: "bg-amber-50", text: "text-amber-600", label: "Medium" },
  low: { bg: "bg-green-50", text: "text-green-600", label: "Low" },
};

// Accent colors assigned to projects by index
const ACCENTS = [
  {
    ring: "ring-violet-400",
    chip: "bg-violet-500",
    chipHex: "#8B5CF6",
    light: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
  },
  {
    ring: "ring-blue-400",
    chip: "bg-blue-500",
    chipHex: "#3B82F6",
    light: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  {
    ring: "ring-emerald-400",
    chip: "bg-emerald-500",
    chipHex: "#10B981",
    light: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  {
    ring: "ring-amber-400",
    chip: "bg-amber-500",
    chipHex: "#F59E0B",
    light: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  {
    ring: "ring-pink-400",
    chip: "bg-pink-500",
    chipHex: "#EC4899",
    light: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
  },
  {
    ring: "ring-cyan-400",
    chip: "bg-cyan-500",
    chipHex: "#06B6D4",
    light: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
  },
];

function buildYears() {
  const cur = new Date().getFullYear();
  const list = [];
  for (let y = 2020; y <= cur + 5; y++) list.push(y);
  return list;
}


function buildCells(year, month) {
  const firstJsDay = new Date(year, month, 1).getDay();
  const offset = (firstJsDay + 6) % 7; // Mon=0
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevTotal = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = offset - 1; i >= 0; i--) {
    const d = prevTotal - i;
    cells.push({
      day: d,
      month: month === 0 ? 11 : month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ day: d, month, year, isCurrentMonth: true });
  }
  const rem = cells.length % 7;
  if (rem !== 0) {
    for (let i = 1; i <= 7 - rem; i++) {
      cells.push({
        day: i,
        month: month === 11 ? 0 : month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false,
      });
    }
  }
  return cells;
}

function parseCreatedAt(createdAt) {
  if (!createdAt) return new Date();
  // If it's all digits, it's a Unix ms timestamp
  if (/^\d+$/.test(String(createdAt))) {
    return new Date(Number(createdAt));
  }
  // Otherwise try as ISO string
  return new Date(createdAt);
}

// Build lookup key from a date object: "YYYY-M-D"
function dateKey(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// ISO string for first ms of a month — used as startDate param
function monthStart(year, month) {
  return new Date(year, month, 1, 0, 0, 0, 0).toISOString();
}

// ISO string for last ms of a month — used as endDate param
function monthEnd(year, month) {
  return new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();
}

// Parse a date string that might be "January 10, 2025" (locale) or ISO
function parseProjectDate(str) {
  if (!str) return null;
  const d = new Date(str);
  if (!isNaN(d))
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  return null;
}

// ─────────────────────────────────────────────────────────────
//  SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────

function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
  );
}

function ProjectItem({ project, accent, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full text-left px-3 py-2.5 rounded-xl border transition-all duration-150 flex items-center gap-3",
        isSelected
          ? `bg-white shadow-sm ring-2 ${accent.ring} ${accent.border}`
          : "border-transparent hover:bg-white hover:border-slate-200",
      ].join(" ")}
    >
      <span
        className={`w-2.5 h-2.5 rounded-full shrink-0 ${accent.chip}`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {project.title}
        </p>
        <p className="text-[11px] text-slate-400 truncate">
          {project.client ?? "No client"} ·{" "}
          <span
            className={`font-semibold ${
              STATUS_STYLE[project.status ?? "not started"]
            }`}
          >
            {project.status ?? "not started"}
          </span>
        </p>
      </div>
    </button>
  );
}

// ─── DayCell: responsive ─────────────────────────────────────
// Large screen (md+): shows task name chips inside the cell
// Small screen:       shows colored dot + tinted background only
function DayCell({ cell, logs, isToday, isSelected, accent, onClick }) {
  const [hov, setHov] = useState(false);
  const hasLogs = logs.length > 0;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={[
        "border-b border-r border-slate-100 transition-all duration-150 relative select-none",
        // Height: taller on md+ to fit chips, compact on small
        "min-h-13 md:min-h-22.5",
        "p-1 md:p-2",
        !cell.isCurrentMonth
          ? "cursor-default bg-slate-50/50"
          : "cursor-pointer",
        // Selected: blue ring
        isSelected && cell.isCurrentMonth
          ? "ring-2 ring-inset ring-blue-500 bg-blue-50/40 z-10"
          : "",
        // Hover
        hov && cell.isCurrentMonth && !isSelected ? "bg-slate-50" : "",
        // Has logs + not selected: tinted bg with project color (both screen sizes)
        hasLogs && !isSelected && cell.isCurrentMonth ? accent.light : "",
      ].join(" ")}
    >
      {/* Day number */}
      <div
        className={[
          "w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mb-1 transition-colors shrink-0",
          isToday
            ? "bg-blue-600 text-white shadow-sm"
            : isSelected && cell.isCurrentMonth
            ? "bg-blue-500 text-white"
            : hasLogs && cell.isCurrentMonth
            ? `${accent.chip} text-white` // project-colored circle = has logs
            : cell.isCurrentMonth
            ? "text-slate-700"
            : "text-slate-300",
        ].join(" ")}
      >
        {cell.day}
      </div>

      {/* ── LARGE SCREEN ONLY: task name chips ── */}
      {hasLogs && (
        <div className="hidden md:flex flex-col gap-0.5">
          {logs.slice(0, 2).map((log) => (
            <div
              key={log.id}
              title={log.content}
              className={[
                "text-[10px] font-semibold px-1.5 py-0.5 rounded-md truncate",
                "border-l-2 bg-white/80 shadow-sm",
                PRIORITY_BORDER[log.task?.priority] ?? "border-l-slate-300",
                accent.text,
              ].join(" ")}
            >
              {/* Show task title if available, fallback to log content */}
              {log.task?.title ?? log.content}
            </div>
          ))}
          {logs.length > 2 && (
            <span className={`text-[9px] font-bold pl-1 ${accent.text}`}>
              +{logs.length - 2} more
            </span>
          )}
        </div>
      )}

      {/* ── SMALL SCREEN ONLY: activity dot indicator ── */}
      {hasLogs && (
        <span
          className={`md:hidden absolute bottom-1 right-1 w-2 h-2 rounded-full ${accent.chip} shadow-sm`}
        />
      )}

      {/* ── LARGE SCREEN: subtle dot even when chips shown ── */}
      {hasLogs && (
        <span
          className={`hidden md:block absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${accent.chip} opacity-60`}
        />
      )}
    </div>
  );
}

// ─── DayDetail: right panel ──────────────────────────────────
function DayDetail({ selectedDate, logs, loading, project, accent }) {
  if (!selectedDate) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400 text-center px-6">
        <div className="text-4xl mb-3">📅</div>
        <p className="text-sm font-semibold text-slate-600">Select a day</p>
        <p className="text-xs mt-1 leading-relaxed">
          Highlighted days have task log updates. Click one to see details.
        </p>
      </div>
    );
  }

  const { year, month, day } = selectedDate;
  const dayOfWeek = new Date(year, month, day).toLocaleDateString("en-US", {
    weekday: "long",
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Heading */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 shrink-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {dayOfWeek}
        </p>
        <p className="text-lg font-extrabold text-slate-800 leading-tight">
          {MONTH_NAMES[month]} {day}, {year}
        </p>
        {project && (
          <div
            className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${accent.light} ${accent.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${accent.chip}`} />
            {project.title}
          </div>
        )}
      </div>

      {/* Log count bar */}
      <div className="px-4 pt-3 pb-1 shrink-0">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          {loading
            ? "Loading logs…"
            : `${logs.length} log${logs.length !== 1 ? "s" : ""} this day`}
        </p>
      </div>

      {/* Scrollable log list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2.5">
        {/* Loading */}
        {loading &&
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}

        {/* Empty */}
        {!loading && logs.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <div className="text-3xl mb-2">📭</div>
            <p className="text-sm">No task logs for this day</p>
            <p className="text-xs mt-1 text-slate-300">
              Only days with colored circles have logs
            </p>
          </div>
        )}

        {/* Log cards */}
        {!loading &&
          logs.map((log) => {
            const s = LOG_STATUS[log.status] ?? LOG_STATUS.in_progress;
            const p =
              PRIORITY_LABEL[log.task?.priority] ?? PRIORITY_LABEL.medium;
            const time = parseCreatedAt(log.createdAt);

            return (
              <div
                key={log.id}
                className={[
                  "bg-white rounded-xl border border-slate-100 p-3 shadow-sm",
                  "border-l-4",
                  PRIORITY_BORDER[log.task?.priority] ?? "border-l-slate-300",
                ].join(" ")}
              >
                {/* Task title + status */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`}
                    />
                    <span className="text-sm font-bold text-slate-800 truncate">
                      {log.task?.title ?? "Unknown Task"}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${s.badge}`}
                  >
                    {s.label}
                  </span>
                </div>

                {/* Log content */}
                <p className="text-xs text-slate-600 leading-relaxed pl-4 mb-2">
                  {log.content}
                </p>

                {/* Task priority badge */}
                <div className="pl-4 flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.bg} ${p.text}`}
                  >
                    {p.label} priority
                  </span>
                </div>

                {/* Footer: author + time */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-5 h-5 rounded-full ${accent.chip} flex items-center justify-center text-white text-[9px] font-bold`}
                    >
                      {(log.author?.fullname ?? "?")[0].toUpperCase()}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {log.author?.fullname ?? "—"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {time.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function EmployeeDashboard() {
  const today = new Date();
  const years = buildYears();

  const [curYear, setCurYear] = useState(today.getFullYear());
  const [curMonth, setCurMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null); // { day, month, year }
  const [selectedProj, setSelectedProj] = useState(null); // project object

  // ── Fetch all projects ──
  const {
    data: projData,
    loading: projLoading,
    error: projError,
  } = useQuery(GET_PROJECTS);
  const projects = projData?.projects ?? [];

  // Assign a stable accent color per project by index
  const accentMap = useMemo(() => {
    const map = {};
    projects.forEach((p, i) => {
      map[p.id] = ACCENTS[i % ACCENTS.length];
    });
    return map;
  }, [projects]);

  // ── Fetch logs for selected project + visible month ──
  // skip=true means this query won't fire until a project is selected
  const { data: logData, loading: logLoading } = useQuery(GET_LOGS_BY_PROJECT, {
    skip: !selectedProj,
    variables: {
      projectId: selectedProj?.id ?? "",
      startDate: monthStart(curYear, curMonth),
      endDate: monthEnd(curYear, curMonth),
    },
    fetchPolicy: "cache-and-network",
  });

  const allLogs = logData?.taskLogsByProject ?? [];

  // Build "YYYY-M-D" → [logs] map using the fixed parseCreatedAt helper
  const logsByDay = useMemo(() => {
    const map = {};
    allLogs.forEach((log) => {
      const d = parseCreatedAt(log.createdAt);
      const key = dateKey(d);
      (map[key] = map[key] ?? []).push(log);
    });
    return map;
  }, [allLogs]);

  // Logs for the selected day
  const selectedDayLogs = useMemo(() => {
    if (!selectedDay) return [];
    const key = `${selectedDay.year}-${selectedDay.month}-${selectedDay.day}`;
    return logsByDay[key] ?? [];
  }, [selectedDay, logsByDay]);

  // ── Navigation ──
  function navMonth(dir) {
    let m = curMonth + dir,
      y = curYear;
    if (m < 0) {
      m = 11;
      y--;
    }
    if (m > 11) {
      m = 0;
      y++;
    }
    setCurMonth(m);
    setCurYear(y);
    setSelectedDay(null);
  }

  function handleYearChange(e) {
    setCurYear(Number(e.target.value));
    setSelectedDay(null);
  }
  function handleMonthChange(e) {
    setCurMonth(Number(e.target.value));
    setSelectedDay(null);
  }

  function handleProjectClick(project) {
    if (selectedProj?.id === project.id) {
      setSelectedProj(null);
      setSelectedDay(null);
      return;
    }
    setSelectedProj(project);
    setSelectedDay(null);
    // Jump to project start date
    const start = parseProjectDate(project.startDate);
    if (start) {
      setCurYear(start.year);
      setCurMonth(start.month);
    }
  }

  function handleDayClick(cell) {
    if (!cell.isCurrentMonth) return;
    const next = { day: cell.day, month: cell.month, year: cell.year };
    if (
      selectedDay?.day === next.day &&
      selectedDay?.month === next.month &&
      selectedDay?.year === next.year
    ) {
      setSelectedDay(null);
    } else {
      setSelectedDay(next);
    }
  }

  const cells = buildCells(curYear, curMonth);
  const todayKey = dateKey(today);
  const activeAccent = selectedProj
    ? accentMap[selectedProj.id] ?? ACCENTS[0]
    : ACCENTS[0];

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-100 font-sans">
      {/* ── Header ── */}
      <header
        className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3.5
        flex items-center justify-between gap-4 flex-wrap sticky top-0 z-20 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 rounded-full bg-blue-600" />
          <h1 className="text-base md:text-lg font-extrabold tracking-tight text-slate-900">
            Project Calendar
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Year dropdown: loops 2020 → currentYear+5 */}
          <select
            value={curYear}
            onChange={handleYearChange}
            className="border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm font-semibold
              text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Month dropdown: loops all 12 months */}
          <select
            value={curMonth}
            onChange={handleMonthChange}
            className="border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm font-semibold
              text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i} value={i}>
                {name}
              </option>
            ))}
          </select>

          <button
            onClick={() => navMonth(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200
              bg-white text-slate-500 hover:bg-slate-50 transition-colors font-bold text-lg"
          >
            ‹
          </button>
          <button
            onClick={() => navMonth(1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200
              bg-white text-slate-500 hover:bg-slate-50 transition-colors font-bold text-lg"
          >
            ›
          </button>

          <button
            onClick={() => {
              setCurYear(today.getFullYear());
              setCurMonth(today.getMonth());
              setSelectedDay(null);
            }}
            className="px-4 h-9 rounded-lg border border-slate-200 bg-white text-sm font-semibold
              text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Today
          </button>
        </div>
      </header>

      {/* ── Body: 3 columns ── */}
      <div
        className="flex flex-col lg:flex-row"
        style={{ height: "calc(100vh - 57px)" }}
      >
        {/* ════ LEFT: Projects ════ */}
        <aside
          className="w-full lg:w-64 xl:w-72 bg-white border-b lg:border-b-0 lg:border-r
          border-slate-200 flex flex-col shrink-0 overflow-hidden"
        >
          <div className="px-4 pt-4 pb-2 border-b border-slate-100 shrink-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Projects ({projLoading ? "…" : projects.length})
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Click a project to view its logs
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2.5 flex flex-col gap-1">
            {projLoading &&
              [1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            {projError && (
              <p className="text-xs text-red-500 p-3">
                ⚠ Failed to load projects.
              </p>
            )}
            {!projLoading &&
              projects.map((p, idx) => (
                <ProjectItem
                  key={p.id}
                  project={p}
                  accent={accentMap[p.id] ?? ACCENTS[idx % ACCENTS.length]}
                  isSelected={selectedProj?.id === p.id}
                  onClick={() => handleProjectClick(p)}
                />
              ))}
            {!projLoading && projects.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-10">
                No projects found.
              </p>
            )}
          </div>

          {/* Active project info card */}
          {selectedProj && (
            <div
              className={`mx-3 mb-3 p-3 rounded-xl border ${activeAccent.light} ${activeAccent.border} shrink-0`}
            >
              <p
                className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${activeAccent.text}`}
              >
                Active
              </p>
              <p className="text-sm font-bold text-slate-800 truncate">
                {selectedProj.title}
              </p>
              {selectedProj.projectManager && (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  PM: {selectedProj.projectManager.fullname ?? "—"}
                </p>
              )}
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {selectedProj.startDate && (
                  <span className="text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 font-mono">
                    ▶ {selectedProj.startDate}
                  </span>
                )}
                {selectedProj.endDate && (
                  <span className="text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 font-mono">
                    ■ {selectedProj.endDate}
                  </span>
                )}
              </div>
              <span
                className={`mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  STATUS_STYLE[selectedProj.status ?? "not started"]
                }`}
              >
                {selectedProj.status ?? "not started"}
              </span>
            </div>
          )}
        </aside>

        {/* ════ CENTER: Calendar ════ */}
        <main className="flex-1 bg-white flex flex-col min-w-0 overflow-hidden">
          {/* Month header bar */}
          <div className="px-4 md:px-5 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
            <p className="text-base font-extrabold text-slate-800 tracking-tight">
              {MONTH_NAMES[curMonth]}{" "}
              <span className="text-slate-400 font-normal">{curYear}</span>
            </p>
            {!selectedProj && (
              <p className="text-xs text-slate-400 italic hidden sm:block">
                ← Select a project first
              </p>
            )}
            {selectedProj && logLoading && (
              <p className="text-xs text-slate-400 animate-pulse">Loading…</p>
            )}
            {selectedProj && !logLoading && (
              <div className="flex items-center gap-2">
                {/* Legend */}
                <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span
                    className={`w-3 h-3 rounded-full ${activeAccent.chip}`}
                  />
                  <span>= has logs</span>
                </div>
                <p className="text-xs text-slate-500 font-semibold">
                  {allLogs.length} log{allLogs.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 border-b border-slate-100 shrink-0">
            {DAY_LABELS.map((label) => (
              <div
                key={label}
                className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-2"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 flex-1 overflow-y-auto content-start">
            {cells.map((cell, idx) => {
              const key = `${cell.year}-${cell.month}-${cell.day}`;
              const isToday = key === todayKey;
              const isSelected =
                selectedDay?.day === cell.day &&
                selectedDay?.month === cell.month &&
                selectedDay?.year === cell.year;
              const cellLogs =
                cell.isCurrentMonth && selectedProj ? logsByDay[key] ?? [] : [];

              return (
                <DayCell
                  key={idx}
                  cell={cell}
                  logs={cellLogs}
                  isToday={isToday}
                  isSelected={isSelected}
                  accent={activeAccent}
                  onClick={() => handleDayClick(cell)}
                />
              );
            })}
          </div>
        </main>

        {/* ════ RIGHT: Day detail ════ */}
        <aside
          className="w-full lg:w-72 xl:w-80 bg-white border-t lg:border-t-0 lg:border-l
          border-slate-200 flex flex-col shrink-0 overflow-hidden"
        >
          <DayDetail
            selectedDate={selectedDay}
            logs={selectedDayLogs}
            loading={logLoading && !!selectedDay}
            project={selectedProj}
            accent={activeAccent}
          />
        </aside>
      </div>
    </div>
  );
}