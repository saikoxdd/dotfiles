// saiko · clock card
export const command = "date +%s";
export const refreshFrequency = 1000;

export const className = `
  top: 60px;
  right: 2.5vw;
`;

const greet = (h) => {
  if (h < 5)  return ["夜はまだ長い", "the night is still long"];
  if (h < 11) return ["おはよう", "good morning"];
  if (h < 17) return ["集中", "focus mode"];
  if (h < 22) return ["こんばんは", "good evening"];
  return ["夜はまだ長い", "the night is still long"];
};

const css = `
  .ck-card { width: 400px; padding: 22px 26px 20px; border-radius: 18px; box-sizing: border-box;
    background: linear-gradient(135deg, rgba(11,10,26,.86), rgba(29,22,56,.86));
    border: 1px solid #3b2f63; backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
    box-shadow: 0 24px 60px rgba(0,0,0,.55), 0 0 50px rgba(139,111,209,.16);
    font-family: "JetBrainsMono Nerd Font", "JetBrains Mono", Menlo, monospace; color: #efeaff; }
  .ck-head { display: flex; justify-content: space-between; align-items: center; }
  .ck-lbl { font-size: 13px; letter-spacing: 1.5px; color: #8b7fb8; }
  .ck-lbl b { color: #c4b5fd; font-weight: 500; }
  .ck-moon { width: 26px; height: 26px; border-radius: 50%;
    box-shadow: inset 8px -5px 0 0 #efeaff, 0 0 26px rgba(196,181,253,.6); transform: rotate(-20deg); }
  .ck-time { font-size: 116px; font-weight: 700; line-height: 1; margin: 10px 0 6px; letter-spacing: -4px;
    background: linear-gradient(90deg, #ffffff, #cbbcff); -webkit-background-clip: text; color: transparent;
    filter: drop-shadow(0 0 22px rgba(196,181,253,.4)); }
  .ck-colon { animation: ck-bl 2s steps(1) infinite; }
  @keyframes ck-bl { 50% { opacity: .25 } }
  .ck-date { font-size: 17px; color: #b7a9e6; text-transform: lowercase; }
  .ck-date span { color: #ff4d6d; margin: 0 8px; }
  .ck-div { position: relative; height: 1px; margin: 18px 0 14px;
    background: linear-gradient(90deg, rgba(59,47,99,0), #c4b5fd, rgba(59,47,99,0)); }
  .ck-div i { position: absolute; left: 50%; top: -5px; width: 11px; height: 11px; margin-left: -5px;
    border-radius: 50%; background: #0b0a1a; box-shadow: inset 3px -2px 0 0 #efeaff; }
  .ck-jp { font-family: "Hiragino Mincho ProN", serif; font-size: 20px; color: #e4dcff; }
  .ck-jp span { font-family: "JetBrainsMono Nerd Font", monospace; font-size: 13px; color: #8b7fb8; margin-left: 10px; }
  .ck-day { margin-top: 14px; display: flex; align-items: center; gap: 10px; font-size: 12px; color: #8b7fb8; }
  .ck-bar { flex: 1; height: 4px; border-radius: 4px; background: rgba(59,47,99,.6); overflow: hidden; }
  .ck-bar i { display: block; height: 100%; border-radius: 4px; background: linear-gradient(90deg, #8b6fd1, #c4b5fd); }
`;

export const render = () => {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const wd = now.toLocaleDateString("ru-RU", { weekday: "long" });
  const dm = now.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  const [jp, en] = greet(now.getHours());
  const dayPct = Math.floor(((now.getHours() * 60 + now.getMinutes()) / 1440) * 100);
  return (
    <div className="ck-card">
      <style>{css}</style>
      <div className="ck-head">
        <div className="ck-lbl">✦ <b>時間</b> · time</div>
        <div className="ck-moon" />
      </div>
      <div className="ck-time">{hh}<span className="ck-colon">:</span>{mm}</div>
      <div className="ck-date">{wd}<span>·</span>{dm}</div>
      <div className="ck-div"><i /></div>
      <div className="ck-jp">{jp}<span>{en}</span></div>
      <div className="ck-day">day<div className="ck-bar"><i style={{ width: dayPct + "%" }} /></div>{dayPct}%</div>
    </div>
  );
};
