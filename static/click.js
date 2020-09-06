var divs = document.getElementsByTagName("div");
var state = false;
var gameOver = false;
var winner = "";
var clicks = 0;

function displayGameOver() {
  if (winner.length == 0) alert("Game over: Tie");
  else alert("Game over: " + winner + " won");
}

function handleClick(div, event) {
  if (div.innerHTML != "") {
    div.style.borderColor = "red";
    setTimeout(function () {
      div.style.borderColor = "black";
    }, 300);
    return;
  }
  if (state) {
    div.innerHTML = "X";
    state = !state;
    document.title = "Turn: O";
    clicks++;
  } else {
    div.innerHTML = "O";
    state = !state;
    document.title = "Turn: X";
    clicks++;
  }
  for (let i = 0; i < 3; i++) {
    x = 0;
    o = 0;
    x1 = 0;
    o1 = 0;
    x2 = 0;
    o2 = 0;
    x3 = 0;
    o3 = 0;
    for (let j = 0; j < 3; j++) {
      div = document.getElementById(i.toString() + j);
      div2 = document.getElementById(j.toString() + i);
      div3 = document.getElementById(j.toString() + j);
      div4 = document.getElementById((2 - j).toString() + j);
      if (div.innerHTML == "X") x++;
      else if (div.innerHTML == "O") o++;
      if (div2.innerHTML == "X") x1++;
      if (div2.innerHTML == "O") o1++;
      if (div3.innerHTML == "X") x2++;
      if (div3.innerHTML == "O") o2++;
      if (div4.innerHTML == "X") x3++;
      if (div4.innerHTML == "O") o3++;
    }
    if (x == 3 || x1 == 3 || x2 == 3 || x3 == 3) {
      gameOver = true;
      winner = "X";
      document.title = "Game over: X wins";
      alert("Game over: X wins");
      return;
    }
    if (o == 3 || o1 == 3 || o2 == 3 || o3 == 3) {
      gameOver = true;
      winner = "O";
      document.title = "Game over: O wins";
      alert("Game over: O wins");
      return;
    }
    if (clicks == 9) {
      gameOver = true;
      document.title = "Game over: Tie";
      alert("Game over: Tie");
      return;
    }
  }
}

document.querySelectorAll("div").forEach((div) => {
  div.addEventListener("mouseover", (event) => {
    if (gameOver) {
      displayGameOver();
      return;
    }
    div.style.borderColor = "yellow";
  });
  div.addEventListener("mouseleave", (event) => {
    // checkGameOver();
    div.style.borderColor = "black";
  });
  div.addEventListener("click", (event) => {
    handleClick(div, event);
  });
});
