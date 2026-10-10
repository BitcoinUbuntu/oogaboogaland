(() => {
  "use strict";
  const BL = window.BL;
  const { geometry, pushVert, face, box, bevelBox, lathe, tube, merge } = BL.models;
  const { hexToRgb } = BL.math;
  // The Bitcoin Ubuntu logo: teal ground, black, white and bitcoin orange.
  const TEAL = "#5de0c5", HAIR = "#151515", HIDE = "#1c1c1c", SPOT = "#f7931a", BELT = "#ffffff";
  // A lightning bolt as two convex pieces in a cell one wide and two tall: the upper band and the lower point.
  // The head lays it on its side, the point toward the +x striking face.
  const BOLT = [
    [[-0.1, 1], [0.38, 1], [0.1, 0.12], [-0.38, 0]],
    [[-0.12, 0.14], [0.42, 0.14], [-0.3, -1]]
  ];
  // A flat convex piece pushed out to `depth` around z = zc, every face wound outward.
  const prism = (points, zc, depth, color) => {
    const geo = geometry(), rgb = hexToRgb(color), opts = { emissive: 1 };
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const [x0, y0] = points[i], [x1, y1] = points[(i + 1) % points.length];
      area += x0 * y1 - x1 * y0;
    }
    const ring = area > 0 ? points : [...points].reverse();
    const front = ring.map(([x, y]) => pushVert(geo, x, y, zc + depth / 2));
    const back = ring.map(([x, y]) => pushVert(geo, x, y, zc - depth / 2));
    face(geo, front, rgb, opts);
    face(geo, [...back].reverse(), rgb, opts);
    for (let i = 0; i < ring.length; i++) {
      const j = (i + 1) % ring.length;
      face(geo, [front[i], back[i], back[j], front[j]], rgb, opts);
    }
    return geo;
  };
  // A thor hammer: a squat steel block with capped ends, a lightning bolt glowing orange on both broad
  // faces and a lit frame on each striking face, over a short leather-wrapped haft.
  const hammerGeometry = (h, gold = false) => {
    const u = h / 16, pieces = [];
    const steel = gold ? "#c9a03c" : "#5d636b", cap = gold ? "#9c7a22" : "#3b4047";
    const leather = gold ? "#6a4a22" : "#5b3520", leatherDk = gold ? "#4a3214" : "#3f2415";
    const glow = gold ? "#ff9a1f" : "#ff6a00";
    const headY = 9.6 * u, faceZ = 1.9 * u, cell = 2.2 * u;
    pieces.push(
      tube({
        rings: 14, segments: 8,
        path: (t) => ({ x: 0, y: (-3 + t * 10.6) * u, z: 0 }),
        radius: (t) => (0.85 + 0.07 * Math.abs(Math.sin(t * Math.PI * 7))) * u,
        colorFn: (t) => Math.floor(t * 7) % 2 ? leatherDk : leather
      }),
      lathe({ profile: [[0, -4 * u], [0.9 * u, -3.85 * u], [1.2 * u, -3.4 * u], [1.05 * u, -2.9 * u], [0, -2.8 * u]], segments: 8, color: cap }),
      lathe({ profile: [[0.95 * u, 6.9 * u], [1.25 * u, 7.05 * u], [1.25 * u, 7.45 * u], [0.95 * u, 7.55 * u]], segments: 8, color: cap }),
      bevelBox({ w: 6 * u, h: 4.2 * u, d: 3.8 * u, color: steel, offset: { y: headY } }),
      bevelBox({ w: 1.2 * u, h: 4.8 * u, d: 4.4 * u, color: cap, offset: { x: -3.6 * u, y: headY } }),
      bevelBox({ w: 1.2 * u, h: 4.8 * u, d: 4.4 * u, color: cap, offset: { x: 3.6 * u, y: headY } })
    );
    // On both broad faces the bolt points at the same striking face.
    for (const side of [1, -1]) {
      for (const piece of BOLT) {
        pieces.push(prism(piece.map(([x, y]) => [-y * cell, headY + x * cell]), side * (faceZ + 0.05 * u), 0.3 * u, glow));
      }
      // A lit square on each striking face.
      const faceX = side * 4.25 * u;
      for (const [w, d, y, z] of [[2.6, 0.35, 1.1, 0], [2.6, 0.35, -1.1, 0], [0.35, 2.6, 0, 1.1], [0.35, 2.6, 0, -1.1]]) {
        pieces.push(box({ w: 0.3 * u, h: d * u, d: w * u, color: glow, emissive: 1, offset: { x: faceX, y: headY + y * u, z: z * u } }));
      }
    }
    return merge(...pieces);
  };
  BL.characters.add({
    handle: "BitcoinUbuntu",
    joined: 1791590400,
    lastCommit: 1790270916,
    look: { skin: TEAL, hair: HAIR, fur: HIDE },
    dress: {
      // The hide's spots, strap and loincloth flaps in the logo's orange instead of brown, on a white belt.
      torso(k, v) {
        const spot = k.color(SPOT), belt = k.color(BELT);
        for (let x = 0; x <= 8; x++) for (let y = 0; y <= 7; y++) for (let z = 0; z <= 5; z++) {
          const c = v.get(x, y, z);
          if (c === k.P.spot) v.set(x, y, z, spot);
          else if (c === k.P.wood && y === 3) v.set(x, y, z, belt);
        }
        k.loin = [k.P.fur, spot];
      },
      // Held like the club, by the handle below the head.
      club: (k) => ({ default: hammerGeometry(k.h), gold: hammerGeometry(k.h, true) })
    }
  });
})();
