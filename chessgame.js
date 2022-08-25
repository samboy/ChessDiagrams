/* Donated to the public domain 2022 by Sam Trenholme */
// NOTE NOTE NOTE: If the piece graphics are moved, change pieceTheme below

// This file `chessgame.js` is licensed under either of the following terms.
// One may license these files under either the unlicense or the BSD0
// license, or both.  No attribution is needed to use this file.
//
// # unlicense
// 
// Anyone is free to copy, modify, publish, use, compile, sell, or
// distribute this software, either in source code form or as a compiled
// binary, for any purpose, commercial or non-commercial, and by any
// means.
// 
// In jurisdictions that recognize copyright laws, the author or authors
// of this software dedicate any and all copyright interest in the
// software to the public domain. We make this dedication for the benefit
// of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of
// relinquishment in perpetuity of all present and future rights to this
// software under copyright law.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
// OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
// ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.
// 
// For more information, please refer to <http://unlicense.org/>
// 
// # BSD0
// 
// Copyright (C) 2022 by Sam Trenholme
// 
// Permission to use, copy, modify, and/or distribute this software for
// any purpose with or without fee is hereby granted.
// 
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
// All of these are objects because we have multiple board support
var ply = {};
var board = {};
var game = {};
var endtext = {};
var starttext = {};
var startmovenumber = {};
var startcolor = {};
var moves = {};
var note = {};
var defaultply = {};
var fen = {}
var gamelength = {};

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

// Wrapper: We use window.setTimeout to not render the boards until the
// page is rendered (Chrome annoyance workaround)
function runGame(pgn,end,label,startply,caption,myfen,startmsg) {
    // Ancient IE check so scripts run in IE9 (2011)
    var msie = navigator.userAgent.indexOf("MSIE");
    var ie = "";
    iev = 83;
    if(msie && msie > 0) {
         ie=navigator.userAgent.substr(msie + 5);
         var iea = ie.indexOf(";");
         ie = ie.substr(0,iea);
         iev = parseInt(ie);
    }
    if(iev > 10) {
         window.setTimeout(runGameReal,50,
            pgn,end,label,startply,caption,myfen,startmsg);
    } else {
         runGameReal(pgn,end,label,startply,caption,myfen,startmsg);
    }
}

