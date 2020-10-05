var gameId;
var targetId;
var connected;
var turns;
var turn = "X";
var lastMove;
var gameOver;
var scores = [0, 0]
var emotes = []
const updateRate = 500
const gridSize = 3
const gridElementSize = 100
const border = 3
const gridDiv = document.getElementById("grid")
const chatInput = document.getElementById("chatIn")
const btn = document.getElementById("btn")
const targetIdIn = document.getElementById("targetIdIn")
const gameIdDiv = document.getElementById("gameId")
const scoreDiv = document.getElementById("score")
const messages = document.getElementById("messages")

const resize = () => {
  console.log(window.outerWidth, window.outerHeight)
  if (window.outerWidth < ((gridElementSize + (border) * 2) * gridSize) * 2) {
    document.getElementById("game").style.display = "block"
  }
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let tmpDiv = document.createElement("div");
      tmpDiv.id = String(i) + String(j)
      tmpDiv.className = "gridElement"
      tmpDiv.style.width = gridElementSize + "px"
      tmpDiv.style.height = gridElementSize + "px"
      tmpDiv.style.lineHeight = gridElementSize + "px"
      tmpDiv.style.border = border + "px solid black"
      gridDiv.appendChild(tmpDiv)
    }
  }
}
function _arrayBufferToBase64(buffer) {
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function makeRequest(method, url, headers = [], data = "", params = [], responseType = "text") {
  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();

    xhr.responseType = responseType
    params.forEach(function (p) {
      url += "?" + p
    });
    xhr.open(method, url);
    headers.forEach(function (h) {
      xhr.setRequestHeader(h[0], h[1]);
    });
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    xhr.send(data);
  });
}

async function emotify(text, callback) {
  // https://api.betterttv.net/3/cached/emotes/global
  if (emotes.length == 0) {
    emotes = JSON.parse(await makeRequest("GET", "https://api.betterttv.net/3/cached/emotes/global"))
    // console.log(emotes)
  }
  for (let i = 0; i < emotes.length; i++) {
    if (emotes[i]['code'] === text) {
      if (emotes[i]['data'] == undefined) {
        emotes[i]['data'] = _arrayBufferToBase64(await makeRequest("GET", "/emote", [], "", ["id=" + emotes[i]['id']], "arraybuffer"))
      }
      // console.log(emotes[i])
      callback(emotes[i]['data'])
      return
      // return emotes[i]['data']
    }
  }
  callback(0)
}


function addChatMessage(sender = "", message) {
  var msgBuf = []
  var words = message.split(" ").filter(function (el) {
    return el != "";
  })
  // console.log(words)
  var emoteStack = []
  words.forEach(function (w) {
    // console.log(w)
    emotify(w, function (data) {
      if (data == 0) {
        msgBuf.push(w)
        return
      }
      emoteStack.push(data)
      msgBuf.push("")
    })
  })
  let chatLine = document.createElement("div")
  chatLine.className = "chat-line";
  // chatLine.style.border = "1px solid red"
  chatLine.innerText = ["[", sender, "]: "].join("")
  let interval = setInterval(() => {
    if (msgBuf.length < words.length) {
      return;
    }
    // console.log(msgBuf)
    if (sender.length != 0) {
      for (let i = 0; i < msgBuf.length; i++) {
        let word = msgBuf[i]
        let textFragment = document.createElement("span")
        if (word.length == 0) {
          if (textFragment.innerText.length != 0) {
            chatLine.appendChild(textFragment)
            textFragment = document.createElement("span")
          }
          let data = emoteStack.pop()
          let tmpImg = document.createElement("img")
          chatLine.appendChild(tmpImg)
          tmpImg.src = "data:image/png;base64," + data
        } else {
          let a = word
          if (i != msgBuf.length - 1) {
            a += " "
          }
          textFragment.innerText += a
        }
        chatLine.appendChild(textFragment);
      }
      document.getElementById("messages").appendChild(chatLine)
    }
    // else {
    //   messages.innerHTML += ["[", sender, "]: ", msgBuf.join(" "), "\n"].join("")
    // }
    clearInterval(interval)
  }, 1000);
  messages.scrollTop = messages.scrollHeight;
}

