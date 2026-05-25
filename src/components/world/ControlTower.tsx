import type {} from "@react-three/fiber";
import { palette } from "@/lib/palette";

export default function ControlTower() {
  return (
    <group>
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 2.5, 16]} />
        <meshStandardMaterial color={palette.terminal} roughness={0.7} metalness={0} />
      </mesh>
      <mesh position={[0, 2.4, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.1, 16]} />
        <meshStandardMaterial color={palette.orchestrator} roughness={0.5} metalness={0} />
      </mesh>
      <mesh position={[0, 2.7, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.4, 6]} />
        <meshStandardMaterial color={palette.night800} roughness={0.6} metalness={0} />
      </mesh>
    </group>
  );
}
