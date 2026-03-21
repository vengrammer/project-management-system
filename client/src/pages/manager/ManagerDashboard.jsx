import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

//  GRAPHQL QUERIES
const GET_PROJECTS = gql`
  query ProjectsByManager($projectsByManagerId: ID) {
    projectsByManager(id: $projectsByManagerId) {
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
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_STYLE = {
  "not started": "bg-slate-100 text-slate-500",
  "in progress": "bg-blue-100 text-blue-600",
  completed: "bg-green-100 text-green-600",
};

const LOG_STATUS = {
  in_progress: { dot: "bg-blue-500", badge: "bg-blue-50 text-blue-600", label: "In Progress" },
  done: { dot: "bg-green-500", badge: "bg-green-50 text-green-600", label: "Done" },
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

const ACCENTS = [
  { ring: "ring-violet-400", chip: "bg-violet-500", chipHex: "#8B5CF6", light: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  { ring: "ring-blue-400", chip: "bg-blue-500", chipHex: "#3B82F6", light: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  { ring: "ring-emerald-400", chip: "bg-emerald-500", chipHex: "#10B981", light: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  { ring: "ring-amber-400", chip: "bg-amber-500", chipHex: "#F59E0B", light: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  { ring: "ring-pink-400", chip: "bg-pink-500", chipHex: "#EC4899", light: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
  { ring: "ring-cyan-400", chip: "bg-cyan-500", chipHex: "#06B6D4", light: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
];

function buildYears() {
  const cur = new Date().getFullYear();
  const list = [];
  for (let y = 2020; y <= cur + 5; y++) list.push(y);
  return list;
}

function buildCells(year, month) {
  const firstJsDay = new Date(year, month, 1).getDay();
  const offset = (firstJsDay + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevTotal = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = offset - 1; i >= 0; i--) {
    const d = prevTotal - i;
    cells.push({ day: d, month: month === 0 ? 11 : month - 1, year: month === 0 ? year - 1 : year, isCurrentMonth: false });
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ day: d, month, year, isCurrentMonth: true });
  }
  const rem = cells.length % 7;
  if (rem !== 0) {
    for (let i = 1; i <= 7 - rem; i++) {
      cells.push({ day: i, month: month === 11 ? 0 : month + 1, year: month === 11 ? year + 1 : year, isCurrentMonth: false });
    }
  }
  return cells;
}

function parseCreatedAt(createdAt) {
  if (!createdAt) return new Date();
  if (/^\d+$/.test(String(createdAt))) return new Date(Number(createdAt));
  return new Date(createdAt);
}

function dateKey(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function monthStart(year, month) {
  return new Date(year, month, 1, 0, 0, 0, 0).toISOString();
}

function monthEnd(year, month) {
  return new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();
}

function parseProjectDate(str) {
  if (!str) return null;
  const d = new Date(str);
  if (!isNaN(d)) return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  return null;
}

// ── SUB-COMPONENTS ──────────────────────────────────────────

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-slate-200 dark:bg-[#2e3545] rounded-xl ${className}`} />;
}


//date format
//date format
function formatTimeAgo(value) {
  if (!value) return "";
  const now = new Date();
  const date = new Date(Number(value));
  const diffMs = now - date;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks <= 2) return `${weeks}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ProjectItem({ project, accent, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full text-left px-3 py-2.5 rounded-xl border-3 transition-all duration-150 flex items-center gap-3 cursor-pointer",
        isSelected
          ? `bg-white dark:bg-[#1a1f2b] shadow-sm ring-2 ${accent.ring} ${accent.border} dark:border-transparent`
          : "border-gray-200 dark:border-[#2a3040] hover:bg-white dark:hover:bg-[#252d3d] hover:border-gray-300",
      ].join(" ")}
    >
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${accent.chip}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
          {project.title}
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
          {project.client ?? "No client"} ·{" "}
          <span className={`font-semibold ${STATUS_STYLE[project.status ?? "not started"]}`}>
            {project.status ?? "not started"}
          </span>
          {project.status != "completed" && project.endDate &&
            (() => {
              const today = new Date();
              const dueDate = new Date(project.endDate);
              today.setHours(0, 0, 0, 0);
              dueDate.setHours(0, 0, 0, 0);
              return dueDate < today;
            })() && (
              <span className="ml-2 text-red-500 font-semibold">Overdue</span>
            )}
        </p>
      </div>
    </button>
  );
}