// Input:
// pgn: The PGN (moves played) in the chess game
// end: How the game ended, as a short string to be read by humans, e.g.
//      "1-0", "Black resigned", "Stalemate (draw)", 
//      "White checkmates Black", etc.
// label: The ID for the board which contains this chess game
// startply: At which ply do we display the position. 0 is game start,
//      1 is after White's first move, 2 is after Black's first move,
//      3 is after White's second move, and so on
// caption: The caption to put below the game.  If 0, the PGN becomes the
//      text displayed
// myfen: This is used for the starting position (we use the PGN to 
//      determine subsequent positions in the game) if a string.  
//      If myfen is an array with the FEN for each position,
//      we use this array of FEN positions to determine the position
//      after each move.  Doing this way is a good deal faster than
//      calculating each FEN from the PGN game score, so it is useful
//      for really long games like the 136-move long Carlsen versus 
//      Nepomniachtchi, World Chess Championship 2021, Game 6. Note 
//      that the FEN array overrides the game PGN; if in use, the PGN will 
//      only be used for the default caption. If myfen is 0, 
//      the starting position is the standard RNBQKBNR (#518 in Chess960)
//      setup and we use the PGN to determine the FEN for each position.
// startmsg: The message used to describe the start of the sequence of
//      moves shown in the diagram.  Defaults to "Game start"
function runGameReal(pgn,end,label,startply,caption,myfen,startmsg) {
  if(startply == 0) {
    document.getElementById(label +  "-box").innerHTML = 
        HTMLstringForGame(label,398);
  } else {
    document.getElementById(label +  "-box").innerHTML = 
        HTMLstringForPostition(label,398,startply);
  }
  ply[label] = startply;
  defaultply[label] = startply;
  endtext[label] = end;
  startcolor[label] = 0;
  if(startmsg == 0) {
    starttext[label] = "Game start";
  } else {
    starttext[label] = startmsg;
  }
  startmovenumber[label] = 1;
  var counter = 0;
  var useDefault = 0;
  var useLabel = "gameScore"; // Label to use if copy of another game

  // Since we may use the same PGN multiple times when annotating a
  // game, let’s allow pgn to be a copy of "gameScore".  This way,
  // we can more easily show multiple positions in a given game.  Note
  // that this doesn’t make showing analysis positions which didn’t occur
  // in the game easier, but, IMHO, diagrams should usually be of 
  // positions which actually were on the board in the game.
  if(pgn == 0 && myfen == 0) { pgn = pgnDefault; useDefault = 1; }
  if(label == "gameScore") { pgnDefault = pgn; useDefault = 0; }
  if(pgn.match(/^board/)) { useDefault = 1; useLabel = pgn; pgn = 0; }

  // By using Array.isArray(), this code requires I use a browser which
  // came out in 2011 or later (IE9 was 2011-03-13, Firefox 4 was 2011-04-21,
  // Chrome 5 was 2010-05-24, Safari 5 was 2010-06-06, and Opera 11.5
  // was 2011-06-27).  This code is compatible with IE9 for everything
  // except printing (IE never got `color-adjust`)

  // If myfen is an array, that means the FEN has already been calculated
  // move by move.  For really long games like Carlsen versus Nepomniachtchi, 
  // World Chess Championship 2021, Game 6 (136 moves!), this speeds up
  // the loading of games *a lot*
  if(!Array.isArray(myfen)) { 
    // Initialize the board
    if(typeof(myfen) == "string") { 
      var fields;
      fields = myfen.split(/\s+/);
      if(fields.length >= 6) {
        startmovenumber[label] = parseInt(fields[5]);
        if(fields[1] == "b") {
          startcolor[label] = 1;
        }
      } 
      game[label] = new Chess(myfen); 
    } else {
      game[label] = new Chess(); // Standard (518) starting position
    }
    // 1. Load a PGN into the game (if applicable, i.e. this isn't
    //    a copy of an already loaded game)
    if(pgn != 0) {
      game[label].load_pgn(pgn);
      var localhistory = game[label].history();
      moves[label] = new Array();
      for(counter = 0; counter < localhistory.length; counter++) { 
        moves[label][counter] = localhistory[counter];
      }
      if(typeof(myfen) == "string") { 
        game[label].load(myfen); 
      } else {
        game[label].reset(); // Load Standard (518) chess position
      }
    }

    // Pre-cache the FEN for each position in the game
    if(useDefault != 1) {
      fen[label] = new Array()
      gamelength[label] = moves[label].length;
      for(counter = 0; counter <= gamelength[label]; counter++) {
        fen[label][counter] = game[label].fen();
        game[label].move(moves[label][counter]);
      }
    } else {
    // No need to calculate each and every FEN if we have already done so
      fen[label] = fen[useLabel];
      gamelength[label] = gamelength[useLabel];
    }
  } else { // Array.isArray(myfen)
    fen[label] = myfen;
    gamelength[label] = myfen.length - 1;
  }
 
  board[label] = ChessBoard(label, {
    // Make this the path to the pieces, e.g.
    // pieceTheme: '/blog/chess/{piece}.png',
    pieceTheme: '{piece}.png',
    position: fen[label][ply[label]]
  });
  setGameMoveText(label);

  // Set text below game 
  if(caption == 0) { caption = pgn; }
  note[label] = caption;
  document.getElementById(label +  "-text").innerHTML = caption;
  
}

// Input:
// label: ID of this Chess game
// action: What to do.  -1: Top -2: Last move -3: Next move -4: End
//         -5: Next move, note game is modified
//         -6: Last move, note game is modified
//	   -7: Fist move, note game is modified
// Positive number: Go to that ply number (initial position is ply 0,
// move 1 is ply 1 2, move 2 ply 3 4, etc.)
function chessMove(label,action) {
    var counter = 0;
    if(action == -3 || action == -5) {
      ply[label] += 1;
    } else if(action == -1 || action == -7) {
      ply[label] = 0;
    } else if(action == -2 || action == -6) {
      ply[label] -= 1;
    } else if(action == -4) {
      ply[label] = gamelength[label];
    } else if(action >= 0) {
      ply[label] = action;
    }

    if (ply[label] > gamelength[label]) {
      ply[label] = gamelength[label];
    } else if(ply[label] < 0) {
      ply[label] = 0;
    }

    // Note if a mid-game position has been changed by pushing the buttons
    if(action == -5 || action == -6 || action == -7 || action > 0) {
      if(ply[label] != defaultply[label]) {
          document.getElementById(label +  "-text").innerHTML = 
              "Position modified, hit “Reset” to restore";
      } else {
          document.getElementById(label +  "-text").innerHTML = note[label];
      }
    }
    
    board[label].position(fen[label][ply[label]]);
    setGameMoveText(label);
}

