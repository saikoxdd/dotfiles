// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: magic;
// ✦ 夜 · night widgets for Scriptable · saiko
// Параметр виджета (Edit Widget → Parameter): reminders | calendar | status | terminal
// Без параметра: small → status, medium → calendar, large → reminders
// Нажатие на виджет напоминаний открывает Reminders, остальные - меню скрипта.

const C = {
  lav: "#c4b5fd", lav2: "#e4dcff", text: "#efeaff", sub: "#8b7fb8", mid: "#b7a9e6",
  past: "#6f63a0", out: "#2f2752", dim: "#3b2f63", pink: "#ff4d6d", rose: "#ff8fa5",
  green: "#8be3a3", bg: "#0b0a1a",
};
const col = (h, a) => new Color(h, a === undefined ? 1 : a);
const SIZES = { small: [170, 170], medium: [364, 170], large: [364, 382], extraLarge: [364, 382] };

/* ---------- общие штуки ---------- */
function font(size, bold) { return bold ? Font.boldMonospacedSystemFont(size) : Font.regularMonospacedSystemFont(size); }
function add(st, txt, size, color, bold, sys) {
  const t = st.addText(txt);
  t.font = sys ? (bold ? Font.boldSystemFont(size) : Font.systemFont(size)) : font(size, bold);
  t.textColor = col(color);
  return t;
}
function label(st, kanji, en, right) {
  const row = st.addStack(); row.centerAlignContent();
  add(row, "✦ ", 10, C.sub); add(row, kanji, 10, C.lav, true, true); add(row, " · " + en, 10, C.sub);
  if (right) { row.addSpacer(); add(row, right, 10, C.sub); }
  return row;
}
function greet(h) {
  if (h < 5) return ["夜はまだ長い", "the night is still long"];
  if (h < 11) return ["おはよう", "good morning"];
  if (h < 17) return ["集中", "focus mode"];
  if (h < 22) return ["こんばんは", "good evening"];
  return ["夜はまだ長い", "the night is still long"];
}
function bar(st, width, pct) {
  const outer = st.addStack(); outer.size = new Size(width, 4); outer.cornerRadius = 2;
  outer.backgroundColor = col(C.dim, 0.7); outer.layoutHorizontally();
  const inner = outer.addStack(); inner.size = new Size(Math.max(4, width * pct), 4);
  inner.cornerRadius = 2; inner.backgroundColor = col(C.lav);
  outer.addSpacer();
}

/* ---------- фон: небо, звёзды, луна, горы ---------- */
function sky(w, h, moon) {
  const dc = new DrawContext(); dc.size = new Size(w, h); dc.opaque = true; dc.respectScreenScale = true;
  const stops = [[0, [11, 10, 26]], [0.6, [22, 17, 48]], [1, [42, 29, 74]]];
  const N = 80;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1); const [a, b] = t <= stops[1][0] ? [stops[0], stops[1]] : [stops[1], stops[2]];
    const k = (t - a[0]) / (b[0] - a[0]);
    const c = a[1].map((v, j) => Math.round(v + (b[1][j] - v) * k));
    dc.setFillColor(new Color("#" + c.map(v => v.toString(16).padStart(2, "0")).join("")));
    dc.fillRect(new Rect(0, Math.floor(i * h / N), w, Math.ceil(h / N) + 1));
  }
  let s = 11; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < Math.round(w * h / 700); i++) {
    const x = r() * w, y = r() * h * 0.7, z = r() < 0.15 ? 1.8 : 1;
    dc.setFillColor(col("#efeaff", 0.2 + r() * 0.6)); dc.fillEllipse(new Rect(x, y, z, z));
  }
  if (moon) {
    const mx = w - 30, my = 28;
    for (let g = 6; g > 0; g--) { dc.setFillColor(col(C.lav, 0.035)); dc.fillEllipse(new Rect(mx - 7 * g, my - 7 * g, 14 * g, 14 * g)); }
    dc.setFillColor(col("#f3efff")); dc.fillEllipse(new Rect(mx - 9, my - 9, 18, 18));
  }
  const hills = (base, amp, step, color, seed) => {
    s = seed; const p = new Path(); const pts = [new Point(0, h)];
    for (let x = 0; x <= w + step; x += step) pts.push(new Point(x, base - r() * amp));
    pts.push(new Point(w, h)); p.addLines(pts); p.closeSubpath();
    dc.addPath(p); dc.setFillColor(col(color)); dc.fillPath();
  };
  hills(h - 22, 14, 26, "#1d1638", 3);
  hills(h - 10, 8, 18, "#120e26", 7);
  return dc.getImage();
}
function base(family, moon) {
  const [w, h] = SIZES[family] || SIZES.medium;
  const lw = new ListWidget(); lw.backgroundImage = sky(w, h, moon === undefined ? family !== "small" : moon);
  lw.setPadding(14, 16, 14, 16);
  return lw;
}

