export const ballConfig: IBallConfig = {
	initial_x: -0.1,
	initial_y: 0.0,
	radius: 0.075
}

export const paddleConfig = {
	height_singles: 1,
	height_doubles: 0.5,
	overtime_shrink_factor: 0.2, //20 % aka 5 touches before complete disappearing
	move_speed: 0.05
}

export const scoreBoardConfig = {
	match_length: 10, //in seconds
}

export const blockchainConfig = {
	contract_address: "0x61B6Bd9d657D8106b3A683572b97C391E6b3F0f5",
	fuji_rpc_url: "https://api.avax-test.network/ext/bc/C/rpc"
}

const base_PongDB_URL= "http://pong_db_container:3011/pong-db"

export const pongDbConfig ={
	base_PongDB_URL,
	store_game_endpoint: `${base_PongDB_URL}/create-game` //base url + /create game
}


interface IBallConfig {
	initial_x: number,
	initial_y: number,
	radius: number
}
