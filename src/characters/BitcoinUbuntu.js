(() => {
  "use strict";
  const BL = window.BL;
  const { box, lathe, merge, moved, turnedY } = BL.models;
  const { createNode, addChild } = BL.scene;
  // The Honey Badger: Bitcoin's mascot, and the Southern African animal that raids the bees' nests
  // and walks off cobra bites. He wears one as a hood: its head over his brow, its grizzled mantle
  // running from its forehead over his crown and down the back of his head.
  const PELT = "#161514", MANTLE = "#dcdad2", MANTLE_DK = "#9e9b94", EYE = "#f4f2ea", NOSE = "#4a4541", FANG = "#f4f2ea";
  // The collar is the genesis block's hash in beadwork without its ten leading zeros, two beads to a
  // hex digit, two bits a bead in the Bitcoin Ubuntu colours (charcoal, bone, teal, orange), high bits
  // first: 54 digits, 108 beads, starting at the front of the outer row and read left to right, then
  // the middle row, then the inner.
  const GENESIS = "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f".replace(/^0+/, "");
  const BEADS = ["#1d1b19", "#efe6d2", "#5de0c5", "#f7931a"];
  // Outer to inner: bead count, half-width, half-depth, height at the back and drop to the front,
  // in sixteenths of height. Each row lies on the shoulders and slopes down the chest.
  const RINGS = [[42, 4.7, 3.4, 7.15, 1.6], [36, 4.1, 3, 7.5, 1.1], [30, 3.5, 2.6, 7.85, 0.6]];
  const collarGeometry = (h) => {
    const u = h / 16, pieces = [];
    let n = 0;
    for (const [count, rx, rz, y, drop] of RINGS) {
      for (let i = 0; i < count; i++, n++) {
        const digit = parseInt(GENESIS[n >> 1], 16), bead = n & 1 ? digit & 3 : digit >> 2;
        const a = (i - 4) / count * Math.PI * 2;
        pieces.push(moved(turnedY(box({ w: 0.54 * u, h: 0.54 * u, d: 0.54 * u, color: BEADS[bead] }), a),
          Math.sin(a) * rx * u, (y - drop * (1 + Math.cos(a)) / 2) * u, Math.cos(a) * rz * u));
      }
    }
    return merge(...pieces);
  };
  // A knobkerrie: a hardwood throwing club, a thin shaft swelling into a round knob, with a row of
  // the collar's bone and orange beads just under the knob.
  const knobkerrieGeometry = (h, gold = false) => {
    const u = h / 16;
    const wood = gold ? "#c9a03c" : "#4a2c18", knot = gold ? "#e0b84a" : "#5e3a20";
    const beads = [];
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * Math.PI * 2;
      beads.push(moved(turnedY(box({ w: 0.34 * u, h: 0.4 * u, d: 0.34 * u, color: BEADS[i % 2 ? 1 : 3] }), a),
        Math.sin(a) * 0.62 * u, 7.8 * u, Math.cos(a) * 0.62 * u));
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
      // black, with the mantle grizzled pale and grey from its forehead back, small white eyes, a short snout and two
      // fangs hanging over the Ooga's forehead.
      crown(k, v) {
        const pelt = k.color(PELT), white = k.color(MANTLE), grey = k.color(MANTLE_DK), mantle = () => k.rand() < 0.35 ? grey : white, eye = k.color(EYE), nose = k.color(NOSE), fang = k.color(FANG);
        const stripe = (x) => x >= 1 && x <= 5 ? mantle() : pelt;
        for (let x = -1; x <= 7; x++) for (let z = -1; z <= 5; z++) v.set(x, 7, z, stripe(x));
        for (let x = 0; x <= 6; x++) for (let z = 0; z <= 4; z++) v.set(x, 8, z, stripe(x));
        // The flap behind the head narrows toward the nape, the mantle tapering to a point with it.
        for (const [y, x0, x1] of [[1, 2, 4], [2, 1, 5], [3, 0, 6], [4, -1, 7], [5, -1, 7], [6, -1, 7]]) {
          for (let x = x0; x <= x1; x++) v.set(x, y, -1, (y > 1 ? x >= 2 && x <= 4 : x === 3) ? mantle() : pelt);
        }
        v.del(-1, 7, -1);
        v.del(7, 7, -1);
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
        v.set(0, 10, 5, mantle());
        v.set(6, 10, 5, mantle());
      },
      club: (k) => ({ default: knobkerrieGeometry(k.h), gold: knobkerrieGeometry(k.h, true) }),
      extras(k) {
        addChild(k.parts.torso, createNode({ geometry: collarGeometry(k.h) }));
      }
    }
  });
})();
