import { Router } from "./router";
import "./components/header-component";
import "./components/chat-component";
import "./components/footer-component";
import { ChatComponent } from "./components/chat-component";
import { NotificationService } from "./services/notification-service";
import { HeaderComponent } from "./components/header-component";

const chat = new ChatComponent();
const router = new Router(chat);

// starting notification service
const notificationService = new NotificationService();
notificationService.listen();

// ADDING CHAT INSTANCE TO HEADER COMPONENT
const header = document.getElementsByTagName("header-component");
if (header && header[0] && header[0] instanceof HeaderComponent) {
	header[0].setChat(chat);
}

// PUTTING CHAT INTO DOM TREE
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

// STARTING ROUTER
router.auth();
