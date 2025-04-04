import { Prisma } from "@prisma/client";
import { AppError } from "../../utils/errors";
import prisma from "../../utils/prisma";
import { createProductInput } from "./product.schema";

// Helper function to capitalize conflicting Prisma field
function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function createProduct(
	data: createProductInput & { ownerId: number },
) {
	try {
		const product = await prisma.product.create({
			data,
		});
		return product;
	} catch (err) {
		if (err instanceof Prisma.PrismaClientKnownRequestError) {
			// Bubble up with a custom error
			switch (err.code) {
				case "P2002":
					const target =
						(err.meta?.target as string[])?.[0] ?? "field";
					throw new AppError(
						409,
						`${capitalize(target)} already exists`,
					);
				case "P2025":
					throw new AppError(404, "Product not found"); // TODO: Should I check this here?
				case "P2003":
					throw new AppError(400, "Invalid foreign key");
			}
		}
		throw err; // Unhandled errors go to 500 (Let controller handle unexpected errors)
	}
}

// MR_NOTE: This function returns all products with all fields (no filtering)
export async function getProducts() {
	const products = await prisma.product.findMany();
	return products;
}
