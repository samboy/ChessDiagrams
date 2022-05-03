/* Donated to the public domain 2022 by Sam Trenholme */
var ply = {};
var board = {};
var game = {};
var endtext = {};
var moves = {};
// Default PGN is Kasparov-Topalov January 1999
var pgnDefault = "1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5"+
" 7. Nge2 Nbd7 8. Bh6 Bxh6 9. Qxh6 Bb7 10. a3 e5 11. O-O-O Qe7 "+
"12. Kb1 a6 13. Nc1 O-O-O 14. Nb3 exd4 15. Rxd4 c5 16. Rd1 Nb6 " +
"17. g3 Kb8 18. Na5 Ba8 19. Bh3 d5 20. Qf4+ Ka7 21. Rhe1 d4 " +
"22. Nd5 Nbxd5 23. exd5 Qd6 24. Rxd4 cxd4 25. Re7+ Kb6 " +
"26. Qxd4+ Kxa5 27. b4+ Ka4 28. Qc3 Qxd5 29. Ra7 Bb7 30. Rxb7 " +
"Qc4 31. Qxf6 Kxa3 32. Qxa6+ Kxb4 33. c3+ Kxc3 34. Qa1+ Kd2 " +
"35. Qb2+ Kd1 36. Bf1 Rd2 37. Rd7 Rxd7 38. Bxc4 bxc4 39. Qxh8 " +
"Rd3 40. Qa8 c3 41. Qa4+ Ke1 42. f4 f5 43. Kc1 Rd2 44. Qa7 1-0";

function runGame(pgn,end,label,startply,caption) {
  ply[label] = startply;
  endtext[label] = end;
  var counter = 0;

  // Since we may use the same PGN multiple times when annotating a
  // game, let’s allow pgn to be a copy of "gameScore".  This way,
  // we can more easily show multiple positions in a given game.  Note
  // that this doesn’t make showing analysis positions which didn’t occur
  // in the game easier, but, IMHO, diagrams should usually be of 
  // positions which actually were on the board in the game.
  if(pgn == 0) { pgn = pgnDefault; }
  if(label == "gameScore") { pgnDefault = pgn; }

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
  if(caption == 0) { caption = pgn; }
  document.getElementById(label +  "-text").innerHTML = caption;
  
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
