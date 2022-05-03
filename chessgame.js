/* Donated to the public domain 2022 by Sam Trenholme */
var ply = {};
var board = {};
var game = {};
var endtext = {};
var moves = {};

function runGame(pgn,end,label,startply) {
  ply[label] = startply;
  endtext[label] = end;
  var counter = 0;

  // 1. Load a PGN into the game
  game[label] = new Chess(); 
  game[label].load_pgn(pgn);
  var localhistory = game[label].history();
  moves[label] = new Array();
  for(counter = 0; counter < localhistory.length; counter++) { 
    moves[label][counter] = localhistory[counter];
  }
  game[label].reset();
  if(startply > 0) {
    for(counter = 0; counter < startply; counter++) {
      game[label].move(moves[label][counter]);
    }
  }
  console.log(game[label].fen());//DEBUG
  board[label] = ChessBoard(label, {
    // Make this the path to the pieces, e.g.
    // pieceTheme: '/blog/chess/{piece}.png',
    pieceTheme: '{piece}.png',
    position: game[label].fen() 
  });
  setGameMoveText(label);

  // Set text below game 
  document.getElementById(label +  "-text").innerHTML = pgn;
  
}

// Input:
// label: ID of this Chess game
// action: What to do.  -1: Top -2: Last move -3: Next move -4: End
// Positive number: Go to that ply number (initial position is ply 0,
// move 1 is ply 1 2, move 2 ply 3 4, etc.)
function chessMove(label,action) {
    var counter = 0;
    if(action == -3) {
      ply[label] += 1;
    } else if(action == -1) {
      ply[label] = 0;
    } else if(action == -2) {
      ply[label] -= 1;
    } else if(action == -4) {
      ply[label] = moves[label].length;
    } else if(action >= 0) {
      ply[label] = action;
    }
    
    if (ply[label] > moves[label].length) {
      ply[label] = moves[label].length;
    } else if(ply[label] < 0) {
      ply[label] = 0;
    }
    game[label].reset();
    for(counter = 0; counter < ply[label]; counter++) { 
      game[label].move(moves[label][counter]);
    }
    board[label].position(game[label].fen());
    setGameMoveText(label);
}

function setGameMoveText(label) {
    var color = "";
    if(ply[label] % 2 == 0) {
      color = " (Black moved)";
    } else {
      color = " (White moved)";
    }
    if(ply[label] >= moves[label].length) {
      document.getElementById(label + "-move").innerHTML = endtext[label];
    } else if(ply[label] == 0) {
      document.getElementById(label + "-move").innerHTML = "Game start";
    } else {
      document.getElementById(label + "-move").innerHTML = "Move " +
         Math.floor((ply[label]+1)/2) + color;
    } 
} 
