<slot />

<style>
  :global(html) {
    --bg-color: black;
    --text-color: white;
    --primary-color: #8f58c7;
    --primary-hover: rgb(116, 52, 180);
    --secondary-color: #87d787;
    --neutral-color: #eceff1;
    --border-color:rgba(255,255,255,0.08)
    min-height: 100vh;
    padding: 0;
    margin: 0;
  }
  :global(html[data-theme="dark"]) {
    --bg-color: #040404;
    --text-color: white;
    --neutral-color: rgba(255, 255, 255, 0.08);
    --border-color:rgba(255,255,255,0.08)
  }
  :global(html[data-theme="light"]) {
    --bg-color: #eceff1;
    --text-color: #212121;
    --neutral-color: #fafafa;
    --border-color:rgba(0,0,0,0.08)
  }
  :global(body) {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 16px;
    line-height: 1.2;
    margin: 0;
    padding: 0;
    background-color: var(--bg-color);
    color: var(--text-color);
    width: 100%;
    height: 100vh;
  }
  :global(html) {
    background-color: var(--bg-color);
    color: var(--text-color);
  }
</style>
