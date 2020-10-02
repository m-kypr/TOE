var gameId;
const gridSize = 3
const gridElementSize = 100
const border = 3
const gridDiv = document.getElementById("grid")
const chatInput = document.getElementById("chatIn")
const btn = document.getElementById("btn")
const targetIdIn = document.getElementById("targetIdIn")
const gameIdDiv = document.getElementById("gameId")
const scoreDiv = document.getElementById("score")

const resize = () => {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let tmpDiv = document.createElement("div");
      tmpDiv.id = String(i) + String(j)
      tmpDiv.className = "gridElement"
      tmpDiv.style.width = gridElementSize + "px"
      tmpDiv.style.height = gridElementSize + "px"
      tmpDiv.style.border = border + "px solid black"
      gridDiv.appendChild(tmpDiv)
    }
  }
}

chatInput.addEventListener("keyup", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    console.log(chatInput.value)
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
  changeStatusShort("Copied to clipboard!", 2000)
})

function changeStatusPerm(text) {
  document.getElementById("status").innerText = text
}

function changeStatusShort(text, time = 1000) {
  let status = document.getElementById("status")
  let origText = status.innerText;
  status.innerText = text
  setTimeout(function () {
    status.innerText = origText
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


btn.addEventListener("click", function (e) {
  var arr = new Uint8Array(1)
  arr[0] = 0
  send(gameId, targetIdIn.value.toUpperCase(), arr, function (xhr) {
    try {
      let r = JSON.parse(xhr.responseText)
      // console.log(r["msg"])
      changeStatusShort(r["msg"])
    } catch (error) {
      changeStatusPerm(xhr.responseText)
    }

    // console.log(xhr.responseText)
  })
  // console.log(targetIdIn.value)
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
  return arr.join("")
})

targetIdIn.addEventListener("mousedown", function () { this.value = "" })

function request(type, url, handler, headers = [], data = "", params = []) {
  let xhr = new XMLHttpRequest()
  params.forEach(function (p) {
    url += "?" + p
  });
  xhr.open(type, url, true);
  headers.forEach(function (h) {
    xhr.setRequestHeader(h[0], h[1]);
  });
  xhr.send(data)
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4) {
      handler(xhr)
    }
  }
}
function toUTF8Array(str) {
  var utf8 = [];
  for (var i = 0; i < str.length; i++) {
    var charcode = str.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6),
        0x80 | (charcode & 0x3f));
    }
    else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f));
    }
    // surrogate pair
    else {
      i++;
      // UTF-16 encodes 0x10000-0x10FFFF by
      // subtracting 0x10000 and splitting the
      // 20 bits of 0x0-0xFFFFF into two halves
      charcode = 0x10000 + (((charcode & 0x3ff) << 10)
        | (str.charCodeAt(i) & 0x3ff));
      utf8.push(0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f));
    }
  }
  return utf8;
}

function send(sender, receiver, message, callback) {
  let a = JSON.stringify({ "s": sender, "r": receiver, "msg": message })
  a = toUTF8Array("AAAAAA")
  let b = new Uint8Array(a.length)
  for (let i = 0; i < a.length; i++) {
    b[i] = a[i]
  }
  console.log(b)
  request("POST", "/send", callback, ["Content-Type", "application/json"], b)
}

function requestGameId() {
  request("GET", "/gid", function (xhr) {
    gameId = xhr.responseText
    gameIdDiv.innerText = gameId
  })
}

function startListener() {
  if (gameId == undefined) {
    return
  }
  setInterval(function () {
    request("GET", "/recv", function (xhr) {
      let r = JSON.parse(xhr.responseText)
      if (r.length > 0) {
        for (const i in r) {
          let packet = r[i]
          // console.log(r[i])
          if (packet["msg"] === "0") {
            changeStatusPerm("Connected to ID " + packet["s"])
          }
        }
      }
    }, [], '', ["gid=" + gameId])
  }, 1000)
}


document.onresize = resize

resize()
requestGameId()
startListener()