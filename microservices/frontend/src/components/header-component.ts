import { FetchAuth } from "../services/fetch-auth";
import { IconComponent } from "./icon-component";
import { ThemeToggleComponent } from "./theme-toggle-component";

export class HeaderComponent extends HTMLElement {
  menuIcon = new IconComponent();

  constructor() {
    super();
  }

  connectedCallback() {
    console.log("Header CONNECTED");

    // LOGO ON LEFT SIDE
    const logoAnchor = document.createElement("a");
    logoAnchor.href = "/";
    const logo = document.createElement("img");
    logo.classList.add("size-18", "rounded-lg");
    logo.src = "/images/pong-logo.png";
    logoAnchor.appendChild(logo);
    this.appendChild(logoAnchor);
    this.classList.add(
      "bg-indigo-900/30",
      "border-1",
      "border-indigo-900",
      "pt-6",
      "pb-2",
      "px-12",
      "mb-14",
      "flex",
      "content-end",
      "items-end",
      "justify-between",
      "self-stretch",
      "relative",
    );

    // CONTAINER FOR NAVIGATION
    const navigation = document.createElement("nav");
    navigation.classList.add("flex", "items-center", "gap-4");
    const menuButton = document.createElement("button");
    menuButton.classList.add("pong-button", "sm:hidden");
    this.menuIcon.setSize(6);
    this.menuIcon.setIcon("menu");
    menuButton.appendChild(this.menuIcon);
    navigation.append(menuButton);

    this.appendChild(navigation);

    // CLOSE BUTTON
    const closeButton = document.createElement("button");
    const closeIcon = new IconComponent("close", 6);
    closeButton.append(closeIcon);
    closeButton.classList.add(
      "absolute",
      "pong-button",
      "z-43",
      "right-6",
      "top-6",
      "hidden",
    );
    this.appendChild(closeButton);

    // LIST OF NAVIGATION LINKS
    const list = document.getElementById("navigation");
    if (list) {
      list.classList.add(
        "fixed",
        "top-0",
        "right-0",
        "left-0",
        "bottom-0",
        "flex",
        "flex-col",
        "hidden",
        "w-full",
        "items-stretch",
        "justify-center",
        "gap-4",
        "px-6",
        "sm:static",
        "sm:w-auto",
        "sm:flex",
        "sm:flex-row",
        "sm:content-center",
        "sm:items-stretch",
        "sm:px-6",
        // "sm:py-1",
        "sm:rounded-full",
        "bg-gray-200",
        "sm:bg-transparent",
        "dark:bg-indigo-950",
        "dark:sm:bg-transparent",
        "z-42",
        "sm:me-6",
      );
      navigation.appendChild(list);
    }

    // list elements in navigation
    const listElements = list?.querySelectorAll("li");
    if (listElements) {
      const listElementsArray = [...listElements];
      listElementsArray.map((lE) =>
        lE.classList.add("flex", "justify-center", "h-auto", "sm:h-full"),
      );
    }

    // SIGN OUT BUTTON
    const logoutButton = document.createElement("button");
    logoutButton.id = "sign-out-button";
    logoutButton.classList.add(
      "pong-button",
      "pong-button-info",
      "w-full",
      "auth-needed",
    );
    logoutButton.innerText = "Sign Out";
    const listElement = document.createElement("li");
    listElement.append(logoutButton);
    listElement.classList.add("flex", "justify-center");
    navigation.append(listElement);

    // THEME TOGGLE
    const themeToggle = new ThemeToggleComponent();
    themeToggle.setSize(6);
    navigation.appendChild(themeToggle);

    // EVENT LISTENERS
    menuButton.addEventListener("click", () => {
      list?.classList.remove("hidden");
      closeButton.classList.remove("hidden");
    });

    closeButton.addEventListener("click", () => {
      list?.classList.add("hidden");
      closeButton.classList.add("hidden");
    });

    list?.addEventListener("click", () => {
      list?.classList.add("hidden");
      closeButton.classList.add("hidden");
    });
    logoutButton.addEventListener("click", async () => {
      try {
        await FetchAuth.signOut();
      } catch (e) {}
    });
  }

  disconnectedCallback() {
    console.log("Header DISCONNECTED");
  }
}

customElements.define("header-component", HeaderComponent);
