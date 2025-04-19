import { TableComponent } from "../components/table-component.js";

export class UsersView extends HTMLElement {
	constructor() {
		super();
	}

	data: any;

	async connectedCallback() {
		console.log("users View has been connected");

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

		const tableComponent = new TableComponent();
		this.appendChild(tableComponent);
		tableComponent.setHeaders(["Name", "Alias", "Wins", "Losses"]);
		tableComponent.setClass("table table-hover table-striped");
		for (let i = 0; i < users.length; ++i) {
			const { alias, username, wins, loses } = users[i];
			tableComponent.setRow([alias, username, wins, loses]);
		}

		const div = document.createElement('div');
		div.innerText = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";
		this.appendChild(div);
	}

	disconnectedCallback() {
		console.log("USERS VIEW has been DISCONNECTED");
	}
}

customElements.define("users-view", UsersView);

export function createComponent() {
	return document.createElement("users-view");
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
