import { title } from "process";
import prisma from "../../utils/prisma";
import { createProductInput } from "./product.schema";

export async function createProduct(data: createProductInput & {ownerId: number}) {
	return prisma.product.create({
		data,
	});
}

// export async function getProducts() {
// 	const products = await prisma.product.findMany();
// 	return products.map(product => ({
// 		id: product.id,
// 		title: product.title,
// 		content: product.content,
// 		price: product.price,
// 		// owner: product.owner,
// 		// ownerName: product.
// 	}));
// }

// MR_Note: Old function which didnt use automatic Zod for validation/serialization.
// MR_NOTE: I could filter the returned field via a schema;
// But I can also doing directly in prisma like this:
// TODO: Change this to use schemas
// TODO: Research why this one is not async?
// export function getProducts() {
// 	return prisma.product.findMany({
// 		select: {
// 			id: true,
// 			title: true,
// 			content: true,
// 			price: true,
// 			createdAt: true,
// 			updatedAt: true,
// 			owner: {
// 				select: {
// 					name: true,
// 					id: true,
// 				},
// 			},
// 		},
// 	});
// }

export function getProducts() {
	return prisma.product.findMany();
}