export type GameMode = "tournament" | "singles" | "doubles" | "spectate";
export type TournamentSize = 4 | 8 | 16;

export interface SelectionState {
	menuSelection: "game" | "mode" | "play";
	gameSelection: undefined | "pong" | "ttt";
	modeSelection: undefined | GameMode;
	playSelection: undefined | string;
}
export interface Menu {
	icon: string;
	label: string;
}

export interface GameData {
	menuItems: Menu[];
	gameOptions: string[];
	modeOptions: {
		id: GameMode;
		label: string;
		play: { value: string; label: string }[];
	}[];
	selectionState: SelectionState;
}
