/* ========= API CONFIG ========= */
const API_BASE = "http://localhost:3000";
const ENDPOINTS = {
  login: `${API_BASE}/auth/login`,
  signup: `${API_BASE}/auth/register`,    // register endpoint you gave
  events: `${API_BASE}/events`,
  myEvents: `${API_BASE}/events/my-events`,
  share: (id) => `${API_BASE}/events/share/${id}`,
  initPayment: `${API_BASE}/payments/initialize`,
  verifyPayment: `${API_BASE}/payments/verify`,
  ticket: (eventId) => `${API_BASE}/events/ticket/${eventId}`,
  analyticsOverall: `${API_BASE}/analytics/overall`,
  analyticsEvent: (id) => `${API_BASE}/analytics/events/${id}`,
  analyticsRevenueOverTime: (id) => `${API_BASE}/analytics/events/${id}/revenue-over-time`,
  createEvent: `${API_BASE}/events/create`,
  emailReceipt: `${API_BASE}/emails/receipt` // optional server emailer; we fall back to mailto
};

/* ========= STATIC ASSETS ========= */
// Your preferred random card images:
const CARD_IMAGES = [
  "images/coc.jpg",
  "images/coc2.jpg",
  "images/coc3.jpeg",
];

// Your **realistic QR placeholder PNG** (will be used if generation > 3s)
const QR_PLACEHOLDER = "images/QR.png";

/* ========= DOM/UTILS ========= */
const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
function toast(msg, ms=2200){ const el=$("#toast"); if(!el) return; el.textContent=msg; el.classList.add("show"); setTimeout(()=> el.classList.remove("show"), ms); }
function fmtDate(iso){ try{ return new Date(iso).toLocaleString(); }catch{ return iso||""; } }
function capitalize(s){ return s ? s[0].toUpperCase()+s.slice(1) : ""; }
function escapeHtml(s){ return (s||"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
function formatMoneyNGN(v){ if(v==null||isNaN(v)) return "—"; const n=v>100000? Math.round(v/100): v; return `₦${n.toLocaleString("en-NG")}`; }
function safeJson(txt){ try{ return JSON.parse(txt); }catch{ return null; } }

function getAuth(){ try{ return { token:localStorage.getItem("authToken"), user:JSON.parse(localStorage.getItem("authUser")||"null") }; }catch{ return { token:null, user:null }; } }
function setAuth(token, user){ localStorage.setItem("authToken", token); localStorage.setItem("authUser", JSON.stringify(user||{})); }
function logout(){ localStorage.removeItem("authToken"); localStorage.removeItem("authUser"); location.href="login.html"; }
function authHeaders(){ const {token}=getAuth(); return token? { "Authorization":`Bearer ${token}` } : {}; }

function openDropdown(btn){ const dd=btn.closest(".dropdown"); if(!dd) return; $$(".dropdown").forEach(d=>d!==dd&&d.classList.remove("open")); dd.classList.toggle("open"); }
document.addEventListener("click",(e)=>{ const b=e.target.closest(".dropdown-btn"); if(b){ openDropdown(b); return; } if(!e.target.closest(".dropdown-menu")) $$(".dropdown").forEach(d=>d.classList.remove("open")); });

/* ========= Minimal QR generator (embedded, canvas) ========= */
(function(q){function H(a,b){this._el=a;this._htOption=b}function I(a){this.mode=K;this.data=a}function L(a,b){this.typeNumber=a;this.errorCorrectLevel=b;this.modules=null;this.moduleCount=0;this.dataCache=null;this.dataList=[]}var K=4,O={L:1,M:0,Q:3,H:2};H.prototype={makeCode:function(a){this._oQRCode=new L(0,O.M);this._oQRCode.addData(a||"");this._oQRCode.make();this._el.innerHTML="";var c=document.createElement("canvas");c.width=c.height=180;var x=c.getContext("2d");for(var i=0;i<c.width;i++)for(var j=0;j<c.height;j++){var r=Math.floor(i/(c.width/this._oQRCode.getModuleCount())),s=Math.floor(j/(c.height/this._oQRCode.getModuleCount()));x.fillStyle=this._oQRCode.isDark(s,r)?"#000":"#fff";x.fillRect(i,j,1,1)}this._el.appendChild(c)} };I.prototype={getLength:function(){return this.data.length},write:function(a){for(var i=0;i<this.data.length;i++)a.put(this.data.charCodeAt(i),8)}};L.prototype={addData:function(a){this.dataList.push(new I(a));this.dataCache=null},isDark:function(a,b){return this.modules[a][b]},getModuleCount:function(){return this.moduleCount},make:function(){this.typeNumber=4;this.moduleCount=21;this.modules=Array(this.moduleCount);for(var a=0;a<this.moduleCount;a++){this.modules[a]=Array(this.moduleCount);for(var b=0;b<this.moduleCount;b++)this.modules[a][b]=null}this.setupPositionProbePattern(0,0);this.setupPositionProbePattern(this.moduleCount-7,0);this.setupPositionProbePattern(0,this.moduleCount-7);this.mapData(this.createData())},setupPositionProbePattern:function(a,b){for(var r=-1;7>=r;r++)if(!(0>a+r||this.moduleCount<=a+r))for(var s=-1;7>=s;s++)0>b+s||this.moduleCount<=b+s||(this.modules[a+r][b+s]=0<=r&&6>=r&&(0==s||6==s)||0<=s&&6>=s&&(0==r||6==r)||2<=r&&4>=r&&2<=s&&4>=s)},mapData:function(a){for(var b=0,c=this.moduleCount-1,d=this.moduleCount-1,e=1;0<d;d-=2)for(6==d&&d--;;){for(var f=0;2>f;f++)null==this.modules[c][d-f]&&(b<a.length?(this.modules[c][d-f]=1==(a[b>>>3]>>>7-b%8&1)):this.modules[c][d-f]=0);c+=e;if(0>c||this.moduleCount<=c){c-=e;e=-e;break}}},createData:function(){for(var a=[],i=0;i<this.dataList.length;i++){var d=this.dataList[i];a.push(4);a.push(d.getLength());for(var j=0;j<d.data.length;j++)a.push(d.data.charCodeAt(j))}for(;a.length<152;)a.push(0);for(i=0;i<a.length;i++)a[i]&=255;return a}};q.QRCode=H})(window);

/**
 * Build a QR as PNG DataURL using embedded generator.
 * If the generator fails, return the placeholder file to keep it real-looking.
 */
async function makeQrDataUrl(text){
  try{
    const wrap=document.createElement("div");
    new QRCode(wrap, text||"");
    const c=wrap.querySelector("canvas");
    if(c) return c.toDataURL("image/png");
  }catch(e){ /* ignore */ }
  // Fallback to your PNG asset
  return QR_PLACEHOLDER;
}

/**
 * Ensure an <img> gets a QR within timeoutMs.
 * If generation exceeds timeout, immediately show the placeholder PNG,
 * then replace it if real QR finishes later.
 */
async function ensureQrImg(imgEl, text, timeoutMs=3000){
  let settled=false;
  const t=setTimeout(()=>{
    if(!settled){ imgEl.src = QR_PLACEHOLDER; }
  }, timeoutMs);

  const png = await makeQrDataUrl(text);
  settled = true; clearTimeout(t);
  imgEl.src = png;
}

function downloadSrc(src, filename="qr.png"){
  const a=document.createElement("a");
  a.href=src; a.download=filename; a.click();
}

/* ========= ROUTER ========= */
document.addEventListener("DOMContentLoaded", ()=>{
  const page=document.body.dataset.page;
  const { token, user } = getAuth();

  $("#logoutBtn")?.addEventListener("click", logout);
  if($("#loginBtn")) $("#loginBtn").style.display = token ? "none":"inline-flex";
  $$(".only-creator").forEach(el=> el.style.display = (user && user.role==="CREATOR") ? "inline-flex":"none");

  if(page==="login") initLogin();
  if(page==="signup") initSignup();
  if(page==="home") initHome();
  if(page==="tickets") initTickets();
  if(page==="analytics") initAnalytics();
  if(page==="create-event") initCreateEvent();
  if(page==="receipt") initReceipt();
  if(location.pathname.endsWith("payment-callback.html")) initPaymentCallback();

  // Google buttons — info only
  $("#googleLogin")?.addEventListener("click", ()=> toast("Got yah, this feature will be available in the next upgrade"));
  $("#googleSignup")?.addEventListener("click", ()=> toast("Got yah, this feature will be available in the next upgrade"));

  // Password-eye toggles
  $$(".eye").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const input=document.getElementById(btn.dataset.target);
      if(input) input.type = input.type==="password" ? "text":"password";
    });
  });
});

