(() => {
  "use strict";
  const BL = window.BL;
  const { box, lathe, merge, moved, turnedY } = BL.models;
  const { createNode, addChild } = BL.scene;
  // The Lion: he wears a lion's head over his brow, its dark mane framing his face from crown to chin.
  const TAWNY = "#c99446", MANE = "#6e3f18", MANE_DK = "#4e2b10", MUZZLE = "#ecd7ad", NOSE = "#3a2620", EYE = "#24160c";
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
    // A bald, clean-shaven Ooga, sun-browned, with dark brows under the lion's head
    look: { portrait: { min: [-2, -2, -1], max: [8, 11, 9] }, skin: "#d9a06b", hair: "#3b2a1e", bald: true, cleanShaven: true, hatY: 10 },
    voice: {
      poke: "The lion does not lose sleep over the sheep.",
      idle: ["I am because we are.", "Stack sats. Guard the pride.", "One pride, one chain.", "Roar softly. Carry a big knobkerrie.", "Ooga ubuntu."]
    },
    dress: {
      // A mane round the whole head, two cells deep at the sides, over the crown and in a ruff under
      // the chin; the lion's head sits over the brow, tawny, with dark eyes, a pale muzzle and round ears.
      crown(k, v) {
        const mane = k.jit(k.color(MANE), k.color(MANE_DK), 0.3), tawny = k.color(TAWNY), muzzle = k.color(MUZZLE), nose = k.color(NOSE), eye = k.color(EYE);
        v.fill(-2, 8, 0, 8, -1, -1, mane);
        for (const x of [-2, -1, 7, 8]) v.fill(x, x, 0, 8, -1, 5, mane);
        for (const x of [-2, 8]) v.fill(x, x, 0, 7, 6, 6, mane);
        v.fill(-2, 8, 7, 9, -1, 4, mane);
        v.fill(-1, 7, -1, -1, 3, 6, mane);
        v.fill(0, 6, -2, -2, 4, 5, mane);
        for (const [x, z] of [[-2, -1], [8, -1], [-2, 4], [8, 4]]) v.del(x, 9, z);
        v.fill(1, 5, 6, 9, 4, 7, tawny);
        v.set(2, 8, 7, eye);
        v.set(4, 8, 7, eye);
        v.fill(2, 4, 6, 7, 8, 8, muzzle);
        v.set(3, 7, 9, nose);
        v.set(1, 10, 4, tawny);
        v.set(5, 10, 4, tawny);
      },
      club: (k) => ({ default: knobkerrieGeometry(k.h), gold: knobkerrieGeometry(k.h, true) }),
      extras(k) {
        addChild(k.parts.torso, createNode({ geometry: collarGeometry(k.h) }));
      }
    }
  });
})();
