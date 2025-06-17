import { ChatComponent } from "../components/chat-component";
import { Auth } from "../services/auth";
import { homeLinkEvent, notificationEvent } from "../services/events";
import { FetchAuth } from "../services/fetch-auth";

export class SignUpView extends HTMLElement {
  chat: ChatComponent;
  constructor(chat: ChatComponent) {
    super();
    this.chat = chat;
  }

  frame = document.createElement("div");
  container = document.createElement("form");

  // SIGN IN
  heading = document.createElement("h1");
  labelUsername = document.createElement("label");
  inputUsername = document.createElement("input");
  labelPassword = document.createElement("label");
  inputPassword = document.createElement("input");
  signUpNote = document.createElement("div");
  signUpLink = document.createElement("a");
  signInButton = document.createElement("button");

  //SIGN UP
  labelEmail = document.createElement("label");
  inputEmail = document.createElement("input");
  labelNickname = document.createElement("label");
  inputNickname = document.createElement("input");
  labelRePassword = document.createElement("label");
  inputRePassword = document.createElement("input");
  signUpButton = document.createElement("button");

  connectedCallback() {
    console.log("SIGNUP VIEW has been CONNECTED");
    this.classList.add("flex", "w-full", "items-center", "justify-center");
    this.container.classList.add(
      "flex",
      "flex-col",
      "items-center",
      "w-120",
      "py-12",
      "px-12",
      "pong-card",
      "items-stretch",
      "shadow-xl",
      "gap-6",
    );
    this.heading.classList.add("pong-form-heading");
    this.heading.innerText = "Sign in to your account";
    this.inputUsername.id = "input-username";
    this.inputUsername.classList.add("pong-form-input", "block", "w-full");
    this.inputUsername.placeholder = "username";
    this.labelUsername.innerText = "Your Username";
    this.labelUsername.classList.add("pong-form-label");
    this.labelUsername.htmlFor = "input-username";
    this.labelUsername.append(this.inputUsername);
    this.inputPassword.placeholder = "••••••••";
    this.inputPassword.id = "input-password";
    this.inputPassword.type = "password";
    this.inputPassword.classList.add("pong-form-input", "block", "w-full");
    this.labelPassword.innerText = "Your Password";
    this.labelPassword.classList.add("pong-form-label");
    this.labelPassword.htmlFor = "input-password";
    this.labelPassword.append(this.inputPassword);
    this.heading.innerText = "Create an account";

    this.inputEmail.classList.add("pong-form-input", "w-full", "block");
    this.labelEmail.classList.add("pong-form-label");
    this.inputEmail.type = "email";
    this.inputEmail.placeholder = "name@mail.com";
    this.inputEmail.id = "input-email";
    this.labelEmail.htmlFor = "input-email";
    this.labelEmail.innerText = "Your Email";
    this.labelEmail.append(this.inputEmail);

    this.inputNickname.classList.add("pong-form-input", "w-full", "block");
    this.labelNickname.classList.add("pong-form-label");
    this.labelNickname.innerText = "Your Nickname";
    this.labelNickname.htmlFor = "input-nickname";
    this.inputNickname.id = "input-nickname";
    this.inputNickname.placeholder = "nickname";
    this.labelNickname.append(this.inputNickname);

    this.inputRePassword.classList.add("pong-form-input", "w-full", "block");
    this.labelRePassword.classList.add("pong-form-label");
    this.inputRePassword.type = "password";
    this.inputRePassword.id = "input-re-password";
    this.labelRePassword.htmlFor = "input-re-password";
    this.inputRePassword.placeholder = "••••••••";
    this.labelRePassword.innerText = "Repeat Password";
    this.labelRePassword.append(this.inputRePassword);

    this.signUpButton.innerText = "Register new account";
    this.signUpButton.classList.add("pong-button", "pong-button-info", "mt-2");
    this.signInButton.remove();
    this.signUpNote.remove();

    this.container.append(
      this.heading,
      this.labelUsername,
      this.labelPassword,
      this.labelRePassword,
      this.labelEmail,
      this.labelNickname,
      this.signUpButton,
    );
    this.append(this.container);
    this.signUpButton.addEventListener("click", async (e: MouseEvent) => {
      e.preventDefault();
      const data = {
        email: this.inputEmail.value,
        username: this.inputUsername.value,
        nickname: this.inputNickname.value,
        password: this.inputPassword.value,
      };
      try {
        await FetchAuth.signUp(data);
        Auth.toggleAuthClasses(true);
        this.chat.openWebsocket();
        document.dispatchEvent(
          notificationEvent("You just signed up!", "success"),
        );
        document.dispatchEvent(homeLinkEvent);
      } catch (e) {
        document.dispatchEvent(notificationEvent("failed to sign up", "error"));
        console.log("from sign up", e);
      }
    });
  }

  disconnectedCallback() {
    console.log("SIGNUP VIEW has been DISCONNECTED");
  }
}
customElements.define("sign-up-view", SignUpView);

export function createComponent(chat: ChatComponent) {
  return new SignUpView(chat);
}
