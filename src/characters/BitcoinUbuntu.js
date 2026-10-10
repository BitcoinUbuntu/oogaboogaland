(() => {
  "use strict";
  const BL = window.BL;
  const { box, lathe, merge, moved, turnedY } = BL.models;
  const { createNode, addChild } = BL.scene;
  // The Chainkeeper: an elder who wears the genesis block. His collar is the block's hash in beadwork,
  // two beads to a hex digit (two bits a bead: charcoal, bone, clay, orange), so its ten leading
  // zeros run as an arc of 21 dark beads across the front of the outer ring: the first proof of
  // work, threaded by hand.
  const GENESIS = "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f";
  const BEADS = ["#1d1b19", "#efe6d2", "#b5532a", "#f7931a"];
  // Outer to inner, in hash order: bead count, half-width, half-depth, height at the back and drop to
  // the front, in sixteenths of height. Each ring lies on the shoulders and slopes down the chest.
  const RINGS = [[48, 4.7, 3.4, 7.15, 1.6], [44, 4.1, 3, 7.5, 1.1], [36, 3.5, 2.6, 7.85, 0.6]];
  const collarGeometry = (h) => {
    const u = h / 16, pieces = [];
    let n = 0;
    for (const [count, rx, rz, y, drop] of RINGS) {
      for (let i = 0; i < count; i++, n++) {
        const digit = parseInt(GENESIS[n >> 1], 16), bead = n & 1 ? digit & 3 : digit >> 2;
        const a = (i - 10) / count * Math.PI * 2;
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
    // A bald, clean-shaven elder, sun-browned, with dark brows
    look: { skin: "#d9a06b", hair: "#3b2a1e", bald: true, cleanShaven: true },
    voice: {
      poke: "Sit. I will tell you about block zero.",
      idle: ["I am because we are.", "Every bead a block. I remember them all.", "Ten zeros. Satoshi only needed eight.", "The chain is long. The story is longer.", "Ooga ubuntu."]
    },
    dress: {
      club: (k) => ({ default: knobkerrieGeometry(k.h), gold: knobkerrieGeometry(k.h, true) }),
      extras(k) {
        addChild(k.parts.torso, createNode({ geometry: collarGeometry(k.h) }));
      }
    }
  });
})();
