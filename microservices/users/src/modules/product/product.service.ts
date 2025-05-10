import { Prisma } from "@prisma/client";
import { AppError, PRODUCT_ERRORS } from "../../utils/errors";
import prisma from "../../utils/prisma";
import { createProductInput } from "./product.schema";

// Helper function to capitalize conflicting Prisma field
function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function createProduct(
	// data: createProductInput & { ownerId: number },
	data: createProductInput & { ownerId: string },
) {
	try {
		const product = await prisma.product.create({
			data,
		});
		return product;
	} catch (err) {
		if (err instanceof Prisma.PrismaClientKnownRequestError) {
			// Known/Expected errors bubble up to controller as AppError (custom error)
			switch (err.code) {
				case "P2002":
					const target =
						(err.meta?.target as string[])?.[0] ?? "field";
					throw new AppError({
						statusCode: 409,
						code: PRODUCT_ERRORS.PRODUCT_CREATE,
						message: `${capitalize(target)} already exists`,
					});
				// case "P2025":
				// TODO: Should I check this here?
				// throw new AppError({
				// 	statusCode: 404,
				// 	code: PRODUCT_ERRORS.NOT_FOUND,
				// 	message: "Product not found",
				// });
				case "P2003":
					throw new AppError({
						statusCode: 400,
						code: PRODUCT_ERRORS.PRODUCT_CREATE,
						message: "Invalid foreign key",
					});
			}
		}
		// Unknown errors bubble up to global error handler.
		throw err;
	}
}

// This function returns all products with all fields (no filtering)
export async function getProducts() {
	const products = await prisma.product.findMany();
	return products;
}
