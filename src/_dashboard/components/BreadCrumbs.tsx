import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Fragment, HTMLProps } from "react";

import { Link } from "react-router-dom";
import "./breadcrumbs.scss";

export default function BreadCrumbs({
  path,
  ...props
}: HTMLProps<HTMLDivElement> & {
  path: Array<{ to?: string; label: string | React.ReactElement }>;
}) {
  return (
    <nav className="breadcrumbs" {...props}>
      <ul>
        {path.map(({ to, label }, i) => {
          return (
            <Fragment key={i}>
              <li>{to ? <Link to={to}>{label}</Link> : label}</li>
              {i !== path.length - 1 && (
                <li style={{ margin: "0 0.5rem" }}>
                  <FontAwesomeIcon icon={faAngleRight} size={"xs"} />
                </li>
              )}
            </Fragment>
          );
        })}
      </ul>
    </nav>
  );
}
