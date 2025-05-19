#!/usr/bin/env ts-node

import axios from "axios";
import { faker } from "@faker-js/faker";
import inquirer from "inquirer";
import { writeFile, appendFile, readFile, access } from "fs/promises";
import { createReadStream } from "fs";
import { constants as fsConstants } from "fs";
import readline from "readline";

// === CONFIGURABLE CONSTANTS ===
const USE_SAME_PASSWORD = true;
const FIXED_PASSWORD = "P@ssword123!";
const REQUEST_DELAY_MS = 500;
const API_URL = "http://localhost:3000/api/users"; // adjust if needed
const OUTPUT_BASE_NAME = "users_seeded"; // configurable file path (no extension)
const DEFAULT_FORMAT = "json"; // default format used in prompt
const HEADER_TEMPLATE = (timestamp: string) =>
	`\n//========= ${timestamp} UTC =========\n`;
const DEFAULT_SOURCE = "generate"; // or "from file"
const DEFAULT_SAVE = false; // false = do not save

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
	const { dataSource } = await inquirer.prompt([
		{
			type: "list",
			name: "dataSource",
			message: "Do you want to generate data or read from a file?",
			choices: ["generate", "from file"],
			default: DEFAULT_SOURCE,
		},
	]);

	let users: any[] = [];

	if (dataSource === "from file") {
		const { filePath } = await inquirer.prompt([
			{
				type: "input",
				name: "filePath",
				message: "Enter path to JSON or CSV file:",
				default: "./users_data.json",
			},
		]);

		if (filePath.endsWith(".json")) {
			const raw = await readFile(filePath, "utf-8");
			const cleaned = raw
				.split("\n")
				.filter((line) => !line.trim().startsWith("//"))
				.join("\n");
			users = JSON.parse(cleaned);
		} else if (filePath.endsWith(".csv")) {
			const stream = createReadStream(filePath);
			const rl = readline.createInterface({
				input: stream,
				crlfDelay: Infinity,
			});

			let headers: string[] = [];
			for await (const line of rl) {
				if (!headers.length) {
					headers = line.split(",");
					continue;
				}
				const values = line.split(",");
				const user: any = {};
				headers.forEach((h, i) => (user[h] = values[i]));
				users.push(user);
			}
		} else {
			console.error("Unsupported file format.");
			return;
		}
	} else {
		const { count } = await inquirer.prompt([
			{
				type: "number",
				name: "count",
				message: "How many users do you want to generate?",
				default: 5,
				validate: (v: number | undefined) =>
					typeof v === "number" && v > 0
						? true
						: "Must be at least 1",
			},
		]);

		for (let i = 0; i < count; i++) {
			const user = {
				username: generateUnique(
					() => faker.internet.userName(),
					usernames,
				),
				nickname: generateUnique(
					() => faker.person.firstName(),
					nicknames,
				),
				email: generateUnique(
					() => faker.internet.email(),
					emails,
				).toLowerCase(),
				password: USE_SAME_PASSWORD
					? FIXED_PASSWORD
					: faker.internet.password(),
			};
			users.push(user);
		}
	}

	const seededUsers: any[] = [];

	for (const user of users) {
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

	const { saveToFile } = await inquirer.prompt([
		{
			type: "confirm",
			name: "saveToFile",
			message:
				"Do you want to save the successfully registered users to a file?",
			default: DEFAULT_SAVE,
		},
	]);

	let saveFormat = DEFAULT_FORMAT;
	if (saveToFile) {
		const { chosenFormat } = await inquirer.prompt([
			{
				type: "list",
				name: "chosenFormat",
				message: "Select file format to save:",
				choices: ["json", "csv"],
				default: DEFAULT_FORMAT,
			},
		]);
		saveFormat = chosenFormat;
	}

	// === FILE OUTPUT ===
	if (saveToFile) {
		const timestamp = new Date()
			.toISOString()
			.replace("T", " ")
			.replace("Z", "");
		const header = HEADER_TEMPLATE(timestamp);
		const filePath = `${OUTPUT_BASE_NAME}.${saveFormat}`;

		if (saveFormat === "json") {
			let existingContent = "";
			try {
				existingContent = await readFile(filePath, "utf-8");
			} catch {}
			const newContent = `${header}${JSON.stringify(
				seededUsers,
				null,
				2,
			)}\n`;
			await appendFile(filePath, newContent);
		} else if (saveFormat === "csv") {
			const csvRows = seededUsers.map((u) =>
				[u.username, u.nickname, u.email, u.password].join(","),
			);
			let csvHeader = "";
			try {
				await access(filePath, fsConstants.F_OK);
			} catch {
				csvHeader = "username,nickname,email,password\n";
			}
			await appendFile(filePath, `${csvHeader}${csvRows.join("\n")}\n`);
		}

		console.log(`\n📝 Saved ${seededUsers.length} users to ${filePath}`);
	}
}

main();
