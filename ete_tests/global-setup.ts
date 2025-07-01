// global-setup.ts
import { request } from "@playwright/test";
import { registeredUsers, registerUrl } from "./config";

async function globalSetup() {
	const requestContext = await request.newContext({
		ignoreHTTPSErrors: true, // 👈 this tells Playwright to allow self-signed certs
	});

	// Example registration for user1

	for (const user of Object.values(registeredUsers)) {
		await requestContext.post(registerUrl, {
			data: {
				email: user.email,
				nickname: user.nickname,
				username: user.username,
				password: user.password,
			},
		});
	}

	await requestContext.dispose();
	// await requestContext.post("https://localhost:443/register", {
	// 	data: {
	// 		username: "user1",
	// 		password: "pass123",
	// 	},
	// });

	// // Example registration for user2
	// await requestContext.post("https://localhost:443/register", {
	// 	data: {
	// 		username: "user2",
	// 		password: "pass456",
	// 	},
	// });

	await requestContext.dispose();
}

export default globalSetup;
