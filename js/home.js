import { getPublicServices, escapeServiceHTML } from "./public-services.js";
document.addEventListener("DOMContentLoaded",async()=>{
 const container=document.getElementById("home-services");if(!container)return;
 try{
  const services=(await getPublicServices()).filter(s=>s.published===true).slice(0,4);
  if(!services.length){container.innerHTML='<p class="empty-state">No published services are available right now. Please contact us for details.</p>';return;}
  const digits=(window.SAHAJ_CONFIG?.whatsappNumber||"").replace(/\D/g,"");
  container.innerHTML=services.map((s,i)=>`<article class="service-card"><div class="service-icon ${["blue","violet","green","orange"][i%4]}">${escapeServiceHTML(s.icon||"📄")}</div><h3>${escapeServiceHTML(s.name||"Service")}</h3><p>${escapeServiceHTML(s.description||"")}</p><div class="service-card-bottom"><span class="price">${escapeServiceHTML(s.price||"Ask for fee")}</span><a data-service-whatsapp="${escapeServiceHTML(s.name||"Service")}" href="#">Enquire ↗</a></div></article>`).join("");
  container.querySelectorAll("[data-service-whatsapp]").forEach(a=>{a.href=digits?`https://wa.me/${digits}?text=${encodeURIComponent(`Namaste, mujhe ${a.dataset.serviceWhatsapp} ke baare mein details aur fees chahiye.`)}`:"#";a.target="_blank";a.rel="noopener";});
 }catch(err){console.error("Home services load failed:",err);container.innerHTML='<p class="empty-state">Services could not be loaded right now. Please contact us for details.</p>';}
});
