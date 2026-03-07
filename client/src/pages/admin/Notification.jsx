import React, { useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { useQuery, useSubscription } from "@apollo/client/react";
import { gql } from "@apollo/client";

const NOTIFICATIONS = gql`
  query Notifications {
    notifications {
      id
      recipients
      sender
      type
      title
      message
      entity {
        type
        id
      }
      isRead
      createdAt
    }
  }
`;

const NOTIFICATION_SUB = gql`
  subscription NotificationAdded($userId: ID!) {
    notificationAdded(userId: $userId) {
      id
      recipients
      sender
      type
      title
      message
      entity {
        type
        id
      }
      isRead
      createdAt
    }
  }
`;

function Notification() {
  const userId = useSelector((state) => state?.auth?.user?.id);

  const { data, loading, error } = useQuery(NOTIFICATIONS);

  const { data: subData } = useSubscription(NOTIFICATION_SUB, {
    variables: { userId },
  });

  const [notifications, setNotifications] = useState([]);

  // initial load
  useEffect(() => {
    function isNotifications() {
      if (data?.notifications) {
        setNotifications(data.notifications);
      }
    }
    isNotifications();
  }, [data]);

  // realtime update
  useEffect(() => {
    function isNotificationAdded() {
      if (subData?.notificationAdded) {
        setNotifications((prev) => [subData.notificationAdded, ...prev]);
      }
    }
    isNotificationAdded();
    
  }, [subData]);

  if (loading) return <p>Loading notifications...</p>;
  if (error) return <p>Error loading notifications</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
      <h2>Notifications</h2>

      {notifications.length === 0 && <p>No notifications.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {notifications.map((notif) => (
          <li
            key={notif.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1rem",
              backgroundColor: notif.isRead ? "#f9f9f9" : "#e6f7ff",
            }}
          >
            <h3>{notif.title}</h3>
            <p>{notif.message}</p>

            <p style={{ fontSize: "0.85rem", color: "#555" }}>
              Type: {notif.type} | Entity: {notif.entity?.type} (
              {notif.entity?.id})
            </p>

            <p style={{ fontSize: "0.75rem", color: "#999" }}>
              Received: {new Date(notif.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Notification;
