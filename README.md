# Chessboard Game

A lightweight, responsive chessboard built with vanilla HTML/CSS/JS.
Features drag-and-drop, click-to-move, capture log with in-panel scrolling, sounds, turn tracking, basic win detection (by king capture), localStorage persistence, and keyboard navigation.

![demo](./demo.gif) 
Live Project: (https://mvntahax.github.io/chess/)

---

## Features

- Responsive 8×8 board (perfect square, scales with layout)
- Drag & Drop and Click to Move
- Turn indicator (`white` / `black`)
- Capture log with smooth auto-scroll (contained inside the dashboard)
- Sounds for move / capture / reset
- Game persistence via `localStorage` (board, current player, capture log)
- Keyboard navigation: arrow keys to move focus, Enter/Space to act
- Clean UI using CSS variables for quick theming

**Note on rules (intentionally simplified):**
- No check detection, castling, promotion, en passant, stalemate, or 50-move rule
- “Checkmate” is simulated by capturing the king

---

## Tech Stack

- HTML5 (no frameworks)
- CSS3 (Grid, variables, responsive layout)
- JavaScript (ES6+, no dependencies)

---

## Getting Started

### 1) Clone

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
````

### 2) Serve (recommended)

Opening `index.html` directly can work, but a local server avoids path/caching issues.

**Option A: Python**

```bash
python -m http.server 5173
# open http://localhost:5173
```

**Option B: Node (http-server)**

```bash
npm i -g http-server
http-server -p 5173
# open http://localhost:5173
```

---

## Project Structure (suggested)

```
.
├── index.html
├── styles.css
├── script.js
├── banner.png
├── demo.gif
├── images/                     # piece sprites
│   ├── wP.png  wR.png  wN.png  wB.png  wQ.png  wK.png
│   └── bP.png  bR.png  bN.png  bB.png  bQ.png  bK.png
└── sounds/                     # audio cues
    ├── move.mp3
    ├── capture.mp3
    └── reset.mp3
```

**Path requirements**

* Pieces: `images/${color}${type}.png` (e.g., `wP.png`, `bQ.png`)
* Sounds: `sounds/move.mp3`, `sounds/capture.mp3`, `sounds/reset.mp3`
* Background: `assets/banner.png` referenced in CSS (`body`)

---

## Configuration

### CSS Theme (edit in `styles.css` → `:root`)

```css
:root {
  /* Colors */
  --color-page-background: #FFF;
  --color-main-container-background: #F9BFC7;
  --color-inner-container-background: #FFF0F0;
  --color-border: #E0ABBB;
  --color-button-background: #FFF;
  --color-heading-text: #FFF;
  --color-button-text: #E0ABBB;
  --color-message-text: #E0ABBB;

  /* Fonts */
  --font-family-main: "Inter", sans-serif;
  --font-size-large: 1.75rem;
  --font-size-medium: 1.5rem;

  /* Radii / Borders */
  --border-radius: 0.3125rem;
  --border-width-main: 3px;
  --border-width-inner: 3.413px;

  /* Spacing */
  --padding-container: 0.625rem;
  --gap-lg: 40px;
  --gap-md: 20px;
  --gap-sm: 12px;

  /* Chess square size */
  --square: clamp(42px, 6.2vw, 64px);
}
```

### LocalStorage Keys

* `chessBoard` – serialized 8×8 array
* `currentPlayer` – `"white"` or `"black"`
* `captureLog` – innerHTML of the log list

Clear with the Reset button or manually via DevTools.

---

## Controls

* Click: select a piece → click a highlighted square to move
* Drag & Drop: drag your piece to a legal square
* Keyboard:
* 
  * Arrow Keys: move the focus cursor around the board
  * Enter / Space: select or move
* Reset: button to restart and clear saved state

---

## Layout Notes

* The board is sized with `width` and `aspect-ratio` so it remains square and does not exceed its column.
* The dashboard (right panel) uses a max-width and grid so the capture list scrolls inside the panel (`overflow: auto`) rather than the page.
* On mobile, the panel stacks under the board; both remain within the container width.

---

## Development Tips

* If pieces don’t appear: verify filenames and case (e.g., `wP.png` vs `wp.png`).
* If sounds don’t play: confirm `sounds/*.mp3` exist; browsers may block autoplay until a user interaction.
* If layout overflows on mobile: check `.game-container` padding and max-width caps.
* If the capture log doesn’t scroll: ensure `#capture-log { overflow: auto; }` and its parent uses `overflow: hidden` and `min-height: 0` where appropriate.

---

## Roadmap

* Real check detection and checkmate
* Castling, promotion, en passant
* Move history (PGN-like), undo/redo
* Per-piece legal move highlights
* Basic AI (random / minimax)
* Sound and theme toggles (settings panel)

---

## Contributing

Pull requests are welcome. Please:

1. Keep dependencies minimal (vanilla JS).
2. Document changes to game logic.
3. Test on both desktop and mobile widths.

---

## License

Chess piece images: “SVG Chess Pieces” by Cburnett, licensed under CC BY-SA 3.0.  
No changes except resizing/exporting to PNG for web use.

- Author: Cburnett
- License: CC BY-SA 3.0 (https://creativecommons.org/licenses/by-sa/3.0/)
- Original source: https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces

---

* Thank you! Please rate 5 stars if you like it and don't forget to provide credits if you use!^^
