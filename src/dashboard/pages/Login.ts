import { html } from "amp/lib";
import logo from "dashboard/components/logo";
import api from "dashboard/utils/api";
import styles from "./styles.scss";

export default {
  setAMPAccessCookie: (token: string) => {
    if (!token) return;
    document.cookie = `amp-access=${token}; expires=${new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toUTCString()}; domain=${document.location.host
      .split(":")
      .shift()}; path=/`;
  },
  onSubmit(e) {
    e.preventDefault();
    const data = Array.from(new FormData(e.target).entries()).reduce(
      (a, c) => ({
        ...a,
        [c[0]]: c[1],
      }),
      {}
    );
    return api.post("/_api/login", data).then(this.logUserIn);
  },
  render(container: HTMLElement) {
    container.innerHTML = html`<main class="${styles.login}">
      <form>
        ${logo}
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
    </main>`;
  },
};
