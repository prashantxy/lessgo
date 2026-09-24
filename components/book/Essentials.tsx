"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { boot } from "./boot";
import { lampBody, showExceptLights } from "./Lamps";
import { contactSkip } from "./Shadows";
import { bookScroll, staleShadows, wake } from "./state";
import { brushed, dropPainted, glaze, leather, noteCard, paper } from "./textures";

/**
 * The desk the book is shut on.
 *
 * A blotter under the board and the things that live beside it — inkwell, pen,
 * a mug going cold, a stack of written-on leaves under a sealed letter, a
 * loupe and a pair of spectacles. Without them the binding sat on an empty
 * plane, which reads as a product shot; with them it reads as somebody's desk
 * with their notebook on it, which is what the whole site is pretending to be.
 *
 * Two visibility rules, and they are different:
 *
 * - The **blotter** is always there. It is the surface the book lies on, not
 *   clutter, and on a phone it is most of what makes the frame a desk.
 * - The **clutter** needs width beside the board to sit in, which a phone does
 *   not have — framing it there would shrink the book to nothing. So it is
 *   gated on `bookScroll.roomy` (700px and up: tablets and laptops), and it
 *   fades with the covers like the lamp does, because once the book is open
 *   the camera is inside the reading framing and none of it is in shot.
 *
 * All of it is primitives, and all of the texture is drawn onto canvases at
 * mount (see textures.ts): the binding is already 3.3 MB and none of this is
 * worth a second download. Lathes rather than cylinders wherever the silhouette
 * is the whole object — a mug is a profile, and a tube with a disc in it reads
 * as a tube with a disc in it no matter how well it is lit.
 */

/** where the shut book sits — `2·BOARD_IN + BOARD_W/2` off the model's dims */
const CENTRE = 0.155;

/** the height of the desk's own surface */
const DESK_Y = 0.0052;
/**
 * How far above whatever is under it the nib floats.
 *
 * It does not touch down. A pen resting exactly on a surface intersects it —
 * the nib is a cone and the surface is a plane through the middle of it — and
 * over anything with a shape of its own (the mug, the pot, the board's raised
 * corner bosses) resting on the *plane* beneath means going straight through
 * the object. A millimetre and a half of air reads as a hand holding it there.
 */
const PEN_HOVER = 0.018;
/** the pen's own small light, while it is out */
const SPARK = 0.01;
/**
 * The nib's tip, in the pen's own frame — the point that sits under the
 * pointer.
 *
 * The barrel is a lathe turned about +y and laid down with a quarter turn
 * about z, which puts it along **-x**: the cap end at 0 and the writing end
 * furthest out. So this is the far end of the pen and not its middle — which
 * is what it was, and is why the pen stood with four centimetres of itself
 * through the cover of the book.
 */
const PEN_NIB = -0.116;
/** how it is held: turned across the desk, and tipped up off the nib */
const PEN_TURN = 0.62;
const PEN_TIP = 1.02;
/**
 * Where the pen still counts as being over the desk. Past this the pointer is
 * out in the dark beyond it, or above the horizon entirely, and the arrow
 * comes back — a cursor that flies off to the vanishing point is worse than no
 * cursor at all.
 */
const PEN_REACH = { x: [-0.3, 0.75], z: [-0.5, 0.4] };
/**
 * The shut book's top board, and its footprint.
 *
 * The pen has to land on whatever is under the cursor, not on the desk plane:
 * carry it over the board and the desk point beneath is 3 cm further away and
 * behind the book, so the pen vanishes behind the thing you are holding it
 * over — which is most of the desk.
 */
const BOARD_TOP = 0.042;
const BOARD_ON = { x: [0.048, 0.262], z: [-0.146, 0.146] };

/**
 * What the camera takes in while the book is shut, per how much room there is.
 * `bare` is the phone: the board and the lamp standing over it, nothing else.
 */
export const DESK_FRAME = {
  roomy: { span: 0.54, centre: 0.185 },
  bare: { span: 0.235, centre: CENTRE },
};

