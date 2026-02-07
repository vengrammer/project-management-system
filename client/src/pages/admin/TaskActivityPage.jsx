import { useState } from "react";
import {
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Pen,
  Trash2,
  Pencil,
} from "lucide-react";
import { useNavigate } from "react-router-dom";


// ─── sample task & team data ──────────────────────────────
const TASK = {
  title: "Shopping Cart Integration",
  project: "E-Commerce Platform Redesign",
  assignee: { name: "Mike Johnson", role: "Backend Developer", initials: "MJ" },
};

const INITIAL_UPDATES = [
  {
    id: 1,
    user: { name: "Mike Johnson", initials: "MJ" },
    date: "Feb 10, 2024",
    status: "In Progress",
    progress: 20,
    comment:
      "Started setting up the cart API endpoints. Started setting up the cart API endpoints.Started setting up the cart API endpoints.Started setting up the cart API endpoints.Started setting up the cart API endpoints.Started setting up the cart API endpoints.",
  },
  {
    id: 2,
    user: { name: "Mike Johnson", initials: "MJ" },
    date: "Feb 12, 2024",
    status: "In Progress",
    progress: 40,
    comment:
      "Connected the cart to the product catalog. Add and remove items working now.",
  },
  {
    id: 3,
    user: { name: "Jane Smith", initials: "JS" },
    date: "Feb 13, 2024",
    status: "Stuck",
    progress: 40,
    comment:
      "Tried to integrate Stripe but keep getting a timeout error on checkout. Need help.",
  },
  {
    id: 4,
    user: { name: "Mike Johnson", initials: "MJ" },
    date: "Feb 14, 2024",
    status: "In Progress",
    progress: 55,
    comment:
      "Fixed the Stripe timeout issue. Added a retry mechanism. Checkout flow is working.",
  },
  {
    id: 5,
    user: { name: "Mike Johnson", initials: "MJ" },
    date: "Feb 16, 2024",
    status: "In Progress",
    progress: 70,
    comment: "Added inventory check before payment. Edge cases handled.",
  },
];

// ─── status config ────────────────────────────────────────
const STATUS_OPTIONS = [
  {
    value: "In Progress",
    label: "In Progress",
    color: "bg-blue-100 text-blue-700",
    icon: Clock,
    dot: "bg-blue-500",
  },
  {
    value: "Done",
    label: "Done",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
    dot: "bg-green-500",
  },
  {
    value: "Stuck",
    label: "Stuck",
    color: "bg-red-100 text-red-700",
    icon: AlertCircle,
    dot: "bg-red-500",
  },
];

function getStatus(val) {
  return STATUS_OPTIONS.find((s) => s.value === val) || STATUS_OPTIONS[0];
}

// ─── avatar ───────────────────────────────────────────────
function Avatar({ initials, size = "w-9 h-9", text = "text-sm" }) {
  return (
    <div
      className={`${size} rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold ${text} shrink-0`}
    >
      {initials}
    </div>
  );
}

// ─── progress ring (simple) ───────────────────────────────
function ProgressRing({ value }) {
  const color =
    value === 100
      ? "text-green-500"
      : value >= 50
        ? "text-blue-500"
        : "text-amber-500";
  const stroke =
    value === 100
      ? "stroke-green-500"
      : value >= 50
        ? "stroke-blue-500"
        : "stroke-amber-500";
  const r = 16;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <div className="relative w-14 h-14">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="4"
        />
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          className={stroke}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${color}`}
      >
        {value}%
      </span>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────
export default function TaskActivityPage() {
  const [updates, setUpdates] = useState(INITIAL_UPDATES);
  const [selectedStatus, setSelectedStatus] = useState("In Progress");
  const [progress, setProgress] = useState(70);
  const [comment, setComment] = useState("");
  const navigate = useNavigate();

  // latest progress from updates or current
  const latestProgress =
    updates.length > 0 ? updates[updates.length - 1].progress : progress;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newUpdate = {
      id: Date.now(),
      user: { name: "You", initials: "YO" },
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: selectedStatus,
      progress: progress,
      comment: comment.trim(),
    };

    setUpdates((prev) => [...prev, newUpdate]);
    setComment("");
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">
        {/* back */}
        <button
          onClick={() => navigate("/projectdetails", { replace: true })}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* ── top card: task + assigned person ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">{TASK.project}</p>
              <h1 className="text-lg font-bold text-gray-900">{TASK.title}</h1>
            </div>
            <ProgressRing value={latestProgress} />
          </div>

          {/* assigned to row */}
          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
            <Avatar initials={TASK.assignee.initials} />
            <div>
              <p className="text-xs text-gray-400">Assigned to</p>
              <p className="text-sm font-semibold text-gray-900">
                {TASK.assignee.name}
              </p>
              <p className="text-xs text-gray-500">{TASK.assignee.role}</p>
            </div>
            {/* assign the task status*/}
            <button className="ml-auto bg-green-500 hover:bg-green-600 text-white rounded px-4 py-2 cursor-pointer">
              Done
            </button>
          </div>
        </div>

        {/* ── update form ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
          <p className="text-sm font-semibold text-gray-800 mb-4">
            Post Today's Update
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* status picker */}
            <div>
              <p className="text-xs text-gray-500 mb-2">How is it going?</p>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map((s) => {
                  const Icon = s.icon;
                  const active = selectedStatus === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setSelectedStatus(s.value)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        active
                          ? s.value === "Done"
                            ? "border-green-500 bg-green-50 text-green-700"
                            : s.value === "Stuck"
                              ? "border-red-500 bg-red-50 text-red-700"
                              : "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <Icon size={16} />
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* progress slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500">Progress</p>
                <p className="text-xs font-bold text-blue-600">{progress}%</p>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* comment */}
            <div>
              <p className="text-xs text-gray-500 mb-2">
                What did you do today?
              </p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your daily update here…"
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
            </div>

            {/* submit */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send size={16} /> Post Update
            </button>
          </form>
        </div>

        {/* ── updates log ── */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-800">Updates</p>
            <p className="text-xs text-gray-400">
              {updates.length} update{updates.length !== 1 ? "s" : ""} posted
            </p>
          </div>

          <div className="divide-y divide-gray-100 max-h-100 overflow-y-scroll">
            {[...updates].reverse().map((item) => {
              const st = getStatus(item.status);
              const Icon = st.icon;
              return (
                <div
                  key={item.id}
                  className="p-5 hover:bg-gray-50 transition-colors"
                >
                  {/* row: avatar + name + status + date */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        initials={item.user.initials}
                        size="w-8 h-8"
                        text="text-xs"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {item.user.name}
                        </p>
                        <p className="text-xs text-gray-400">{item.date}</p>
                      </div>
                    </div>

                    {/* status badge */}
                    <div className="flex flex-row gap-3">
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${st.color}`}
                      >
                        <Icon size={13} />
                        <span className="text-xs font-semibold">
                          {item.status}
                        </span>
                      </div>
                      {/*Edit Icon*/}
                      <button className="p-2 text-green-600 hover:bg-green-700 hover:text-white rounded-lg transition-colors cursor-pointer">
                        <Pencil size={18} />
                      </button>
                    </div>
                  </div>

                  {/* comment */}
                  <p className="text-sm text-gray-700 mb-3 pl-11">
                    {item.comment}
                  </p>

                  {/* progress bar */}
                  <div className="pl-11">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.progress === 100
                              ? "bg-green-500"
                              : item.progress >= 50
                                ? "bg-blue-500"
                                : "bg-amber-500"
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-600 w-9 text-right">
                        {item.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}