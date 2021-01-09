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
import { useContext } from "preact/hooks";
import { NotificationContext } from "./utils/notifications";
import NotificationElement from "./components/NotificationElement";

export default function Layout({
  children,
}: {
  children: Preact.ComponentChildren;
}) {
  const { notifications } = useContext(NotificationContext);
  return (
    <>
      <header>
        <button>
          <FontAwesomeIcon icon={faBars} />
        </button>
      </header>
      <aside>
        <nav>
          <ul class="menu">
            <li>
              <NavLink to="/" exact>
                <FontAwesomeIcon icon={faHome} />
              </NavLink>
            </li>
            <li>
              <NavLink to="/pages">
                <FontAwesomeIcon icon={faBook} />
              </NavLink>
            </li>
            <li>
              <NavLink to="/users">
                <FontAwesomeIcon icon={faUsers} />
              </NavLink>
            </li>
            <li>
              <NavLink to="/styles">
                <FontAwesomeIcon icon={faPalette} />
              </NavLink>
            </li>
            <li>
              <NavLink to="/templates">
                <FontAwesomeIcon icon={faColumns} />
              </NavLink>
            </li>
          </ul>
        </nav>
        <nav class="bottom-nav">
          <ul class="menu">
            <li>
              <NavLink to="/logout">
                <FontAwesomeIcon icon={faSignOutAlt} />
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
      <footer>AMP CMS v0.0.1</footer>
    </>
  );
}
