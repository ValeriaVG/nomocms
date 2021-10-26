<script>
  import { createEventDispatcher } from "svelte";
  export let name = "toggle";
  export let title = "";
  export let checked = false;
  const dispatch = createEventDispatcher();
  const onChange = (e) => {
    const isDark = e.target.checked;
    dispatch("change", { isDark });
  };
</script>

<label class="switch" {title}>
  <input type="checkbox" {name} on:change={onChange} {checked} />
  <span class="slider">
    <span class="knob">
      <slot />
    </span>
  </span>
</label>

<style>
  /* The switch - the box around the slider */
  .switch {
    position: relative;
    display: inline-block;
    width: 4.5rem;
    height: 2.5rem;
  }

  /* Hide default HTML checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--neutral-color);
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  .knob {
    position: absolute;
    height: 2rem;
    width: 2rem;
    left: 0.25rem;
    bottom: 0.25rem;
    background-color: var(--bg-color);
    color: var(--text-color);
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  input:checked + .slider {
    background-color: var(--primary-color);
  }

  input:focus + .slider {
    box-shadow: 0 0 1px var(--primary-color);
  }

  input:checked + .slider .knob {
    -webkit-transform: translateX(2rem);
    -ms-transform: translateX(2rem);
    transform: translateX(2rem);
  }

  .slider {
    border-radius: 2.25rem;
  }
</style>
