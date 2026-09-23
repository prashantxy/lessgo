"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { boot } from "./boot";
import { ROOM_DIP, ROOM_NIGHT, applyRoom, readRoom, restoreRoom } from "./room";
import { lampSwitch } from "./lampSwitch";
import { bookScroll, wake } from "./state";

/**
 * The lamp on the desk.
 *
 * Furniture, not a loading screen: it stands *behind* the shut book, turned a
 * quarter turn so the arm reaches forward over the board, and is what the
 * title page is read by. Behind and not beside, because beside is a shape a
 * phone cannot hold — a lamp on the left and a book on the right want a
 * landscape frame, and in portrait one or the other is always off the edge.
 * Over the top of the book the pair stack the way the frame does.
 *
 * It goes as the covers lift — an open book is read by the room, and an
 * anglepoise leaning over a spread would be in front of the writing — and
 * comes back if you scroll up to the board.
 *
 * Built out of primitives rather than shipped as a GLB. The binding is already
 * 3.3 MB and a second download in front of it would be the scenery making the
 * page slower; this is about 40 lines of trigonometry and one draw call each.
 *
 * Lit the way the Stack Overflow answer says to light a GLB — an environment
 * map doing the work, ACESFilmic tone mapping, exposure lifted — which the
 * canvas already sets up. The one thing to know is that the scene is authored
 * in metres with `decay: 2`, so a spot 35 cm off the cover divides by 0.12:
 * every intensity from 2.4 down to 0.12 looked identical because all of them
 * were past the top of the tone curve. 0.07 is the one that reads.
 */

const UP = new THREE.Vector3(0, 1, 0);

/* the geometry of an anglepoise, in metres, so it stands beside a 284 mm book */
const BASE_R = 0.062;
const PIVOT_Y = 0.023;
const LOWER_LEN = 0.2;
const LOWER_TILT = 0.24; // radians from vertical, leaning toward the book
const UPPER_LEN = 0.17;
const UPPER_TILT = 1.08; // the reach over the desk
const SHADE_R = 0.062;
const SHADE_H = 0.088;
const SHADE_TILT = 0.2; // how far the mouth is tipped off straight-down

/**
 * Where it stands, in world metres.
 *
 * `CENTRE` is where the shut book sits — `2·BOARD_IN + BOARD_W/2` off the
 * model's own dimensions, which are fixed in the GLB. It is a constant here
 * rather than a prop because the lamp has to be on the desk and lit while the
 * binding those dimensions come from is still downloading.
 *
 * `LAMP_BACK` is how far behind the book's middle it stands: far enough that
 * the base is clear of the board, close enough that the shade — which reaches
 * about 16 cm forward of it — hangs just over the book's top edge.
 */
const CENTRE = 0.155;
/**
 * Far enough back that the front board clears it.
 *
 * The board is hinged at the spine and swings up through a 20 cm arc as the
 * covers lift, and at the x the shade used to hang at it passes through y=0.18
 * — which was exactly the height of the shade's mouth. The board sweeps in a
 * plane, so the fix is depth, not height: at 0.33 the shade sits behind the
 * book's own back edge and nothing the binding does can reach it.
 */
export const LAMP_BACK = 0.33;
const LAMP_SCALE = 0.92;
/** stood off to the right, so the arm crosses the board on a diagonal */
const LAMP_OFF = 0.1;
/**
 * A quarter turn plus a little.
 *
 * The quarter turn is what takes it out of the frame's way — the arm reaches
 * out of the back of the desk instead of across it, which is the only shape a
 * portrait frame can hold. The extra 34° is because a lamp reaching straight
 * at the camera is a cone with a rod behind it: the arm's whole length is
 * foreshortened to nothing and the thing stops reading as a lamp. Swung round,
 * the arm crosses the board on a diagonal and the shade still ends up over the
 * book's top edge.
 */
const LAMP_TURN = -Math.PI / 2 - 0.6;
/** how tall it stands, for the camera to frame it by */
export const LAMP_TOP = 0.3 * LAMP_SCALE;

/** a point along a limb: `at` metres from `from` in direction `tilt` off vertical */
function along(from: THREE.Vector3, tilt: number, at: number) {
  return new THREE.Vector3(from.x + Math.sin(tilt) * at, from.y + Math.cos(tilt) * at, from.z);
}

