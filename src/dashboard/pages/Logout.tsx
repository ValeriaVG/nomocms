import * as Preact from "preact";
import api from "dashboard/utils/api";
import { useHistory } from "dashboard/utils/BrowserRouter";
import styles from "../layout.scss";

export default function Logout() {
  const onSubmit = (e) => {
    e.preventDefault();
    api.put("/_api/logout").then(() => (document.location.href = "/admin"));
  };
  const history = useHistory();
  return (
    <>
      <header>
        <h1>Logout</h1>
      </header>
      <form onSubmit={onSubmit}>
        <label style="padding:0;margin:1rem 0">
          Are you sure you want to logout?
        </label>
        <div class={styles.buttons}>
          <button
            class={styles["button-alt"]}
            type="cancel"
            onClick={(e) => {
              e.preventDefault();
              history.goBack();
            }}
          >
            Cancel
          </button>
          <button class={styles["button-secondary"]} type="submit">
            Log out
          </button>
        </div>
      </form>
    </>
  );
}
