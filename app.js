const $ = s => document.querySelector(s);
let DATA={provinces:[],categories:[],cultures:[],media:[],articles:[]}, activeProvince="";
document.addEventListener("DOMContentLoaded", async()=>{
  $("#year").textContent=new Date().getFullYear();
  $("#menuToggle").addEventListener("click",()=>$("#mainNav").classList.toggle("open"));
  $("#modalClose").addEventListener("click",closeModal);
  $("#mediaModal").addEventListener("click",e=>{if(e.target.id==="mediaModal")closeModal()});
  $("#searchInput").addEventListener("input",renderCultures);
  try { const r=await Api.get("bootstrap"); DATA={...DATA,...(r.data||r)}; renderAll(); }
  catch(e){ $("#cultureGrid").innerHTML=`<div class="empty">Data belum dapat dimuat. Periksa URL API dan deployment Apps Script. (${AppUtils.esc(e.message)})</div>`; }
});
function renderAll(){renderFilters();renderCultures();renderMedia();renderArticles();}
function renderFilters(){
 const el=$("#provinceFilters"); el.innerHTML='<button class="chip selected" data-province="">Semua</button>'+DATA.provinces.filter(p=>p.status!=="INACTIVE").map(p=>`<button class="chip" data-province="${AppUtils.esc(p.province_id)}">${AppUtils.esc(p.name)}</button>`).join("");
 el.querySelectorAll("button").forEach(b=>b.onclick=()=>{activeProvince=b.dataset.province;el.querySelectorAll("button").forEach(x=>x.classList.toggle("selected",x===b));renderCultures()});
}
function renderCultures(){
 const q=$("#searchInput").value.toLowerCase(); const rows=DATA.cultures.filter(c=>(!activeProvince||c.province_id===activeProvince)&&(`${c.name} ${c.short_description} ${c.location}`).toLowerCase().includes(q));
 $("#cultureGrid").innerHTML=rows.length?rows.map(c=>`<article class="culture-card"><img loading="lazy" src="${AppUtils.esc(AppUtils.safeUrl(c.cover_url)||"")}" alt="${AppUtils.esc(c.name)}" onerror="this.style.display='none'"><div class="card-body"><div class="card-meta">${AppUtils.esc(provinceName(c.province_id))} · ${AppUtils.esc(categoryName(c.category_id))}</div><h3>${AppUtils.esc(c.name)}</h3><p>${AppUtils.esc(c.short_description||"Jelajahi kisah budaya daerah ini.")}</p><a class="text-link" href="#" onclick="openCulture('${AppUtils.esc(c.culture_id)}');return false">Jelajahi budaya ↗</a></div></article>`).join(""):'<div class="empty">Belum ada budaya yang dipublikasikan.</div>';
}
function renderMedia(){
 const rows=DATA.media.filter(m=>m.status!=="INACTIVE").slice(0,9);
 $("#mediaGrid").innerHTML=rows.length?rows.map(m=>`<div class="media-tile" role="button" tabindex="0" onclick="openMedia('${AppUtils.esc(m.media_id)}')">${m.thumbnail_url?`<img loading="lazy" src="${AppUtils.esc(AppUtils.safeUrl(m.thumbnail_url))}" alt="">`:m.media_type==="IMAGE"?`<img loading="lazy" src="${AppUtils.esc(AppUtils.safeUrl(m.media_url))}" alt="">`:""}<div class="tile-label"><small>${AppUtils.esc(m.media_type)}</small>${AppUtils.esc(m.title)}</div></div>`).join(""):'<div class="loading">Belum ada media aktif.</div>';
}
function renderArticles(){
 const rows=DATA.articles.filter(a=>a.status==="PUBLISHED").slice(0,6);
 $("#articleGrid").innerHTML=rows.length?rows.map(a=>`<article class="article-card">${a.cover_url?`<img loading="lazy" src="${AppUtils.esc(AppUtils.safeUrl(a.cover_url))}" alt="">`:""}<div class="card-body"><div class="card-meta">${AppUtils.esc(AppUtils.date(a.published_at))}</div><h3>${AppUtils.esc(a.title)}</h3><p>${AppUtils.esc(a.excerpt||"")}</p><a class="text-link" href="#" onclick="openArticle('${AppUtils.esc(a.article_id)}');return false">Baca artikel ↗</a></div></article>`).join(""):'<div class="empty">Belum ada artikel terbit.</div>';
}
function provinceName(id){return DATA.provinces.find(x=>x.province_id===id)?.name||"Nusantara"}
function categoryName(id){return DATA.categories.find(x=>x.category_id===id)?.name||"Budaya"}
function showModal(html){$("#modalContent").innerHTML=html;$("#mediaModal").classList.add("open");$("#mediaModal").setAttribute("aria-hidden","false")}
function closeModal(){const c=$("#modalContent");c.querySelectorAll("video,audio").forEach(x=>x.pause());c.innerHTML="";$("#mediaModal").classList.remove("open");$("#mediaModal").setAttribute("aria-hidden","true")}
function openMedia(id){
 const m=DATA.media.find(x=>x.media_id===id);if(!m)return;const u=AppUtils.safeUrl(m.media_url);if(!u)return;
 let html="";
 if(m.media_type==="IMAGE")html=`<img src="${u}" alt="${AppUtils.esc(m.title)}">`;
 else if(m.media_type==="VIDEO"||m.media_type==="AUDIO"){const yt=AppUtils.youtubeEmbed(u);if(yt){const height=m.media_type==="AUDIO"?152:506;html=`<iframe title="${AppUtils.esc(m.title)}" width="900" height="${height}" src="${yt}" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`}else if(m.media_type==="VIDEO")html=`<video src="${u}" controls playsinline preload="metadata"></video>`;else html=`<h2>${AppUtils.esc(m.title)}</h2><audio src="${u}" controls preload="metadata"></audio>`}
 else html=`<a class="btn btn-orange" href="${u}" target="_blank" rel="noopener">Buka sumber media ↗</a>`;
 showModal(html);
}
function openCulture(id){
 const c=DATA.cultures.find(x=>x.culture_id===id);if(!c)return;
 const media=DATA.media.filter(m=>m.culture_id===id&&m.status!=="INACTIVE");
 showModal(`<div class="detail-view"><h2>${AppUtils.esc(c.name)}</h2><p>${AppUtils.esc(provinceName(c.province_id))} · ${AppUtils.esc(c.location||"Indonesia")}</p>${c.cover_url?`<img src="${AppUtils.esc(AppUtils.safeUrl(c.cover_url))}" alt="">`:""}<p>${AppUtils.esc(c.content||c.short_description||"")}</p><div class="detail-media">${media.map(m=>`<button class="btn btn-orange" onclick="openMedia('${AppUtils.esc(m.media_id)}')">${AppUtils.esc(m.media_type)}: ${AppUtils.esc(m.title)}</button>`).join(" ")}</div></div>`);
}
function openArticle(id){const a=DATA.articles.find(x=>x.article_id===id);if(!a)return;showModal(`<article class="article-reader"><h2>${AppUtils.esc(a.title)}</h2><p>${AppUtils.esc(a.author||"Redaksi")} · ${AppUtils.esc(AppUtils.date(a.published_at))}</p>${a.cover_url?`<img src="${AppUtils.esc(AppUtils.safeUrl(a.cover_url))}" alt="">`:""}<div class="article-content">${AppUtils.esc(a.content||"").replace(/\n/g,"<br>")}</div></article>`)}
window.openCulture=openCulture;window.openMedia=openMedia;window.openArticle=openArticle;