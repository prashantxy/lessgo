"use client";

import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { boot } from "./boot";
import { bookScroll } from "./state";

/**
 * The study window, and the town outside it.
 *
 * The desk is pushed up against a plastered wall with one tall arched window
 * in it, and through the glass is Heidelberg as Merian engraved it in 1620,
 * re-inked for dusk (scripts/make-town.mjs). It is what turns "a book on a
 * desk" into "a book in a room, in a town, in a century".
 *
 * The view is not a picture hung in the opening. It is a plate standing well
 * back behind the wall, so as the camera cranes up off the shut book the
 * opening slides across the town — real parallax, for nothing but geometry.
 * And it is only in the frame while the book is shut: the reading framing
 * looks down at the page from 70°, where the wall is out of shot, so the
 * whole group stops drawing once the covers are up.
 *
 * The town and the sky are unlit and exempt from fog and tone mapping: they
 * are the light, not something lit by it. Everything in the room — wall,
 * stone, leading — is lit and fogged like the desk.
 */

/** the wall's plane, in world z; the lamp stands at -0.33, the desk runs under */
export const WALL_Z = -0.64;
/** centred on the desk's own middle rather than the book's */
const WIN_X = 0.19;
/** the sill stands just clear of the desk */
const SILL_Y = 0.07;
const WIN_W = 0.5;
/** height of the straight jambs, below where the arch springs */
const JAMB_H = 0.26;
const ARCH_R = WIN_W / 2;
/** how wide the dressed stone surround is */
const STONE = 0.055;
/** how far the surround and sill stand proud of the plaster */
const PROUD = 0.035;
/** how far behind the wall the town stands — more is more parallax */
const TOWN_BACK = 1.5;

/** the colour at the plate's top edge, for the sky past it (make-town.mjs SKY_TOP) */
const SKY = new THREE.Color(70 / 255, 66 / 255, 92 / 255);

/** the window's outline, in the wall's own xy — jambs and a round arch */
function archPath<P extends THREE.Path>(path: P, w: number, jamb: number, inset = 0): P {
  const hw = w / 2 - inset;
  path.moveTo(-hw, inset);
  path.lineTo(hw, inset);
  path.lineTo(hw, jamb);
  path.absarc(0, jamb, hw, 0, Math.PI, false);
  path.lineTo(-hw, inset);
  return path;
}

