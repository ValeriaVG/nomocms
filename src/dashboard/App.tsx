import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import * as Preact from "preact";
import { useEffect, useState } from "preact/hooks";
//import Dashboard from "./Dashboard";
import Login from "./pages/Login";
import api from "./utils/api";
import FontAwesomeIcon from "./utils/FontAwesomeIcon";

type AppUserState = {
  canAccessDashboard: boolean;
  user?: { id: string; email: string };
};

export const UserContext = Preact.createContext<
  AppUserState & { setState: (newState: AppUserState) => void }
>({
  canAccessDashboard: false,
  setState: () => {},
});

export default function App() {
  const [{ loading, ...state }, setState] = useState<{
    loading: boolean;
    canAccessDashboard: boolean;
    user?: { id: string; email: string };
  }>({ loading: true, canAccessDashboard: false });
  const checkAccess = async () => {
    try {
      const { canAccessDashboard, user } = await api.get("/_api/access");
      setState({ canAccessDashboard, user, loading: false });
    } catch (error) {
      // TODO: notification?
      console.error(error);
      setState({ canAccessDashboard: false, user: undefined, loading: false });
    }
  };
  useEffect(() => {
    checkAccess();
  }, []);
  return (
    <UserContext.Provider
      value={{
        ...state,
        setState: ({ canAccessDashboard, user }) =>
          setState({ loading: false, canAccessDashboard, user }),
      }}
    >
      {(() => {
        if (loading) return <FontAwesomeIcon icon={faCircleNotch} spin />;
        if (state.canAccessDashboard) return <>Dashboard Will Load Here</>;
        return <Login />;
      })()}
    </UserContext.Provider>
  );
}
