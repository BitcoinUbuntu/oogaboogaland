(() => {
  "use strict";
  const BL = window.BL;
  const { box, bevelBox, lathe, tube, merge, moved, turnedX, turnedZ } = BL.models;
  // Runes as strokes in a cell one wide and two tall: Berkanan (B), Thurisaz (Thor's thorn) and Uruz (U).
  const RUNES = [
    [[-0.4, -1, -0.4, 1], [-0.4, 1, 0.4, 0.5], [0.4, 0.5, -0.4, 0], [-0.4, 0, 0.4, -0.5], [0.4, -0.5, -0.4, -1]],
    [[-0.4, -1, -0.4, 1], [-0.4, 0.6, 0.35, 0], [0.35, 0, -0.4, -0.6]],
    [[-0.4, -1, -0.4, 1], [-0.4, 1, 0.4, 0.4], [0.4, 0.4, 0.4, -1]]
  ];
  // A thor hammer: a squat steel block with capped ends, runes glowing orange on both broad faces
  // and a lit frame on each striking face, over a short leather-wrapped haft with a wrist loop.
  const hammerGeometry = (h, gold = false) => {
    const u = h / 16, pieces = [];
    const steel = gold ? "#c9a03c" : "#5d636b", cap = gold ? "#9c7a22" : "#3b4047";
    const leather = gold ? "#6a4a22" : "#5b3520", leatherDk = gold ? "#4a3214" : "#3f2415";
    const glow = gold ? "#ffc04a" : "#ff8c1a";
    const headY = 11.5 * u, faceZ = 2.5 * u, stroke = 0.45 * u, cell = 1.6 * u;
    pieces.push(
      tube({
        rings: 16, segments: 8,
        path: (t) => ({ x: 0, y: (-3 + t * 11.8) * u, z: 0 }),
        radius: (t) => (0.95 + 0.08 * Math.abs(Math.sin(t * Math.PI * 8))) * u,
        colorFn: (t) => Math.floor(t * 8) % 2 ? leatherDk : leather
      }),
      lathe({ profile: [[0, -4.3 * u], [1 * u, -4.1 * u], [1.35 * u, -3.6 * u], [1.2 * u, -3 * u], [0, -2.9 * u]], segments: 8, color: cap }),
      lathe({ profile: [[1.05 * u, 8.1 * u], [1.4 * u, 8.3 * u], [1.4 * u, 8.8 * u], [1.05 * u, 8.9 * u]], segments: 8, color: cap }),
      tube({
        rings: 14, segments: 5,
        path: (t) => ({ x: Math.sin(t * Math.PI * 2) * 1.7 * u, y: -6 * u + Math.cos(t * Math.PI * 2) * 1.7 * u, z: 0 }),
        radius: () => 0.22 * u,
        colorFn: () => leatherDk
      }),
      bevelBox({ w: 8.4 * u, h: 5.6 * u, d: 5 * u, color: steel, offset: { y: headY } }),
      bevelBox({ w: 1.6 * u, h: 6.4 * u, d: 5.8 * u, color: cap, offset: { x: -5 * u, y: headY } }),
      bevelBox({ w: 1.6 * u, h: 6.4 * u, d: 5.8 * u, color: cap, offset: { x: 5 * u, y: headY } })
    );
    // The same three runes read left to right from the front and from behind.
    for (const side of [1, -1]) {
      RUNES.forEach((rune, i) => {
        const cx = side * (i - 1) * 2.6 * u;
        for (const [x0, y0, x1, y1] of rune) {
          const dx = side * (x1 - x0), dy = y1 - y0, length = Math.hypot(dx, dy) * cell;
          pieces.push(moved(turnedZ(box({ w: stroke, h: length + stroke, d: 0.3 * u, color: glow, emissive: 1 }), Math.atan2(-dx, dy)),
            cx + side * (x0 + x1) / 2 * cell, headY + (y0 + y1) / 2 * cell, side * (faceZ + 0.05 * u)));
        }
      });
      // A lit square on each striking face with a diamond at its heart.
      const faceX = side * 5.85 * u;
      for (const [w, d, y, z] of [[3.6, 0.4, 1.6, 0], [3.6, 0.4, -1.6, 0], [0.4, 3.6, 0, 1.6], [0.4, 3.6, 0, -1.6]]) {
        pieces.push(box({ w: 0.3 * u, h: d * u, d: w * u, color: glow, emissive: 1, offset: { x: faceX, y: headY + y * u, z: z * u } }));
      }
      pieces.push(moved(turnedX(box({ w: 0.3 * u, h: 1.3 * u, d: 1.3 * u, color: glow, emissive: 1 }), Math.PI / 4), faceX, headY, 0));
    }
    return merge(...pieces);
  };
  BL.characters.add({
    handle: "BitcoinUbuntu",
    joined: 1791590400,
    lastCommit: 1790270916,
    // stoneAxe gives the hammer the axe's heavy two-handed swing in crew.js; the skin is the Bitcoin Ubuntu logo teal
    look: { stoneAxe: true, skin: "#5de0c5" },
    dress: {
      club: (k) => ({ default: hammerGeometry(k.h), gold: hammerGeometry(k.h, true), rest: { x: 0.24, z: 0 }, carry: { x: 0.95, z: 0 } })
    }
  });
})();