/* ---------- напоминания (Apple Reminders) ---------- */
async function loadReminders() {
  const list = await Reminder.allIncomplete();
  const now = new Date();
  const sod = new Date(); sod.setHours(0, 0, 0, 0);
  const eod = new Date(); eod.setHours(23, 59, 59, 999);
  const rank = r => !r.dueDate ? 3 : r.dueDate < sod ? 0 : r.dueDate <= eod ? 1 : 2;
  return list.sort((a, b) => rank(a) - rank(b) || ((a.dueDate || 0) - (b.dueDate || 0)))
    .map(r => {
      let chip = null, chipColor = C.sub;
      if (r.dueDate) {
        const t = r.dueDateIncludesTime ? r.dueDate.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) : "";
        if ((r.dueDateIncludesTime ? r.dueDate < now : r.dueDate < sod)) { chip = "просрочено"; chipColor = C.pink; }
        else if (r.dueDate <= eod) { chip = t || "сегодня"; chipColor = C.lav; }
        else chip = r.dueDate.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
      }
      return { r, title: r.title, chip, chipColor, color: r.calendar ? r.calendar.color : col(C.lav) };
    });
}
async function doneToday() {
  try { return (await Reminder.completedToday()).length; } catch (e) { return 0; }
}

async function remindersWidget(family) {
  const items = await loadReminders(), done = await doneToday();
  const lw = base(family);
  const max = family === "large" ? 10 : 4;
  label(lw, "覚書", "reminders", family === "small" ? `${items.length}` : `${items.length} · ✓${done}`);
  lw.addSpacer(family === "large" ? 12 : 8);
  if (!items.length) {
    add(lw, "всё сделано ✦", 13, C.lav2, true, true);
    add(lw, "отдыхай", 10, C.sub);
  }
  items.slice(0, max).forEach(it => {
    const row = lw.addStack(); row.centerAlignContent(); row.spacing = 8;
    const dot = row.addStack(); dot.size = new Size(9, 9); dot.cornerRadius = 4.5;
    dot.borderWidth = 1.5; dot.borderColor = it.color;
    const t = add(row, it.title, family === "small" ? 11 : 12, C.lav2, false, true); t.lineLimit = 1;
    if (it.chip && family !== "small") {
      row.addSpacer();
      const ch = row.addStack(); ch.setPadding(1, 6, 1, 6); ch.cornerRadius = 6;
      ch.backgroundColor = col(it.chipColor, 0.16);
      add(ch, it.chip, 9, it.chipColor);
    }
    lw.addSpacer(family === "large" ? 8 : 5);
  });
  if (items.length > max) add(lw, `+ ещё ${items.length - max}`, 10, C.sub);
  lw.addSpacer();
  if (family === "large") { const [jp, en] = greet(new Date().getHours()); const f = lw.addStack(); add(f, jp, 13, C.lav, false, true); add(f, "  " + en, 9, C.sub); }
  lw.refreshAfterDate = new Date(Date.now() + 10 * 60 * 1000);
  lw.url = "x-apple-reminderkit://";
  return lw;
}

