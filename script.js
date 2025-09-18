/*
  Chess UI Script
  - Renders an 8x8 chessboard from a 2D array
  - Supports click + drag-and-drop moves
  - Tracks turns, captures, simple win condition (capturing the king)
  - Persists state to localStorage
  - Includes keyboard navigation (arrow keys + Enter/Space)
*/

// -----------------------------
// DOM references & audio assets
// -----------------------------

const boardElement = document.getElementById('chessboard'); // Grid container for the 64 squares
const statusElement = document.getElementById('status');     // Turn/status display
const moveSound = new Audio('sounds/move.mp3');              // Sound on move
const captureSound = new Audio('sounds/capture.mp3');        // Sound on capture
const resetSound = new Audio('sounds/reset.mp3');            // Sound on reset

// --------------------------------
// Initial board (8x8) and game state
// Uppercase = White, lowercase = Black
// --------------------------------

const initialBoard = [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"]
];

// Live board copy; never mutate initialBoard directly
let board = JSON.parse(JSON.stringify(initialBoard));

// Currently selected square (for click/drag flows)
let selected = null;

// Cache of legal target squares for the selected piece
let legalMoves = [];

// Whose turn is it? Starts with white
let currentPlayer = "white";

// -----------------------------
// Render the 8x8 board to the DOM
// - Creates 64 .square divs
// - Places <img.piece> where pieces exist
// - Adds highlighting for legal targets
// - Wires click & DnD events
// -----------------------------

function renderBoard() {
  boardElement.innerHTML = ""; // Clear previous rendering

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = document.createElement('div');

      // Light/dark classes alternate by (r + c) parity
      square.className = `square ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
      square.dataset.row = r;
      square.dataset.col = c;

      const piece = board[r][c];

      // If there's a piece, create an <img> and optionally make it draggable
      if (piece) {
        const pieceEl = document.createElement('img');
        pieceEl.className = 'piece';
        pieceEl.src = pieceToImage(piece); // Map 'P' -> images/wP.png etc.

        // Allow dragging only for the current player's pieces
        const isWhiteTurn = currentPlayer === 'white';
        const isWhitePiece = isUpper(piece);
        if ((isWhiteTurn && isWhitePiece) || (!isWhiteTurn && !isWhitePiece)) {
          pieceEl.draggable = true;
          // Basic payload for drop target: original coords
          pieceEl.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({ fromRow: r, fromCol: c }));
          });
        } else {
          // Visually dim + disable pointer events for opponent's pieces
          pieceEl.classList.add('disabled');
        }

        // Store coords on the element for drag handlers
        pieceEl.dataset.row = r;
        pieceEl.dataset.col = c;

        // Drag lifecycle hooks (styling & legal-move computation)
        pieceEl.addEventListener('dragstart', handleDragStart);
        pieceEl.addEventListener('dragend', handleDragEnd);

        square.appendChild(pieceEl);
      }

      // If this square is a legal target, add a visual marker
      if (isLegalMove(r, c)) {
        const target = board[r][c];
        if (target !== "") {
          square.classList.add('capture');   // filled red dot for capture
        } else {
          square.classList.add('highlight'); // hollow dot for empty move
        }
      }

      // Click to select/move
      square.addEventListener('click', () => handleClick(r, c));

      // DnD: allow dropping by cancelling default and add hover styling
      square.addEventListener('dragover', (e) => {
        e.preventDefault();
        square.classList.add('drag-over');
      });

      // DnD: clean hover styling when leaving
      square.addEventListener('dragleave', () => {
        square.classList.remove('drag-over');
      });

      // DnD: perform the move if the drop is legal
      square.addEventListener('drop', (e) => {
        square.classList.remove('drag-over');
        handleDrop(e);
      });

      // Commit this square to the board DOM
      boardElement.appendChild(square);
    }
  }
}

// -------------------------------------
// Map a piece char to its image filename
// 'P' => wP.png, 'q' => bQ.png, etc.
// -------------------------------------

function pieceToImage(piece) {
  const color = isUpper(piece) ? 'w' : 'b';
  const type = piece.toUpperCase();
  return `images/${color}${type}.png`;
}

// -------------------------------------------------------
// Click-to-move handler
// - First click selects a piece and shows legal moves
// - Second click on a legal target performs the move
// -------------------------------------------------------

function handleClick(r, c) {
  if (selected) {
    // If a piece is already selected, attempt to move to (r, c)
    if (isLegalMove(r, c)) {
      movePiece(selected.r, selected.c, r, c);
      currentPlayer = currentPlayer === "white" ? "black" : "white";
      statusElement.textContent = `${currentPlayer}'s turn`;
    }
    // Clear selection and re-render highlights
    selected = null;
    legalMoves = [];
    renderBoard();
  } else {
    // No selection yet: only allow selecting your own piece
    const piece = board[r][c];
    if ((currentPlayer === "white" && isUpper(piece)) || (currentPlayer === "black" && isLower(piece))) {
      selected = { r, c };
      legalMoves = getLegalMoves(r, c);
      renderBoard();
    }
  }
}

