import api from "dashboard/utils/api";
import * as Preact from "preact";
import { useContext } from "preact/hooks";
import { useHistory } from "react-router-dom";
import { AccessContext } from "../context";

export default function Logout() {
  const { setAccess } = useContext(AccessContext);
  const onSubmit = (e) => {
    e.preventDefault();
    api.put("/_api/logout").then(() => {
      setAccess({ canAccessDashboard: false });
    });
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
        <div class="buttons">
          <button
            class="button-alt"
            type="cancel"
            onClick={(e) => {
              e.preventDefault();
              history.goBack();
            }}
          >
            Cancel
          </button>
          <button class="button-secondary" type="submit">
            Log out
          </button>
        </div>
      </form>
    </>
  );
}
