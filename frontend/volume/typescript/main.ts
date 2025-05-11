import { Router } from "./router.js";
import "./components/header-component.js";
import "./components/chat-component.js";
import "./components/footer-component.js";
import { ChatComponent } from "./components/chat-component.js";

const chat = new ChatComponent();
const router = new Router(chat);

router.loadComponent();
