// ==============================
// 🎮 Game Configuration
// ==============================
export const ballConfig: IBallConfig = {
	initial_direction: {
		x: 0.1, //Ball is heading to the Left paddle in straight line
		y: 0.0,
	},
	radius: 0.075, //Size of ball
};

export const paddleConfig: IPaddleConfig = {
	height_singles: 1, //size of paddle in 1 v 1
	height_doubles: 0.5, //size of paddle in 2 v 2
	overtime_shrink_factor: 0.2, //20 % aka 5 touches in overtime before complete disappearing
	move_speed: 0.05,
};

export const scoreBoardConfig: IScoreBoardConfig = {
	match_length: 15, //in seconds
};

export const tournamentConfig = {
	default_size: 4,
	valid_sizes: [4, 8, 16],
};

// ==============================
// 🛢️ Database Configuration
// ==============================
const base_Pong_DB_URL = "http://pong_db_container:3011/pong-db";
export const pongDbConfig: IPongDbConfig = {
	base_Pong_DB_URL,
	store_game_endpoint: `${base_Pong_DB_URL}/create-game`, //base url + /create game
};

export const blockchainConfig = {
	contract_address: "0x61B6Bd9d657D8106b3A683572b97C391E6b3F0f5",
	fuji_rpc_url: "https://api.avax-test.network/ext/bc/C/rpc",
};

// ==============================
// ⚙️ Interfaces
// ==============================
interface IPaddleConfig {
	height_singles: number;
	height_doubles: number;
	overtime_shrink_factor: number; //20 % aka 5 touches before complete disappearing
	move_speed: number;
}

interface IScoreBoardConfig {
	match_length: number;
}

interface IPongDbConfig {
	base_Pong_DB_URL: string;
	store_game_endpoint: string;
}

interface IBallConfig {
	initial_direction: {
		x: number;
		y: number;
	};
	radius: number;
}
