// Exact cutout coordinates measured from each frame PNG's own pixel dimensions.
// Each slot is { x, y, w, h } in the frame image's native pixel space.

export const FRAME_CONFIG = {
  1: {
    src: import.meta.env.BASE_URL + 'frame_1.png',
    canvasW: 305,
    canvasH: 559,
    slots: [
      { x: 39, y: 109, w: 224, h: 259 },
    ],
  },
  2: {
    src: import.meta.env.BASE_URL + 'frame_2.png',
    canvasW: 334,
    canvasH: 650,
    slots: [
      { x: 41, y: 57,  w: 248, h: 178 },
      { x: 42, y: 260, w: 247, h: 206 },
    ],
  },
  3: {
    src: import.meta.env.BASE_URL + 'frame_3.png',
    canvasW: 365,
    canvasH: 734,
    slots: [
      { x: 47, y: 47,  w: 268, h: 157 },
      { x: 47, y: 224, w: 268, h: 167 },
      { x: 48, y: 412, w: 268, h: 191 },
    ],
  },
  4: {
    src: import.meta.env.BASE_URL + 'frame_4.png',
    canvasW: 385,
    canvasH: 920,
    slots: [
      { x: 45, y: 46,  w: 295, h: 171 },
      { x: 45, y: 238, w: 295, h: 171 },
      { x: 45, y: 430, w: 295, h: 169 },
      { x: 46, y: 620, w: 294, h: 182 },
    ],
  },
}

// Draws `frames` (array of canvas elements) into the frame template for the given count.
// Photos are "cover" fit into each slot (fills slot, crops overflow, no stretching).
export function buildFramedStrip(frames, stripCount, frameImg) {
  const config = FRAME_CONFIG[stripCount]
  const out = document.createElement('canvas')
  out.width = config.canvasW
  out.height = config.canvasH
  const ctx = out.getContext('2d')

  // 1. Draw each photo into its slot first (cover-fit crop)
  config.slots.forEach((slot, i) => {
    const photo = frames[i]
    if (!photo) return
    const slotRatio = slot.w / slot.h
    const photoRatio = photo.width / photo.height

    let sx, sy, sw, sh
    if (photoRatio > slotRatio) {
      // photo wider than slot -> crop left/right
      sh = photo.height
      sw = sh * slotRatio
      sy = 0
      sx = (photo.width - sw) / 2
    } else {
      // photo taller than slot -> crop top/bottom
      sw = photo.width
      sh = sw / slotRatio
      sx = 0
      sy = (photo.height - sh) / 2
    }
    ctx.drawImage(photo, sx, sy, sw, sh, slot.x, slot.y, slot.w, slot.h)
  })

  // 2. Draw the frame PNG on top — its opaque border covers photo edges,
  //    transparent cutouts let the photos underneath show through cleanly
  ctx.drawImage(frameImg, 0, 0, config.canvasW, config.canvasH)

  return out
}