/* ========= LOGIN ========= */
function initLogin(){
  $("#loginForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    const payload={ email:fd.get("email"), password:fd.get("password") };

    try{
      const res=await fetch(ENDPOINTS.login,{ method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(payload) });
      const txt=await res.text(); const data=safeJson(txt);
      if(!res.ok) throw new Error(data?.message||"Login failed");
      const token=data.token||data.access_token||data.jwt;
      const user = data.user || { email:payload.email, role:data.role||"EVENTEE" };
      if(!token) throw new Error("No token returned");
      setAuth(token,user);
      toast("Welcome back!");
      location.href="index.html";
    }catch(err){ toast(err.message||"Login failed"); }
  });
}

/* ========= SIGNUP ========= */
function initSignup(){
  const form=$("#signupForm");
  const confirm=$("#confirmPwd"), pwd=$("#signupPwd"), hint=$("#confirmMsg");

  function matches(){ const ok=!pwd.value || !confirm.value || (pwd.value===confirm.value); hint.classList.toggle("hidden", ok); return ok; }
  confirm.addEventListener("input", ()=>{ if(!matches()) toast("Passwords do not match"); });
  pwd.addEventListener("input", ()=>{ if(!matches()) toast("Passwords do not match"); });

  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    if(!matches()){ toast("Passwords do not match"); return; }
    const fd=new FormData(form);
    const email=fd.get("email"), password=fd.get("password"), role=fd.get("role");

    try{
      // Register
      const r1=await fetch(ENDPOINTS.signup,{ method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ email, password, role }) });
      const t1=await r1.text(); const j1=safeJson(t1);
      if(!r1.ok) throw new Error(j1?.message||"Sign up failed");
      toast(j1?.message||"User registered successfully");

      // Auto login → Home
      const r2=await fetch(ENDPOINTS.login,{ method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ email, password }) });
      const t2=await r2.text(); const j2=safeJson(t2);
      if(!r2.ok) throw new Error(j2?.message||"Auto login failed");
      const token=j2.token||j2.access_token||j2.jwt; const user=j2.user||{ email, role };
      if(!token) throw new Error("No token returned");
      setAuth(token,user);
      toast("Welcome 👋");
      location.href="index.html";
    }catch(err){ toast(err.message||"Sign up failed"); }
  });
}

