import logging
import time
import random
import json
from flask import Flask, render_template, request, abort, jsonify
from error import *
from packet import Packet
from settings import *

if not DEBUG:
  log = logging.getLogger('werkzeug')
  log.setLevel(logging.ERROR)

CONNECTIONS = []
GAME_IDS = []
PACKET_BUFFER = {}

app = Flask(__name__)


@app.route('/gid')
def gid():
  import shortuuid
  while True:
    gameId = shortuuid.random(length=UUID_LENGTH).upper()
    if gameId not in [x[1] for x in GAME_IDS]:
      GAME_IDS.append([time.time(), gameId])
      PACKET_BUFFER[gameId] = []
      return gameId


def is_valid(gameId):
  global GAME_IDS
  return gameId in [x[1] for x in GAME_IDS]


def connect(id1, id2):
  if not is_valid(id1):
    raise InvalidGameIdError(id1)
  if not is_valid(id2):
    raise InvalidGameIdError(id2)
  for c in CONNECTIONS:
    if id1 in c[1:] or id2 in c[1:]:
      raise PlayerAlreadyConnectedError(id2)
  CONNECTIONS.append([time.time(), id1, id2])


def processPacket(packet):
  print(f"processing packet {packet}")
  if packet.signal == 0:
    try:
      connect(packet.sender.decode(ENCODING), packet.receiver.decode(ENCODING))
      PACKET_BUFFER[packet.receiver.decode(ENCODING)].append(packet)
      raise Success(
          f"Connected to {packet.receiver.decode(ENCODING)}")
    except InvalidGameIdError as e:
      raise InvalidGameIdError(e.gameId)
  PACKET_BUFFER[packet.receiver.decode(ENCODING)].append(packet)
  return "PACKET SENT SUCCESSFULLY"


@app.route('/send', methods=['POST'])
def send():
  try:
    return processPacket(Packet.from_bytes(request.data))
  except Error as e:
    return e.to_json()


@app.route('/recv')
def recv():
  gameId = request.args.get('gid')
  if not gameId:
    return abort(400, BadRequestError().to_str())
  if not is_valid(gameId):
    return abort(400, InvalidGameIdError(gameId).to_str())
  for i in range(len(GAME_IDS)):
    if GAME_IDS[i][1] == gameId:
      GAME_IDS[i][0] = time.time()
      break
  buf = PACKET_BUFFER[gameId]
  PACKET_BUFFER[gameId] = []
  ret_buf = []
  for bp in buf:
    ret_buf.append(bp.to_byte())
  return b"\n".join(ret_buf)


@app.route('/')
def index():
  return render_template("index.html")


def house_keeper():
  global GAME_IDS
  while True:
    for i in range(len(GAME_IDS)):
      if time.time() - GAME_IDS[i][0] > UUID_LIFETIME:
        print(f"House Keeper: removing {GAME_IDS[i]}")
        del GAME_IDS[i]
        break


if __name__ == "__main__":
  from threading import Thread
  t = Thread(target=house_keeper)
  t.start()
  app.run(debug=DEBUG)
  t.join()
