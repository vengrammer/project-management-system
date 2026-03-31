import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useQuery, useSubscription, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Bell, CheckCheck, BellOff, ArrowRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

////-----------------THIS PAGE IS SHARED BY ALL TYPE OF USERS-----------------////

const NOTIFICATIONS = gql`
  query Notifications {
    notifications {
      id
      recipients { id fullname }
      sender { id fullname }
      type title message
      entity { type id }
      isRead createdAt
    }
  }
`;

const NOTIFICATION_SUB = gql`
  subscription NotificationAdded($userId: ID!) {
    notificationAdded(userId: $userId) {
      id
      recipients { id fullname }
      sender { id fullname }
      type title message
      entity { type id }
      isRead createdAt
    }
  }
`;

const NOTIFICATION_MAR_AS_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      recipients { id fullname }
      sender { id fullname }
      type title message
      entity { type id }
      isRead createdAt
    }
  }
`;

const NOTIFICATION_MARK_AS_READ_SUB = gql`
  subscription NotificationMarkAsRead($userId: ID!) {
    notificationMarkAsRead(userId: $userId) {
      id
      recipients { id fullname }
      sender { id fullname }
      type title message
      entity { type id }
      isRead createdAt
    }
  }
`;

const TYPE_COLORS = {
  alert: "#f97316",
  message: "#3b82f6",
  mention: "#eab308",
  system: "#10b981",
  info: "#6366f1",
};

const getInitials = (name) => {
  if (!name) return "";
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

function formatTimeAgo(value) {
  if (!value) return "";
  const now = new Date();
  const date = new Date(value);
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

export default function Notification() {
  const userId = useSelector((state) => state?.auth?.user?.id);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = location.pathname.includes("/admin");
  const isManager = location.pathname.includes("/manager");
  const isPm = location.pathname.includes("/projectmanager");

  const { data, loading, error } = useQuery(NOTIFICATIONS, { fetchPolicy: "network-only" });

  const { data: subData } = useSubscription(NOTIFICATION_SUB, { variables: { userId } });

  const { data: markAsReadSubData } = useSubscription(NOTIFICATION_MARK_AS_READ_SUB, { variables: { userId } });

  const [markAsRead] = useMutation(NOTIFICATION_MAR_AS_READ);

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (data?.notifications) setNotifications(data.notifications);
  }, [data]);

  useEffect(() => {
    if (subData?.notificationAdded)
      setNotifications((prev) => [subData.notificationAdded, ...prev]);
  }, [subData]);

  useEffect(() => {
    if (markAsReadSubData?.notificationMarkAsRead) {
      const updatedNotification = markAsReadSubData.notificationMarkAsRead;
      setNotifications((prev) =>
        prev.map((n) => n.id === updatedNotification.id ? updatedNotification : n),
      );
    }
  }, [markAsReadSubData]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead({ variables: { id: notificationId } });
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  if (loading) return <p className="p-4 text-gray-500 dark:text-slate-500">Loading…</p>;
  if (error) return <p className="p-4 text-red-400">Error loading notifications.</p>;

  const handleNotifView = (projectId, notificationId, entity) => {
    handleMarkAsRead(notificationId);

    console.log("Entity type:", entity);

    if(entity === "ProjectMgnt") {
        navigate(`/${isAdmin ? "admin" : isManager ? "manager" : isPm ? "projectmanager" : "employee"}/projectmgntdetails/${projectId}`);
    }else{
      navigate(`/${isAdmin ? "admin" : isManager ? "manager" : isPm ? "projectmanager" : "employee"}/projectdetails/${projectId}`);
    }
  };



  return (
    <div className="flex flex-col w-full h-full bg-gray-50 dark:bg-[#181d28] rounded-2xl border border-gray-200 dark:border-[#2a3040] overflow-hidden">

      {/* ── Header ── */}
      <div className="bg-white dark:bg-[#222732] px-4 pt-4 pb-3 border-b border-gray-100 dark:border-[#2a3040]">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-6 rounded-full bg-indigo-500 dark:bg-[#31f64b]" />
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-indigo-500 dark:text-[#31f64b]" />
            <h1 className="text-lg font-bold text-gray-800 dark:text-slate-100">Notifications</h1>
          </div>
        </div>
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {notifications.length > 0 ? (
          notifications.map((n) => {
            const typeColor = TYPE_COLORS[n.type?.toLowerCase()] ?? "#6366f1";
            return (
              <motion.div
                key={n.id}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="bg-white dark:bg-[#222732] rounded-xl border border-gray-100 dark:border-[#2a3040] p-4 flex flex-col gap-2
                  shadow-sm dark:shadow-none hover:bg-gray-50 dark:hover:bg-[#252d3d] transition-colors duration-150"
                style={{ borderLeft: `4px solid ${typeColor}` }}
              >
                {/* Title + time */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-800 dark:text-slate-100">
                    {n.title}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">
                    {formatTimeAgo(n.createdAt)}
                  </span>
                </div>

                {/* Message */}
                <p className="text-sm text-gray-600 dark:text-slate-400">{n.message}</p>

                {/* Footer row */}
                <div className="flex flex-wrap items-center gap-2 mt-1">

                  {/* Sender avatar + name */}
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-purple-500 dark:from-[#31f64b] dark:to-blue-500 flex items-center justify-center text-white dark:text-black font-semibold text-[10px]">
                      {getInitials(n.sender?.fullname)}
                    </div>
                    <span className="text-xs text-gray-600 dark:text-slate-400 font-medium">
                      {n.sender?.id === userId ? "Me" : n.sender?.fullname}
                    </span>
                  </div>

                  {/* Type badge */}
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: `${typeColor}18`, color: typeColor }}
                  >
                    {n.type}
                  </span>

                  {/* Entity badge */}
                  {n.entity && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#2a3040] text-gray-500 dark:text-slate-400">
                      {n.entity.type}
                    </span>
                  )}

                  {/* Read / Unread badge */}
                  <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full
                    ${n.isRead
                      ? "bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-[#31f64b]"
                      : "bg-orange-50 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400"
                    }`}
                  >
                    {n.isRead ? "Read" : "Unread"}
                  </span>

                  {/* Mark as read button */}
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="text-xs font-medium px-2 py-1 cursor-pointer rounded-full flex items-center gap-1 transition-all duration-150
                        bg-green-300 text-black hover:bg-green-500 hover:text-white
                        dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940]
                        dark:hover:shadow-[0_0_8px_rgba(49,246,75,0.35)]"
                    >
                      <CheckCheck size={12} />
                      Mark as read
                    </button>
                  )}

                  {/* View button */}
                  <button
                    onClick={() => handleNotifView(n.entity.id || "", n.id, n.entity.type)}
                    className="text-xs font-medium px-2 py-1 cursor-pointer rounded-full flex items-center gap-1 transition-all duration-150
                      bg-blue-300 text-black hover:bg-blue-500 hover:text-white
                      dark:bg-blue-600/90 dark:text-white dark:hover:bg-blue-500
                      dark:hover:shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                  >
                    View
                    <ArrowRight size={12} />
                  </button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-[#1e2b20] flex items-center justify-center">
              <BellOff size={28} className="text-indigo-300 dark:text-[#31f64b]/50" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                You're all caught up!
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                No notifications yet. We'll let you know when something arrives.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}