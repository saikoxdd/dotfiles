// saiko · calm · next event
export const command = `
date +%F
B=""
for p in /opt/homebrew/bin/icalBuddy /usr/local/bin/icalBuddy; do [ -x "$p" ] && B="$p"; done
if [ -z "$B" ]; then echo NOICAL; else
  "$B" -n -nc -nrd -ea -npn -li 1 -b "" -ps "| ¦ |" -iep "title,datetime" -po "datetime,title" \
       -df "%Y-%m-%d" -tf "%H:%M" eventsToday+7 2>/dev/null | head -1
fi
`;
export const refreshFrequency = 60000;

export const className = `
  top: 262px;
  left: 91px;
`;

const parseNext = (line) => {
  if (!line) return null;
  if (line.trim() === "NOICAL") return { missing: true };
  const [dt, ...rest] = line.split(" ¦ ");
  const m = dt.match(/(\d{4})-(\d{2})-(\d{2}) at (\d{2}):(\d{2})/);
  if (!m) return null;
  return { start: new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]), time: `${m[4]}:${m[5]}`, title: rest.join(" ¦ ").trim() || "событие" };
};
const relTime = (start, now) => {
  const min = Math.round((start - now) / 60000);
  if (min <= 0) return "сейчас";
  if (min < 60) return `через ${min} мин`;
  const sameDay = start.toDateString() === now.toDateString();
  if (sameDay) return `через ${Math.floor(min / 60)} ч ${min % 60 ? (min % 60) + " мин" : ""}`.trim();
  const tm = new Date(now); tm.setDate(tm.getDate() + 1);
  if (start.toDateString() === tm.toDateString()) return "завтра";
  return start.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "short" });
};

const css = `
  .cn { display: flex; gap: 14px; font-family: "JetBrainsMono Nerd Font", "JetBrains Mono", Menlo, monospace; }
  .cn-bar { width: 3px; border-radius: 2px; background: #e8b76a; }
  .cn-k { font-family: "Hiragino Mincho ProN", serif; font-size: 17px; color: #e8b76a; margin-right: 10px; }
  .cn-t { font-size: 15px; color: #c9d6d9; }
  .cn-r { margin-top: 6px; font-size: 13px; color: #6d8187; }
`;

export const render = ({ output }) => {
  const next = parseNext((output || "").split("\n")[1]);
  const now = new Date();
  let top, sub;
  if (next && next.missing) { top = <span className="cn-t">icalBuddy не установлен</span>; sub = "brew install ical-buddy"; }
  else if (!next) { top = <span className="cn-t">ближайших событий нет</span>; sub = "свободная неделя"; }
  else { top = <span className="cn-t">{next.time}  {next.title}</span>; sub = relTime(next.start, now); }
  return (
    <div className="cn">
      <style>{css}</style>
      <div className="cn-bar" />
      <div>
        <div><span className="cn-k">次</span>{top}</div>
        <div className="cn-r">{sub}</div>
      </div>
    </div>
  );
};
