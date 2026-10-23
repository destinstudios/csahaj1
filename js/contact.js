document.addEventListener("DOMContentLoaded",()=>{
 const form=document.getElementById("enquiry-form");if(!form)return;
 form.addEventListener("submit",event=>{
  event.preventDefault();
  const data=new FormData(form);
  const name=String(data.get("name")||"").trim();
  const service=String(data.get("service")||"").trim();
  const message=String(data.get("message")||"").trim();
  if(!name||!service){alert("Please enter your name and select a service.");return;}
  const text=`Namaste, main ${name} hoon. Mujhe ${service} ke baare mein enquiry karni hai.${message?`\nMessage: ${message}`:""}\nKripya fee aur required documents bata dein.`;
  const number=(window.SAHAJ_CONFIG.whatsappNumber||"").replace(/\D/g,"");
  if(!number){alert("WhatsApp number setup nahi hai.");return;}
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`,"_blank","noopener");
 });
});
