<script>
  import Editor from "./editor.svelte";
  import api from "dashboard/src/utils/api";
  //export let id = "";
  //export let parent = ""

  let title = "";
  let content = "";
  let parameters = "{}";
  let preview = "";
  let timer = null;

  const tabs = ["Content", "Parameters"];
  let activeTab = tabs[0];

  const getPreview = async (params) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      const result = await api.post("/content/preview", params);
      if (typeof result === "string") preview = result;
      else console.error(result.error);
    }, 500);
  };
  $: getPreview({ content, title, parameters });
</script>

<nav class="tabs">
  <ul>
    {#each tabs as tab}
      <li>
        <button
          class={activeTab === tab ? "active" : ""}
          on:click={() => (activeTab = tab)}>{tab}</button
        >
      </li>
    {/each}
  </ul>
</nav>
{#if activeTab === "Content"}
  <div class="split">
    <div class="editor"><Editor bind:value={content} /></div>
    <iframe srcdoc={preview} title="preview" />
  </div>
{/if}
{#if activeTab === "Parameters"}
  <Editor bind:value={parameters} />
{/if}

<style>
  iframe {
    background: white;
    border: none;
    width: 50%;
    margin-left: 1rem;
  }
  .editor {
    width: auto;
    flex: 1;
  }
  .split {
    width: 100%;
    display: flex;
  }
  .tabs {
    margin: 1rem 0;
    border-bottom: 1px solid var(--border-color);
  }
  .tabs ul {
    list-style-type: none;
    padding: 0;
    display: flex;
    margin: 0;
  }
  .tabs ul button {
    border: none;
    background: var(--neutral-color);
    opacity: 0.75;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0;
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    transition: 0.4s;
  }
  .tabs ul button:hover {
    opacity: 1;
    cursor: pointer;
    transition: 0.4s;
  }
  .tabs ul button.active {
    background: var(--primary-color);
    opacity: 1;
    transition: 0.4s;
  }
  .tabs li + li {
    margin-left: 0.5rem;
  }
</style>
