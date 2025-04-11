import { FastifyInstance } from "fastify";
import { wsZodParamSchema } from "./ws.schemas";
import { liveClients } from "../../index";
// import { wsOption } from "./ws.options";
import { wsOptions } from "./ws.options";

export async function wsRoutes(server: FastifyInstance) {
	console.log("Registering websocket routes");
	try {
		server.get("/:userName", { websocket: true }, wsOptions);
	} catch (error) {
		console.error("Error websocket routes:", error);
	}
}
