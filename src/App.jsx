import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Target, TrendingDown, TrendingUp, Home, ShieldAlert, Flame, X, Send, ArrowRight, Sparkles, ChevronRight } from "lucide-react";

const STORAGE_KEY = "finanzas-data-v3";
const SUBSCRIBE_LINK = "#"; // <-- PEGA aquí tu link de Stripe / Gumroad cuando lo tengas
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mqpzogvp";

const DEFAULT_DATA = { incomes: [], fixedExpenses: [], leaks: [], debts: [], goals: [] };

function uid() { return Math.random().toString(36).slice(2, 9); }
function money(n) { return "$" + Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 }); }

const C = {
  bg: "#F6F8F6",
  card: "#FFFFFF",
  border: "#E8ECE9",
  text: "#161B19",
  muted: "#6B7570",
  mutedLight: "#9AA39D",
  primary: "#00B37E",
  primaryDark: "#00925F",
  primarySoft: "#E3FBF1",
  gold: "#FFB020",
  goldSoft: "#FFF4DE",
  coral: "#FF5C5C",
  coralSoft: "#FFEBEB",
  navy: "#243B36",
};

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
      * { box-sizing: border-box; }
      body { margin: 0; }
      input:focus, textarea:focus { outline: 2px solid ${C.primary}; outline-offset: 1px; }
      button { font-family: 'Inter', sans-serif; }
      ::-webkit-scrollbar { display: none; }
    `}</style>
  );
}

function Ring({ pct, color, size = 44, stroke = 5, children }) {
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `conic-gradient(${color} ${clamped * 3.6}deg, ${C.border} 0deg)`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: size - stroke * 2, height: size - stroke * 2, borderRadius: "50%", background: C.card,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.24, fontWeight: 700, color,
        fontFamily: "'Inter', sans-serif",
      }}>
        {children}
      </div>
    </div>
  );
}

function Avatar({ letter, color }) {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: "50%", background: color, color: "#fff", display: "flex",
      alignItems: "center", justifyContent: "center", fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 16,
      flexShrink: 0,
    }}>{letter}</div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 16, marginBottom: 12, boxShadow: "0 1px 2px rgba(22,27,25,0.04)", ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "22px 0 12px" }}>
      <div style={{ width: 26, height: 26, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={14} color={color} strokeWidth={2.5} />
      </div>
      <span style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 15.5, fontWeight: 700, color: C.text }}>{title}</span>
    </div>
  );
}

function ListRow({ label, sub, value, onDelete }) {
  return (
    <Card style={{ padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <div style={{ color: C.text, fontSize: 14.5, fontWeight: 600 }}>{label}</div>
        {sub && <div style={{ color: C.mutedLight, fontSize: 12, marginTop: 1 }}>{sub}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontWeight: 700, color: C.text, fontSize: 14.5 }}>{value}</span>
        {onDelete && <button onClick={onDelete} style={{ background: "none", border: "none", color: C.mutedLight, cursor: "pointer", padding: 2 }}><Trash2 size={15} /></button>}
      </div>
    </Card>
  );
}

function AddForm({ fields, onAdd, color, label }) {
  const [open, setOpen] = useState(false);
  const [vals, setVals] = useState({});
  const submit = () => {
    if (!vals[fields[0].key]) return;
    const clean = {};
    fields.forEach((f) => { clean[f.key] = f.type === "number" ? Number(vals[f.key] || 0) : vals[f.key] || ""; });
    onAdd(clean); setVals({}); setOpen(false);
  };
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", background: `${color}12`,
        border: `1.5px dashed ${color}55`, color, borderRadius: 14, padding: "12px 0", fontSize: 13.5, fontWeight: 600, cursor: "pointer", marginTop: 2,
      }}>
        <Plus size={15} /> {label}
      </button>
    );
  }
  return (
    <Card style={{ border: `1.5px solid ${color}55` }}>
      {fields.map((f) => (
        <input key={f.key} type={f.type === "number" ? "number" : "text"} placeholder={f.placeholder}
          value={vals[f.key] || ""} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })}
          style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, padding: "11px 12px", fontSize: 14, marginBottom: 8 }} />
      ))}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={submit} style={{ flex: 1, background: color, border: "none", borderRadius: 10, padding: "11px 0", color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>Guardar</button>
        <button onClick={() => { setOpen(false); setVals({}); }} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 14px", color: C.muted, cursor: "pointer" }}><X size={14} /></button>
      </div>
    </Card>
  );
}

// ---------- LANDING ----------
function Landing({ onStart, onSubscribeClick }) {
  return (
    <div style={{ padding: "36px 20px 40px" }}>
      <div style={{
        background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, borderRadius: 24, padding: "28px 22px",
        color: "#fff", marginBottom: 22, position: "relative", overflow: "hidden",
      }}>
        <Sparkles size={20} style={{ position: "absolute", top: 18, right: 18, opacity: 0.5 }} />
        <div style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 26, fontWeight: 700, lineHeight: 1.25, marginBottom: 8 }}>
          Tu plata,<br />bajo control 💪
        </div>
        <div style={{ fontSize: 13.5, opacity: 0.92, lineHeight: 1.5, maxWidth: 280 }}>
          Mira dónde entra, dónde se va, y qué tan cerca estás de tus metas — todo en un solo lugar.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        <button onClick={onStart} style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: C.primary, border: "none",
          borderRadius: 16, padding: "15px 0", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
        }}>
          Empezar gratis <ArrowRight size={17} />
        </button>
        <button onClick={onSubscribeClick} style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: C.goldSoft,
          border: "none", borderRadius: 16, padding: "15px 0", color: "#B37400", fontWeight: 700, fontSize: 15, cursor: "pointer",
        }}>
          ✨ Quiero un plan personalizado
        </button>
      </div>

      <div style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 13, fontWeight: 700, color: C.mutedLight, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>
        Qué vas a encontrar
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {[
          { icon: TrendingUp, title: "Ingresos y gastos", text: "Todo en un vistazo, sin hojas sueltas.", color: C.primary, bg: C.primarySoft },
          { icon: Flame, title: "Fugas de dinero", text: "Descubre a dónde se va tu plata sin darte cuenta.", color: C.coral, bg: C.coralSoft },
          { icon: ShieldAlert, title: "Deudas con progreso", text: "Un anillo visual que crece con cada pago.", color: C.gold, bg: C.goldSoft },
          { icon: Target, title: "Metas de ahorro", text: "Ponle número y fecha a lo que quieres lograr.", color: C.primaryDark, bg: C.primarySoft },
        ].map((f, i) => (
          <Card key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <f.icon size={19} color={f.color} />
            </div>
            <div>
              <div style={{ color: C.text, fontSize: 14.5, fontWeight: 700 }}>{f.title}</div>
              <div style={{ color: C.muted, fontSize: 12.5, marginTop: 1 }}>{f.text}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---------- LEAD FORM ----------
function LeadForm({ onClose }) {
  const [form, setForm] = useState({ name: "", contact: "", note: "" });
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name || !form.contact) return;
    setSaving(true);
    try {
      await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...form, date: new Date().toISOString() }),
      });
      setSent(true);
    } catch (e) {}
    setSaving(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#161B19AA", display: "flex", alignItems: "flex-end", zIndex: 50 }}>
      <div style={{ background: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, width: "100%", padding: 24 }}>
        <div style={{ width: 40, height: 4, background: C.border, borderRadius: 4, margin: "0 auto 18px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 18, color: C.text, fontWeight: 700 }}>Plan personalizado ✨</div>
          <button onClick={onClose} style={{ background: C.bg, border: "none", borderRadius: "50%", width: 30, height: 30, color: C.muted, cursor: "pointer" }}><X size={16} /></button>
        </div>

        {sent ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
            <div style={{ color: C.text, fontSize: 15, fontWeight: 600 }}>¡Recibido!</div>
            <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Te van a contactar pronto para armar tu plan.</div>
          </div>
        ) : (
          <>
            <div style={{ color: C.muted, fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
              Deja tus datos y te contactamos para armar tu plan financiero personalizado.
            </div>
            <input placeholder="Tu nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, padding: "12px 14px", fontSize: 14.5, marginBottom: 10 }} />
            <input placeholder="Teléfono o email" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })}
              style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, padding: "12px 14px", fontSize: 14.5, marginBottom: 10 }} />
            <textarea placeholder="Cuéntame brevemente tu situación (opcional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={3} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, padding: "12px 14px", fontSize: 14.5, marginBottom: 14, resize: "none" }} />
            <button onClick={submit} disabled={saving} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: C.primary,
              border: "none", borderRadius: 14, padding: "14px 0", color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer",
            }}>
              <Send size={15} /> {saving ? "Enviando..." : "Enviar solicitud"}
            </button>
            {SUBSCRIBE_LINK !== "#" && (
              <a href={SUBSCRIBE_LINK} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", marginTop: 12, color: C.muted, fontSize: 12.5 }}>
                O suscríbete directo aquí →
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ---------- CALC APP ----------
function CalcApp({ onSubscribeClick, tab, setTab }) {
  const [data, setData] = useState(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try { const res = await window.storage.get(STORAGE_KEY, false); if (res?.value) setData(JSON.parse(res.value)); } catch (e) {}
      setLoaded(true);
    })();
  }, []);
  useEffect(() => { if (loaded) window.storage.set(STORAGE_KEY, JSON.stringify(data), false).catch(() => {}); }, [data, loaded]);

  const totalIncome = useMemo(() => data.incomes.reduce((s, i) => s + Number(i.amount), 0), [data.incomes]);
  const totalFixed = useMemo(() => data.fixedExpenses.reduce((s, e) => s + Number(e.amount), 0), [data.fixedExpenses]);
  const totalLeaks = useMemo(() => data.leaks.reduce((s, l) => s + Number(l.amount), 0), [data.leaks]);
  const totalDebt = useMemo(() => data.debts.reduce((s, d) => s + (Number(d.total) - Number(d.paid)), 0), [data.debts]);
  const leftover = totalIncome - totalFixed - totalLeaks;
  const biggestLeak = [...data.leaks].sort((a, b) => b.amount - a.amount)[0];

  const addTo = (key, item) => setData((d) => ({ ...d, [key]: [...d[key], { id: uid(), ...item }] }));
  const removeFrom = (key, id) => setData((d) => ({ ...d, [key]: d[key].filter((x) => x.id !== id) }));
  const bump = (key, id, field, delta) => setData((d) => ({ ...d, [key]: d[key].map((x) => (x.id === id ? { ...x, [field]: Math.max(0, Number(x[field]) + delta) } : x)) }));

  const tips = useMemo(() => {
    const t = [];
    if (biggestLeak) t.push(`Tu mayor fuga es "${biggestLeak.name}" — ${money(biggestLeak.amount)}/mes. Bajarlo a la mitad libera ${money(biggestLeak.amount / 2)}.`);
    if (totalLeaks > 0) t.push(`Los gastos variables suman ${money(totalLeaks)}/mes — ${money(totalLeaks * 12)} al año.`);
    if (totalDebt > 0) { const s = [...data.debts].sort((a, b) => (a.total - a.paid) - (b.total - b.paid))[0]; if (s) t.push(`Método bola de nieve: paga primero "${s.name}" para ganar impulso.`); }
    if (leftover > 0) t.push(`Te sobran ${money(leftover)}/mes. Automatiza una transferencia a ahorro el día que cobras.`);
    if (leftover <= 0 && (data.incomes.length || data.fixedExpenses.length)) t.push(`Tus gastos igualan o superan tu ingreso. Primero hay que cerrar esa brecha.`);
    if (!data.incomes.length && !data.fixedExpenses.length) t.push(`Empieza añadiendo tu ingreso y tus gastos fijos para ver tu panorama real.`);
    return t;
  }, [biggestLeak, totalLeaks, totalDebt, data, leftover]);

  return (
    <div style={{ padding: "18px 18px 0" }}>
      {tab === "resumen" && (
        <>
          <Card style={{ background: `linear-gradient(135deg, ${C.navy}, #16211E)`, border: "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div><div style={{ color: "#9FB3AC", fontSize: 11, fontWeight: 600 }}>INGRESO</div><div style={{ color: "#fff", fontSize: 21, fontWeight: 800 }}>{money(totalIncome)}</div></div>
              <div><div style={{ color: "#9FB3AC", fontSize: 11, fontWeight: 600 }}>GASTOS</div><div style={{ color: "#FF8A8A", fontSize: 21, fontWeight: 800 }}>{money(totalFixed + totalLeaks)}</div></div>
              <div><div style={{ color: "#9FB3AC", fontSize: 11, fontWeight: 600 }}>LIBRE</div><div style={{ color: leftover >= 0 ? "#5EEBB0" : "#FF8A8A", fontSize: 21, fontWeight: 800 }}>{money(leftover)}</div></div>
            </div>
          </Card>

          <button onClick={onSubscribeClick} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: C.goldSoft,
            border: "none", borderRadius: 16, padding: "13px 0", color: "#B37400", fontWeight: 700, fontSize: 13.5, cursor: "pointer", marginBottom: 8,
          }}>✨ ¿Ayuda 1-a-1 con tu plan? Pide tu suscripción</button>

          <SectionTitle icon={TrendingUp} title="Ingresos" color={C.primary} />
          {data.incomes.map((i) => <ListRow key={i.id} label={i.name} sub={i.day ? `Día ${i.day}` : undefined} value={money(i.amount)} onDelete={() => removeFrom("incomes", i.id)} />)}
          <AddForm color={C.primary} label="Añadir ingreso" fields={[{ key: "name", placeholder: "Nombre" }, { key: "amount", type: "number", placeholder: "Cantidad mensual" }, { key: "day", type: "number", placeholder: "Día que cobra (opcional)" }]} onAdd={(v) => addTo("incomes", v)} />

          <SectionTitle icon={TrendingDown} title="Gastos fijos" color={C.gold} />
          {data.fixedExpenses.map((e) => <ListRow key={e.id} label={e.name} value={money(e.amount)} onDelete={() => removeFrom("fixedExpenses", e.id)} />)}
          <AddForm color={C.gold} label="Añadir gasto fijo" fields={[{ key: "name", placeholder: "Nombre" }, { key: "amount", type: "number", placeholder: "Cantidad mensual" }]} onAdd={(v) => addTo("fixedExpenses", v)} />
        </>
      )}

      {tab === "deudas" && (
        <>
          <SectionTitle icon={ShieldAlert} title={`Deudas — ${money(totalDebt)} restante`} color={C.coral} />
          {data.debts.map((d) => {
            const remaining = d.total - d.paid;
            const pct = d.total > 0 ? (d.paid / d.total) * 100 : 0;
            return (
              <Card key={d.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Ring pct={pct} color={C.coral}>{Math.round(pct)}%</Ring>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ color: C.text, fontSize: 14.5, fontWeight: 700 }}>{d.name}</div>
                    <button onClick={() => removeFrom("debts", d.id)} style={{ background: "none", border: "none", color: C.mutedLight, cursor: "pointer" }}><Trash2 size={14} /></button>
                  </div>
                  <div style={{ color: C.muted, fontSize: 12, marginTop: 1 }}>{money(remaining)} de {money(d.total)}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <button onClick={() => bump("debts", d.id, "paid", 50)} style={{ flex: 1, background: C.coralSoft, border: "none", borderRadius: 8, padding: "6px 0", color: "#C43D3D", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>+$50</button>
                    <button onClick={() => bump("debts", d.id, "paid", 100)} style={{ flex: 1, background: C.coralSoft, border: "none", borderRadius: 8, padding: "6px 0", color: "#C43D3D", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>+$100</button>
                  </div>
                </div>
              </Card>
            );
          })}
          <AddForm color={C.coral} label="Añadir deuda" fields={[{ key: "name", placeholder: "Nombre" }, { key: "total", type: "number", placeholder: "Balance total" }]} onAdd={(v) => addTo("debts", { ...v, paid: 0 })} />
        </>
      )}

      {tab === "metas" && (
        <>
          <SectionTitle icon={Target} title="Metas de ahorro" color={C.gold} />
          {data.goals.map((g) => {
            const pct = g.target > 0 ? (g.saved / g.target) * 100 : 0;
            return (
              <Card key={g.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Ring pct={pct} color={C.gold}>{Math.round(pct)}%</Ring>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ color: C.text, fontSize: 14.5, fontWeight: 700 }}>{g.name}</div>
                    <button onClick={() => removeFrom("goals", g.id)} style={{ background: "none", border: "none", color: C.mutedLight, cursor: "pointer" }}><Trash2 size={14} /></button>
                  </div>
                  <div style={{ color: C.muted, fontSize: 12, marginTop: 1 }}>{money(g.saved)} de {money(g.target)}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <button onClick={() => bump("goals", g.id, "saved", 25)} style={{ flex: 1, background: C.goldSoft, border: "none", borderRadius: 8, padding: "6px 0", color: "#B37400", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>+$25</button>
                    <button onClick={() => bump("goals", g.id, "saved", 100)} style={{ flex: 1, background: C.goldSoft, border: "none", borderRadius: 8, padding: "6px 0", color: "#B37400", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>+$100</button>
                  </div>
                </div>
              </Card>
            );
          })}
          <AddForm color={C.gold} label="Añadir meta" fields={[{ key: "name", placeholder: "Nombre" }, { key: "target", type: "number", placeholder: "Meta total" }]} onAdd={(v) => addTo("goals", { ...v, saved: 0 })} />
        </>
      )}

      {tab === "fugas" && (
        <>
          <SectionTitle icon={Flame} title={`Fugas — ${money(totalLeaks)}/mes`} color={C.coral} />
          {[...data.leaks].sort((a, b) => b.amount - a.amount).map((l) => (
            <ListRow key={l.id} label={l.name} value={money(l.amount)} onDelete={() => removeFrom("leaks", l.id)} />
          ))}
          <AddForm color={C.coral} label="Añadir gasto variable" fields={[{ key: "name", placeholder: "Nombre" }, { key: "amount", type: "number", placeholder: "Cantidad mensual aprox." }]} onAdd={(v) => addTo("leaks", v)} />

          <SectionTitle icon={Sparkles} title="Consejos para ti" color={C.primary} />
          {tips.map((t, idx) => (
            <Card key={idx} style={{ background: C.primarySoft, border: "none" }}>
              <div style={{ color: C.navy, fontSize: 13, lineHeight: 1.5, fontWeight: 500 }}>{t}</div>
            </Card>
          ))}
        </>
      )}
      <div style={{ height: 80 }} />
    </div>
  );
}

// ---------- ROOT ----------
export default function App() {
  const [view, setView] = useState("landing");
  const [tab, setTab] = useState("resumen");
  const [showLead, setShowLead] = useState(false);

  const navTabs = [
    { id: "resumen", label: "Inicio", icon: Home },
    { id: "deudas", label: "Deudas", icon: ShieldAlert },
    { id: "metas", label: "Metas", icon: Target },
    { id: "fugas", label: "Fugas", icon: Flame },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <GlobalStyle />

      {view === "calc" && (
        <div style={{ padding: "18px 18px 4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar letter="👋" color={C.primary} />
            <div>
              <div style={{ fontSize: 11.5, color: C.mutedLight, fontWeight: 600 }}>Bienvenido</div>
              <div style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 17, fontWeight: 700, color: C.text }}>Tu plan financiero</div>
            </div>
          </div>
          <button onClick={() => setView("landing")} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "8px 12px", color: C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            Inicio <ChevronRight size={13} />
          </button>
        </div>
      )}

      {view === "landing" && <Landing onStart={() => setView("calc")} onSubscribeClick={() => setShowLead(true)} />}
      {view === "calc" && <CalcApp onSubscribeClick={() => setShowLead(true)} tab={tab} setTab={setTab} />}
      {showLead && <LeadForm onClose={() => setShowLead(false)} />}

      {view === "calc" && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.card, borderTop: `1px solid ${C.border}`, display: "flex", padding: "10px 6px 12px", justifyContent: "space-around" }}>
          {navTabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none",
              color: tab === t.id ? C.primary : C.mutedLight, cursor: "pointer", padding: "4px 12px", fontSize: 10.5, fontWeight: 600,
            }}>
              <t.icon size={20} strokeWidth={tab === t.id ? 2.5 : 2} fill={tab === t.id ? `${C.primary}22` : "none"} />
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
