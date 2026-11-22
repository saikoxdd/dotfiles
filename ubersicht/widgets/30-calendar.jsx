// saiko · calendar card
export const command = "date +%F";
export const refreshFrequency = 60000;

export const className = `
  top: 60px;
  left: 13vw;
`;

const KANJI = ["日", "月", "火", "水", "木", "金", "土"];            // by getDay()
const KANJI_DAY = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];
const HEAD = [["пн", "月"], ["вт", "火"], ["ср", "水"], ["чт", "木"], ["пт", "金"], ["сб", "土"], ["вс", "日"]];
// fixed-date public holidays in Russia: "month-day"
const HOLIDAYS = new Set(["1-1","1-2","1-3","1-4","1-5","1-6","1-7","1-8","2-23","3-8","5-1","5-9","6-12","11-4","12-31"]);

const css = `
  .cl-card { width: 360px; padding: 22px 24px 20px; border-radius: 18px; box-sizing: border-box; position: relative; overflow: hidden;
    background: linear-gradient(135deg, rgba(11,10,26,.86), rgba(29,22,56,.86));
    border: 1px solid #3b2f63; backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
    box-shadow: 0 24px 60px rgba(0,0,0,.55), 0 0 50px rgba(139,111,209,.16);
    font-family: "JetBrainsMono Nerd Font", "JetBrains Mono", Menlo, monospace; color: #efeaff; }
  .cl-card:before { content: ""; position: absolute; right: -60px; top: -60px; width: 200px; height: 200px; border-radius: 50%;
    background: radial-gradient(circle, rgba(196,181,253,.18), rgba(196,181,253,0) 70%); }
  .cl-lbl { font-size: 13px; letter-spacing: 1.5px; color: #8b7fb8; position: relative; }
  .cl-lbl b { color: #c4b5fd; font-weight: 500; }
  .cl-hero { display: flex; align-items: center; gap: 18px; margin: 12px 0 18px; position: relative; }
  .cl-num { font-size: 76px; font-weight: 700; line-height: .9; letter-spacing: -3px;
    background: linear-gradient(160deg, #ffffff, #b9a7ff); -webkit-background-clip: text; color: transparent;
    filter: drop-shadow(0 0 18px rgba(196,181,253,.45)); }
  .cl-side { display: flex; flex-direction: column; gap: 3px; }
  .cl-wd { font-size: 17px; font-weight: 700; color: #e4dcff; text-transform: lowercase; }
  .cl-my { font-size: 13px; color: #b7a9e6; text-transform: lowercase; }
  .cl-jp { font-family: "Hiragino Mincho ProN", serif; font-size: 15px; color: #c4b5fd; margin-top: 2px; }
  .cl-jp span { color: #ff4d6d; margin-left: 8px; font-family: "JetBrainsMono Nerd Font", monospace; font-size: 11px; }
  .cl-grid { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; row-gap: 2px; position: relative; }
  .cl-h { padding-bottom: 8px; }
  .cl-h div { font-size: 11px; color: #8b7fb8; }
  .cl-h small { display: block; font-family: "Hiragino Mincho ProN", serif; font-size: 10px; color: #5f5390; margin-top: 1px; }
  .cl-h.we div { color: #ff8fa5; }
  .cl-d { position: relative; width: 34px; height: 34px; line-height: 34px; margin: 0 auto; border-radius: 10px; font-size: 13px; color: #e4dcff; }
  .cl-d.past { color: #6f63a0; }
  .cl-d.we { color: #ff8fa5; }
  .cl-d.we.past { color: #8a5672; }
  .cl-d.out { color: #2f2752; }
  .cl-d.hol:after { content: ""; position: absolute; left: 50%; bottom: 4px; width: 4px; height: 4px; margin-left: -2px;
    border-radius: 50%; background: #ff4d6d; box-shadow: 0 0 6px #ff4d6d; }
  .cl-d.today { background: linear-gradient(160deg, #e4dcff, #a78bfa); color: #0b0a1a; font-weight: 700;
    box-shadow: 0 0 0 1px rgba(255,255,255,.25), 0 0 22px rgba(196,181,253,.65); }
  .cl-d.today:after { background: #0b0a1a; box-shadow: none; }
  .cl-c.band { background: rgba(139,111,209,.13); }
  .cl-c.band.l { border-radius: 12px 0 0 12px; }
  .cl-c.band.r { border-radius: 0 12px 12px 0; }
  .cl-foot { margin-top: 16px; display: flex; align-items: center; gap: 10px; font-size: 11px; color: #8b7fb8; position: relative; }
  .cl-bar { flex: 1; height: 4px; border-radius: 4px; background: rgba(59,47,99,.6); overflow: hidden; }
  .cl-bar i { display: block; height: 100%; border-radius: 4px; background: linear-gradient(90deg, #8b6fd1, #c4b5fd); }
`;

const isoWeek = (d) => {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  return Math.ceil(((t - new Date(Date.UTC(t.getUTCFullYear(), 0, 1))) / 86400000 + 1) / 7);
};

export const render = () => {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth(), today = now.getDate();
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const daysIn = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();
  const rows = Math.ceil((offset + daysIn) / 7);
  const todayRow = Math.floor((offset + today - 1) / 7);

  const cells = Array.from({ length: rows * 7 }, (_, i) => {
    const n = i - offset + 1, col = i % 7;
    if (n < 1) return { n: prevDays + n, cls: "out" };
    if (n > daysIn) return { n: n - daysIn, cls: "out" };
    const c = [];
    if (col >= 5) c.push("we");
    if (n < today) c.push("past");
    if (n === today) c.push("today");
    if (HOLIDAYS.has(`${m + 1}-${n}`)) c.push("hol");
    return { n, cls: c.join(" ") };
  });

  const wd = now.toLocaleDateString("ru-RU", { weekday: "long" });
  const month = now.toLocaleDateString("ru-RU", { month: "long" });
  const pct = Math.round((today / daysIn) * 100);
  const isHol = HOLIDAYS.has(`${m + 1}-${today}`);

  return (
    <div className="cl-card">
      <style>{css}</style>
      <div className="cl-lbl">✦ <b>暦</b> · calendar</div>
      <div className="cl-hero">
        <div className="cl-num">{String(today).padStart(2, "0")}</div>
        <div className="cl-side">
          <div className="cl-wd">{wd}</div>
          <div className="cl-my">{month} {y} · неделя {isoWeek(now)}</div>
          <div className="cl-jp">{m + 1}月{today}日 {KANJI_DAY[now.getDay()]}{isHol && <span>праздник</span>}</div>
        </div>
      </div>
      <div className="cl-grid">
        {HEAD.map(([ru, jp], i) => (
          <div key={ru} className={"cl-h" + (i >= 5 ? " we" : "")}><div>{ru}</div><small>{jp}</small></div>
        ))}
        {cells.map((c, i) => {
          const col = i % 7, band = Math.floor(i / 7) === todayRow;
          const bc = band ? " band" + (col === 0 ? " l" : col === 6 ? " r" : "") : "";
          return <div key={i} className={"cl-c" + bc}><div className={"cl-d " + c.cls}>{c.n}</div></div>;
        })}
      </div>
      <div className="cl-foot">{month}<div className="cl-bar"><i style={{ width: pct + "%" }} /></div>{pct}%</div>
    </div>
  );
};
