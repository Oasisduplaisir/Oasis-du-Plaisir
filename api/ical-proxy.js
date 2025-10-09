// /api/ical-proxy.js (Vercel) — parsing iCal sans décalage de fuseau horaire
export default async function handler(req, res) {
  try {
    const icalUrl = "https://www.airbnb.com/calendar/ical/1518966603554242747.ics?s=fcd3c068a041eb11eab0dcad0b4f21d9&locale=fr";
    const r = await fetch(icalUrl, { cache: "no-store" });
    const ics = await r.text();

    const lines = ics.split(/\r?\n/);
    let events = [];
    let cur = null;

    function pickYYYYMMDD(s) {
      // extrait la date AAAAMMJJ la plus sûre
      const m = String(s).match(/:(\d{8})/); // capture 8 chiffres après le ":"
      return m ? m[1] : null;
    }

    for (const raw of lines) {
      const line = raw.trim();
      if (line === "BEGIN:VEVENT") {
        cur = {};
      } else if (line.startsWith("DTSTART")) {
        cur.start = pickYYYYMMDD(line);
      } else if (line.startsWith("DTEND")) {
        cur.end = pickYYYYMMDD(line);
      } else if (line.startsWith("SUMMARY:")) {
        cur.summary = line.slice(8);
      } else if (line === "END:VEVENT") {
        if (cur && cur.start && cur.end) events.push(cur);
        cur = null;
      }
    }

    function addDaysStr(yyyymmdd, n) {
      const y = parseInt(yyyymmdd.slice(0, 4), 10);
      const m = parseInt(yyyymmdd.slice(4, 6), 10);
      const d = parseInt(yyyymmdd.slice(6, 8), 10);
      const dt = new Date(Date.UTC(y, m - 1, d));
      dt.setUTCDate(dt.getUTCDate() + n);
      const yy = dt.getUTCFullYear();
      const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(dt.getUTCDate()).padStart(2, "0");
      return `${yy}${mm}${dd}`;
    }

    const ranges = [];
    const busySet = new Set();

    for (const ev of events) {
      const start = ev.start;
      const end = ev.end; // exclusif iCal

      if (!start || !end) continue;

      // Renseigne toutes les nuits entre start (inclus) et end (exclus)
      let curStr = start;
      while (curStr < end) {
        busySet.add(`${curStr.slice(0,4)}-${curStr.slice(4,6)}-${curStr.slice(6,8)}`);
        curStr = addDaysStr(curStr, 1);
      }

      // Plage pour Flatpickr ({from,to}) où 'to' = end - 1 jour
      const lastStr = addDaysStr(end, -1);
      ranges.push({
        from: `${start.slice(0,4)}-${start.slice(4,6)}-${start.slice(6,8)}`,
        to:   `${lastStr.slice(0,4)}-${lastStr.slice(4,6)}-${lastStr.slice(6,8)}`
      });
    }

    const busyDates = Array.from(busySet);
    return res.status(200).json({ busyDates, ranges, count: busyDates.length });
  } catch (e) {
    return res.status(500).json({ error: e.message || String(e) });
  }
}