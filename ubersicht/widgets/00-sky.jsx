// saiko · night sky: twinkling stars + falling sakura petals
export const command = "echo";
export const refreshFrequency = false;

export const className = `
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  overflow: hidden;
`;

const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();

const stars = Array.from({ length: 46 }, () => ({
  x: rnd() * 100, y: rnd() * 62, r: rnd() < 0.15 ? 1.6 : 0.9,
  d: (rnd() * 4).toFixed(2), t: (2.4 + rnd() * 2.6).toFixed(2),
}));

const petalColors = ["#ffe3f1", "#e9dcff", "#f6d6ec"];
const petals = Array.from({ length: 14 }, (_, i) => ({
  x: 10 + rnd() * 95, s: 0.8 + rnd() * 0.9,
  dur: (16 + rnd() * 14).toFixed(1), delay: (-rnd() * 30).toFixed(1),
  c: petalColors[i % 3],
}));

const css = `
  .sky-star { position: absolute; border-radius: 50%; background: #efeaff;
    box-shadow: 0 0 6px rgba(196,181,253,.8); animation: sky-tw ease-in-out infinite; }
  @keyframes sky-tw { 0%,100% { opacity: .15 } 50% { opacity: .9 } }
  .sky-petal { position: absolute; top: -40px; opacity: 0; animation: sky-fall linear infinite; }
  @keyframes sky-fall {
    0%   { transform: translate(0,0) rotate(0deg); opacity: 0 }
    8%   { opacity: .85 }
    90%  { opacity: .7 }
    100% { transform: translate(-180px, 110vh) rotate(420deg); opacity: 0 }
  }
`;

export const render = () => (
  <div>
    <style>{css}</style>
    {stars.map((s, i) => (
      <div key={"s" + i} className="sky-star" style={{
        left: s.x + "vw", top: s.y + "vh", width: s.r * 2, height: s.r * 2,
        animationDuration: s.t + "s", animationDelay: s.d + "s",
      }} />
    ))}
    {petals.map((p, i) => (
      <svg key={"p" + i} className="sky-petal" width="14" height="14" viewBox="-7 -7 14 14"
        style={{ left: p.x + "vw", animationDuration: p.dur + "s", animationDelay: p.delay + "s",
                 transform: `scale(${p.s})` }}>
        <path d="M0 -5L1.4 -3.5C4.2 -2 5 2.8 0 5.6C-5 2.8-4.2-2-1.4-3.5Z" fill={p.c} />
      </svg>
    ))}
  </div>
);
