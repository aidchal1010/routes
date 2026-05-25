"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Ground from "./Ground";
import Airport from "./Airport";
import { palette } from "@/lib/palette";

export default function World() {
  return (
    <Canvas
      camera={{ position: [22, 18, 22], fov: 35, near: 0.1, far: 200 }}
      dpr={[1, 2]}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={[palette.night950]} />
      <ambientLight intensity={0.25} color="#8ea4c2" />
      <directionalLight position={[10, 18, 6]} intensity={1.5} color="#f4f0e8" />
      <Ground />
      <Airport />
      <OrbitControls makeDefault target={[0, 0, 0]} enableDamping />
    </Canvas>
  );
}
