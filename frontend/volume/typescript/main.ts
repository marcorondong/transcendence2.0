import { Router } from "./router.js";
import "./components/icon-component.js";
import "./components/theme-toggle-component.js";

const router = new Router();

router.loadComponent();

const navbarButton = document.getElementById("navbar-button");
const navbarLinks = document.getElementById("navbar-links");
const dataTheme = document.getElementById("theme-toggle");

dataTheme?.addEventListener("click", () => {
	if (document.documentElement.getAttribute("data-theme") === "dark") {
		document.documentElement.setAttribute("data-theme", "light");
	} else {
		document.documentElement.setAttribute("data-theme", "dark");
	}
});

navbarButton?.addEventListener("click", () => {
	if (navbarLinks?.classList.contains("hidden")) {
		navbarLinks?.classList.remove("hidden");
	} else {
		navbarLinks?.classList.add("hidden");
	}
});

navbarLinks?.addEventListener("click", () => {
		navbarLinks?.classList.add("hidden");
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