function DayCell({ cell, logs, isToday, isSelected, accent, onClick }) {
  const [hov, setHov] = useState(false);
  const hasLogs = logs.length > 0;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={[
        "border-b border-r border-slate-100 dark:border-[#2a3040] transition-all duration-150 relative select-none",
        "min-h-13 md:min-h-22.5",
        "p-1 md:p-2",
        !cell.isCurrentMonth ? "cursor-default bg-slate-50/50 dark:bg-[#1a1f2b]/50" : "cursor-pointer",
        isSelected && cell.isCurrentMonth ? "ring-2 ring-inset ring-blue-500 bg-blue-50/40 dark:bg-[#31f64b]/5 z-10" : "",
        hov && cell.isCurrentMonth && !isSelected ? "bg-gray-200 dark:bg-[#252d3d]" : "",
        hasLogs && !isSelected && cell.isCurrentMonth ? accent.light + " dark:!bg-[#1e2b20]" : "",
      ].join(" ")}
    >
      <div
        className={[
          "w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mb-1 transition-colors shrink-0",
          isToday
            ? "bg-blue-600 text-white shadow-sm"
            : isSelected && cell.isCurrentMonth
            ? "bg-blue-500 text-white"
            : hasLogs && cell.isCurrentMonth
            ? `${accent.chip} text-white`
            : cell.isCurrentMonth
            ? "text-slate-700 dark:text-slate-200"
            : "text-slate-300 dark:text-slate-600",
        ].join(" ")}
      >
        {cell.day}
      </div>

      {hasLogs && (
        <div className="hidden md:flex flex-col gap-0.5">
          {logs.slice(0, 2).map((log) => (
            <div
              key={log.id}
              title={log.content}
              className={[
                "text-[10px] font-semibold px-1.5 py-0.5 rounded-md truncate",
                "border-l-2 bg-white/80 dark:bg-[#222732]/80 shadow-sm",
                PRIORITY_BORDER[log.task?.priority] ?? "border-l-slate-300",
                accent.text,
              ].join(" ")}
            >
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
      {hasLogs && (
        <span className={`md:hidden absolute bottom-1 right-1 w-2 h-2 rounded-full ${accent.chip} shadow-sm`} />
      )}
      {hasLogs && (
        <span className={`hidden md:block absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${accent.chip} opacity-60`} />
      )}
    </div>
  );
}

function DayDetail({ selectedDate, logs, loading, project, accent }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isEmployee = location.pathname.includes("employee");
  const isManager = location.pathname.includes("manager");
  const basePath = isEmployee ? "employee" : isManager ? "manager" : "admin";

  const shortCutNavigate = () => {
    navigate(`/${basePath}/projectdetails/${project.id}`);
  };

  if (!selectedDate) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center h-full py-16 text-slate-400 dark:text-slate-600 text-center px-6">
        <div className="text-4xl mb-3">📅</div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Select a day</p>
        <p className="text-xs mt-1 leading-relaxed">
          Highlighted days have task log updates. Click one to see details.
        </p>
      </div>
    );
  }

  const { year, month, day } = selectedDate;
  const dayOfWeek = new Date(year, month, day).toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-[#2a3040] shrink-0">
        <p className="text-[10px] font-bold text-slate-400 dark:text-[#31f64b]/60 uppercase tracking-widest">
          {dayOfWeek}
        </p>
        <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
          {MONTH_NAMES[month]} {day}, {year}
        </p>
        {project && (
          <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${accent.light} ${accent.text} dark:bg-[#31f64b]/10 dark:text-[#31f64b]`}>
            <span className={`w-1.5 h-1.5 rounded-full ${accent.chip}`} />
            {project.title}
          </div>
        )}
      </div>

      <div className="px-4 pt-3 pb-1 shrink-0">
        <p className="text-[11px] font-bold text-slate-400 dark:text-[#31f64b]/50 uppercase tracking-widest">
          {loading ? "Loading logs…" : `${logs.length} log${logs.length !== 1 ? "s" : ""} this day`}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2.5">
        {loading && [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}

        {!loading && logs.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <div className="text-3xl mb-2">📭</div>
            <p className="text-sm dark:text-slate-500">No task logs for this day</p>
            <p className="text-xs mt-1 text-slate-300 dark:text-slate-600">
              Only days with colored circles have logs
            </p>
          </div>
        )}

        {!loading && logs.map((log) => {
          const s = LOG_STATUS[log.status] ?? LOG_STATUS.in_progress;
          const p = PRIORITY_LABEL[log.task?.priority] ?? PRIORITY_LABEL.medium;
          const time = parseCreatedAt(log.createdAt);

          return (
            <div
              onClick={() => shortCutNavigate()}
              key={log.id}
              className={[
                "bg-white dark:bg-[#1e2433] rounded-xl border border-slate-100 dark:border-[#2a3040] p-3 shadow-sm cursor-pointer",
                "hover:bg-gray-200 dark:hover:bg-[#252d3d] transition-colors duration-150",
                "border-l-4",
                PRIORITY_BORDER[log.task?.priority] ?? "border-l-slate-300",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                    {log.task?.title ?? "Unknown Task"}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${s.badge}`}>
                  {s.label}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-4 mb-2">
                {log.content}
              </p>

              <div className="pl-4 flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.bg} ${p.text}`}>
                  {p.label} priority
                </span>
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 dark:border-[#2a3040]">
                <div className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-full ${accent.chip} flex items-center justify-center text-white text-[9px] font-bold`}>
                    {(log.author?.fullname ?? "?")[0].toUpperCase()}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {log.author?.fullname ?? "—"}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  {formatTimeAgo(time)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────

export default function ManagerDashboard() {
  const today = new Date();
  const years = buildYears();

  const [curYear, setCurYear] = useState(today.getFullYear());
  const [curMonth, setCurMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedProj, setSelectedProj] = useState(null);

  const auth = useSelector((state) => state.auth);
  const userId = auth.user?.id;

  const { data: projData, loading: projLoading, error: projError } = useQuery(GET_PROJECTS, {
    variables: { projectsByManagerId: userId },
  });

  const projects = projData?.projectsByManager ?? [];

  const accentMap = useMemo(() => {
    const map = {};
    projects.forEach((p, i) => { map[p.id] = ACCENTS[i % ACCENTS.length]; });
    return map;
  }, [projects]);

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

  const logsByDay = useMemo(() => {
    const map = {};
    allLogs.forEach((log) => {
      const d = parseCreatedAt(log.createdAt);
      const key = dateKey(d);
      (map[key] = map[key] ?? []).push(log);
    });
    return map;
  }, [allLogs]);

  const selectedDayLogs = useMemo(() => {
    if (!selectedDay) return [];
    const key = `${selectedDay.year}-${selectedDay.month}-${selectedDay.day}`;
    return logsByDay[key] ?? [];
  }, [selectedDay, logsByDay]);

  function navMonth(dir) {
    let m = curMonth + dir, y = curYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setCurMonth(m); setCurYear(y); setSelectedDay(null);
  }

  function handleYearChange(e) { setCurYear(Number(e.target.value)); setSelectedDay(null); }
  function handleMonthChange(e) { setCurMonth(Number(e.target.value)); setSelectedDay(null); }

  function handleProjectClick(project) {
    if (selectedProj?.id === project.id) { setSelectedProj(null); setSelectedDay(null); return; }
    setSelectedProj(project); setSelectedDay(null);
    const start = parseProjectDate(project.startDate);
    if (start) { setCurYear(start.year); setCurMonth(start.month); }
  }

  function handleDayClick(cell) {
    if (!cell.isCurrentMonth) return;
    const next = { day: cell.day, month: cell.month, year: cell.year };
    if (selectedDay?.day === next.day && selectedDay?.month === next.month && selectedDay?.year === next.year) {
      setSelectedDay(null);
    } else {
      setSelectedDay(next);
    }
  }

  const cells = buildCells(curYear, curMonth);
  const todayKey = dateKey(today);
  const activeAccent = selectedProj ? accentMap[selectedProj.id] ?? ACCENTS[0] : ACCENTS[0];

  // Shared dark control style
  const darkControl = [
    "dark:bg-[#31f64b] dark:text-black dark:border-transparent dark:font-bold",
    "dark:hover:bg-[#28d940] dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)]",
    "transition-all duration-150",
  ].join(" ");

  return (
    <div className="h-full w-full flex flex-col bg-slate-100 dark:bg-[#181d28] font-sans">

      {/* ── Header ── */}
      <header className="bg-white dark:bg-[#222732] border-b border-slate-200 dark:border-[#2a3040] px-4 lg:px-6 py-3.5
        flex items-center justify-between gap-4 flex-wrap sticky top-0 z-20 shadow-sm dark:shadow-[0_1px_0_rgba(49,246,75,0.08)]">

        <div className="flex items-center gap-3">
          <div className="w-1 h-7 rounded-full bg-blue-600 dark:bg-[#31f64b]" />
          <h1 className="text-base md:text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Project Calendar
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Year dropdown */}
          <select
            value={curYear}
            onChange={handleYearChange}
            className={`border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm font-semibold
              text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer
              dark:focus:ring-[#31f64b]/40 ${darkControl}`}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Month dropdown */}
          <select
            value={curMonth}
            onChange={handleMonthChange}
            className={`border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm font-semibold
              text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer
              dark:focus:ring-[#31f64b]/40 ${darkControl}`}
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i} value={i}>{name}</option>
            ))}
          </select>

          {/* Prev month */}
          <button
            onClick={() => navMonth(-1)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200
              bg-white text-slate-500 hover:bg-slate-50 font-bold text-lg
              dark:focus:ring-[#31f64b]/40 ${darkControl}`}
          >
            ‹
          </button>

          {/* Next month */}
          <button
            onClick={() => navMonth(1)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200
              bg-white text-slate-500 hover:bg-slate-50 font-bold text-lg
              dark:focus:ring-[#31f64b]/40 ${darkControl}`}
          >
            ›
          </button>

          {/* Today */}
          <button
            onClick={() => {
              setCurYear(today.getFullYear());
              setCurMonth(today.getMonth());
              setSelectedDay(null);
            }}
            className={`px-4 h-9 rounded-lg border border-slate-200 bg-white text-sm font-semibold
              text-slate-600 hover:bg-slate-50
              dark:focus:ring-[#31f64b]/40 ${darkControl}`}
          >
            Today
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-col lg:flex-row" style={{ height: "calc(100vh - 57px)" }}>

        {/* ── Left Sidebar: Projects ── */}
        <aside className="w-full lg:w-64 xl:w-72 bg-white dark:bg-[#222732] border-b lg:border-b-0 lg:border-r
          border-slate-200 dark:border-[#2a3040] flex flex-col shrink-0 overflow-hidden">

          <div className="px-4 pt-4 pb-2 border-b border-slate-100 dark:border-[#2a3040] shrink-0">
            <p className="text-[11px] font-bold text-slate-400 dark:text-[#31f64b]/60 uppercase tracking-widest">
              Projects ({projLoading ? "…" : projects.length})
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5">
              Click a project to view its logs
            </p>
          </div>

          <div className="flex-1 overflow-y-auto h-full px-3 py-2.5 flex flex-col gap-1 dark:bg-[#222732]">
            {projLoading && [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
            {projError && <p className="text-xs text-red-500 p-3">⚠ Failed to load projects.</p>}
            {!projLoading && projects.map((p, idx) => (
              <ProjectItem
                key={p.id}
                project={p}
                accent={accentMap[p.id] ?? ACCENTS[idx % ACCENTS.length]}
                isSelected={selectedProj?.id === p.id}
                onClick={() => handleProjectClick(p)}
              />
            ))}
            {!projLoading && projects.length === 0 && (
              <p className="text-xs text-slate-400 dark:text-slate-600 text-center py-10">
                No projects found.
              </p>
            )}
          </div>

          {/* Active project info card */}
          {selectedProj && (
            <div className={`mx-3 mb-3 p-3 rounded-xl border ${activeAccent.light} ${activeAccent.border}
              dark:bg-[#1e2b20] dark:border-[#31f64b]/20 shrink-0`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${activeAccent.text} dark:text-[#31f64b]`}>
                Active
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {selectedProj.title}
              </p>
              {selectedProj.projectManager && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  PM: {selectedProj.projectManager.fullname ?? "—"}
                </p>
              )}
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {selectedProj.startDate && (
                  <span className="text-[10px] bg-white dark:bg-[#222732] border border-slate-200 dark:border-[#31f64b]/20 rounded px-1.5 py-0.5 text-slate-600 dark:text-[#31f64b]/80 font-mono">
                    ▶ {selectedProj.startDate}
                  </span>
                )}
                {selectedProj.endDate && (
                  <span className="text-[10px] bg-white dark:bg-[#222732] border border-slate-200 dark:border-[#31f64b]/20 rounded px-1.5 py-0.5 text-slate-600 dark:text-[#31f64b]/80 font-mono">
                    ■ {selectedProj.endDate}
                  </span>
                )}
              </div>
              <span className={`mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[selectedProj.status ?? "not started"]}`}>
                {selectedProj.status ?? "not started"}
              </span>
            </div>
          )}
        </aside>

        {/* ── Center: Calendar ── */}
        <main className="flex-1 bg-white dark:bg-[#1a1f2b] flex flex-col min-w-0 overflow-hidden">

          {/* Month header bar */}
          <div className="px-4 md:px-5 py-3 border-b border-slate-100 dark:border-[#2a3040] flex items-center justify-between shrink-0">
            <p className="text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              {MONTH_NAMES[curMonth]}{" "}
              <span className="text-slate-400 dark:text-slate-500 font-normal">{curYear}</span>
            </p>
            {!selectedProj && (
              <p className="text-xs text-slate-400 dark:text-slate-600 italic hidden sm:block">
                ← Select a project first
              </p>
            )}
            {selectedProj && logLoading && (
              <p className="text-xs text-slate-400 dark:text-[#31f64b]/50 animate-pulse">Loading…</p>
            )}
            {selectedProj && !logLoading && (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                  <span className={`w-3 h-3 rounded-full ${activeAccent.chip}`} />
                  <span>= has logs</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  {allLogs.length} log{allLogs.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 border-b border-slate-100 dark:border-[#2a3040] shrink-0">
            {DAY_LABELS.map((label) => (
              <div
                key={label}
                className="text-center text-[10px] font-bold text-slate-400 dark:text-[#31f64b]/60 uppercase tracking-wider py-2"
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
              const cellLogs = cell.isCurrentMonth && selectedProj ? logsByDay[key] ?? [] : [];

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

        {/* ── Right Sidebar: Day Detail ── */}
        <aside className="w-full lg:w-72 xl:w-80 bg-white dark:bg-[#222732] border-t lg:border-t-0 lg:border-l
          border-slate-200 dark:border-[#2a3040] flex flex-col shrink-0 overflow-hidden">
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
