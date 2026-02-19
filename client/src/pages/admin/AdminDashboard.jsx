// ================================================================
//  PMDashboard.jsx
//  A Project Management Calendar Dashboard
//
//  HOW TO USE THIS FILE:
//  1. Edit the DATA SECTION below to add your own projects, team,
//     and events.
//  2. Each component (Header, Sidebar, Calendar, etc.) is clearly
//     labeled so you can find and change any part easily.
//  3. All colors and sizes live in the STYLES section at the bottom.
//
//  To use in your app:
//     import PMDashboard from "./PMDashboard";
//     <PMDashboard />
// ================================================================

import { useState } from "react";

// ================================================================
//  STEP 1 — EDIT YOUR DATA HERE
//  This is the only section you need to change to customize the
//  dashboard with your own projects and events.
// ================================================================

// --- Your projects ---
// Each project needs: id, name, color (text color), bg (background color)
// Add or remove projects by adding/removing lines here.
const PROJECTS = [
  { id: 1, name: "Website Redesign", color: "#E03131", bg: "#FFF5F5" },
  { id: 2, name: "Mobile App v2", color: "#0CA678", bg: "#E6FAF5" },
  { id: 3, name: "API Integration", color: "#E67700", bg: "#FFF4E6" },
  { id: 4, name: "Brand Campaign", color: "#7048E8", bg: "#F3F0FF" },
];

// --- Your team members ---
// Key = short initials shown on the avatar (e.g. "AK")
// name = full name shown in the detail panel
// color = avatar background color
const TEAM = {
  AK: { name: "Alex K.", color: "#E03131" },
  SR: { name: "Sam R.", color: "#0CA678" },
  JL: { name: "Jordan L.", color: "#E67700" },
  MT: { name: "Morgan T.", color: "#7048E8" },
};

// --- Your calendar events ---
// projectId  → must match one of the ids in PROJECTS above
// day        → day of the month (1–31)
// priority   → "high", "medium", or "low"
// who        → must match a key in TEAM above (e.g. "AK")
// action     → description shown in the detail panel
// time       → display time (just a string, e.g. "9:30 AM")
const EVENTS = [
  {
    id: 1,
    projectId: 1,
    title: "Design Review",
    day: 3,
    priority: "high",
    who: "AK",
    time: "9:30 AM",
    action:
      "Uploaded new wireframes and marked 3 components as ready for handoff.",
  },
  {
    id: 2,
    projectId: 2,
    title: "Sprint Planning",
    day: 3,
    priority: "medium",
    who: "SR",
    time: "11:00 AM",
    action:
      "Created sprint backlog with 12 user stories and assigned story points.",
  },
  {
    id: 3,
    projectId: 3,
    title: "API Kickoff",
    day: 5,
    priority: "high",
    who: "JL",
    time: "10:00 AM",
    action:
      "Shared API spec document and set up Postman workspace for the team.",
  },
  {
    id: 4,
    projectId: 1,
    title: "Stakeholder Demo",
    day: 7,
    priority: "high",
    who: "AK",
    time: "2:00 PM",
    action:
      "Presented homepage prototype. Client approved color palette and nav.",
  },
  {
    id: 5,
    projectId: 4,
    title: "Campaign Brief",
    day: 9,
    priority: "medium",
    who: "MT",
    time: "3:15 PM",
    action:
      "Finalized target audience segments and submitted brief to creative team.",
  },
  {
    id: 6,
    projectId: 2,
    title: "Beta Launch",
    day: 12,
    priority: "high",
    who: "SR",
    time: "8:00 AM",
    action: "Deployed v0.9 to TestFlight. Invited 50 beta testers.",
  },
  {
    id: 7,
    projectId: 3,
    title: "QA Testing",
    day: 14,
    priority: "low",
    who: "JL",
    time: "1:00 PM",
    action:
      "Ran 200 automated tests. 4 endpoints returned 500 errors — filed tickets.",
  },
  {
    id: 8,
    projectId: 1,
    title: "Final Handoff",
    day: 17,
    priority: "high",
    who: "AK",
    time: "4:00 PM",
    action:
      "Delivered all assets to dev team. Design system exported to Zeplin.",
  },
  {
    id: 9,
    projectId: 4,
    title: "Ad Creative Review",
    day: 19,
    priority: "medium",
    who: "MT",
    time: "10:30 AM",
    action:
      "Reviewed 6 ad variants. 2 approved, 1 revised, 3 sent back for changes.",
  },
  {
    id: 10,
    projectId: 2,
    title: "App Store Submit",
    day: 21,
    priority: "high",
    who: "SR",
    time: "9:00 AM",
    action:
      "Submitted iOS build 1.0 to App Store Review. Expected approval in 48 hrs.",
  },
  {
    id: 11,
    projectId: 3,
    title: "Go Live",
    day: 23,
    priority: "high",
    who: "JL",
    time: "12:00 PM",
    action:
      "API v1 deployed to production. All endpoints responding. Monitoring on.",
  },
  {
    id: 12,
    projectId: 4,
    title: "Campaign Launch",
    day: 26,
    priority: "high",
    who: "MT",
    time: "8:00 AM",
    action:
      "Launched across Google & Meta. Day 1 impressions: 84K. CTR at 3.2%.",
  },
  {
    id: 13,
    projectId: 1,
    title: "Post-Launch Review",
    day: 28,
    priority: "low",
    who: "AK",
    time: "3:00 PM",
    action:
      "Conducted retrospective. Documented lessons learned and updated wiki.",
  },
];

