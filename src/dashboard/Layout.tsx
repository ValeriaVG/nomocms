import * as Preact from "preact";
import {
  faBars,
  faColumns,
  faHome,
  faPalette,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import FontAwesomeIcon from "./utils/FontAwesomeIcon";

export default function Layout({
  children,
}: {
  children: Preact.ComponentChildren;
}) {
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
      </aside>
      <main>{children}</main>
      <footer>AMP CMS v0.0.1</footer>
    </>
  );
}
