<script>
  import logo from "../logo.svg";
  import ThemeSwitch from "../elements/theme-switch.svelte";
  import { onLinkClicked } from "../utils/link";
  import { userStore, pathStore } from "../stores";
  import api from "../utils/api";
  import { onMount } from "svelte";
  import Home from "./home.svelte";
  import Content from "./content.svelte";
  let Page = Home;
  const choosePage = (path) => {
    console.log(path);
    if (path === "/") {
      Page = Home;
      return;
    }
    if (path.startsWith("/content")) {
      Page = Content;
      return;
    }
  };

  let user = { email: "", id: "" };
  let version = "";
  const rootPage = { id: "root", title: "Home Page", path: "/" };
  let pages = [rootPage];
  userStore.subscribe((currentUser) => {
    user = currentUser;
  });
  const logout = async () => {
    await api.delete("/account/login");
    userStore.set(null);
  };
  onMount(async () => {
    choosePage(document.location.pathname);
    const result = await api.get("/version");
    version = result.version;
    const { items } = await api.get("/content?limit=99");
    const idxPage = items.find((p) => p.path === "/");
    pages = idxPage ? items : [rootPage, ...items];
  });

  pathStore.subscribe((path) => {
    choosePage(path);
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
        {#each pages as page}
          <li>
            <a href="/content/{page.id}" on:click={onLinkClicked}>
              {page.title}</a
            >
            <a
              href="/content/{page.id}/new"
              on:click={onLinkClicked}
              class="add"
              title="Add page to {page.title}">+</a
            >
          </li>
        {/each}
      </ul>
    </nav>
    <nav>
      <ul>
        <li><a href="/users" on:click={onLinkClicked}>Users</a></li>
        <li><a href="/settings" on:click={onLinkClicked}>Settings</a></li>
      </ul>
    </nav>
    <nav>
      <ul>
        <li>
          <a href="/users/{user.id}" on:click={onLinkClicked}>{user.email}</a>
        </li>
        <li><button on:click={logout}>Log out</button></li>
      </ul>
    </nav>
  </aside>
  <main>
    <svelte:component this={Page} />
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
    grid-template-columns: 16rem 1fr;
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
    display: flex;
    flex-direction: column;
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
  ul button:hover {
    background: var(--primary-color);
    color: white;
    transition: 0.4s;
  }
  aside ul li {
    display: flex;
    flex-wrap: wrap;
  }
  aside ul ul {
    width: 100%;
    box-sizing: border-box;
    padding-left: 1rem;
  }
  aside nav ul li a.add {
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
  aside nav ul li a.add:hover {
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