// Set the text for the game move next to the buttons
function setGameMoveText(label) {
    var color = "";
    if((ply[label] + startcolor[label]) % 2 == 0) {
      color = " (Black moved)";
    } else {
      color = " (White moved)";
    }
    if(ply[label] >= gamelength[label]) {
      document.getElementById(label + "-move").innerHTML = endtext[label];
    } else if(ply[label] == 0) {
      document.getElementById(label + "-move").innerHTML = starttext[label];
    } else {
      document.getElementById(label + "-move").innerHTML = "Move " +
         (Math.floor((ply[label]+startcolor[label]+1)/2) - 1 + 
          startmovenumber[label]) + color;
    } 
} 

// Create the HTML for holding the chess diagram (entire game)
function HTMLstringForGame(label,width) {
  var out = '';
  var widthstring = width + 'px';
  var newlinemaybe = '';
  if((window.innerWidth > 0 && window.innerWidth < width + 5) ||
     screen.width < width + 5) {
    widthstring = '100%';
    newlinemaybe = '<br>';
  }
  out += '<div class="chessboard" id="' + label + 
             '" style="margin: 0 auto; width: ' + widthstring + ';"></div> ';
  out += '<div style="margin: 5px auto; width: ' + widthstring + ';"> ';
  // Start of game
  out += '<input type="button" onclick="chessMove('
      + "'" + label + "'" + ',-1)" value="<<" /> ';
  // Back one move
  out += '<input type="button" onclick="chessMove('
      + "'" + label + "'" + ',-2)" value="<" /> ';
  // Next move
  out += '<input type="button" onclick="chessMove('
      + "'" + label + "'" + ',-3)" value=">" style="width: 61px;" /> ';
  // End of game
  out += '<input type="button" onclick="chessMove(' + 
         "'" + label + "'" + ',-4)" value=">>" /> ';
  out += newlinemaybe;
  out += '<span id="' + label + '-move" ';
  if(newlinemaybe == '') {
    out += 'style="margin-left:5.5px;position: absolute; overflow: visible;';
  }
  out += '"></span> ';
  out += '<p><span id="' + label + '-text"></span></p>';
  out += '</div>'
  return out;
}

// Create the HTML for holding the chess diagram (game position after
// start of game)
function HTMLstringForPostition(label,width,ply) {
  var out = '';
  var widthstring = width + 'px';
  var newlinemaybe = '';
  if((window.innerWidth > 0 && window.innerWidth < width + 5) ||
     screen.width < width + 5) {
    widthstring = '100%';
    newlinemaybe = '<br>';
  }
  out += '<div class="chessboard" id="' + label + 
             '" style="margin: 0 auto; width: ' + widthstring + ';"></div> ';
  out += '<div style="margin: 5px auto; width: ' + widthstring + ';"> ';
  // Start of game
  out += '<input type="button" onclick="chessMove('
      + "'" + label + "'" + ',-7)" value="<<" /> ';
  // Back one move
  out += '<input type="button" onclick="chessMove('
      + "'" + label + "'" + ',-6)" value="<" /> ';
  // Back to default diagram position
  out += '<input type="button" onclick="chessMove('
      + "'" + label + "'" + ',' + ply + ')" value=" Reset " /> ';
  // Start of game
  out += '<input type="button" onclick="chessMove('
      + "'" + label + "'" + ',-5)" value=">" /> ';
  out += newlinemaybe;
  out += '<span id="' + label + '-move" ';
  if(newlinemaybe == '') {
    out += 'style="margin-left:5.5px;position: absolute; overflow: visible;';
  }
  out += '"></span> ';
  out += '<p><span id="' + label + '-text"></span></p>';
  out += '</div>'
  return out;
}

