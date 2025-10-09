
exports.handler = async (event, context) => {
  try {
    const res = await fetch("https://www.airbnb.com/calendar/ical/1518966603554242747.ics?s=fcd3c068a041eb11eab0dcad0b4f21d9&locale=fr", { cache: "no-store" });
    const text = await res.text();
    // Minimal ICS parsing: collect DTSTART/DTEND pairs
    const lines = text.split(/\r?\n/);
    let start=null, end=null;
    const disabled = new Set();
    function ymd(d){ return d.toISOString().slice(0,10); }
    function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
    for(const raw of lines){
      const line = raw.trim();
      let m;
      if((m=line.match(/^DTSTART.*:(\d{8})/))){
        const s=m[1];
        start = new Date(`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}T00:00:00`);
      } else if((m=line.match(/^DTEND.*:(\d{8})/))){
        const s=m[1];
        end = new Date(`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}T00:00:00`);
      } else if(line==="END:VEVENT"){
        if(start && end){
          for(let d=new Date(start); d<end; d=addDays(d,1)){ disabled.add(ymd(d)); }
        }
        start=null; end=null;
      }
    }
    return { statusCode: 200, headers: {"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}, body: JSON.stringify({ disabled: Array.from(disabled) }) };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
