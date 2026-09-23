"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { boot } from "./boot";
import { ribbonTag } from "./ribbonTag";
import { bookScroll } from "./state";

/**
 * The bookmark ribbon.
 *
 * A length of red silk sewn in at the spine, the way a real octavo carries
 * one: it comes out from between the leaves at the tail of the shut book,
 * falls over the edge of the back board and lies across the blotter. It
 * belongs to the shut book, so it goes as the covers lift, like the lamp.
 *
 * Its loose end carries a paper tag when there is somewhere to go back to — a
 * returning reader's place (see the ribbon in Book3D.tsx). The tag is DOM, so
 * it can be focused and tapped; this projects the end of the silk to the
 * screen every frame and moves the tag there.
 *
 * World metres, like Essentials: the shut book's near edge is z ≈ 0.146, the
 * text block runs from the back board (≈ 8.5 mm) to ≈ 31 mm, and the blotter's
 * top is at ≈ 6.2 mm.
 */

/** across the board, toward the fore-edge side */
const X = 0.226;
const WIDTH = 0.0105;
/** how far back into the swallowtail's notch the middle of the end is cut */
const NOTCH = 0.008;

const PATH = [
  /* inside the block — hidden, so the silk is seen to come *out* of it */
  [X, 0.0205, 0.12],
  [X, 0.0205, 0.146],
  /* over the tail, and down past the back board's edge */
  [X + 0.0008, 0.0175, 0.155],
  [X + 0.002, 0.0105, 0.161],
  /* lying on the pad, curling back in toward the middle of the book — on a
     phone the frame is barely wider than the board, and silk that fell
     outward would take its tag off the edge of the screen */
  [X + 0.004, 0.0068, 0.169],
  [X - 0.004, 0.0067, 0.184],
  [X - 0.02, 0.0067, 0.195],
  [X - 0.044, 0.0067, 0.201],
].map(([x, y, z]) => new THREE.Vector3(x, y, z));

function buildRibbon() {
  const curve = new THREE.CatmullRomCurve3(PATH, false, "centripetal");
  const N = 64;
  const up = new THREE.Vector3(0, 1, 0);
  const side = new THREE.Vector3();
  const p = new THREE.Vector3();
  const t = new THREE.Vector3();
  const pos: number[] = [];
  const uv: number[] = [];

  /* two vertices across the silk at each step along it */
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    curve.getPointAt(u, p);
    curve.getTangentAt(u, t);
    side.crossVectors(t, up).normalize().multiplyScalar(WIDTH / 2);
    pos.push(p.x - side.x, p.y - side.y, p.z - side.z, p.x + side.x, p.y + side.y, p.z + side.z);
    uv.push(0, u, 1, u);
  }
  /* and one more in the middle of the last row, cut back: the swallowtail */
  const len = curve.getLength();
  curve.getPointAt(1 - NOTCH / len, p);
  const notch = pos.length / 3;
  pos.push(p.x, p.y, p.z);
  uv.push(0.5, 1 - NOTCH / len);

  const index: number[] = [];
  for (let i = 0; i < N - 1; i++) {
    const a = i * 2;
    index.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  const a = (N - 1) * 2;
  index.push(a, notch, a + 1, a, a + 2, notch, a + 1, notch, a + 3);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(index);
  geo.computeVertexNormals();

  /* silk: a soft sheen across the weave rather than a specular highlight */
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x7a1d15,
    roughness: 0.55,
    metalness: 0,
    sheen: 1,
    sheenRoughness: 0.35,
    sheenColor: new THREE.Color(0xd9705c),
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.raycast = () => {};

  /* where the tag is tied: the end of the silk, just short of the notch */
  const end = curve.getPointAt(1 - (NOTCH * 0.5) / len);
  return { mesh, mat, geo, end };
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const smoothstep = (a: number, b: number, n: number) => {
  const t = clamp01((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export default function Ribbon() {
  const ribbon = useMemo(buildRibbon, []);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const at = useMemo(() => ({ v: new THREE.Vector3(), x: NaN, y: NaN, on: "" }), []);

  useEffect(() => {
    return () => {
      ribbon.geo.dispose();
      ribbon.mat.dispose();
    };
  }, [ribbon]);

  useFrame(() => {
    /* the lamp's curve: it is the shut book's, and it clears with it */
    const here = smoothstep(0.62, 0.95, bookScroll.close);
    ribbon.mesh.visible = here > 0.002;
    ribbon.mat.transparent = here < 0.999;
    ribbon.mat.opacity = here;

    const el = ribbonTag.el;
    if (!el) return;
    const on = here > 0.6 && !boot.active ? "true" : "false";
    if (on !== at.on) {
      at.on = on;
      el.dataset.on = on;
    }
    if (on !== "true") return;
    at.v.copy(ribbon.end).project(camera);
    const x = Math.round((size.left + ((at.v.x + 1) / 2) * size.width) * 2) / 2;
    const y = Math.round((size.top + ((1 - at.v.y) / 2) * size.height) * 2) / 2;
    if (x === at.x && y === at.y) return;
    at.x = x;
    at.y = y;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    /* too near the right edge for the tag to hang to the right: hang it left */
    const flip = x > size.left + size.width - 200 ? "true" : "false";
    if (el.dataset.flip !== flip) el.dataset.flip = flip;
  });

  return <primitive object={ribbon.mesh} />;
}
