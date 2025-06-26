import * as v from "valibot";
import { notificationEvent } from "./events";

export const passwordValidator = v.pipe(
	v.string("Your password must be a string."),
	v.nonEmpty("Please enter a password."),
	v.maxLength(100, "Your password can't have more than 100 characters"),
	v.minLength(6, "Your password must be at least 6 characters long"),
	v.regex(/[a-z]/, "Password must contain at least one lowercase letter."),
	v.regex(/[A-Z]/, "Password must contain at least one uppercase letter."),
	v.regex(/[0-9]/, "Password must contain at least one digit."),
	v.regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol."),
);

// Reusable email validator
export const emailValidator = v.pipe(
	v.string("Your email must be a string."),
	v.nonEmpty("Please enter your email."),
	v.email("Your email has an invalid format"),
	v.maxLength(100, "Your email can't have more than 100 characters"),
	v.minLength(6, "Your email must be at least 6 characters long"),
	v.regex(/^[^A-Z]*$/, "Email must contain only lowercase letters."),
);

// Reusable username validator
export const usernameValidator = v.pipe(
	v.string("Your username must be a string."),
	v.nonEmpty("Please enter your username."),
	v.minLength(3, "Your username must be at least 6 characters long"),
	v.maxLength(100, "Your username can't have more than 100 characters"),
	v.regex(/^[a-z]+$/, "Username must contain only lowercase letters."),
);

// Reusable nickname validator
export const nicknameValidator = v.pipe(
	v.string("Your nickname must be a string."),
	v.nonEmpty("Please enter your nickname."),
	v.maxLength(15, "Your nickname can't have more than 15 characters"),
	v.minLength(3, "Your nickname must be at least 3 characters long"),
);

export const signUpFormSchema = v.object({
	username: usernameValidator,
	password: passwordValidator,
	passwordRepeat: passwordValidator,
	email: emailValidator,
	nickname: nicknameValidator,
});

const signInFormSchema = v.object({
	username: usernameValidator,
	password: passwordValidator,
});

const updateProfileFormSchema = v.object({
	username: usernameValidator,
	nickname: nicknameValidator,
	email: emailValidator,
});

export function validateSignUpForm(data: any) {
	try {
		return v.parse(signUpFormSchema, data);
	} catch (e: any) {
		document.dispatchEvent(notificationEvent(e.message as string, "error"));
		throw new Error();
	}
}

export function validateSignInForm(data: any) {
	try {
		return v.parse(signInFormSchema, data);
	} catch (e: any) {
		document.dispatchEvent(notificationEvent(e.message as string, "error"));
		throw new Error();
	}
}

export function validateUpdateProfileForm(data: any) {
	try {
		return v.parse(updateProfileFormSchema, data);
	} catch (e: any) {
		document.dispatchEvent(notificationEvent(e.message as string, "error"));
		throw new Error();
	}
}
