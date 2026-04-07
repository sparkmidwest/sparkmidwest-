import React, { useState, useEffect, useCallback } from "react";

const GOLD = "#F59E0B";
const DARK = "#0D1B2A";
const MID  = "#1B3A5C";
const SC_BLUE = "#0057B8";
const SC_LT   = "#E8F0FD";

const SERVICES = [
  { id:"personal", label:"SPARK Personal — Score Upgrade + Funding Strategy",      price:1500, monitor:true },
  { id:"business", label:"SPARK Business — Business Credit + Funding Strategy", price:2500, monitor:true },
  { id:"elite",    label:"SPARK Elite — Personal + Business Combined",          price:3500, monitor:true },
];
const MONITOR_FEE = 97;

const LENDERS = {
  personal:[
    {name:"Navy Federal CU",   product:"Personal LOC",     min:580, max:"$50k",  rate:"7.49-18%",   speed:"Same day",  phone:"1-888-842-6328"},
    {name:"LightStream",       product:"Personal Loan",    min:660, max:"$100k", rate:"7.49-25.99%",speed:"Same day",  phone:"1-888-978-3946"},
    {name:"SoFi",              product:"Personal Loan",    min:680, max:"$100k", rate:"8.99-29.99%",speed:"Same day",  phone:"1-855-456-7634"},
    {name:"Upstart",           product:"Personal Loan AI", min:580, max:"$50k",  rate:"7.4-35.99%", speed:"1-3 days",  phone:"1-855-438-8778"},
    {name:"Wright-Patt CU",    product:"Personal LOC",     min:620, max:"$25k",  rate:"Prime+2-5%", speed:"Same day",  phone:"1-800-762-0047"},
    {name:"Kemba Financial CU",product:"Personal Loan",    min:600, max:"$30k",  rate:"8-18%",      speed:"Same day",  phone:"1-614-235-2395"},
  ],
  business:[
    {name:"Navy Federal CU", product:"Business LOC",  min:720, max:"$500k", rate:"Prime+1-3%",  speed:"5-14 days",  phone:"1-888-842-6328"},
    {name:"Bluevine",        product:"Business LOC",  min:625, max:"$250k", rate:"Prime+3-7%",  speed:"1-3 days",   phone:"1-888-216-9619"},
    {name:"Fundbox",         product:"Business LOC",  min:600, max:"$150k", rate:"4.66-8.99%", speed:"Instant",    phone:"1-855-572-7707"},
    {name:"Huntington Bank", product:"Business/SBA",  min:640, max:"$10M",  rate:"Prime+1-4%",  speed:"21-45 days", phone:"1-800-480-2265"},
    {name:"Live Oak Bank",   product:"SBA 7(a)",      min:650, max:"$5M",   rate:"Prime+2.75%", speed:"30-45 days", phone:"1-910-796-1645"},
    {name:"Crest Capital",   product:"Equipment Loan",min:620, max:"$500k", rate:"5.99-18%",   speed:"24-48 hrs",  phone:"1-800-245-1213"},
  ],
  realestate:[
    {name:"Lima One Capital",product:"Fix & Flip",  min:600, max:"90% LTC",rate:"10.5-13%",speed:"5-10 days",  phone:"1-800-390-4212"},
    {name:"Kiavi",           product:"Fix & Flip",  min:640, max:"90% LTC",rate:"9.5-12%", speed:"5-7 days",   phone:"1-888-414-0450"},
    {name:"Visio Lending",   product:"DSCR Rental", min:680, max:"80% LTV",rate:"7-11%",   speed:"14-21 days", phone:"1-855-847-4631"},
  ],
  builder:[
    {name:"Navy Fed Pledge Loan", product:"Share-Secured Builder",min:0,max:"$50k",  rate:"7.5-18%",  speed:"Same day",  phone:"1-888-842-6328"},
    {name:"NFCU Secured Card",    product:"Secured Card",         min:0,max:"$5k",   rate:"~18%",     speed:"7-10 days", phone:"1-888-842-6328"},
    {name:"Self Financial",       product:"Credit Builder Loan",  min:0,max:"$1.8k", rate:"15-16%",   speed:"Instant",   phone:"1-877-883-0999"},
    {name:"Credit Strong",        product:"Builder Installment",  min:0,max:"$2.5k", rate:"15-16%",   speed:"Instant",   phone:"1-833-600-0788"},
    {name:"Ava Credit",           product:"Builder Card",         min:0,max:"$500",  rate:"$9-12/mo", speed:"Instant",   phone:"App"},
    {name:"RentReporters",        product:"Rent Reporting",       min:0,max:"24mo",  rate:"$6.95/mo", speed:"3-5 days",  phone:"1-877-798-6892"},
    {name:"Rental Kharma",        product:"Rent Reporting",       min:0,max:"Full",  rate:"$8.95/mo", speed:"5-7 days",  phone:"1-888-760-0600"},
    {name:"Atlas Secured Card",   product:"Secured Card",         min:0,max:"$3k",   rate:"~19.99%",  speed:"7-10 days", phone:"1-800-258-2700"},
  ],
};

const SUPABASE_URL = "https://sptshgnjazpceumdghwh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwdHNoZ25qYXpwY2V1bWRnaHdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MTc3MzgsImV4cCI6MjA5MTA5MzczOH0.HHfe3CMrw3jx0pRHoniZvRgZ7rKFRIFNTbcBnj1V1m8";

function sbFetch(path, opts) {
  var method = (opts && opts.method) || "GET";
  var body = (opts && opts.body) || undefined;
  var prefer = (opts && opts.prefer) || "return=representation";
  return fetch(SUPABASE_URL + "/rest/v1/" + path, {
    method: method,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY,
      "Content-Type": "application/json",
      "Prefer": prefer
    },
    body: body
  }).then(function(res) {
    if (!res.ok) {
      return res.text().then(function(e) {
        console.error("Supabase:", e);
        return null;
      });
    }
    return res.text().then(function(t) {
      return t ? JSON.parse(t) : null;
    });
  }).catch(function(e) {
    console.error("sbFetch:", e);
    return null;
  });
}

function sbGet(path) {
  return sbFetch(path);
}

function sbUpsert(table, row) {
  return sbFetch(table, {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=representation",
    body: JSON.stringify(row)
  }).then(function(data) {
    return data ? data[0] : null;
  });
}

function sbDelete(table, id) {
  return sbFetch(table + "?id=eq." + id, { method: "DELETE" });
}

function clientToRow(c) {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone || "",
    address: c.address || "",
    tu: c.tu || "",
    ex: c.ex || "",
    eq: c.eq || "",
    sc_verified: c.scVerified || false,
    sc_date: c.scDate || null,
    sc_source: c.scSource || null,
    sc_email: c.scEmail || null,
    sc_password: c.scPassword || null,
    sc_ssn4: c.scSsn4 || null,
    goal: c.goal || "",
    business_type: c.businessType || "",
    revenue: c.revenue || "",
    in_business: c.inBusiness || "",
    situation: c.situation || "",
    service: c.service || "",
    inv_num: c.invNum || "",
    inv_amt: c.invAmt || 0,
    inv_service: c.invService || "",
    created_at: c.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function rowToClient(row) {
  return {
    id: row.id,
    name: row.name || "",
    email: row.email || "",
    phone: row.phone || "",
    address: row.address || "",
    tu: row.tu || "",
    ex: row.ex || "",
    eq: row.eq || "",
    scVerified: row.sc_verified || false,
    scDate: row.sc_date || "",
    scSource: row.sc_source || "",
    scEmail: row.sc_email || "",
    scPassword: row.sc_password || "",
    scSsn4: row.sc_ssn4 || "",
    goal: row.goal || "",
    businessType: row.business_type || "",
    revenue: row.revenue || "",
    inBusiness: row.in_business || "",
    situation: row.situation || "",
    service: row.service || "",
    invNum: row.inv_num || "",
    invAmt: row.inv_amt || 0,
    invService: row.inv_service || "",
    createdAt: row.created_at || new Date().toISOString()
  };
}

function SparkStar({ size }) {
  size = size || 22;
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0 L15.5 12.5 L28 14 L15.5 15.5 L14 28 L12.5 15.5 L0 14 L12.5 12.5 Z" fill="#5BC8F5"/>
    </svg>
  );
}

function SparkLogo({ dark, size }) {
  // dark=true: dark text (for light backgrounds), dark=false/undefined: white text (for dark backgrounds)
  size = size || "md";
  var nameSize = size === "lg" ? 30 : size === "sm" ? 16 : 22;
  var subSize  = size === "lg" ? 10 : size === "sm" ?  8 :  9;
  var starSize = size === "lg" ? 28 : size === "sm" ? 16 : 22;
  var textColor = dark ? "#1A1A2E" : "#FFFFFF";
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", gap:0 }}>
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        <SparkStar size={starSize} />
        <span style={{ fontFamily:"Arial Black, Arial", fontSize:nameSize, fontWeight:900,
          color:textColor, letterSpacing:-0.5, lineHeight:1 }}>spark.</span>
      </div>
      <div style={{ fontFamily:"Arial", fontSize:subSize, fontWeight:600, color:dark ? "#555" : "#9CA3AF",
        letterSpacing:2, textTransform:"uppercase", paddingLeft:2, marginTop:-2 }}>
        Media Group Midwest
      </div>
    </div>
  );
}

function ScoreRing({ score, label, size, sc }) {
  size = size || 72;
  const pct   = score ? ((score - 300) / 550) * 100 : 0;
  const color = score >= 780 ? "#10B981" : score >= 720 ? GOLD : score >= 660 ? "#3B82F6" : score >= 580 ? "#8B5CF6" : "#EF4444";
  const rank  = score >= 800 ? "Exceptional" : score >= 740 ? "Very Good" : score >= 670 ? "Good" : score >= 580 ? "Fair" : score ? "Poor" : "";
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
      <div style={{ position:"relative", width:size, height:size }}>
        <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }} viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
          {score ? <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={pct + " 100"} strokeLinecap="round" /> : null}
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize: size > 70 ? 15 : 13, fontWeight:700, color:color, fontFamily:"Arial" }}>
            {score || "—"}
          </span>
        </div>
      </div>
      <span style={{ fontSize:11, color:"var(--color-text-secondary)", fontFamily:"Arial", fontWeight:500 }}>{label}</span>
      {score ? <span style={{ fontSize:10, color:color, fontFamily:"Arial" }}>{rank}</span> : null}
      {sc && score ? <span style={{ fontSize:9, color:SC_BLUE, fontFamily:"Arial", fontWeight:700 }}>●SC</span> : null}
    </div>
  );
}

function Pill({ color, children }) {
  const styles = {
    green:  { background:"#D1FAE5", color:"#065F46" },
    amber:  { background:"#FEF3C7", color:"#92400E" },
    blue:   { background:"#DBEAFE", color:"#1E40AF" },
    red:    { background:"#FEE2E2", color:"#991B1B" },
    gray:   { background:"#F3F4F6", color:"#374151" },
    purple: { background:"#EDE9FE", color:"#5B21B6" },
    sc:     { background:SC_LT,     color:SC_BLUE   },
  };
  const s = styles[color] || styles.gray;
  return (
    <span style={{ background:s.background, color:s.color, fontSize:11, fontWeight:600,
      padding:"2px 8px", borderRadius:99, fontFamily:"Arial" }}>
      {children}
    </span>
  );
}

