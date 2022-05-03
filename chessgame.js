/* Donated to the public domain 2022 by Sam Trenholme */
var ply;
var board;
var game = new Chess();
var endtext = "Game over";
var moves;

function runGame(pgn,end,label) {
 board = ChessBoard(label, {
    // Make this the path to the pieces, e.g.
    // pieceTheme: '/blog/chess/{piece}.png',
    pieceTheme: '{piece}.png',
    position: 'start'
  });
  document.getElementById(label + "-move").innerHTML = "Game start";
  ply = 0;
  endtext = end;
  var counter = 0;

  // 1. Load a PGN into the game
  
  game.load_pgn(pgn);
  var localhistory = game.history();
  moves = new Array();
  for(counter = 0; counter < localhistory.length; counter++) { 
    moves[counter] = localhistory[counter];
  }

  // Display the pgn string below the board
 
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
      ply += 1;
    } else if(action == -1) {
      ply = 0;
    } else if(action == -2) {
      ply -= 1;
    } else if(action == -4) {
      ply = moves.length;
    } else if(action >= 0) {
      ply = action;
    }
    
    if (ply > moves.length) {
      ply = moves.length;
    } else if(ply < 0) {
      ply = 0;
    }
    if(ply % 2 == 0) {
      color = " (Black moved)";
    } else {
      color = " (White moved)";
    }
    game.reset();
    for(coutner = 0; counter < ply; counter++) { 
      game.move(moves[counter]);
    }
    board.position(game.fen());
    if(ply == moves.length) {
      document.getElementById(label + "-move").innerHTML = endtext;
    } else if(ply == 0) {
      document.getElementById(label + "-move").innerHTML = "Game start";
    } else {
      document.getElementById(label + "-move").innerHTML = "Move " +
         Math.floor((ply+1)/2) + color;
    } 
}