function sanitizeChatMessage(msg) {
  // TODO: Implement
  return msg
}

chatInput.addEventListener("keyup", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    let message = sanitizeChatMessage(chatInput.value);
    if (message.length > 0) {
      addChatMessage("You", message)
      chatInput.value = ""
      if (targetId != undefined) {
        send(buildPacket(2, gameId, targetId, message), function (xhr) {
          console.log(xhr.responseText)
        })
      }
    }
  }
});

function animateButton(button) {
  var origCol;
  var origText;
  var click = 0;
  button.addEventListener("mousedown", function (e) {
    click = 1
    let span = document.querySelector("#" + button.id + ">span")
    span.innerText = ""
    button.style.width = "75%"
    button.style.height = "75%"
    button.style.borderColor = "black"
  })
  button.addEventListener("mouseup", function () {
    let c = 1
    let span = document.querySelector("#" + button.id + ">span")
    span.innerText = origText
    button.style.borderColor = origCol
    let interv = setInterval(function () {
      if (c < 11) {
        button.style.width = 75 + c + "%"
        button.style.height = 75 + c + "%"
      } else {
        click = 0
        clearInterval(interv)
      }
      c++
    }, 15)
  })
  let anim = function () {
    if (click == 0) {
      let span = document.querySelector("#" + button.id + ">span")
      origCol = button.style.borderColor;
      origText = span.innerText;
      button.style.width = "92%"
      button.style.height = "92%"
    }
  }
  button.addEventListener("mouseover", anim);
  button.addEventListener("mouseleave", function (e) {
    click = 0
    let span = document.querySelector("#" + button.id + ">span")
    button.style.width = "85%"
    button.style.height = "85%"
    button.style.borderColor = origCol
    span.innerText = origText
  })
}

animateButton(btn)

const copyBtn = document.getElementById("copyBtn")
animateButton(copyBtn)
copyBtn.addEventListener("click", function () {
  copyTextToClipboard(gameId)
  changeStatusShort("Copied to clipboard!")
})

function changeStatusPerm(text) {
  document.getElementById("status").innerText = text
}

function changeStatusShort(text = "", s = 0, time = 2000) {
  let status = document.getElementById("status")
  let origText = status.innerText;
  let origCol = status.style.backgroundColor;
  switch (s) {
    case 1:
      status.style.backgroundColor = "red";
      break;
    case 2:
      status.style.backgroundColor = "green";
      break;
    default:
      break;
  }
  if (text.length != 0) {
    status.innerText = text
  }
  setTimeout(function () {
    status.style.backgroundColor = origCol
    if (text.length != 0) {
      status.innerText = origText
    }
  }, time)
}


// das a yoink from stack overflow 
function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function () {
    console.log('Async: Copying to clipboard was successful!');
  }, function (err) {
    console.error('Async: Could not copy text: ', err);
  });
}

function string2Bytes(string) {
  let arr = []
  for (let i = 0; i < string.length; i++) {
    // console.log(string.charCodeAt(i))
    // console.log(string[i])
    arr.push(string.charCodeAt(i))
  }
  return arr
}

function buildPacket(signal, sender, receiver, message) {
  return new Uint8Array([].concat([signal], string2Bytes(sender), string2Bytes(receiver), string2Bytes(message)))
}

btn.addEventListener("click", function (e) {
  if (connected == 1) {
    changeStatusShort("", 1)
    return
  }
  targetId = targetIdIn.value
  if (targetId.length == 6) {
    let arr = buildPacket(0, gameId, targetId, '')
    // let arr = new Uint8Array([].concat([0], string2Bytes(gameId), string2Bytes(targetIdIn.value)))
    // console.log(arr)
    send(arr, function (xhr) {
      try {
        let json = JSON.parse(xhr.responseText)
        if (json['id'] == 0) {
          connected = 1
          document.title = "Your move!"
          resetGame()
          changeStatusPerm(json['msg'])
          return
        }
        changeStatusShort(json['msg'], 1)
      } catch (error) {
        changeStatusShort(xhr.responseText)
      }
    }, "text")
  }
})


