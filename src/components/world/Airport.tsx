import type {} from "@react-three/fiber";
import * as THREE from "three";
import { palette } from "@/lib/palette";
import ControlTower from "./ControlTower";

const WINDOW_X_POSITIONS = [-3.4, -2.55, -1.7, -0.85, 0, 0.85, 1.7, 2.55, 3.4];
const GATE_X_POSITIONS = [-2.55, 0, 2.55];

const RUNWAY_LENGTH = 14;
const RUNWAY_WIDTH = 2.5;
const RUNWAY_DASH_OFFSETS = [-5.6, -4.2, -2.8, -1.4, 0, 1.4, 2.8, 4.2, 5.6];
const PIANO_KEY_X_OFFSETS = [-1.0, -0.6, -0.2, 0.2, 0.6, 1.0];
const PIANO_KEY_Z_END = RUNWAY_LENGTH / 2 - 0.3;
const RUNWAY2_ANGLE = -(50 * Math.PI) / 180;

const PARKING_VERT_X = [-4.5, -3.5, -2.5, -1.5, -0.5];
const PARKING_HORIZ_Z = [-5.5, -4.5, -3.5, -2.5];

const TAXIWAY_CURVES = [
  new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.55, 0.025, 2.72),
    new THREE.Vector3(-2.55, 0.025, 4.25),
    new THREE.Vector3(-2.04, 0.025, 5.61),
    new THREE.Vector3(-1.02, 0.025, 7.0),
  ]),
  new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.025, 2.72),
    new THREE.Vector3(0.34, 0.025, 3.91),
    new THREE.Vector3(0.68, 0.025, 5.1),
    new THREE.Vector3(0.85, 0.025, 6.46),
  ]),
  new THREE.CatmullRomCurve3([
    new THREE.Vector3(2.55, 0.025, 2.72),
    new THREE.Vector3(2.55, 0.025, 4.25),
    new THREE.Vector3(2.04, 0.025, 5.61),
    new THREE.Vector3(1.02, 0.025, 7.0),
  ]),
];

type TaxiwaySegment = {
  position: [number, number, number];
  rotation: [number, number, number];
  length: number;
};

const TAXIWAY_SEGMENTS: TaxiwaySegment[] = TAXIWAY_CURVES.flatMap((curve) => {
  const pts = curve.getPoints(32);
  return pts.slice(0, -1).map((p1, i) => {
    const p2 = pts[i + 1];
    const dx = p2.x - p1.x;
    const dz = p2.z - p1.z;
    return {
      position: [(p1.x + p2.x) / 2, p1.y, (p1.z + p2.z) / 2],
      rotation: [0, Math.atan2(dx, dz), 0],
      length: Math.hypot(dx, dz),
    };
  });
});

function Runway() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[RUNWAY_WIDTH, 0.05, RUNWAY_LENGTH]} />
        <meshStandardMaterial color={palette.night950} roughness={0.9} metalness={0} />
      </mesh>
      {[-RUNWAY_WIDTH / 2, RUNWAY_WIDTH / 2].map((xOff) => (
        <mesh key={`edge-${xOff}`} position={[xOff, 0.035, 0]}>
          <boxGeometry args={[0.05, 0.02, RUNWAY_LENGTH]} />
          <meshStandardMaterial color={palette.ink100} roughness={0.8} metalness={0} />
        </mesh>
      ))}
      {RUNWAY_DASH_OFFSETS.map((zOff) => (
        <mesh key={`dash-${zOff}`} position={[0, 0.035, zOff]}>
          <boxGeometry args={[0.17, 0.02, 1.0]} />
          <meshStandardMaterial color={palette.ink100} roughness={0.8} metalness={0} />
        </mesh>
      ))}
      {[-1, 1].flatMap((endSign) =>
        PIANO_KEY_X_OFFSETS.map((xOff) => (
          <mesh key={`pk-${endSign}-${xOff}`} position={[xOff, 0.035, endSign * PIANO_KEY_Z_END]}>
            <boxGeometry args={[0.15, 0.02, 0.4]} />
            <meshStandardMaterial color={palette.ink100} roughness={0.8} metalness={0} />
          </mesh>
        ))
      )}
    </group>
  );
}

