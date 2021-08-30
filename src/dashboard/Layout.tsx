import * as Preact from "preact";
import {
  faBars,
  faBook,
  faColumns,
  faHome,
  faPalette,
  faSignOutAlt,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useContext, useState } from "preact/hooks";
import FontAwesomeIcon from "./utils/FontAwesomeIcon";
import { NavLink } from "dashboard/utils/BrowserRouter";
import { NotificationContext } from "./utils/notifications";
import NotificationElement from "./components/NotificationElement";
import styles from "./layout.scss";
import Logo from "./components/Logo";

export default function Layout({
  children,
}: {
  children: Preact.ComponentChildren;
}) {
  const { notifications } = useContext(NotificationContext);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const toggleMenu = () => setIsExpanded((t) => !t);
  return (
    <div class={styles.layout}>
      <header>
        <button onClick={toggleMenu}>
          <FontAwesomeIcon icon={faBars} />
        </button>
      </header>
      <aside class={isExpanded && styles.expanded}>
        <nav>
          <ul class={styles.menu}>
            <li>
              <NavLink to="/" exact>
                <FontAwesomeIcon icon={faHome} />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/pages">
                <FontAwesomeIcon icon={faBook} />
                <span>Pages</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/users">
                <FontAwesomeIcon icon={faUsers} />
                <span>Users</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/styles">
                <FontAwesomeIcon icon={faPalette} />
                <span>Styles</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/templates">
                <FontAwesomeIcon icon={faColumns} />
                <span>Templates</span>
              </NavLink>
            </li>
          </ul>
        </nav>
        <nav class={styles["bottom-nav"]}>
          <ul class={styles.menu}>
            <li>
              <NavLink to="/logout">
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>Log out</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
      <main>
        <div class={styles.notifications}>
          {notifications.map((notification) => (
            <NotificationElement key={notification.id} {...notification} />
          ))}
        </div>
        {children}
      </main>
      <footer>
        <Logo /> v0.1.0
      </footer>
    </div>
  );
}