/* ========= HOME (grid + filters + pagination + share + buy) ========= */
function initHome(){
  const { token } = getAuth(); if(!token){ location.href="login.html"; return; }
  const grid=$("#grid"), empty=$("#emptyState"), pager=$("#pagination");
  const state={ search:"", location:"", price:"any", freeOnly:false, sort:"date-asc", startDate:"", endDate:"", category:"concerts", page:1 };

  // Controls
  $("#searchInput").addEventListener("input", e=>{ state.search=e.target.value.trim(); state.page=1; render(); });
  $("#locationMenu").addEventListener("click", e=>{ const it=e.target.closest(".menu-item"); if(!it) return; state.location=it.dataset.location||""; $("#locationBtn").textContent=state.location?capitalize(state.location):"Anywhere"; state.page=1; render(); });
  $("#dateBtn").addEventListener("click", ()=> openDropdown($("#dateBtn")));
  $("#applyDate").addEventListener("click", ()=>{ state.startDate=$("#startDate").value||""; state.endDate=$("#endDate").value||""; $("#dateBtn").textContent=(state.startDate||state.endDate)?"Custom date":"Any date"; $(".dropdown.open")?.classList.remove("open"); state.page=1; render(); });
  $("#clearDate").addEventListener("click", ()=>{ $("#startDate").value=""; $("#endDate").value=""; state.startDate=""; state.endDate=""; $("#dateBtn").textContent="Any date"; state.page=1; render(); });
  $("#priceMenu").addEventListener("click", e=>{ const it=e.target.closest(".menu-item"); if(!it) return; state.price=it.dataset.price; $("#priceBtn").textContent=it.textContent; state.page=1; render(); });
  $("#freeOnlyToggle").addEventListener("change", e=>{ state.freeOnly=e.target.checked; state.page=1; render(); });
  $("#sortMenu").addEventListener("click", e=>{ const it=e.target.closest(".menu-item"); if(!it) return; state.sort=it.dataset.sort; $("#sortBtn").textContent=it.textContent; state.page=1; render(); });
  $$(".chip-row .chip").forEach(ch=> ch.addEventListener("click", ()=>{ $$(".chip-row .chip").forEach(c=>c.classList.remove("chip-active")); ch.classList.add("chip-active"); if(ch.id==="mapChip"){ toast("Got yah , This feature will be available in the next upgrade"); return; } state.category=ch.dataset.cat; state.page=1; render(); }));
  window.addEventListener("resize", ()=> render());

  // Data
  let raw=[];
  async function load(){
    try{
      const res=await fetch(ENDPOINTS.events,{ headers:{ ...authHeaders() } });
      if(!res.ok) throw new Error();
      raw=await res.json();

      // Normalize thumb: ensure we keep a ready-to-use <img> tag for every card
      raw.forEach(ev=>{
        const path = (ev.imageUrl || ev.image || ev.thumbnail || ev.photo || ev.banner || CARD_IMAGES[Math.floor(Math.random()*CARD_IMAGES.length)]);
        ev._thumbTag = `<img src="${path}" alt="Event">`;
        ev._thumbPath = path;
      });
      render();
    }catch{ toast("Failed to load events"); }
  }

  function matchesCategory(ev,cat){ const t=(ev.title||"").toLowerCase(), d=(ev.description||"").toLowerCase(); if(cat==="concerts") return true; if(cat==="theater") return t.includes("theater")||t.includes("theatre")||d.includes("theater")||d.includes("theatre"); if(cat==="sports") return t.includes("sport")||d.includes("sport"); if(cat==="arts") return t.includes("art")||d.includes("art"); if(cat==="community") return t.includes("community")||d.includes("community"); if(cat==="food-drink") return /food|drink/.test(t)||/food|drink/.test(d); if(cat==="food") return t.includes("food")||d.includes("food"); return true; }
  function inDateRange(ev){ if(!state.startDate && !state.endDate) return true; const dt=new Date(ev.date); if(state.startDate && dt < new Date(state.startDate)) return false; if(state.endDate && dt > new Date(state.endDate+"T23:59:59")) return false; return true; }
  function matchesSearch(ev){ if(!state.search) return true; const q=state.search.toLowerCase(); const t=(ev.title||"").toLowerCase(), d=(ev.description||"").toLowerCase(); if(t.includes(q)||d.includes(q)) return true; if(/^\d{4}-\d{2}-\d{2}$/.test(q)) return new Date(ev.date).toISOString().slice(0,10)===q; return false; }
  function matchesLocation(ev){ if(!state.location) return true; const loc=((ev.location||"") + " " + (ev.venue||"")).toLowerCase(); return loc.includes(state.location.toLowerCase()); }
  function matchesPrice(ev){ const p=ev.price, has=typeof p==="number"; if(state.freeOnly){ if(has) return p===0; return false; } if(state.price==="any") return true; if(!has) return true; if(state.price==="free") return p===0; if(state.price.includes("-")){ const [a,b]=state.price.split("-").map(Number); return p>=a && p<=b; } if(state.price.endsWith("+")){ const a=Number(state.price.replace("+","")); return p>=a; } return true; }
  function sortList(list){ switch(state.sort){ case "name-asc": return list.sort((a,b)=>(a.title||"").localeCompare(b.title||"")); case "name-desc": return list.sort((a,b)=>(b.title||"").localeCompare(a.title||"")); case "date-asc": return list.sort((a,b)=> new Date(a.date)-new Date(b.date)); case "date-desc": return list.sort((a,b)=> new Date(b.date)-new Date(a.date)); default: return list; } }
  function cols(){ const styles=getComputedStyle(grid); return styles.gridTemplateColumns.split(' ').length || 4; }

  function render(){
    const filtered=sortList(raw.filter(ev=> matchesCategory(ev,state.category)&&inDateRange(ev)&&matchesSearch(ev)&&matchesLocation(ev)&&matchesPrice(ev)));
    const columns=cols(); const pageSize=columns*3; const pages=Math.max(1, Math.ceil(filtered.length/pageSize)); if(state.page>pages) state.page=pages;

    grid.innerHTML="";
    if(filtered.length===0){ empty.classList.remove("hidden"); pager.innerHTML=""; return; }
    empty.classList.add("hidden");

    const start=(state.page-1)*pageSize; const slice=filtered.slice(start,start+pageSize);
    slice.forEach(ev=>{
      const card=document.createElement("div");
      card.className="card";
      card.innerHTML=`
        ${ev._thumbTag}
        <div class="card-body">
          <div class="title">${escapeHtml(ev.title||"Untitled Event")}</div>
          <div class="sub">${fmtDate(ev.date)}</div>
          <div class="sub">${escapeHtml(ev.description||"")}</div>
          <div class="footer">
            <div class="price">${typeof ev.price==="number" ? `From ${formatMoneyNGN(ev.price)}` : ""}</div>
            <div><button class="btn btn-primary buy-btn">Buy Tickets</button></div>
          </div>
        </div>`;
      $(".buy-btn",card).addEventListener("click", ()=> openEventModal(ev));
      grid.appendChild(card);
    });

    // Pager
    pager.innerHTML="";
    for(let p=1;p<=pages;p++){
      const b=document.createElement("button");
      b.className="page-btn"+(p===state.page?" active":"");
      b.textContent=p;
      b.addEventListener("click", ()=>{ state.page=p; render(); });
      pager.appendChild(b);
    }
  }

  async function shareEvent(ev){
    try{
      const r=await fetch(ENDPOINTS.share(ev._id),{ headers:{ ...authHeaders() } });
      if(!r.ok) throw new Error();
      const { shareUrl } = await r.json();
      const url = shareUrl || `${location.origin}/events/${ev._id}`;

      // Ensure QR appears within 3s (else your PNG placeholder)
      await ensureQrImg($("#shareQrImg"), url, 3000);

      // Download QR
      $("#downloadQr").onclick = ()=> downloadSrc($("#shareQrImg").src, `${(ev.title||"event").replace(/\s+/g,"_")}_qr.png`);

      // Printable PDF view
      $("#downloadSharePdf").onclick = ()=>{
        const w=window.open("","_blank");
        const qr = $("#shareQrImg").src;
        w.document.write(`
          <html><head><title>${escapeHtml(ev.title||"Event")} — Share</title>
          <style>
            body{font-family:Inter,Arial;color:#111;padding:20px}
            .grid{display:grid;grid-template-columns:220px 1fr;gap:16px;align-items:start}
            img.qr{width:200px;height:200px;object-fit:contain;border:1px solid #ddd;border-radius:8px;background:#fff}
            .card{border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}
            .card img{width:100%;height:150px;object-fit:cover}
            .card .card-body{padding:12px}
            .title{font-weight:700}
            .sub{color:#555}
          </style></head><body>
            <div class="grid">
              <img class="qr" src="${qr}" alt="QR">
              <div class="card">
                <img src="${ev._thumbPath}" alt="Event" style="width:100%;height:150px;object-fit:cover">
                <div class="card-body">
                  <div class="title">${escapeHtml(ev.title||"")}</div>
                  <div class="sub">${fmtDate(ev.date)}</div>
                  <div class="sub">${escapeHtml(ev.description||"")}</div>
                  <div class="sub">Link: ${url}</div>
                </div>
              </div>
            </div>
            <script>window.onload=()=>window.print()</script>
          </body></html>
        `);
        w.document.close();
      };

      // Social + native share
      $("#shareWhatsApp").href = `https://api.whatsapp.com/send?text=${encodeURIComponent(ev.title+" — "+url)}`;
      $("#shareFacebook").href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      $("#shareX").href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(ev.title)}&url=${encodeURIComponent(url)}`;
      $("#shareTelegram").href = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(ev.title)}`;
      $("#copyLink").onclick = async ()=>{ await navigator.clipboard.writeText(url); toast("Link copied"); };
      $("#shareNative").onclick = async ()=>{ if(navigator.share){ try{ await navigator.share({ title:ev.title, text:ev.description, url }); }catch{} } else toast("Share not supported"); };

      // Preview card
      $("#sharePreview").innerHTML = `
        <div class="card">
          <img src="${ev._thumbPath}" alt="Event" style="width:100%;height:150px;object-fit:cover">
          <div class="card-body">
            <div class="title">${escapeHtml(ev.title||"")}</div>
            <div class="sub">${fmtDate(ev.date)}</div>
            <div class="sub">${escapeHtml(ev.description||"")}</div>
          </div>
        </div>`;
      $("#shareArea").classList.remove("hidden");
    }catch{ toast("Share failed"); }
  }

  function openEventModal(ev){
    $("#modalImg").src = ev._thumbPath || CARD_IMAGES[0];
    $("#modalTitle").textContent = ev.title || "Untitled Event";
    $("#modalDesc").textContent = ev.description || "";
    $("#modalDate").textContent = fmtDate(ev.date);
    $("#modalId").textContent = ev._id;
    $("#modalAmount").value = (typeof ev.price==="number" ? ev.price : 5000);

    $("#shareArea").classList.add("hidden");
    $("#eventModal").classList.remove("hidden");
    $("#cancelModalBtn").onclick = () => $("#eventModal").classList.add("hidden");
    $("#closeEventModal").onclick  = () => $("#eventModal").classList.add("hidden");
    $("#shareBtn").onclick         = () => shareEvent(ev);
    $("#confirmBuyBtn").onclick    = () => initBuy(ev);
  }

  async function initBuy(ev){
    try{
      const amount=Number($("#modalAmount").value||0);
      if(isNaN(amount)||amount<=0){ toast("Enter a valid amount"); return; }
      const r=await fetch(ENDPOINTS.initPayment,{ method:"POST", headers:{ "Content-Type":"application/json", ...authHeaders() }, body:JSON.stringify({ eventId:ev._id, amount }) });
      if(!r.ok) throw new Error();
      const d=await r.json(); const ref=d.reference; const url=d.authorization_url;
      sessionStorage.setItem("pendingPayment", JSON.stringify({ eventId:ev._id, amount, ref, img:ev._thumbPath, title:ev.title, date:ev.date, description:ev.description }));
      window.open(url, "_blank");
      $("#waitModal").classList.remove("hidden");
      $("#closeWait").onclick=()=> $("#waitModal").classList.add("hidden");
      $("#cancelWaitBtn").onclick=()=> $("#waitModal").classList.add("hidden");
      $("#verifyNowBtn").onclick=()=> verifyPending();
    }catch{ toast("Payment init failed"); }
  }

  async function verifyPending(){
    const pending=JSON.parse(sessionStorage.getItem("pendingPayment")||"null");
    if(!pending||!pending.ref){ toast("No pending payment"); return; }
    try{
      const v=await fetch(ENDPOINTS.verifyPayment,{ method:"POST", headers:{ "Content-Type":"application/json", ...authHeaders() }, body:JSON.stringify({ reference:pending.ref }) });
      const t=await v.text(); const j=safeJson(t);
      if(!v.ok || (j.status||"").toLowerCase()!=="success"){ toast(j?.message||"Payment not successful yet"); return; }

      const tr=await fetch(ENDPOINTS.ticket(pending.eventId),{ method:"POST", headers:{ ...authHeaders() } });
      const tt=await tr.text(); const tj=safeJson(tt);
      if(!tr.ok){ toast("Ticket generation failed"); return; }

      let shareUrl=""; try{ const s=await fetch(ENDPOINTS.share(pending.eventId),{ headers:{ ...authHeaders() } }); if(s.ok){ const sd=await s.json(); shareUrl=sd.shareUrl||""; } }catch{}
      const receipt={ eventId:pending.eventId,title:pending.title,date:pending.date,description:pending.description, amount:j.requested_amount ?? j.amount ?? pending.amount, status:j.status, paidAt:j.paid_at||j.paidAt, channel:j.channel, customerEmail:j.customer?.email||"", reference:j.reference||pending.ref, qrBase64:tj.qrCode||"", qrData:tj.qrData||"", img:pending.img, shareUrl };
      sessionStorage.setItem("receiptData", JSON.stringify(receipt));

      const hist=JSON.parse(localStorage.getItem("purchases")||"[]");
      hist.push({ _id:pending.eventId, title:pending.title, description:pending.description, date:pending.date, _thumbPath:pending.img, _thumbTag:`<img src="${pending.img}" alt="Event">` });
      localStorage.setItem("purchases", JSON.stringify(dedupeById(hist)));

      await trySendEmail(receipt);

      $("#waitModal").classList.add("hidden");
      location.href="receipt.html";
    }catch{ toast("Verification failed"); }
  }

  function dedupeById(list){ const m=new Map(); list.forEach(e=>m.set(e._id,e)); return [...m.values()]; }

  load();
}

