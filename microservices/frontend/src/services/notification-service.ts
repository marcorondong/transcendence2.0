import type { State } from "../types/Notification";

export class NotificationService {
	notificationContainer = document.createElement("div");

	styleNotification(notification: HTMLElement, state: State) {
		switch (state) {
			case "info":
				notification.classList.add("pong-notification-info");
				break;
			case "error":
				notification.classList.add("pong-notification-error");
				break;
			case "success":
				notification.classList.add("pong-notification-success");
				break;
		}
		this.notificationContainer?.appendChild(notification);
		setTimeout(() => {
			notification?.remove();
		}, 4000);
	}

	listen() {
		this.notificationContainer.classList.add("fixed", "top-10", "right-10");
		this.notificationContainer.id = "notification-container";
		document.addEventListener("notification", (e) => {
			if (e instanceof CustomEvent) {
				// CREATE NOTIFICATION
				const notification = document.createElement("div");
				notification.classList.add(
					"flex",
					"flex-col",
					"items-start",
					"gap-2",
					"w-64",
					"text-sm",
					"text-left",
					"backdrop-blur-sm",
				);
				const notificationType = document.createElement("div");
				notificationType.innerText = e.detail.source.state;
				notificationType.classList.add(
					"text-xs",
					"opacity-50",
					"uppercase",
				);
				const notificationDate = document.createElement("div");
				notificationDate.classList.add("text-xs", "opacity-50");
				notificationDate.innerText =
					"Time: " + new Date().toLocaleTimeString();
				const notificationMessage = document.createElement("div");
				notificationMessage.innerText = e.detail.source.message;
				notificationMessage.classList.add("text-left");
				this.styleNotification(notification, e.detail.source.state);
				notification.append(
					notificationType,
					notificationMessage,
					notificationDate,
				);

				// ADD NOTIFICATION TO CONTAINER
				const container = document.getElementById("navigation");
				if (container && this.notificationContainer) {
					container.append(this.notificationContainer);
				}

				// APPLY FADE IN ANIMATION
				const messages =
					document.querySelectorAll(".pong-notification");
				messages.forEach((m) =>
					m.classList.remove("pong-notification-fade-in"),
				);
				notification.classList.add(
					"pong-notification",
					"pong-notification-fade-in",
				);
			}
		});
	}
}
