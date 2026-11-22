// saiko · terminal card
export const command = `
W=/tmp/ubersicht_weather
if [ -z "$(find $W -mmin -10 2>/dev/null)" ]; then
  curl -s -m 6 'wttr.in/Saint-Petersburg?format=%c%t+(%f)+·+%C&lang=ru' > $W.tmp && [ -s $W.tmp ] && mv $W.tmp $W
fi
echo "$(cat $W 2>/dev/null | head -1 | sed -E 's/[+-]+0°/0°/g')"
uptime | sed -E 's/.*up ([^,]*),.*/\\1/'
df -H /System/Volumes/Data | awk 'NR==2{print $4}'
sysctl -n vm.loadavg | awk '{print $2}'
`;
export const refreshFrequency = 60000;

export const className = `
  right: 2.5vw;
  bottom: 110px;
`;

const css = `
  .tm-card { width: 400px; border-radius: 16px; overflow: hidden; font-size: 14px;
    background: linear-gradient(135deg, rgba(11,10,26,.86), rgba(29,22,56,.86));
    border: 1px solid #3b2f63; backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
    box-shadow: 0 24px 60px rgba(0,0,0,.55), 0 0 50px rgba(139,111,209,.16);
    font-family: "JetBrainsMono Nerd Font", "JetBrains Mono", Menlo, monospace; color: #efeaff; }
  .tm-bar { position: relative; height: 34px; background: #141027; display: flex; align-items: center; padding-left: 16px; }
  .tm-bar i { width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; display: inline-block; }
  .tm-bar span { position: absolute; left: 0; right: 0; text-align: center; color: #8b7fb8; font-size: 13px; }
  .tm-body { padding: 14px 18px 16px; line-height: 1.8; }
  .tm-p { color: #ff4d6d; } .tm-t { color: #c4b5fd; } .tm-c { color: #efeaff; }
  .tm-o { color: #b7a9e6; padding-left: 2px; }
  .tm-ok { color: #8be3a3; } .tm-warn { color: #f5c26b; } .tm-err { color: #ff4d6d; }
  .tm-caret { display: inline-block; width: 9px; height: 16px; background: #c4b5fd; vertical-align: -3px;
    animation: tm-bl 1.1s steps(1) infinite; }
  @keyframes tm-bl { 50% { opacity: 0 } }
`;

const Cmd = ({ c }) => (
  <div><span className="tm-p">❯</span><span className="tm-t"> ~ </span><span className="tm-c">{c}</span></div>
);
const tone = (v, bad, warn) => (v < bad ? "tm-err" : v < warn ? "tm-warn" : "tm-ok");

export const render = ({ output }) => {
  const [weather, up, disk, load] = (output || "").split("\n").map((s) => s.trim());
  return (
    <div className="tm-card">
      <style>{css}</style>
      <div className="tm-bar">
        <i style={{ background: "#ff4d6d" }} /><i style={{ background: "#f5c26b" }} /><i style={{ background: "#8be3a3" }} />
        <span>saiko@night: ~</span>
      </div>
      <div className="tm-body">
        <Cmd c="weather --spb" />
        <div className="tm-o">{weather || "fetching..."}</div>
        <Cmd c="uptime" />
        <div className="tm-o">up {up || "?"}</div>
        <Cmd c="df -h && load" />
        <div className="tm-o">
          disk free <span className="tm-ok">{disk || "?"}</span>  ·  load <span className="tm-ok">{load || "?"}</span>
        </div>
        <div><span className="tm-p">❯</span><span className="tm-t"> ~ </span><span className="tm-caret" /></div>
      </div>
    </div>
  );
};
