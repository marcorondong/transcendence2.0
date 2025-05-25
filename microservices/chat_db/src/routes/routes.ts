import type { FastifyInstance } from "fastify";
import {
	createUserOpt,
	blockUserOpt,
	unblockUserOpt,
	toggleBlockOpt,
	blockStatusOpt,
	blockListOpt,
	healthCheckOpt,
} from "./options";
import { env } from "../utils/env";

export async function chatRoutes(server: FastifyInstance) {
	server.post(env.CHAT_DB_CREATE_USER_STATIC, createUserOpt);
	server.patch(env.CHAT_DB_BLOCK_USER_STATIC, blockUserOpt);
	server.patch(env.CHAT_DB_UNBLOCK_USER_STATIC, unblockUserOpt);
	server.patch(env.CHAT_DB_TOGGLE_BLOCK_STATIC, toggleBlockOpt);
	server.get(env.CHAT_DB_BLOCK_STATUS_STATIC, blockStatusOpt);
	server.get(env.CHAT_DB_BLOCK_LIST_STATIC, blockListOpt);
	server.get(env.CHAT_DB_HEALTH_CHECK_STATIC, healthCheckOpt);
}
