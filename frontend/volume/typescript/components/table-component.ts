export class TableComponent extends HTMLElement {
	constructor() {
		super();
	}

	table = document.createElement("table");
	thead = document.createElement("thead");
	tbody = document.createElement("tbody");

	connectedCallback() {
		console.log("TABLE_COMPONENT has been CONNECTED");

		this.appendChild(this.table);
		this.table.appendChild(this.thead);
		this.table.appendChild(this.tbody);
	}

	disconnectedCallback() {
		console.log("TABLE COMPONENT has been DISCONNECTED");
	}

	setClass(classes: string) {
		this.table.className = classes;
	}

	setHeaders(headers: string[]) {
		const tr = document.createElement("tr");
		this.thead.appendChild(tr);

		for (const header of headers) {
			const th = document.createElement("th");
			th.scope = "col";
			th.textContent = header;
			tr.appendChild(th);
		}
	}

	setRow(entries: string[]) {
		const tr = document.createElement("tr");
		this.tbody.appendChild(tr);

		for (const entry of entries) {
			const td = document.createElement("td");
			td.textContent = entry;
			tr.appendChild(td);
		}
	}
}

export function createTableComponent(): TableComponent {
	return document.createElement("table-component") as TableComponent;
}

customElements.define("table-component", TableComponent);
