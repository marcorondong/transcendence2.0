import { createTableComponent } from "../components/table-component.js";

class UsersComponent extends HTMLElement {
	constructor() {
		super();
	}

	data: any;

	async connectedCallback() {
		console.log("users Component has been connected");

		// this.data = await getData();
		// if (!this.data) {
		// 	return;
		// }
		// this.users = this.data?.results;
		// console.log(this.data);

		const users = [
			{ alias: "Filip", username: "Sekula", wins: "12", loses: "0" },
			{ alias: "Filip", username: "Sekula", wins: "12", loses: "0" },
			{ alias: "Filip", username: "Sekula", wins: "12", loses: "0" },
		];

		const h1 = document.createElement("h1");
		h1.textContent = "Users";
		this.appendChild(h1);

		const tableComponent = createTableComponent();
		this.appendChild(tableComponent);
		tableComponent.setHeaders(["Name", "Alias", "Wins", "Losses"]);
		tableComponent.setClass("table table-hover table-striped");
		for (let i = 0; i < users.length; ++i) {
			const { alias, username, wins, loses } = users[i];
			tableComponent.setRow([alias, username, wins, loses]);
		}
	}

	disconnectedCallback() {
		console.log("Users Component has been disconnected");
	}
}

customElements.define("users-component", UsersComponent);

export function createComponent() {
	console.log("creating element");
	return document.createElement("users-component");
}

async function getData() {
	const url = "https://localhost:8080/api/v1/users/list/?page=1";
	try {
		const response = await fetch(url, {
			method: "GET",
			mode: "cors",
			headers: {
				"Content-Type": "application/json",
			},
		});
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		return response.json();
	} catch (e) {
		console.error("Trying to fetch users in users-component;", e);
		return null;
	}
}