// -------------------------------------------------------
// Drag lifecycle: start / end
// - On start, compute legal moves, hide dragged piece briefly
// - On end, reset highlights and show piece again
// -------------------------------------------------------

function handleDragStart(e) {
  const r = +e.target.dataset.row;
  const c = +e.target.dataset.col;

  selected = { r, c };
  legalMoves = getLegalMoves(r, c);

  // Hide the original while dragging (after current tick for smoother UX)
  setTimeout(() => e.target.classList.add('hide'), 0);
}

function handleDragEnd(e) {
  e.target.classList.remove('hide');
  selected = null;
  legalMoves = [];
  renderBoard();
}

// -------------------------------------------------------
// Drop handler
// - Read target coords from the square
// - If the move is legal, perform it and flip turn
// -------------------------------------------------------

function handleDrop(e) {
  const r = +e.currentTarget.dataset.row;
  const c = +e.currentTarget.dataset.col;

  if (selected && isLegalMove(r, c)) {
    movePiece(selected.r, selected.c, r, c);
    currentPlayer = currentPlayer === "white" ? "black" : "white";
    statusElement.textContent = `${currentPlayer}'s turn`;
  }

  selected = null;
  legalMoves = [];
  renderBoard();
}

// -------------------------------------------------------
// Perform a move on the board array
// - Logs captures (and declares win if king taken)
// - Plays sounds
// - Persists state
// -------------------------------------------------------

function movePiece(r1, c1, r2, c2) {
  const capturedPiece = board[r2][c2];

  // If target square had a piece, log it and check for king capture
  if (capturedPiece !== "") {
    logCapture(currentPlayer, pieceName(capturedPiece));
    captureSound.play();

    // Simple win condition: capturing the king
    if (capturedPiece.toUpperCase() === 'K') {
      statusElement.textContent = `${currentPlayer} wins by checkmate!`;
      saveGame();
      disableBoard(); // Freeze the UI
      return;
    }
  }

  // Move piece: copy then clear origin
  board[r2][c2] = board[r1][c1];
  board[r1][c1] = "";

  moveSound.play();
  saveGame();
}

// -------------------------------------------------------
// Freeze interactivity by replacing squares with clones
// (removes event listeners effectively)
// -------------------------------------------------------

function disableBoard() {
  boardElement.querySelectorAll('.square').forEach(square => {
    square.replaceWith(square.cloneNode(true));
  });
}

// -------------------------------------------------------
// Append a line to the capture log
// - Uses themed colors per capturing side
// - Auto-scroll to newest entry
// -------------------------------------------------------

function logCapture(player, piece) {
  const logList = document.getElementById('capture-log');
  const entry = document.createElement('li');

  entry.textContent = `${player} eliminated ${piece}`;
  entry.style.padding = '8px';
  entry.style.textAlign = 'center';
  entry.style.fontSize = '16px';

  // Alternate text + bg based on capturing side
  entry.style.color = player.toLowerCase() === 'white' ? '#F9BFC7' : '#FFF0F0';
  entry.style.backgroundColor = player.toLowerCase() === 'white' ? '#FFF0F0' : '#F9BFC7';

  // Add a subtle divider if not the first entry
  if (logList.children.length > 0) {
    entry.style.borderTop = player.toLowerCase() === 'white' ? '1px solid #F9BFC7' : '1px solid #FFF0F0';
  }

  logList.appendChild(entry);

  // Keep the newest capture visible (works with overflow:auto)
  logList.scrollTop = logList.scrollHeight;
}