// --- Stats shown across the top ---
// Update the `value` numbers to match your real data.
const STATS = [
  {
    label: "Total Tasks",
    value: 13,
    color: "#3B5BDB",
    bg: "#EEF2FF",
    icon: "📋",
  },
  {
    label: "In Progress",
    value: 6,
    color: "#0CA678",
    bg: "#E6FAF5",
    icon: "⚙️",
  },
  { label: "Overdue", value: 2, color: "#E67700", bg: "#FFF4E6", icon: "⚠️" },
  { label: "Completed", value: 5, color: "#2F9E44", bg: "#F3FFF0", icon: "✅" },
];

// --- Priority badge colors ---
// You can change these colors to match your brand.
const PRIORITY_STYLE = {
  high: { label: "HIGH", color: "#E03131", bg: "#FFF5F5" },
  medium: { label: "MEDIUM", color: "#E67700", bg: "#FFF4E6" },
  low: { label: "LOW", color: "#2F9E44", bg: "#F3FFF0" },
};

// --- Calendar helpers (no need to edit these) ---
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
const DAY_NAMES_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DAY_NAMES_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// ================================================================
//  HELPER FUNCTIONS
//  Small reusable functions used by the components below.
// ================================================================

// Returns events for a specific day, filtered by project if needed.
// projectFilter = 0 means "show all projects"
function getEventsForDay(day, projectFilter) {
  return EVENTS.filter(
    (event) =>
      event.day === day &&
      (projectFilter === 0 || event.projectId === projectFilter),
  );
}

// Builds the grid of calendar cells for a given month/year.
// Returns an array like: [{ type: "prev", day: 29 }, { type: "current", day: 1 }, ...]
function buildCalendarCells(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay(); // 0=Sun, 6=Sat
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevTotal = new Date(year, month, 0).getDate();

  const cells = [];

  // Fill in greyed-out days from the previous month
  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ type: "prev", day: prevTotal - firstWeekday + 1 + i });
  }

  // Fill in the actual days of the current month
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ type: "current", day: d });
  }

  // Fill trailing greyed-out days from next month to complete the last row
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    for (let i = 1; i <= 7 - remainder; i++) {
      cells.push({ type: "next", day: i });
    }
  }

  return cells;
}

// Build the list of years for the year dropdown
function buildYearList() {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 10; y <= currentYear + 5; y++) {
    years.push(y);
  }
  return years;
}

