import prisma from "../../utils/prisma"; // Adjust if needed to point to prisma client

// This script is for checking the database and the schemas (to detect bugs, mismatched, etc)

(async () => {
	const schema = await prisma.$queryRawUnsafe<any[]>(
		`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'User';`,
	);
	console.log("🧩 User table schema:", schema[0]?.sql);

	const indexes = await prisma.$queryRawUnsafe<any[]>(
		`SELECT name, sql FROM sqlite_master WHERE type = 'index' AND tbl_name = 'User';`,
	);
	console.log("🧩 User indexes:", indexes);

	await prisma.$disconnect();
})();
