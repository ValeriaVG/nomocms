<script>
  import logo from "../logo.svg";
  import ThemeSwitch from "../elements/theme-switch.svelte";
  import { userStore } from "../stores";
  import api from "../utils/api";
  import { onMount } from "svelte";
  let user = { email: "" };
  let version = "";
  userStore.subscribe((currentUser) => {
    user = currentUser;
  });
  const logout = async () => {
    await api.delete("/account/login");
    userStore.set(null);
  };
  onMount(async () => {
    const result = await api.get("/version");
    version = result.version;
  });
</script>

<div class="wrapper">
  <header>
    <img src={logo} alt="NoMoCMS" />
    <div class="switch">
      <ThemeSwitch />
    </div>
  </header>
  <aside>
    <nav>
      <ul>
        <li>
          <a href="/content/root"> Home Page</a><button
            class="add"
            title="Add page">+</button
          >
        </li>
      </ul>
    </nav>
    <nav>
      <ul>
        <li><a href="/settings">Settings</a></li>
        <li><button on:click={logout}>Log out</button></li>
      </ul>
    </nav>
  </aside>
  <main>
    <h1>Welcome,{user.email}</h1>
  </main>
  <footer>
    <a
      href="https://github.com/ValeriaVG/nomocms"
      target="_blank"
      class="version">NoMoCMS@{version}</a
    >
  </footer>
</div>

<style>
  .wrapper {
    flex: 1;
    height: 100vh;
    width: 100vw;
    display: grid;
    grid-template-areas:
      "header header"
      "aside ."
      "footer footer";
    grid-template-rows: 4.5rem 1fr;
    grid-template-columns: 20% 1fr;
    row-gap: 0;
    column-gap: 2rem;
  }
  header {
    grid-area: header;
    background: var(--bg-color);
    display: flex;
    padding: 1rem 1rem;
  }
  .switch {
    margin-left: auto;
  }
  aside {
    grid-area: aside;
    display: flex;
    flex-direction: column;
    padding: 1rem;
  }

  aside nav {
    background: var(--neutral-color);
    border-radius: 0.5rem;
    padding: 0.5rem 0;
  }
  aside nav ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
  aside nav + nav {
    margin-top: 1rem;
  }
  main {
    margin-right: 1rem;
  }
  aside ul a,
  aside ul button {
    color: var(--text-color);
    display: flex;
    padding: 0.5rem 1rem;
    background: transparent;
    border: none;
    font-size: 1rem;
    border-radius: 0;
    flex: 1;
    box-sizing: border-box;
    text-decoration: none;
    transition: 0.4s;
  }
  aside ul button {
    cursor: pointer;
  }
  aside a:hover,
  aside a.active,
  ul button:hover {
    background: var(--primary-color);
    color: white;
    transition: 0.4s;
  }
  aside ul li {
    display: flex;
  }
  aside nav ul li button.add {
    margin: auto 1rem;
    background: transparent;
    flex: 0;
    display: flex;
    border: 1px dashed var(--text-color);
    height: 1.5rem;
    width: 1.5rem;
    min-width: 1.5rem;
    padding: 0.25rem;
    line-height: 1rem;
    border-radius: 0.25rem;
    opacity: 0.75;
    align-items: center;
    justify-content: center;
    text-align: center;
    transition: 0.4s;
  }
  aside nav ul li button.add:hover {
    opacity: 1;
    background: var(--text-color);
    color: var(--bg-color);
    transition: 0.4s;
  }

  footer {
    padding: 1rem;
    font-size: 0.8rem;
    grid-area: footer;
    display: flex;
  }
  .version {
    opacity: 0.5;
    margin-left: auto;
    color: var(--text-color);
  }
</style>
