'use strict'

class ErrorComponent extends HTMLElement {
	constructor() {
		super()
	}

	connectedCallback() {
		console.log('Error has been connected')
		const h1 = document.createElement('h1')
		h1.textContent = '404 Page not found'
		this.appendChild(h1);
	}

	disconnectedCallback() {
		console.log('Error has been disconnected')
	}
}

customElements.define('error-component', ErrorComponent)

export function createComponent() {
	console.log('creating element');
	return document.createElement('error-component');
}
