import * as v from "valibot";
import { notificationEvent } from "./events";

// email Invalid email,
// email Email must be at least 6 characters long,
// email Email cannot contain uppercase letters,
// email Email must contain only ASCII characters,
// email Invalid email structure,
// nickname Nickname must be at least 3 characters long,
// nickname Nickname cannot be empty or whitespace only,
// nickname Nickname must contain at least one letter,
// nickname Nickname must contain only ASCII characters,
// nickname Nickname cannot start with whitespace,
// nickname Nickname cannot end with whitespace,
// password Password must be at least 6 characters long,
// password Password must contain at least one lowercase letter,
// password Password must contain at least one uppercase letter,
// password Password must contain at least one digit,
// password Password must contain at least one symbol

export function validateSignUpForm(data: any) {
	const SignUpFormSchema = v.object({
		username: v.pipe(
			v.string("Your username must be a string."),
			v.nonEmpty("Please enter your username."),
			v.minLength(3, "Your username must be at least 6 characters long"),
			v.maxLength(
				100,
				"Your username can't have more than 100 characters",
			),
			v.regex(
				/^[a-z]+$/,
				"Username must contain only lowercase letters.",
			),
		),
		email: v.pipe(
			v.string("Your email must be a string."),
			v.nonEmpty("Please enter your email."),
			v.email("Your email has an invalid format"),
			v.maxLength(100, "Your email can't have more than 100 characters"),
			v.minLength(6, "Your email must be at least 6 characters long"),
			v.regex(/^[a-z]+$/, "Email must contain only lowercase letters."),
		),
		nickname: v.number(),
		password: v.number(),
	});
	// const EmailSchema = v.pipe(
	// 	v.string("Your email must be a string."),
	// 	v.nonEmpty("Please enter your email."),
	// 	v.email("Your email has an invalid format"),
	// 	v.maxLength(100, "Your email can't have more than 100 characters"),
	// );
	try {
		v.parse(SignUpFormSchema, data);
		return true;
	} catch (e: any) {
		document.dispatchEvent(notificationEvent(e.message as string, "error"));
		return false;
	}
}
