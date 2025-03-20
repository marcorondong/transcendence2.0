import prisma from "../../utils/prisma";
import { createProductInput } from "./product.schema";

export async function createProduct(data: createProductInput & {ownerId: number}) {
	return prisma.product.create({
		data,
	});
}

// TODO: Research why this one is not async?
// TODO: Change this to use schemas
export function getProducts() {
	return prisma.product.findMany({
		select: {
			content: true,
			title: true,
			price: true,
			id: true,
			owner: {
				select: {
					name: true,
					id: true,
				},
			},
		},
	});
}