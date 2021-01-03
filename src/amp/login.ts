import { html } from "./lib";

export const body = html`
  <div amp-access="authorized">You are logged in!</div>
  <div amp-access="NOT authorized" amp-access-hide>
    <h1>Login</h1>
    <form method="post" action-xhr="/api/login" target="_top">
      <fieldset>
        <label>
          <span>Email:</span>
          <input type="email" name="email" required autocomplete="email" />
        </label>
        <br />
        <label>
          <span>Password:</span>
          <input
            type="password"
            name="password"
            required
            autocomplete="current-password"
          />
        </label>
        <br />
        <input type="submit" value="Login" />
      </fieldset>
      <div submit-success>
        <template type="amp-mustache"> Login successful! </template>
      </div>
      <div submit-error>
        <template type="amp-mustache"> Login failed! </template>
      </div>
    </form>
  </div>
`;
export const head = html`<script
    async
    custom-element="amp-form"
    src="https://cdn.ampproject.org/v0/amp-form-0.1.js"
  ></script>
  <script
    async
    custom-template="amp-mustache"
    src="https://cdn.ampproject.org/v0/amp-mustache-0.2.js"
  ></script>
  <script
    async
    custom-element="amp-access"
    src="https://cdn.ampproject.org/v0/amp-access-0.1.js"
  ></script>
  <script id="amp-access" type="application/json">
    {
      "authorization": "/api/access?rid=READER_ID&url=SOURCE_URL",
      "pingback": "/api/ping?rid=READER_ID&url=SOURCE_URL",
      "login": "/login?rid=READER_ID&url=SOURCE_URL",
      "authorizationFallbackResponse": { "error": true }
    }
  </script> `;
