import { IconComponent } from "./icon-component";

class UsersPaginationComponent extends HTMLElement {
  nextPage: boolean;
  currentPage: number;
  constructor(currentPage: number, nextPage: boolean) {
    super();
    this.currentPage = currentPage;
    this.nextPage = nextPage;
  }

  connectedCallback() {
    const buttonClassList = ["pong-button", "pong-button-primary"];
    this.classList.add("flex", "gap-5", "items-center", "self-center", "mt-5");
    const buttonLeft = document.createElement("button");
    buttonLeft.classList.add(...buttonClassList);
    buttonLeft.id = "button-left";
    if (this.currentPage === 1) {
      buttonLeft.setAttribute("disabled", "true");
    }
    const leftArrowIcon = new IconComponent("arrow_left", 3);
    buttonLeft.append(leftArrowIcon);
    const buttonRight = document.createElement("button");
    buttonRight.id = "button-right";

    if (!this.nextPage) {
      buttonRight.setAttribute("disabled", "true");
    }
    buttonRight.classList.add(...buttonClassList);
    const rightArrowIcon = new IconComponent("arrow_right", 3);
    buttonRight.append(rightArrowIcon);
    const pageCount = document.createElement("div");
    pageCount.classList.add("font-bold", "text-sm", "text-slate-400");
    pageCount.innerText = `${this.currentPage}`;

    this.append(buttonLeft, pageCount, buttonRight);
  }

  disconnectedCallback() {}
}

customElements.define("users-pagination-component", UsersPaginationComponent);

export { UsersPaginationComponent };
