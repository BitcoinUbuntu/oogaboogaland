(() => {
  "use strict";
  const BL = window.BL;
  const { box, lathe, tube, merge, moved, turnedY } = BL.models;
  const { createNode, addChild } = BL.scene;
  // A headdress of ostrich plumes over a beaded band, a beaded collar that spells its words, and a knobkerrie.
  // The collar spells its words in ASCII beadwork, two bits a bead (charcoal, bone, clay, orange),
  // high bits first, each word centred at the front and read left to right.
  const BEADS = ["#1d1b19", "#efe6d2", "#b5532a", "#f7931a"];
  // Outer to inner: the word, its repeats, half-width, half-depth, height at the back and drop to
  // the front, in sixteenths of height. Each row lies on the shoulders and slopes down the chest.
  const ROWS = [["UBUNTU", 2, 4.6, 3.4, 7.15, 1.6], ["BITCOIN", 1, 3.7, 2.7, 7.7, 0.9]];
  const collarGeometry = (h) => {
    const u = h / 16, pieces = [];
    for (const [word, repeats, rx, rz, y, drop] of ROWS) {
      const count = word.length * 4 * repeats, front = word.length * 2 - 0.5;
      for (let i = 0; i < count; i++) {
        const code = word.charCodeAt((i >> 2) % word.length), bead = code >> (6 - (i & 3) * 2) & 3;
        const a = (i - front) / count * Math.PI * 2;
        pieces.push(moved(turnedY(box({ w: 0.5 * u, h: 0.5 * u, d: 0.5 * u, color: BEADS[bead] }), a),
          Math.sin(a) * rx * u, (y - drop * (1 + Math.cos(a)) / 2) * u, Math.cos(a) * rz * u));
      }
    }
    return merge(...pieces);
  };
  // A knobkerrie: a hardwood throwing club, a thin shaft swelling into a round knob,
  // with a band of the collar's beads where the hand stops.
  const knobkerrieGeometry = (h, gold = false) => {
    const u = h / 16;
    const wood = gold ? "#c9a03c" : "#4a2c18", knot = gold ? "#e0b84a" : "#5e3a20";
    const beads = [];
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2;
      beads.push(moved(turnedY(box({ w: 0.36 * u, h: 0.4 * u, d: 0.36 * u, color: BEADS[i % 2 ? 1 : 3] }), a), Math.sin(a) * 0.62 * u, 5 * u, Math.cos(a) * 0.62 * u));
    }
    return merge(
      lathe({ profile: [[0, -1.6 * u], [0.5 * u, -1.5 * u], [0.55 * u, 2 * u], [0.48 * u, 8.7 * u]], segments: 8, color: wood }),
      lathe({ profile: [[0.48 * u, 8.6 * u], [1.1 * u, 8.95 * u], [1.65 * u, 9.75 * u], [1.8 * u, 10.6 * u], [1.6 * u, 11.5 * u], [1 * u, 12.2 * u], [0, 12.4 * u]], segments: 8, color: knot }),
      ...beads
    );
  };
  // Five ostrich plumes fanned from the crown and swept back: black at the middle and the edges, white
  // between, each a thin quill swelling into a soft plume. Built in the head's own space.
  const plumesGeometry = (h) => {
    const u = h / 16, plumes = [];
    for (let j = -2; j <= 2; j++) {
      const fan = j * 0.34, length = (8.5 - Math.abs(j) * 1.1) * u, color = j % 2 ? "#f2efe6" : "#1a1918";
      plumes.push(tube({
        rings: 10, segments: 6, colorFn: () => color,
        radius: (t) => (0.18 + 0.85 * Math.pow(Math.sin(Math.PI * t), 0.7)) * u,
        path: (t) => {
          const s = t * length;
          return { x: Math.sin(fan) * (s + 0.3 * s * s / length), y: 6.6 * u + Math.cos(fan) * 0.94 * s - 0.2 * s * s / length, z: -1.2 * u - 0.34 * s };
        }
      }));
    }
    return merge(...plumes);
  };
  BL.characters.add({
    handle: "BitcoinUbuntu",
    joined: 1791590400,
    lastCommit: 1790270916,
    // A bald, clean-shaven Ooga, sun-browned, with dark brows under the band
    look: { portrait: { min: [-1, -2, -1], max: [7, 7, 8] }, skin: "#d9a06b", hair: "#3b2a1e", bald: true, cleanShaven: true, hatY: 9 },
    voice: {
      poke: "Sit by the fire, friend.",
      idle: ["I am because we are.", "Every bead spells a word. Read closer.", "Stack sats. Share the fire.", "One tribe, one chain.", "Ooga ubuntu."]
    },
    dress: {
      // A beaded band round the brow, two rows deep, with an orange boss at the front and a short
      // fringe of beads hanging past each ear.
      crown(k, v) {
        const beads = BEADS.map((hex) => k.color(hex));
        const lower = [beads[3], beads[1], beads[2], beads[1]];
        const ring = [];
        for (let x = 0; x <= 6; x++) ring.push([x, 6]);
        for (let z = 5; z >= 0; z--) ring.push([7, z]);
        for (let x = 6; x >= 0; x--) ring.push([x, -1]);
        for (let z = 0; z <= 5; z++) ring.push([-1, z]);
        ring.forEach(([x, z], i) => {
          v.set(x, 5, z, lower[i % 4]);
          v.set(x, 6, z, i % 2 ? beads[1] : beads[0]);
        });
        v.fill(2, 4, 5, 6, 6, 6, beads[3]);
        v.set(3, 6, 7, beads[3]);
        for (const x of [-1, 7]) for (let y = 1; y <= 4; y++) v.set(x, y, 4, y % 2 ? beads[3] : beads[1]);
      },
      headgear(k) {
        addChild(k.parts.head, createNode({ geometry: plumesGeometry(k.h) }));
      },
      club: (k) => ({ default: knobkerrieGeometry(k.h), gold: knobkerrieGeometry(k.h, true) }),
      extras(k) {
        addChild(k.parts.torso, createNode({ geometry: collarGeometry(k.h) }));
      }
    }
  });
})();
