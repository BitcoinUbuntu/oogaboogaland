(() => {
  "use strict";
  const BL = window.BL;
  const { box, lathe, merge, moved, turnedY } = BL.models;
  const { createNode, addChild } = BL.scene;
  // The Honey Badger: Bitcoin's mascot, and the Southern African animal that raids the bees' nests
  // and walks off cobra bites. He wears one as a hood: its head over his brow, its silver mantle
  // running from the crown down a cape to a stub of tail.
  const PELT = "#161514", MANTLE = "#dcdad2", EYE = "#f4f2ea", NOSE = "#4a4541", FANG = "#f4f2ea";
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
  BL.characters.add({
    handle: "BitcoinUbuntu",
    joined: 1791590400,
    lastCommit: 1790270916,
    // A bald, clean-shaven Ooga, sun-browned, with dark brows under the hood
    look: { portrait: { min: [-1, -2, -1], max: [7, 11, 10] }, skin: "#d9a06b", hair: "#3b2a1e", bald: true, cleanShaven: true, hatY: 10 },
    voice: {
      poke: "Honey badger don't care.",
      idle: ["I am because we are.", "Bitten by a cobra once. Still stacking.", "Stack sats. Ignore the bees.", "Honey badger don't care about your FUD.", "Ooga ubuntu."]
    },
    dress: {
      // The pelt over the crown and down the back of the head, and the badger's own head over the brow:
      // black, with the silver mantle from its forehead back, small white eyes, a short snout and two
      // fangs hanging over the Ooga's forehead.
      crown(k, v) {
        const pelt = k.color(PELT), mantle = k.color(MANTLE), eye = k.color(EYE), nose = k.color(NOSE), fang = k.color(FANG);
        const stripe = (x) => x >= 1 && x <= 5 ? mantle : pelt;
        for (let x = -1; x <= 7; x++) for (let z = -1; z <= 5; z++) v.set(x, 7, z, stripe(x));
        for (let x = 0; x <= 6; x++) for (let z = 0; z <= 4; z++) v.set(x, 8, z, stripe(x));
        for (let x = -1; x <= 7; x++) for (let y = 1; y <= 6; y++) v.set(x, y, -1, x >= 2 && x <= 4 ? mantle : pelt);
        for (const x of [-1, 7]) for (let y = 4; y <= 6; y++) for (let z = 0; z <= 3; z++) v.set(x, y, z, pelt);
        v.fill(0, 6, 7, 9, 4, 8, pelt);
        v.fill(0, 6, 9, 9, 4, 8, mantle);
        v.fill(0, 6, 8, 8, 4, 6, mantle);
        v.set(1, 8, 8, eye);
        v.set(5, 8, 8, eye);
        v.fill(2, 4, 7, 8, 9, 9, pelt);
        v.set(3, 8, 10, nose);
        v.set(2, 6, 9, fang);
        v.set(4, 6, 9, fang);
        v.set(0, 10, 5, mantle);
        v.set(6, 10, 5, mantle);
      },
      // The pelt hangs down the back as a cape, silver down the middle, ending in a stub of black tail.
      torso(k, v) {
        const pelt = k.color(PELT), mantle = k.color(MANTLE);
        for (let x = 2; x <= 6; x++) {
          const c = x >= 3 && x <= 5 ? mantle : pelt;
          for (let y = 3; y <= 7; y++) v.set(x, y, 0, c);
          for (let y = -2; y <= 7; y++) v.set(x, y, -1, c);
        }
        v.set(4, -3, -1, pelt);
        v.set(4, -4, -2, pelt);
      },
      club: (k) => ({ default: knobkerrieGeometry(k.h), gold: knobkerrieGeometry(k.h, true) }),
      extras(k) {
        addChild(k.parts.torso, createNode({ geometry: collarGeometry(k.h) }));
      }
    }
  });
})();
