#!/usr/bin/env ts-node

import axios from "axios";
import { faker } from "@faker-js/faker";
import inquirer from "inquirer";
import { writeFile, appendFile, readFile } from "fs/promises";

// === CONFIGURABLE CONSTANTS ===
const USE_SAME_PASSWORD = true;
const FIXED_PASSWORD = "P@ssword123!";
const REQUEST_DELAY_MS = 500;
const API_URL = "http://localhost:3000/api/users"; // adjust if needed
const OUTPUT_FILE_PATH = "users_seeded.json"; // configurable file path
const HEADER_TEMPLATE = (timestamp: string) =>
	`\n//========= ${timestamp} UTC =========\n`;

// === UTILITY ===
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// === UNIQUE TRACKERS ===
const usernames = new Set<string>();
const nicknames = new Set<string>();
const emails = new Set<string>();

function generateUnique(generator: () => string, used: Set<string>): string {
	let value;
	do {
		value = generator();
	} while (used.has(value));
	used.add(value);
	return value;
}

async function main() {
	const { count } = await inquirer.prompt([
		{
			type: "number",
			name: "count",
			message: "How many users do you want to generate?",
			default: 5,
			validate: (v: number | undefined) =>
				typeof v === "number" && v > 0 ? true : "Must be at least 1",
		},
	]);

	const seededUsers: any[] = [];

	for (let i = 0; i < count; i++) {
		const user = {
			username: generateUnique(
				() => faker.internet.userName(),
				usernames,
			),
			nickname: generateUnique(() => faker.person.firstName(), nicknames),
			email: generateUnique(
				() => faker.internet.email(),
				emails,
			).toLowerCase(),
			password: USE_SAME_PASSWORD
				? FIXED_PASSWORD
				: faker.internet.password(),
		};

		try {
			console.log("📦 Sending user:", user);
			await axios.post(API_URL, user);
			console.log(`✅ Created: ${user.username}`);
			seededUsers.push(user);
		} catch (err: any) {
			console.error(
				`❌ Failed to create user ${user.username}:`,
				err?.response?.data || err.message,
			);
		}

		await delay(REQUEST_DELAY_MS);
	}

	// === FILE OUTPUT WITH HEADER ===
	const timestamp = new Date()
		.toISOString()
		.replace("T", " ")
		.replace("Z", "");
	const header = HEADER_TEMPLATE(timestamp);

	// Read previous content if file exists
	let existingContent = "";
	try {
		existingContent = await readFile(OUTPUT_FILE_PATH, "utf-8");
	} catch {}

	// Append new content
	const newContent = `${header}${JSON.stringify(seededUsers, null, 2)}\n`;
	await appendFile(OUTPUT_FILE_PATH, newContent);

	console.log(
		`\n📝 Saved ${seededUsers.length} users to ${OUTPUT_FILE_PATH}`,
	);

	// await writeFile("users_seeded.json", JSON.stringify(seededUsers, null, 2));
	// console.log(`\n📝 Saved ${seededUsers.length} users to users_seeded.json`);
}

main();