/* ========= PAYMENT CALLBACK ========= */
async function initPaymentCallback(){
  const params=new URLSearchParams(location.search);
  const reference=params.get("reference");
  const pending=JSON.parse(sessionStorage.getItem("pendingPayment")||"null");
  if(!reference || !pending){ toast("Missing reference"); setTimeout(()=>location.href="index.html",1200); return; }

  try{
    const v=await fetch(ENDPOINTS.verifyPayment,{ method:"POST", headers:{ "Content-Type":"application/json", ...authHeaders() }, body:JSON.stringify({ reference }) });
    const vt=await v.text(); const j=safeJson(vt);
    if(!v.ok || (j.status||"").toLowerCase()!=="success"){ toast(j?.message||"Payment not successful"); setTimeout(()=>location.href="index.html",1200); return; }

    const tr=await fetch(ENDPOINTS.ticket(pending.eventId),{ method:"POST", headers:{ ...authHeaders() } });
    const tt=await tr.text(); const tj=safeJson(tt); if(!tr.ok){ toast("Ticket generation failed"); setTimeout(()=>location.href="index.html",1200); return; }

    let shareUrl=""; try{ const s=await fetch(ENDPOINTS.share(pending.eventId),{ headers:{ ...authHeaders() } }); if(s.ok){ const sd=await s.json(); shareUrl=sd.shareUrl||""; } }catch{}
    const receipt={ eventId:pending.eventId,title:pending.title,date:pending.date,description:pending.description, amount:j.requested_amount ?? j.amount ?? pending.amount, status:j.status, paidAt:j.paid_at||j.paidAt, channel:j.channel, customerEmail:j.customer?.email||"", reference, qrBase64:tj.qrCode||"", qrData:tj.qrData||"", img:pending.img, shareUrl };
    sessionStorage.setItem("receiptData", JSON.stringify(receipt));

    const hist=JSON.parse(localStorage.getItem("purchases")||"[]");
    hist.push({ _id:pending.eventId, title:pending.title, description:pending.description, date:pending.date, _thumbPath:pending.img, _thumbTag:`<img src="${pending.img}" alt="Event">` });
    localStorage.setItem("purchases", JSON.stringify(hist));

    await trySendEmail(receipt);

    location.href="receipt.html";
  }catch{ toast("Payment verification failed"); setTimeout(()=>location.href="index.html",1500); }
}