async function remindersMenu() {
  while (true) {
    const items = await loadReminders();
    const a = new Alert(); a.title = "✦ 覚書 · reminders";
    a.message = items.length ? items.slice(0, 12).map(i => "○ " + i.title + (i.chip ? `  · ${i.chip}` : "")).join("\n") : "всё сделано ✦";
    a.addAction("＋ добавить"); a.addAction("✓ выполнить"); a.addAction("открыть Reminders");
    a.addCancelAction("готово");
    const k = await a.presentSheet();
    if (k === -1) break;
    if (k === 0) {
      const q = new Alert(); q.title = "новое напоминание"; q.addTextField("что сделать?");
      q.addAction("добавить"); q.addAction("добавить на сегодня"); q.addCancelAction("отмена");
      const r = await q.presentAlert(); const v = q.textFieldValue(0).trim();
      if (r !== -1 && v) {
        const n = new Reminder(); n.title = v; n.calendar = await Calendar.defaultForReminders();
        if (r === 1) { const d = new Date(); d.setHours(23, 59, 0, 0); n.dueDate = d; n.dueDateIncludesTime = false; }
        n.save();
      }
    } else if (k === 1) {
      if (!items.length) continue;
      const p = new Alert(); p.title = "выполнить";
      items.forEach(i => p.addAction("○ " + i.title)); p.addCancelAction("отмена");
      const x = await p.presentSheet(); if (x === -1) continue;
      items[x].r.isCompleted = true; items[x].r.save();
    } else if (k === 2) { Safari.open("x-apple-reminderkit://"); break; }
  }
}

/* ---------- календарь ---------- */
function calendarWidget(family) {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
  const lw = base(family, family === "large");
  const wd = now.toLocaleDateString("ru-RU", { weekday: "long" });
  const month = now.toLocaleDateString("ru-RU", { month: "long" });
  const kanji = `${m + 1}月${d}日 ${["日", "月", "火", "水", "木", "金", "土"][now.getDay()]}曜日`;
  const daysIn = new Date(y, m + 1, 0).getDate();
  const [jp, en] = greet(now.getHours());

  const hero = (st, numSize) => {
    add(st, String(d).padStart(2, "0"), numSize, C.lav2, true);
    add(st, wd, 13, C.text, true, true);
    add(st, `${month} ${y}`, 10, C.mid);
    st.addSpacer(3);
    add(st, kanji, 11, C.lav, false, true);
  };

  if (family === "small") {
    label(lw, "暦", "calendar"); lw.addSpacer(4);
    hero(lw, 44); lw.addSpacer();
    bar(lw, 138, d / daysIn);
  } else {
    label(lw, "暦", "calendar", family === "large" ? `${month} · ${Math.round(d / daysIn * 100)}%` : null);
    lw.addSpacer(family === "large" ? 10 : 6);
    const body = lw.addStack(); body.layoutHorizontally();
    const cw = family === "large" ? 44 : 26, ch = family === "large" ? 34 : 15, fs = family === "large" ? 14 : 10;
    if (family === "medium") {
      const left = body.addStack(); left.layoutVertically(); left.size = new Size(130, 0);
      hero(left, 40); body.addSpacer();
    }
    const grid = body.addStack(); grid.layoutVertically(); grid.spacing = family === "large" ? 4 : 1;
    const head = grid.addStack();
    ["пн", "вт", "ср", "чт", "пт", "сб", "вс"].forEach((t, i) => {
      const c = head.addStack(); c.size = new Size(cw, ch); c.centerAlignContent();
      add(c, t, fs - 2, i >= 5 ? C.rose : C.sub);
    });
    const offset = (new Date(y, m, 1).getDay() + 6) % 7;
    const rows = Math.ceil((offset + daysIn) / 7);
    for (let r = 0; r < rows; r++) {
      const row = grid.addStack();
      const nowRow = Math.floor((offset + d - 1) / 7) === r;
      if (nowRow) { row.backgroundColor = col("#8b6fd1", 0.16); row.cornerRadius = 7; }
      for (let c = 0; c < 7; c++) {
        const n = r * 7 + c - offset + 1;
        const cell = row.addStack(); cell.size = new Size(cw, ch); cell.centerAlignContent();
        if (n < 1 || n > daysIn) { add(cell, " ", fs, C.out); continue; }
        if (n === d) {
          cell.backgroundColor = col(C.lav, 0.22); cell.cornerRadius = family === "large" ? 9 : 5;
          cell.borderWidth = 1.5; cell.borderColor = col(C.lav);
          add(cell, String(n), fs, C.text, true);
        } else add(cell, String(n), fs, n < d ? C.past : (c >= 5 ? C.rose : C.lav2));
      }
    }
    if (family === "large") {
      lw.addSpacer();
      const f = lw.addStack(); f.centerAlignContent();
      add(f, jp, 15, C.lav2, false, true); add(f, "  " + en, 10, C.sub);
      lw.addSpacer(8); bar(lw, 330, d / daysIn);
      lw.addSpacer(2);
      const k = lw.addStack(); add(k, kanji, 10, C.lav, false, true);
    }
  }
  const t = new Date(); t.setHours(24, 0, 5, 0); lw.refreshAfterDate = t;
  lw.url = URLScheme.forRunningScript();
  return lw;
}

