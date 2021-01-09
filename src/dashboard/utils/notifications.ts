import { createContext, JSX } from "preact";
import { useContext, useEffect, StateUpdater } from "preact/hooks";

export type Notification = {
  id: string;
  variant: "success" | "warning" | "error" | "info";
  content: string | JSX.Element;
  ttl?: number;
};

export const NotificationContext = createContext<{
  notifications: Notification[];
  setNotifications: StateUpdater<Array<Notification>>;
}>({ notifications: [], setNotifications: () => {} });

export default function useNotification() {
  const { setNotifications } = useContext(NotificationContext);
  const remove = (id: string) =>
    setNotifications((notifications) =>
      notifications.filter((a) => a.id !== id)
    );
  const add = (notification: Notification) => {
    try {
      setTimeout(() => remove(notification.id), (notification.ttl ?? 5) * 1000);
    } catch (error) {}
    setNotifications((notifications) => [notification, ...notifications]);
  };

  return { add, remove };
}

export function Notify(props: Notification) {
  const { add, remove } = useNotification();
  useEffect(() => {
    add(props);
    return () => remove(props.id);
  }, [JSON.stringify(props)]);
  return null;
}
