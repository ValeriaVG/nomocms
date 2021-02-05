import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import useNotification, { Notification } from "../utils/notifications";
import "./notifications.scss";

export default function NotificationElement({
  id,
  content,
  variant,
  ttl,
}: Notification) {
  const [timeLeft, updateTimeLeft] = useState(ttl);
  const { remove } = useNotification();
  useEffect(() => {
    if (!ttl) return;
    const timer = setInterval(() => {
      updateTimeLeft((t) => {
        t += -0.1;
        if (t <= 0) remove(id);
        return t;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [ttl]);

  return (
    <div
      className={`notification notification-${variant}`}
      onClick={() => remove(id)}
    >
      <span
        style={{
          position: "absolute",
          top: "0.25rem",
          right: "0.5rem",
          opacity: 0.5,
        }}
      >
        <FontAwesomeIcon icon={faTimes} size="xs" aria-label="Close" />
      </span>
      {Boolean(ttl) && (
        <>
          <meta name="ttl-seconds" content={timeLeft?.toFixed(0)} />
          <div className="notification--progress">
            <div
              className="notification--progress--value"
              style={{ width: `${(timeLeft / ttl) * 100}%` }}
            />
          </div>
        </>
      )}
      <div className="notification--content">{content}</div>
    </div>
  );
}