function buildLamp() {
  const group = new THREE.Group();
  group.position.set(CENTRE + LAMP_OFF, 0, -LAMP_BACK);
  group.scale.setScalar(LAMP_SCALE);
  /* the arm is authored leaning toward local +x; see LAMP_TURN */
  group.rotation.y = LAMP_TURN;

  /* `envMapIntensity` well above 1 is the whole of the answer to the question
     this was built from: metal has almost no diffuse term, so a polished brass
     lamp lit by lamps is a black silhouette — what makes it read is the
     environment it reflects. */
  /* the same brass the binding's own clasps and corner bosses are tinted to
     in BookScene's scene prep — two different brasses on one desk read as a
     mistake, and this one is the newcomer */
  const brass = new THREE.MeshStandardMaterial({
    color: 0x9c7b3c,
    metalness: 0.85,
    /* softer than the binding's clasps: this is a turned and lacquered lamp,
       not polished furniture, and at 0.42 the shade's highlight came out as
       one blown band across the cone */
    roughness: 0.5,
  });
  const iron = new THREE.MeshStandardMaterial({
    color: 0x3c3227,
    metalness: 0.7,
    roughness: 0.55,
  });
  /* the inside of the shade and the bulb are the only things here making
     light, so they are the only things exempt from tone mapping — otherwise
     the exposure that makes the brass read pulls the filament grey */
  const filament = new THREE.MeshStandardMaterial({
    color: 0xfff4dc,
    emissive: 0xffce86,
    emissiveIntensity: 2.2,
    roughness: 0.4,
    toneMapped: false,
  });
  const inner = new THREE.MeshStandardMaterial({
    color: 0xffe9c4,
    emissive: 0xffc27a,
    emissiveIntensity: 0.9,
    roughness: 0.75,
    side: THREE.BackSide,
    toneMapped: false,
  });
  const materials = [brass, iron, filament, inner];

  /* ---- the joints ---- */
  const foot = new THREE.Vector3(0, PIVOT_Y, 0);
  const elbow = along(foot, LOWER_TILT, LOWER_LEN);
  const wrist = along(elbow, UPPER_TILT, UPPER_LEN);
  /* the shade hangs off the wrist: apex at the joint, mouth down and forward */
  const axis = new THREE.Vector3(-Math.sin(SHADE_TILT), Math.cos(SHADE_TILT), 0);
  const shadeQ = new THREE.Quaternion().setFromUnitVectors(UP, axis);
  const shadeAt = wrist.clone().addScaledVector(axis, -SHADE_H / 2);
  const mouth = wrist.clone().addScaledVector(axis, -SHADE_H);
  const bulbAt = mouth.clone().addScaledVector(axis, 0.03);

  const add = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    at: THREE.Vector3,
    rot?: THREE.Quaternion | number,
  ) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(at);
    if (rot instanceof THREE.Quaternion) mesh.quaternion.copy(rot);
    else if (typeof rot === "number") mesh.rotation.z = rot;
    /* scenery: never a shadow caster. It *is* raycast, but only ever by the
       pen cursor's own raycaster in Essentials — `.stage` takes no pointer
       events, so nothing else in the app can hit it. */
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    group.add(mesh);
    return mesh;
  };

  add(new THREE.CylinderGeometry(BASE_R * 0.84, BASE_R, 0.016, 48), iron, new THREE.Vector3(0, 0.008, 0));
  add(
    new THREE.TorusGeometry(BASE_R * 0.92, 0.005, 12, 48),
    brass,
    new THREE.Vector3(0, 0.005, 0),
    new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2),
  );
  add(new THREE.SphereGeometry(0.015, 24, 16), brass, foot);
  add(new THREE.CylinderGeometry(0.0055, 0.0065, LOWER_LEN, 20), brass, foot.clone().lerp(elbow, 0.5), -LOWER_TILT);
  add(new THREE.SphereGeometry(0.0135, 24, 16), brass, elbow);
  add(new THREE.CylinderGeometry(0.005, 0.0055, UPPER_LEN, 20), brass, elbow.clone().lerp(wrist, 0.5), -UPPER_TILT);
  add(new THREE.SphereGeometry(0.0115, 24, 16), brass, wrist);

  const shade = add(new THREE.ConeGeometry(SHADE_R, SHADE_H, 44, 1, true), brass, shadeAt, shadeQ);
  (shade.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
  add(new THREE.ConeGeometry(SHADE_R * 0.97, SHADE_H * 0.96, 44, 1, true), inner, shadeAt, shadeQ);
  add(
    new THREE.TorusGeometry(SHADE_R, 0.0032, 10, 48),
    brass,
    mouth,
    shadeQ.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2)),
  );
  add(new THREE.SphereGeometry(0.017, 24, 18), filament, bulbAt);

  /* ---- the beam ----
     Not volumetrics: a narrow, faint additive cone hanging under the mouth.
     Fainter than it wants to be, and deliberately — once the spot casts real
     shadows the pool on the blotter is doing this job properly, and anything
     more than a suggestion here reads as a flat grey triangle laid over the
     desk. It is kept because in the scene's own fog it is the difference
     between a lamp and a lamp-shaped ornament, and it costs one draw call. */
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xffc98a,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const beam = new THREE.Mesh(new THREE.ConeGeometry(0.115, 0.25, 32, 1, true), beamMat);
  beam.position.copy(bulbAt).addScaledVector(axis, -0.125);
  beam.quaternion.copy(shadeQ);
  /* the one exception: a cone of light is not a surface to rest a pen on */
  beam.raycast = () => null;
  group.add(beam);

  /* ---- what the lamp actually lights ----
     A spot rather than a point: a point light at the bulb spills backwards
     through the shade and lights the room the shade is there to keep dark. */
  /* Wide enough that the book is inside the pool rather than at the edge of
     it — a spot has to light the thing whose shadow you are meant to see. The
     angle costs nothing in brightness: intensity is candela, so opening the
     cone lights more desk at the same illuminance. */
  const spot = new THREE.SpotLight(0xffd8a2, 0, 2.2, 0.95, 0.62, 2);
  spot.position.copy(bulbAt);
  spot.target.position.copy(bulbAt).addScaledVector(axis, -1);
  spot.add(spot.target);
  /* The one change that makes the desk stop looking pasted together. Nothing
     on it cast a shadow before — the directional light's frustum is sized to
     the book alone — so the mug, the pot and the leaves each sat in their own
     little pool of nothing. This is the light the scene is actually lit by at
     that moment, so it is the one whose shadows the eye is looking for.
     `normalBias` rather than a big `bias`: the lathes are smooth-shaded and a
     flat bias detaches their contact shadows from their own bases. */
  spot.castShadow = true;
  spot.shadow.mapSize.set(1024, 1024);
  spot.shadow.camera.near = 0.04;
  spot.shadow.camera.far = 1.2;
  spot.shadow.bias = -0.0002;
  spot.shadow.normalBias = 0.006;
  /* the room dimmer in Intro.tsx leaves anything flagged here alone */
  spot.userData.boot = true;
  group.add(spot);

  /* the glow on the shade's own brass, which the spot cannot give it */
  const halo = new THREE.PointLight(0xffca8a, 0, 0.26, 2);
  halo.position.copy(bulbAt);
  halo.userData.boot = true;
  group.add(halo);

  return { group, materials, brass, iron, filament, inner, beamMat, spot, halo, lit: 1 };
}

