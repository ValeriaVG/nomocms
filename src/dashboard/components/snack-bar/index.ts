import { html } from "amp/lib";
import styles from "./styles.scss";
export default class SnackBar extends HTMLElement {
  connectedCallback() {
    this.classList.add(styles.snackbar);
    this.innerHTML = html`
      <template id="success-notification">
        <header><slot name="title">Success</slot></header>
        <slot name="message">Operation was successful</slot>
      </template>
      <template id="error-notification">
        <header><slot name="title">Error</slot></header>
        <slot name="message">Operation failed</slot>
      </template>
    `;
  }
  addNotification({
    type,
    title,
    message,
    timeoutMS,
  }: {
    type: "success" | "error";
    title?: string;
    message?: string;
    timeoutMS?: number;
  }) {
    const className = `${type}-notification`;
    const template: HTMLTemplateElement = this.querySelector(`#${className}`);
    if (!template) throw new Error(`Type "${type}" is not valid`);

    const notification = document.createElement("div");

    if (title) {
      notification.innerHTML += `<header slot="title">${title}</header>`;
    }
    if (message) {
      notification.innerHTML += `<span slot="message">${message}</span>`;
    }
    notification
      .attachShadow({ mode: "open" })
      .appendChild(template.content.cloneNode(true));

    const closeNotification = () => this.removeChild(notification);
    notification.onclick = closeNotification;
    if (timeoutMS) setTimeout(closeNotification, timeoutMS);
    notification.setAttribute("class", styles[className]);
    this.appendChild(notification);
  }
}
