import { getPublicServices, escapeServiceHTML } from "./public-services.js";
const categoryNames={forms:"Forms & Applications",documents:"Documents & Certificates",payments:"Payments & Other"};
function render(services){
 const container=document.getElementById("services-list"); if(!container)return;
 const term=(document.getElementById("service-search")?.value||"").trim().toLowerCase();
 const category=document.getElementById("service-category")?.value||"all";
 const visible=services.filter(s=>s.published===true)
  .filter(s=>(category==="all"||s.category===category))
  .filter(s=>`${s.name||""} ${s.description||""} ${s.category||""}`.toLowerCase().includes(term));
 container.innerHTML=visible.map((s,i)=>`<article class="service-card"><div class="service-icon ${["blue","violet","green","orange","teal","rose","indigo","slate"][i%8]}">${escapeServiceHTML(s.icon||"📄")}</div><h3>${escapeServiceHTML(s.name||"Service")}</h3><p>${escapeServiceHTML(s.description||"")}</p><div class="service-card-bottom"><span class="price">${escapeServiceHTML(s.price||"Ask for fee")}</span><a data-service-whatsapp="${escapeServiceHTML(s.name||"Service")}" href="#">Enquire ↗</a></div><small class="category-note">${escapeServiceHTML(categoryNames[s.category]||"Service")}</small></article>`).join("");
 const empty=document.getElementById("services-empty"); if(empty){empty.hidden=visible.length>0;empty.textContent=services.length?"No services match your search. Try another keyword.":"No published services are available right now. Please contact the centre.";}
 const digits=(window.SAHAJ_CONFIG?.whatsappNumber||"").replace(/\D/g,"");
 container.querySelectorAll("[data-service-whatsapp]").forEach(a=>{a.href=digits?`https://wa.me/${digits}?text=${encodeURIComponent(`Namaste, mujhe ${a.dataset.serviceWhatsapp} ke baare mein details aur fees chahiye.`)}`:"#";a.target="_blank";a.rel="noopener";});
}
document.addEventListener("DOMContentLoaded",async()=>{
 const search=document.getElementById("service-search"),category=document.getElementById("service-category");
 let all=[];
 const rerender=()=>render(all); search?.addEventListener("input",rerender);category?.addEventListener("change",rerender);
 try{all=await getPublicServices();render(all);}catch(err){const box=document.getElementById("services-empty");if(box){box.hidden=false;box.textContent="Services could not be loaded right now. Please contact the centre on WhatsApp.";}console.error(err);}
});
