# TOE - A Multiplayer packet based TicTacToe Game

## How it works

Each session is assigned an UUID (Game ID) by sending the Game ID, the server connects you with the desired player. 

Packets are sent to the server that stores the packets until the connected player retrieves them 

### Packets
The packets are in json format

{'sender': 'gameID', 'receiver': 'gameID', 'msg': 'indicator integer (II) + message'}

The IIs:
0 - Connect request | x
1 - Move request    |
2 - Confirm signal  |
3 - Chat signal     |

### Error Messages
0 - Invalid GameId
1 - 

## TODO

* implement chat packet 3
* implement packets 1-2
* implement disconnect detection -> free game id if there is no /recv request for 1 min 


## Usage
Start the server with:

python tictac.py