/** lime plaster: a warm, uneven, faintly cracked field */
function plasterTexture() {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d");
  if (!g) return null;
  g.fillStyle = "#6d5a45";
  g.fillRect(0, 0, S, S);
  /* broad blotches: the wall was limewashed by hand, more than once */
  for (let i = 0; i < 90; i++) {
    const r = 20 + Math.random() * 90;
    const x = Math.random() * S;
    const y = Math.random() * S;
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    const light = Math.random() < 0.5;
    grd.addColorStop(0, light ? "rgba(150,126,96,0.16)" : "rgba(40,30,20,0.18)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  /* hairline cracks */
  g.strokeStyle = "rgba(30,22,14,0.22)";
  g.lineWidth = 0.8;
  for (let i = 0; i < 7; i++) {
    let x = Math.random() * S;
    let y = Math.random() * S;
    g.beginPath();
    g.moveTo(x, y);
    for (let k = 0; k < 14; k++) {
      x += (Math.random() - 0.5) * 26;
      y += 6 + Math.random() * 14;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  /* grain */
  const img = g.getImageData(0, 0, S, S);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 18;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 2);
  return tex;
}

/**
 * Leaded glass: diamond quarries held in lead cames. Drawn with alpha, so the
 * glass itself is almost clear and the lead is what reads — a window you are
 * looking *through*, not at.
 */
function leadingTexture() {
  const W = 512;
  const H = Math.round(W * ((JAMB_H + ARCH_R) / WIN_W));
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  if (!g) return null;
  /* the glass: a faint warm film, thicker toward the bottom where old glass sags */
  const film = g.createLinearGradient(0, 0, 0, H);
  film.addColorStop(0, "rgba(255,236,200,0.02)");
  film.addColorStop(1, "rgba(255,226,180,0.07)");
  g.fillStyle = film;
  g.fillRect(0, 0, W, H);
  /* the diamonds */
  const q = W / 7;
  g.strokeStyle = "rgba(24,18,12,0.92)";
  g.lineWidth = 3.2;
  for (let k = -H; k < W + H; k += q) {
    g.beginPath();
    g.moveTo(k, 0);
    g.lineTo(k + H * 0.62, H);
    g.stroke();
    g.beginPath();
    g.moveTo(k, 0);
    g.lineTo(k - H * 0.62, H);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** the soft wedge of evening light falling from the opening onto the desk */
function shaftTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 256;
  const g = c.getContext("2d");
  if (!g) return null;
  const v = g.createLinearGradient(0, 0, 0, 256);
  v.addColorStop(0, "rgba(255,210,150,0.9)");
  v.addColorStop(1, "rgba(255,210,150,0)");
  g.fillStyle = v;
  g.fillRect(0, 0, 64, 256);
  /* soften the long edges so it is a haze and not a slab */
  const h = g.createLinearGradient(0, 0, 64, 0);
  h.addColorStop(0, "rgba(0,0,0,1)");
  h.addColorStop(0.3, "rgba(0,0,0,0)");
  h.addColorStop(0.7, "rgba(0,0,0,0)");
  h.addColorStop(1, "rgba(0,0,0,1)");
  g.globalCompositeOperation = "destination-out";
  g.fillStyle = h;
  g.fillRect(0, 0, 64, 256);
  return new THREE.CanvasTexture(c);
}

const noRaycast = () => null;

export default function Window() {
  const town = useTexture("/town-heidelberg-1620.jpg");

  const built = useMemo(() => {
    town.colorSpace = THREE.SRGBColorSpace;
    town.anisotropy = 8;

    const group = new THREE.Group();
    group.position.set(WIN_X, SILL_Y, WALL_Z);

    /* ---- the wall, with the opening cut out of it ---- */
    const wallShape = new THREE.Shape();
    wallShape.moveTo(-3, -SILL_Y - 0.02);
    wallShape.lineTo(3, -SILL_Y - 0.02);
    wallShape.lineTo(3, 2.2);
    wallShape.lineTo(-3, 2.2);
    wallShape.lineTo(-3, -SILL_Y - 0.02);
    wallShape.holes.push(archPath(new THREE.Path(), WIN_W + STONE * 2, JAMB_H));
    const plaster = plasterTexture();
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x8a7258,
      map: plaster ?? undefined,
      roughness: 0.96,
      metalness: 0,
    });
    const wall = new THREE.Mesh(new THREE.ShapeGeometry(wallShape, 48), wallMat);
    /* the shape's uv is its xy in metres; the texture repeats per metre-ish */
    wall.receiveShadow = true;
    group.add(wall);

    /* ---- dressed stone surround: the arch ring, standing proud ---- */
    const ringShape = archPath(new THREE.Shape(), WIN_W + STONE * 2, JAMB_H);
    ringShape.holes.push(archPath(new THREE.Path(), WIN_W, JAMB_H));
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x9a8568, roughness: 0.88, metalness: 0 });
    const ring = new THREE.Mesh(
      new THREE.ExtrudeGeometry(ringShape, {
        depth: PROUD,
        bevelEnabled: true,
        bevelThickness: 0.006,
        bevelSize: 0.006,
        bevelSegments: 2,
        curveSegments: 40,
      }),
      stoneMat,
    );
    ring.castShadow = true;
    ring.receiveShadow = true;
    group.add(ring);

    /* the reveal: the depth of the wall, seen round the inside of the opening */
    const revealShape = archPath(new THREE.Shape(), WIN_W, JAMB_H);
    const reveal = new THREE.Mesh(
      new THREE.ExtrudeGeometry(revealShape, { depth: 0.22, bevelEnabled: false, curveSegments: 40 }),
      [
        /* caps: none — the front would cover the view */
        new THREE.MeshBasicMaterial({ visible: false }),
        new THREE.MeshStandardMaterial({ color: 0x5e4c3a, roughness: 0.95, side: THREE.BackSide }),
      ],
    );
    reveal.position.z = -0.22;
    reveal.receiveShadow = true;
    group.add(reveal);

    /* the sill: a slab of the same stone, deeper than the surround */
    const sill = new THREE.Mesh(new THREE.BoxGeometry(WIN_W + STONE * 3.2, 0.03, 0.13), stoneMat);
    sill.position.set(0, -0.012, 0.03);
    sill.castShadow = true;
    sill.receiveShadow = true;
    group.add(sill);

    /* stone mullion and transom, splitting the light into four the way a
       seventeenth-century study window would be */
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.022, JAMB_H + ARCH_R * 0.96, 0.03), stoneMat);
    mullion.position.set(0, (JAMB_H + ARCH_R * 0.96) / 2, -0.1);
    group.add(mullion);
    const transom = new THREE.Mesh(new THREE.BoxGeometry(WIN_W, 0.02, 0.03), stoneMat);
    transom.position.set(0, JAMB_H * 0.62, -0.1);
    group.add(transom);

    /* ---- the glass ---- */
    const lead = leadingTexture();
    const glassGeo = new THREE.ShapeGeometry(archPath(new THREE.Shape(), WIN_W, JAMB_H), 40);
    /* ShapeGeometry's uv is raw xy; normalise it to the opening's box */
    const uv = glassGeo.attributes.uv as THREE.BufferAttribute;
    const pos = glassGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, (pos.getX(i) + WIN_W / 2) / WIN_W, pos.getY(i) / (JAMB_H + ARCH_R));
    }
    const glassMat = new THREE.MeshBasicMaterial({
      map: lead ?? undefined,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      color: 0xffffff,
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.z = -0.1;
    group.add(glass);

    /* ---- outside: the sky, and the town standing in it ---- */
    const skyMat = new THREE.MeshBasicMaterial({ color: SKY, fog: false, toneMapped: false });
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(9, 5), skyMat);
    sky.position.set(0, 1.2, -TOWN_BACK - 0.3);
    group.add(sky);

    /* sized so the opening never shows the plate's edge from any shut framing */
    const TOWN_W = 4.2;
    const img = town.image as { width: number; height: number } | undefined;
    const aspect = img ? img.width / img.height : 2.6;
    const townMat = new THREE.MeshBasicMaterial({ map: town, fog: false, toneMapped: false });
    const townMesh = new THREE.Mesh(new THREE.PlaneGeometry(TOWN_W, TOWN_W / aspect), townMat);
    /* The camera looks *down* through the opening, so the line of sight
       through the middle of it lands well below the sill by the time it
       reaches the plate. Dropped so that line meets the old town and the
       river, with the hills and the sky filling the arch above. */
    townMesh.position.set(-0.3, 0.08, -TOWN_BACK);
    group.add(townMesh);

    /* ---- the evening coming in ---- */
    const shaftTex = shaftTexture();
    const shaftMat = new THREE.MeshBasicMaterial({
      map: shaftTex ?? undefined,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      toneMapped: false,
      fog: false,
    });
    /* a plane leaning out of the opening and down across the desk */
    const shaft = new THREE.Mesh(new THREE.PlaneGeometry(WIN_W * 0.9, 0.9), shaftMat);
    shaft.position.set(-0.04, 0.2, 0.36);
    shaft.rotation.set(-1.05, 0, 0.12);
    group.add(shaft);

    /* and the light itself: low, warm, off the sky — no shadow map, the lamp
       already casts the shadows the eye is reading */
    const dusk = new THREE.SpotLight(0xffc98e, 0, 3, 0.7, 0.9, 2);
    dusk.position.set(0, JAMB_H * 0.8, -0.35);
    dusk.target.position.set(-0.05, -SILL_Y, 0.75);
    /* its intensity is driven here; the room dimmer (room.ts) must not also
       take it over, or it would pin it at whatever it read first */
    dusk.userData.boot = true;
    group.add(dusk, dusk.target);

    group.traverse((o) => {
      (o as THREE.Mesh).raycast = noRaycast;
    });

    return { group, townMat, skyMat, glassMat, shaftMat, dusk, lit: -1 };
  }, [town]);

  useEffect(() => {
    const { group } = built;
    return () => {
      group.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        for (const m of mats) {
          (m as THREE.MeshBasicMaterial).map?.dispose();
          m.dispose();
        }
      });
    };
  }, [built]);

  useFrame(() => {
    /* only while the wall can be in shot */
    const here = bookScroll.close > 0.02;
    built.group.visible = here;
    if (!here) return;

    /* While the binding is still arriving the room is dark and the lamp is the
       light it is read by, so the town is deep in dusk; it comes up with the
       room. Written only when it changes: this runs every frame. */
    const lit = 0.42 + 0.58 * (boot.active ? boot.dawn : 1);
    if (Math.abs(lit - built.lit) < 1e-3) return;
    built.lit = lit;
    built.townMat.color.setScalar(lit);
    built.skyMat.color.copy(SKY).multiplyScalar(lit);
    built.glassMat.opacity = 0.6 + 0.4 * lit;
    built.shaftMat.opacity = 0.075 * lit;
    built.dusk.intensity = 0.55 * lit;
  });

  return <primitive object={built.group} />;
}
