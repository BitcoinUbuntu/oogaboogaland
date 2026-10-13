(() => {
  "use strict";
  const BL = window.BL;
  const { box, lathe, merge, moved, turnedY } = BL.models;
    // The Honey Badger: Bitcoin's mascot, and the Southern African animal that raids the bees' nests
  // and walks off cobra bites. He wears one as a hood: its head over his brow, its grizzled mantle
  // running from its forehead over his crown and down the back of his head.
  const PELT = "#161514", MANTLE = "#dcdad2", MANTLE_DK = "#9e9b94", LINING = "#4b4844", LINING_DK = "#34322f", EYE = "#e0962a", NOSE = "#4a4541", FANG = "#f4f2ea";
  // A beaded bracelet on the right wrist in the Bitcoin Ubuntu colours: orange and teal between bone.
  const BEADS = ["#f7931a", "#efe6d2", "#5de0c5", "#efe6d2"];
  // The bracelet's cells round the forearm, clockwise from the front left, one row above the fist.
  const BRACELET = [[-1, 3], [0, 3], [1, 3], [2, 3], [3, 3], [3, 2], [3, 1], [3, 0], [3, -1], [2, -1], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [-1, 2]];
  // A knobkerrie: a hardwood throwing club, a thin shaft swelling into a round knob, with a row of
  // bone and orange beads just under the knob.
  const knobkerrieGeometry = (h, gold = false) => {
    const u = h / 16;
    const wood = gold ? "#c9a03c" : "#4a2c18", knot = gold ? "#e0b84a" : "#5e3a20";
    const beads = [];
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * Math.PI * 2;
      beads.push(moved(turnedY(box({ w: 0.34 * u, h: 0.4 * u, d: 0.34 * u, color: BEADS[i % 2 ? 1 : 0] }), a),
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
      idle: [
        "Oogabuntu.",
        "Ubuntubuga.",
        "I am because we are.",
        "Honey badger don't care about your FUD.",
        "Not your keys, not your honey.",
        "Hard money. Thick skin.",
        "Run your own node. Dig your own burrow.",
        "Small badger. Big conviction.",
        "Low time preference. High honey preference."
      ]
    },
    dress: {
      // The pelt over the crown and down the back of the head, and the badger's own head over the brow:
      // black, with the mantle grizzled pale and grey from its forehead back, small honey eyes, a short
      // snout and two fangs hanging over the Ooga's forehead.
      crown(k, v) {
        const pelt = k.color(PELT), eye = k.color(EYE), nose = k.color(NOSE), fang = k.color(FANG);
        const white = k.color(MANTLE), grey = k.color(MANTLE_DK), mantle = () => k.rand() < 0.35 ? grey : white;
        const lining = k.color(LINING), liningDk = k.color(LINING_DK), mottle = () => k.rand() < 0.4 ? liningDk : lining;
        const stripe = (x) => x >= 1 && x <= 5 ? mantle() : pelt;
        // The crown's underside is a dark mottled lining, so looking into the hood shows no pale pelt;
        // only its back edge carries the mantle.
        for (let x = -1; x <= 7; x++) for (let z = -1; z <= 5; z++) v.set(x, 7, z, z < 0 ? stripe(x) : x < 0 || x > 6 ? pelt : mottle());
        for (let x = 0; x <= 6; x++) for (let z = 0; z <= 4; z++) v.set(x, 8, z, stripe(x));
        // The flap behind the head narrows toward the nape, the mantle tapering to a point with it.
        for (const [y, x0, x1] of [[1, 2, 4], [2, 1, 5], [3, 0, 6], [4, -1, 7], [5, -1, 7], [6, -1, 7]]) {
          for (let x = x0; x <= x1; x++) v.set(x, y, -1, (y > 2 ? x >= 2 && x <= 4 : x === 3) ? mantle() : pelt);
        }
        v.del(-1, 7, -1);
        v.del(7, 7, -1);
        // The back of the hood swells out behind the skull in one stepped layer, rounding the crown
        // into the nape so it sits off the head like a hat rather than lying flat like hair.
        for (let x = 1; x <= 5; x++) v.set(x, 8, -1, stripe(x));
        for (const [y, x0, x1] of [[7, 1, 5], [6, 0, 6], [5, 0, 6], [4, 0, 6], [3, 1, 5]]) {
          for (let x = x0; x <= x1; x++) v.set(x, y, -2, (y > 3 ? x >= 2 && x <= 4 : x === 3) ? mantle() : pelt);
        }
        // The badger's forelegs drape down each side over the ears, narrowing from the shoulder to a paw
        // with a pale claw, so the hood's side is a limb rather than a box.
        for (const x of [-1, 7]) {
          for (const [y, z0, z1] of [[6, 0, 3], [5, 1, 3], [4, 2, 3], [3, 2, 3], [2, 2, 3]]) v.fill(x, x, y, y, z0, z1, pelt);
          v.set(x, 1, 3, fang);
        }
        // The lining runs down the back of the hood only, hiding the flap's pale inside; the front stays open.
        v.fill(0, 6, 6, 6, 0, 0, mottle);
        v.fill(0, 6, 7, 9, 3, 7, pelt);
        v.fill(0, 6, 9, 9, 3, 7, mantle);
        v.fill(0, 6, 8, 8, 3, 5, mantle);
        v.set(1, 8, 7, eye);
        v.set(5, 8, 7, eye);
        // The honey eyes glow: bright by day, two embers under the hood at night.
        k.headEmissive = { [eye]: 1 };
        v.fill(2, 4, 7, 8, 8, 8, pelt);
        v.set(3, 8, 9, nose);
        v.set(2, 6, 8, fang);
        v.set(4, 6, 8, fang);
        v.set(0, 10, 4, mantle());
        v.set(6, 10, 4, mantle());
      },
      club: (k) => ({ default: knobkerrieGeometry(k.h), gold: knobkerrieGeometry(k.h, true) }),
      // The right arm again, as models.js builds it, with the bracelet round the wrist.
      gear(k) {
        const v = BL.models.makeVox(), beads = BEADS.map((hex) => k.color(hex));
        v.fill(0, 2, 2, 7, 0, 2, k.skinJ);
        v.fill(-1, 3, 8, 10, -1, 3, k.skinJ);
        v.fill(-1, 3, 0, 1, -1, 3, k.skinJ);
        BRACELET.forEach(([x, z], n) => v.set(x, 3, z, beads[n % beads.length]));
        k.parts.armR.geometry = k.vg(v, { x: -1.5 * k.u, y: -11 * k.u, z: -1.5 * k.u });
      }
    }
  });
})();
