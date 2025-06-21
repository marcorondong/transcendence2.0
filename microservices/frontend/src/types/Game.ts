export const GameModes = [
	"tournament",
	"singles",
	"doubles",
	"spectate",
] as const;
export type GameMode = (typeof GameModes)[number];
export const TournamentSizes = [4, 8, 16] as const;
export type TournamentSize = (typeof TournamentSizes)[number];
export const GameRooms = ["private", "public", undefined] as const;
export type GameRoom = (typeof GameRooms)[number];
export const Games = ["pong", "ttt"] as const;
export type Game = (typeof Games)[number];
export const BotModes = ["easy", "normal", "hard"] as const;
export type BotMode = (typeof BotModes)[number];

export interface GameSelection {
	menu?: "game" | "mode" | "play";
	game: undefined | Game;
	mode: undefined | GameMode;
	room: TournamentSize | GameRoom | BotMode | string;
}

export interface Menu {
	icon: string;
	label: string;
}

export interface GameData {
	menu: Menu[];
	game: string[];
	mode: {
		id: GameMode;
		label: string;
		play: { value: string; label: string }[];
	}[];
	selection: GameSelection;
}
