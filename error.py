class Error(Exception):
  def __init__(self, id, msg):
    self.id = id
    self.msg = msg

  def to_str(self):
    return str(self.__dict__)

  def to_json(self):
    import json
    return json.dumps(self.__dict__)

  def __repr__(self):
    return self.to_str()


class Success(Error):
  def __init__(self, msg):
    super().__init__(0, msg)


class InvalidGameIdError(Error):
  def __init__(self, gameId):
    super().__init__(1, f"Invalid gameId")
    self.gameId = gameId


class InvalidPacketError(Error):
  def __init__(self, packet=None):
    self.packet = packet
    super().__init__(2, f"Invalid packet")


class BadRequestError(Error):
  def __init__(self):
    super().__init__(3, "The server did not understand the request")


class PlayerAlreadyConnectedError(Error):
  def __init__(self, gameId):
    super().__init__(4, f"Player {gameId} is already connected")
