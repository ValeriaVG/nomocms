import api from "dashboard/utils/api";
import { useContext } from "react";
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
        <label style={{ padding: 0, margin: "1rem 0" }}>
          Are you sure you want to logout?
        </label>
        <div className="buttons">
          <button
            className="button-alt"
            type="reset"
            onClick={(e) => {
              e.preventDefault();
              history.goBack();
            }}
          >
            Cancel
          </button>
          <button className="button-secondary" type="submit">
            Log out
          </button>
        </div>
      </form>
    </>
  );
}
