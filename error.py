import json


class Error(Exception):
  def __init__(self, id, msg):
    self.id = id
    self.msg = msg

  def to_str(self):
    return json.dumps(self.__dict__)


class InvalidGameIdError(Error):
  def __init__(self, gameId=0):
    print(gameId)
    if gameId:
      super().__init__(0, f"Invalid gameId: {gameId}")
    else:
      super().__init__(0, f"Invalid gameId")


class InvalidPacketError(Error):
  def __init__(self, packet=None):
    super().__init__(1, f"Invalid packet: {packet}")


class BadRequestError(Error):
  def __init__(self):
    super().__init__(2, "The server did not understand the request")


class PlayerAlreadyConnectedError(Error):
  def __init__(self):
    super().__init__(3, "This player is already connected")
