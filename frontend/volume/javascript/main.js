import { Router } from "./router.js";
import { createIconComponent } from "./components/icon-component.js";
import { createThemeToggleComponent } from "./components/theme-toggle-component.js";
createIconComponent();
createThemeToggleComponent();
const router = new Router();
router.loadComponent();
const navbarButton = document.getElementById("navbar-button");
const navbarLinks = document.getElementById("navbar-links");
const dataTheme = document.getElementById("theme-toggle");
dataTheme === null || dataTheme === void 0 ? void 0 : dataTheme.addEventListener("click", () => {
    if (document.documentElement.getAttribute("data-theme") === "dark") {
        document.documentElement.setAttribute("data-theme", "light");
    }
    else {
        document.documentElement.setAttribute("data-theme", "dark");
    }
});
navbarButton === null || navbarButton === void 0 ? void 0 : navbarButton.addEventListener("click", () => {
    if (navbarLinks === null || navbarLinks === void 0 ? void 0 : navbarLinks.classList.contains("hidden")) {
        navbarLinks === null || navbarLinks === void 0 ? void 0 : navbarLinks.classList.remove("hidden");
    }
    else {
        navbarLinks === null || navbarLinks === void 0 ? void 0 : navbarLinks.classList.add("hidden");
    }
});
// const queryParams = window.location.search;
// const wss = new WebSocket(
// 	// `ws://${window.location.hostname}:${window.location.port}/pong/${queryParams}`,
// 	`wss://${window.location.hostname}:${window.location.port}/pong/${queryParams}`,
// );
// wss.onmessage = (event) => {
// 	console.log("got message");
// 	const gameState = JSON.parse(event.data);
// 	console.log("game State", gameState);
// };
