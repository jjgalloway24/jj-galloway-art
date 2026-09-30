import * as THREE from "three";

// small diagonal caution-stripe canvas texture, generated once and reused —
// cheaper and crisper at this scale than a shipped image asset. Shared by
// anything that needs a hazard-stripe surface (out-of-order sign, big red
// button's mounting plate, ...).
export function createStripeTexture() {
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
}