export default function Airport() {
  return (
    <group>
      {/* Apron — dark tarmac under the gate area */}
      <mesh position={[0, 0.024, 3.45]}>
        <boxGeometry args={[7, 0.05, 3.5]} />
        <meshStandardMaterial color={palette.night950} roughness={0.9} metalness={0} />
      </mesh>

      {/* Parking lot (land-side, behind terminal on left) */}
      <group>
        <mesh position={[-2.5, 0.0235, -4]}>
          <boxGeometry args={[4, 0.05, 3]} />
          <meshStandardMaterial color={palette.night900} roughness={0.9} metalness={0} />
        </mesh>
        {PARKING_VERT_X.map((x) => (
          <mesh key={`pv-${x}`} position={[x, 0.05, -4]}>
            <boxGeometry args={[0.03, 0.005, 3]} />
            <meshStandardMaterial color={palette.ink100} roughness={0.8} metalness={0} />
          </mesh>
        ))}
        {PARKING_HORIZ_Z.map((z) => (
          <mesh key={`ph-${z}`} position={[-2.5, 0.05, z]}>
            <boxGeometry args={[4, 0.005, 0.03]} />
            <meshStandardMaterial color={palette.ink100} roughness={0.8} metalness={0} />
          </mesh>
        ))}
      </group>

      {/* Main terminal */}
      <group>
        <mesh position={[0, 0.85, 0]}>
          <boxGeometry args={[8.5, 1.7, 3.4]} />
          <meshStandardMaterial color={palette.terminal} roughness={0.7} metalness={0} />
        </mesh>
        <mesh position={[0, 1.7, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.7, 1.7, 8.5, 32]} />
          <meshStandardMaterial color={palette.terminal} roughness={0.7} metalness={0} />
        </mesh>
        <mesh position={[0, 0.935, 0]}>
          <boxGeometry args={[8.55, 0.17, 3.45]} />
          <meshStandardMaterial color={palette.orchestrator} roughness={0.5} metalness={0} />
        </mesh>
      </group>

      {/* Window strips on front and back */}
      <group>
        {WINDOW_X_POSITIONS.map((x) => (
          <mesh key={`win-front-${x}`} position={[x, 1.326, 1.71]}>
            <boxGeometry args={[0.51, 0.255, 0.02]} />
            <meshStandardMaterial color={palette.night950} roughness={0.6} metalness={0} />
          </mesh>
        ))}
        {WINDOW_X_POSITIONS.map((x) => (
          <mesh key={`win-back-${x}`} position={[x, 1.326, -1.71]}>
            <boxGeometry args={[0.51, 0.255, 0.02]} />
            <meshStandardMaterial color={palette.night950} roughness={0.6} metalness={0} />
          </mesh>
        ))}
      </group>

      {/* Gates / jetbridges */}
      <group>
        {GATE_X_POSITIONS.map((x) => (
          <mesh key={`gate-${x}`} position={[x, 0.34, 2.21]}>
            <boxGeometry args={[0.68, 0.68, 1.02]} />
            <meshStandardMaterial color={palette.terminal} roughness={0.7} metalness={0} />
          </mesh>
        ))}
      </group>

      {/* Entrance canopy */}
      <group>
        <mesh position={[0, 1.19, -2.38]}>
          <boxGeometry args={[2.55, 0.085, 1.36]} />
          <meshStandardMaterial color={palette.terminal} roughness={0.7} metalness={0} />
        </mesh>
        <mesh position={[-1.02, 0.595, -2.975]}>
          <cylinderGeometry args={[0.085, 0.085, 1.19, 12]} />
          <meshStandardMaterial color={palette.terminal} roughness={0.7} metalness={0} />
        </mesh>
        <mesh position={[1.02, 0.595, -2.975]}>
          <cylinderGeometry args={[0.085, 0.085, 1.19, 12]} />
          <meshStandardMaterial color={palette.terminal} roughness={0.7} metalness={0} />
        </mesh>
      </group>

      {/* Second terminal wing — perpendicular L on right-back */}
      <group>
        <mesh position={[3, 0.85, -2]}>
          <boxGeometry args={[2, 1.7, 4.25]} />
          <meshStandardMaterial color={palette.terminal} roughness={0.7} metalness={0} />
        </mesh>
        <mesh position={[3, 1.7, -2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1, 1, 4.25, 32]} />
          <meshStandardMaterial color={palette.terminal} roughness={0.7} metalness={0} />
        </mesh>
      </group>

      {/* Hangar */}
      <mesh position={[-7, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[2.125, 2.125, 5.1, 24]} />
        <meshStandardMaterial color={palette.night800} roughness={0.8} metalness={0} />
      </mesh>

      {/* Control tower (scaled 1.7x for visual proportion to bigger terminal) */}
      <group position={[6, 0, -0.85]} scale={1.7}>
        <ControlTower />
      </group>

      {/* Main runway */}
      <group position={[0, 0.025, 12]}>
        <Runway />
      </group>

      {/* Second runway — past hangar, rotated -50° (adjusted from proposed center to avoid hangar overlap) */}
      <group position={[-13, 0.025, -3]} rotation={[0, RUNWAY2_ANGLE, 0]}>
        <Runway />
      </group>

      {/* Curved taxiways from gates to main runway */}
      <group>
        {TAXIWAY_SEGMENTS.map((seg, i) => (
          <mesh key={i} position={seg.position} rotation={seg.rotation}>
            <boxGeometry args={[1.36, 0.05, seg.length + 0.02]} />
            <meshStandardMaterial color={palette.night950} roughness={0.9} metalness={0} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
