import * as Preact from "preact";
import { useContext } from "preact/hooks";
import api from "dashboard/utils/api";
import styles from "./login.scss";
import preventDefault from "../utils/preventDefault";
import { UserContext } from "../App";
import Logo from "dashboard/components/Logo";

export default function Login() {
  const { setState } = useContext(UserContext);
  const onSubmit = preventDefault(async (e) => {
    const form = e.target as HTMLFormElement;
    const { email, password } = Array.from(new FormData(form).entries()).reduce(
      (a, c) => ({
        ...a,
        [c[0]]: c[1],
      }),
      {} as Record<string, string>
    );
    const { canAccessDashboard, user } = await api.post("/_api/login", {
      email,
      password,
    });
    // TODO: catch?
    setState({ canAccessDashboard, user });
  });
  return (
    <main class={styles.login}>
      <form onSubmit={onSubmit}>
        <Logo />
        <fieldset>
          <label> Email: </label>
          <input
            type="email"
            name="email"
            autocomplete="email"
            placeholder="Enter your e-mail"
          />
          <label> Password:</label>
          <input
            type="password"
            name="password"
            autocomplete="password"
            placeholder="Enter your password"
          />
        </fieldset>
        <button type="submit">Login</button>
      </form>
    </main>
  );
}
