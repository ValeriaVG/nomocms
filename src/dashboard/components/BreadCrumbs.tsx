import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import FontAwesomeIcon from "dashboard/utils/FontAwesomeIcon";
import * as Preact from "preact";
import { Link } from "../utils/BrowserRouter";
import styles from "./breadcrumbs.scss";

export default function BreadCrumbs({
  path,
  ...props
}: Preact.JSX.HTMLAttributes<HTMLDivElement> & {
  path: Array<{ to?: string; label: string | Preact.JSX.Element }>;
}) {
  return (
    <nav className={styles.breadcrumbs} {...props}>
      <ul>
        {path.map(({ to, label }, i) => {
          return (
            <Preact.Fragment key={i}>
              <li>{to ? <Link to={to}>{label}</Link> : label}</li>
              {i !== path.length - 1 && (
                <li style={{ margin: "0 0.5rem" }}>
                  <FontAwesomeIcon icon={faAngleRight} size={"xs"} />
                </li>
              )}
            </Preact.Fragment>
          );
        })}
      </ul>
    </nav>
  );
}