function setInputFilter(textbox, inputFilter) {
  ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function (event) {
    textbox.addEventListener(event, function () {
      this.value = inputFilter(this.value)
    });
  });
}
setInputFilter(targetIdIn, function (v) {
  let arr = v.match(/([a-zA-Z0-9])/g)
  if (arr == undefined) return ""
  if (arr.length > 6) {
    arr = arr.slice(0, 6);
    targetIdIn.style.backgroundColor = "red"
    setTimeout(function () {
      targetIdIn.style.backgroundColor = ""
    }, 200)
  }
  return arr.join("").toUpperCase()
})

targetIdIn.addEventListener("mousedown", function () { this.value = "" })

function request(type, url, callback, headers = [], data = "", params = [], responseType = "text") {
  let xhr = new XMLHttpRequest()
  xhr.responseType = responseType
  params.forEach(function (p) {
    url += "?" + p
  });
  xhr.open(type, url, true);
  headers.forEach(function (h) {
    xhr.setRequestHeader(h[0], h[1]);
  });
  xhr.send(data)
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      callback(xhr)
    }
  }
}
function send(bytes, callback, responseType) {
  request("POST", "/send", callback, ["Content-Type", "application/octet-stream"], bytes, [], responseType)
}

function requestGameId() {
  request("GET", "/gid", function (xhr) {
    gameId = xhr.responseText
    gameIdDiv.innerText = gameId
  })
}

function bytes2String(arr) {
  let stringBuf = []
  for (let i = 0; i < arr.length; i++) {
    stringBuf.push(String.fromCharCode(arr[i]))
  }
  return stringBuf.join("")
}

function checkBoard() {
  for (let i = 0; i < gridSize; i++) {
    let cArr = new Array(gridSize + 1).fill(0)
    for (let j = 0; j < gridSize; j++) {
      let div = document.getElementById(String(i) + String(j));
      if (div.innerText == "X") cArr[0]++
      if (div.innerText == "O") cArr[0]--
      div = document.getElementById(String(j) + String(i));
      if (div.innerText == "X") cArr[1]++
      if (div.innerText == "O") cArr[1]--
      div = document.getElementById(String(j) + String(j));
      if (div.innerText == "X") cArr[2]++
      if (div.innerText == "O") cArr[2]--
      div = document.getElementById(String(j) + String(gridSize - 1 - j));
      if (div.innerText == "X") cArr[3]++
      if (div.innerText == "O") cArr[3]--
    }
    for (let k = 0; k < gridSize + 1; k++) {
      if (cArr[k] == 3) {
        return 1
      } else if (cArr[k] == -3) {
        return -1
      }
    }
  }
  if (turns >= 9) { return 0 }
  return null
}

function isValidMove(move) {
  var valid = 0;
  Array.from(document.getElementsByClassName("gridElement")).forEach(function (e) {
    if (move.slice(1, move.length) == e.id) {
      if (e.innerText.length == 0) {
        if (move[0] === "X" & turns % 2 == 0 | move[0] === "O" & turns % 2 != 0) {
          e.innerText = move[0]
          valid = 1;
        }
      }
    }
  });
  return valid;
}

function resetGame() {
  scores = [0, 0]
  updateScores()
  resetBoard()
}


function resetBoard() {
  gameOver = 0;
  turns = 0;
  Array.from(document.getElementsByClassName("gridElement")).forEach(function (e) {
    e.innerText = "";
  })
}

function updateScores() {
  scoreDiv.innerText = scores.join("-")
}
function startListener() {
  setInterval(function () {
    if (gameId == undefined) {
      return
    }
    request("GET", "/recv", function (xhr) {
      try {
        var byteArray = new Uint8Array(xhr.response)
        if (byteArray.length == 0) { return; }
        processPacket(byteArray)
      } catch (error) {
        console.log("Could not validate packet")
        console.log(error)
      }
    }, [], '', ["gid=" + gameId], "arraybuffer")
    testBoard()
  }, updateRate)
}