/* ========= RECEIPT ========= */
async function initReceipt(){
  const data=JSON.parse(sessionStorage.getItem("receiptData")||"null");
  if(!data){ location.href="index.html"; return; }

  $("#receiptImg").src = data.img || CARD_IMAGES[0];
  $("#receiptTitle").textContent = data.title || "Event";
  $("#receiptDate").textContent = fmtDate(data.date);
  $("#receiptVenue").textContent = "";

  // QR of event link (or placeholder if taking too long)
  if (data.shareUrl) await ensureQrImg($("#receiptQr"), data.shareUrl, 3000);
  else $("#receiptQr").src = data.qrBase64 || QR_PLACEHOLDER;

  $("#barcodeText").textContent = data.reference || "";

  $("#rcEventName").textContent = data.title || "";
  $("#rcEventDate").textContent = fmtDate(data.date);
  $("#rcRef").textContent = data.reference || "";
  $("#rcStatus").textContent = (data.status||"").toUpperCase();
  $("#rcPaidAt").textContent = fmtDate(data.paidAt);
  $("#rcChannel").textContent = data.channel || "—";
  $("#rcAmount").textContent = formatMoneyNGN(data.amount);
  $("#rcCustomer").textContent = data.customerEmail || "—";
  $("#rcLink").innerHTML = data.shareUrl ? `<a href="${data.shareUrl}" target="_blank" rel="noopener">${data.shareUrl}</a>` : "—";

  if(window._miniBarcode && data.reference){
    window._miniBarcode.drawBarcode("barcode", data.reference);
  }

  $("#printBtn").onclick = ()=> window.print();
  $("#emailBtn").onclick = ()=> fallbackMailTo(data);
}

