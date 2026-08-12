import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import Cabinet from "./Cabinet";
import CameraRig, { HOME_POSITION } from "./CameraRig";
import { useCabinet } from "../state/CabinetContext";

export default function Scene() {
  const { opened, close } = useCabinet();

  return (
    <Canvas
      shadows
      camera={{ position: HOME_POSITION.toArray(), fov: 40 }}
      onPointerMissed={() => close()}
    >
      <color attach="background" args={["#14151a"]} />
      <ambientLight intensity={1.375} />
      {/* key light: on the camera's side (matching HOME_POSITION), not the
          far side — it needs to shine toward the text/cabinet from roughly
          where the viewer is, or front-facing surfaces read as backlit */}
      <directionalLight
        position={[-1.0, 1.8, 2.8]}
        intensity={2.75}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[1.2, 1, -1]} intensity={0.875} />
      <Suspense fallback={null}>
        <Cabinet />
        <Environment files="/hdri/sky.exr" background />
      </Suspense>
      <ContactShadows position={[0, -0.02, 0]} opacity={0.5} scale={3} blur={2} far={1} />
      <CameraRig />
      {/* only mounted while closed so it never fights CameraRig's programmatic dolly */}
      {opened === null && (
        <OrbitControls
          target={[0.57, 0.62, 0.15]}
          enablePan={false}
          minDistance={1.8}
          maxDistance={3.6}
          minPolarAngle={Math.PI / 2.6}
          maxPolarAngle={Math.PI / 1.9}
          minAzimuthAngle={-1.05}
          maxAzimuthAngle={-0.15}
        />
      )}
    </Canvas>
  );
}
