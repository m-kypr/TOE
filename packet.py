import json
from error import *

PACKETS = set()


class Packet(dict):
  def __init__(self, sender="", receiver="", msg=""):
    self.s = sender
    self.r = receiver
    self.msg = self.II+msg
    global PACKETS
    PACKETS.add(self.__class__)
    dict.__init__(self, s=self.s, r=self.r, msg=self.msg)

  @staticmethod
  def from_str(string):
    j = json.loads(string)
    global PACKETS
    for packet in PACKETS:
      if packet.II == j['msg']:
        return packet(j['s'], j['r'])

  def validate(self):
    if self.s is not None and self.r is not None and self.msg is not None:
      return 1
    raise InvalidPacketError(self)


class ConnectPacket(Packet):
  II = "0"


class MovePacket(Packet):
  II = "1"


class ConfirmPacket(Packet):
  II = "2"


class ChatPacket(Packet):
  II = "3"
