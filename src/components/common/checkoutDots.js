// Original four-dot Lottie animation inspired by the loading reference.
export default {
  v: "5.12.2",
  fr: 60,
  ip: 0,
  op: 72,
  w: 120,
  h: 80,
  nm: "Ximo green loading dots",
  ddd: 0,
  assets: [],
  layers: [0, 1, 2, 3].map((dot) => ({
    ddd: 0,
    ind: dot + 1,
    ty: 4,
    nm: `Dot ${dot + 1}`,
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [24 + dot * 24, 40, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: {
        a: 1,
        k: Array.from({ length: 13 }, (_, frame) => {
          const scale = 75 + 25 * Math.cos((frame / 12 - dot / 4) * Math.PI * 2);
          return {
            t: frame * 6,
            s: [scale, scale, 100],
            i: { x: [0.67], y: [1] },
            o: { x: [0.33], y: [0] },
          };
        }),
      },
    },
    shapes: [
      { ty: "el", d: 1, p: { a: 0, k: [0, 0] }, s: { a: 0, k: [14, 14] } },
      { ty: "fl", c: { a: 0, k: [26 / 255, 89 / 255, 59 / 255, 1] }, o: { a: 0, k: 100 }, r: 1 },
    ],
    ip: 0,
    op: 72,
    st: 0,
    bm: 0,
  })),
};
