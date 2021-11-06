<script>
  import Editor from "./editor.svelte";
  import api from "dashboard/src/utils/api";
  import { onMount } from "svelte";
  export let id = "";
  export let parent = "";

  let title = "";
  let path = id === "root" ? "/" : "";
  let content = "";
  let parameters = "{}";
  let preview = "";
  let timer = null;
  const fetchPage = async (id) => {
    if (id && id !== "root") {
      const { page } = await api.get(`/content/${id}`);
      console.log(page);
      title = page.title;
      content = page.content;
      parameters = JSON.stringify(page.parameters || {});
      path = page.path;
      await getPreview({ content, title, parameters }, true);
    } else {
      title = "";
      content = "";
      parameters = "{}";
      path = id === "root" ? "/" : "";
    }
  };

  onMount(() => fetchPage(id));
  $: fetchPage(id);
  const tabs = ["Content", "Parameters"];
  let activeTab = tabs[0];

  const getPreview = async (params, force = false) => {
    if (timer) clearTimeout(timer);
    const fetchPreview = async () => {
      const result = await api.post("/content/preview", params);
      if (typeof result === "string") preview = result;
      else console.error(result.error);
    };
    if (force) return fetchPreview();
    timer = setTimeout(fetchPreview, 500);
  };
  $: getPreview({ content, title, parameters });

  const save = async () => {
    const input = {
      content,
      title,
      path,
      parameters,
      parent_id: parent === "root" ? null : parent || null,
    };

    let res;
    if (id && id !== "root") {
      res = await api.put(`/content/${id}`, input);
    } else {
      res = await api.post("/content", input);
    }
    console.info(res);
  };
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
  <button class="save" on:click={save}>Save</button>
</nav>
{#if activeTab === "Content"}
  <div class="split">
    <input type="text" bind:value={title} placeholder="Page title" />
    <input type="text" bind:value={path} placeholder="Page URL" />
    <div class="editor"><Editor bind:value={content} /></div>
    <iframe srcdoc={preview} title="preview" />
  </div>
{/if}
{#if activeTab === "Parameters"}
  <Editor bind:value={parameters} mode="json" />
{/if}

<style>
  iframe {
    background: white;
    border: none;
    width: 100%;
    height: 100%;
  }
  .editor {
    width: auto;
    flex: 1;
  }
  .split {
    width: 100%;
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr 1fr;
  }
  .tabs {
    margin: 1rem 0;
    border-bottom: 1px solid var(--border-color);
    display: flex;
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
    color: var(--text-color);
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
    color: white;
    opacity: 1;
    transition: 0.4s;
  }
  .tabs li + li {
    margin-left: 0.5rem;
  }
  input {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.25rem;
    margin-top: 0.25rem;
  }
  .save {
    background: var(--secondary-color);
    color: white;
    border: none;
    padding: 0.5rem 1.25rem;
    margin-left: auto;
    border-radius: 0.25rem;
    opacity: 0.75;
    transition: 0.4s;
  }
  .save:hover {
    cursor: pointer;
    opacity: 1;
    transition: 0.4s;
  }
</style>
