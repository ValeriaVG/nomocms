import { html } from "amp/lib";
import app from "dashboard/app";
import SnackBar from "dashboard/components/snack-bar";
import api from "dashboard/utils/api";
import gql from "utils/gql";
import styles from "./styles.scss";

const LOGIN = gql`
  mutation ($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      canAccessDashboard
      token
    }
  }
`;

export default class LoginPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = html`<main class="${styles.login}">
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
    document.querySelector("form").onsubmit = this.onSubmit;
  }

  private setAMPAccessCookie = (token: string) => {
    if (!token) return;
    document.cookie = `amp-access=${token}; expires=${new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toUTCString()}; domain=${document.location.host
      .split(":")
      .shift()}; path=/`;
  };

  private onSubmit = async (e) => {
    e.preventDefault();
    const data = Array.from(new FormData(e.target).entries()).reduce(
      (a, c) => ({
        ...a,
        [c[0]]: c[1],
      }),
      {}
    );
    const result = await api.query<{
      login:
        | { canAccessDashboard: true; token: string }
        | { canAccessDashboard: false };
    }>(LOGIN, data);
    const snackbar: SnackBar = document.querySelector("snack-bar");
    if ("errors" in result) {
      for (const error of result.errors) {
        snackbar.addNotification({
          type: "error",
          title: "Failed to log in",
          message: error.message,
          timeoutMS: 15_000,
        });
      }
      return;
    }
    if (result.data.login.canAccessDashboard) {
      this.setAMPAccessCookie(result.data.login.token);
      app.setState({ hasAccess: true });
    }
  };
}
