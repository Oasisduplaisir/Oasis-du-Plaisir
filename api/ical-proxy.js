
// /api/ical-proxy.js (Vercel) – parsing iCal avec filtre "Reserved"
export default async function handler(req, res) {
  try {
    const icalUrl = "https://www.airbnb.com/calendar/ical/1518966603554242747.ics?s=fcd3c068a041eb11eab0dcad0b4f21d9&locale=fr";
    const resp = await fetch(icalUrl, { cache: "no-store" });
    const ics = await resp.text();

    const lines = ics.split(/\r?\n/);
    let events = [];
    let cur = null;

    function pickYYYYMMDD(s) {
      const m = String(s).match(/(\d{8})/);
      return m ? m[1] : null;
    }

    function addDayStr(yyyymmdd, n) {
      let y = parseInt(yyyymmdd.substr(0, 4));
      let m = parseInt(yyyymmdd.substr(4, 2)) - 1;
      let d = parseInt(yyyymmdd.substr(6, 2));
      let dt = new Date(y, m, d);
      dt.setDate(dt.getDate() + n);
      return dt.toISOString().split("T")[0];
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
        if (cur && cur.start && cur.end) {
          // ✅ Filtre : uniquement les vraies réservations
          if (cur.summary && cur.summary.toLowerCase().includes("reserved")) {
            events.push(cur);
          }
        }
        cur = null;
      }
    }

    let busyDates = [];
    let ranges = [];

    for (let ev of events) {
      let start = ev.start;
      let end = ev.end;

      // Airbnb inclut le jour du départ → on enlève 1 jour
      let d = start;
      while (d < end) {
        busyDates.push(d);
        d = addDayStr(d, 1);
      }

      ranges.push({
        from: start,
        to: addDayStr(end, -1),
      });
    }

    res.status(200).json({ busyDates, ranges, count: busyDates.length });
  } catch (err) {
    console.error("Erreur iCal:", err);
    res.status(500).json({ error: "Impossible de récupérer l'iCal" });
  }
}
