export class Auth {
	static toggleAuthClasses(authorized: boolean) {
		const pongLogo = document.getElementById("pongLogo");
		const authNeededNodes = [...document.querySelectorAll(".auth-needed")];
		const noAuthNeededNodes = [
			...document.querySelectorAll(".no-auth-needed"),
		];
		if (authorized) {
			if (pongLogo instanceof HTMLAnchorElement) {
				pongLogo.href = "/";
			}
			authNeededNodes.forEach((node) => node.classList.remove("hidden"));
			noAuthNeededNodes.forEach((node) => node.classList.add("hidden"));
		} else {
			if (pongLogo instanceof HTMLAnchorElement) {
				pongLogo.href = "sign-in-view";
			}
			noAuthNeededNodes.forEach((node) =>
				node.classList.remove("hidden"),
			);
			authNeededNodes.forEach((node) => node.classList.add("hidden"));
		}
	}
}
