import { useMemo } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface OutOfOrderSignProps {
  // anchor point the chains hang from — the board dangles below this
  position: THREE.Vector3;
  // counter-rotates the board/text so they still face the camera correctly
  // even though this whole group is a child of (and so shares the rotation
  // of) the archive text node
  orientation?: THREE.Quaternion;
}

const BOARD_WIDTH = 0.4;
const BOARD_HEIGHT = 0.1;
const CHAIN_LENGTH = 0.05;
const CHAIN_INSET = 0.03;

// small diagonal caution-stripe canvas texture, generated once and reused —
// cheaper and crisper at this scale than a shipped image asset
function useStripeTexture() {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#f2c200";
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = "#1a1a1a";
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(Math.PI / 4);
    ctx.translate(-size, -size);
    const stripeWidth = 26;
    for (let x = -size; x < size * 3; x += stripeWidth * 2) {
      ctx.fillRect(x, -size, stripeWidth, size * 4);
    }
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }, []);
}

// a small placard hung from two short chains, tacked up over the word —
// rigidly attached to (and so moves/rotates with) the archive text node
export default function OutOfOrderSign({ position, orientation }: OutOfOrderSignProps) {
  const stripeTexture = useStripeTexture();

  return (
    <group position={position}>
      <group quaternion={orientation}>
        <mesh position={[-BOARD_WIDTH / 2 + CHAIN_INSET, -CHAIN_LENGTH / 2, 0]}>
          <cylinderGeometry args={[0.003, 0.003, CHAIN_LENGTH, 6]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[BOARD_WIDTH / 2 - CHAIN_INSET, -CHAIN_LENGTH / 2, 0]}>
          <cylinderGeometry args={[0.003, 0.003, CHAIN_LENGTH, 6]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.4} />
        </mesh>

        <group position={[0, -CHAIN_LENGTH - BOARD_HEIGHT / 2, 0]}>
          <mesh castShadow receiveShadow>
            <planeGeometry args={[BOARD_WIDTH, BOARD_HEIGHT]} />
            <meshStandardMaterial map={stripeTexture} roughness={0.75} metalness={0.05} />
          </mesh>
          <Text
            position={[0, 0, 0.003]}
            fontSize={0.026}
            font="/fonts/Oswald-Bold.ttf"
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.0025}
            outlineColor="#000000"
          >
            OUT OF ORDER
          </Text>
        </group>
      </group>
    </group>
  );
}
