(() => {
  "use strict";
  const BL = window.BL;
  const { lathe, merge, moved, makeVox } = BL.models;
  const { createNode, addChild } = BL.scene;
  const { hexToRgb } = BL.math;
  // The Diviner: rope dreads to the waist, strung with bone, ochre and teal beads; pale
  // half-lidded eyes; a dusk-dyed mantle; a crook staff with knucklebones on a cord.
  // The teal stones strung through his hair hold a little light, so at dusk he carries a
  // scatter of small lights with him.
  const colours = (k) => ({
    deep: k.color("#3a2a1c"), deepLt: k.color("#4f3a26"), rope: k.color("#6b4e31"), light: k.color("#86683f"),
    tip: k.color("#a3845a"), band: k.color("#3f2d1e"),
    mantle: k.color("#363c52"), mantleDk: k.color("#282d3e"), stitch: k.color("#d6ccb2"),
    hide: k.color("#5e4833"), hideDk: k.color("#45352a"), sash: k.color("#9c4a26"), sashDk: k.color("#7a3a1e"),
    bone: k.color("#e4d9bf"), teal: k.color("#4b8a82"), ochre: k.color("#b5612e"),
    eye: k.color("#c6d6cf"), pupil: k.color("#2a3a3c")
  });
  // A rope's colour by height on the head's grid: lighter toward the sun-bleached ends, with
  // a darker matted band every few cells so each one reads as twisted.
  const ropeAt = (C, x, y, z, inner) => (y + 2 * x + z + 40) % 4 === 0 ? C.band : inner ? y > -4 ? C.rope : C.light : y > 3 ? C.rope : y > -4 ? C.light : C.tip;
  // The mass under the ropes is striped by column, so the cap and sides read as rows of
  // ropes running back from the parting and down the sides.
  const massAt = (C, x, y, z) => ((x === -1 || x === 7 ? z : x) + 20) % 2 ? C.deep : C.deepLt;
  // A rope of hair [x, z, top, tip, beads, inner] down one column; [y, kind] beads take the
  // place of hair, and an inner rope, hanging behind the others, stays a shade darker.
  const lay = (v, C, ropes, beads) => {
    for (const [x, z, top, tip, marks, inner] of ropes) {
      for (let y = top; y >= tip; y--) {
        const mark = marks.find((m) => m[0] === y);
        if (mark) beads.push([x, y, z, mark[1]]);
        else v.set(x, y, z, ropeAt(C, x, y, z, inner));
      }
    }
  };
  // On the head: outer ropes widen it past the cheeks, two framing the face hang to the
  // collarbone, and the back ones carry on down into the curtain below.
  const HEAD_ROPES = [
    [-1, 6, 5, -2, [[1, "bone"], [-2, "teal"]]], [7, 6, 5, -1, [[2, "ochre"], [-1, "teal"]]],
    [-2, -1, 7, -1, [[-1, "bone"]]], [-2, 1, 8, 0, [[3, "teal"], [0, "ochre"]]], [-2, 3, 7, 1, [[1, "bone"]]],
    [8, -1, 7, 0, [[0, "ochre"]]], [8, 1, 8, -1, [[4, "bone"], [-1, "bone"]]], [8, 3, 7, 2, [[2, "teal"]]],
    [-1, -2, 8, 0, []], [1, -2, 9, 0, []], [3, -2, 9, 0, []], [5, -2, 9, 0, []], [7, -2, 8, 0, []],
    [0, -2, 8, 3, [[3, "bone"]]], [2, -2, 8, 4, [[4, "ochre"]]], [4, -2, 8, 3, [[3, "teal"]]], [6, -2, 8, 4, [[4, "bone"]]]
  ];
  // The curtain down his back, on the same grid, so each rope continues one from the head.
  const BACK_ROPES = [
    [-1, -2, -1, -6, [[-3, "ochre"], [-6, "bone"]]], [1, -2, -1, -8, [[-4, "bone"], [-8, "teal"]]],
    [3, -2, -1, -7, [[-2, "teal"], [-7, "bone"]]], [5, -2, -1, -8, [[-5, "ochre"], [-8, "bone"]]],
    [7, -2, -1, -5, [[-2, "bone"], [-5, "teal"]]],
    [0, -1, -1, -4, [[-4, "bone"]], true], [2, -1, -1, -5, [[-5, "ochre"]], true], [4, -1, -1, -4, [[-4, "bone"]], true], [6, -1, -1, -5, [[-5, "teal"]], true]
  ];
  const BEAD = { bone: "#e4d9bf", ochre: "#b5612e", teal: "#5aa196" };
  // Round beads threaded on the square ropes: each bulges past its rope on every side.
  const beadGeometry = (beads, u, origin) => merge(...beads.map(([x, y, z, kind]) => moved(lathe({
    profile: [[0, -0.5 * u], [0.62 * u, -0.5 * u], [0.86 * u, -0.22 * u], [0.86 * u, 0.22 * u], [0.62 * u, 0.5 * u], [0, 0.5 * u]],
    segments: 8, color: BEAD[kind], emissive: kind === "teal" ? 0.45 : 0
  }), origin.x + (x + 0.5) * u, origin.y + (y + 0.5) * u, origin.z + (z + 0.5) * u)));
  let headBeads = [];
  // A crook of sun-bleached driftwood, as long as the island's other staffs, gnarled at three knots, its hook curling out from the body
  // with three knucklebones and a teal bead swinging on a cord.
  const STAFF = { wood: 0, woodDk: 1, cord: 2, bone: 3, teal: 4 };
  const STAFF_PALETTE = ["#b3a68d", "#8a7d66", "#3a2a1c", "#e4d9bf", "#4b8a82"].map(hexToRgb);
  const GOLD_STAFF_PALETTE = ["#e0b53a", "#c99a2e", "#9c7a22", "#f0c95a", "#c99a2e"].map(hexToRgb);
  const staffVoxels = () => {
    const v = makeVox(), S = STAFF;
    for (let y = -3; y <= 18; y++) v.set(0, y, 0, (y * 7) % 5 === 0 ? S.woodDk : S.wood);
    for (const [x, y, z] of [[1, 4, 0], [-1, 9, 0], [0, 13, 1]]) v.set(x, y, z, S.woodDk);
    for (const [x, y] of [[0, 19], [-1, 20], [-2, 20], [-3, 19], [-4, 18], [-4, 17], [-3, 16]]) v.set(x, y, 0, S.wood);
    v.set(-3, 15, 0, S.cord);
    v.set(-3, 14, 0, S.cord);
    v.set(-3, 13, 0, S.bone);
    v.set(-4, 12, 0, S.bone);
    v.set(-2, 12, 0, S.bone);
    v.set(-3, 11, 0, S.teal);
    return v;
  };
  BL.characters.add({
    handle: "BitcoinUbuntu",
    joined: 1791876857,
    lastCommit: 1790270916,
    look: {
      build: "slim", height: 1.12, hairless: true, noBrow: true, noPupils: true, face: "nose", hatY: 14,
      portrait: { min: [-2, -3, -2], max: [8, 9, 8] },
      skin: "#d9a06b", hair: "#35271b", fur: "#5e4833"
    },
    voice: {
      poke: "Ooga knew you would poke.",
      idle: [
        "Next block soon. Ooga feel it.",
        "Bones say: hold.",
        "The pile remembers.",
        "Ooga dreamt this day.",
        "Quiet. The chain is talking.",
        "Not every banana is for eating.",
        "Moon not care about price.",
        "You will see. Then you will know."
      ]
    },
    dress: {
      // Bare chest under a dusk mantle: it drapes past the shoulders, opens down the front
      // with bone stitching on its edges, over an ochre sash and a hide wrap. A cord of
      // bone and one teal stone lies on the chest.
      torso(k, v) {
        const C = colours(k);
        for (const [key] of [...v.map]) {
          const [x, y, z] = key.split(",").map(Number);
          v.map.set(key, y <= 1 ? (x + z) % 3 ? C.hide : C.hideDk : y === 2 ? x % 2 ? C.sash : C.sashDk
            : y >= 6 || x <= 2 || x >= 6 || z === 1 ? C.mantle : k.skinJ());
        }
        v.fill(0, 0, 5, 7, 1, 4, C.mantle);
        v.fill(8, 8, 5, 7, 1, 4, C.mantle);
        v.fill(1, 2, 3, 7, 5, 5, C.mantle);
        v.fill(6, 7, 3, 7, 5, 5, C.mantle);
        for (const y of [3, 5, 7]) {
          v.set(2, y, 5, C.stitch);
          v.set(6, y, 5, C.stitch);
        }
        for (const x of [0, 8]) v.fill(x, x, 5, 5, 1, 4, C.mantleDk);
        v.set(3, 6, 5, C.bone);
        v.set(4, 5, 5, C.bone);
        v.set(5, 6, 5, C.bone);
        v.set(4, 4, 5, C.teal);
        k.loin = [C.hide, C.hideDk];
      },
      club: () => ({ voxels: staffVoxels(), palette: STAFF_PALETTE, goldPalette: GOLD_STAFF_PALETTE, rest: { x: 0.12, z: 0.24 }, carry: { x: 0.95, z: 0 } }),
      // Lean bare forearms with a beaded cuff at each wrist, the mantle over the shoulders.
      gear(k) {
        const C = colours(k), v = makeVox();
        v.fill(0, 2, 2, 7, 0, 2, k.skinJ);
        v.fill(0, 2, 8, 10, 0, 2, C.mantle);
        v.fill(-1, 3, 9, 10, -1, 3, (x, y, z) => (x === -1 || x === 3) && (z === -1 || z === 3) ? null : y === 9 ? C.mantleDk : C.mantle);
        v.fill(-1, 3, 0, 1, -1, 3, k.skinJ);
        const cuff = [C.bone, C.teal, C.bone, C.ochre];
        let i = 0;
        for (let x = -1; x <= 3; x++) for (let z = -1; z <= 3; z++) {
          if ((x === -1 || x === 3) !== (z === -1 || z === 3)) v.set(x, 2, z, cuff[i++ % 4]);
        }
        k.parts.armL.geometry = k.parts.armR.geometry = k.vg(v, { x: -1.5 * k.u, y: -11 * k.u, z: -1.5 * k.u });
      },
      // Rope dreads swept back from the hairline, falling past the ears and framing the face.
      crown(k, v) {
        const C = colours(k);
        const mass = (x, y, z) => massAt(C, x, y, z);
        v.fill(-1, 7, 6, 8, -1, 5, mass);
        v.fill(0, 6, 9, 9, 0, 4, mass);
        v.fill(-1, -1, 0, 5, -1, 5, mass);
        v.fill(7, 7, 0, 5, -1, 5, mass);
        v.fill(-1, 7, 0, 5, -1, -1, mass);
        v.del(3, 6, 5);
        // The top ropes gathered into a loose knot at the crown, wound with a bone and ochre cord.
        v.fill(1, 5, 10, 10, 0, 3, mass);
        v.fill(2, 4, 11, 12, 0, 3, (x, y, z) => y === 11 ? (x + z) % 2 ? C.bone : C.ochre : mass(x, y, z));
        v.fill(2, 4, 13, 13, 1, 2, mass);
        v.set(3, 14, 1, C.deepLt);
        headBeads = [];
        lay(v, C, HEAD_ROPES, headBeads);
      },
      // Pale eyes under heavy lids, both glancing off to one side, as if he has already
      // seen what is coming; a brow over each, set forward so the eyes sit in its shade.
      eyes(k, v) {
        const C = colours(k);
        for (const x of [0, 1, 5, 6]) {
          v.set(x, 2, 5, x === 1 || x === 6 ? C.pupil : C.eye);
          v.set(x, 3, 5, k.P.skinDk);
          k.eyeCells.push([x, 2]);
        }
        v.fill(0, 2, 4, 4, 6, 6, C.deepLt);
        v.fill(4, 6, 4, 4, 6, 6, C.deepLt);
        return true;
      },
      // A thin braid off the chin with one bone bead.
      mark(k, v) {
        const C = colours(k);
        v.fill(2, 4, 0, 0, 6, 6, k.P.skinDk);
        v.set(3, -1, 6, C.deepLt);
        v.set(3, -2, 6, C.band);
        headBeads.push([3, -3, 6, "bone"]);
      },
      headgear(k) {
        const u = k.u;
        addChild(k.parts.head, createNode({ geometry: beadGeometry(headBeads, u, { x: -3.5 * u, y: 0, z: -3 * u }) }));
      },
      // The curtain hangs from the torso, not the root, so it stays on him in bed; the
      // counter-scale undoes the torso's girth so it lines up with the head's ropes.
      extras(k) {
        const C = colours(k), u = k.u, h = k.h, b = k.traits.belly, v = makeVox(), beads = [];
        lay(v, C, BACK_ROPES, beads);
        const origin = { x: -3.5 * u, y: 0.5 * h, z: -3 * u + 0.02 * h };
        const curtain = createNode({ scale: { x: 1 / b, y: 1, z: 1 / b }, geometry: k.vg(v, origin) });
        addChild(curtain, createNode({ geometry: beadGeometry(beads, u, origin) }));
        addChild(k.parts.torso, curtain);
      }
    }
  });
})();
