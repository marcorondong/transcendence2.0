import { FastifyInstance } from "fastify";
import {
	getFriendListOpt,
	addFriendOpt,
	updateBlockStatusOpt,
} from "./friendList.options";

export async function friendListRoutes(server: FastifyInstance) {
	console.log("Registering friend list routes");
	try {
		server.get("/get/:userName", getFriendListOpt);
		server.post("/add", addFriendOpt);
		server.patch("/block", updateBlockStatusOpt);
	} catch (error) {
		console.error("Error registering friend list routes:", error);
	}
}
