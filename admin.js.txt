import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $ = id => document.getElementById(id);
const config = window.SAHAJ_CONFIG || {};
const allowedEmails = (Array.isArray(config.adminEmails) ? config.adminEmails : [config.adminEmail].filter(Boolean))
  .map(email => String(email).trim().toLowerCase()).filter(Boolean);
const categoryNames = {forms:"Forms & Applications", documents:"Documents & Certificates", payments:"Payments & Other"};
let auth = null, db = null, currentUser = null, services = [], busy = false;
function escapeHTML(v="") { return String(v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function message(id, text) { const el=$(id); if(el) el.textContent=text; }
function status(text) { if($("connection-status")) $("connection-status").textContent=text; }
function showDashboard(show) { $("dashboard").hidden=!show; $("login-panel").hidden=show; }
function setBusy(value) { busy=value; const b=$("google-login-btn"); if(b){b.disabled=value||!auth;b.textContent=value?"Please wait…":"Sign in with Google";} }
function configReady() { return Boolean(window.SAHAJ_FIREBASE_READY && config.firebase && config.firebase.apiKey && config.firebase.projectId); }
function setupMessage() {
  status("Setup required");
  $("setup-notice").hidden=false;
  $("setup-notice").textContent="Setup required: paste the complete Firebase web config into js/config.js, enable Google as a sign-in provider, add your hosting domain to Authorized domains, and publish firestore.rules.";
  setBusy(false); if($("google-login-btn")) $("google-login-btn").disabled=true;
  message("login-message","Firebase configuration is incomplete. Follow README.md first.");
}
function authErrorText(err) {
  const code=err?.code||"";
  const map={"auth/popup-closed-by-user":"Google sign-in popup was closed before completion.","auth/cancelled-popup-request":"Another sign-in popup is already open. Please try once more.","auth/popup-blocked":"Browser blocked the Google popup. Allow popups for this site and retry.","auth/unauthorized-domain":"This website domain is not authorized in Firebase Authentication settings.","auth/operation-not-allowed":"Google provider is not enabled in Firebase Authentication.","auth/network-request-failed":"Network error. Check your internet connection and retry.","auth/account-exists-with-different-credential":"This email already uses another sign-in method in Firebase."};
  return map[code] || `Google login failed (${code||"unknown error"}). Check browser console and Firebase settings.`;
}
async function initFirebase() {
  if(!configReady()){setupMessage();return;}
  try {
    const app=getApps().length?getApps()[0]:initializeApp(config.firebase);
    auth=getAuth(app); db=getFirestore(app);
    status("Firebase ready"); $("setup-notice").hidden=true; setBusy(false);
    onAuthStateChanged(auth, async user => {
      if(!user){currentUser=null;showDashboard(false);return;}
      const email=(user.email||"").trim().toLowerCase();
      if(!allowedEmails.includes(email)) {
        currentUser=null; await signOut(auth); showDashboard(false);
        message("login-message","Admin email nahi hai. js/config.js ki adminEmails list check karein."); return;
      }
      if(!user.emailVerified) {
        currentUser=null; await signOut(auth); showDashboard(false);
        message("login-message","Firebase ne is account ko verified nahi bataya. Google account/email aur Firebase Authentication status check karein."); return;
      }
      currentUser=user; showDashboard(true); $("admin-welcome").textContent=`Signed in as ${email}`;
      await loadServices();
    });
  } catch(err) { console.error("Firebase initialization error:",err); status("Setup error"); message("login-message","Firebase setup failed. Check js/config.js and browser console."); }
}
async function loginGoogle() {
  if(busy)return;
  if(!auth){message("login-message","Firebase is not configured yet.");return;}
  if(!allowedEmails.length || allowedEmails.some(e=>e.includes("second_admin_email"))){
    message("login-message","Please replace SECOND_ADMIN_EMAIL@gmail.com with the real second admin email in js/config.js.");
    // Allow login with first admin while the second email placeholder is being replaced.
  }
  setBusy(true); message("login-message","Opening Google sign-in…");
  try {
    const provider=new GoogleAuthProvider(); provider.setCustomParameters({prompt:"select_account"});
    const result=await signInWithPopup(auth,provider);
    const email=(result.user.email||"").trim().toLowerCase();
    if(!allowedEmails.includes(email)) {
      await signOut(auth); showDashboard(false);
      message("login-message","Admin email nahi hai. Is Google email ko js/config.js ke adminEmails mein add karein.");
      return;
    }
    if(!result.user.emailVerified) {
      await signOut(auth); message("login-message","Email verified nahi hai. Firebase Authentication mein account status check karein."); return;
    }
    message("login-message","Login successful. Loading dashboard…");
  } catch(err) { console.error("Google login error:",err); message("login-message",authErrorText(err)); }
  finally { setBusy(false); }
}
async function loadServices() {
  message("editor-message","");
  try {
    const snap=await getDocs(query(collection(db,"services"),orderBy("name")));
    services=snap.docs.map(d=>({id:d.id,...d.data(),_exists:true}));
    $("data-notice").textContent=services.length?"Changes are saved to Firestore and published services appear on the public site.":"Firestore has no service documents yet. Use Add New Service to create your first service; no sample records were written automatically.";
    renderTable(); return true;
  } catch(err) {
    console.error("Load services error:",err); message("editor-message","Could not load services. Check Firestore rules, network, and browser console.");
    $("data-notice").textContent="Service loading failed. The list below may be stale; do not edit until the connection is restored.";
    return false;
  }
}
function renderTable() {
  $("total-count").textContent=services.length;
  $("published-count").textContent=services.filter(s=>s.published===true).length;
  $("hidden-count").textContent=services.filter(s=>s.published===false).length;
  const body=$("admin-services");
  if(!services.length){body.innerHTML='<tr><td colspan="5">No services found. Click “Add New Service” to create one.</td></tr>';return;}
  body.innerHTML=services.map(s=>`<tr><td><strong>${escapeHTML(s.icon||"📄")} ${escapeHTML(s.name||"Unnamed service")}</strong><small>${escapeHTML(s.description||"")}</small></td><td>${escapeHTML(categoryNames[s.category]||s.category||"Other")}</td><td>${escapeHTML(s.price||"Ask for fee")}</td><td><span class="badge-status ${s.published===false?"hidden-status":""}">${s.published===false?"Hidden":"Published"}</span></td><td><div class="table-actions"><button class="small-btn" data-edit="${escapeHTML(s.id)}">Edit</button><button class="small-btn" data-toggle="${escapeHTML(s.id)}">${s.published===false?"Publish":"Hide"}</button><button class="small-btn danger" data-delete="${escapeHTML(s.id)}">Delete</button></div></td></tr>`).join("");
  body.querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>openEditor(services.find(s=>s.id===b.dataset.edit))));
  body.querySelectorAll("[data-toggle]").forEach(b=>b.addEventListener("click",()=>togglePublished(b.dataset.toggle)));
  body.querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",()=>removeService(b.dataset.delete)));
}
function openEditor(s=null) {
  $("service-editor").hidden=false; $("editor-title").textContent=s?"Edit service":"Add a service"; $("service-id").value=s?.id||"";
  $("service-name").value=s?.name||""; $("service-price").value=s?.price||""; $("service-category-input").value=s?.category||"forms";
  $("service-icon").value=s?.icon||"📄"; $("service-description").value=s?.description||""; $("service-published").checked=s?.published!==false;
  message("editor-message",""); $("service-editor").scrollIntoView({behavior:"smooth",block:"start"});
}
function closeEditor(){ $("service-editor").hidden=true; }
async function saveService(event) {
  event.preventDefault(); if(!currentUser||!db){message("editor-message","Please sign in after Firebase setup.");return;}
  const id=$("service-id").value;
  const data={name:$("service-name").value.trim(),price:$("service-price").value.trim()||"Ask for fee",category:$("service-category-input").value,icon:$("service-icon").value.trim()||"📄",description:$("service-description").value.trim(),published:$("service-published").checked,updatedAt:serverTimestamp()};
  if(!data.name||!data.description){message("editor-message","Name and description are required.");return;}
  const btn=$("service-editor").querySelector('button[type="submit"]'); btn.disabled=true;
  try {
    if(id) await updateDoc(doc(db,"services",id),data);
    else {data.createdAt=serverTimestamp();await addDoc(collection(db,"services"),data);}
    const loaded=await loadServices(); closeEditor(); message("editor-message",loaded?"Saved successfully to Firestore.":"Saved to Firestore, but refreshing the list failed. Reload before making another change.");
  } catch(err) { console.error("Save service error:",err); message("editor-message","Save failed. Check Firestore rules and admin permissions."); }
  finally {btn.disabled=false;}
}
async function togglePublished(id) {
  if(!currentUser||!db||busy)return; const s=services.find(x=>x.id===id); if(!s||!s._exists)return;
  busy=true;
  try {await updateDoc(doc(db,"services",id),{published:s.published===false,updatedAt:serverTimestamp()});await loadServices();}
  catch(err){console.error("Publish toggle error:",err);message("editor-message","Could not update publication status. Check Firestore permissions.");}
  finally{busy=false;}
}
async function removeService(id) {
  if(!currentUser||!db||busy)return; const s=services.find(x=>x.id===id); if(!s||!s._exists)return;
  if(!confirm(`Delete “${s.name||"this service"}”? This cannot be undone.`))return;
  busy=true;
  try {await deleteDoc(doc(db,"services",id));await loadServices();}
  catch(err){console.error("Delete service error:",err);message("editor-message","Could not delete service. Check Firestore permissions.");}
  finally{busy=false;}
}
document.addEventListener("DOMContentLoaded",()=>{
  $("google-login-btn")?.addEventListener("click",loginGoogle);
  $("service-editor")?.addEventListener("submit",saveService);
  $("add-service-btn")?.addEventListener("click",()=>openEditor());
  $("close-editor")?.addEventListener("click",closeEditor); $("cancel-editor")?.addEventListener("click",closeEditor);
  $("logout-btn")?.addEventListener("click",async()=>{try{if(auth)await signOut(auth);}catch(e){console.error(e);message("login-message","Sign out failed. Refresh and retry.");}});
  if(configReady()) initFirebase(); else setupMessage();
});
