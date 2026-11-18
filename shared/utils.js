window.AppUtils = {
  esc(value="") {
    return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  },
  slug(value="") {
    return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  },
  safeUrl(value="") {
    try { const u = new URL(value); return ["http:","https:"].includes(u.protocol) ? u.href : ""; } catch { return ""; }
  },
  youtubeEmbed(value="") {
    try {
      const u = new URL(value);
      let id = "";
      const host = u.hostname.toLowerCase().replace(/^www\./, "");
      const path = u.pathname.split("/").filter(Boolean);
      if (host === "youtu.be") id = path[0] || "";
      else if (host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtube-nocookie.com") {
        if (u.pathname === "/watch") id = u.searchParams.get("v") || "";
        else if (["embed", "shorts", "live"].includes(path[0])) id = path[1] || "";
      }
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : "";
    } catch { return ""; }
  },
  date(value) { if(!value) return ""; const d=new Date(value); return isNaN(d)?"":d.toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"}); }
};