/* ========= MY TICKETS ========= */
function initTickets(){
  const { token } = getAuth(); if(!token){ location.href="login.html"; return; }
  const list=$("#ticketsList"), empty=$("#ticketsEmpty");
  const tabs=$$(".tab"); let active="upcoming";
  tabs.forEach(t=> t.addEventListener("click", ()=>{ tabs.forEach(x=>x.classList.remove("tab-active")); t.classList.add("tab-active"); active=t.dataset.tab; render(); }));

  let serverList=[]; let localList=JSON.parse(localStorage.getItem("purchases")||"[]");

  async function load(){
    try{
      const res=await fetch(ENDPOINTS.myEvents,{ headers:{ ...authHeaders() } });
      if(res.ok){
        serverList=await res.json();
        serverList.forEach(ev=>{
          const path = (ev.imageUrl || ev.image || ev.thumbnail || ev.photo || ev.banner || CARD_IMAGES[Math.floor(Math.random()*CARD_IMAGES.length)]);
          ev._thumbPath = path; ev._thumbTag = `<img src="${path}" alt="Event">`;
        });
      }
    }catch{}
    render();
  }

  function mergeById(a,b){ const m=new Map(); a.forEach(e=>m.set(e._id,e)); b.forEach(e=>m.set(e._id,e)); return [...m.values()]; }

  function render(){
    const items = mergeById(serverList, localList).sort((a,b)=> new Date(a.date)-new Date(b.date));
    const now=new Date();
    const filtered = items.filter(ev => active==="upcoming" ? new Date(ev.date)>=now : new Date(ev.date)<now);

    list.innerHTML="";
    if(filtered.length===0){ empty.classList.remove("hidden"); return; }
    empty.classList.add("hidden");

    filtered.forEach(ev=>{
      const row=document.createElement("div");
      row.className="ticket-item";
      row.innerHTML=`
        <img src="${ev._thumbPath || CARD_IMAGES[0]}" alt="Event" style="width:120px;height:80px;object-fit:cover;border-radius:8px">
        <div class="ticket-info">
          <div class="title">${escapeHtml(ev.title||"")}</div>
          <div class="muted">${escapeHtml(ev.description||"")} · ${fmtDate(ev.date)}</div>
          <div class="muted mono">${ev._id||""}</div>
          <div class="mt-12">
            <button class="btn btn-ghost addCal">Add to Calendar</button>
            <button class="btn btn-primary viewBtn">View Details</button>
          </div>
        </div>
        <div class="ticket-cta">
          <button class="btn btn-primary showQr">QR</button>
        </div>
      `;
      $(".addCal",row).addEventListener("click", ()=> addToCalendar(ev));
      $(".viewBtn",row).addEventListener("click", ()=>{
        $("#tdImg").src = ev._thumbPath || CARD_IMAGES[0];
        $("#tdTitle").textContent = ev.title||"";
        $("#tdDesc").textContent = ev.description||"";
        $("#tdDate").textContent = fmtDate(ev.date);
        $("#tdId").textContent = ev._id||"";
        $("#ticketDetails").classList.remove("hidden");
        $("#closeDetails").onclick = ()=> $("#ticketDetails").classList.add("hidden");
      });
      $(".showQr",row).addEventListener("click", async ()=>{
        const url = `${location.origin}/events/${ev._id||""}`;
        await ensureQrImg($("#ticketQrImg"), url, 3000);
        $("#qrText").textContent = ev.title || "";
        $("#qrModal").classList.remove("hidden");
        $("#closeQr").onclick = ()=> $("#qrModal").classList.add("hidden");
      });
      list.appendChild(row);
    });
  }

  function addToCalendar(ev){
    const s=new Date(ev.date), e=new Date(s.getTime()+2*60*60*1000);
    const pad=(n)=>String(n).padStart(2,"0");
    const fmt=d=>`${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
    const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Eventful//EN","BEGIN:VEVENT",`UID:${ev._id}@eventful`,`DTSTAMP:${fmt(new Date())}`,`DTSTART:${fmt(s)}`,`DTEND:${fmt(e)}`,`SUMMARY:${(ev.title||"").replace(/\n/g," ")}`,`DESCRIPTION:${(ev.description||"").replace(/\n/g," ")}`,"END:VEVENT","END:VCALENDAR"].join("\r\n");
    const blob=new Blob([ics],{type:"text/calendar;charset=utf-8"}); const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download=`${(ev.title||"event").replace(/\s+/g,"_")}.ics`; a.click(); URL.revokeObjectURL(url);
  }

  load();
}

/* ========= ANALYTICS ========= */
function initAnalytics(){
  const { token } = getAuth(); if(!token){ location.href="login.html"; return; }
  const mAtt=$("#mAttendees"), mTic=$("#mTickets"), mScan=$("#mScans"), mRev=$("#mRevenue");
  const ctxLine=$("#revenueLine").getContext("2d"), ctxDonut=$("#channelDonut").getContext("2d"), ctxBars=$("#revenueBars").getContext("2d");

  const localPurchases=JSON.parse(localStorage.getItem("purchases")||"[]");
  const eventId = localPurchases[0]?._id || "699230cc37bab704cd783143";

  (async ()=>{
    try{
      const over=await fetch(ENDPOINTS.analyticsOverall,{ headers:{ ...authHeaders() } });
      if(over.ok){ const o=await over.json(); mAtt.textContent=Number(o.totalAttendees||0).toLocaleString(); mTic.textContent=Number(o.totalTicketsSold||0).toLocaleString(); mScan.textContent=Number(o.totalQrScans||0).toLocaleString(); mRev.textContent=formatMoneyNGN(o.totalRevenue||0); }

      const evRes=await fetch(ENDPOINTS.analyticsEvent(eventId),{ headers:{ ...authHeaders() } });
      const rotRes=await fetch(ENDPOINTS.analyticsRevenueOverTime(eventId),{ headers:{ ...authHeaders() } });

      const evData = evRes.ok ? await evRes.json() : {};
      const rot = rotRes.ok ? await rotRes.json() : {};

      drawLine(ctxLine, Object.keys(rot), Object.values(rot));
      const channels=evData.ticketsSoldByChannel||{};
      drawDonut(ctxDonut, Object.keys(channels), Object.values(channels));
      const rbd=evData.revenueByDay||{};
      drawBars(ctxBars, Object.keys(rbd), Object.values(rbd));
    }catch{ toast("Analytics failed to load"); }
  })();

  function drawLine(ctx, labels, data){
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    const w=ctx.canvas.width, h=ctx.canvas.height, pad=26;
    ctx.strokeStyle="#ffdcae"; ctx.fillStyle="#ffdcae"; ctx.lineWidth=2;
    const max=Math.max(10,...data), min=0;
    const x=(i)=> pad + (i*(w-2*pad))/Math.max(1,labels.length-1);
    const y=(v)=> h-pad - ((v-min)/(max-min||1))*(h-2*pad);
    ctx.beginPath();
    data.forEach((v,i)=>{ const xx=x(i), yy=y(v); if(i===0) ctx.moveTo(xx,yy); else ctx.lineTo(xx,yy); });
    ctx.stroke();
    data.forEach((v,i)=>{ const xx=x(i), yy=y(v); ctx.beginPath(); ctx.arc(xx,yy,3,0,Math.PI*2); ctx.fill(); });
  }
  function drawDonut(ctx, labels, data){
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    const total=data.reduce((a,b)=>a+b,0)||1, cx=ctx.canvas.width/2, cy=ctx.canvas.height/2, r=70, ir=40;
    const colors=["#ffdcae","#e8bb86","#c08a5a","#9a6e44","#6d4b2f"];
    let ang=-Math.PI/2;
    data.forEach((v,i)=>{
      const a=(v/total)*Math.PI*2;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.fillStyle=colors[i%colors.length];
      ctx.arc(cx,cy,r,ang,ang+a); ctx.lineTo(cx,cy); ctx.fill(); ang+=a;
    });
    ctx.globalCompositeOperation="destination-out";
    ctx.beginPath(); ctx.arc(cx,cy,ir,0,Math.PI*2); ctx.fill();
    ctx.globalCompositeOperation="source-over";
  }
  function drawBars(ctx, labels, data){
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    const w=ctx.canvas.width, h=ctx.canvas.height, pad=24;
    const max=Math.max(10,...data); const barW=(w-2*pad)/Math.max(1,data.length);
    data.forEach((v,i)=>{
      const x=pad+i*barW, y=h-pad-((v/max||0)*(h-2*pad)), bh=(v/max||0)*(h-2*pad);
      ctx.fillStyle="#8b5cf6"; ctx.fillRect(x+6,y,barW-12,bh);
    });
  }
}

/* ========= CREATE EVENT ========= */
function initCreateEvent(){
    const form = $("#createForm");
    if(!form) return;

    // Prevent double binding
    if(form.dataset.bound === "true") return;
    form.dataset.bound = "true";
  console.log("initCreateEvent called");
  const { token, user } = getAuth(); if(!token){ location.href="login.html"; return; }
  if(!user || user.role!=="CREATOR"){ toast("Create Event is for creators"); location.href="index.html"; return; }

  $("#createForm")?.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    const payload={ title:fd.get("title"), description:fd.get("description"), date:new Date(fd.get("date")).toISOString() };
    try{
      const res=await fetch(ENDPOINTS.createEvent,{ method:"POST", headers:{ "Content-Type":"application/json", ...authHeaders() }, body:JSON.stringify(payload) });
      const txt=await res.text(); const data=safeJson(txt);
      if(!res.ok) throw new Error(data?.message||"Create failed");
      toast("Event created successfully");
      setTimeout(()=> location.href="index.html", 600);
    }catch(err){ toast(err.message||"Create failed"); }
  });
}

/* ========= EMAIL HELPERS ========= */
async function trySendEmail(data){
  try{
    const res=await fetch(ENDPOINTS.emailReceipt,{ method:"POST", headers:{ "Content-Type":"application/json", ...authHeaders() }, body:JSON.stringify(data) });
    if(res.ok){ toast("Receipt emailed"); return; }
    fallbackMailTo(data);
  }catch{ fallbackMailTo(data); }
}
function fallbackMailTo(data){
  const to=encodeURIComponent(data.customerEmail||"");
  const subject=encodeURIComponent(`Your Eventful Receipt — ${data.title||"Event"}`);
  const body=encodeURIComponent(`Reference: ${data.reference}
Amount: ${formatMoneyNGN(data.amount)}
Status: ${data.status}
Paid at: ${fmtDate(data.paidAt)}
Event: ${data.title}
Date: ${fmtDate(data.date)}
Link: ${data.shareUrl||"N/A"}

Thank you for your purchase.`);
  location.href=`mailto:${to}?subject=${subject}&body=${body}`;
}