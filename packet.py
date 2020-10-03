from settings import UUID_LENGTH, ENCODING
from error import InvalidPacketError


class Packet():
  def __init__(self, signal, sender, receiver, message):
    self.signal = int(signal)
    self.sender = sender
    self.receiver = receiver
    self.message = message

    try:
      if not self.validate():
        raise InvalidPacketError(self)
    except Exception as e:
      raise InvalidPacketError(self)

  @staticmethod
  def from_bytes(arr):
    return Packet(arr[0], arr[1:UUID_LENGTH+1], arr[UUID_LENGTH+1:UUID_LENGTH*2+1], arr[UUID_LENGTH*2+1:len(arr)])

  def to_byte(self):
    return bytes([self.signal]) + bytes(self.sender) + bytes(self.receiver) + bytes(self.message)

  def validate(self):
    return len(self.sender) <= UUID_LENGTH or len(self.receiver) <= UUID_LENGTH

  def __repr__(self):
    return str(self.__dict__)