// -------------------------------------------------------
// Human-friendly piece names for the capture log
// -------------------------------------------------------

function pieceName(piece) {
  const names = { 'P': 'pawn', 'R': 'rook', 'N': 'knight', 'B': 'bishop', 'Q': 'queen', 'K': 'king' };
  return names[piece.toUpperCase()] || piece.toUpperCase();
}

// -------------------------------------------------------
// Persistence: save current game to localStorage
// - Board, current player, and capture log HTML
// -------------------------------------------------------

function saveGame() {
  localStorage.setItem('chessBoard', JSON.stringify(board));
  localStorage.setItem('currentPlayer', currentPlayer);
  localStorage.setItem('captureLog', document.getElementById('capture-log').innerHTML);
}

// -------------------------------------------------------
// Load persisted game (if any)
// - Restores board, player, and log
// - If a win message exists in the log, disable the board
// -------------------------------------------------------

function loadGame() {
  const savedBoard = localStorage.getItem('chessBoard');
  const savedPlayer = localStorage.getItem('currentPlayer');
  const savedLog = localStorage.getItem('captureLog');

  if (savedBoard && savedPlayer && savedLog !== null) {
    board = JSON.parse(savedBoard);
    currentPlayer = savedPlayer;
    document.getElementById('capture-log').innerHTML = savedLog;

    // If the saved log text implies checkmate, lock the board
    if (savedLog.includes('wins by checkmate')) {
      statusElement.textContent = `${currentPlayer} won by checkmate!`;
      renderBoard();
      disableBoard();
    } else {
      statusElement.textContent = `${currentPlayer}'s turn`;
      renderBoard();
    }
  }
}

// -------------------------------------------------------
// Utility: check if board equals its initial state
// -------------------------------------------------------

function isBoardAtInitialState() {
  return JSON.stringify(board) === JSON.stringify(initialBoard);
}

// -------------------------------------------------------
// Reset to initial state
// - Clears localStorage, resets board/log/turn
// - Plays reset sound only if there was a game to reset
// -------------------------------------------------------

function resetGame() {
  const isAlreadyReset = isBoardAtInitialState();

  localStorage.clear();
  board = JSON.parse(JSON.stringify(initialBoard));
  document.getElementById('capture-log').innerHTML = '';
  currentPlayer = 'white';
  statusElement.textContent = `${currentPlayer}'s turn`;

  if (!isAlreadyReset) {
    resetSound.play();
  }

  renderBoard();
}

// Hook up the reset button
document.getElementById('resetGame').addEventListener('click', resetGame);

// -------------------------------------------------------
// Case helpers
// -------------------------------------------------------

function isUpper(str) { return str === str.toUpperCase() && str !== ""; }
function isLower(str) { return str === str.toLowerCase() && str !== ""; }

// -------------------------------------------------------
// Legal move helpers
// - isLegalMove: check if (r,c) is in current legalMoves
// - getLegalMoves: very simplified rules (no en passant, castling, promo, check rules)
// -------------------------------------------------------

function isLegalMove(r, c) { return legalMoves.some(m => m.r === r && m.c === c); }