// ================================================================
//  COMPONENT: Avatar
//  A small colored circle showing someone's initials.
//
//  Props:
//    initials — letters to show, e.g. "AK"
//    color    — background color
//    size     — circle size in pixels (default: 28)
// ================================================================
function Avatar({ initials, color, size = 28 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.35,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

// ================================================================
//  COMPONENT: Header
//  The top bar with the app name and current user info.
// ================================================================
function Header() {
  return (
    <div style={S.header}>
      {/* App name — change "OrbitPM" to whatever you like */}
      <span style={S.logo}>📋 OrbitPM</span>

      {/* Current user — replace "JD" and "John Doe" with real data */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Avatar initials="JD" color="#3B5BDB" size={30} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>
          John Doe
        </span>
      </div>
    </div>
  );
}

// ================================================================
//  COMPONENT: StatsRow
//  Four summary cards showing task counts at the top.
//  Edit the STATS array at the top of this file to change values.
// ================================================================
function StatsRow() {
  return (
    <div style={S.statsRow}>
      {STATS.map((stat, index) => (
        <div
          key={index}
          style={{
            ...S.statBox,
            borderRight:
              index < STATS.length - 1 ? "1px solid #E8EAF0" : "none",
          }}
        >
          {/* Colored icon circle */}
          <div style={{ ...S.statIcon, background: stat.bg }}>{stat.icon}</div>

          {/* Label and number */}
          <div>
            <div style={S.statLabel}>{stat.label}</div>
            <div style={{ ...S.statNumber, color: stat.color }}>
              {stat.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ================================================================
//  COMPONENT: Sidebar
//  Left panel with:
//    - Month and year dropdowns + navigation arrows
//    - Project filter buttons (clicking one filters the calendar)
//    - Priority color legend
//
//  Props:
//    activeFilter   — which project is selected (0 = show all)
//    onFilterChange — called with the new projectId when user clicks
//    curMonth       — current month number (0–11)
//    curYear        — current year number (e.g. 2026)
//    onMonthChange  — called with new month number
//    onYearChange   — called with new year number
//    onNavMonth     — called with -1 (prev) or +1 (next)
// ================================================================
function Sidebar({
  activeFilter,
  onFilterChange,
  curMonth,
  curYear,
  onMonthChange,
  onYearChange,
  onNavMonth,
}) {
  const years = buildYearList();

  return (
    <div style={S.sidebar}>
      {/* ── Date Navigation ──────────────────────────────── */}
      <div style={S.sideSection}>
        <div style={S.sideSectionTitle}>DATE</div>

        {/* Month selector */}
        <select
          value={curMonth}
          onChange={(e) => onMonthChange(Number(e.target.value))}
          style={S.select}
        >
          {MONTH_NAMES.map((name, i) => (
            <option key={i} value={i}>
              {name}
            </option>
          ))}
        </select>

        {/* Year selector */}
        <select
          value={curYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
          style={{ ...S.select, marginTop: 6 }}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {/* Arrow buttons to go to prev/next month */}
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <button style={S.navBtn} onClick={() => onNavMonth(-1)}>
            ‹ Prev
          </button>
          <button style={S.navBtn} onClick={() => onNavMonth(1)}>
            Next ›
          </button>
        </div>
      </div>

      {/* ── Project Filter ───────────────────────────────── */}
      <div style={S.sideSection}>
        <div style={S.sideSectionTitle}>PROJECTS</div>

        {/* "All Projects" — shows everything */}
        <SidebarItem
          label="All Projects"
          dotColor="#3B5BDB"
          isActive={activeFilter === 0}
          count={EVENTS.length}
          onClick={() => onFilterChange(0)}
        />

        {/* One button per project */}
        {PROJECTS.map((project) => {
          const count = EVENTS.filter((e) => e.projectId === project.id).length;
          return (
            <SidebarItem
              key={project.id}
              label={project.name}
              dotColor={project.color}
              isActive={activeFilter === project.id}
              count={count}
              onClick={() => onFilterChange(project.id)}
            />
          );
        })}
      </div>

      {/* ── Priority Legend ──────────────────────────────── */}
      <div style={S.sideSection}>
        <div style={S.sideSectionTitle}>PRIORITY</div>
        {Object.entries(PRIORITY_STYLE).map(([key, val]) => (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: val.color,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 12, color: "#555" }}>{val.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================================================================
//  COMPONENT: SidebarItem
//  A single clickable row inside the sidebar project list.
//
//  Props:
//    label    — text to show (project name or "All Projects")
//    dotColor — color of the dot on the left
//    isActive — true if this item is currently selected
//    count    — number of events (shown on the right)
//    onClick  — function to call when this item is clicked
// ================================================================
function SidebarItem({ label, dotColor, isActive, count, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...S.sidebarItem,
        // Change style depending on whether it's active (selected)
        background: isActive ? dotColor + "18" : "transparent",
        borderColor: isActive ? dotColor + "55" : "transparent",
        color: isActive ? dotColor : "#555",
        fontWeight: isActive ? 600 : 400,
      }}
    >
      {/* Colored dot indicator */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: dotColor,
          flexShrink: 0,
        }}
      />

      {/* Project name */}
      <span style={{ flex: 1, textAlign: "left", fontSize: 13 }}>{label}</span>

      {/* Event count */}
      <span style={{ fontSize: 11, color: isActive ? dotColor : "#BBB" }}>
        {count}
      </span>
    </button>
  );
}

// ================================================================
//  COMPONENT: CalendarGrid
//  The monthly calendar in the center of the screen.
//
//  Props:
//    curMonth      — month to show (0–11)
//    curYear       — year to show
//    selectedDay   — the day number currently selected
//    activeFilter  — project filter (0 = all)
//    onSelectDay   — called with the day number when user clicks a day
// ================================================================
function CalendarGrid({
  curMonth,
  curYear,
  selectedDay,
  activeFilter,
  onSelectDay,
}) {
  const today = new Date();
  const cells = buildCalendarCells(curYear, curMonth);

  return (
    <div style={S.calendarPanel}>
      {/* Month + year title at top of calendar */}
      <div style={S.calTitle}>
        {MONTH_NAMES[curMonth]} {curYear}
      </div>

      {/* Day-of-week column headers */}
      <div style={S.dayNamesRow}>
        {DAY_NAMES_SHORT.map((name) => (
          <div key={name} style={S.dayNameCell}>
            {name}
          </div>
        ))}
      </div>

      {/* The calendar cells grid */}
      <div style={S.calGrid}>
        {cells.map((cell, index) => {
          const isThisMonth = cell.type === "current";

          // Is this cell today's date?
          const isToday =
            isThisMonth &&
            cell.day === today.getDate() &&
            curMonth === today.getMonth() &&
            curYear === today.getFullYear();

          // Is this the day the user clicked?
          const isSelected = isThisMonth && cell.day === selectedDay;

          // Events to show on this cell (empty array for non-current-month cells)
          const dayEvents = isThisMonth
            ? getEventsForDay(cell.day, activeFilter)
            : [];

          return (
            <CalendarCell
              key={index}
              day={cell.day}
              isThisMonth={isThisMonth}
              isToday={isToday}
              isSelected={isSelected}
              events={dayEvents}
              onClick={isThisMonth ? () => onSelectDay(cell.day) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}

// ================================================================
//  COMPONENT: CalendarCell
//  One individual day box inside the calendar grid.
//
//  Props:
//    day         — the day number (1–31)
//    isThisMonth — false for greyed-out overflow days
//    isToday     — true if this is today's date
//    isSelected  — true if the user has clicked this day
//    events      — array of events on this day
//    onClick     — function called when user clicks this cell
// ================================================================
function CalendarCell({
  day,
  isThisMonth,
  isToday,
  isSelected,
  events,
  onClick,
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...S.calCell,
        // Dim non-current-month cells
        opacity: isThisMonth ? 1 : 0.25,
        cursor: isThisMonth ? "pointer" : "default",
        // Change background and border based on state
        background: isSelected
          ? "#EEF2FF"
          : isHovered && isThisMonth
          ? "#FAFBFF"
          : "#fff",
        borderColor: isSelected
          ? "#3B5BDB"
          : isHovered && isThisMonth
          ? "#C5CBEF"
          : "#EDEFF5",
      }}
    >
      {/* Day number — highlighted blue circle if today */}
      <div
        style={{
          ...S.dayNumber,
          background: isToday ? "#3B5BDB" : "transparent",
          color: isToday ? "#fff" : "#333",
          borderRadius: "50%",
        }}
      >
        {day}
      </div>

      {/* Show up to 2 event chips per cell */}
      {events.slice(0, 2).map((event) => {
        const project = PROJECTS.find((p) => p.id === event.projectId);
        return (
          <div
            key={event.id}
            style={{
              ...S.eventChip,
              background: project.bg,
              color: project.color,
            }}
          >
            {event.title}
          </div>
        );
      })}

      {/* If more than 2 events, show a "+N more" label */}
      {events.length > 2 && (
        <div style={S.moreLabel}>+{events.length - 2} more</div>
      )}
    </div>
  );
}

// ================================================================
//  COMPONENT: DetailPanel
//  Right-side panel showing full details for the selected day.
//
//  Props:
//    curMonth     — current month (for display)
//    curYear      — current year (for display)
//    selectedDay  — the day the user has clicked
//    activeFilter — which project is filtered (0 = all)
// ================================================================
function DetailPanel({ curMonth, curYear, selectedDay, activeFilter }) {
  // Get events for the selected day (filtered by project)
  const todaysEvents = getEventsForDay(selectedDay, activeFilter);

  // Get upcoming events after the selected day (up to 4)
  const upcomingEvents = EVENTS.filter(
    (e) =>
      e.day > selectedDay &&
      (activeFilter === 0 || e.projectId === activeFilter),
  ).slice(0, 4);

  // Find the active project object (null if "All Projects" is selected)
  const activeProject =
    activeFilter !== 0 ? PROJECTS.find((p) => p.id === activeFilter) : null;

  // Build the full day name, e.g. "Thursday"
  const dateObj = new Date(curYear, curMonth, selectedDay);
  const dayName = DAY_NAMES_FULL[dateObj.getDay()];

  return (
    <div style={S.detailPanel}>
      {/* Banner showing which project is being viewed — only shows when filtered */}
      {activeProject && (
        <div
          style={{
            ...S.viewingBanner,
            background: activeProject.bg,
            borderColor: activeProject.color + "44",
          }}
        >
          <div style={{ ...S.viewingDot, background: activeProject.color }} />
          <span style={{ ...S.viewingText, color: activeProject.color }}>
            Viewing: {activeProject.name}
          </span>
        </div>
      )}

      {/* Selected day heading */}
      <div>
        <div style={S.detailDate}>{dayName}</div>
        <div style={S.detailSubDate}>
          {MONTH_NAMES[curMonth]} {selectedDay}, {curYear}
        </div>
      </div>

      <div style={S.divider} />

      {/* Events / updates for the selected day */}
      <div>
        <div style={S.panelSectionTitle}>
          UPDATES TODAY ({todaysEvents.length})
        </div>

        {todaysEvents.length === 0 ? (
          <div style={S.emptyState}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>📭</div>
            No updates for this day
          </div>
        ) : (
          todaysEvents.map((event) => (
            <UpdateCard key={event.id} event={event} />
          ))
        )}
      </div>

      <div style={S.divider} />

      {/* Upcoming events later this month */}
      <div>
        <div style={S.panelSectionTitle}>UPCOMING</div>
        {upcomingEvents.length === 0 ? (
          <div style={{ fontSize: 12, color: "#CCC" }}>
            No more events this month
          </div>
        ) : (
          upcomingEvents.map((event) => (
            <UpcomingRow key={event.id} event={event} curMonth={curMonth} />
          ))
        )}
      </div>
    </div>
  );
}

// ================================================================
//  COMPONENT: UpdateCard
//  A card showing one event's full details inside the detail panel.
//
//  Props:
//    event — one event object from the EVENTS array
// ================================================================
function UpdateCard({ event }) {
  const project = PROJECTS.find((p) => p.id === event.projectId);
  const member = TEAM[event.who];
  const priority = PRIORITY_STYLE[event.priority];

  return (
    <div
      style={{
        ...S.updateCard,
        borderColor: project.color,
        background: project.bg,
      }}
    >
      {/* Who updated + what time */}
      <div style={S.updateHeader}>
        <Avatar initials={event.who} color={member.color} size={24} />
        <span style={S.updateName}>{member.name}</span>
        <span style={S.updateTime}>{event.time}</span>
      </div>

      {/* Project name + task title */}
      <div style={{ ...S.updateProject, color: project.color }}>
        📁 {project.name} — {event.title}
      </div>

      {/* Description of what was done */}
      <div style={S.updateAction}>{event.action}</div>

      {/* Priority badge (HIGH / MEDIUM / LOW) */}
      <span
        style={{
          ...S.priorityBadge,
          color: priority.color,
          background: priority.bg,
        }}
      >
        ● {priority.label}
      </span>
    </div>
  );
}

// ================================================================
//  COMPONENT: UpcomingRow
//  A single line in the "Upcoming" list at the bottom of the panel.
//
//  Props:
//    event    — one event object
//    curMonth — used to display the month name
// ================================================================
function UpcomingRow({ event, curMonth }) {
  const project = PROJECTS.find((p) => p.id === event.projectId);
  const member = TEAM[event.who];

  return (
    <div style={S.upcomingRow}>
      {/* Colored dot matching the project */}
      <div style={{ ...S.upcomingDot, background: project.color }} />

      <div>
        <div style={S.upcomingTitle}>{event.title}</div>
        <div style={S.upcomingMeta}>
          {MONTH_NAMES[curMonth]} {event.day} · {project.name} · {member.name}
        </div>
      </div>
    </div>
  );
}

// ================================================================
//  MAIN COMPONENT: PMDashboard
//  This is the root of the whole dashboard.
//  It holds all the "state" (data that changes when you interact)
//  and passes it down to the child components.
//
//  State variables:
//    curMonth     — which month is showing (0 = Jan, 11 = Dec)
//    curYear      — which year is showing
//    selectedDay  — which day the user clicked
//    activeFilter — which project is filtered (0 = all)
// ================================================================
export default function AdminDashboard() {
  const today = new Date();

  // useState(initialValue) creates a variable that React tracks.
  // When it changes, React re-renders the component automatically.
  const [curMonth, setCurMonth] = useState(today.getMonth());
  const [curYear, setCurYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [activeFilter, setActiveFilter] = useState(0); // 0 = "All Projects"

  // Go to previous or next month
  // dir = -1 means go back, +1 means go forward
  function handleNavMonth(dir) {
    let newMonth = curMonth + dir;
    let newYear = curYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear = newYear - 1;
    } // wrap to December
    if (newMonth > 11) {
      newMonth = 0;
      newYear = newYear + 1;
    } // wrap to January

    setCurMonth(newMonth);
    setCurYear(newYear);
  }

  // Called when the user clicks a day on the calendar
  function handleSelectDay(day) {
    setSelectedDay(day);
  }

  // Called when the user clicks a project in the sidebar
  // projectId = 0 means "All Projects"
  function handleFilterChange(projectId) {
    setActiveFilter(projectId);
  }

  return (
    <div style={S.root}>
      {/* ── Top bar ── */}
      <Header />

      {/* ── Summary stats ── */}
      <StatsRow />

      {/* ── Three-column layout ── */}
      <div style={S.mainLayout}>
        {/* LEFT: Sidebar (date picker + project filter) */}
        <Sidebar
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          curMonth={curMonth}
          curYear={curYear}
          onMonthChange={setCurMonth}
          onYearChange={setCurYear}
          onNavMonth={handleNavMonth}
        />

        {/* MIDDLE: Monthly calendar */}
        <CalendarGrid
          curMonth={curMonth}
          curYear={curYear}
          selectedDay={selectedDay}
          activeFilter={activeFilter}
          onSelectDay={handleSelectDay}
        />

        {/* RIGHT: Day detail panel */}
        <DetailPanel
          curMonth={curMonth}
          curYear={curYear}
          selectedDay={selectedDay}
          activeFilter={activeFilter}
        />
      </div>
    </div>
  );
}

// ================================================================
//  STYLES (S)
//  All visual styles live here in one object.
//  To change something, find the style name and update it.
//
//  Common things to change:
//    Primary blue: "#3B5BDB"
//    Page background: "#F5F6FA"
//    Border color: "#E8EAF0"
//    Text color: "#333" or "#555"
// ================================================================
const S = {
  root: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    background: "#F5F6FA",
    color: "#1a1a2e",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },

  // ── Header ──
  header: {
    background: "#fff",
    borderBottom: "1px solid #E8EAF0",
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    fontSize: 17,
    fontWeight: 700,
    color: "#3B5BDB",
  },

  // ── Stats ──
  statsRow: {
    display: "flex",
    flexWrap: "wrap",
    background: "#fff",
    borderBottom: "1px solid #E8EAF0",
  },
  statBox: {
    flex: "1 1 100px",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    flexShrink: 0,
  },
  statLabel: { fontSize: 10, color: "#999", marginBottom: 1 },
  statNumber: { fontSize: 18, fontWeight: 700 },

  // ── Layout ──
  mainLayout: {
    display: "flex",
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
  },

  // ── Sidebar ──
  sidebar: {
    width: 210,
    minWidth: 210,
    background: "#fff",
    borderRight: "1px solid #E8EAF0",
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    overflowY: "auto",
  },
  sideSection: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  sideSectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: "#AAB",
    letterSpacing: "1.2px",
    marginBottom: 6,
  },
  sidebarItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px",
    borderRadius: 8,
    border: "1.5px solid",
    cursor: "pointer",
    fontFamily: "inherit",
    marginBottom: 2,
    width: "100%",
    transition: "all 0.15s",
  },
  select: {
    width: "100%",
    padding: "7px 10px",
    border: "1px solid #E0E2EA",
    borderRadius: 8,
    fontFamily: "inherit",
    fontSize: 13,
    color: "#333",
    background: "#fff",
    cursor: "pointer",
    outline: "none",
  },
  navBtn: {
    flex: 1,
    padding: "6px 0",
    border: "1px solid #E0E2EA",
    borderRadius: 8,
    background: "#fff",
    fontFamily: "inherit",
    fontSize: 12,
    color: "#555",
    cursor: "pointer",
  },

  // ── Calendar ──
  calendarPanel: {
    flex: 1,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    minWidth: 0,
    overflowY: "auto",
  },
  calTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#222",
    marginBottom: 2,
  },
  dayNamesRow: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 3,
  },
  dayNameCell: {
    textAlign: "center",
    fontSize: 10,
    fontWeight: 600,
    color: "#BBB",
    padding: "3px 0",
    letterSpacing: "0.5px",
  },
  calGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 3,
  },
  calCell: {
    minHeight: 80,
    padding: 7,
    borderRadius: 9,
    border: "1.5px solid",
    transition: "all 0.12s",
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: 600,
    width: 22,
    height: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },
  eventChip: {
    fontSize: 9,
    fontWeight: 600,
    padding: "2px 5px",
    borderRadius: 4,
    marginBottom: 2,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "block",
  },
  moreLabel: { fontSize: 9, color: "#AAB" },

  // ── Detail panel ──
  detailPanel: {
    width: 270,
    minWidth: 250,
    background: "#fff",
    borderLeft: "1px solid #E8EAF0",
    padding: 16,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  viewingBanner: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "7px 10px",
    borderRadius: 8,
    border: "1px solid",
  },
  viewingDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  viewingText: { fontSize: 11, fontWeight: 600 },

  detailDate: { fontSize: 19, fontWeight: 700 },
  detailSubDate: { fontSize: 11, color: "#999", marginTop: 2 },
  divider: { height: 1, background: "#F0F2F7", flexShrink: 0 },

  panelSectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: "#AAB",
    letterSpacing: "1px",
    marginBottom: 8,
  },
  emptyState: {
    textAlign: "center",
    padding: "24px 0",
    color: "#CCC",
    fontSize: 12,
  },

  // ── Update card ──
  updateCard: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderLeft: "3px solid",
  },
  updateHeader: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    marginBottom: 5,
  },
  updateName: { fontSize: 12, fontWeight: 600, color: "#333" },
  updateTime: { fontSize: 10, color: "#BBB", marginLeft: "auto" },
  updateProject: { fontSize: 11, fontWeight: 600, marginBottom: 4 },
  updateAction: { fontSize: 11, color: "#555", lineHeight: 1.55 },
  priorityBadge: {
    display: "inline-block",
    fontSize: 9,
    fontWeight: 700,
    padding: "2px 6px",
    borderRadius: 4,
    marginTop: 6,
  },

  // ── Upcoming row ──
  upcomingRow: {
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
    padding: "7px 0",
    borderBottom: "1px solid #F5F5F8",
  },
  upcomingDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    marginTop: 4,
    flexShrink: 0,
  },
  upcomingTitle: { fontSize: 12, color: "#444", fontWeight: 500 },
  upcomingMeta: { fontSize: 10, color: "#BBB", marginTop: 1 },
};
