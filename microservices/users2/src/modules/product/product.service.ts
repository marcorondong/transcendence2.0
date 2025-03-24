import prisma from "../../utils/prisma";
import { createProductInput } from "./product.schema";

export async function createProduct(data: createProductInput & {ownerId: number}) {
	return prisma.product.create({
		data,
	});
}

// TODO: Research why this one is not async?
// MR_NOTE: This function returns all products with all fields (no filtering)
export function getProducts() {
	return prisma.product.findMany();
}