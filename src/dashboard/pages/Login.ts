import { html } from "amp/lib";
import app from "dashboard";
import api from "dashboard/utils/api";
import styles from "./styles.scss";

import "../components/logo";

const setAMPAccessCookie = (token: string) => {
  if (!token) return;
  document.cookie = `amp-access=${token}; expires=${new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ).toUTCString()}; domain=${document.location.host
    .split(":")
    .shift()}; path=/`;
};

export default {
  async onSubmit(e) {
    e.preventDefault();
    const data = Array.from(new FormData(e.target).entries()).reduce(
      (a, c) => ({
        ...a,
        [c[0]]: c[1],
      }),
      {}
    );
    const result = await api.post("/_api/login", data);
    if (!result?.canAccessDashboard) return;
    setAMPAccessCookie(result.token);
    app.setState({ hasAccess: true });
  },
  render(container: HTMLElement) {
    container.innerHTML = html`<main class="${styles.login}">
      <form>
        <app-logo size="0.25">NoMoCMS</app-logo>
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
    container.querySelector("form").onsubmit = this.onSubmit;
  },
};
