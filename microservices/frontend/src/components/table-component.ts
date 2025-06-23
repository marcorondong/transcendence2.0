class TableComponent extends HTMLElement {
	constructor() {
		super();
	}

	table = document.createElement("table");
	thead = document.createElement("thead");
	tbody = document.createElement("tbody");

	connectedCallback() {
		this.appendChild(this.table);
		this.table.appendChild(this.thead);
		this.table.appendChild(this.tbody);
	}

	disconnectedCallback() {}

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

customElements.define("table-component", TableComponent);

export { TableComponent };
