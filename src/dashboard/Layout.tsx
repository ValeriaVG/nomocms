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

import React, { useContext, useState, PropsWithChildren } from "react";
import { NotificationContext } from "./utils/notifications";
import NotificationElement from "./components/NotificationElement";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Layout({ children }: PropsWithChildren<{}>) {
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
      <aside className={isExpanded ? "expanded" : undefined}>
        <nav>
          <ul className="menu">
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
        <nav className="bottom-nav">
          <ul className="menu">
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
        <div className="notifications">
          {notifications.map((notification) => (
            <NotificationElement key={notification.id} {...notification} />
          ))}
        </div>
        {children}
      </main>
      <footer>AMP CMS {process.env.VERSION}</footer>
    </>
  );
}
