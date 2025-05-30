
## Tournament match making
*  Class that stores all tournaments in map by id
* It is important to distinguish in those maps sizes of tournament. We will support 4, 8 and 16 players for now
* There are active tournaments; one that already have all players and started. And There are lobby tournaments; ones that are waiting for players 
* class manages all tournaments and as soon as one is done; finished it will store result and clean all Pong rooms of that tournaments 

## Tournament joiner logic 
```pseudo code
1. new player connects
2. Check query on how many players in tournament he wants (4, 8 or 16); default is 4 players
3. Look at tournaments in map.
	1. If there is non active tournament with correct size 
		join that player to that tournament
	2. else 
		create tournament with that size and put that player in that tournament 
```
## Singles match joiner public
``` pseudo code
1. new player connect
2. Look for room in map 
	1. if there is public lobby room 
		join player to that room
	2. else 
		create room and put player in that one
```
