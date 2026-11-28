// saiko · calm · clock (no card, sits right on the wallpaper)
export const command = "date +%s";
export const refreshFrequency = 10000;

export const className = `
  top: 62px;
  left: 85px;
`;

const css = `
  .cc-wrap { font-family: "SF Pro Display", "Inter", -apple-system, "Helvetica Neue", sans-serif; color: #e8eef0; }
  .cc-time { font-size: 150px; font-weight: 200; line-height: 1; letter-spacing: -4px; opacity: .94; }
  .cc-date { margin: 4px 0 0 6px; font-size: 17px; font-weight: 400; letter-spacing: 1.5px; color: #8fa3a8; }
`;

export const render = () => {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const wd = now.toLocaleDateString("ru-RU", { weekday: "long" });
  const dm = now.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  return (
    <div className="cc-wrap">
      <style>{css}</style>
      <div className="cc-time">{hh}:{mm}</div>
      <div className="cc-date">{wd}, {dm}</div>
    </div>
  );
};
