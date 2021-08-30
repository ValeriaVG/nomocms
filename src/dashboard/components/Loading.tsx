import * as Preact from "preact";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import FontAwesomeIcon from "dashboard/utils/FontAwesomeIcon";
import styles from "./loading.scss";
export default function Loading(
  props: Preact.JSX.HTMLAttributes<HTMLDivElement>
) {
  return (
    <div
      {...props}
      class={[props.class, props.className, styles["loading-screen"]]
        .filter(Boolean)
        .join(" ")}
    >
      <FontAwesomeIcon icon={faCircleNotch} spin />
    </div>
  );
}
