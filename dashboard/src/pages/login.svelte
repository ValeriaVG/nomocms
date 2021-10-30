<script>
  import logo from "../logo.svg";
  import api from "../utils/api";
  import { userStore } from "../stores";
  const onSubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const { user } = await api.post("/account/login", data);
    if (user) userStore.set(user);
  };
</script>

<main>
  <form on:submit={onSubmit}>
    <img src={logo} alt="NoMoCMS" />
    <fieldset>
      <label for="email">Email</label>
      <input type="email" name="email" placeholder="Your email" />
      <label for="password">Password</label>
      <input type="password" name="password" placeholder="Your password" />
      <button type="submit">Login</button>
    </fieldset>
  </form>
</main>

<style>
  main {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  form {
    padding: 2rem;
    background: var(--neutral-color);
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
  }
  img {
    margin: 0 auto;
    width: 8rem;
  }
  fieldset {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    border: none;
    min-width: 16rem;
  }
  label + * {
    margin-bottom: 1rem;
  }
  button {
    padding: 0.5rem 1rem;
    background: var(--primary-color);
    color: var(--text-color);
    border: none;
    border-radius: 0.25rem;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 1em;
    color: white;
    transition: 0.4s;
  }
  button:hover {
    cursor: pointer;
    background: var(--primary-hover);
    transition: 0.4s;
  }
  input {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.25rem;
    margin-top: 0.25rem;
  }
</style>
