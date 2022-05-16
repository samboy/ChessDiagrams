# What this is

Interactive chess diagrams on a web page.

The code in question is geared for a static HTML blog I have, in 
order to have annotated chess games with interactive diagrams.
The pages are compatible with modern browsers, most phones, and
even work with older browsers going back to 2011, such as Internet 
Explorer 9.

The diagrams allow one to go backwards and forwards in a game, to see
how a position develops move by move.

# Functional example

The file [exampleChess.html](https://samboy.github.io/ChessDiagrams/exampleChess.html) has 
a functional example of a web page using the chess diagrams.  
Notes are in the HTML comments.

# How to use

* Install all of the files in this directory (except `exampleChess.html`)
  in the same location as a static HTML file which needs a chess 
  diagram added

* Make a static HTML file, or a file where the raw HTML can be edited.

* Add something this to the page in question, either in the top
  header or just above the first diagram:

```
<script src="jquery-3.4.1.min.js"></script>
<script src="chessboard-0.3.0.min.js"
  type="text/javascript"></script>
<script src="chess.js"></script>
<link href="chessboard-0.3.0.min.css" rel="stylesheet"></link>
<script src="chessgame.js"></script>
```

* For the first chess diagram, have something like this:

```
<div id="gameScore-box"></div>
<script type="text/javascript">
runGame("1. e4 e5 2. Nf3 Nf6 3. Nxe5 Nxe4 4. Qe2 f6 5. Qh5 g6 6. Nxg6 hxg6 "
    + " 7. Qxg6+ Ke7 8. Qxe4 Kd6 9. Qd4 Kc6 10. Qc4 Kb6 11. Qb5# 1-0 ",
    "White checkmates Black","gameScore",0,0,0,0);
</script>
<noscript>
1. e4 e5 2. Nf3 Nf6 3. Nxe5 Nxe4 4. Qe2 f6 5. Qh5 g6 6. Nxg6 hxg6
7. Qxg6+ Ke7 8. Qxe4 Kd6 9. Qd4 Kc6 10. Qc4 Kb6 11. Qb5# 1-0
{White checkmates Black}
</noscript>
```

The first argument to `runGame` is the PGN score of the game.  The
second argument is how the game ended ("White resigned", "Black resigned",
"Time ran out", "White checkmates Black", "Black checkmates White", "Draw",
etc.).  The third argument, for the first diagram, should be `gameScore`.
The subsequent arguments (4-7) are detailed below.  

* For a subsequent diagram looking at a position in the above game,
  have something like this:

```
<div id="board1-box"></div>
<script type="text/javascript">
runGame(0,"White checkmates Black","board1",6,"Position after 3... Nxe4?!",
        0,0);
</script>
<noscript>
Position after 3... Nxe4?!
</noscript>
```

This leads us to how to use runGame.

# The API for runGame

Here, when the first argument to runGame is 0, it uses the score from the
game with the label `gameScore`.  If this is the `gameScore` game and the
first argument to runGame is 0, or if `gameScore` is never set, an argument
of 0 for the PGN score will return Kasparov vs. Topalov, Wijk aan Zee
1999.  It’s possible to show multiple different games on one page;
just have the first argument be the PGN game score.

The second argument is how the game ends.

The third argument is the label for the board.  This has to be the
same as the first part of the div ID used to show the board, and it has
to be unique; I like to use "gameScore", then "board1", "board2", "board3",
and so on.  

The fourth argument is the ply number to show from the game in the 
diagram.  0 is game start, 1 is after White’s first move, 2 is after
Black’s first move, 3 is after White’s second move, and so on.  If this
is not 0, the buttons below the game will change to make it easier to
go back to the position the diagram originally illustrates.

The fifth argument is the text to put below the chess board.  It
defaults to the PGN for the game in question.

The sixth argument is the FEN for either the starting position (a string), 
or for each and every position in a game (an array).  This can be used 
for analysis positions, endgame studies, loading long games faster (we 
save time with long games not processing a PGN string), chess variants, 
etc.

The seventh argument is the string to show at the first position in
the diagram.  It defaults to "Game start".

# Moving the files

With some web pages, it may be better to have the dependencies (Javascript
files, images, etc.) to be in another directory.

This can be done:

* Move the paths to all of the required `.js` and `.css` files
* Edit `chessgame.js` to have `pieceTheme` point to where the piece
  images are.

For example, if we have all the files in `/chessfiles` on the web
server, here is how the include looks:

```
<script src="/chessfiles/jquery-3.4.1.min.js"></script>
<script src="/chessfiles/chessboard-0.3.0.min.js"
  type="text/javascript"></script>
<script src="/chessfiles/chess.js"></script>
<link href="/chessfiles/chessboard-0.3.0.min.css" rel="stylesheet"></link>
<script src="/chessfiles/chessgame.js"></script>
```

And here is how the relevant code in `chessgame.js` needs to look:

```
  board[label] = ChessBoard(label, {
    // Make this the path to the pieces, e.g.
    pieceTheme: '/chessfiles/{piece}.png',
    // pieceTheme: '{piece}.png',
    position: fen[label][ply[label]]
  });
```

Absolute paths are best.  

# Printing CSS

For chess boards to look good when printing a web page, the following
CSS can be put in the printing CSS:

```
/* Chess board squares colors */
.black-3c85d {
        color-adjust: exact !important;
        -webkit-print-color-adjust: exact !important;
        background-color: #ccc !important;
        color: #444 !important;
}
.white-1e1d7 {
        background-color: #fff !important;
        color: #444 !important;
}
/* Chess board stays on one page when printed */
.chessboard-63f37 {
        page-break-inside:avoid;
}
```

The `color-adjust` is needed so that the black squares keep their color
when printing the page.

Note that while the diagrams are generally compatible with Internet Explorer
9 and above, since Internet Explorer never got `color-adjust` support, 
the chess diagrams will lost their checkerboard when printed in IE.  The
solution is to use a modern standards-compliant browser when printing
pages with these chess diagrams; all other browsers except IE (including
Edge) support `color-adjust`.

# Using myfen 

The `myfen` parameter is useful when having a long chess game, such as the
136-move long Carlsen versus Nepomniachtchi, World Chess Championship 2021
game.  By using `myfen`, a long game like this loads almost instantly,
even on an older smart phone, instead of taking as long as a few seconds
to load if the Javascript needs to convert the PGN file in to a series
of FEN postitions.

The `myfen` parameter also allows illegal moves in games, such as using
this diagram code for Makruk, Shatranj, or any other chess variant which
uses the same 8x8 board and pieces as standard Chess.

Examples of `myfen` in use can be seen in the file [myfen.html](https://samboy.github.io/ChessDiagrams/myfen.html).

# Notes

The underlying code does not use Chess960 rules for castling; only
standard castling is supported.  The workaround is to use the myfen
parameter with an array when showing Chess960 games where castling was 
used.

