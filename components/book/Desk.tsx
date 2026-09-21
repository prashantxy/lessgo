"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { bookScroll } from "./state";

/**
 * The desk the book lies on.
 *
 * Until now the canvas was alpha and the "desk" was a CSS wash on <html>, so
 * the book floated in a flat beige field with nothing under it and no edge to
 * the world. This puts real geometry beneath it: a large oak plane that takes
 * the contact shadow and then falls away into the dark.
 *
 * Two deliberate choices:
 *
 * - The grain is generated onto a canvas here rather than shipped as an image.
 *   The book model is already 3.2 MB and a desk texture worth looking at would
 *   be another megabyte; this costs about 8 ms once, at mount.
 * - The falloff is scene fog, not a baked vignette in the texture. Fog is what
 *   makes the plane read as a room rather than a disc — it darkens the far
 *   edge to nothing regardless of how far the camera pulls back over the
 *   scroll, so the desk never shows its own border.
 */

/** dark oak, quartersawn — the grain runs the long way across the desk */
function grainTexture() {
  const S = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d");
  if (!g) return null;

  g.fillStyle = "#3a2b1c";
  g.fillRect(0, 0, S, S);

  /* growth rings: long, low-contrast bands with a wandering centre line, so
     the grain never reads as straight stripes */
  for (let i = 0; i < 190; i++) {
    const y = Math.random() * S;
    const thickness = 0.6 + Math.random() * 3.4;
    const dark = Math.random() < 0.5;
    g.strokeStyle = dark
      ? `rgba(28,19,11,${0.10 + Math.random() * 0.22})`
      : `rgba(122,92,58,${0.05 + Math.random() * 0.14})`;
    g.lineWidth = thickness;
    g.beginPath();
    g.moveTo(0, y);
    let cur = y;
    for (let x = 0; x <= S; x += 32) {
      cur += (Math.random() - 0.5) * 7;
      g.lineTo(x, cur);
    }
    g.stroke();
  }

  /* pores — the fine speckle that stops a flat fill looking like plastic */
  const img = g.getImageData(0, 0, S, S);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 22;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  g.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.anisotropy = 4;
  return tex;
}

export default function Desk() {
  const map = useMemo(grainTexture, []);
  const fog = useRef<THREE.Fog>(null);

  /* The framing that takes in both lamps stands the camera further back than
     any reading framing does, and on a phone far enough that the falloff had
     swallowed the desk before the lamps were even in shot. So the fog gives
     way while the book is shut and closes back in as it opens — which is also
     when it is wanted, since an open spread is read at arm's length. */
  useFrame(() => {
    const f = fog.current;
    if (!f) return;
    const out = bookScroll.close;
    const near = 0.62 + 0.5 * out;
    if (Math.abs(f.near - near) > 1e-3) {
      f.near = near;
      f.far = 2.6 + 1.9 * out;
    }
  });

  /* Built once and disposed never: the scene outlives the component for the
     life of the page, and R3F disposes both on unmount. */
  return (
    <>
      {/* Near is set past the book's own footprint so the binding itself is
          never touched by fog — only the desk running away from it. */}
      <fog attach="fog" ref={fog} args={["#17120c", 0.62, 2.6]} />

      <mesh
        position={[0, -0.0045, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        /* the desk is scenery: it must never swallow a click meant for a page */
        raycast={() => null}
      >
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial map={map ?? undefined} color="#6b5335" roughness={0.78} metalness={0} />
      </mesh>
    </>
  );
}
