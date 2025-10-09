// /api/ical-proxy.js (pour Vercel)
import ical from "ical";
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const icalUrl = "https://www.airbnb.com/calendar/ical/1518966603554242747.ics?s=fcd3c068a041eb11eab0dcad0b4f21d9&locale=fr";
    const response = await fetch(icalUrl);
    const icalData = await response.text();

    const parsed = ical.parseICS(icalData);
    const busyDates = [];

    for (let k in parsed) {
      const ev = parsed[k];
      if (ev.type === "VEVENT") {
        let d = new Date(ev.start);
        while (d < ev.end) {
          busyDates.push(d.toISOString().split("T")[0]);
          d.setDate(d.getDate() + 1);
        }
      }
    }

    res.status(200).json({ busyDates });
  } catch (err) {
    res.status(500).json({ error: "Erreur iCal", details: err.toString() });
  }
}