/**
 * The lamp's own body, for the pen cursor to be able to hover over it.
 *
 * A singleton because the cursor lives in Essentials and the lamp is built
 * here, and threading a ref between two siblings of the same canvas through
 * React would put the whole scene through a reconcile to hand over an object
 * that never changes.
 */
export const lampBody: { group: THREE.Group | null } = { group: null };

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const smoothstep = (a: number, b: number, n: number) => {
  const t = clamp01((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};
/** frame-rate independent exponential approach */
const damp = (cur: number, to: number, lambda: number, dt: number) =>
  cur + (to - cur) * (1 - Math.exp(-lambda * dt));

export default function Lamps() {
  const lamp = useMemo(() => {
    const built = buildLamp();
    lampBody.group = built.group;
    return built;
  }, []);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    return () => {
      restoreRoom(scene);
      lampBody.group = null;
      for (const m of lamp.materials) m.dispose();
      lamp.beamMat.dispose();
      lamp.group.traverse((o) => (o as THREE.Mesh).geometry?.dispose?.());
    };
  }, [lamp, scene]);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.1);
    /* 1 with the book shut, and out before the front board is a third of the
       way up: the lamp is what the *board* is lit by, and the moment the book
       starts opening it is in the way of what you came to read. */
    const here = smoothstep(0.62, 0.95, bookScroll.close);

    /* ---- how dark the room is ----
       Owned here because this is the loop that always runs, and because the
       lamp is the reason for it: a desk lamp in a room already lit is an
       ornament, and switching it off has to be the difference between seeing
       the desk and not. It comes back up as the covers lift, which is also
       when the lamp goes — an open book is read by the room. */
    readRoom(scene);
    const dawn = boot.active ? ROOM_DIP + (1 - ROOM_DIP) * boot.dawn : 1;
    const night = 1 - (1 - ROOM_NIGHT) * here;
    applyRoom(scene, Math.min(dawn, night));

    const on = lampSwitch.on ? 1 : 0;
    /* a switch is a switch — but a filament has a moment of cooling in it, and
       cutting the light dead on a click reads as the lamp vanishing */
    lamp.lit = bookScroll.reduced ? on : damp(lamp.lit, on, 24, dt);
    if (Math.abs(lamp.lit - on) > 1e-3) wake();

    lamp.group.visible = here > 0.002;
    if (!lamp.group.visible) return;

    /* The environment is what makes polished brass read, and the room's share
       of it moves by a factor of ten across the landing: dipped for the wait,
       full afterwards. A fixed `envMapIntensity` therefore cannot be right
       twice — at the value that saves the lamp from being a black silhouette
       in the dark room it comes out as blazing gold once the lights are up. So
       it rides the dawn in the opposite direction. */
    const env = 3.4 + (1 - 3.4) * boot.dawn;
    lamp.brass.envMapIntensity = env;
    lamp.iron.envMapIntensity = env * 0.65;

    const drive = lamp.lit * here;
    lamp.filament.emissiveIntensity = 2.2 * drive;
    lamp.inner.emissiveIntensity = 0.9 * drive;
    lamp.spot.intensity = 0.07 * drive;
    lamp.halo.intensity = 0.3 * drive;
    lamp.beamMat.opacity = 0.016 * drive;

    /* the brass fades with the covers, but it does not go out with the switch:
       a lamp that is off is still a lamp standing on the desk */
    for (const m of lamp.materials) {
      m.transparent = here < 0.999;
      m.opacity = here;
    }
    /* and it settles the last few millimetres onto the desk as it arrives */
    lamp.group.position.y = (1 - here) * 0.012;
  });

  return <primitive object={lamp.group} />;
}
