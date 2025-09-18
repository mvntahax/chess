Chessboard Game!

A lightweight, responsive chessboard built with vanilla **HTML/CSS/JS**.
Features **drag-and-drop**, **click-to-move**, **capture log with in-panel scrolling**, sounds, turn tracking, basic win detection (by king capture), **localStorage** persistence, and **keyboard navigation**.

![demo](./demo.gif)

---

## ✨ Features

* **Responsive 8×8 board** (perfect square, scales with layout)
* **Drag & Drop** and **Click to Move**
* **Turn indicator** (`white` / `black`)
* **Capture log** with smooth **auto-scroll** (contained inside the dashboard)
* **Sounds** for move / capture / reset
* **Game persistence** via `localStorage` (board, current player, capture log)
* **Keyboard navigation**: arrow keys to move focus, **Enter/Space** to act
* Clean UI using **CSS variables** for quick theming

> Rules are intentionally simplified:
No check detection, castling, promotion, en passant, stalemate, or 50-move rule
“Checkmate” is simulated by **capturing the king**

---

## 🧱 Tech Stack

* **HTML5** (no frameworks)
* **CSS3** (Grid, variables, responsive layout)
* **JavaScript (ES6+)** (no dependencies)

---

## 🚀 Getting Started

### 1) Clone

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2) Serve (recommended)

You can open `index.html` directly, but a local server avoids path/caching quirks.

**Option A: Python**

```bash
# Python 3
python -m http.server 5173
# then open http://localhost:5173
```

**Option B: Node (http-server)**

```bash
npm i -g http-server
http-server -p 5173
# then open http://localhost:5173
```

---

## 📁 Project Structure (suggested)

```
.
├── index.html
├── styles.css
├── script.js
├── assets/
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

> **Paths are important**:
>
> * Pieces: `images/${color}${type}.png` (e.g., `wP.png`, `bQ.png`)
> * Sounds: `sounds/move.mp3`, `sounds/capture.mp3`, `sounds/reset.mp3`
> * Background: `assets/banner.png` in CSS (`body`)

---

## 🛠️ Configuration

### CSS Theme (edit in `styles.css` → `:root`)

```css
:root {
  --color-page-background: #50AFC9;
  --color-main-container-background: #F9BFC7;
  --color-inner-container-background: #FFF0F0;
  --color-border: #E0ABBB;
  --color-button-background: #FFF;
  --color-heading-text: #FFF;
  --color-button-text: #E0ABBB;
  --color-message-text: #E0ABBB;
}
```

### LocalStorage Keys

* `chessBoard` – serialized 8×8 array
* `currentPlayer` – `"white"` or `"black"`
* `captureLog` – innerHTML of the log list

Clear with the **Reset** button or manually via DevTools.

---

## 🎮 Controls

* **Click**: select a piece → click a highlighted square to move
* **Drag & Drop**: drag your piece to a legal square
* **Keyboard**:

  * **Arrow Keys**: move the focus cursor around the board
  * **Enter / Space**: act (select / move)
* **Reset**: button to restart and clear saved state

---

## 📐 Layout Notes

* Board is sized with `width + aspect-ratio` → stays square and **never exceeds** its column.
* Dashboard (right panel) is capped with `max-width` and uses grid to ensure **capture list scrolls inside** the panel (`overflow:auto`), not the page.
* Mobile: panel stacks under the board; both remain within container width.

---

## 🧪 Development Tips

* If pieces don’t appear: check filenames and case (e.g., `wP.png` vs `wp.png`).
* If sounds don’t play: confirm `sounds/*.mp3` paths exist; browsers may block autoplay until first user interaction.
* If the layout overflows on mobile: verify `.game-container` padding and `max-width` caps.
* If the log doesn’t scroll: ensure `#capture-log { overflow:auto; }` and its parent has `overflow:hidden` + `min-height:0` where needed.

---

## 🗺️ Roadmap

* Real **check** detection & true **checkmate**
* **Castling**, **promotion**, **en passant**
* **Move history** (PGN-like), undo/redo
* **Per-piece legal move highlights** (rule-accurate)
* Basic **AI** (random / minimax)
* **Sound & theme toggles** (settings panel)

---

## 🤝 Contributing

PRs welcome! Please:

1. Keep the code dependency-free (vanilla JS).
2. Add comments for game-logic changes.
3. Test on desktop + mobile widths.

---

## 📜 License

Choose your license (e.g., **MIT**) and add it here.
If you’re using third-party piece images or sounds, ensure you have the rights and credit the source in this README.

---

## 🙏 Credits

* UI/colors and responsive layout: your custom CSS
* Piece sprites & sounds: **provide your own assets** or link attribution here

Please rate 5 stars and credit me if you use it! Thank you!^^