/* ---------- кольцо батареи ---------- */
function ring(pct, charging) {
  const S = 110, R = 44, W = 10, dc = new DrawContext(); dc.size = new Size(S, S); dc.opaque = false; dc.respectScreenScale = true;
  const arc = (from, to, color, alpha) => {
    const p = new Path(), pts = [];
    for (let a = from; a <= to + 0.001; a += 2) {
      const rad = (a - 90) * Math.PI / 180; pts.push(new Point(S / 2 + R * Math.cos(rad), S / 2 + R * Math.sin(rad)));
    }
    if (pts.length < 2) return;
    p.addLines(pts); dc.addPath(p); dc.setStrokeColor(col(color, alpha)); dc.setLineWidth(W); dc.strokePath();
    [pts[0], pts[pts.length - 1]].forEach(q => { dc.setFillColor(col(color, alpha)); dc.fillEllipse(new Rect(q.x - W / 2, q.y - W / 2, W, W)); });
  };
  const c = pct < 0.2 ? C.pink : pct < 0.4 ? "#f5c26b" : C.green;
  arc(0, 360, c, 0.15);
  arc(0, Math.max(4, 360 * pct), c, 1);
  dc.setFont(Font.boldMonospacedSystemFont(22)); dc.setTextColor(col(C.lav2)); dc.setTextAlignedCenter();
  dc.drawTextInRect(`${Math.round(pct * 100)}`, new Rect(0, S / 2 - 18, S, 26));
  dc.setFont(Font.regularMonospacedSystemFont(9)); dc.setTextColor(col(C.sub));
  dc.drawTextInRect(charging ? "⚡ charging" : "battery", new Rect(0, S / 2 + 8, S, 12));
  return dc.getImage();
}
function statusWidget(family) {
  const lw = base(family), now = new Date(), [jp, en] = greet(now.getHours());
  const pct = Device.batteryLevel(), ch = Device.isCharging();
  label(lw, "状態", "status");
  if (family === "small") {
    lw.addSpacer(4);
    const r = lw.addStack(); r.addSpacer(); const im = r.addImage(ring(pct, ch)); im.imageSize = new Size(92, 92); r.addSpacer();
    lw.addSpacer(); const f = lw.addStack(); f.addSpacer(); add(f, jp, 11, C.lav, false, true); f.addSpacer();
  } else {
    lw.addSpacer(6);
    const row = lw.addStack(); row.centerAlignContent();
    const im = row.addImage(ring(pct, ch)); im.imageSize = new Size(104, 104);
    row.addSpacer(16);
    const right = row.addStack(); right.layoutVertically();
    add(right, jp, 18, C.lav2, false, true); add(right, en, 10, C.sub);
    right.addSpacer(8);
    add(right, now.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" }), 12, C.mid, false, true);
    row.addSpacer();
  }
  lw.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
  lw.url = URLScheme.forRunningScript();
  return lw;
}

/* ---------- терминал ---------- */
async function weather() {
  const lfm = FileManager.local(), cache = lfm.joinPath(lfm.cacheDirectory(), "night-weather.txt");
  try {
    const fresh = lfm.fileExists(cache) && (Date.now() - lfm.modificationDate(cache).getTime()) < 10 * 60 * 1000;
    if (fresh) return lfm.readString(cache);
    const req = new Request("https://wttr.in/Saint-Petersburg?format=" + encodeURIComponent("%c%t (%f) · %C") + "&lang=ru");
    req.timeoutInterval = 8;
    const t = (await req.loadString()).trim().replace(/[+-]+0°/g, "0°").replace(/\s+/g, " ");
    if (t && !/unknown|error|<html/i.test(t)) { lfm.writeString(cache, t); return t; }
  } catch (e) {}
  return lfm.fileExists(cache) ? lfm.readString(cache) : "нет сети";
}
async function nextThing() {
  try {
    const now = new Date();
    const ev = [...await CalendarEvent.today([]), ...await CalendarEvent.tomorrow([])]
      .filter(e => !e.isAllDay && e.startDate > now).sort((a, b) => a.startDate - b.startDate)[0];
    if (ev) {
      const day = ev.startDate.getDate() === now.getDate() ? "" : "завтра ";
      return { cmd: "next --event", out: `${day}${ev.startDate.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })} ${ev.title}` };
    }
  } catch (e) {}
  try {
    const r = (await loadReminders())[0];
    if (r) return { cmd: "next --todo", out: r.title + (r.chip ? ` · ${r.chip}` : "") };
  } catch (e) {}
  return { cmd: "next", out: "свободно ✦" };
}
function termBg(w, h, barH) {
  // всё оформление окна рисуем в фоновую картинку: iOS в тонированном режиме не перекрашивает фон
  const img = sky(w, h, false);
  const dc = new DrawContext(); dc.size = new Size(w, h); dc.opaque = true; dc.respectScreenScale = true;
  dc.drawImageInRect(img, new Rect(0, 0, w, h));
  dc.setFillColor(col("#0e0b20", 0.55)); dc.fillRect(new Rect(0, 0, w, h));
  dc.setFillColor(col("#141027", 0.95)); dc.fillRect(new Rect(0, 0, w, barH));
  dc.setFillColor(col("#3b2f63")); dc.fillRect(new Rect(0, barH, w, 1));
  ["#ff4d6d", "#f5c26b", "#8be3a3"].forEach((c, k) => {
    dc.setFillColor(col(c)); dc.fillEllipse(new Rect(14 + k * 15, barH / 2 - 4.5, 9, 9));
  });
  dc.setFont(Font.regularMonospacedSystemFont(10)); dc.setTextColor(col(C.sub)); dc.setTextAlignedCenter();
  dc.drawTextInRect("saiko@night: ~", new Rect(0, barH / 2 - 7, w, 14));
  return dc.getImage();
}
async function terminalWidget(family) {
  const [w, h] = SIZES[family] || SIZES.medium;
  const barH = family === "small" ? 24 : 28;
  const lw = new ListWidget(); lw.backgroundImage = termBg(w, h, barH);
  lw.setPadding(barH + 8, 14, 10, 14); lw.spacing = 2;
  const fs = family === "small" ? 10 : 12;
  const cmd = c => { const r = lw.addStack(); add(r, "❯ ", fs, C.pink, true); add(r, "~ ", fs, C.lav); add(r, c, fs, C.text); };
  const out = (t, color) => { const x = add(lw, t, fs, color || C.mid); x.lineLimit = 1; x.minimumScaleFactor = 0.7; };
  const pct = Math.round(Device.batteryLevel() * 100), ch = Device.isCharging();
  const tone = pct < 20 ? C.pink : pct < 40 ? "#f5c26b" : C.green;
  cmd("weather --spb"); out(await weather());
  if (family !== "small") { const n = await nextThing(); cmd(n.cmd); out(n.out); }
  cmd("battery"); out(`${pct}%${ch ? " ⚡ charging" : ""}`, tone);
  const last = lw.addStack(); last.centerAlignContent(); add(last, "❯ ", fs, C.pink, true); add(last, "~ ", fs, C.lav);
  add(last, "▍", fs, C.lav);
  lw.addSpacer();
  lw.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
  lw.url = URLScheme.forRunningScript();
  return lw;
}

/* ---------- запуск ---------- */
async function build(kind, family) {
  if (kind === "reminders" || kind === "notes") return remindersWidget(family);
  if (kind === "calendar") return calendarWidget(family);
  if (kind === "terminal") return terminalWidget(family);
  return statusWidget(family);
}
const family = config.widgetFamily || "medium";
const param = (args.widgetParameter || "").trim().toLowerCase();
const kind = param || (family === "small" ? "status" : family === "large" ? "reminders" : "calendar");

if (config.runsInWidget) {
  Script.setWidget(await build(kind, family));
} else {
  const a = new Alert(); a.title = "✦ 夜 · night";
  a.addAction("напоминания"); a.addAction("превью: напоминания (large)");
  a.addAction("превью: календарь (medium)"); a.addAction("превью: статус (small)"); a.addAction("превью: терминал (medium)");
  a.addCancelAction("закрыть");
  const i = await a.presentSheet();
  if (i === 0) await remindersMenu();
  if (i === 1) await (await remindersWidget("large")).presentLarge();
  if (i === 2) await calendarWidget("medium").presentMedium();
  if (i === 3) await statusWidget("small").presentSmall();
  if (i === 4) await (await terminalWidget("medium")).presentMedium();
}
Script.complete();
