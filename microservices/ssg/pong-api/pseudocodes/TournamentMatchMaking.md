
## Tournament match making
*  Class that stores all Torunamets in map by id
* It is importat to distinguish in those maps sizes of tournament. We will support 4, 8 and 16 players for now
* There are active tournaments; one that already have all players and started. And There are lobby torunaments; ones that are waiting for players 
* class manages all torunamets and as soon as one is done; finished it will store result (in future) and clean all Pong rooms of that tournaments 

## Tournamnet joiner logic 
1. new player connects
2. Check querr on how many players in tournemante he wants (4, 8 or 16); default is 4
3. Look at torunametns in map.
	1. If there is non active tournamnet with correct size 
		join that player to that tournament
	2. else 
		create tournament with that size and put that player in that tournament 


## Singles match joiner 
1. new player connect
2. Look for room in map 
	1. if there is public lobby room 
		join playet to that room
	2. else 
		create room and put playet in that one