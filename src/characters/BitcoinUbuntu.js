(() => {
  "use strict";
  const BL = window.BL;
  const { lathe, box, merge } = BL.models;
  // The Elder: a honey badger worn as a hood, its forelegs over his shoulders and its paws
  // meeting under a beaded bib, and a knobkerrie in hand. Palette from the Bitcoin Ubuntu logo.
  const colours = (k) => ({
    grey: k.color("#8e8a82"), greyLt: k.color("#a9a59b"), greyPale: k.color("#c3beb2"), bone: k.color("#e3dccb"),
    black: k.color("#1c1b1a"), nose: k.color("#45433f"), lining: k.color("#3b3a37"), liningDk: k.color("#2a2927"),
    teal: k.color("#5de0c5"), orange: k.color("#f7931a"), bead: k.color("#141414"), glint: k.color("#f7931a")
  });
  // A fixed speckle from the cell, so the mantle reads grizzled rather than flat.
  const speck = (x, y, z) => ((Math.imul(x + 17, 73856093) ^ Math.imul(y + 29, 19349663) ^ Math.imul(z + 13, 83492791)) >>> 0) % 9;
  const mantle = (C, x, y, z) => {
    const s = speck(x, y, z);
    return s < 3 ? C.grey : s < 6 ? C.greyLt : s < 8 ? C.greyPale : C.bone;
  };
  const lining = (C, x, y, z) => speck(x, y, z) % 3 ? C.lining : C.liningDk;
  // The bib's sixteen beads carry the genesis block's timestamp, two bits a bead, most
  // significant first, read row by row and left to right as you face him. Each bead's colour is its
  // two bits plus its place in the row order, so a run of equal digits never makes a run
  // of one colour; the cord round the back of his neck repeats that key in order.
  const GENESIS = 1231006505;
  const KEY = ["orange", "teal", "bone", "bead"];
  const BIB_ROWS = [[7, 2, 6], [6, 2, 6], [5, 3, 5], [4, 3, 5]];
  const bib = (v, C) => {
    let i = 0;
    for (const [y, x0, x1] of BIB_ROWS) for (let x = x0; x <= x1; x++, i++) {
      const digit = Math.floor(GENESIS / 4 ** (15 - i)) % 4;
      v.set(x, y, 5, C[KEY[(digit + i) % 4]]);
    }
    for (let x = 2; x <= 6; x++) v.set(x, 7, 0, C[KEY[(x - 2) % 4]]);
  };
  // A knobkerrie: a tapered shaft rising to a round knob, one ring of beads under it.
  const KERRIE = { wood: "#5e3c22", knob: "#7a4e2c", beads: ["#f7931a", "#161616", "#5de0c5", "#e8e0cc"] };
  const GOLD_KERRIE = { wood: "#c99a2e", knob: "#e0b53a", beads: ["#f0c95a", "#9c7a22", "#f0c95a", "#c99a2e"] };
  const kerries = new Map();
  const kerrieGeometry = (h, pal) => {
    const key = `${h}:${pal === KERRIE ? "wood" : "gold"}`;
    let geo = kerries.get(key);
    if (!geo) {
      const u = h / 16, knob = [];
      for (let i = 0; i <= 8; i++) {
        const a = -Math.PI / 2 + i / 8 * Math.PI;
        knob.push([Math.cos(a) * 1.7 * u, 10.6 * u + Math.sin(a) * 1.7 * u]);
      }
      const beads = [];
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2;
        beads.push(box({ w: 0.6 * u, h: 0.6 * u, d: 0.6 * u, color: pal.beads[i % 4], offset: { x: Math.cos(a) * 0.75 * u, y: 8 * u, z: Math.sin(a) * 0.75 * u } }));
      }
      geo = merge(
        lathe({ profile: [[0, -3 * u], [0.62 * u, -3 * u], [0.55 * u, 4 * u], [0.45 * u, 9.2 * u], [0, 9.2 * u]], segments: 8, color: pal.wood }),
        lathe({ profile: knob, segments: 10, color: pal.knob }),
        ...beads
      );
      kerries.set(key, geo);
    }
    return geo;
  };
  BL.characters.add({
    handle: "BitcoinUbuntu",
    joined: 1791876857,
    lastCommit: 1790270916,
    look: {
      bald: true, cleanShaven: true, face: "nose", hatY: 9, height: 1.06,
      portrait: { min: [-1, -2, -1], max: [7, 9, 8] },
      skin: "#d9a06b", hair: "#2a1d14"
    },
    voice: {
      poke: "Honey badger not care.",
      idle: [
        "Oogabuntu.",
        "Ubuntubuga.",
        "I am because we are.",
        "Beads remember when it started.",
        "Count the beads. Mind the order.",
        "Badger fears no fee.",
        "Same rules for every Ooga.",
        "Run node. Sleep well.",
        "Small blocks. Big teeth.",
        "Stack bananas. Then more."
      ]
    },
    dress: {
      // The badger's forelegs come over his shoulders and down his chest, its paws meeting
      // under the bib with an orange bead between them. They take the place of the fur strap.
      torso(k, v) {
        const C = colours(k), P = k.P;
        for (const [key, c] of [...v.map]) {
          if (c !== P.fur && c !== P.spot) continue;
          const [x, y] = key.split(",").map(Number);
          if (y >= 4) v.map.set(key, k.skinJ());
        }
        for (const x of [1, 7]) {
          v.fill(x, x, 7, 7, 1, 4, C.black);
          v.fill(x, x, 4, 7, 5, 5, C.black);
          v.fill(x, x, 5, 7, 0, 0, C.black);
        }
        v.fill(1, 3, 3, 3, 5, 5, C.black);
        v.fill(5, 7, 3, 3, 5, 5, C.black);
        for (const x of [3, 5]) v.fill(x, x, 2, 3, 6, 6, C.bone);
        v.set(4, 3, 5, C.orange);
        bib(v, C);
      },
      club: (k) => ({ default: kerrieGeometry(k.h, KERRIE), gold: kerrieGeometry(k.h, GOLD_KERRIE) }),
      // The hood: a grizzled mantle rounded over the crown and down to the nape, black at the
      // flanks, a dark mottled rim where the face opens, and the badger's head over his brow.
      crown(k, v) {
        const C = colours(k);
        const pelt = (x, y, z) => mantle(C, x, y, z);
        v.fill(-1, 7, 6, 7, -1, 5, (x, y, z) => y === 7 && (x === -1 || x === 7) && (z === -1 || z === 5) ? null : pelt(x, y, z));
        v.fill(0, 6, 8, 8, 0, 4, (x, y, z) => (x === 0 || x === 6) && (z === 0 || z === 4) ? null : pelt(x, y, z));
        for (const x of [-1, 7]) {
          v.fill(x, x, 1, 5, -1, 4, (_, y, z) => y === 1 && z === -1 ? null : z === 4 ? lining(C, x, y, z) : y <= 2 ? C.black : pelt(x, y, z));
        }
        v.fill(0, 6, 1, 5, -1, -1, (x, y, z) => y === 1 ? C.black : pelt(x, y, z));
        // The badger: under the grey cap a black face, wide at the eyes and narrowing to a
        // short snout that rests on his forehead, with small glinting eyes and stub ears.
        v.fill(0, 6, 7, 7, 5, 6, C.black);
        v.fill(1, 5, 6, 6, 5, 6, C.black);
        v.set(0, 6, 5, lining(C, 0, 6, 5));
        v.set(6, 6, 5, lining(C, 6, 6, 5));
        v.fill(2, 4, 5, 5, 6, 7, C.black);
        v.set(3, 5, 7, C.nose);
        v.fill(1, 5, 8, 8, 5, 6, pelt);
        v.set(1, 7, 6, C.glint);
        v.set(5, 7, 6, C.glint);
        v.set(0, 8, 5, C.black);
        v.set(6, 8, 5, C.black);
        k.headEmissive = { [C.glint]: 0.6 };
      }
    }
  });
})();
