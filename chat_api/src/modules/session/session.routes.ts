import { FastifyInstance } from "fastify";
import { errorHandler } from "../../utils/errors";
import {
	initializeOpt,
	terminateOpt,
	chatHistoryOpt,
	friendRequestOpt,
	friendRequestAcceptedOpt,
	updateBlockStatusOpt,
	inviteToPlayOpt,
	acceptPlayInviteOpt,
} from "./session.options";

export async function sessionRoutes(server: FastifyInstance) {
	console.log("Registering session routes");
	try {
		server.get("/healthCheck", async (request, reply) => {
			return { status: "ok" };
		});
		server.post("/initialize", initializeOpt);
		server.delete("/terminate", terminateOpt);
		server.post("/chatHistory", chatHistoryOpt);
		server.post("/friendRequest", friendRequestOpt);
		server.post("/friendRequestAccepted", friendRequestAcceptedOpt);
		server.patch("/updateBlockStatus", updateBlockStatusOpt);
		server.post("/inviteToPlay", inviteToPlayOpt);
		server.post("/acceptPlayInvite", acceptPlayInviteOpt);
		// server.setErrorHandler((error, request, reply) => {
		// 	errorHandler(error, request, reply);
		// });
	} catch (error) {
		console.error("Error registering session routes:", error);
	}
}