/** the mug's rim, in world metres — where the steam comes off */
const MUG_TOP = new THREE.Vector3(0.425, 0.084, 0.075);
/** the inkwell, and the height of the ink in its neck */
const WELL_AT = new THREE.Vector3(-0.04, 0.0315, -0.05);
/** how many wisps are in the air at once */
const WISPS = 6;

/* ------------------------------------------------------------------ shapes */

/**
 * One soft puff, for the steam. Drawn once at mount; a radial falloff on a
 * canvas is all a wisp is at this size.
 */
function puffTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  if (!g) return null;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,0.9)");
  grad.addColorStop(0.45, "rgba(255,255,255,0.35)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** a surface of revolution from a [radius, height] profile */
function lathe(profile: [number, number][], segments = 40) {
  return new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(r, y)),
    segments,
  );
}

/**
 * A flat slab with rounded corners and a bevelled edge, lying in the xz plane
 * with its underside on y = 0. Everything on a desk that is "a flat thing" —
 * the blotter, a leaf of paper, an envelope — is one of these; a BoxGeometry
 * gives it four hard 90° edges that catch a specular line the whole way along
 * and read as machined plastic.
 */
function slab(w: number, d: number, t: number, r: number) {
  const shape = new THREE.Shape();
  const hw = w / 2 - r;
  const hd = d / 2 - r;
  shape.moveTo(-hw, -hd - r);
  shape.lineTo(hw, -hd - r);
  shape.quadraticCurveTo(hw + r, -hd - r, hw + r, -hd);
  shape.lineTo(hw + r, hd);
  shape.quadraticCurveTo(hw + r, hd + r, hw, hd + r);
  shape.lineTo(-hw, hd + r);
  shape.quadraticCurveTo(-hw - r, hd + r, -hw - r, hd);
  shape.lineTo(-hw - r, -hd);
  shape.quadraticCurveTo(-hw - r, -hd - r, -hw, -hd - r);

  const bevel = Math.min(t * 0.34, r * 0.5);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(t - bevel * 2, t * 0.3),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 6,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, bevel, 0);
  /* Extruded shapes carry no useful UVs — box-project the top face, which is
     the only one anything is seen from at this angle. `v` runs backwards
     because a CanvasTexture is flipY like an image: v=0 is the *bottom* of the
     canvas, and the far edge of a sheet lying on a desk is the top of what was
     drawn on it. Left as `(z + d/2)/d` the note read upside down. */
  const pos = geo.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) + w / 2) / w;
    uv[i * 2 + 1] = 1 - (pos.getZ(i) + d / 2) / d;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geo;
}

/* ------------------------------------------------------------------- build */