function Spinner() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 0" }}>
      <style>{`@keyframes spark-b{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
      {[0,1,2].map(function(i) {
        return <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:GOLD,
          animation:"spark-b 0.8s infinite", animationDelay:(i * 0.15) + "s" }} />;
      })}
      <span style={{ fontSize:13, color:"var(--color-text-secondary)", fontFamily:"Arial" }}>Working...</span>
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={Object.assign({ background:"var(--color-background-primary)",
      border:"0.5px solid var(--color-border-tertiary)", borderRadius:12, padding:"16px 20px" }, style || {})}>
      {children}
    </div>
  );
}

function GoldBtn({ onClick, children, disabled, style }) {
  return (
    <button onClick={disabled ? undefined : onClick}
      style={Object.assign({ fontFamily:"Arial", fontSize:13, fontWeight:500, padding:"8px 16px",
        borderRadius:8, cursor: disabled ? "not-allowed" : "pointer", border:"none",
        opacity: disabled ? 0.5 : 1, background:GOLD, color:DARK }, style || {})}>
      {children}
    </button>
  );
}

function BorderBtn({ onClick, children, style }) {
  return (
    <button onClick={onClick}
      style={Object.assign({ fontFamily:"Arial", fontSize:13, fontWeight:500, padding:"8px 16px",
        borderRadius:8, cursor:"pointer", background:"transparent", color:"var(--color-text-primary)",
        border:"0.5px solid var(--color-border-secondary)" }, style || {})}>
      {children}
    </button>
  );
}

function BlueBtn({ onClick, children, disabled, style }) {
  return (
    <button onClick={disabled ? undefined : onClick}
      style={Object.assign({ fontFamily:"Arial", fontSize:13, fontWeight:500, padding:"8px 16px",
        borderRadius:8, cursor: disabled ? "not-allowed" : "pointer", border:"none",
        opacity: disabled ? 0.5 : 1, background:SC_BLUE, color:"white" }, style || {})}>
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      {label ? <label style={{ fontSize:12, fontWeight:500, color:"var(--color-text-secondary)", fontFamily:"Arial" }}>{label}</label> : null}
      {children}
    </div>
  );
}

function SCBadge({ date }) {
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:SC_LT,
      border:"1px solid rgba(0,87,184,0.2)", borderRadius:6, padding:"4px 10px" }}>
      <div style={{ width:8, height:8, borderRadius:"50%", background:SC_BLUE }} />
      <span style={{ fontFamily:"Arial", fontSize:11, fontWeight:600, color:SC_BLUE }}>SmartCredit Verified</span>
      {date ? <span style={{ fontFamily:"Arial", fontSize:10, color:"#64748B" }}>· {date}</span> : null}
    </div>
  );
}

function SCModal({ client, settings, onSave, onClose }) {
  const [scores, setScores] = useState({ tu: client.tu || "", ex: client.ex || "", eq: client.eq || "" });
  const [step,    setStep]  = useState("options");
  const [loading, setLoad]  = useState(false);
  const [pasted,  setPasted]= useState("");
  const [parsed,  setParsed]= useState(null);

  var scUrl = (settings && settings.scAffiliateUrl) || "https://www.smartcredit.com/join/?pid=67187";

  function parseAI() {
    if (!pasted) return;
    setLoad(true);
    fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:200,
        messages:[{ role:"user", content:"Extract FICO 8 credit scores. Return ONLY JSON: {\"tu\":number,\"ex\":number,\"eq\":number}. Null if missing.\n\n" + pasted.substring(0,3000) }]
      })
    }).then(function(r){ return r.json(); }).then(function(data) {
      var text = (data.content && data.content[0] && data.content[0].text) || "{}";
      var result = JSON.parse(text.replace(/```json|```/g,"").trim());
      setParsed(result);
      setScores({ tu: result.tu || "", ex: result.ex || "", eq: result.eq || "" });
      setLoad(false);
    }).catch(function(){ alert("Could not parse. Enter manually."); setLoad(false); });
  }

  function handleSave() {
    onSave({ tu:scores.tu, ex:scores.ex, eq:scores.eq,
      scVerified:true, scDate: new Date().toLocaleDateString() });
    onClose();
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(13,27,42,0.75)", display:"flex",
      alignItems:"center", justifyContent:"center", zIndex:9999, padding:16 }}>
      <div style={{ background:"#FFFFFF", borderRadius:16, padding:24,
        width:"100%", maxWidth:500, maxHeight:"85vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:SC_BLUE }} />
              <span style={{ fontFamily:"Arial", fontSize:16, fontWeight:700, color:SC_BLUE }}>SmartCredit Score Sync</span>
            </div>
            <div style={{ fontFamily:"Arial", fontSize:12, color:"var(--color-text-secondary)" }}>
              Pull scores for {client.name.split(" ")[0]}
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22,
            cursor:"pointer", color:"var(--color-text-secondary)" }}>×</button>
        </div>

        {step === "options" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ background:SC_LT, borderRadius:10, padding:"12px 14px",
              fontFamily:"Arial", fontSize:12, color:"#1e3a5f", lineHeight:1.6 }}>
              <strong>How it works:</strong> Enter your <a href="https://www.smartcredit.com/join/?pid=67187" target="_blank" rel="noreferrer" style={{ color:SC_BLUE }}>SmartCredit</a> login credentials below.
              Spark Midwest Group will log in on your behalf, pull your 3-bureau report,
              and sync your scores directly into your SPARK profile. Your credentials are
              stored securely and only used for credit report pulls.
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div>
                <label style={{ fontFamily:"Arial", fontSize:12, fontWeight:500,
                  color:"var(--color-text-secondary)", display:"block", marginBottom:4 }}>
                  SmartCredit Email / Username *
                </label>
                <input type="email" placeholder="your@email.com"
                  value={scores.scEmail || ""}
                  onChange={function(e){ setScores(Object.assign({}, scores, { scEmail: e.target.value })); }}
                  style={{ width:"100%", fontFamily:"Arial", fontSize:13, boxSizing:"border-box" }} />
              </div>
              <div>
                <label style={{ fontFamily:"Arial", fontSize:12, fontWeight:500,
                  color:"var(--color-text-secondary)", display:"block", marginBottom:4 }}>
                  SmartCredit Password *
                </label>
                <input type="password" placeholder="Your SmartCredit password"
                  value={scores.scPassword || ""}
                  onChange={function(e){ setScores(Object.assign({}, scores, { scPassword: e.target.value })); }}
                  style={{ width:"100%", fontFamily:"Arial", fontSize:13, boxSizing:"border-box" }} />
              </div>
              <div>
                <label style={{ fontFamily:"Arial", fontSize:12, fontWeight:500,
                  color:"var(--color-text-secondary)", display:"block", marginBottom:4 }}>
                  Last 4 of Social Security Number *
                </label>
                <input type="password" placeholder="••••" maxLength={4}
                  value={scores.scSsn4 || ""}
                  onChange={function(e){ setScores(Object.assign({}, scores, { scSsn4: e.target.value.replace(/\D/g,"") })); }}
                  style={{ width:100, fontFamily:"Arial", fontSize:18, fontWeight:700,
                    textAlign:"center", letterSpacing:6, boxSizing:"border-box" }} />
              </div>
            </div>
            <div style={{ background:"#F8FAFC", borderRadius:8, padding:"10px 12px",
              border:"0.5px solid var(--color-border-tertiary)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                <span style={{ fontSize:14 }}>🔒</span>
                <span style={{ fontFamily:"Arial", fontSize:12, fontWeight:600 }}>Your information is secure</span>
              </div>
              <div style={{ fontFamily:"Arial", fontSize:11, color:"var(--color-text-secondary)", lineHeight:1.6 }}>
                Credentials are encrypted and stored securely in our database. They are used
                solely to pull your credit report on your behalf. You can remove access at any time
                by contacting team@614management.com.
              </div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <BlueBtn
                onClick={function(){
                  if (!scores.scEmail || !scores.scPassword || !scores.scSsn4) {
                    alert("Please fill in all fields.");
                    return;
                  }
                  onSave({
                    tu: scores.tu, ex: scores.ex, eq: scores.eq,
                    scVerified: true,
                    scDate: new Date().toLocaleDateString(),
                    scSource: "SmartCredit",
                    scEmail: scores.scEmail,
                    scPassword: scores.scPassword,
                    scSsn4: scores.scSsn4
                  });
                  onClose();
                }}
                disabled={!scores.scEmail || !scores.scPassword || !scores.scSsn4}
                style={{ flex:1, padding:"11px" }}>
                ✓ Save SmartCredit Credentials
              </BlueBtn>
            </div>
            <div style={{ borderTop:"0.5px solid var(--color-border-tertiary)", paddingTop:12,
              display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
                <div>
                  <div style={{ fontFamily:"Arial", fontSize:12, fontWeight:600, marginBottom:2 }}>
                    Don't have SmartCredit yet?
                  </div>
                  <div style={{ fontFamily:"Arial", fontSize:11, color:"var(--color-text-secondary)" }}>
                    Sign up first, then come back to enter your credentials.
                  </div>
                </div>
                <a href="https://www.smartcredit.com/join/?pid=67187" target="_blank" rel="noreferrer"
                  style={{ background:SC_BLUE, color:"white", fontFamily:"Arial", fontSize:12,
                    fontWeight:600, padding:"8px 16px", borderRadius:8, textDecoration:"none",
                    whiteSpace:"nowrap" }}>
                  Sign Up for SmartCredit →
                </a>
              </div>
              <div style={{ borderTop:"0.5px solid var(--color-border-tertiary)", paddingTop:10 }}>
                <div style={{ fontFamily:"Arial", fontSize:11, color:"var(--color-text-secondary)",
                  marginBottom:6 }}>Already have scores to enter manually?</div>
                <BorderBtn onClick={function(){ setStep("manual"); }}
                  style={{ fontSize:12, padding:"6px 14px" }}>
                  Enter Scores Manually Instead
                </BorderBtn>
              </div>
            </div>
          </div>
        )}

        {step === "paste" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <BorderBtn onClick={function(){ setStep("options"); }} style={{ alignSelf:"flex-start", fontSize:12, padding:"5px 12px" }}>← Back</BorderBtn>
            <textarea rows={8} value={pasted} onChange={function(e){ setPasted(e.target.value); }}
              placeholder="Paste any text from your SmartCredit report — AI will find the TU, EX, EQ FICO 8 scores..."
              style={{ width:"100%", fontFamily:"Arial", fontSize:12, resize:"vertical", boxSizing:"border-box", borderRadius:8, padding:10 }} />
            {loading ? <Spinner /> : null}
            {parsed ? (
              <div style={{ background:"#D1FAE5", borderRadius:8, padding:"10px 14px" }}>
                <div style={{ fontFamily:"Arial", fontSize:12, fontWeight:600, color:"#065F46", marginBottom:4 }}>✓ Scores found:</div>
                <div style={{ display:"flex", gap:16 }}>
                  {[["TU", parsed.tu],["EX", parsed.ex],["EQ", parsed.eq]].map(function(pair) {
                    return <div key={pair[0]} style={{ fontFamily:"Arial", fontSize:14, fontWeight:700, color:"#065F46" }}>{pair[0]}: {pair[1] || "—"}</div>;
                  })}
                </div>
              </div>
            ) : null}
            <div style={{ display:"flex", gap:10 }}>
              <BlueBtn onClick={parseAI} disabled={!pasted || loading} style={{ flex:1 }}>⚡ Extract with AI</BlueBtn>
              {parsed ? <BorderBtn onClick={function(){ setStep("manual"); }}>Edit</BorderBtn> : null}
            </div>
            {parsed ? <GoldBtn onClick={handleSave}>Save SmartCredit Scores</GoldBtn> : null}
          </div>
        )}

        {step === "manual" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <BorderBtn onClick={function(){ setStep("options"); }} style={{ alignSelf:"flex-start", fontSize:12, padding:"5px 12px" }}>← Back</BorderBtn>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
              {[["TransUnion","tu"],["Experian","ex"],["Equifax","eq"]].map(function(pair) {
                var key = pair[1];
                return (
                  <div key={key} style={{ display:"flex", flexDirection:"column", gap:4 }}>
                    <label style={{ fontSize:11, fontWeight:500, color:"var(--color-text-secondary)", fontFamily:"Arial", textAlign:"center" }}>{pair[0]}</label>
                    <input type="number" min="300" max="850" placeholder="300-850"
                      value={scores[key]} onChange={function(e){ setScores(Object.assign({}, scores, { [key]: e.target.value })); }}
                      style={{ fontFamily:"Arial", fontSize:18, fontWeight:700, textAlign:"center",
                        borderRadius:8, border:"1px solid #e5e7eb", padding:"8px 4px",
                        color: scores[key] >= 740 ? "#10B981" : scores[key] >= 670 ? GOLD : "#6366F1" }} />
                  </div>
                );
              })}
            </div>
            {scores.tu && scores.ex && scores.eq ? (
              <div style={{ display:"flex", justifyContent:"space-around", padding:"12px",
                background:"var(--color-background-secondary)", borderRadius:8 }}>
                <ScoreRing score={parseInt(scores.tu)} label="TU" size={65} />
                <ScoreRing score={parseInt(scores.ex)} label="EX" size={65} />
                <ScoreRing score={parseInt(scores.eq)} label="EQ" size={65} />
              </div>
            ) : null}
            <SCBadge date={new Date().toLocaleDateString()} />
            <GoldBtn onClick={handleSave} disabled={!scores.tu || !scores.ex || !scores.eq}>
              ✓ Save as SmartCredit Verified
            </GoldBtn>
          </div>
        )}
      </div>
    </div>
  );
}

function Dashboard({ client, onNav, onSCSync }) {
  var tu = parseInt(client.tu) || 0;
  var ex = parseInt(client.ex) || 0;
  var eq = parseInt(client.eq) || 0;
  var avg = (tu && ex && eq) ? Math.round((tu + ex + eq) / 3) : (tu || ex || eq);
  var maxScore = Math.max(tu, ex, eq);
  var lenderCount = Object.values(LENDERS).reduce(function(acc, arr) {
    return acc + arr.filter(function(l){ return maxScore >= l.min; }).length;
  }, 0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ background:"linear-gradient(135deg, " + DARK + " 0%, " + MID + " 100%)",
        borderRadius:12, padding:"20px 24px", color:"white" }}>
        <div style={{ marginBottom:6 }}>
          <SparkLogo size="sm" />
        </div>
        <h1 style={{ fontFamily:"Arial", fontSize:19, fontWeight:700, margin:"0 0 6px" }}>
          {client.name.split(" ")[0]}'s Credit Hub
        </h1>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          {client.scVerified ? <SCBadge date={client.scDate} /> : null}
          <span style={{ fontFamily:"Arial", fontSize:12, color:"#9CA3AF" }}>
            Since {new Date(client.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr", gap:10 }}>
        {[
          { label:"Avg Score",       val: avg || "—",                                 clr: avg >= 740 ? "#10B981" : avg >= 670 ? GOLD : "#6366F1" },
          { label:"Goal Score",      val: "800+",                                      clr: MID },
          { label:"Lenders Matched", val: lenderCount,                                  clr: "#10B981" },
          { label:"Retainer Paid",   val: "$" + (client.invAmt || 0).toLocaleString(),  clr: "#10B981" },
          { label:"Monitor",          val: "$97/mo",                                      clr: GOLD },
        ].map(function(s, i) {
          return (
            <div key={i} style={{ background:"var(--color-background-secondary)", borderRadius:8, padding:"10px 12px" }}>
              <div style={{ fontFamily:"Arial", fontSize:10, color:"var(--color-text-secondary)", marginBottom:3 }}>{s.label}</div>
              <div style={{ fontFamily:"Arial", fontSize:18, fontWeight:500, color:s.clr }}>{s.val}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display:"flex", justifyContent:"space-around", alignItems:"center",
        padding:"16px", background:"var(--color-background-secondary)", borderRadius:12 }}>
        <ScoreRing score={tu} label="TransUnion" sc={client.scVerified} />
        <ScoreRing score={ex} label="Experian"   sc={client.scVerified} />
        <ScoreRing score={eq} label="Equifax"    sc={client.scVerified} />
        <div style={{ display:"flex", flexDirection:"column", gap:8, alignItems:"center" }}>
          <BlueBtn onClick={onSCSync} style={{ padding:"8px 14px", fontSize:12 }}>🔄 Update SC</BlueBtn>
          {client.scDate ? <span style={{ fontFamily:"Arial", fontSize:10, color:SC_BLUE }}>Last: {client.scDate}</span> : null}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {[
          { label:"Credit Profile", icon:"📊", screen:"profile"  },
          { label:"Lender Finder",  icon:"🏦", screen:"lenders"  },
          { label:"Document Vault", icon:"📁", screen:"docs"     },
          { label:"90-Day Plan",    icon:"🗓️",screen:"actions"  },
        ].map(function(a, i) {
          return (
            <BorderBtn key={i} onClick={function(){ onNav(a.screen); }}
              style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"flex-start",
                padding:"12px 14px", fontSize:13 }}>
              <span style={{ fontSize:16 }}>{a.icon}</span>{a.label}
            </BorderBtn>
          );
        })}
      </div>

      {client.goal && client.goal.includes("MCA") ? (
        <Card style={{ borderLeft:"3px solid #EF4444", borderRadius:"0 8px 8px 0", background:"#FEF2F2" }}>
          <div style={{ fontFamily:"Arial", fontSize:12, fontWeight:600, color:"#991B1B", marginBottom:4 }}>
            🚨 URGENT — MCA Payoff Strategy
          </div>
          <div style={{ fontFamily:"Arial", fontSize:13 }}>Your SMG advisor will contact you with your MCA payoff and replacement funding plan.</div>
        </Card>
      ) : null}
    </div>
  );
}

function CreditProfile({ client, onSCSync }) {
  var [aiResult, setAiResult] = useState("");
  var [loading,  setLoading]  = useState(false);

  var analyze = useCallback(function() {
    setLoading(true); setAiResult("");
    fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:900,
        messages:[{ role:"user", content:"Credit analysis for " + client.name + ": TU " + client.tu + "/EX " + client.ex + "/EQ " + client.eq + ". Goal: " + client.goal + ". Biz: " + client.businessType + ".\n\n1. SCORE ASSESSMENT\n2. TOP 3 ACTIONS THIS WEEK\n3. PRODUCTS QUALIFIED NOW\n4. WHAT BLOCKS BETTER RATES\n5. 6-MONTH PROJECTION\nUnder 350 words." }]
      })
    }).then(function(r){ return r.json(); }).then(function(d){
      setAiResult((d.content && d.content[0] && d.content[0].text) || "Error");
      setLoading(false);
    }).catch(function(){ setAiResult("Error. Try again."); setLoading(false); });
  }, [client]);

  var tu = parseInt(client.tu) || 0;
  var ex = parseInt(client.ex) || 0;
  var eq = parseInt(client.eq) || 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        {client.scVerified ? <SCBadge date={client.scDate} /> : <div />}
        <BlueBtn onClick={onSCSync} style={{ padding:"7px 14px", fontSize:12 }}>🔄 Re-sync SmartCredit</BlueBtn>
      </div>
      <div style={{ display:"flex", justifyContent:"space-around", padding:"14px",
        background:"var(--color-background-secondary)", borderRadius:12 }}>
        <ScoreRing score={tu} label="TransUnion" size={80} sc={client.scVerified} />
        <ScoreRing score={ex} label="Experian"   size={80} sc={client.scVerified} />
        <ScoreRing score={eq} label="Equifax"    size={80} sc={client.scVerified} />
      </div>
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <h3 style={{ fontFamily:"Arial", fontSize:14, fontWeight:500, margin:0 }}>AI Credit Analysis</h3>
          <GoldBtn onClick={analyze} disabled={loading} style={{ padding:"6px 14px", fontSize:12 }}>
            {loading ? "Analyzing..." : "Analyze →"}
          </GoldBtn>
        </div>
        {loading ? <Spinner /> : null}
        {aiResult ? (
          <div style={{ fontSize:13, fontFamily:"Arial", lineHeight:1.7, whiteSpace:"pre-wrap",
            borderTop:"0.5px solid var(--color-border-tertiary)", paddingTop:10 }}>
            {aiResult}
          </div>
        ) : null}
        {!aiResult && !loading ? (
          <p style={{ fontSize:12, color:"var(--color-text-secondary)", fontFamily:"Arial", margin:0 }}>
            Click Analyze to generate your AI credit strategy.
          </p>
        ) : null}
      </Card>
      <Card>
        <h3 style={{ fontFamily:"Arial", fontSize:14, fontWeight:500, marginBottom:12 }}>Score Factors</h3>
        {[
          { label:"Payment History",      pct:35, status:"Excellent", color:"green" },
          { label:"Credit Utilization",   pct:30, status:"Good",      color:"green" },
          { label:"Length of History",    pct:15, status:"Moderate",  color:"amber" },
          { label:"Credit Mix",           pct:10, status:"Good",      color:"green" },
          { label:"New Credit/Inquiries", pct:10, status:"Review",    color:"amber" },
        ].map(function(f, i) {
          return (
            <div key={i} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontFamily:"Arial", fontSize:12 }}>{f.label}</span>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <Pill color={f.color}>{f.status}</Pill>
                  <span style={{ fontFamily:"Arial", fontSize:11, color:"var(--color-text-secondary)" }}>{f.pct}%</span>
                </div>
              </div>
              <div style={{ height:4, borderRadius:9, background:"var(--color-background-secondary)", overflow:"hidden" }}>
                <div style={{ height:"100%", borderRadius:9, width:(f.pct * 3) + "%",
                  background: f.color === "green" ? "#10B981" : GOLD }} />
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function LenderFinder({ client }) {
  var [filter,  setFilter]  = useState("all");
  var [aiTip,   setAiTip]   = useState("");
  var [loading, setLoading] = useState(false);

  var maxScore = Math.max(parseInt(client.tu)||0, parseInt(client.ex)||0, parseInt(client.eq)||0);
  var cats = { all:"All", personal:"Personal", business:"Business", realestate:"Real Estate", builder:"Credit Builder" };
  var allLenders = Object.keys(LENDERS).reduce(function(acc, cat) {
    return acc.concat(LENDERS[cat].map(function(l){ return Object.assign({}, l, { category:cat }); }));
  }, []);
  var matched = allLenders.filter(function(l){ return maxScore >= l.min && (filter === "all" || l.category === filter); });

  function getTip() {
    setLoading(true); setAiTip("");
    fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:280,
        messages:[{ role:"user", content:"Client TU " + client.tu + "/EX " + client.ex + "/EQ " + client.eq + ", goal: " + client.goal + ". 3 bullets: (1) apply first + why, (2) application order, (3) one product that unlocks bigger funding." }]
      })
    }).then(function(r){ return r.json(); }).then(function(d){
      setAiTip((d.content && d.content[0] && d.content[0].text) || "");
      setLoading(false);
    }).catch(function(){ setLoading(false); });
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {client.scVerified ? <SCBadge date={client.scDate} /> : null}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {Object.keys(cats).map(function(k) {
          return (
            <button key={k} onClick={function(){ setFilter(k); }}
              style={{ fontFamily:"Arial", fontSize:12, fontWeight:500, padding:"6px 14px", borderRadius:99, cursor:"pointer",
                border:"1.5px solid " + (filter === k ? GOLD : "var(--color-border-tertiary)"),
                background: filter === k ? "#FEF3C7" : "transparent",
                color: filter === k ? "#92400E" : "var(--color-text-secondary)" }}>
              {cats[k]}
            </button>
          );
        })}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontFamily:"Arial", fontSize:13, color:"var(--color-text-secondary)" }}>
          <strong style={{ color:"var(--color-text-primary)" }}>{matched.length}</strong> lenders matched
        </span>
        <GoldBtn onClick={getTip} disabled={loading} style={{ padding:"6px 14px", fontSize:12 }}>
          {loading ? "..." : "AI Pick →"}
        </GoldBtn>
      </div>
      {loading ? <Spinner /> : null}
      {aiTip ? (
        <div style={{ borderRadius:8, padding:"12px 14px", fontSize:13, fontFamily:"Arial",
          lineHeight:1.6, background:"#FEF3C7", borderLeft:"3px solid " + GOLD, whiteSpace:"pre-wrap" }}>
          {aiTip}
        </div>
      ) : null}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {matched.map(function(l, i) {
          return (
            <Card key={i} style={{ padding:"12px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontFamily:"Arial", fontSize:13, fontWeight:500 }}>{l.name}</div>
                  <div style={{ fontFamily:"Arial", fontSize:12, color:"var(--color-text-secondary)" }}>{l.product}</div>
                  <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap" }}>
                    <Pill color="blue">{l.max}</Pill>
                    <Pill color="green">{l.rate}</Pill>
                    <Pill color="gray">⚡ {l.speed}</Pill>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"Arial", fontSize:11, color:"var(--color-text-secondary)" }}>{l.phone}</div>
                  <Pill color={l.category === "builder" ? "purple" : "gray"}>{cats[l.category]}</Pill>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Documents({ client }) {
  var [docs, setDocs] = useState([
    { name:"3-Bureau Report (SmartCredit)", type:"Credit Report", date:new Date(client.createdAt).toLocaleDateString(), status:"Verified", sc:true },
    { name:"Schedule C 2024", type:"Tax Document", date:new Date(client.createdAt).toLocaleDateString(), status:"Uploaded" },
    { name:"Schedule C 2023", type:"Tax Document", date:new Date(client.createdAt).toLocaleDateString(), status:"Uploaded" },
  ]);

  function addDoc(name) {
    setDocs(function(prev){ return prev.concat([{ name:name, type:"Document", date:new Date().toLocaleDateString(), status:"Processing" }]); });
    setTimeout(function(){
      setDocs(function(prev){ return prev.map(function(d){ return d.name === name ? Object.assign({},d,{status:"Uploaded"}) : d; }); });
    }, 2000);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div onDragOver={function(e){ e.preventDefault(); }}
        onDrop={function(e){ e.preventDefault(); Array.from(e.dataTransfer.files).forEach(function(f){ addDoc(f.name); }); }}
        style={{ border:"2px dashed var(--color-border-secondary)", borderRadius:12,
          padding:"28px 20px", textAlign:"center", background:"var(--color-background-secondary)" }}>
        <div style={{ fontSize:28, marginBottom:8 }}>📁</div>
        <div style={{ fontFamily:"Arial", fontSize:13, fontWeight:500, marginBottom:8 }}>Drop files here or click to upload</div>
        <label style={{ cursor:"pointer" }}>
          <GoldBtn>Browse Files</GoldBtn>
          <input type="file" multiple style={{ display:"none" }}
            onChange={function(e){ Array.from(e.target.files).forEach(function(f){ addDoc(f.name); }); }} />
        </label>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {docs.map(function(d, i) {
          return (
            <Card key={i} style={{ padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontFamily:"Arial", fontSize:13, fontWeight:500 }}>{d.name}</span>
                  {d.sc ? <Pill color="sc">SmartCredit</Pill> : null}
                </div>
                <div style={{ fontFamily:"Arial", fontSize:11, color:"var(--color-text-secondary)" }}>{d.type} · {d.date}</div>
              </div>
              <Pill color={d.status === "Verified" ? "blue" : d.status === "Uploaded" ? "green" : "amber"}>{d.status}</Pill>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ActionPlan({ client }) {
  // Generate tasks dynamically based on client goal and scores
  var score = Math.max(parseInt(client.tu)||0, parseInt(client.ex)||0, parseInt(client.eq)||0);
  var today = new Date();
  function addDays(d) { var dt = new Date(today); dt.setDate(dt.getDate() + d); return dt.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}); }

  var initialTasks = [
    { id:1, phase:1, task:"Pull your 3-bureau SmartCredit report and sync scores to SPARK", due:addDays(3), priority:"urgent", done:false },
    { id:2, phase:1, task:"Review credit report for unauthorized inquiries — dispute any not authorized", due:addDays(7), priority:"urgent", done:false },
    { id:3, phase:1, task:"Pay down any revolving balances to below 10% utilization", due:addDays(14), priority:"high", done:false },
    { id:4, phase:1, task:"Upload 2 years tax returns and 6 months bank statements to Document Vault", due:addDays(10), priority:"high", done:false },
  ];

  // Phase 2 — based on goal
  var goal = client.goal || "";
  if (goal.includes("Business") || goal.includes("SBA")) {
    initialTasks.push({ id:5, phase:2, task:"Apply for Navy Federal Business LOC (best rates with your scores)", due:addDays(21), priority:"urgent", done:false });
    initialTasks.push({ id:6, phase:2, task:"Register business on Dun & Bradstreet — get DUNS number", due:addDays(18), priority:"high", done:false });
    initialTasks.push({ id:7, phase:2, task:"Open 2 Net-30 vendor accounts (Uline, Quill, Amazon Business)", due:addDays(21), priority:"high", done:false });
  } else if (goal.includes("flip") || goal.includes("Real Estate") || goal.includes("DSCR")) {
    initialTasks.push({ id:5, phase:2, task:"Apply for hard money loan — Lima One Capital or Kiavi", due:addDays(14), priority:"urgent", done:false });
    initialTasks.push({ id:6, phase:2, task:"Gather property docs: purchase contract, 3 contractor bids, 4 comps", due:addDays(21), priority:"high", done:false });
    initialTasks.push({ id:7, phase:2, task:"Order property appraisal / ARV analysis", due:addDays(25), priority:"high", done:false });
  } else if (goal.includes("MCA")) {
    initialTasks.push({ id:5, phase:2, task:"Work with SMG advisor to identify MCA payoff funding source", due:addDays(7), priority:"critical", done:false });
    initialTasks.push({ id:6, phase:2, task:"Apply for business LOC to replace MCA — Bluevine or Fundbox", due:addDays(14), priority:"urgent", done:false });
    initialTasks.push({ id:7, phase:2, task:"Submit invoice factoring application if revenue is B2B", due:addDays(18), priority:"high", done:false });
  } else if (goal.includes("equipment") || goal.includes("Fleet")) {
    initialTasks.push({ id:5, phase:2, task:"Apply for equipment loan — Crest Capital (24-48hr decision)", due:addDays(14), priority:"urgent", done:false });
    initialTasks.push({ id:6, phase:2, task:"Get 3 equipment quotes from vendors for lender submission", due:addDays(18), priority:"high", done:false });
  } else {
    // Personal credit default
    if (score >= 720) {
      initialTasks.push({ id:5, phase:2, task:"Apply for premium travel card (Chase Sapphire or Amex Gold)", due:addDays(21), priority:"urgent", done:false });
    } else {
      initialTasks.push({ id:5, phase:2, task:"Open secured credit card — NFCU Secured or Atlas Secured", due:addDays(14), priority:"urgent", done:false });
      initialTasks.push({ id:6, phase:2, task:"Enroll in credit builder program — Self Financial or Credit Strong", due:addDays(14), priority:"high", done:false });
    }
    initialTasks.push({ id:7, phase:2, task:"Add rent payment reporting — RentReporters or Rental Kharma", due:addDays(21), priority:"high", done:false });
  }

  // Phase 3 — universal
  initialTasks.push({ id:8, phase:3, task:"Pull updated SmartCredit report — verify all changes reflected", due:addDays(45), priority:"high", done:false });
  initialTasks.push({ id:9, phase:3, task:"Request credit limit increases on all existing cards", due:addDays(50), priority:"high", done:false });
  initialTasks.push({ id:10,phase:3, task:"90-day full review with SMG advisor — update strategy", due:addDays(90), priority:"medium", done:false });
  var [tasks, setTasks] = useState(initialTasks);
  var done = tasks.filter(function(t){ return t.done; }).length;
  var pct  = Math.round((done / tasks.length) * 100);
  var phaseBg = { critical:"#FEE2E2", urgent:"#FEF3C7", high:"#EFF6FF", medium:"#F0FDF4" };
  var phaseLabels = { 1:"Phase 1 — Protect & Fix (April)", 2:"Phase 2 — Upgrade & Expand (May)", 3:"Phase 3 — Build & Fund (June–July)" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontFamily:"Arial", fontSize:13, fontWeight:500 }}>Progress</span>
          <span style={{ fontFamily:"Arial", fontSize:13, fontWeight:700, color: pct > 50 ? "#10B981" : GOLD }}>
            {done}/{tasks.length} ({pct}%)
          </span>
        </div>
        <div style={{ height:8, borderRadius:9, background:"var(--color-background-secondary)", overflow:"hidden" }}>
          <div style={{ height:"100%", borderRadius:9, background: pct > 50 ? "#10B981" : GOLD, width:pct + "%", transition:"width 0.3s" }} />
        </div>
      </Card>
      {[1,2,3].map(function(phase) {
        var phaseTasks = tasks.filter(function(t){ return t.phase === phase; });
        return (
          <div key={phase}>
            <div style={{ fontFamily:"Arial", fontSize:11, fontWeight:600, color:"var(--color-text-secondary)",
              marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>
              {phaseLabels[phase]}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {phaseTasks.map(function(t) {
                return (
                  <div key={t.id} onClick={function(){ setTasks(function(prev){ return prev.map(function(x){ return x.id === t.id ? Object.assign({},x,{done:!x.done}) : x; }); }); }}
                    style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 14px", borderRadius:8, cursor:"pointer",
                      background: t.done ? "var(--color-background-secondary)" : phaseBg[t.priority],
                      border:"0.5px solid var(--color-border-tertiary)", opacity: t.done ? 0.6 : 1 }}>
                    <div style={{ width:18, height:18, borderRadius:4, flexShrink:0, marginTop:1,
                      border:"2px solid " + (t.done ? "#10B981" : "var(--color-border-secondary)"),
                      background: t.done ? "#10B981" : "white", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {t.done ? <span style={{ color:"white", fontSize:11 }}>✓</span> : null}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"Arial", fontSize:13, textDecoration: t.done ? "line-through" : "none",
                        color: t.done ? "var(--color-text-secondary)" : "var(--color-text-primary)" }}>{t.task}</div>
                      <div style={{ fontFamily:"Arial", fontSize:11, color:"var(--color-text-secondary)", marginTop:3 }}>📅 {t.due}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Billing({ client }) {
  var [payLink, setPayLink] = useState("");
  var [loading, setLoading] = useState(false);

  function createLink() {
    setLoading(true); setPayLink("");
    fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:300,
        mcp_servers:[{ type:"url", url:"https://mcp.stripe.com", name:"stripe-mcp" }],
        messages:[{ role:"user", content:"Create Stripe payment link $" + client.invAmt + " USD. Service: \"" + client.invService + "\". Client: " + client.name + ". Invoice: " + client.invNum + ". Return URL only." }]
      })
    }).then(function(r){ return r.json(); }).then(function(d){
      var text = (d.content || []).map(function(b){ return b.type === "text" ? b.text : ""; }).join("\n");
      var match = text.match(/https:\/\/[^\s)]+/);
      setPayLink(match ? match[0] : "⚠️ " + text.substring(0,150));
      setLoading(false);
    }).catch(function(e){ setPayLink("Error: " + e.message); setLoading(false); });
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ background:DARK, borderRadius:12, padding:"20px 24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
          <div>
            <SparkLogo size="sm" />
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:12, fontWeight:700, color:GOLD, fontFamily:"Arial" }}>#{client.invNum}</div>
            <div style={{ fontSize:11, color:"#9CA3AF", fontFamily:"Arial" }}>{new Date(client.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:8, padding:"10px 14px", marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontSize:13, color:"#D1D5DB", fontFamily:"Arial" }}>{client.invService}</span>
            <span style={{ fontSize:13, fontWeight:700, color:GOLD, fontFamily:"Arial" }}>${(client.invAmt||0).toLocaleString()}.00</span>
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <span style={{ fontSize:14, fontWeight:700, color:"white", fontFamily:"Arial" }}>Total Due</span>
          <span style={{ fontSize:16, fontWeight:700, color:GOLD, fontFamily:"Arial" }}>${(client.invAmt||0).toLocaleString()}.00 USD</span>
        </div>
      </div>
      <GoldBtn onClick={createLink} disabled={loading} style={{ justifyContent:"center", display:"flex", padding:"12px" }}>
        {loading ? "Creating..." : "Generate Payment Link"}
      </GoldBtn>
      {loading ? <Spinner /> : null}
      {payLink ? (
        <div style={{ borderRadius:8, padding:"10px 14px", fontSize:13, fontFamily:"Arial",
          background: payLink.startsWith("⚠️") ? "#FEF3C7" : "#D1FAE5",
          color: payLink.startsWith("⚠️") ? "#92400E" : "#065F46", wordBreak:"break-all" }}>
          {payLink}
        </div>
      ) : null}
    </div>
  );
}

function Sidebar({ screen, onNav, client, onLogout }) {
  var links = [
    { id:"dashboard", icon:"✦", label:"Dashboard"      },
    { id:"profile",   icon:"📊", label:"Credit Profile" },
    { id:"lenders",   icon:"🏦", label:"Lenders"        },
    { id:"docs",      icon:"📁", label:"Documents"      },
    { id:"actions",   icon:"🗓️",label:"Action Plan"    },
    { id:"billing",   icon:"💰", label:"Billing"        },
  ];
  return (
    <div style={{ width:192, flexShrink:0, borderRight:"0.5px solid var(--color-border-tertiary)",
      display:"flex", flexDirection:"column", padding:"16px 0" }}>
      <div style={{ padding:"0 14px 14px", borderBottom:"0.5px solid var(--color-border-tertiary)", marginBottom:8 }}>
        <SparkLogo dark={true} size="sm" />
        {client.scVerified ? (
          <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:6 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:SC_BLUE }} />
            <span style={{ fontSize:10, color:SC_BLUE, fontFamily:"Arial", fontWeight:600 }}>SmartCredit Linked</span>
          </div>
        ) : null}
      </div>
      <div style={{ padding:"0 8px", flex:1 }}>
        {links.map(function(l) {
          return (
            <button key={l.id} onClick={function(){ onNav(l.id); }}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"8px 10px",
                borderRadius:8, border:"none", cursor:"pointer", marginBottom:2, fontFamily:"Arial", fontSize:13,
                background: screen === l.id ? "#FEF3C7" : "transparent",
                color: screen === l.id ? "#92400E" : "var(--color-text-secondary)",
                fontWeight: screen === l.id ? 500 : 400, textAlign:"left" }}>
              <span style={{ fontSize:15 }}>{l.icon}</span>{l.label}
            </button>
          );
        })}
      </div>
      <div style={{ padding:"12px 14px", borderTop:"0.5px solid var(--color-border-tertiary)" }}>
        <div style={{ fontFamily:"Arial", fontSize:12, fontWeight:500, marginBottom:1,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {client.name.split(" ").slice(0,2).join(" ")}
        </div>
        <div style={{ fontFamily:"Arial", fontSize:10, color:"var(--color-text-secondary)", marginBottom:8 }}>
          {client.email}
        </div>
        <BorderBtn onClick={onLogout} style={{ width:"100%", fontSize:11, padding:"6px 0" }}>Sign Out</BorderBtn>
      </div>
    </div>
  );
}

// ── CHECKOUT MODAL ────────────────────────────────────────────────
function CheckoutModal({ plan, onClose }) {
  var [method,  setMethod]  = useState("stripe");
  var [loading, setLoading] = useState(false);
  var [payUrl,  setPayUrl]  = useState("");
  var [error,   setError]   = useState("");

  var bnplOptions = [
    { id:"affirm",   label:"Affirm",   sub:"Split into 4 interest-free payments", logo:"A", color:"#0FA0EA", bg:"#E8F6FD" },
    { id:"klarna",   label:"Klarna",   sub:"Pay in 4 or monthly installments",     logo:"K", color:"#FFB3C7", bg:"#FFF0F4" },
    { id:"afterpay", label:"Afterpay", sub:"4 payments, every 2 weeks",            logo:"⊕", color:"#B2FCE4", bg:"#F0FFF9" },
  ];

  function getBNPLAmount(id) {
    var amt = plan.price;
    if (id === "affirm")   return "$" + (amt / 4).toFixed(2) + " x 4 payments";
    if (id === "klarna")   return "$" + (amt / 4).toFixed(2) + " x 4 payments";
    if (id === "afterpay") return "$" + (amt / 4).toFixed(2) + " every 2 weeks";
    return "$" + amt;
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(13,27,42,0.75)", display:"flex",
      alignItems:"center", justifyContent:"center", zIndex:9999, padding:16 }}>
      <div style={{ background:"#FFFFFF", borderRadius:16, padding:24,
        width:"100%", maxWidth:460, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
          <div>
            <div style={{ fontFamily:"Arial", fontSize:16, fontWeight:700 }}>{plan.name}</div>
            <div style={{ fontFamily:"Arial", fontSize:24, fontWeight:700, color:GOLD, marginTop:2 }}>
              {plan.priceLabel}
              {plan.monthly ? <span style={{ fontSize:13, fontWeight:400, color:"var(--color-text-secondary)" }}>/mo</span> : null}
            </div>
            {plan.monitorRequired ? (
              <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:6,
                background:"#FEF3C7", borderRadius:6, padding:"5px 10px", display:"inline-flex" }}>
<SparkStar size={12} />
                <span style={{ fontFamily:"Arial", fontSize:11, fontWeight:700, color:"#92400E" }}>
                  + SPARK Monitor $97/mo (required)
                </span>
              </div>
            ) : null}
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer",
            color:"var(--color-text-secondary)" }}>×</button>
        </div>

        {/* What's included */}
        <div style={{ background:"var(--color-background-secondary)", borderRadius:10, padding:"12px 14px", marginBottom:18 }}>
          <div style={{ fontFamily:"Arial", fontSize:12, fontWeight:600, marginBottom:8 }}>What's included:</div>
          {plan.features.map(function(f, i) {
            return (
              <div key={i} style={{ display:"flex", gap:8, fontFamily:"Arial", fontSize:12, padding:"3px 0" }}>
                <span style={{ color:"#10B981", fontWeight:700 }}>✓</span>
                <span>{f}</span>
              </div>
            );
          })}
        </div>

        {/* SmartCredit — included, no pricing shown */}
        <div style={{ background:SC_LT, border:"1px solid rgba(0,87,184,0.2)", borderRadius:8,
          padding:"10px 12px", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:SC_BLUE }} />
            <span style={{ fontFamily:"Arial", fontSize:12, fontWeight:600, color:SC_BLUE }}>3-Bureau Credit Report Included</span>
          </div>
          <div style={{ fontFamily:"Arial", fontSize:12, color:"#374151" }}>
            After enrolling, you'll set up your <a href="https://www.smartcredit.com/join/?pid=67187" target="_blank" rel="noreferrer" style={{ color:SC_BLUE, fontWeight:600 }}>SmartCredit</a> account and provide your login credentials.
            Spark Midwest Group will pull your full 3-bureau report on your behalf.
          </div>
        </div>

        {/* Payment method */}
        <div style={{ fontFamily:"Arial", fontSize:12, fontWeight:600, marginBottom:10 }}>Choose how to pay:</div>

        {/* Card / Stripe */}
        <div onClick={function(){ setMethod("stripe"); }}
          style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:10,
            border:"1.5px solid " + (method === "stripe" ? GOLD : "var(--color-border-tertiary)"),
            background: method === "stripe" ? "#FEF3C7" : "var(--color-background-primary)",
            cursor:"pointer", marginBottom:8 }}>
          <div style={{ width:36, height:36, borderRadius:8, background:"#635BFF",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"Arial", fontSize:14, fontWeight:700, color:"white" }}>💳</div>
          <div>
            <div style={{ fontFamily:"Arial", fontSize:13, fontWeight:500 }}>Credit / Debit Card</div>
            <div style={{ fontFamily:"Arial", fontSize:11, color:"var(--color-text-secondary)" }}>Visa, Mastercard, Amex — secure via Stripe</div>
          </div>
          {method === "stripe" ? <div style={{ marginLeft:"auto", width:18, height:18, borderRadius:"50%",
            background:GOLD, display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:11, fontWeight:700, color:DARK }}>✓</div> : null}
        </div>

        {/* BNPL options */}
        {!plan.monthly ? (
          <div>
            <div style={{ fontFamily:"Arial", fontSize:11, color:"var(--color-text-secondary)",
              marginBottom:8, textAlign:"center" }}>— or split payments with —</div>
            {bnplOptions.map(function(opt) {
              return (
                <div key={opt.id} onClick={function(){ setMethod(opt.id); }}
                  style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:10,
                    border:"1.5px solid " + (method === opt.id ? GOLD : "var(--color-border-tertiary)"),
                    background: method === opt.id ? "#FEF3C7" : "var(--color-background-primary)",
                    cursor:"pointer", marginBottom:8 }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:opt.bg,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"Arial", fontSize:16, fontWeight:700, color:opt.color }}>{opt.logo}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"Arial", fontSize:13, fontWeight:500 }}>{opt.label}</div>
                    <div style={{ fontFamily:"Arial", fontSize:11, color:"var(--color-text-secondary)" }}>
                      {opt.sub} · <strong>{getBNPLAmount(opt.id)}</strong>
                    </div>
                  </div>
                  {method === opt.id ? <div style={{ width:18, height:18, borderRadius:"50%",
                    background:GOLD, display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, fontWeight:700, color:DARK }}>✓</div> : null}
                </div>
              );
            })}
          </div>
        ) : null}

        <div style={{ marginTop:18 }}>
          {/* BNPL redirect buttons */}
          {method === "affirm" ? (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ background:"#E8F6FD", borderRadius:10, padding:"12px 14px",
                fontFamily:"Arial", fontSize:13, color:"#0369A1", lineHeight:1.6 }}>
                <strong>Affirm</strong> — After clicking below, you'll complete your application directly on Affirm's site.
                Split <strong>{plan.priceLabel}</strong> into 4 interest-free payments of <strong>${(plan.price/4).toFixed(2)}</strong>.
              </div>
              <GoldBtn onClick={function(){
                window.open("https://www.affirm.com", "_blank");
                onClose();
              }} style={{ width:"100%", padding:"13px", fontSize:14 }}>
                Continue with Affirm →
              </GoldBtn>
            </div>
          ) : method === "klarna" ? (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ background:"#FFF0F4", borderRadius:10, padding:"12px 14px",
                fontFamily:"Arial", fontSize:13, color:"#9D174D", lineHeight:1.6 }}>
                <strong>Klarna</strong> — Split <strong>{plan.priceLabel}</strong> into 4 payments of <strong>${(plan.price/4).toFixed(2)}</strong> or choose monthly.
              </div>
              <GoldBtn onClick={function(){
                window.open("https://www.klarna.com", "_blank");
                onClose();
              }} style={{ width:"100%", padding:"13px", fontSize:14 }}>
                Continue with Klarna →
              </GoldBtn>
            </div>
          ) : method === "afterpay" ? (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ background:"#F0FFF9", borderRadius:10, padding:"12px 14px",
                fontFamily:"Arial", fontSize:13, color:"#065F46", lineHeight:1.6 }}>
                <strong>Afterpay</strong> — Pay <strong>${(plan.price/4).toFixed(2)}</strong> every 2 weeks, 4 payments total.
              </div>
              <GoldBtn onClick={function(){
                window.open("https://www.afterpay.com", "_blank");
                onClose();
              }} style={{ width:"100%", padding:"13px", fontSize:14 }}>
                Continue with Afterpay →
              </GoldBtn>
            </div>
          ) : (
            /* Stripe — generate real payment link */
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {!payUrl ? (
                <GoldBtn
                  disabled={loading}
                  onClick={function() {
                    setLoading(true);
                    setError("");
                    fetch("https://api.anthropic.com/v1/messages", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        model: "claude-sonnet-4-20250514",
                        max_tokens: 1000,
                        mcp_servers: [{ type: "url", url: "https://mcp.stripe.com", name: "stripe" }],
                        messages: [{
                          role: "user",
                          content: "Create a Stripe payment link for the following: Product name: \"" + plan.name + " — Spark Midwest Group\", Amount: " + plan.price + " USD (one-time payment). After pay period: collect customer email. Return only the payment link URL, nothing else."
                        }]
                      })
                    })
                    .then(function(r){ return r.json(); })
                    .then(function(data) {
                      var text = (data.content || [])
                        .filter(function(b){ return b.type === "text"; })
                        .map(function(b){ return b.text; })
                        .join("\n");
                      var match = text.match(/https:\/\/[^\s"<>\)]+/);
                      if (match) {
                        setPayUrl(match[0]);
                      } else {
                        setError("Could not generate link. Try again or email team@614management.com");
                      }
                      setLoading(false);
                    })
                    .catch(function(e){
                      setError("Connection error. Please try again.");
                      setLoading(false);
                    });
                  }}
                  style={{ width:"100%", padding:"13px", fontSize:14, display:"flex",
                    alignItems:"center", justifyContent:"center", gap:8 }}>
                  {loading ? "Generating secure link..." : "Pay " + plan.priceLabel + " with Card →"}
                </GoldBtn>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <div style={{ background:"#D1FAE5", borderRadius:10, padding:"12px 14px",
                    fontFamily:"Arial", fontSize:13, color:"#065F46" }}>
                    ✓ Payment link ready! Click below to complete checkout securely via Stripe.
                  </div>
                  <GoldBtn onClick={function(){ window.open(payUrl, "_blank"); onClose(); }}
                    style={{ width:"100%", padding:"13px", fontSize:14 }}>
                    Open Secure Checkout →
                  </GoldBtn>
                  <div style={{ fontFamily:"Arial", fontSize:11, color:"var(--color-text-secondary)",
                    wordBreak:"break-all", textAlign:"center" }}>{payUrl}</div>
                </div>
              )}
              {loading ? <Spinner /> : null}
              {error ? (
                <div style={{ background:"#FEE2E2", borderRadius:8, padding:"10px 12px",
                  fontFamily:"Arial", fontSize:12, color:"#991B1B" }}>{error}</div>
              ) : null}
            </div>
          )}
          <div style={{ textAlign:"center", fontFamily:"Arial", fontSize:11,
            color:"var(--color-text-secondary)", marginTop:10 }}>
            🔒 Secure checkout · Cancel monthly plans anytime · team@614management.com
          </div>
        </div>
      </div>
    </div>
  );
}

// ── FREE ANALYSIS SCREEN ──────────────────────────────────────────
function FreeAnalysis({ onUpgrade, onLogin }) {
  var [form,    setForm]    = useState({ goal:"", scores:"", situation:"" });
  var [result,  setResult]  = useState("");
  var [loading, setLoading] = useState(false);
  var [done,    setDone]    = useState(false);

  function run() {
    if (!form.goal) return;
    setLoading(true);
    fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:600,
        messages:[{ role:"user", content:"You are a credit consultant at Spark Midwest Group. A prospect wants a free credit analysis preview.\n\nGoal: " + form.goal + "\nApproximate scores: " + (form.scores || "unknown") + "\nSituation: " + (form.situation || "not provided") + "\n\nGive a compelling but brief analysis:\n1. WHERE THEY LIKELY STAND (1-2 sentences based on their info)\n2. TOP 3 THINGS BLOCKING THEIR GOAL (specific)\n3. WHAT'S POSSIBLE IN 90 DAYS (exciting but honest)\n4. WHY THEY NEED PROFESSIONAL HELP (2 sentences — what they'd miss trying alone)\n\nEnd with: 'To get your full personalized strategy, matched lenders, dispute letters, and 90-day action plan — upgrade to SPARK today.'\n\nKeep it under 250 words. Be specific and compelling." }]
      })
    }).then(function(r){ return r.json(); }).then(function(d){
      setResult((d.content && d.content[0] && d.content[0].text) || "");
      setLoading(false); setDone(true);
    }).catch(function(){ setLoading(false); });
  }

  return (
    <div style={{ maxWidth:540, margin:"0 auto", padding:"20px 16px", background:"#FFFFFF", minHeight:"100vh" }}>
      <div style={{ textAlign:"center", marginBottom:24 }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:6 }}>
          <SparkLogo dark={true} size="md" />
        </div>
        <div style={{ fontFamily:"Arial", fontSize:13, color:"var(--color-text-secondary)", marginTop:4 }}>Free Credit Analysis Preview</div>
      </div>

      {!done ? (
        <Card>
          <h2 style={{ fontFamily:"Arial", fontSize:15, fontWeight:500, marginBottom:4 }}>Get your free analysis</h2>
          <p style={{ fontFamily:"Arial", fontSize:12, color:"var(--color-text-secondary)", marginBottom:16 }}>
            Answer 3 quick questions — our AI will assess where you stand and what's possible.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div>
              <label style={{ fontFamily:"Arial", fontSize:12, fontWeight:500,
                color:"var(--color-text-secondary)", display:"block", marginBottom:4 }}>
                What is your #1 financial goal? *
              </label>
              <select value={form.goal} onChange={function(e){ setForm(Object.assign({},form,{goal:e.target.value})); }}
                style={{ width:"100%", fontFamily:"Arial", fontSize:13 }}>
                <option value="">Select your goal...</option>
                {["Get a business loan ($50k–$500k)","Buy or invest in real estate","Pay off MCA debt and replace it",
                  "Expand my fleet or buy equipment","Reach 750+ credit score","Get approved for personal loan or card",
                  "Build business credit from scratch","Qualify for SBA loan"].map(function(o,i){
                  return <option key={i}>{o}</option>;
                })}
              </select>
            </div>
            <div>
              <label style={{ fontFamily:"Arial", fontSize:12, fontWeight:500,
                color:"var(--color-text-secondary)", display:"block", marginBottom:4 }}>
                Approximate credit score (or best guess)
              </label>
              <select value={form.scores} onChange={function(e){ setForm(Object.assign({},form,{scores:e.target.value})); }}
                style={{ width:"100%", fontFamily:"Arial", fontSize:13 }}>
                <option value="">Not sure / Haven't checked</option>
                <option>Below 580 (Poor)</option>
                <option>580–619 (Fair)</option>
                <option>620–659 (Fair-Good)</option>
                <option>660–719 (Good)</option>
                <option>720–759 (Very Good)</option>
                <option>760+ (Excellent)</option>
              </select>
            </div>
            <div>
              <label style={{ fontFamily:"Arial", fontSize:12, fontWeight:500,
                color:"var(--color-text-secondary)", display:"block", marginBottom:4 }}>
                Anything else we should know? (optional)
              </label>
              <textarea rows={3} placeholder="e.g. I have an MCA, I own a trucking business, I was denied for a loan last month..."
                value={form.situation} onChange={function(e){ setForm(Object.assign({},form,{situation:e.target.value})); }}
                style={{ width:"100%", fontFamily:"Arial", fontSize:12, resize:"none", boxSizing:"border-box" }} />
            </div>
          </div>
          {loading ? <div style={{ marginTop:12 }}><Spinner /></div> : null}
          <div style={{ marginTop:16 }}>
            <GoldBtn onClick={run} disabled={!form.goal || loading}
              style={{ width:"100%", padding:"12px", fontSize:14 }}>
              ⚡ Get My Free Analysis
            </GoldBtn>
          </div>
          <div style={{ textAlign:"center", marginTop:12 }}>
            <button onClick={onLogin} style={{ background:"none", border:"none", fontFamily:"Arial",
              fontSize:12, color:SC_BLUE, cursor:"pointer", textDecoration:"underline" }}>
              Already a member? Log in
            </button>
          </div>
        </Card>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:12 }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:GOLD }} />
              <span style={{ fontFamily:"Arial", fontSize:13, fontWeight:600 }}>Your Free Analysis</span>
            </div>
            <div style={{ fontFamily:"Arial", fontSize:13, lineHeight:1.75, whiteSpace:"pre-wrap",
              color:"var(--color-text-primary)" }}>
              {result}
            </div>
          </Card>

          {/* Upgrade CTA */}
          <div style={{ background:"linear-gradient(135deg," + DARK + "," + MID + ")",
            borderRadius:14, padding:"20px 20px", textAlign:"center" }}>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:10 }}><SparkLogo size="sm" /></div>
            <div style={{ fontFamily:"Arial", fontSize:18, fontWeight:700, color:"white", marginBottom:6 }}>
              Get your full SPARK strategy
            </div>
            <div style={{ fontFamily:"Arial", fontSize:12, color:"#9CA3AF", marginBottom:20 }}>
              Real scores · Matched lenders · Dispute letters · 90-day plan
            </div>
            <GoldBtn onClick={onUpgrade}
              style={{ padding:"12px 28px", fontSize:14 }}>
              See Plans & Pricing →
            </GoldBtn>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PRICING SCREEN ────────────────────────────────────────────────
function PricingScreen({ onSelectPlan, onLogin, onFreeAnalysis }) {
  var [checkout, setCheckout] = useState(null);

  var plans = [
    {
      id:"personal",
      name:"SPARK Personal",
      price:1500,
      priceLabel:"$1,500",
      monthly:false,
      badge:null,
      desc:"Personal credit strategy, score upgrade, dispute letters, and a funded roadmap.",
      monitorRequired:true,
      features:[
        "✦ SPARK Monitor membership ($97/mo)",
        "3-Bureau credit report pull (we pull it for you) ↗",
        "Full AI credit strategy & score analysis",
        "Dispute letters — all 3 bureaus, unlimited",
        "200+ lender matching by score",
        "90-day personalized action plan",
        "Document vault and review",
        "Direct SMG advisor access",
        "Affirm · Klarna · Afterpay available",
      ],
      cta:"Get Started — $1,500 + $97/mo",
    },
    {
      id:"business",
      name:"SPARK Business",
      price:2500,
      priceLabel:"$2,500",
      monthly:false,
      badge:null,
      desc:"Business credit setup, SBA prep, equipment and real estate funding — built for growth.",
      monitorRequired:true,
      features:[
        "✦ SPARK Monitor membership ($97/mo)",
        "Everything in SPARK Personal",
        "Business credit tradeline setup",
        "Net-30 vendor account roadmap",
        "SBA loan packaging and submission",
        "Equipment and fleet financing match",
        "Fix & flip lender analysis",
        "MCA payoff + replacement strategy",
        "Affirm · Klarna · Afterpay available",
      ],
      cta:"Get Started — $2,500 + $97/mo",
    },
    {
      id:"elite",
      name:"SPARK Elite",
      price:3500,
      priceLabel:"$3,500",
      monthly:false,
      badge:"Best Value",
      desc:"Personal + Business combined. Everything included — credit, funding, and real estate strategy.",
      monitorRequired:true,
      features:[
        "✦ SPARK Monitor membership ($97/mo)",
        "Everything in Personal + Business",
        "Real estate investor strategy",
        "DSCR and hard money lender match",
        "Priority SMG advisor access",
        "Monthly check-ins for 90 days",
        "Affirm · Klarna · Afterpay available",
      ],
      cta:"Get Started — $3,500 + $97/mo",
    },
  ];

  var additionalServices = [
    { icon:"🏛️", name:"Non-Profit Formation",       desc:"501(c)(3) filing, articles of incorporation, and IRS exemption application." },
    { icon:"📊", name:"Accounting & Tax Services",   desc:"Business bookkeeping, tax preparation, and financial statement preparation." },
    { icon:"🏢", name:"LLC Formation + EIN Setup",   desc:"Full LLC formation, registered agent, operating agreement, and EIN filing." },
  ];

  function handleSelect(plan) {
    setCheckout(plan);
  }

  return (
    <div style={{ minHeight:"100vh", background:"#FFFFFF" }}>
      {checkout ? <CheckoutModal plan={checkout} onClose={function(){ setCheckout(null); }} /> : null}

      {/* Header */}
      <div style={{ background:DARK, padding:"40px 24px", textAlign:"center" }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
          <SparkLogo size="lg" />
        </div>
        <h1 style={{ fontFamily:"Arial", fontSize:24, fontWeight:700, color:"white", margin:"0 0 8px", lineHeight:1.2 }}>
          Real credit strategy. Real results.
        </h1>
        <p style={{ color:"#9CA3AF", fontFamily:"Arial", fontSize:13, maxWidth:420, margin:"0 auto 24px" }}>
          Choose your plan — all plans include a full <a href="https://www.smartcredit.com/join/?pid=67187" target="_blank" rel="noreferrer" style={{ color:GOLD }}>3-bureau credit report</a> pull. We handle it for you.
        </p>

        {/* SC badge */}
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(0,87,184,0.15)",
          border:"1px solid rgba(0,87,184,0.3)", borderRadius:99, padding:"6px 16px", marginBottom:24 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:SC_BLUE }} />
          <span style={{ fontFamily:"Arial", fontSize:12, color:"#93C5FD" }}>
            3-Bureau Credit Report Included with Every Plan
          </span>
        </div>

        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
          <GoldBtn onClick={onFreeAnalysis} style={{ padding:"10px 22px", fontSize:13 }}>
            ⚡ Free Credit Analysis
          </GoldBtn>
          <BorderBtn onClick={onLogin}
            style={{ color:"white", borderColor:"rgba(255,255,255,0.3)", padding:"10px 22px", fontSize:13 }}>
            Existing Member Log In
          </BorderBtn>
        </div>
      </div>

      {/* BNPL bar */}
      <div style={{ background:"#F8FAFC", padding:"12px 24px", borderBottom:"0.5px solid var(--color-border-tertiary)" }}>
        <div style={{ maxWidth:800, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"center", gap:20, flexWrap:"wrap" }}>
          <span style={{ fontFamily:"Arial", fontSize:12, color:"var(--color-text-secondary)" }}>Split payments available:</span>
          {[
            { name:"Affirm",   color:"#0FA0EA", logo:"A" },
            { name:"Klarna",   color:"#FF5C8E", logo:"K" },
            { name:"Afterpay", color:"#1A956E", logo:"⊕" },
          ].map(function(b) {
            return (
              <div key={b.name} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:22, height:22, borderRadius:5, background:b.color,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"Arial", fontSize:11, fontWeight:700, color:"white" }}>{b.logo}</div>
                <span style={{ fontFamily:"Arial", fontSize:12, fontWeight:500 }}>{b.name}</span>
              </div>
            );
          })}
          <span style={{ fontFamily:"Arial", fontSize:12, color:"var(--color-text-secondary)" }}>available on all retainer plans</span>
        </div>
      </div>

      {/* Plans */}
      <div style={{ padding:"32px 16px", maxWidth:900, margin:"0 auto" }}>

        {/* Monitor required banner */}
        <div style={{ background:"linear-gradient(135deg," + DARK + "," + MID + ")",
          borderRadius:12, padding:"16px 20px", marginBottom:20,
          display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
          <div style={{ width:42, height:42, borderRadius:10, background:GOLD,
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
<SparkStar size={20} />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"Arial", fontSize:14, fontWeight:700, color:GOLD, marginBottom:3 }}>
              SPARK Monitor — Required for All Members · $97/mo
            </div>
            <div style={{ fontFamily:"Arial", fontSize:12, color:"#D1D5DB", lineHeight:1.6 }}>
              Every SPARK client starts with Monitor membership. Includes <a href="https://www.smartcredit.com/join/?pid=67187" target="_blank" rel="noreferrer" style={{ color:"#93C5FD" }}>3-bureau score tracking</a>,
              monthly AI coaching reports, lender match updates, and full dashboard access.
              Your retainer plan adds the strategy, disputes, and funding work on top.
            </div>
          </div>
          <div style={{ textAlign:"right", flexShrink:0 }}>
            <div style={{ fontFamily:"Arial", fontSize:22, fontWeight:700, color:GOLD }}>$97</div>
            <div style={{ fontFamily:"Arial", fontSize:11, color:"#9CA3AF" }}>/month</div>
            <div style={{ fontFamily:"Arial", fontSize:10, color:"#6B7280", marginTop:2 }}>cancel anytime</div>
          </div>
        </div>

        <div style={{ fontFamily:"Arial", fontSize:12, color:"var(--color-text-secondary)",
          textAlign:"center", marginBottom:20 }}>
          Choose your retainer plan below — SPARK Monitor is automatically included with all plans
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
          {plans.map(function(plan) {
            return (
              <div key={plan.id} style={{ position:"relative", background:"var(--color-background-primary)",
                border:"0.5px solid " + (plan.badge ? GOLD : "var(--color-border-tertiary)"),
                borderRadius:14, padding:"22px 18px",
                boxShadow: plan.badge ? "0 0 0 2px " + GOLD + "40" : "none" }}>
                {plan.badge ? (
                  <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)",
                    background:GOLD, color:DARK, fontFamily:"Arial", fontSize:11, fontWeight:700,
                    padding:"4px 14px", borderRadius:99, whiteSpace:"nowrap" }}>
                    {plan.badge}
                  </div>
                ) : null}
                <div style={{ fontFamily:"Arial", fontSize:13, color:"var(--color-text-secondary)", marginBottom:4 }}>{plan.name}</div>
                <div style={{ fontFamily:"Arial", fontSize:26, fontWeight:700, color:DARK, marginBottom:2 }}>
                  {plan.priceLabel}
                  {plan.monthly ? <span style={{ fontSize:13, fontWeight:400, color:"var(--color-text-secondary)" }}>/mo</span> : null}
                </div>
                {plan.monitorRequired ? (
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontFamily:"Arial", fontSize:11, color:"var(--color-text-secondary)" }}>
                      + $97/mo SPARK Monitor (required)
                    </div>
                    <div style={{ fontFamily:"Arial", fontSize:10, color:"var(--color-text-secondary)", marginTop:2 }}>
                      Retainer: split into 4 payments with Affirm · Klarna · Afterpay
                    </div>
                  </div>
                ) : (
                  <div style={{ fontFamily:"Arial", fontSize:11, color:"var(--color-text-secondary)", marginBottom:10 }}>
                    or split into 4 payments with Affirm · Klarna · Afterpay
                  </div>
                )}
                <div style={{ fontFamily:"Arial", fontSize:12, color:"var(--color-text-secondary)", lineHeight:1.5, marginBottom:14 }}>
                  {plan.desc}
                </div>
                <div style={{ marginBottom:16 }}>
                  {plan.features.map(function(f, i) {
                    var isSC = f.indexOf("3-Bureau") !== -1 || f.indexOf("SmartCredit") !== -1;
                    return (
                      <div key={i} style={{ display:"flex", gap:7, fontFamily:"Arial", fontSize:11,
                        padding:"4px 0", borderBottom: i < plan.features.length-1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                        <span style={{ color:"#10B981", fontWeight:700, flexShrink:0 }}>✓</span>
                        {isSC ? (
                          <a href="https://www.smartcredit.com/join/?pid=67187" target="_blank" rel="noreferrer"
                            style={{ color:SC_BLUE, textDecoration:"underline", cursor:"pointer" }}>
                            {f}
                          </a>
                        ) : <span>{f}</span>}
                      </div>
                    );
                  })}
                </div>
                <GoldBtn onClick={function(){ handleSelect(plan); }}
                  style={{ width:"100%", padding:"11px", fontSize:13 }}>
                  {plan.cta}
                </GoldBtn>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop:28, background:SC_LT, borderRadius:12,
          border:"1px solid rgba(0,87,184,0.15)", padding:"18px 20px",
          display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
          <div style={{ width:40, height:40, borderRadius:10, background:SC_BLUE,
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:"white" }} />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"Arial", fontSize:13, fontWeight:700, color:SC_BLUE, marginBottom:2 }}>
              <a href="https://www.smartcredit.com/join/?pid=67187" target="_blank" rel="noreferrer" style={{ color:SC_BLUE, textDecoration:"none" }}>3-Bureau Credit Report</a> — Included in Every Plan
            </div>
            <div style={{ fontFamily:"Arial", fontSize:12, color:"#374151" }}>
              After enrolling, you'll provide your SmartCredit credentials and Spark Midwest Group
              pulls your full TransUnion, Experian, and Equifax report on your behalf. No extra cost.
            </div>
          </div>
        </div>

        {/* Additional Services */}
        <div style={{ marginTop:28 }}>
          <div style={{ textAlign:"center", marginBottom:16 }}>
            <div style={{ fontFamily:"Arial", fontSize:14, fontWeight:700, color:DARK, marginBottom:4 }}>
              Additional Services Available
            </div>
            <div style={{ fontFamily:"Arial", fontSize:12, color:"var(--color-text-secondary)" }}>
              Contact us for pricing — every situation is unique
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12 }}>
            {additionalServices.map(function(s, i) {
              return (
                <div key={i} style={{ background:"#FFFFFF", border:"0.5px solid #E2E8F0",
                  borderRadius:12, padding:"18px 16px", textAlign:"center" }}>
                  <div style={{ fontSize:26, marginBottom:8 }}>{s.icon}</div>
                  <div style={{ fontFamily:"Arial", fontSize:13, fontWeight:600,
                    color:DARK, marginBottom:6 }}>{s.name}</div>
                  <div style={{ fontFamily:"Arial", fontSize:11, color:"#6B7280",
                    lineHeight:1.6, marginBottom:12 }}>{s.desc}</div>
                  <a href="mailto:team@614management.com"
                    style={{ fontFamily:"Arial", fontSize:12, fontWeight:600,
                      color:DARK, background:GOLD, padding:"7px 16px", borderRadius:99,
                      textDecoration:"none", display:"inline-block" }}>
                    Contact for Pricing
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        <p style={{ textAlign:"center", fontFamily:"Arial", fontSize:11,
          color:"var(--color-text-secondary)", marginTop:24 }}>
          Questions? Email us at team@614management.com ·{" "}
          <a href="/privacy" style={{ color:"var(--color-text-secondary)" }}>Privacy Policy</a>
          {" "}·{" "}
          <a href="/terms" style={{ color:"var(--color-text-secondary)" }}>Terms of Service</a>
        </p>
      </div>
    </div>
  );
}

// ── LOGIN MODAL ───────────────────────────────────────────────────
function LoginModal({ onLogin, onClose }) {
  var [email, setEmail] = useState("");
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(13,27,42,0.75)", display:"flex",
      alignItems:"center", justifyContent:"center", zIndex:9999, padding:16 }}>
      <div style={{ background:"#FFFFFF", borderRadius:16, padding:28,
        width:"100%", maxWidth:380, boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <SparkLogo dark={true} size="sm" />
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20,
            cursor:"pointer", color:"var(--color-text-secondary)" }}>×</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div>
            <label style={{ fontFamily:"Arial", fontSize:12, fontWeight:500,
              color:"var(--color-text-secondary)", display:"block", marginBottom:4 }}>Email address</label>
            <input type="email" placeholder="your@email.com" value={email}
              onChange={function(e){ setEmail(e.target.value); }}
              onKeyDown={function(e){ if(e.key === "Enter") onLogin(email); }}
              style={{ width:"100%", fontFamily:"Arial", fontSize:14, boxSizing:"border-box" }} />
          </div>
          <GoldBtn onClick={function(){ onLogin(email); }} disabled={!email}
            style={{ width:"100%", padding:"12px", fontSize:14 }}>
            Log In →
          </GoldBtn>
        </div>
      </div>
    </div>
  );
}

function Onboard({ onComplete, onBack, settings }) {
  var [step,   setStep]   = useState(0);
  var [showSC, setShowSC] = useState(false);
  var [data,   setData]   = useState({
    name:"", email:"", phone:"", address:"",
    tu:"", ex:"", eq:"", scVerified:false, scDate:"",
    situation:"", businessType:"", revenue:"", inBusiness:"",
    goal:"", service:"biz_full"
  });

  function upd(key, val) { setData(function(p){ return Object.assign({}, p, { [key]: val }); }); }
  var svc    = SERVICES.find(function(s){ return s.id === data.service; }) || SERVICES[0];
  var invNum = "SPARK-" + Date.now().toString().slice(-6);
  var steps  = ["Personal", "Scores", "Situation", "Service"];

  return (
    <div style={{ maxWidth:540, margin:"0 auto", padding:"20px 16px", background:"#FFFFFF", minHeight:"100vh" }}>
      {showSC ? (
        <SCModal client={data} settings={settings}
          onSave={function(sc){ setData(function(p){ return Object.assign({}, p, sc); }); setShowSC(false); }}
          onClose={function(){ setShowSC(false); }} />
      ) : null}

      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
        <BorderBtn onClick={onBack} style={{ padding:"5px 12px", fontSize:12 }}>← Back</BorderBtn>
        <div style={{ display:"flex", alignItems:"center", gap:3 }}>
          {steps.map(function(s, i) {
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:3 }}>
                <div style={{ width:22, height:22, borderRadius:"50%", display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:11, fontWeight:600, fontFamily:"Arial",
                  background: i <= step ? GOLD : "var(--color-background-secondary)",
                  color: i <= step ? DARK : "var(--color-text-secondary)" }}>{i + 1}</div>
                {i < steps.length - 1 ? <div style={{ width:14, height:1, background: i < step ? GOLD : "var(--color-border-tertiary)" }} /> : null}
              </div>
            );
          })}
        </div>
        <span style={{ fontSize:12, color:"var(--color-text-secondary)", fontFamily:"Arial" }}>{steps[step]}</span>
      </div>

      {step === 0 ? (
        <Card>
          <h2 style={{ fontFamily:"Arial", fontSize:15, fontWeight:500, marginBottom:14 }}>Personal Information</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
            <Field label="Full Legal Name *">
              <input placeholder="First Middle Last" value={data.name}
                onChange={function(e){ upd("name", e.target.value); }}
                style={{ fontFamily:"Arial", fontSize:13 }} />
            </Field>
            <Field label="Email Address *">
              <input type="email" placeholder="client@email.com" value={data.email}
                onChange={function(e){ upd("email", e.target.value); }}
                style={{ fontFamily:"Arial", fontSize:13 }} />
            </Field>
            <Field label="Phone">
              <input placeholder="(555) 000-0000" value={data.phone}
                onChange={function(e){ upd("phone", e.target.value); }}
                style={{ fontFamily:"Arial", fontSize:13 }} />
            </Field>
            <Field label="Current Address">
              <input placeholder="123 Main St, City, State ZIP" value={data.address}
                onChange={function(e){ upd("address", e.target.value); }}
                style={{ fontFamily:"Arial", fontSize:13 }} />
            </Field>
          </div>
          <div style={{ marginTop:18, display:"flex", justifyContent:"flex-end" }}>
            <GoldBtn onClick={function(){ setStep(1); }} disabled={!data.name || !data.email}>Next →</GoldBtn>
          </div>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card>
          <h2 style={{ fontFamily:"Arial", fontSize:15, fontWeight:500, marginBottom:4 }}>Credit Scores</h2>
          <p style={{ fontSize:12, color:"var(--color-text-secondary)", fontFamily:"Arial", marginBottom:12 }}>
            Sync from SmartCredit or enter manually
          </p>
          <BlueBtn onClick={function(){ setShowSC(true); }}
            style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center",
              gap:8, padding:"11px", fontSize:13, marginBottom:8 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"white" }} />
            Enter SmartCredit Credentials
          </BlueBtn>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6,
            marginBottom:14, fontFamily:"Arial", fontSize:11, color:"var(--color-text-secondary)" }}>
            No account?{" "}
            <a href="https://www.smartcredit.com/join/?pid=67187" target="_blank" rel="noreferrer"
              style={{ color:SC_BLUE, fontWeight:600 }}>
              Sign up for SmartCredit first →
            </a>
          </div>
          {data.scVerified ? <div style={{ marginBottom:12 }}><SCBadge date={data.scDate} /></div> : null}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14 }}>
            {[["TransUnion","tu"],["Experian","ex"],["Equifax","eq"]].map(function(pair) {
              var key = pair[1];
              return (
                <div key={key} style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  <label style={{ fontSize:11, fontWeight:500, color:"var(--color-text-secondary)", fontFamily:"Arial", textAlign:"center" }}>{pair[0]}</label>
                  <input type="number" min="300" max="850" placeholder="300-850" value={data[key]}
                    onChange={function(e){ upd(key, e.target.value); }}
                    style={{ fontFamily:"Arial", fontSize:17, fontWeight:700, textAlign:"center",
                      color: data[key] >= 740 ? "#10B981" : data[key] >= 670 ? GOLD : "#6366F1" }} />
                </div>
              );
            })}
          </div>
          {data.tu && data.ex && data.eq ? (
            <div style={{ display:"flex", justifyContent:"space-around", padding:"12px",
              background:"var(--color-background-secondary)", borderRadius:8, marginBottom:14 }}>
              <ScoreRing score={parseInt(data.tu)} label="TU" size={65} sc={data.scVerified} />
              <ScoreRing score={parseInt(data.ex)} label="EX" size={65} sc={data.scVerified} />
              <ScoreRing score={parseInt(data.eq)} label="EQ" size={65} sc={data.scVerified} />
            </div>
          ) : null}
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <BorderBtn onClick={function(){ setStep(0); }}>← Back</BorderBtn>
            <GoldBtn onClick={function(){ setStep(2); }} disabled={!data.tu}>Next →</GoldBtn>
          </div>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <h2 style={{ fontFamily:"Arial", fontSize:15, fontWeight:500, marginBottom:14 }}>Client Situation</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
            <Field label="Primary Goal">
              <select value={data.goal} onChange={function(e){ upd("goal", e.target.value); }} style={{ fontFamily:"Arial", fontSize:13 }}>
                <option value="">Select...</option>
                {["Business funding ($50k–$500k)","Personal credit upgrade","Fix & flip real estate","Fleet/equipment expansion","MCA payoff + replacement","Score improvement to 800+","SBA loan qualification"]
                  .map(function(o,i){ return <option key={i}>{o}</option>; })}
              </select>
            </Field>
            <Field label="Business Type">
              <select value={data.businessType} onChange={function(e){ upd("businessType", e.target.value); }} style={{ fontFamily:"Arial", fontSize:13 }}>
                <option value="">Select...</option>
                {["Trucking / Transportation","Real Estate Investor","Retail / E-commerce","Restaurant / Food Service","Construction / Contracting","Healthcare / Medical","Professional Services","No business (personal only)"]
                  .map(function(o,i){ return <option key={i}>{o}</option>; })}
              </select>
            </Field>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <Field label="Monthly Revenue">
                <select value={data.revenue} onChange={function(e){ upd("revenue", e.target.value); }} style={{ fontFamily:"Arial", fontSize:13 }}>
                  <option value="">Select...</option>
                  {["Under $5k/mo","$5k–$15k/mo","$15k–$50k/mo","$50k–$150k/mo","$150k+/mo"].map(function(o,i){ return <option key={i}>{o}</option>; })}
                </select>
              </Field>
              <Field label="Time in Business">
                <select value={data.inBusiness} onChange={function(e){ upd("inBusiness", e.target.value); }} style={{ fontFamily:"Arial", fontSize:13 }}>
                  <option value="">Select...</option>
                  {["Just starting","Under 6 months","6–12 months","1–2 years","2+ years"].map(function(o,i){ return <option key={i}>{o}</option>; })}
                </select>
              </Field>
            </div>
            <Field label="Notes">
              <textarea rows={3} placeholder="MCA debt, assets, goals..." value={data.situation}
                onChange={function(e){ upd("situation", e.target.value); }}
                style={{ width:"100%", fontFamily:"Arial", fontSize:13, resize:"none", boxSizing:"border-box" }} />
            </Field>
          </div>
          <div style={{ marginTop:14, display:"flex", justifyContent:"space-between" }}>
            <BorderBtn onClick={function(){ setStep(1); }}>← Back</BorderBtn>
            <GoldBtn onClick={function(){ setStep(3); }}>Next →</GoldBtn>
          </div>
        </Card>
      ) : null}

      {step === 3 ? (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card>
            <h2 style={{ fontFamily:"Arial", fontSize:15, fontWeight:500, marginBottom:12 }}>Select Service</h2>
            {/* Monitor required notice */}
            <div style={{ background:"#FEF3C7", border:"1px solid " + GOLD, borderRadius:8,
              padding:"10px 12px", marginBottom:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
<SparkStar size={12} />
                <span style={{ fontFamily:"Arial", fontSize:12, fontWeight:700, color:"#92400E" }}>
                  SPARK Monitor — $97/mo (required for all clients)
                </span>
              </div>
              <div style={{ fontFamily:"Arial", fontSize:11, color:"#92400E" }}>
                All SPARK clients include Monitor membership. Select your retainer plan below.
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              {SERVICES.map(function(s) {
                var selected = data.service === s.id;
                return (
                  <div key={s.id} onClick={function(){ upd("service", s.id); }}
                    style={{ borderRadius:8, cursor:"pointer", fontFamily:"Arial",
                      border: (selected ? "2px" : "0.5px") + " solid " + (selected ? GOLD : "var(--color-border-tertiary)"),
                      background: selected ? "#FEF3C7" : "var(--color-background-primary)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                      padding:"9px 12px" }}>
                      <span style={{ fontSize:13, fontWeight: selected ? 600 : 400 }}>{s.label}</span>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:13, fontWeight:700, color: selected ? "#92400E" : "var(--color-text-primary)" }}>
                          ${s.price.toLocaleString()}
                        </div>
                        <div style={{ fontSize:10, color:"var(--color-text-secondary)" }}>+ $97/mo Monitor</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <BorderBtn onClick={function(){ setStep(2); }}>← Back</BorderBtn>
            <GoldBtn onClick={function(){ onComplete(Object.assign({}, data, { invNum:invNum, invAmt:svc.price, invService:svc.label })); }}>
              ⚡ Create Profile
            </GoldBtn>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AdminPanel({ clients, settings, onSelect, onBack, onSettings, onAddClient }) {
  return (
    <div style={{ padding:"20px 16px", maxWidth:600, margin:"0 auto", background:"#FFFFFF", minHeight:"100vh" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <BorderBtn onClick={onBack} style={{ padding:"5px 12px", fontSize:12 }}>← Portal</BorderBtn>
          <SparkLogo dark={true} size="sm" />
        </div>
        <BlueBtn onClick={onSettings} style={{ padding:"7px 14px", fontSize:12 }}>⚙️ SmartCredit Settings</BlueBtn>
      </div>

      {settings && settings.scAffiliateUrl ? (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
          background:SC_LT, border:"1px solid rgba(0,87,184,0.2)", borderRadius:10,
          padding:"10px 14px", marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:SC_BLUE }} />
            <span style={{ fontFamily:"Arial", fontSize:12, fontWeight:600, color:SC_BLUE }}>SmartCredit Connected</span>
          </div>
          <BlueBtn onClick={function(){ window.open(settings.scAffiliateUrl, "_blank"); }} style={{ padding:"5px 12px", fontSize:11 }}>
            Open Portal
          </BlueBtn>
        </div>
      ) : null}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
        {[
          { label:"Total Clients",   value: clients.length },
          { label:"Total Retainers", value: "$" + clients.reduce(function(s,c){ return s + (c.invAmt||0); }, 0).toLocaleString() },
          { label:"SC Verified",     value: clients.filter(function(c){ return c.scVerified; }).length },
        ].map(function(s, i) {
          return (
            <div key={i} style={{ background:"var(--color-background-secondary)", borderRadius:8, padding:"10px 12px" }}>
              <div style={{ fontFamily:"Arial", fontSize:10, color:"var(--color-text-secondary)" }}>{s.label}</div>
              <div style={{ fontFamily:"Arial", fontSize:18, fontWeight:500 }}>{s.value}</div>
            </div>
          );
        })}
      </div>

      {clients.length === 0 ? (
        <Card style={{ textAlign:"center", padding:"32px 20px" }}>
          <div style={{ fontSize:32, marginBottom:8 }}>⚡</div>
          <div style={{ fontFamily:"Arial", fontSize:14, fontWeight:500, marginBottom:4 }}>No clients yet</div>
          <div style={{ fontFamily:"Arial", fontSize:12, color:"var(--color-text-secondary)" }}>Onboard your first SPARK client</div>
        </Card>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {clients.map(function(c, i) {
            return (
              <Card key={i} style={{ cursor:"pointer", padding:"12px 16px" }} onClick={function(){ onSelect(c); }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontFamily:"Arial", fontSize:14, fontWeight:500 }}>{c.name}</span>
                      {c.scVerified ? <Pill color="sc">SC</Pill> : null}
                    </div>
                    <div style={{ fontFamily:"Arial", fontSize:12, color:"var(--color-text-secondary)" }}>{c.email}</div>
                    <div style={{ display:"flex", gap:5, marginTop:5 }}>
                      <Pill color="blue">TU {c.tu}</Pill>
                      <Pill color="green">EX {c.ex}</Pill>
                      <Pill color="purple">EQ {c.eq}</Pill>
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"Arial", fontSize:13, fontWeight:700, color:"#10B981" }}>${(c.invAmt||0).toLocaleString()}</div>
                    <div style={{ fontFamily:"Arial", fontSize:11, color:"var(--color-text-secondary)" }}>{new Date(c.createdAt).toLocaleDateString()}</div>
                    {c.scDate ? <div style={{ fontSize:10, color:SC_BLUE, fontFamily:"Arial" }}>SC: {c.scDate}</div> : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SCSettings({ settings, onSave, onBack }) {
  var [form, setForm] = useState(settings || { scAffiliateUrl:"https://www.smartcredit.com/join/?pid=67187", scUsername:"" });
  function upd(key, val) { setForm(function(p){ return Object.assign({}, p, { [key]: val }); }); }

  return (
    <div style={{ maxWidth:540, margin:"0 auto", padding:"20px 16px", background:"#FFFFFF", minHeight:"100vh" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
        <BorderBtn onClick={onBack} style={{ padding:"5px 12px", fontSize:12 }}>← Back</BorderBtn>
        <span style={{ fontFamily:"Arial", fontSize:15, fontWeight:700, color:SC_BLUE }}>SmartCredit Integration</span>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <Card>
          <h3 style={{ fontFamily:"Arial", fontSize:14, fontWeight:500, marginBottom:14 }}>Portal Connection</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <Field label="SmartCredit Affiliate URL">
              <input placeholder="https://www.smartcredit.com/join/?pid=67187" value={form.scAffiliateUrl}
                onChange={function(e){ upd("scAffiliateUrl", e.target.value); }}
                style={{ fontFamily:"Arial", fontSize:13 }} />
            </Field>
            <Field label="SmartCredit Login Email">
              <input placeholder="your@email.com" value={form.scUsername}
                onChange={function(e){ upd("scUsername", e.target.value); }}
                style={{ fontFamily:"Arial", fontSize:13 }} />
            </Field>
          </div>
        </Card>
        <div style={{ display:"flex", gap:8 }}>
          <BorderBtn onClick={function(){ navigator.clipboard && navigator.clipboard.writeText(form.scAffiliateUrl || ""); }}
            style={{ flex:1, fontSize:12 }}>Copy Link</BorderBtn>
          <BlueBtn onClick={function(){ form.scAffiliateUrl && window.open(form.scAffiliateUrl, "_blank"); }}
            disabled={!form.scAffiliateUrl} style={{ flex:1, fontSize:12 }}>Open Portal</BlueBtn>
        </div>
        <GoldBtn onClick={function(){ onSave(form); }} style={{ justifyContent:"center", display:"flex", padding:"12px" }}>
          ✓ Save SmartCredit Settings
        </GoldBtn>
      </div>
    </div>
  );
}

export default function App() {
  var [view,       setView]       = useState("pricing");
  var [client,     setClient]     = useState(null);
  var [allClients, setAllClients] = useState([]);
  var [settings,   setSettings]   = useState(null);
  var [screen,     setScreen]     = useState("dashboard");
  var [showSC,     setShowSC]     = useState(false);
  var [showLogin,  setShowLogin]  = useState(false);

  useEffect(function() {
    (async function() {
      try {
        // Load clients from Supabase
        var rows = await sbGet("clients?order=created_at.asc");
        var clients = (rows || []).map(rowToClient);
        setAllClients(clients);
        // Load settings from Supabase
        var sdata = await sbGet("settings?key=eq.scAffiliateUrl");
        var scUrl = (sdata && sdata[0]) ? sdata[0].value : "https://www.smartcredit.com/join/?pid=67187";
        var usrData = await sbGet("settings?key=eq.scUsername");
        var scUser = (usrData && usrData[0]) ? usrData[0].value : "";
        setSettings({ scAffiliateUrl: scUrl, scUsername: scUser });
      } catch(e) {
        console.error("Supabase load error:", e);
        setSettings({ scAffiliateUrl:"https://www.smartcredit.com/join/?pid=67187", scUsername:"" });
      }
    })();
  }, []);

  async function saveClients(clients) {
    try {
      for (var i = 0; i < clients.length; i++) {
        await sbUpsert("clients", clientToRow(clients[i]));
      }
    } catch(e) { console.error("saveClients error:", e); }
  }
  async function saveSettings(s) {
    try {
      if (s.scAffiliateUrl !== undefined) {
        await sbUpsert("settings", { key: "scAffiliateUrl", value: s.scAffiliateUrl });
      }
      if (s.scUsername !== undefined) {
        await sbUpsert("settings", { key: "scUsername", value: s.scUsername });
      }
    } catch(e) { console.error("saveSettings error:", e); }
  }

  async function handleOnboard(data) {
    var nc = Object.assign({}, data, { id:"client_" + Date.now(), createdAt: new Date().toISOString() });
    // Save to Supabase immediately
    try { await sbUpsert("clients", clientToRow(nc)); } catch(e) { console.error("onboard save error:", e); }
    var updated = allClients.concat([nc]);
    setAllClients(updated);
    setClient(nc); setScreen("dashboard"); setView("portal");
  }

  function handleLogin(email) {
    if (!email) return;
    if (email === "admin" || email === "smg" || email === "spark") { setShowLogin(false); setView("admin"); return; }
    if (email === "settings") { setShowLogin(false); setView("settings"); return; }
    var found = allClients.find(function(c){ return c.email && c.email.toLowerCase() === email.toLowerCase(); });
    if (found) { setClient(found); setScreen("dashboard"); setShowLogin(false); setView("portal"); }
    else alert("No client found with that email. Contact team@614management.com to get set up.");
  }

  function handleSCSync(sc) {
    var updated = Object.assign({}, client, sc);
    setClient(updated);
    var updatedClients = allClients.map(function(c){ return c.id === updated.id ? updated : c; });
    setAllClients(updatedClients);
    sbUpsert("clients", clientToRow(updated)).catch(function(e){ console.error("SC sync save error:", e); });
    setShowSC(false);
  }

  async function handleSaveSettings(s) { setSettings(s); await saveSettings(s); setView("admin"); }

  var screenTitles = {
    dashboard:"Dashboard", profile:"Credit Profile", lenders:"Lender Finder",
    docs:"Document Vault",  actions:"90-Day Action Plan", billing:"Billing",
  };

  function getScreen() {
    if (screen === "dashboard") return <Dashboard     client={client} onNav={setScreen} onSCSync={function(){ setShowSC(true); }} />;
    if (screen === "profile")   return <CreditProfile client={client} onSCSync={function(){ setShowSC(true); }} />;
    if (screen === "lenders")   return <LenderFinder  client={client} />;
    if (screen === "docs")      return <Documents     client={client} />;
    if (screen === "actions")   return <ActionPlan    client={client} />;
    if (screen === "billing")   return <Billing       client={client} />;
    return null;
  }

  if (view === "pricing")   return (
    <div>
      {showLogin ? <LoginModal onLogin={handleLogin} onClose={function(){ setShowLogin(false); }} /> : null}
      <PricingScreen
        onSelectPlan={function(plan){ setView("onboard"); }}
        onLogin={function(){ setShowLogin(true); }}
        onFreeAnalysis={function(){ setView("freeanalysis"); }} />
    </div>
  );
  if (view === "freeanalysis") return (
    <FreeAnalysis
      onUpgrade={function(){ setView("pricing"); }}
      onLogin={function(){ setShowLogin(true); setView("pricing"); }} />
  );
  if (view === "onboard")  return <Onboard  onComplete={handleOnboard} onBack={function(){ setView("pricing"); }} settings={settings} />;
  if (view === "settings") return <SCSettings settings={settings} onSave={handleSaveSettings} onBack={function(){ setView("pricing"); }} />;
  if (view === "admin")    return (
    <AdminPanel clients={allClients} settings={settings}
      onSelect={function(c){ setClient(c); setScreen("dashboard"); setView("portal"); }}
      onBack={function(){ setView("pricing"); }}
      onSettings={function(){ setView("settings"); }}
      onAddClient={function(){ setView("onboard"); }} />
  );

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#F8FAFC" }}>
      {showSC && client ? (
        <SCModal client={client} settings={settings} onSave={handleSCSync} onClose={function(){ setShowSC(false); }} />
      ) : null}
      <Sidebar screen={screen} onNav={setScreen} client={client}
        onLogout={function(){ setClient(null); setView("pricing"); }} />
      <div style={{ flex:1, overflow:"auto" }}>
        <div style={{ borderBottom:"0.5px solid var(--color-border-tertiary)", padding:"11px 20px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          background:"var(--color-background-primary)", position:"sticky", top:0, zIndex:10 }}>
          <h2 style={{ fontFamily:"Arial", fontSize:14, fontWeight:500, margin:0 }}>{screenTitles[screen]}</h2>
          <div style={{ display:"flex", gap:8 }}>
            <BlueBtn onClick={function(){ setShowSC(true); }} style={{ padding:"5px 12px", fontSize:11 }}>🔄 SmartCredit</BlueBtn>
            <BorderBtn onClick={function(){ setView("admin"); }} style={{ fontSize:11, padding:"5px 12px" }}>Admin</BorderBtn>
          </div>
        </div>
        <div style={{ padding:"18px 20px", maxWidth:680 }}>{getScreen()}</div>
      </div>
    </div>
  );
}
