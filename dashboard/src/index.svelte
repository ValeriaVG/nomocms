<script>
  import { onMount } from "svelte";
  import logo from "./logo.svg";
  let title = "NoMoCMS";
  let version = "";
  onMount(async () => {
    const response = await fetch("http://localhost:3030/version", {
      mode: "cors",
    });
    const result = await response.json();
    version = result.version;
  });
</script>

<main>
  <img src={logo} alt={title} />
  <p>{version}</p>
</main>

<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
    height: 100vh;
    width: 100vw;
  }

  main {
    height: 100vh;
    width: 100vw;
    background: black;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>
