import prisma from "../../utils/prisma";
import { createProductInput } from "./product.schema";

export async function createProduct(data: createProductInput & {ownerId: number}) {
	return prisma.product.create({
		data,
	});
}

// TODO: Research why this one is not async?
export function getProducts() {
	return prisma.product.findMany({
		select: {
			id: true,
			title: true,
			content: true,
			price: true,
			createdAt: true,
			updatedAt: true,
			owner: {
				select: {
					name: true,
					id: true,
				},
			},
		},
	});
}