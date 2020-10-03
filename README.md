# TOE - A Multiplayer packet based TicTacToe Game

## How it works

Each session is assigned an UUID (Game ID) by sending the Game ID, the server connects you with the desired player. 

Packets are sent to the server that stores the packets until the connected player retrieves them 

## Packets

Format: byte arrays with length > 12

| Name     | Length | Position |
| -------- |:------:| --------:|
| Signal   | 1      | 1        |
| Sender   | 6      | 2        |
| Receiver | 6      | 3        |
| Message  | 1000   | 4        |


| Packet       | UInt |
| -------      | ----:|
| Connect      | 0    |
| Move         | 1    |
| Chat         | 2    |

Packet Messages

| Message      | Code     |
| ------------ | --------:|
| Move Request | SYM + ID |
| Move Confirm | C        |
| Move Deny    | D        |


## Status Messages

Format: JSON

| Name                   | ID |
| ---------------------- |:--:|
| Success                | 0  |
| InvalidGameId          | 1  |
| InvalidPacket          | 2  |
| BadRequest             | 3  |
| PlayerAlreadyConnected | 4  |



## TODO

* make error handling good
* sanitize chat messages


## Dev LOG

10/3 IT WORKS


## Usage
Start the server with:

python tictac.py
