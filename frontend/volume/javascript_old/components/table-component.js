'use strict'

export class TableComponent extends HTMLElement {
	constructor() {
		super()
	}

	connectedCallback() {
		console.log('TABLE_COMPONENT has been CONNECTED')

		this.table = document.createElement('table');
		this.appendChild(this.table);
		this.thead = document.createElement('thead');
		this.table.appendChild(this.thead);
		this.tbody = document.createElement('tbody');
		this.table.appendChild(this.tbody);
	}

	disconnectedCallback() {
		console.log('TABLE COMPONENT has been DISCONNECTED');
	}

	setClass(classes){
		this.table.className=classes;
	}

	setHeaders(headers){
		const tr = document.createElement('tr')
		this.thead.appendChild(tr);

		for(const header of headers){
			const th = document.createElement('th');
			th.scope ='col';
			th.textContent = header;
			tr.appendChild(th);
		}
	}

	setRow(entries){
		const tr = document.createElement('tr');
		this.tbody.appendChild(tr);

		for (const entry of entries) {
			const td = document.createElement('td');
			td.textContent=entry;
			tr.appendChild(td);
		}
	}

	build(){
		customElements.define('table-component', TableComponent);
		return document.createElement('table-component');
	}	
}

customElements.define('table-component', TableComponent)
  
