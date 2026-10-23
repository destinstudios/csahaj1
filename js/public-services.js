import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const FALLBACK_SERVICES = [
 {id:"online-form",name:"Online Form Filling",description:"Online application forms bharne mein assistance.",price:"₹100",category:"forms",icon:"📄",published:true},
 {id:"scholarship",name:"Scholarship Forms",description:"Scholarship application process aur form filling mein assistance.",price:"Ask for fee",category:"forms",icon:"🎓",published:true},
 {id:"pan-card",name:"PAN Card Assistance",description:"PAN application process ke baare mein guidance aur form assistance.",price:"Ask for fee",category:"documents",icon:"🪪",published:true},
 {id:"certificates",name:"Income / Caste / Residence Certificate",description:"Relevant certificate applications ke liye form assistance aur guidance.",price:"Ask for fee",category:"documents",icon:"📑",published:true},
 {id:"bill-payment",name:"Bill Payment Assistance",description:"Available bill payment services ke liye enquiry karein.",price:"Ask for fee",category:"payments",icon:"💡",published:true},
 {id:"printout",name:"Printout & Photocopy",description:"Documents ke printout aur photocopy ke liye contact karein.",price:"Ask for fee",category:"documents",icon:"🖨️",published:true},
 {id:"schemes",name:"Government Scheme Assistance",description:"Available schemes ki information aur application guidance.",price:"Ask for fee",category:"forms",icon:"🏛️",published:true},
 {id:"banking",name:"Banking / AEPS (if authorized)",description:"Banking/AEPS services sirf required authorization hone par.",price:"Ask for fee",category:"payments",icon:"🏦",published:true}
];
let cache=null;
export async function getPublicServices(){
 if(cache)return cache;
 const cfg=window.SAHAJ_CONFIG||{};
 if(!window.SAHAJ_FIREBASE_READY){cache=FALLBACK_SERVICES;return cache;}
 try{
  const app=getApps().length?getApps()[0]:initializeApp(cfg.firebase);
  const db=getFirestore(app);
  const snap=await getDocs(query(collection(db,"services"),where("published","==",true)));
  cache=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>String(a.name||"").localeCompare(String(b.name||"")));
  return cache;
 }catch(err){console.error("Public Firestore service load failed:",err);throw err;}
}
export function escapeServiceHTML(value=""){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
