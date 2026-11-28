// saiko · calm · terminal panel
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
  right: 80px;
  bottom: 120px;
`;

const css = `
  .ct { width: 440px; padding: 18px 22px 20px; box-sizing: border-box; border-radius: 15px;
    background: rgba(10,17,20,.62); border: 1px solid rgba(255,255,255,.08);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    font-family: "JetBrainsMono Nerd Font", "JetBrains Mono", Menlo, monospace; font-size: 14px; line-height: 1.85; color: #d7e2e4; }
  .ct-dots { margin-bottom: 8px; } .ct-dots i { display: inline-block; width: 9px; height: 9px; margin-right: 8px; border-radius: 50%; background: #3b484c; }
  .ct-p { color: #e8b76a; } .ct-d { color: #6f8a91; } .ct-o { color: #8fa3a8; padding-left: 2px; }
  .ct-a { color: #e8b76a; }
  .ct-caret { display: inline-block; width: 8px; height: 15px; background: #e8b76a; vertical-align: -3px; animation: ct-bl 1.1s steps(1) infinite; }
  @keyframes ct-bl { 50% { opacity: 0 } }
`;

const Cmd = ({ c }) => (<div><span className="ct-d">~ </span><span className="ct-p">❯</span> {c}</div>);

export const render = ({ output }) => {
  const [weather, up, disk, load] = (output || "").split("\n").map((s) => s.trim());
  return (
    <div className="ct">
      <style>{css}</style>
      <div className="ct-dots"><i /><i /><i /></div>
      <Cmd c="weather --spb" />
      <div className="ct-o">{weather || "fetching..."}</div>
      <Cmd c="uptime" />
      <div className="ct-o">up {up || "?"}</div>
      <Cmd c="df -h && load" />
      <div className="ct-o">disk free <span className="ct-a">{disk || "?"}</span>  ·  load <span className="ct-a">{load || "?"}</span></div>
      <div><span className="ct-d">~ </span><span className="ct-p">❯</span> <span className="ct-caret" /></div>
    </div>
  );
};
