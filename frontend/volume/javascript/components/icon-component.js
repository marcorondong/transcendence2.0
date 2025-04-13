var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class IconComponent extends HTMLElement {
    constructor() {
        super();
        this.iconName = null;
        this.iconSize = 20;
    }
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
    fetchIcon() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.iconName) {
                try {
                    const iconData = yield fetch(`./static-files/icons/${this.iconName}.svg`);
                    const contentType = iconData.headers.get("Content-Type");
                    if (!contentType || !contentType.includes("image/svg+xml")) {
                        throw new Error("Not an SVG file");
                    }
                    const iconText = yield iconData.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(iconText, "image/svg+xml");
                    const iconElement = doc.documentElement;
                    return iconElement;
                }
                catch (e) {
                    console.error("failed to fetch icon", e);
                }
            }
        });
    }
    setIcon(name) {
        return __awaiter(this, void 0, void 0, function* () {
            this.iconName = name;
        });
    }
    setSize(size) {
        return __awaiter(this, void 0, void 0, function* () {
            this.iconSize = size;
        });
    }
    applySize(iconElement) {
        if (iconElement) {
            console.log("applying size:", this.iconSize);
            iconElement.classList.remove("size-6");
            const remSize = this.iconSize * 4;
            iconElement.setAttribute("height", `${remSize}px`);
            iconElement.setAttribute("width", `${remSize}px`);
        }
    }
    connectedCallback() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("ICON has been CONNECTED");
            this.nameFromAttribute();
            this.sizeFromAttribute();
            const iconElement = yield this.fetchIcon();
            this.applySize(iconElement);
            if (iconElement) {
                this.appendChild(iconElement);
            }
        });
    }
    disconnectedCallback() {
        console.log("ICON COMPONENT has been DISCONNECTED");
    }
}
export function createIconComponent() {
    return document.createElement("icon-component");
}
customElements.define("icon-component", IconComponent);