function testBoard() {
  if (gameOver == 1) { return }
  let result = checkBoard()
  if (result == undefined) {
    return
  }
  gameOver = 1;
  var w = -1;
  console.log(result)
  if (result == 1 & turn === "X" | result == -1 & turn === "O") {
    w = 1
  }
  if (result == 0) {
    w = 0
  }
  if (w == 1) {
    scores[0]++
    changeStatusShort("YOU WON", 2)
    addChatMessage("", "YOU WON")
    // alert("W")
  } else if (w == -1) {
    scores[1]++
    changeStatusShort("YOU LOST", 1)
    addChatMessage("", "YOU LOST")
    // alert("L")
  } else if (w == 0) {
    changeStatusShort("TIE")
    addChatMessage("", "ISSA TIE")
    // alert("TIE")
  }
  updateScores()
  resetBoard()
}


function moveError(id) {
  let div = document.getElementById(id)
  let origCol = div.style.backgroundColor
  div.style.backgroundColor = "red"
  setTimeout(function () {
    div.style.backgroundColor = origCol
  }, 300)
  changeStatusShort("Invalid Move", 1, 500)
}


function processPacket(packet) {
  let signal = packet[0]
  let sender = bytes2String(packet.slice(1, 7))
  let receiver = bytes2String(packet.slice(7, 13))
  let message = bytes2String(packet.slice(13, packet.length))
  // console.log("recv packet: ", signal, sender, receiver, message)
  switch (signal) {
    case 0:
      connected = 1;
      resetGame()
      turn = "O"
      targetId = sender
      changeStatusPerm("Connected to " + sender);
      break;
    case 1:
      if (sender === targetId & receiver === gameId) {
        if (message === "D") {
          moveError(lastMove)
          // console.log("MOVE DENIED")
          // turns--;
          break;
        }
        if (message === "C") {
          document.getElementById(lastMove).innerText = turn;
          turns++;
          break;
        }
      }
      let accept = "C";

      if (isValidMove(message) == 0) {
        accept = "D"
      } else {
        document.title = "Your move!"
        turns++
      }
      send(buildPacket(1, gameId, targetId, accept), function (xhr) {
        console.log(xhr.responseText)
      })
      break;
    case 2:
      addChatMessage(sender, message)
      break;
    default:
      // Unknown / Corrupt / Invalid packet
      break;
  }
}

function makeMove(e) {
  lastMove = e.id;
  let packet = buildPacket(1, gameId, targetId, turn + e.id)
  send(packet, function (xhr) {
    document.title = "..."
    console.log(xhr.responseText)
  })
}


resize()


Array.from(document.getElementsByClassName("gridElement")).forEach(function (e) {
  var origBorderCol;
  var state = "X";
  e.addEventListener("mouseover", function () {
    origBorderCol = e.style.borderColor
    e.style.borderColor = "white"
  })
  e.addEventListener("mouseleave", function () {
    e.style.borderColor = origBorderCol
  })
  e.addEventListener("click", function (event) {
    if (gameOver == 1) {
      event.preventDefault()
      return
    }
    if (connected == 1) {
      makeMove(e)
      return
    }
    //
    // We are local
    //
    // alert("LOCAL")
    if (e.innerText.length == 0) {
      if (turns % 2 == 0) {
        e.innerText = "X"
      } else {
        e.innerText = "O"
      }
      turns++
    }
    let result = checkBoard()
    if (result == undefined) {
      return
    }
    if (result == 1) {
      scores[0]++
      changeStatusShort("X WON")
    } else if (result == -1) {
      scores[1]++
      changeStatusShort("O WON")
    } else if (result == 0) {
      changeStatusShort("TIE")
    }
    gameOver = 1;
    updateScores()
    setTimeout(function () {
      resetBoard()
    }, 2000)
  })
})

document.onresize = resize

turns = 0;
requestGameId()
startListener()

