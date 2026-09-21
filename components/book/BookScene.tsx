"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Html, Lightformer, useGLTF } from "@react-three/drei";
import { Suspense, memo, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";
import type { PostMeta } from "@/lib/format";
import Desk from "./Desk";
import Intro from "./Intro";
import Essentials, { DESK_FRAME } from "./Essentials";
import Lamps, { LAMP_BACK, LAMP_TOP } from "./Lamps";
import { boot } from "./boot";
import { buildSpreads } from "./spreads";
import { TURNS, TURN_PLAN, bookScroll, getSpread, setInvalidate, subscribeSpread } from "./state";

/* The authored file is 25 MB of 4K texture; scripts/optimize-book-glb.mjs
   repacks it to 3.3 MB without a visible difference at this framing. */
export const MODEL_URL = "/ancient_book.web.glb";

useGLTF.preload(MODEL_URL);

/* ---------------------------------------------------------------- helpers */

/** frame-rate independent exponential approach */
const damp = (cur: number, to: number, lambda: number, dt: number) =>
  cur + (to - cur) * (1 - Math.exp(-lambda * dt));

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const smooth = (n: number) => n * n * (3 - 2 * n);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Camera marks along the scroll. `dist` is a multiplier on the distance that
 * frames the book at its target size, so the framing survives any aspect ratio
 * and the marks only say "pull back a little here, lean in there".
 *
 * The angles stay steep: the text lives on the pages, so the spread has to read
 * close to flat or the far page goes to nothing.
 */
type Mark = { at: number; dist: number; el: number; yaw: number };

const MARKS: Mark[] = [
  /* Shut on the desk: a low, raking angle that catches the tooling. Lower
     than it reads, because this mark now frames a whole desk rather than a
     board — from 46° you are looking at the top of everything on it, and a mug
     and an inkwell seen from above are two circles. */
  { at: 0.0, dist: 1.04, el: 38, yaw: -13 },
  { at: 0.11, dist: 1.0, el: 69, yaw: -2 },
  { at: 0.5, dist: 0.99, el: 72, yaw: 0 },
  { at: 0.9, dist: 1.0, el: 69, yaw: 2 },
  { at: 1.0, dist: 1.04, el: 66, yaw: 5 },
];

function markAt(p: number, out: Mark) {
  let i = 1;
  while (i < MARKS.length - 1 && MARKS[i].at < p) i++;
  const a = MARKS[i - 1];
  const b = MARKS[i];
  const t = smooth(clamp01((p - a.at) / (b.at - a.at)));
  out.dist = lerp(a.dist, b.dist, t);
  out.el = lerp(a.el, b.el, t);
  out.yaw = lerp(a.yaw, b.yaw, t);
  return out;
}

/**
 * How much of the frame the desk fills while the book is shut on it.
 *
 * Bigger than the reading `fill` below, and deliberately: the shut book is the
 * landing, and framing the whole desk — blotter, lamp, the things beside it —
 * at the same fill as a single opening leaves the book a small object in a lot
 * of dark. The phone stops at 1: the blotter's edges crop there anyway, and
 * going past it starts taking the corners of the board with them.
 */
const SHUT_FILL = { wide: 1.02, narrow: 1 };

/**
 * And where on screen the desk sits while it is the subject. The reading
 * framing below pushes the book right to clear the index in the left margin
 * and lifts it a little; the desk is wider and taller than the book, so it
 * wants to sit closer to the middle of the frame than the board does.
 */
const SHUT_FRAME = {
  wide: { x: -0.02, y: 0.03 },
  narrow: { x: 0, y: 0.02 },
};

/** where the book sits on screen, as a fraction of the frame, per layout */
const FRAMING = {
  /* pushed a touch right of centre to clear the index in the left margin */
  wide: { x: -0.045, y: 0.03, fill: 0.8 },
  /* lifted clear of the index strip along the bottom edge */
  narrow: { x: 0, y: 0.055, fill: 1 },
};

/* CSS pixels across one page. Bigger means smaller type on the same paper. */
const PAGE_PX = 420;
/** drei renders <Html transform> at 1 CSS px = (distanceFactor ?? 10)/400 world units */
const DREI_PX = 10 / 400;

/* ------------------------------------------------------------------- book */

type PageRig = {
  action: THREE.AnimationAction;
  dur: number;
  /** spread-to-spread transition this leaf turns on */
  turn: number;
  /** head start inside that transition, so a bundle riffles instead of welding */
  lead: number;
};

/**
 * The GLB ships one long `PageTurn` clip in which the ten leaves cascade with a
 * fixed overlap — lovely to play back, useless to steer, because no moment in it
 * is a rest pose. This slices that clip into one clip per leaf rig, each
 * rebased to zero, so every leaf gets its own scrubbable 0..1 turn.
 */
function usePageRigs(scene: THREE.Object3D, clips: THREE.AnimationClip[]) {
  return useMemo(() => {
    const mixer = new THREE.AnimationMixer(scene);
    const clip = clips[0];
    if (!clip) return { mixer, rigs: [] as PageRig[] };

    /* bone track -> the Rig_Page_NN it hangs under. GLTFLoader uniquifies the
       duplicated bone names (pb_0, pb_0_1, ...), so lookup by name is safe. */
    const byRig = new Map<number, THREE.KeyframeTrack[]>();
    for (const track of clip.tracks) {
      const { nodeName } = THREE.PropertyBinding.parseTrackName(track.name);
      let node: THREE.Object3D | null = scene.getObjectByName(nodeName) ?? null;
      let rig = -1;
      while (node) {
        const m = /^Rig_Page_(\d+)/.exec(node.name);
        if (m) {
          rig = Number(m[1]);
          break;
        }
        node = node.parent;
      }
      if (rig < 0) continue;
      const list = byRig.get(rig);
      if (list) list.push(track);
      else byRig.set(rig, [track]);
    }

    const rigs: PageRig[] = [];
    for (const [rig, tracks] of byRig) {
      const turn = TURN_PLAN.findIndex((pages) => pages.includes(rig));
      if (turn < 0) continue;

      const start = Math.min(...tracks.map((t) => t.times[0]));
      const end = Math.max(...tracks.map((t) => t.times[t.times.length - 1]));
      const rebased = tracks.map((t) => {
        const copy = t.clone();
        /* fresh array — KeyframeTrack.clone() shares the original's times */
        copy.times = Float32Array.from(t.times, (time) => time - start);
        return copy;
      });

      const dur = end - start;
      const action = mixer.clipAction(new THREE.AnimationClip(`page_${rig}`, dur, rebased));
      action.loop = THREE.LoopOnce;
      action.clampWhenFinished = true;
      action.play();
      action.paused = true;

      const order = TURN_PLAN[turn].indexOf(rig);
      rigs.push({ action, dur, turn, lead: order * 0.11 });
    }
    return { mixer, rigs };
  }, [scene, clips]);
}

/* ------------------------------------------------------------- the writing */

type Geometry = {
  pageW: number;
  pageH: number;
  gutter: number;
  /** y of the flat page surface */
  top: number;
  /** x of the spine-side hinge, and the thicknesses the covers fold over */
  boardIn: number;
  boardW: number;
  boardT: number;
  stackT: number;
  /** measured y of the top of the text block — what the front board shuts onto */
  blockTop: number;
};

/**
 * The half of the text block that rides the front board over as the book
 * shuts: `flap` twins the board's hinge, `wad` holds the stack where it was
 * authored and owns the thickness that has to press flat on landing.
 */
type Fold = {
  flap: THREE.Group;
  wad: THREE.Group;
  /** y of the face the stack rests on the board by — the collapse anchor */
  floor: number;
};

/** everything the frame loop needs off the GLB, measured once per scene */
type BookPrep = {
  span: number;
  geom: Geometry;
  hinge: THREE.Object3D | null;
  shutAway: THREE.Object3D[];
  block: THREE.Object3D | null;
  fold: Fold | null;
};

/**
 * The text of the notebook, laid on the two flat pages as real DOM through a
 * CSS3D transform — so it is selectable, linkable and readable by a screen
 * reader, and still sits in the book's own perspective.
 *
 * Only the open spread is mounted. The swap happens at the midpoint of a turn,
 * while `.leaf-html` is faded out, so the change is never seen.
 */
const Pages = memo(function Pages({
  geom,
  posts,
  fadeRef,
  coverRef,
}: {
  geom: Geometry;
  posts: PostMeta[];
  fadeRef: React.RefObject<(HTMLDivElement | null)[]>;
  coverRef: React.RefObject<HTMLDivElement | null>;
}) {
  const spreads = useMemo(() => buildSpreads(posts), [posts]);
  const i = useSyncExternalStore(subscribeSpread, getSpread, () => 0);
  const spread = spreads[Math.max(0, Math.min(spreads.length - 1, i))];

  const scale = geom.pageW / (PAGE_PX * DREI_PX);
  const pageHpx = PAGE_PX * (geom.pageH / geom.pageW);
  const x = geom.gutter / 2 + geom.pageW / 2;

  return (
    <>
      {(["verso", "recto"] as const).map((side, n) => (
        <Html
          key={side}
          transform
          position={[n === 0 ? -x : x, geom.top, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={scale}
          zIndexRange={[10, 0]}
        >
          <div
            className="leaf-html"
            data-side={side}
            style={{ width: PAGE_PX, height: pageHpx }}
            ref={(el) => {
              fadeRef.current[n] = el;
            }}
          >
            {side === "verso" ? spread.verso : spread.recto}
          </div>
        </Html>
      ))}

      {/* the title, blind-tooled into the shut board */}
      <Html
        transform
        position={[2 * geom.boardIn + geom.boardW / 2, geom.stackT + 2 * geom.boardT + 0.0012, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={scale}
        zIndexRange={[9, 0]}
      >
        <div
          className="board-plate"
          style={{ width: PAGE_PX, height: pageHpx }}
          ref={coverRef}
        >
          <span className="board-frame" aria-hidden="true" />
          <span className="board-kicker">the field notebook of</span>
          <h1 className="board-name">Prashant Dubey</h1>
          <span className="board-rule" aria-hidden="true" />
          <span className="board-imprint">vol. i · anno mmxxvi</span>
          <span className="board-open">scroll to open ↓</span>
        </div>
      </Html>
    </>
  );
});

function Book({ posts }: { posts: PostMeta[] }) {
  const { scene, animations } = useGLTF(MODEL_URL);
  const { mixer, rigs } = usePageRigs(scene, animations);
  const group = useRef<THREE.Group>(null);
  const fadeRef = useRef<(HTMLDivElement | null)[]>([null, null]);
  const coverRef = useRef<HTMLDivElement | null>(null);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);

  /* One-time scene prep: centre on the origin, sit it on the ground plane,
     stop skinned pages being culled by their rest-pose bounds, work out where
     on the block the two flat pages lie, and build the fold flap.

     Cached on the scene, not on the render. `useGLTF` hands out one shared
     scene for the whole app, and this function *mutates* it — so it is not a
     pure memo and must not run twice over the same graph. Strict Mode invokes
     it twice on mount, which was enough to break it two ways: the second pass
     re-read an already-centred bounding box and zeroed the offset it had just
     applied, and it built a second flap that stole `PageStack_L` out of the
     first — leaving the frame loop driving an empty group while the half-stack
     sat where it was authored, out in the open beside the shut book. */
  const prep = useMemo(() => {
    const cached = scene.userData.__bookPrep as BookPrep | undefined;
    if (cached) return cached;

    const box = new THREE.Box3().setFromObject(scene);
    const centre = box.getCenter(new THREE.Vector3());
    const extent = box.getSize(new THREE.Vector3());
    scene.position.set(-centre.x, -box.min.y, -centre.z);
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.frustumCulled = false;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat?.isMeshStandardMaterial) {
        mat.envMapIntensity = 0.55;
        /* the cut page edges ship untextured and read as white plastic */
        if (/PageEdges/i.test(mat.name)) mat.color.setHex(0xe8dfc6);
        /* M_Leather_Oxblood ships a pale hide texture that lit like this comes
           out bright pink — and the tooled title is gold leaf, which has no
           contrast against pink. `color` multiplies the map, so this tints the
           cover back down to the oxblood the material is named for and lets
           the gold read. */
        if (/Leather/i.test(mat.name)) {
          mat.color.setHex(0x8a4038);
          mat.roughness = 0.82;
        }
        /* the clasps and corner bosses ship untextured and read as white
           plastic; they are meant to be aged brass */
        if (/Brass|Gold/i.test(mat.name)) {
          mat.color.setHex(0x9c7b3c);
          mat.metalness = 0.85;
          mat.roughness = 0.42;
        }
      }
    });

    /* the exporter wrote the binding's real dimensions into the scene extras */
    const dims = (scene.userData?.BOOK_DIMS ?? {}) as Record<string, number>;
    /* the hinge's rest offset from the spine — also the board's own inset */
    const boardIn = dims.BOARD_IN ?? 0.026;
    const hinge = scene.getObjectByName("Hinge_Cover_L") ?? null;
    /* The flat spine strip and its stitching sit across the fold; with the
       cover shut they would lie out in the open beside the boards. GLTFLoader
       splits a multi-primitive mesh into a group, so these are groups. */
    const shutAway = ["Spine", "Sewing_Thread"]
      .map((n) => scene.getObjectByName(n))
      .filter((o): o is THREE.Object3D => Boolean(o));
    /* everything the boards close over hangs off this one pivot */
    const block = scene.getObjectByName("Spine_Pivot") ?? null;
    const stack = scene.getObjectByName("PageStack_R");
    const top = stack
      ? new THREE.Box3().setFromObject(stack).max.y - box.min.y + 0.0012
      : extent.y * 0.55;

    /* ---- what the front board actually has to shut onto ----
       Not `STACK_T`. The ten skinned leaves are bound *above* the half-stacks
       — the stacks top out at 24.0 mm and the leaves at 30.2 mm — so a board
       folded to (2·BOARD_T + STACK_T)/2 · 2 = 40.5 mm lands a centimetre clear
       of the paper, which is where the floating clasps came from. Read it off
       the bind-pose geometry instead. A skinned mesh's world matrix is not
       where it renders, so this has to be the *geometry* box, which is
       authored in the rig's own space. */
    let blockTop = 0;
    for (const o of block?.children ?? []) {
      o.traverse((n) => {
        const mesh = n as THREE.Mesh;
        if (!mesh.isMesh || /Spine|Thread/i.test(mesh.name)) return;
        mesh.geometry.computeBoundingBox();
        blockTop = Math.max(blockTop, mesh.geometry.boundingBox?.max.y ?? 0);
      });
    }
    if (!blockTop) blockTop = (dims.STACK_T ?? 0.0235) + 0.0067;
    blockTop += 0.0006;

    /* ---- the fold flap ----
       The left half of the text block is not a thing that shrinks: it is the
       leaves already read, lying on the open front board, and shutting the
       book carries them over with it. Squashing its width instead is what made
       the bundle tear open out of the spine. So lift it out of `Spine_Pivot`
       and hang it on the board's own hinge.

       `flap` copies the hinge node's transform exactly, so `wad` — offset by
       the hinge's rest x to put the stack back where it was authored — rides
       the board rigidly. `wad` also owns the thickness, which has to collapse
       at the very end of the fold: face-down the half-stack lands inside the
       volume the right half already fills, and the only place left for it is
       nowhere. It is under the shut board by then, so nobody sees it go. */
    const stackL = scene.getObjectByName("PageStack_L") ?? null;
    let fold: Fold | null = null;
    if (stackL && hinge?.parent) {
      const flap = new THREE.Group();
      const wad = new THREE.Group();
      flap.position.x = -boardIn;
      wad.position.x = boardIn;
      const wadBox = new THREE.Box3();
      stackL.traverse((n) => {
        const mesh = n as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.computeBoundingBox();
        if (mesh.geometry.boundingBox) wadBox.union(mesh.geometry.boundingBox);
      });
      flap.add(wad);
      wad.add(stackL);
      hinge.parent.add(flap);
      fold = { flap, wad, floor: wadBox.isEmpty() ? 0 : wadBox.min.y };
    }

    const prepped: BookPrep = {
      span: extent.x,
      hinge,
      shutAway,
      block,
      fold,
      geom: {
        pageW: dims.PAGE_W ?? 0.196,
        pageH: dims.PAGE_H ?? 0.284,
        gutter: dims.GUTTER ?? 0.005,
        top,
        boardIn,
        boardW: dims.BOARD_W ?? 0.206,
        boardT: dims.BOARD_T ?? 0.0085,
        stackT: dims.STACK_T ?? 0.0235,
        blockTop,
      },
    };
    scene.userData.__bookPrep = prepped;
    return prepped;
  }, [scene]);
  const { span, geom, hinge, shutAway, block, fold } = prep;

  /* where the block's middle sits open, and where it has to sit shut */
  const openCentre = geom.pageW / 2 + geom.gutter / 2;
  const shutCentre = 2 * geom.boardIn + geom.boardW / 2;

  /* scratch objects — allocating inside useFrame would garbage-collect mid-turn */
  const scratch = useMemo(
    () => ({
      mark: { at: 0, dist: 1, el: 60, yaw: 0 } as Mark,
      pos: new THREE.Vector3(),
      focus: new THREE.Vector3(),
      shift: new THREE.Vector3(),
      up: new THREE.Vector3(),
      basis: new THREE.Matrix4(),
      worldUp: new THREE.Vector3(0, 1, 0),
      camTo: new THREE.Vector3(),
      focusTo: new THREE.Vector3(),
      cursor: 0,
      close: 1,
      closeV: 0,
      settle: 2,
      dest: new THREE.Vector3(NaN, NaN, NaN),
      destT: NaN,
      destC: NaN,
      intro: 0,
      seeded: false,
    }),
    [],
  );

  /* a resize changes the framing, so ask for a frame */
  useEffect(() => {
    invalidate();
  }, [invalidate, size.width, size.height]);

  /* The landing sequence waits on this and not on the loading manager's
     percentage. `useGLTF` suspends, so this component existing at all is the
     only statement worth making about whether the binding has arrived: the
     bytes being in is not the same as the scene being in the graph. */
  useEffect(() => {
    boot.bookIn = true;
    invalidate();
  }, [invalidate]);

  useFrame((_, dt) => {
    const cam = camera as THREE.PerspectiveCamera;
    const s = scratch;

    /* ---- settling onto the desk, once, on load ----
       Skipped outright when the page came up on the lamp: the book has been
       lying on that desk under the lamp for the whole sequence, and dropping
       it onto the desk again the moment the camera arrives would undo the one
       thing the loader established. The arrival is the camera's, below. */
    if (s.intro < 1 && group.current) {
      s.intro = bookScroll.reduced || boot.active ? 1 : Math.min(1, s.intro + dt / 0.85);
      const e = 1 - (1 - s.intro) ** 3;
      group.current.position.y = (1 - e) * span * 0.1;
      group.current.rotation.x = (1 - e) * -0.1;
      group.current.scale.setScalar(0.96 + 0.04 * e);
    }

    /* ---- the covers ----
       The GLB animates leaves but not boards, so the front board is folded by
       hand, and the whole difficulty is that a board is not hinged on a point
       the model gives you. Its spine edge rests at (-BOARD_IN, 0) lying open
       and has to end at (+BOARD_IN, blockTop) face down; those are 66 mm
       apart, so *any* single fixed pivot that carries one to the other swings
       on a 33 mm radius and throws the edge 46 mm into the air at ninety
       degrees — a fifth of the board's own width clear of the spine, which is
       exactly where the eye is following it, and reads as the cover coming off
       the book. Both ends look right either way; only the movement gives it
       away.

       A real board does not travel: it turns about a leather joint that stays
       beside the spine and only creeps up onto the block as it lands. So drive
       the pivot along that path directly — quartic in x, so the edge hugs the
       *left* of the spine through the whole lift and only crosses over at the
       very end, and quadratic in y, so it stays down on the desk until there
       is a block under it to climb. At half shut that puts the edge at
       (-23 mm, 7.5 mm): standing upright, planted on its own joint. */
    const closeTo = bookScroll.reduced ? (bookScroll.progress < 0.02 ? 1 : 0) : bookScroll.close;
    if (bookScroll.reduced) {
      s.close = closeTo;
      s.closeV = 0;
    } else {
      /* A board has mass. An exponential approach has none — it is fastest the
         instant it is asked to move and only ever decelerates, which is what
         made the cover feel like a sprite being cross-faded rather than a
         quarter-kilo of leather over board. This is a slightly under-damped
         spring instead: it takes a moment to break away, swings through, and
         settles with one small nod. Sub-stepped so a long frame cannot make it
         explode. */
      const stiff = 170;
      const damping = 2 * Math.sqrt(stiff) * 0.6;
      let rest = Math.min(dt, 0.1);
      while (rest > 0) {
        const h = Math.min(rest, 1 / 240);
        s.closeV += (-stiff * (s.close - closeTo) - damping * s.closeV) * h;
        s.close += s.closeV * h;
        rest -= h;
      }
      /* the desk and the shut board are hard stops; a board dropped flat does
         not keep going, it knocks and stops */
      if (s.close < 0) {
        s.close = 0;
        s.closeV *= -0.16;
      } else if (s.close > 1) {
        s.close = 1;
        s.closeV *= -0.16;
      }
    }
    const theta = -Math.PI * s.close;
    const pivotX = -geom.boardIn + 2 * geom.boardIn * s.close ** 4;
    const pivotY = geom.blockTop * s.close ** 2;
    if (hinge) {
      hinge.rotation.z = theta;
      hinge.position.set(pivotX, pivotY, 0);
    }
    /* Gather the spine strip and its stitching into the fold as the book
       shuts — but only over the last of it, once the board is past upright and
       lying over them. Doing it across the whole fold is what made the writing
       surface look like it was being stretched out of the spine. */
    const open = Math.max(0.001, 1 - clamp01((s.close - 0.58) / 0.42));
    for (const o of shutAway) o.scale.x = open;
    /* Open, the text block straddles the spine; shut, it has to sit square
       inside the boards. The boards land at 2·BOARD_IN, the block starts at the
       gutter, and the difference is what it slides. */
    const slide = (shutCentre - openCentre) * s.close;
    if (block) block.position.x = slide;
    /* The leaves already read ride the board over. `flap` is the hinge node's
       twin, plus the same slide the rest of the block gets, so the half-stack
       stays welded to the leather through the whole fold. Its thickness is the
       one thing that cannot survive the landing — face down it wants the
       volume the right half already occupies — so it presses flat over the
       last fifteen degrees, under the board, out of sight. */
    if (fold) {
      fold.flap.rotation.z = theta;
      fold.flap.position.set(pivotX + slide, pivotY, 0);
      const press = lerp(1, 0.02, smooth(clamp01((s.close - 0.86) / 0.14)));
      fold.wad.scale.y = press;
      fold.wad.position.y = fold.floor * (1 - press);
    }

    /* ---- pages ---- */
    const target = bookScroll.reduced ? bookScroll.spread : bookScroll.cursor;
    s.cursor = bookScroll.reduced ? target : damp(s.cursor, target, 14, dt);
    for (const rig of rigs) {
      const u = clamp01((s.cursor - rig.turn - rig.lead) / (1 - rig.lead));
      rig.action.time = smooth(u) * rig.dur;
    }
    mixer.update(0);

    /* text can only be read off a flat page, so it clears out of the way for
       the turn — which is also when the spread's content is swapped */
    const lift = clamp01(Math.abs(s.cursor - Math.round(s.cursor)) * 3.4);
    bookScroll.lift = lift;
    const fade = String(Math.round((1 - lift) * clamp01(1 - s.close * 6) * 100) / 100);
    for (const el of fadeRef.current) {
      if (el && el.style.opacity !== fade) el.style.opacity = fade;
    }
    /* the tooled title belongs to the shut board, and goes with it */
    const cover = String(Math.round(clamp01(s.close * 4 - 3) * 100) / 100);
    if (coverRef.current && coverRef.current.style.opacity !== cover) {
      coverRef.current.style.opacity = cover;
    }

    /* ---- camera ---- */
    const frame = FRAMING[bookScroll.layout];
    const mark = markAt(bookScroll.progress, s.mark);
    const el = (mark.el * Math.PI) / 180;
    const yaw = (mark.yaw * Math.PI) / 180;

    /* what has to fit, and where it sits: the shut book is one board wide and
       folded over to the spine side; a phone reads a single leaf */
    const leafX = geom.gutter / 2 + geom.pageW / 2;
    const openSpan = bookScroll.layout === "narrow" ? geom.pageW * 1.02 : span;
    /* Shut, the frame is not the board's — the two lamps stand either side of
       it and have to be in the picture with it, so the width to fit is theirs.
       They fade out over the first half of the first scroll, and this eases
       back to the board over exactly the same stretch, which is why the book
       appears to come *toward* you as the covers lift. */
    const deskFrame = DESK_FRAME[bookScroll.roomy ? "roomy" : "bare"];
    const shutSpan = Math.max(geom.boardW * 1.06, deskFrame.span);
    let fitSpan = lerp(openSpan, shutSpan, s.close);
    /* Shut, the subject is the whole desk — the board, and the inkwell and mug
       and leaves either side of it — so what the camera centres on is the
       middle of all that rather than the middle of the book, which on a wide
       screen would leave the mug hanging off the edge. It eases back onto the
       book itself as the covers lift, over the same stretch the desk clears
       on. On a phone there is no clutter and the two are the same point. */
    const focusX = lerp(bookScroll.pageFocus * leafX, deskFrame.centre, s.close);

    const halfY = Math.tan((cam.fov * Math.PI) / 360);
    const halfX = halfY * cam.aspect;
    /* How tall the footprint projects at this elevation. The orthographic
       answer is not enough: seen from a low angle the near edge is a good deal
       closer than the middle and projects larger, so solve for the distance
       that fits the *magnified* near edge. Three passes converge well inside a
       pixel at these sizes. */
    /* A leaf caught mid-turn stands on its edge, and so does the cover
       mid-fold — both reach far above the flat footprint, and framing only the
       footprint crops them off the top of the frame. This is what makes the
       book breathe: it eases back for a turn and settles in again after.

       The two cases need their own allowance rather than one shared `upright`.
       A turning leaf reaches a page height; the cover reaches its own width
       plus however far up the joint has climbed, and carries the half-stack of
       leaves with it — measurably more, and it was clipping the board's top
       edge and its corner bosses right at the middle of the fold. They never
       overlap: the leaves only start turning once the boards are down. */
    const foldUp = Math.sin(Math.PI * s.close);
    const fitTall =
      geom.pageH * Math.sin(el) +
      geom.stackT * Math.cos(el) +
      /* The lamp stands behind the board and reaches over it, so it costs the
         frame on both counts: the depth of the desk it stands back across, and
         its own height above it. Framing only what lies flat crops the shade
         off the top. */
      2 * (LAMP_BACK * Math.sin(el) + LAMP_TOP * Math.cos(el)) * 0.46 * s.close +
      geom.pageH * 1.05 * Math.cos(el) * bookScroll.lift +
      (geom.boardW + geom.blockTop) * 1.3 * Math.cos(el) * foldUp;
    fitSpan += geom.boardW * 0.22 * foldUp;
    const near = (geom.pageH / 2) * Math.cos(el);
    const fill = lerp(frame.fill, SHUT_FILL[bookScroll.layout], s.close);
    let dist = Math.max(fitSpan / 2 / halfX, fitTall / 2 / halfY) / fill;
    for (let i = 0; i < 3; i++) {
      const magnify = dist / Math.max(1e-4, dist - near);
      dist = Math.max((fitSpan * magnify) / 2 / halfX, (fitTall * magnify) / 2 / halfY) / fill;
    }
    dist *= mark.dist;

    /* and the middle of the picture sits back toward it, between the book's
       near edge and the shade, rather than on the book's own centre line */
    s.focusTo.set(focusX, span * 0.03 + geom.stackT * s.close, -LAMP_BACK * 0.3 * s.close);
    s.camTo
      .set(Math.sin(yaw) * Math.cos(el), Math.sin(el), Math.cos(yaw) * Math.cos(el))
      .multiplyScalar(dist)
      .add(s.focusTo);

    /* slide camera and focus together along the screen plane, which translates
       the image by an exact fraction of the frame without any reprojection */
    s.basis.lookAt(s.camTo, s.focusTo, s.worldUp);
    const viewW = 2 * halfX * dist;
    const viewH = viewW / cam.aspect;
    /* The standing cover is all above the desk, so the whole image has to sit
       lower in the frame while it is up — otherwise the extra distance that
       fits it just shrinks the book instead of revealing the board. */
    /* Shut, the subject is a lamp standing over a book, and the height that
       takes is all above the desk — fit it and the slack all falls to the
       bottom of the frame. So the whole image drops a little while the lamp is
       there, and comes back to the reading framing as it goes. */
    const shutFrame = SHUT_FRAME[bookScroll.layout];
    const frameX = lerp(frame.x, shutFrame.x, s.close);
    const frameY = lerp(lerp(frame.y, shutFrame.y, s.close), -0.05, foldUp);
    s.shift
      .setFromMatrixColumn(s.basis, 0)
      .multiplyScalar(frameX * viewW)
      .addScaledVector(s.up.setFromMatrixColumn(s.basis, 1), -frameY * viewH);
    s.camTo.add(s.shift);
    s.focusTo.add(s.shift);

    if (!s.seeded) {
      s.pos.copy(s.camTo);
      s.focus.copy(s.focusTo);
      s.seeded = true;
    } else {
      const lambda = bookScroll.reduced ? 1e3 : 4.5;
      s.pos.x = damp(s.pos.x, s.camTo.x, lambda, dt);
      s.pos.y = damp(s.pos.y, s.camTo.y, lambda, dt);
      s.pos.z = damp(s.pos.z, s.camTo.z, lambda, dt);
      s.focus.x = damp(s.focus.x, s.focusTo.x, lambda, dt);
      s.focus.y = damp(s.focus.y, s.focusTo.y, lambda, dt);
      s.focus.z = damp(s.focus.z, s.focusTo.z, lambda, dt);
    }
    cam.position.copy(s.pos);
    cam.lookAt(s.focus);

    /* Keep asking for frames while anything is still settling — and for two
       more after it lands.
       <Html transform> is a child, so its useFrame is subscribed first, and it
       reads `camera.matrixWorldInverse`, which only the renderer refreshes.
       Its CSS3D plane therefore lays out from the camera's pose as of the
       *previous* render. On a continuous loop that is an invisible one-frame
       lag; on a demand loop it strands the writing beside the book. Note this
       has to fire on a changed destination too, not just on movement: under
       reduced motion the camera snaps home within a single frame, so "still
       moving" is never true and the trailing frames would never be asked for. */
    const moving =
      s.intro < 1 ||
      Math.abs(s.close - closeTo) > 1e-4 ||
      Math.abs(s.closeV) > 1e-4 ||
      Math.abs(s.cursor - target) > 1e-4 ||
      s.pos.distanceToSquared(s.camTo) > 1e-9;
    const retargeted =
      s.destT !== target || s.destC !== closeTo || s.dest.distanceToSquared(s.camTo) > 1e-12;
    s.destT = target;
    s.destC = closeTo;
    s.dest.copy(s.camTo);

    if (moving || retargeted) {
      s.settle = 2;
      invalidate();
    } else if (s.settle > 0) {
      s.settle--;
      invalidate();
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
      <group position={scene.position}>
        <Pages geom={geom} posts={posts} fadeRef={fadeRef} coverRef={coverRef} />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ scene */

function Stage({ posts }: { posts: PostMeta[] }) {
  const invalidate = useThree((s) => s.invalidate);

  /* let the DOM shell wake the loop when the page scrolls */
  useEffect(() => {
    setInvalidate(invalidate);
    invalidate();
    return () => setInvalidate(null);
  }, [invalidate]);

  return (
    <>
      <ambientLight intensity={0.46} color="#fbf2dd" />
      <directionalLight
        castShadow
        position={[0.42, 0.78, 0.4]}
        intensity={1.75}
        color="#fff2d6"
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
        shadow-normalBias={0.004}
        /* wide enough for the desk either side of the book, not just the book */
        shadow-camera-left={-0.66}
        shadow-camera-right={0.66}
        shadow-camera-top={0.66}
        shadow-camera-bottom={-0.66}
        shadow-camera-near={0.05}
        shadow-camera-far={2.5}
      />
      {/* cool fill, so the vellum does not go flat and orange */}
      <directionalLight position={[-0.5, 0.35, -0.45]} intensity={0.5} color="#cfe0ef" />

      {/* The pool of light the book is read in. Sits low and close so its
          falloff is visible across the desk within the frame — a light this
          near is what separates "a book on a desk" from "a book on a plane
          lit evenly to the horizon". No shadow map: the directional light
          above already casts, and a second shadow-casting light here doubles
          the cost for a contact shadow nothing would see. */}
      <pointLight position={[0.16, 0.52, 0.34]} intensity={0.26} distance={1.9} decay={2} color="#ffd9a0" />

      <Desk />

      {/* Its own boundary, and not the canvas's. R3F suspends the whole tree
          on the one drei puts round `children`, which would hold the lamp back
          until the 3.3 MB it is there to cover had finished arriving. */}
      <Suspense fallback={null}>
        <Book posts={posts} />
      </Suspense>

      {/* the desk the book is shut on, the lamp standing over it, and the
          room's light level while the binding is still on its way */}
      <Essentials />
      <Lamps />
      <Intro />

      {/* An open book lies flat, so it covers its own contact shadow — the
          heavy blur is what lets a soft halo bleed out past the boards. `far`
          has to clear the *standing* cover, not the flat one: at 0.14 the board
          left the shadow volume the moment it came off the desk, the halo
          vanished, and the book read as pasted onto the page for the whole
          length of the fold. */}
      <ContactShadows
        position={[0, -0.003, 0]}
        scale={2.1}
        resolution={512}
        far={0.34}
        blur={4.5}
        opacity={0.62}
        color="#2b2114"
      />

      {/* built in-process from lightformers — no HDR fetched off a CDN */}
      <Environment resolution={64} frames={1}>
        <color attach="background" args={["#2a2620"]} />
        <Lightformer intensity={1.6} color="#fff3de" position={[0, 1.4, 0.6]} scale={[3, 3, 1]} />
        <Lightformer intensity={0.7} color="#e6eef6" position={[-1.6, 0.6, -1]} scale={[2, 2, 1]} />
        <Lightformer intensity={0.4} color="#f0dcc0" position={[1.6, 0.3, -0.8]} scale={[2, 2, 1]} />
      </Environment>
    </>
  );
}

function BookSceneImpl({ posts }: { posts: PostMeta[] }) {
  return (
    <Canvas
      className="stage-canvas"
      frameloop="demand"
      shadows
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 30, near: 0.02, far: 20, position: [0, 0.5, 0.7] }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 0.98;
      }}
    >
      <Stage posts={posts} />
    </Canvas>
  );
}

/**
 * Memoised on purpose: the shell re-renders on things the scene does not care
 * about, and without this the whole renderer/camera/mesh tree would be
 * reconciled along with it. `posts` is a stable prop from the server.
 */
const BookScene = memo(BookSceneImpl);
export default BookScene;