function buildDesk() {
  const clutter = new THREE.Group();
  const blotter = new THREE.Group();

  /* Two material lists, because the two groups have different lives: the
     clutter fades with the covers and the blotter never does. A material
     shared between them would take the pad's brass edge out with the
     inkwell's collar. */
  const fade: THREE.Material[] = [];
  const fixed: THREE.Material[] = [];
  const geos: THREE.BufferGeometry[] = [];
  /* every mesh the pen can hover over — the pen's own parts excluded, or it
     would come to rest on itself */
  const hits: THREE.Object3D[] = [];
  const mat = (o: THREE.MeshStandardMaterialParameters, into = fade) => {
    const m = new THREE.MeshStandardMaterial(o);
    into.push(m);
    return m;
  };

  const hide = leather("#232a21");
  const writing = paper(true);
  const card = noteCard();
  const plain = paper(false);
  const clay = glaze("#a2957b");
  const streak = brushed();
  const painted = [hide, writing, plain, clay, card];

  /* A blotter is traditionally green, and that is worth keeping: the desk is
     oak, the binding oxblood and brass, and a third warm brown under the book
     would have lost the board's own edge against it. */
  const pad = mat({ ...hide, color: 0xffffff, roughness: 1, metalness: 0 }, fixed);
  const edge = mat(
    { color: 0x9c7b3c, metalness: 0.85, roughness: 0.46, roughnessMap: streak },
    fixed,
  );
  const brass = mat({ color: 0x9c7b3c, metalness: 0.85, roughness: 0.46, roughnessMap: streak });
  const steel = mat({ color: 0xb4b6bd, metalness: 0.92, roughness: 0.26, roughnessMap: streak });
  const stone = mat({ ...clay, color: 0xffffff, roughness: 1, metalness: 0, side: THREE.DoubleSide });
  const glassy = mat({ color: 0x2b323a, roughness: 0.12, metalness: 0.2 });
  const ink = mat({ color: 0x0b0a08, roughness: 0.22, metalness: 0 });
  const ebony = mat({ color: 0x241b15, roughness: 0.38, metalness: 0.12, roughnessMap: streak });
  /* `color` multiplies the map, and the map is the colour rag paper actually
     is — which, left at white on a desk lit by one lamp, comes out as the
     brightest thing in the frame and pulls the eye straight off the book */
  const noted = mat({ ...writing, color: 0xb1a586, roughness: 1, metalness: 0 });
  /* the top sheet is a note to the reader, so it is a shade brighter than the
     working papers under it and it has somewhere to take them */
  const note = mat({
    ...card,
    color: 0xc8bc9c,
    roughness: 1,
    metalness: 0,
    emissive: 0xffd9a0,
    emissiveIntensity: 0,
  });
  const blank = mat({ ...plain, color: 0xa79b7e, roughness: 1, metalness: 0 });
  const wax = mat({ color: 0x8b2a20, roughness: 0.42, metalness: 0 });
  const coffee = mat({ color: 0x1d1008, roughness: 0.14, metalness: 0 });

  const put = (
    g: THREE.BufferGeometry,
    m: THREE.Material,
    to: THREE.Object3D,
    at: [number, number, number],
    rot?: [number, number, number],
    cast = true,
    onPen = false,
  ) => {
    geos.push(g);
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(...at);
    if (rot) mesh.rotation.set(...rot);
    /* `cast` is off for the flat things — a blotter or a leaf of paper lying
       on a surface can only shadow itself, and at this bias that is acne */
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    to.add(mesh);
    if (!onPen) hits.push(mesh);
    return mesh;
  };
  const part = (to: THREE.Object3D, at: [number, number, number], turn = 0) => {
    const g = new THREE.Group();
    g.position.set(...at);
    g.rotation.y = turn;
    to.add(g);
    return g;
  };

  /* ---- the blotter ----
     Two slabs: the brass one stands a couple of millimetres proud all round
     and gives the pad the edge a desk blotter is held down by. */
  put(slab(0.456, 0.346, 0.003, 0.006), edge, blotter, [CENTRE, 0, 0], undefined, false);
  put(slab(0.44, 0.33, 0.004, 0.005), pad, blotter, [CENTRE, 0.0022, 0], undefined, false);

  /* ---- the inkwell: a squat pot, a brass collar, and ink in the neck ---- */
  const well = part(clutter, [WELL_AT.x, 0, WELL_AT.z], 0.3);
  put(
    lathe([
      [0, 0],
      [0.03, 0],
      [0.0315, 0.005],
      [0.0305, 0.017],
      [0.0255, 0.026],
      [0.0205, 0.031],
      [0.0205, 0.035],
      [0.018, 0.035],
      [0.018, 0.031],
      [0.0225, 0.025],
      [0.0225, 0.012],
      [0, 0.01],
    ]),
    glassy,
    well,
    [0, 0, 0],
  );
  put(new THREE.TorusGeometry(0.0197, 0.0035, 10, 30), brass, well, [0, 0.0345, 0], [-Math.PI / 2, 0, 0]);
  put(new THREE.CircleGeometry(0.0178, 24), ink, well, [0, 0.0315, 0], [-Math.PI / 2, 0, 0]);
  /* the pen dips when it is brought over the pot — see Essentials below */
  for (const o of well.children) o.userData.well = true;
  /* and the ink takes it: a ring spreading out across the surface. Its own
     material, outside `fade` — its opacity is the ripple, not the covers. */
  const rippleMat = new THREE.MeshBasicMaterial({
    color: 0x8a8f99,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const ripple = put(
    new THREE.RingGeometry(0.8, 1, 32),
    rippleMat,
    well,
    [0, 0.0318, 0],
    [-Math.PI / 2, 0, 0],
    false,
    true,
  );
  ripple.visible = false;

  /* ---- the pen ----
     Not a thing lying on the desk: this is the pointer. It is built here
     because it belongs to the desk's materials and its light, but nothing
     places it — the cursor does, every frame, in Essentials below.

     Turned as one profile: a barrel that tapers both ways is what separates a
     pen from a dowel, and it is four extra points to say so. */
  const pen = part(clutter, [0, 0, 0], PEN_TURN);
  /* A cursor has to be legible everywhere it can go, and half the desk is
     outside the lamp's pool. So the pen carries its own small light — which
     doubles as the thing that makes it read as being *over* the surface
     rather than drawn on top of it, because it lights the surface under the
     nib. Flagged `boot` so the room dimmer leaves it alone: this one is not
     part of the room. */
  const spark = new THREE.PointLight(0xffd9a6, 0, 0.14, 2);
  spark.position.set(PEN_NIB * 0.85, 0.01, 0);
  spark.userData.boot = true;
  pen.add(spark);
  /* and it is a shade over life-size: at true scale a 5 mm barrel is three
     pixels of cursor */
  pen.scale.setScalar(1.18);
  const barrel = lathe(
    [
      [0, 0],
      [0.004, 0.0018],
      [0.0056, 0.01],
      [0.0058, 0.052],
      [0.005, 0.074],
      [0.0036, 0.086],
      [0.003, 0.09],
    ],
    24,
  );
  put(barrel, ebony, pen, [0, 0, 0], [0, 0, Math.PI / 2], true, true);
  /* the band where the section screws into the barrel */
  put(new THREE.CylinderGeometry(0.0062, 0.0062, 0.005, 20), brass, pen, [-0.088, 0, 0], [0, 0, Math.PI / 2], true, true);
  /* the nib itself: a cone flattened on one axis, which is what a nib is. Its
     apex lands at PEN_NIB — keep the two in step. */
  const nib = put(new THREE.ConeGeometry(0.0038, 0.026, 16), brass, pen, [-0.103, 0, 0], [0, 0, Math.PI / 2], true, true);
  nib.scale.set(1, 1, 0.6);
  /* and the clip, which is most of what says "pen" in silhouette */
  put(new THREE.BoxGeometry(0.026, 0.0012, 0.0038), brass, pen, [-0.016, 0.0052, 0], [0, 0, 0.05], true, true);

  /* ---- the mug ---- */
  const mug = part(clutter, [0.425, 0, 0.075], -0.5);
  put(
    lathe([
      [0, 0],
      [0.03, 0],
      [0.0315, 0.004],
      [0.0295, 0.012],
      [0.0325, 0.034],
      [0.036, 0.066],
      [0.0368, 0.08],
      [0.0372, 0.084],
      [0.034, 0.084],
      [0.0328, 0.068],
      [0.0288, 0.02],
      [0.026, 0.012],
      [0, 0.011],
    ]),
    stone,
    mug,
    [0, 0, 0],
  );
  put(new THREE.CircleGeometry(0.0322, 30), coffee, mug, [0, 0.0645, 0], [-Math.PI / 2, 0, 0]);
  const handle = put(new THREE.TorusGeometry(0.0185, 0.0052, 10, 26), stone, mug, [0.045, 0.046, 0]);
  handle.scale.set(1, 1.15, 0.72);

  /* ---- the coffee is still hot ----
     A handful of sprites rising off the rim, each on its own slow loop. Kept
     faint: steam you notice on the second look is a warm cup; steam you
     notice first is a special effect. */
  const puff = puffTexture();
  const steam = new THREE.Group();
  const wisps: THREE.Sprite[] = [];
  for (let i = 0; i < WISPS; i++) {
    const m = new THREE.SpriteMaterial({
      map: puff ?? undefined,
      color: 0xe8dcc6,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const w = new THREE.Sprite(m);
    w.raycast = () => {};
    steam.add(w);
    wisps.push(w);
  }
  steam.position.copy(MUG_TOP);
  clutter.add(steam);

  /* ---- the leaves, and the letter they are lying on ---- */
  const leaves = part(clutter, [0.402, 0, -0.112], -0.24);
  put(slab(0.15, 0.195, 0.0016, 0.002), blank, leaves, [0.004, 0, 0.002], [0, 0.06, 0], false);
  const seal = put(new THREE.CylinderGeometry(0.0092, 0.0102, 0.0022, 20), wax, leaves, [0.064, 0.0018, 0.086]);
  seal.rotation.y = 0.4;
  put(slab(0.128, 0.172, 0.0014, 0.002), blank, leaves, [-0.002, 0.0036, -0.004], [0, -0.05, 0]);
  put(slab(0.126, 0.17, 0.0014, 0.002), blank, leaves, [0.003, 0.0052, 0.001], [0, 0.03, 0]);
  /* the one on top is a note to the reader, and it goes somewhere */
  put(slab(0.124, 0.168, 0.0016, 0.002), noted, leaves, [-0.004, 0.0068, 0.004], [0, -0.06, 0]);
  const card3d = put(slab(0.122, 0.166, 0.0018, 0.002), note, leaves, [0, 0.0086, 0], [0, -0.015, 0]);
  card3d.userData.href = "/writing";

  /* ---- the loupe ----
     Out at the side and not in front of the book: the board stands 3 cm off
     the pad and the camera is looking down over it, so anything laid on the
     near side of it is behind the book from here. */
  const loupe = part(clutter, [-0.035, 0, 0.055], -0.95);
  put(new THREE.TorusGeometry(0.0245, 0.0032, 10, 34), brass, loupe, [0, 0.0032, 0], [-Math.PI / 2, 0, 0]);
  put(new THREE.CircleGeometry(0.0235, 30), glassy, loupe, [0, 0.0036, 0], [-Math.PI / 2, 0, 0]);
  put(
    lathe(
      [
        [0, 0],
        [0.0042, 0.002],
        [0.0038, 0.018],
        [0.005, 0.03],
        [0.0062, 0.05],
        [0.0052, 0.058],
        [0, 0.06],
      ],
      20,
    ),
    ebony,
    loupe,
    [0.028, 0.0032, 0],
    [0, 0, -Math.PI / 2],
  );
  put(new THREE.CylinderGeometry(0.0046, 0.0046, 0.005, 18), brass, loupe, [0.0295, 0.0032, 0], [0, 0, Math.PI / 2]);

  /* ---- the spectacles, folded, set down on the notes ----
     On the paper and not on the pad: they are two 1.4 mm wires and a bridge,
     and against dark green leather in the book's own shadow there was nothing
     of them to see. */
  const specs = part(clutter, [0.398, 0.0092, -0.098], 0.78);
  for (const side of [-1, 1]) {
    /* far enough apart to read as two lenses: at this distance a folded pair
       with a real 2 mm bridge projects to one loop */
    put(new THREE.TorusGeometry(0.0145, 0.0014, 8, 28), steel, specs, [side * 0.0185, 0.0032, 0], [-Math.PI / 2, 0, 0]);
  }
  put(new THREE.TorusGeometry(0.006, 0.0012, 8, 16, Math.PI), steel, specs, [0, 0.004, -0.004], [Math.PI / 2, 0, 0]);
  /* the arms, folded back across the lenses */
  for (const side of [-1, 1]) {
    const arm = put(new THREE.BoxGeometry(0.052, 0.0012, 0.0022), steel, specs, [side * 0.006, 0.0058, side * 0.008], [0, side * 0.24, 0]);
    arm.rotateY(0);
  }

  return {
    blotter,
    clutter,
    pen,
    card: card3d,
    note,
    hits,
    fade,
    fixed,
    geos,
    painted,
    streak,
    ripple,
    rippleMat,
    wisps,
    steam,
    spark,
    puff,
  };
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const smoothstep = (a: number, b: number, n: number) => {
  const t = clamp01((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** frame-rate independent exponential approach */
const damp = (cur: number, to: number, lambda: number, dt: number) =>
  cur + (to - cur) * (1 - Math.exp(-lambda * dt));

export default function Essentials() {
  const desk = useMemo(buildDesk, []);
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const router = useRouter();

  /**
   * The pen is the cursor.
   *
   * Not a prop that gets picked up — the arrow is hidden and the pen stands on
   * its nib at the point the arrow would have been, on whatever surface is
   * under it. Which means the pen's *position* is never what is animated: the
   * nib's is, and the body hangs off it.
   *
   * Raycast by hand off `window` rather than through R3F's pointer events,
   * because `.stage` is `pointer-events: none` — deliberately, so the wheel and
   * every click reach the document underneath — and a canvas that takes no
   * pointer events fires no `onPointerMove`. It also means the real pointer
   * target is whatever is *behind* the canvas, which is exactly what has to be
   * tested to know whether the arrow should come back: over the index, the
   * tabs, a link or the open book's own text, a pen is not a cursor, it is a
   * thing in the way of one.
   */
  const cur = useMemo(() => {
    const e = new THREE.Euler(-0.26, PEN_TURN, PEN_TIP);
    return {
      on: false,
      seen: false,
      /* whether the clutter is showing, so it is only toggled on a change */
      shown: true,
      link: false,
      lift: 0,
      /* over the inkwell: the nib goes into the ink */
      dip: false,
      /* 0..1 through the ripple the dip sets off; 1 is still */
      ring: 1,
      /* seconds of steam, for the wisps' loops */
      t: 0,
      ray: new THREE.Raycaster(),
      ndc: new THREE.Vector2(),
      desk: new THREE.Plane(new THREE.Vector3(0, 1, 0), -DESK_Y),
      board: new THREE.Plane(new THREE.Vector3(0, 1, 0), -BOARD_TOP),
      hit: new THREE.Vector3(),
      at: new THREE.Vector3(),
      to: new THREE.Vector3(),
      euler: e,
      /* the pose never changes, so the nib's offset under it is worked out
         once rather than sixty times a second */
      nib: new THREE.Vector3(PEN_NIB * 1.18, 0, 0).applyQuaternion(
        new THREE.Quaternion().setFromEuler(e),
      ),
    };
  }, []);

  useEffect(() => {
    const canvas = gl.domElement;
    /* only while the desk is the thing on screen */
    /* not while the landing sequence still has the page: the chrome is hidden
       and a click then means "get on with it", not "take me to the writing" */
    const live = () => !boot.active && bookScroll.roomy && bookScroll.close > 0.6;
    const hideArrow = (hide: boolean) => {
      const want = hide ? "none" : "";
      if (document.body.style.cursor !== want) document.body.style.cursor = want;
    };

    const onMove = (e: PointerEvent) => {
      /* a pointer on the chrome is a pointer doing something a pen cannot */
      const over = e.target as HTMLElement | null;
      const chrome = !!over?.closest?.(
        "a, button, input, textarea, .index, .tabs, .leaf-html, .plate, .expand-overlay",
      );
      if (!live() || chrome || e.pointerType === "touch") {
        if (cur.on || cur.link) {
          cur.on = false;
          cur.link = false;
          hideArrow(false);
          wake();
        }
        return;
      }

      const r = canvas.getBoundingClientRect();
      cur.ndc.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -((e.clientY - r.top) / r.height) * 2 + 1,
      );
      cur.ray.setFromCamera(cur.ndc, camera);

      /* ---- what is under the pointer ----
         Three candidates, and the nearest one along the ray wins, because that
         is the surface you can see there:

         - the things on the desk, by real intersection. They have shapes — a
           mug is not a disc at mug height — and resting on a plane through one
           is how the pen ended up inside it.
         - the shut board's top face, analytically. The binding's own meshes
           are skinned and there are dozens of them; raycasting those on every
           pointermove to find out that the pen is over the cover is not a
           trade worth making.
         - the desk, which is always there. */
      let best = Infinity;
      cur.at.set(0, DESK_Y, 0);

      const surfaces = lampBody.group ? [...desk.hits, lampBody.group] : desk.hits;
      const found = cur.ray.intersectObjects(surfaces, true);
      const link = found.length > 0 && found[0].object === desk.card;
      if (link !== cur.link) {
        cur.link = link;
        wake();
      }
      if (found.length && found[0].distance < best) {
        best = found[0].distance;
        cur.at.copy(found[0].point);
      }

      if (cur.ray.ray.intersectPlane(cur.board, cur.hit)) {
        const on =
          cur.hit.x > BOARD_ON.x[0] &&
          cur.hit.x < BOARD_ON.x[1] &&
          cur.hit.z > BOARD_ON.z[0] &&
          cur.hit.z < BOARD_ON.z[1];
        const d = cur.ray.ray.origin.distanceTo(cur.hit);
        if (on && d < best) {
          best = d;
          cur.at.copy(cur.hit);
        }
      }

      if (cur.ray.ray.intersectPlane(cur.desk, cur.hit)) {
        const d = cur.ray.ray.origin.distanceTo(cur.hit);
        if (d < best) {
          best = d;
          cur.at.copy(cur.hit);
        }
      }

      const reach =
        best < Infinity &&
        cur.at.x > PEN_REACH.x[0] &&
        cur.at.x < PEN_REACH.x[1] &&
        cur.at.z > PEN_REACH.z[0] &&
        cur.at.z < PEN_REACH.z[1];
      if (!reach) {
        if (cur.on) {
          cur.on = false;
          hideArrow(false);
          wake();
        }
        return;
      }

      /* Brought over the pot, the pen goes to the ink rather than resting on
         the rim — a pointer anywhere on the well means "dip", the way a real
         hand would not balance a pen on the collar. Once per arrival. */
      const dip = found.length > 0 && found[0].distance <= best + 1e-6 && !!found[0].object.userData.well;
      if (dip) cur.to.copy(WELL_AT).setY(WELL_AT.y - 0.004);
      else cur.to.set(cur.at.x, cur.at.y + PEN_HOVER, cur.at.z);
      if (dip && !cur.dip) cur.ring = 0;
      cur.dip = dip;
      if (!cur.on) {
        cur.on = true;
        /* it does not fly in from wherever it was last seen */
        cur.seen = false;
        hideArrow(true);
      }
      wake();
    };

    const onLeave = () => {
      if (!cur.on) return;
      cur.on = false;
      hideArrow(false);
      wake();
    };

    /* the note goes to the writing. A three-dimensional link, so it is a
       shortcut and not the only way there — the book's own contents carry the
       same posts as real anchors, which is what a crawler and a screen reader
       read. */
    const onDown = (e: PointerEvent) => {
      onMove(e);
      if (!live() || !cur.link || e.button !== 0) return;
      const href = desk.card.userData.href as string | undefined;
      if (href) router.push(href);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      document.body.style.cursor = "";
    };
  }, [camera, gl, cur, desk, router]);

  useEffect(() => {
    /* steam moves every frame and casts nothing; keep it out of the contact
       shadow, which is now only redrawn when something that casts has moved */
    contactSkip.push(desk.steam);
    return () => {
      contactSkip.splice(contactSkip.indexOf(desk.steam), 1);
      for (const m of [...desk.fade, ...desk.fixed]) m.dispose();
      for (const g of desk.geos) g.dispose();
      for (const p of desk.painted) dropPainted(p);
      desk.streak.dispose();
      desk.rippleMat.dispose();
      desk.puff?.dispose();
      for (const w of desk.wisps) w.material.dispose();
    };
  }, [desk]);

  /* ---- the room is alive while you are looking at it ----
     The canvas renders on demand, so steam and a ripple would freeze the
     moment nothing else asked for a frame. This asks, at a steady thirty a
     second — and only while the desk is in shot, the reader has not asked for
     stillness, and the tab is showing. Once the book is open the desk is out
     of frame and the loop goes back to sleeping. */
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.hidden || bookScroll.reduced || !bookScroll.roomy) return;
      if (bookScroll.close < 0.6) return;
      invalidate();
    }, 1000 / 30);
    return () => clearInterval(id);
  }, [invalidate]);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.1);
    /* the same curve the lamp fades on, so the desk clears as one thing */
    const here = smoothstep(0.62, 0.95, bookScroll.close);
    const show = bookScroll.roomy && here > 0.002;

    /* The blotter is laid for the shut book, which sits right of the spine;
       open, the book straddles it, and a pad left where it was hangs half out
       from under the right-hand board. So it goes with the book. */
    desk.blotter.position.x = -CENTRE * (1 - smoothstep(0, 1, bookScroll.close));

    /* Everything but the pen's own light, which stays in the scene at nothing
       — its count is compiled into every lit shader (see showExceptLights). */
    if (show !== cur.shown) {
      cur.shown = show;
      showExceptLights(desk.clutter, show);
    }
    if (!show) {
      /* the pen is the desk's cursor, and there is no desk */
      if (cur.on) {
        cur.on = false;
        document.body.style.cursor = "";
      }
      showExceptLights(desk.pen, false);
      desk.spark.intensity = 0;
      return;
    }
    for (const m of desk.fade) {
      m.transparent = here < 0.999;
      m.opacity = here;
    }

    /* ---- steam ---- */
    const still = bookScroll.reduced;
    if (!still) cur.t += dt;
    desk.wisps.forEach((w, i) => {
      const phase = (cur.t * 0.16 + i / WISPS) % 1;
      const sway = Math.sin(cur.t * 0.8 + i * 1.7) * 0.007 * phase;
      w.position.set(sway, 0.004 + phase * 0.085, Math.cos(cur.t * 0.6 + i) * 0.003 * phase);
      w.scale.setScalar(0.018 + phase * 0.05);
      w.material.opacity = still ? 0 : 0.11 * Math.sin(Math.PI * phase) * here;
    });

    /* ---- the ripple ---- */
    if (cur.ring < 1) {
      cur.ring = Math.min(1, cur.ring + dt / 1.2);
      const k = 1 - (1 - cur.ring) ** 2;
      desk.ripple.visible = cur.ring < 1;
      desk.ripple.scale.setScalar(0.002 + k * 0.0155);
      desk.rippleMat.opacity = 0.45 * (1 - cur.ring) * here;
    }

    /* ---- the note, when the pointer is on it ----
       It lifts a millimetre and warms, which is the whole of the hover state:
       there is no cursor to change — the cursor is a pen, and a pen does not
       have a pointing-hand form. */
    const wantLift = cur.link ? 1 : 0;
    if (Math.abs(cur.lift - wantLift) > 1e-3) {
      cur.lift = damp(cur.lift, wantLift, 14, dt);
      desk.card.position.y = 0.0086 + 0.0042 * cur.lift;
      desk.note.emissiveIntensity = 0.22 * cur.lift;
      wake();
    }

    /* ---- the pen, standing wherever the pointer is ----
       Damped rather than snapped, but hard: this is a cursor and a cursor
       cannot lag. The first frame after it appears is snapped outright, so it
       does not fly in across the desk from wherever it was last seen. */
    const p = desk.pen;
    showExceptLights(p, cur.on);
    desk.spark.intensity = cur.on ? SPARK : 0;
    if (!cur.on) return;
    p.rotation.copy(cur.euler);
    if (!cur.seen) {
      cur.seen = true;
      p.position.copy(cur.to).sub(cur.nib);
      return;
    }
    const lambda = 38;
    /* the pen casts, so while it is still travelling the shadows follow it */
    const off =
      Math.abs(p.position.x + cur.nib.x - cur.to.x) +
      Math.abs(p.position.y + cur.nib.y - cur.to.y) +
      Math.abs(p.position.z + cur.nib.z - cur.to.z);
    if (off > 2e-5) staleShadows();
    p.position.set(
      damp(p.position.x + cur.nib.x, cur.to.x, lambda, dt) - cur.nib.x,
      damp(p.position.y + cur.nib.y, cur.to.y, lambda, dt) - cur.nib.y,
      damp(p.position.z + cur.nib.z, cur.to.z, lambda, dt) - cur.nib.z,
    );
  });

  return (
    <>
      <primitive object={desk.blotter} />
      <primitive object={desk.clutter} />
    </>
  );
}
