# What this is

Interactive chess diagrams on a web page.

The code in question is geared for a static HTML blog I gave, in 
order to have annotated chess games with interactive diagrams.

The diagrams allow one to go backwards and forwards in a game, to see
how a position develops move by move.

# Functional example

The file `index.html` has a functional example of a web page using
the chess diagrams.  Notes are in the HTML comments.

# How to use

* Install all of the files in this directory (except `index.html`)
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
    "White checkmates Black","gameScore",0,0);
</script>
<noscript>
1. e4 e5 2. Nf3 Nf6 3. Nxe5 Nxe4 4. Qe2 f6 5. Qh5 g6 6. Nxg6 hxg6
7. Qxg6+ Ke7 8. Qxe4 Kd6 9. Qd4 Kc6 10. Qc4 Kb6 11. Qb5# 1-0
{White checkmates Black}
</noscript>
```

The first argument to `runGame` is the PGN score of the game.  The
second argument is how the game ended ("White resigned", "Black resigned",
"Time ran out", "White checkmates Black", "Black chesmates White", "Draw",
etc.).  The third argument, for the first diagram, should be `gameScore`.
The fourth and fifth arguments are detailed below.

* For a subsequent diagram looking at a position in the above game,
  have something like this:

```
<div id="board1-box"></div>
<script type="text/javascript">
runGame(0,"White checkmates Black","board1",6,"Position after 3... Nxe4?!");
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

The fifth argument is the text to put below the chess board.
