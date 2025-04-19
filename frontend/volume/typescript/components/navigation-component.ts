export class NavigationComponent extends HTMLElement {
  
	constructor() {
	  super();
	}
  
	connectedCallback() {
	  console.log("NAVIGATION CONNECTED");
  
	  const nav = document.createElement('nav');
	  nav.classList.add('relative', 'px-5', 'md:px-16', 'xl:px-32', 'h-screen');

	  const logo = document.createElement('img');
	  logo.classList.add('size-18', 'rounded-lg');
	  logo.src = "./static-files/images/pong-logo.png";
	  nav.append(logo);
	  this.append(nav);



	}
  
	disconnectedCallback() {
	  console.log("NAVIGATION DISCONNECTED");
	}
  }
  
  customElements.define("navigation-component", NavigationComponent);