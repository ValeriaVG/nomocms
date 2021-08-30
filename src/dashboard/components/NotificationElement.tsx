import { faTimes } from "@fortawesome/free-solid-svg-icons";
import FontAwesomeIcon from "dashboard/utils/FontAwesomeIcon";
import * as Preact from "preact";
import { useEffect, useState } from "preact/hooks";
import useNotification, { Notification } from "../utils/notifications";
import styles from "./notifications.scss";

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
      class={`${styles.notification} ${styles[variant]}`}
      onClick={() => remove(id)}
    >
      <span style="position:absolute;top:0.25rem;right:0.5rem;opacity:0.5">
        <FontAwesomeIcon icon={faTimes} size="xs" aria-label="Close" />
      </span>
      {Boolean(ttl) && (
        <>
          <meta name="ttl-seconds" value={timeLeft?.toFixed(0)} />
          <div class={styles.progress}>
            <div
              class={styles["progress-value"]}
              style={{ width: `${(timeLeft / ttl) * 100}%` }}
            />
          </div>
        </>
      )}
      <div class={styles.content}>{content}</div>
    </div>
  );
}
