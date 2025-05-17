import { Router } from "./router.js";
import "./components/header-component.js";
import "./components/chat-component.js";
import "./components/footer-component.js";
import { ChatComponent } from "./components/chat-component.js";

const chat = new ChatComponent();
const router = new Router(chat);

const container = document.getElementById("container");
container?.appendChild(chat);
chat.classList.add(
	"fixed",
	"bottom-0",
	"right-0",
	"h-auto",
	"w-auto",
	"rounded-tl-3xl",
	"rounded-tr-3xl",
	"bg-indigo-900/70",
	"p-2",
	"backdrop-blur-lg",
	"lg:right-7",
);

router.loadComponent();
