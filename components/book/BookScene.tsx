"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Html, Lightformer, useGLTF } from "@react-three/drei";
import { memo, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";
import type { PostMeta } from "@/lib/format";
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
  /* shut on the desk: a low, raking angle that catches the tooling */
  { at: 0.0, dist: 1.04, el: 46, yaw: -10 },
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

  /* one-time scene prep: centre on the origin, sit it on the ground plane,
     stop skinned pages being culled by their rest-pose bounds, and work out
     where on the block the two flat pages actually lie */
  const { span, geom, hinge, shutAway, block } = useMemo(() => {
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
    const hinge = scene.getObjectByName("Hinge_Cover_L") ?? null;
    /* The left half of the text block, the flat spine strip and its stitching
       all sit to the left of the fold; with the cover shut over the right half
       they would lie out in the open beside it. GLTFLoader splits a
       multi-primitive mesh into a group, so these are groups, not meshes. */
    const shutAway = ["PageStack_L", "Spine", "Sewing_Thread"]
      .map((n) => scene.getObjectByName(n))
      .filter((o): o is THREE.Object3D => Boolean(o));
    /* everything the boards close over hangs off this one pivot */
    const block = scene.getObjectByName("Spine_Pivot") ?? null;
    const stack = scene.getObjectByName("PageStack_R");
    const top = stack
      ? new THREE.Box3().setFromObject(stack).max.y - box.min.y + 0.0012
      : extent.y * 0.55;

    return {
      span: extent.x,
      hinge,
      shutAway,
      block,
      geom: {
        pageW: dims.PAGE_W ?? 0.196,
        pageH: dims.PAGE_H ?? 0.284,
        gutter: dims.GUTTER ?? 0.005,
        top,
        boardIn: dims.BOARD_IN ?? 0.026,
        boardW: dims.BOARD_W ?? 0.206,
        boardT: dims.BOARD_T ?? 0.0085,
        stackT: dims.STACK_T ?? 0.0235,
      },
    };
  }, [scene]);

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

  useFrame((_, dt) => {
    const cam = camera as THREE.PerspectiveCamera;
    const s = scratch;

    /* ---- settling onto the desk, once, on load ---- */
    if (s.intro < 1 && group.current) {
      s.intro = bookScroll.reduced ? 1 : Math.min(1, s.intro + dt / 0.85);
      const e = 1 - (1 - s.intro) ** 3;
      group.current.position.y = (1 - e) * span * 0.1;
      group.current.rotation.x = (1 - e) * -0.1;
      group.current.scale.setScalar(0.96 + 0.04 * e);
    }

    /* ---- the covers ----
       The GLB animates leaves but not boards, so the front board is folded by
       hand about the spine centre. Rotating it about its own hinge would land
       it half a board off, so the pivot is shifted to x = 0 exactly:
       rotating about c instead of p is the same rotation plus (v - R·v),
       v = c - p. The extra lift sets it down on top of the block. */
    const close = bookScroll.reduced ? (bookScroll.progress < 0.02 ? 1 : 0) : bookScroll.close;
    s.close = damp(s.close, close, 11, dt);
    if (hinge) {
      const theta = -Math.PI * s.close;
      const cos = Math.cos(theta);
      const v = geom.boardIn;
      const lift = (geom.stackT + 2 * geom.boardT) * ((1 - cos) / 2);
      hinge.rotation.z = theta;
      hinge.position.set(-v + v * (1 - cos), -v * Math.sin(theta) + lift, 0);
    }
    /* gather them into the spine line as the book shuts */
    const open = Math.max(0.001, 1 - s.close);
    for (const o of shutAway) o.scale.x = open;
    /* Open, the text block straddles the spine; shut, it has to sit square
       inside the boards. The boards land at 2·BOARD_IN, the block starts at the
       gutter, and the difference is what it slides. */
    if (block) block.position.x = (shutCentre - openCentre) * s.close;

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
    const shutSpan = geom.boardW * 1.06;
    let fitSpan = lerp(openSpan, shutSpan, s.close);
    const focusX = lerp(bookScroll.pageFocus * leafX, shutCentre, s.close);

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
       book breathe: it eases back for a turn and settles in again after. */
    const upright = Math.max(bookScroll.lift, Math.sin(Math.PI * s.close));
    const fitTall =
      geom.pageH * Math.sin(el) +
      geom.stackT * Math.cos(el) +
      geom.pageH * 1.05 * Math.cos(el) * upright;
    fitSpan += geom.boardW * 0.22 * Math.sin(Math.PI * s.close);
    const near = (geom.pageH / 2) * Math.cos(el);
    let dist = Math.max(fitSpan / 2 / halfX, fitTall / 2 / halfY) / frame.fill;
    for (let i = 0; i < 3; i++) {
      const magnify = dist / Math.max(1e-4, dist - near);
      dist =
        (Math.max((fitSpan * magnify) / 2 / halfX, (fitTall * magnify) / 2 / halfY) /
          frame.fill);
    }
    dist *= mark.dist;

    s.focusTo.set(focusX, span * 0.03 + geom.stackT * s.close, 0);
    s.camTo
      .set(Math.sin(yaw) * Math.cos(el), Math.sin(el), Math.cos(yaw) * Math.cos(el))
      .multiplyScalar(dist)
      .add(s.focusTo);

    /* slide camera and focus together along the screen plane, which translates
       the image by an exact fraction of the frame without any reprojection */
    s.basis.lookAt(s.camTo, s.focusTo, s.worldUp);
    const viewW = 2 * halfX * dist;
    const viewH = viewW / cam.aspect;
    s.shift
      .setFromMatrixColumn(s.basis, 0)
      .multiplyScalar(frame.x * viewW)
      .addScaledVector(s.up.setFromMatrixColumn(s.basis, 1), -frame.y * viewH);
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
      Math.abs(s.close - close) > 1e-4 ||
      Math.abs(s.cursor - target) > 1e-4 ||
      s.pos.distanceToSquared(s.camTo) > 1e-9;
    const retargeted =
      s.destT !== target || s.destC !== close || s.dest.distanceToSquared(s.camTo) > 1e-12;
    s.destT = target;
    s.destC = close;
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
        shadow-camera-left={-0.4}
        shadow-camera-right={0.4}
        shadow-camera-top={0.4}
        shadow-camera-bottom={-0.4}
        shadow-camera-near={0.05}
        shadow-camera-far={2.5}
      />
      {/* cool fill, so the vellum does not go flat and orange */}
      <directionalLight position={[-0.5, 0.35, -0.45]} intensity={0.5} color="#cfe0ef" />

      <Book posts={posts} />

      {/* an open book lies flat, so it covers its own contact shadow — the
          heavy blur is what lets a soft halo bleed out past the boards */}
      <ContactShadows
        position={[0, -0.003, 0]}
        scale={1.8}
        resolution={512}
        far={0.14}
        blur={4.5}
        opacity={0.6}
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
