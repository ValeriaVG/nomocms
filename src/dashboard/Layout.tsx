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
import { NavLink } from "react-router-dom";
import FontAwesomeIcon from "./utils/FontAwesomeIcon";
import { useContext, useState } from "preact/hooks";
import { NotificationContext } from "./utils/notifications";
import NotificationElement from "./components/NotificationElement";
import { version } from "config";

export default function Layout({
  children,
}: {
  children: Preact.ComponentChildren;
}) {
  const { notifications } = useContext(NotificationContext);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const toggleMenu = () => setIsExpanded((t) => !t);
  return (
    <>
      <header>
        <button onClick={toggleMenu}>
          <FontAwesomeIcon icon={faBars} />
        </button>
      </header>
      <aside class={isExpanded && "expanded"}>
        <nav>
          <ul class="menu">
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
        <nav class="bottom-nav">
          <ul class="menu">
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
        <div class="notifications">
          {notifications.map((notification) => (
            <NotificationElement key={notification.id} {...notification} />
          ))}
        </div>
        {children}
      </main>
      <footer>AMP CMS {version}</footer>
    </>
  );
}
