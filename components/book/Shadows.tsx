"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { HorizontalBlurShader } from "three/examples/jsm/shaders/HorizontalBlurShader.js";
import { VerticalBlurShader } from "three/examples/jsm/shaders/VerticalBlurShader.js";
import { shadowWork } from "./state";

/**
 * Every shadow in the scene, drawn only when it can have changed.
 *
 * drei's <ContactShadows> re-renders the whole scene from below and blurs it
 * four times on every frame, and three redraws every shadow map on every frame
 * too. On a demand loop that would be fine if frames were only ever asked for
 * by movement — but the landing asks for thirty a second to animate steam, and
 * nothing that casts moves at all. So this owns both: the renderer's shadow
 * maps are switched to manual, and they and the contact shadow are redrawn
 * only while `shadowWork` says a caster may have moved.
 *
 * The contact shadow is drei's, ported as it was, plus the gate and a list of
 * things to leave out of it (the steam: sprites are not shadow casters, but
 * drawn with the depth override they printed a smudge that would now freeze).
 */

/** objects kept out of the contact shadow; registered by whoever builds them */
export const contactSkip: THREE.Object3D[] = [];

type Props = {
  position: [number, number, number];
  scale: number;
  resolution: number;
  far: number;
  blur: number;
  opacity: number;
  color: string;
};

export default function Shadows({ position, scale, resolution, far, blur, opacity, color }: Props) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  const kit = useMemo(() => {
    const target = new THREE.WebGLRenderTarget(resolution, resolution);
    const targetBlur = new THREE.WebGLRenderTarget(resolution, resolution);
    target.texture.generateMipmaps = targetBlur.texture.generateMipmaps = false;
    const plane = new THREE.PlaneGeometry(scale, scale).rotateX(Math.PI / 2);
    const blurPlane = new THREE.Mesh(plane);
    const depth = new THREE.MeshDepthMaterial();
    depth.depthTest = depth.depthWrite = false;
    depth.onBeforeCompile = (shader) => {
      shader.uniforms = { ...shader.uniforms, ucolor: { value: new THREE.Color(color) } };
      shader.fragmentShader = shader.fragmentShader.replace(
        "void main() {",
        "uniform vec3 ucolor;\nvoid main() {",
      );
      /* colour the shadow, and let its middle stay darker than its falloff */
      shader.fragmentShader = shader.fragmentShader.replace(
        "vec4( vec3( 1.0 - fragCoordZ ), opacity );",
        "vec4( ucolor * fragCoordZ * 2.0, ( 1.0 - fragCoordZ ) * 1.0 );",
      );
    };
    const hBlur = new THREE.ShaderMaterial(HorizontalBlurShader);
    const vBlur = new THREE.ShaderMaterial(VerticalBlurShader);
    hBlur.depthTest = vBlur.depthTest = false;
    const camera = new THREE.OrthographicCamera(-scale / 2, scale / 2, scale / 2, -scale / 2, 0, far);
    const shown = new THREE.MeshBasicMaterial({
      transparent: true,
      map: target.texture,
      opacity,
      depthWrite: false,
    });
    const group = new THREE.Group();
    group.position.set(...position);
    group.rotation.x = Math.PI / 2;
    const mesh = new THREE.Mesh(plane, shown);
    mesh.scale.set(1, -1, 1);
    mesh.rotation.x = -Math.PI / 2;
    group.add(mesh, camera);
    return { target, targetBlur, plane, blurPlane, depth, hBlur, vBlur, camera, shown, group, mesh };
    /* built once: every prop is a constant at the one call site */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      kit.target.dispose();
      kit.targetBlur.dispose();
      kit.plane.dispose();
      kit.depth.dispose();
      kit.hBlur.dispose();
      kit.vBlur.dispose();
      kit.shown.dispose();
    };
  }, [kit]);

  /* Hand the renderer's shadow maps over to the gate. `onBeforeRender` runs
     inside gl.render ahead of the shadow pass, after every useFrame has had
     its say — so a caster moved by any of them this frame is counted. Only the
     frame's own render counts; the contact shadow's pass below renders the
     scene into a target and must not spend the budget. */
  useEffect(() => {
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    const before = scene.onBeforeRender;
    const after = scene.onAfterRender;
    scene.onBeforeRender = (renderer, _scene, _camera, target) => {
      if (target === null) renderer.shadowMap.needsUpdate = shadowWork.left > 0;
    };
    scene.onAfterRender = (renderer) => {
      if (renderer.getRenderTarget() === null && shadowWork.left > 0) shadowWork.left--;
    };
    return () => {
      gl.shadowMap.autoUpdate = true;
      scene.onBeforeRender = before;
      scene.onAfterRender = after;
    };
  }, [gl, scene]);

  const blurPass = (amount: number) => {
    const { blurPlane, hBlur, vBlur, target, targetBlur, camera } = kit;
    blurPlane.visible = true;
    blurPlane.material = hBlur;
    hBlur.uniforms.tDiffuse.value = target.texture;
    hBlur.uniforms.h.value = amount / 256;
    gl.setRenderTarget(targetBlur);
    gl.render(blurPlane, camera);
    blurPlane.material = vBlur;
    vBlur.uniforms.tDiffuse.value = targetBlur.texture;
    vBlur.uniforms.v.value = amount / 256;
    gl.setRenderTarget(target);
    gl.render(blurPlane, camera);
    blurPlane.visible = false;
  };

  useFrame(() => {
    if (shadowWork.left <= 0) return;
    const background = scene.background;
    const override = scene.overrideMaterial;
    const skipped = contactSkip.map((o) => o.visible);
    for (const o of contactSkip) o.visible = false;
    kit.group.visible = false;
    scene.background = null;
    scene.overrideMaterial = kit.depth;
    /* the contact shadow has nothing to do with the light shadows; do not
       let this pass redraw them */
    const maps = gl.shadowMap.needsUpdate;
    gl.shadowMap.needsUpdate = false;
    gl.setRenderTarget(kit.target);
    gl.render(scene, kit.camera);
    blurPass(blur);
    blurPass(blur * 0.4);
    gl.setRenderTarget(null);
    gl.shadowMap.needsUpdate = maps;
    kit.group.visible = true;
    scene.overrideMaterial = override;
    scene.background = background;
    contactSkip.forEach((o, i) => (o.visible = skipped[i]));
  });

  return <primitive object={kit.group} />;
}
