// saiko · system rings
export const command = `
ncpu=$(sysctl -n hw.ncpu)
ps -A -o %cpu= | awk -v n=$ncpu '{s+=$1} END {v=s/n; if (v>100) v=100; printf "%.0f\\n", v}'
vm_stat | awk -v total=$(sysctl -n hw.memsize) '/page size of/{ps=$8} /Anonymous pages/{an=$3} /Pages purgeable/{pu=$3} /wired down/{wi=$4} /occupied by compressor/{co=$5} END {printf "%.0f\\n", (an-pu+wi+co)*ps/total*100}'
pmset -g batt | grep -Eo '[0-9]+%' | head -1 | tr -d '%'
pmset -g batt | grep -q "AC Power" && echo ac || echo bat
`;
export const refreshFrequency = 5000;

export const className = `
  left: 13vw;
  bottom: 110px;
`;

const RINGS = [
  { key: "cpu", name: "cpu", r: 62, color: "#ff4d6d" },
  { key: "ram", name: "ram", r: 47, color: "#c4b5fd" },
  { key: "bat", name: "battery", r: 32, color: "#8be3a3" },
];

const css = `
  .ri-card { width: 360px; padding: 20px 22px; border-radius: 18px; box-sizing: border-box;
    background: linear-gradient(135deg, rgba(11,10,26,.86), rgba(29,22,56,.86));
    border: 1px solid #3b2f63; backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
    box-shadow: 0 24px 60px rgba(0,0,0,.55), 0 0 50px rgba(139,111,209,.16);
    font-family: "JetBrainsMono Nerd Font", "JetBrains Mono", Menlo, monospace; color: #efeaff; }
  .ri-lbl { font-size: 13px; letter-spacing: 1.5px; color: #8b7fb8; }
  .ri-lbl b { color: #c4b5fd; font-weight: 500; }
  .ri-row { display: flex; align-items: center; gap: 22px; margin-top: 14px; }
  .ri-svg circle { transition: stroke-dashoffset .8s ease; }
  .ri-leg { flex: 1; }
  .ri-item { display: flex; align-items: baseline; justify-content: space-between; padding: 6px 0;
    border-bottom: 1px solid rgba(59,47,99,.6); }
  .ri-item:last-child { border-bottom: none; }
  .ri-name { font-size: 12px; color: #8b7fb8; display: flex; align-items: center; gap: 8px; }
  .ri-name i { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
  .ri-val { font-size: 20px; font-weight: 700; }
  .ri-val small { font-size: 11px; color: #8b7fb8; font-weight: 400; margin-left: 2px; }
`;

export const render = ({ output }) => {
  const [cpu, ram, bat, power] = (output || "").trim().split("\n");
  const vals = { cpu: +cpu || 0, ram: +ram || 0, bat: +bat || 0 };
  return (
    <div className="ri-card">
      <style>{css}</style>
      <div className="ri-lbl">✦ <b>状態</b> · system</div>
      <div className="ri-row">
        <svg className="ri-svg" width="150" height="150" viewBox="0 0 150 150">
          {RINGS.map((g) => {
            const c = 2 * Math.PI * g.r;
            const v = Math.max(0, Math.min(100, vals[g.key]));
            return (
              <g key={g.key} transform="rotate(-90 75 75)">
                <circle cx="75" cy="75" r={g.r} fill="none" stroke={g.color} strokeOpacity=".15" strokeWidth="11" />
                <circle cx="75" cy="75" r={g.r} fill="none" stroke={g.color} strokeWidth="11" strokeLinecap="round"
                  strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)}
                  style={{ filter: `drop-shadow(0 0 6px ${g.color})` }} />
              </g>
            );
          })}
        </svg>
        <div className="ri-leg">
          {RINGS.map((g) => (
            <div key={g.key} className="ri-item">
              <span className="ri-name"><i style={{ background: g.color }} />{g.name}{g.key === "bat" && power === "ac" ? " ⚡" : ""}</span>
              <span className="ri-val" style={{ color: g.color }}>{vals[g.key]}<small>%</small></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
