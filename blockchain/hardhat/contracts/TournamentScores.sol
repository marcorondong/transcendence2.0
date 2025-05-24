// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TournamentScores {
	uint256 gamesCount = 0;
	address public contractOwner;

	constructor() {
		contractOwner = msg.sender; //deployer of contract is owner
	}

	modifier onlyOwner() {
		require(msg.sender == contractOwner, "Not the owner of contract");
		_; //this means insert the code of the function here after the check. So in record game owner is checked and then the rest of logic is applied
	}

	struct Game {
		string gameId;
		string tournamentId;
		string stageName;
		string player1Id;
		string player2Id;
		uint8 player1Score;
		uint8 player2Score;
		bool exist;
	}

	event GameLog(
		string gameId,
		string tournamentId,
		string stageName,
		string player1Id,
		uint8 player1Score,
		string player2Id,
		uint player2Score,
		uint timestamp
	);

	mapping(string => Game) private games;

	// Game[] public games;

	function recordGame(
		string memory _gameId,
		string memory _tournamentId,
		string memory _stageName,
		string memory _player1,
		string memory _player2,
		uint8 _player1Score,
		uint8 _player2Score
	) public onlyOwner {
		require(!games[_gameId].exist, "Game already exist");
		require(
			_player1Score != _player2Score,
			"Game with draw result should not be stored"
		);
		Game memory oneGame = Game(
			_gameId,
			_tournamentId,
			_stageName,
			_player1,
			_player2,
			_player1Score,
			_player2Score,
			true
		);
		games[_gameId] = oneGame;
		gamesCount++;
		emit GameLog(
			_gameId,
			_tournamentId,
			_stageName,
			_player1,
			_player1Score,
			_player2,
			_player2Score,
			block.timestamp
		);
	}

	function getGamesCount() external view returns (uint256) {
		return gamesCount;
	}

	function getGame(
		string memory gameId
	)
		external
		view
		returns (
			string memory,
			string memory,
			string memory,
			string memory,
			string memory,
			uint8,
			uint8
		)
	{
		require(games[gameId].exist == true, "No record for requested gameID");
		Game memory requestedGame = games[gameId];
		return (
			requestedGame.gameId,
			requestedGame.tournamentId,
			requestedGame.stageName,
			requestedGame.player1Id,
			requestedGame.player2Id,
			requestedGame.player1Score,
			requestedGame.player2Score
		);
	}

	function getGameWinner(
		Game memory oneGame
	) internal pure returns (string memory) {
		if (oneGame.player1Score > oneGame.player2Score)
			return oneGame.player1Id;
		return oneGame.player2Id;
	}

	function getGameLoser(
		Game memory oneGame
	) internal pure returns (string memory) {
		if (oneGame.player1Score < oneGame.player2Score)
			return oneGame.player1Id;
		return oneGame.player2Id;
	}

	function interpretGame(
		Game memory oneGame
	) internal pure returns (string memory) {
		string memory sentence = string(
			abi.encodePacked(
				"Game ID:",
				oneGame.gameId,
				", Winner: ",
				getGameWinner(oneGame),
				", Loser: ",
				getGameLoser(oneGame),
				", In Knockout stage: ",
				oneGame.stageName,
				", of tournament Id: ",
				oneGame.tournamentId
			)
		);
		return sentence;
	}

	function getGameLog(
		string memory gameId
	) external view returns (string memory) {
		require(games[gameId].exist == true, "No record for requested gameID");
		Game memory requestedGame = games[gameId];
		return interpretGame(requestedGame);
	}
}