function getLegalMoves(r, c) {
  const piece = board[r][c];
  let moves = [];

  // Directions/offsets indexed by piece
  const directions = {
    "P": [[-1, 0], [-2, 0], [-1, -1], [-1, 1]],           // White pawn
    "p": [[1, 0], [2, 0], [1, -1], [1, 1]],               // Black pawn
    "R": straightLines(), "r": straightLines(),           // Rook
    "B": diagonals(),    "b": diagonals(),                // Bishop
    "Q": straightLines().concat(diagonals()),             // Queen
    "q": straightLines().concat(diagonals()),
    "N": knightMoves(),  "n": knightMoves(),              // Knight
    "K": kingMoves(),    "k": kingMoves()                 // King (no castling in this simplified version)
  }[piece];

  if (!directions) return [];

  // For each direction/offset, accumulate legal target squares
  directions.forEach(([dr, dc]) => {
    let nr = r + dr, nc = c + dc;

    if (piece.toLowerCase() === 'p') {
      // Pawn logic: forward moves must be empty; diagonals only capture
      if (dc === 0 && isInBounds(nr, nc) && board[nr][nc] === "") {
        // Single step OR double step from starting rank
        if ((piece === 'P' && (dr === -1 || (dr === -2 && r === 6))) ||
            (piece === 'p' && (dr === 1  || (dr === 2  && r === 1)))) {
          moves.push({ r: nr, c: nc });
        }
      }
      // Diagonal capture
      if (Math.abs(dc) === 1 && isInBounds(nr, nc) && isOpponent(piece, board[nr][nc])) {
        moves.push({ r: nr, c: nc });
      }
    } else if (piece.toLowerCase() === 'n' || piece.toLowerCase() === 'k') {
      // Knight/King: single-step offsets; can capture if opponent, or move if empty
      if (isInBounds(nr, nc) && (board[nr][nc] === "" || isOpponent(piece, board[nr][nc]))) {
        moves.push({ r: nr, c: nc });
      }
    } else {
      // Sliding pieces (rook/bishop/queen): extend until blocked
      while (isInBounds(nr, nc)) {
        const target = board[nr][nc];
        if (target === "") {
          moves.push({ r: nr, c: nc });
        } else if (isOpponent(piece, target)) {
          moves.push({ r: nr, c: nc });
          break; // stop after capture
        } else break; // same color piece blocks
        nr += dr;
        nc += dc;
      }
    }
  });

  return moves;
}

// -------------------------------------------------------
// Direction helpers for sliding and stepping pieces
// -------------------------------------------------------

function straightLines() { return [[1, 0], [-1, 0], [0, 1], [0, -1]]; }
function diagonals()    { return [[1, 1], [1, -1], [-1, 1], [-1, -1]]; }
function knightMoves()  { return [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]; }
function kingMoves()    { return straightLines().concat(diagonals()); }

// -------------------------------------------------------
// Bounds & opponent checks
// -------------------------------------------------------

function isInBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }
function isOpponent(p1, p2) { return (isUpper(p1) && isLower(p2)) || (isLower(p1) && isUpper(p2)); }

// -------------------------------------------------------
// Initial render & load persisted game
// -------------------------------------------------------

renderBoard();
loadGame();

// -------------------------------------------------------
// Keyboard navigation (accessibility & speed)
// - Arrow keys move a focus cursor around the board
// - Enter/Space triggers the same action as clicking
// -------------------------------------------------------

let focusedSquare = { r: 6, c: 0 }; // Start focus at white's a2 pawn

function updateFocus() {
  // Remove old focus outline
  boardElement.querySelectorAll('.square').forEach(sq => sq.classList.remove('focused'));

  // Add outline to the new focused square (if it exists)
  const square = boardElement.querySelector(`.square[data-row="${focusedSquare.r}"][data-col="${focusedSquare.c}"]`);
  if (square) square.classList.add('focused');
}

// Global keyboard handler
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':
      focusedSquare.r = (focusedSquare.r - 1 + 8) % 8;
      break;
    case 'ArrowDown':
      focusedSquare.r = (focusedSquare.r + 1) % 8;
      break;
    case 'ArrowLeft':
      focusedSquare.c = (focusedSquare.c - 1 + 8) % 8;
      break;
    case 'ArrowRight':
      focusedSquare.c = (focusedSquare.c + 1) % 8;
      break;
    case 'Enter':
    case ' ':
      // Simulate a click on the focused square
      handleClick(focusedSquare.r, focusedSquare.c);
      break;
  }
  updateFocus();
});

// -------------------------------------------------------
// Inject minimal style for focused outline (keyboard nav)
// -------------------------------------------------------

const style = document.createElement('style');
style.textContent = `
  .square.focused {
    outline: 3px solid #E0ABBB;
    outline-offset: -3px;
  }
`;
document.head.appendChild(style);

// Set initial focus
updateFocus();