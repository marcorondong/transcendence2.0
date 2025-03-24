import prisma from "../../utils/prisma";
import { createProductInput } from "./product.schema";

export async function createProduct(data: createProductInput & {ownerId: number}) {
	const product = await prisma.product.create({
		data,
	});
	return product;
}

// MR_NOTE: This function returns all products with all fields (no filtering)
export async function getProducts() {
	const products = await prisma.product.findMany();
	return products;
}