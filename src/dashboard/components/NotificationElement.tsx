import { faTimes } from "@fortawesome/free-solid-svg-icons";
import FontAwesomeIcon from "dashboard/utils/FontAwesomeIcon";
import * as Preact from "preact";
import { useEffect, useState } from "preact/hooks";
import { Notification } from "../utils/notifications";
import "./notifications.scss";
export default function NotificationElement({
  content,
  variant,
  ttl,
}: Notification) {
  const [timeLeft, updateTimeLeft] = useState(ttl);
  useEffect(() => {
    if (!ttl) return;
    const timer = setInterval(() => {
      updateTimeLeft((t) => (t += -0.1));
    }, 100);
    return () => clearInterval(timer);
  }, [ttl]);

  return (
    <div class={`notification notification-${variant}`}>
      <span style="position:absolute;top:0.25rem;right:0.5rem;opacity:0.5">
        <FontAwesomeIcon icon={faTimes} size="xs" aria-label="Close" />
      </span>
      <meta name="ttl-seconds" value={timeLeft.toFixed(0)} />
      <div class="notification--progress">
        <div
          class="notification--progress--value"
          style={{ width: `${(timeLeft / ttl) * 100}%` }}
        />
      </div>
      <div class="notification--content">{content}</div>
    </div>
  );
}
