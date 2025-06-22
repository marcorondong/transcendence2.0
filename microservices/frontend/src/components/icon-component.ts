class IconComponent extends HTMLElement {
	constructor(iconName?: string, iconSize?: number) {
		super();
		if (iconName) {
			this.setIcon(iconName);
		}
		if (iconSize) {
			this.setSize(iconSize);
		}
	}

	iconElement: undefined | HTMLElement = undefined;
	iconName: string | null = null;
	iconSize: number = 20;

	sizeFromAttribute() {
		const size = Number(this.getAttribute("size"));
		if (size) {
			this.iconSize = size;
		}
	}

	nameFromAttribute() {
		const name = this.getAttribute("name");
		if (name) {
			this.iconName = name;
		}
	}

	async fetchIcon() {
		if (this.iconName) {
			try {
				const iconData = await fetch(`/icons/${this.iconName}.svg`);
				const contentType = iconData.headers.get("Content-Type");
				if (!contentType || !contentType.includes("image/svg+xml")) {
					throw new Error("Not an SVG file");
				}
				const iconText = await iconData.text();
				const parser = new DOMParser();
				const doc = parser.parseFromString(iconText, "image/svg+xml");
				const iconElement = doc.documentElement;
				return iconElement;
			} catch (e) {
				console.error("failed to fetch icon", e);
			}
		}
	}

	setIcon(name: string) {
		this.iconName = name;
	}

	async setSize(size: number) {
		this.iconSize = size;
	}

	applySize(iconElement: HTMLElement | undefined) {
		if (iconElement) {
			iconElement.classList.remove("size-6");
			const remSize = this.iconSize * 4;
			iconElement.setAttribute("height", `${remSize}px`);
			iconElement.setAttribute("width", `${remSize}px`);
		}
	}

	async connectedCallback() {
		this.nameFromAttribute();
		this.sizeFromAttribute();
		if (!this.iconElement) {
			this.iconElement = await this.fetchIcon();
		}
		this.applySize(this.iconElement);
		if (this.iconElement) {
			this.appendChild(this.iconElement);
		}
	}

	disconnectedCallback() {}
}

customElements.define("icon-component", IconComponent);

export { IconComponent };
