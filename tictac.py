import time
import random
import json
from flask import Flask, render_template, request, abort, jsonify
from error import InvalidGameIdError, InvalidPacketError, BadRequestError, PlayerAlreadyConnectedError
from packet import Packet, ConnectPacket, ConfirmPacket, MovePacket, ChatPacket, PACKETS

UUID_LENGTH = 6

ConnectPacket()
MovePacket()
ConfirmPacket()
ChatPacket()

CONNECTIONS = set()
GAME_IDS = set()
PACKET_BUFFER = {}

app = Flask(__name__)


@app.route('/gid')
def gid():
  import shortuuid
  while True:
    gameId = shortuuid.random(length=UUID_LENGTH).upper()
    if gameId not in GAME_IDS:
      GAME_IDS.add(gameId)
      PACKET_BUFFER[gameId] = []
      return gameId


def is_valid_packet(packet):
  return packet['s'] is not None and packet['r'] is not None and packet['msg'] is not None


def is_valid(gameId):
  global GAME_IDS
  return gameId in GAME_IDS


def connect(id1, id2):
  if not is_valid(id1):
    return InvalidGameIdError(id1).to_str()
  if not is_valid(id2):
    return InvalidGameIdError(id2).to_str()
  for c in CONNECTIONS:
    if id1 in c.values() or id2 in c.values():
      return PlayerAlreadyConnectedError().to_str()
  CONNECTIONS.add({"1": id1, "2": id2, "t": time.time()})
  return 1


@app.route('/send', methods=['POST'])
def send():
  print(request.data.hex())
  return "adsasd"
  packet = Packet.from_str(request.data)
  if not packet:
    return abort(400, BadRequestError().to_str())
  try:
    packet.validate()
  except InvalidPacketError as e:
    return abort(400, e.to_str())
  return processPacket(packet)


def processPacket(packet):
  print(packet.msg.decode())
  if packet.msg.decode() == b"\00":
    connect(packet.s, packet.r)
  PACKET_BUFFER[packet.r].append(packet)
  return "lol"


@app.route('/recv')
def recv():
  gameId = request.args.get('gid')
  if not gameId:
    return abort(400, BadRequestError().to_str())
  if not is_valid(gameId):
    return abort(400, InvalidGameIdError(gameId).to_str())
  buf = PACKET_BUFFER[gameId]
  PACKET_BUFFER[gameId] = []
  return json.dumps(buf)


@app.route('/')
def hello_world():
  return render_template("index.html")


if __name__ == "__main__":
  app.run(debug=True)
