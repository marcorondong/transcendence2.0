//File for definig all custom Events. So it is easier to define listeners

export const TournamentEvents =
{
	FULL: Symbol("Tournament is full"),
	STARTED: Symbol("Tournament is started"),
	FINISHED: Symbol("Tournament is finished")
}

export const RoomEvents =
{
	EMPTY: Symbol("Room is empty"),
	FULL: Symbol("Room is full, ready to play")
}

export const ClientEvents =
{
	GONE_OFFLINE: Symbol("Connection lost, player is offline")
}

export const GameEvents=
{
	FINISHED: Symbol("Game is finished")
}