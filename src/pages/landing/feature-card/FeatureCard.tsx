"use client";
import * as React from "react";
import { FEATURES, type Status } from "./features";
import { tx, useLang } from "../../../i18n";
import "./feature-card.css";

/**
 * Cattle Force feature comparison card.
 * - Rotating conic glow border + soft outer glow + layered drop shadow
 * - Animated aurora header (4 blurred green blobs) showing the active area title
 * - Header separated from body by a shadow (no line)
 * - Left: pill tabs with counts. Right: comparison table card with its own deeper shadow
 * - Auto-advances every 5.5s, pauses on hover and when off-screen, click to jump
 * - Card height locked to the longest list (all panels stacked in one grid cell)
 */

const TAB_MS = 5500;
const INK = "#0b0a09";
const COLS = "minmax(0, 1fr) clamp(112px, 16vw, 180px) clamp(112px, 16vw, 180px)";
const MINT_TINT = "rgba(104,198,164,0.14)";
const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

function useMobile() {
  const [m, setM] = React.useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const on = () => setM(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return m;
}

export function FeatureCard({ className }: { className?: string }) {
  useLang();
  const mobile = useMobile();
  const [tab, setTab] = React.useState(0);
  const [tabStart, setTabStart] = React.useState(() => performance.now());
  const [now, setNow] = React.useState(() => performance.now());
  const tabStartRef = React.useRef(tabStart);
  React.useEffect(() => { tabStartRef.current = tabStart; }, [tabStart]);
  const ref = React.useRef<HTMLDivElement>(null);
  const hover = React.useRef(false);
  const visible = React.useRef(true);
  const elapsed = React.useRef(0);

  React.useEffect(() => {
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; }, { threshold: 0.2 });
    if (ref.current) io.observe(ref.current);
    let raf = 0, last = performance.now();
    const tick = (t: number) => {
      if (visible.current && !hover.current) elapsed.current += t - last;
      last = t;
      if (elapsed.current >= TAB_MS) {
        elapsed.current = 0;
        setTab(i => (i + 1) % FEATURES.length);
        setTabStart(t);
      }
      // re-render per frame only while the title / row entrance animations are running and the card is on screen
      // (re-rendering the whole card at 60fps all the time made scrolling past it stutter on phones)
      if (visible.current && t - tabStartRef.current < 1400) setNow(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, []);

  // mobile carousel: swiping updates the active area, auto-advance / dot taps scroll to it
  const slidesRef = React.useRef<HTMLDivElement>(null);
  const programmatic = React.useRef(0);
  React.useEffect(() => {
    const box = slidesRef.current;
    if (!mobile || !box) return;
    if (Math.round(box.scrollLeft / box.clientWidth) !== tab) {
      programmatic.current = performance.now() + 700; // ignore the scroll events this smooth scroll causes
      box.scrollTo({ left: tab * box.clientWidth, behavior: "smooth" });
    }
  }, [tab, mobile]);
  const onSlides = () => {
    const box = slidesRef.current;
    if (!box || performance.now() < programmatic.current) return;
    const i = Math.round(box.scrollLeft / box.clientWidth);
    if (i !== tab && i >= 0 && i < FEATURES.length) { elapsed.current = 0; setTab(i); setTabStart(performance.now()); }
  };
  const touchTimer = React.useRef(0);
  const onTouchStart = () => { window.clearTimeout(touchTimer.current); hover.current = true; };
  const onTouchEnd = () => { touchTimer.current = window.setTimeout(() => { hover.current = false; }, 3000); };

  const go = (i: number) => { elapsed.current = 0; setTab(i); setTabStart(performance.now()); };
  const since = (now - tabStart) / 1000;
  const titleK = ease(since / 0.5);
  const rowK = (i: number) => ease((since - i * 0.06) / 0.45);

  return (
    <div
      ref={ref}
      className={className}
      onMouseEnter={() => (hover.current = true)}
      onMouseLeave={() => (hover.current = false)}
      style={{ position: "relative", isolation: "isolate", fontFamily: "var(--font-body, 'Geist', system-ui, sans-serif)", color: INK }}
    >
      {/* Outer soft glow */}
      <div aria-hidden className="cf-outerglow" style={{ position: "absolute", inset: -6, zIndex: -2, borderRadius: 16,
        background: "#0b0a09",
        filter: "blur(26px)", opacity: 0.35 }} />
      {/* Card */}
      <div className="cf-shell" style={{ position: "relative", borderRadius: 10, overflow: "hidden", background: "#fff",
        boxShadow: "0 1px 2px rgba(11,10,9,0.05), 0 8px 20px -6px rgba(11,10,9,0.10), 0 32px 80px -16px rgba(11,10,9,0.28), 0 64px 140px -40px rgba(11,10,9,0.22)" }}>

        {/* Aurora header — separated from body by shadow only */}
        <div style={{ position: "relative", zIndex: 2, overflow: "hidden", background: "#fff", height: mobile ? 84 : "clamp(72px, 11vh, 160px)",
          boxShadow: "0 14px 28px -16px rgba(11,10,9,0.30), 0 6px 12px -8px rgba(11,10,9,0.22)" }}>
          <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end",
            padding: mobile ? "0 18px 16px" : "clamp(12px, 2vh, 28px) clamp(20px, 3vw, 36px) clamp(10px, 2vh, 24px)" }}>
            <h3 className="cf-ftitle" style={{ margin: 0, color: INK, fontWeight: 600, fontSize: mobile ? 28 : "clamp(24px, min(3.6vw, 5.2vh), 48px)", lineHeight: 1, letterSpacing: "-0.04em",
              opacity: titleK, transform: `translateY(${(1 - titleK) * 10}px)` }}>{tx(FEATURES[tab].area)}</h3>
          </div>
        </div>

        {mobile ? (
          <div style={{ padding: "16px 0 18px" }}>
            {/* Swipeable cards, one per area */}
            <div ref={slidesRef} onScroll={onSlides} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} className="cf-chips"
              style={{ display: "flex", alignItems: "stretch", overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none" }}>
              {FEATURES.map((f, p) => {
                const on = p === tab;
                return (
                  <div key={f.area} role="tabpanel" aria-roledescription="slide" aria-label={`${p + 1} / ${FEATURES.length}`} aria-hidden={!on}
                    style={{ flex: "0 0 100%", minWidth: 0, boxSizing: "border-box", padding: "0 14px 6px", scrollSnapAlign: "center", scrollSnapStop: "always" }}>
                    <div style={{ height: "100%", boxSizing: "border-box", border: "1px solid #e6ebe9", borderRadius: 8, overflow: "hidden", background: "#fff",
                      boxShadow: "0 2px 4px rgba(11,10,9,0.06), 0 10px 22px -10px rgba(11,10,9,0.22)" }}>
                      {f.rows.map(([label], r) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, borderTop: r ? "1px solid #e3e8e6" : 0, padding: "14px 14px" }}>
                          <span aria-hidden style={{ ...dot, background: "#235149" }}><Check color="#fff" /></span>
                          <span style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.35, letterSpacing: "-0.01em", minWidth: 0 }}>{tx(label)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Position dots */}
            <div role="tablist" aria-label={tx("Feature areas")} style={{ display: "flex", justifyContent: "center", gap: 2, paddingTop: 12 }}>
              {FEATURES.map((f, i) => (
                <button key={f.area} role="tab" aria-selected={i === tab} aria-label={tx(f.area)} onClick={() => go(i)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 5px", border: 0, background: "transparent", cursor: "pointer" }}>
                  <span style={{ display: "block", height: 8, width: i === tab ? 22 : 8, borderRadius: 999, background: i === tab ? INK : "#cfd6d3", transition: "width .3s ease, background .3s ease" }} />
                </button>
              ))}
            </div>
          </div>
        ) : (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: "clamp(12px, 2vh, 20px)",
          padding: "clamp(12px, 2.4vh, 28px) clamp(12px, 2vw, 24px) clamp(20px, 4vh, 40px)" }}>

          {/* Tabs */}
          <div role="tablist" aria-label={tx("Feature areas")} style={{ flex: "1 1 250px", display: "flex", flexDirection: "column", gap: 4 }}>
            {FEATURES.map((f, i) => {
              const on = i === tab;
              return (
                <button key={f.area} role="tab" aria-selected={on} onClick={() => go(i)} className="cf-tab"
                  style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", margin: 0, padding: "clamp(8px, 1.5vh, 15px) 18px", border: 0,
                    borderRadius: 8, background: on ? INK : "transparent", color: on ? "#fff" : INK, fontFamily: "inherit",
                    fontSize: "clamp(14px, 2vh, 18px)", fontWeight: 500, textAlign: "left", cursor: "pointer" }}>
                  <span style={{ flex: 1, letterSpacing: "-0.01em" }}>{tx(f.area)}</span>
                  <span style={{ minWidth: 24, padding: "2px 8px", borderRadius: 999, background: on ? "rgba(255,255,255,0.18)" : "#e3e8e6",
                    color: on ? "#fff" : "#1f2321", fontSize: "clamp(12px, 1.7vh, 14px)", fontWeight: 600, textAlign: "center" }}>{f.rows.length}</span>
                </button>
              );
            })}
          </div>

          {/* Table card — all panels stacked in one grid cell so height = tallest list */}
          <div style={{ flex: "3 1 540px", minWidth: 0, display: "grid", border: "1px solid #e6ebe9", borderRadius: 8, overflow: "hidden", background: "#fff",
            boxShadow: "0 0 0 1px rgba(11,10,9,0.03), 0 2px 4px rgba(11,10,9,0.08), 0 12px 28px -8px rgba(11,10,9,0.22), 0 28px 64px -20px rgba(11,10,9,0.40)" }}>
            {FEATURES.map((f, p) => {
              const on = p === tab;
              return (
                <div key={f.area} role="tabpanel" aria-hidden={!on} style={{ gridArea: "1 / 1", minWidth: 0, visibility: on ? "visible" : "hidden", opacity: on ? 1 : 0, transform: on ? "none" : "translateY(-6px)", transition: on ? "opacity .45s ease, transform .45s ease" : "opacity .35s ease, transform .35s ease, visibility 0s linear .35s", pointerEvents: on ? "auto" : "none" }}>
                  <div style={{ display: "grid", gridTemplateColumns: COLS, alignItems: "center" }}>
                    <div style={headCell}>{tx("Capability")}</div>
                    <div style={{ display: "flex", alignItems: "center", height: "100%", padding: "clamp(5px, 0.9vh, 10px) 14px", background: MINT_TINT }}>
                      <span style={{ padding: "clamp(4px, 0.8vh, 7px) 14px", borderRadius: 999, background: "#235149", color: "#fff", fontSize: "clamp(12px, 1.8vh, 15px)", fontWeight: 600 }}>Cattle Force</span>
                    </div>
                    <div style={{ ...headCell, padding: "clamp(8px, 1.5vh, 18px) 14px" }}>{tx("Others")}</div>
                  </div>
                  {f.rows.map(([label, others], i) => {
                    const k = on ? rowK(i) : 1; // leaving panels keep their rows so the whole panel can fade out
                    return (
                      <div key={label} className="cf-row" style={{ display: "grid", gridTemplateColumns: COLS, alignItems: "stretch",
                        borderTop: "1px solid #e3e8e6", opacity: k, transform: `translateY(${(1 - k) * 12}px)` }}>
                        <div style={{ display: "flex", alignItems: "center", padding: "clamp(6px, 1.15vh, 18px) clamp(14px, 2vw, 22px)",
                          fontSize: "clamp(13px, min(1.4vw, 1.95vh), 18px)", fontWeight: 500, lineHeight: 1.4, textWrap: "pretty" as any }}>{tx(label)}</div>
                        <div style={{ display: "flex", alignItems: "center", padding: "clamp(4px, 0.7vh, 8px) 14px", background: MINT_TINT }}>
                          <StatusChip s="cf" />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", padding: "clamp(4px, 0.7vh, 8px) 14px" }}>
                          <StatusChip s={others} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}


const headCell: React.CSSProperties = { padding: "clamp(8px, 1.5vh, 18px) clamp(14px, 2vw, 22px)", fontSize: "clamp(13px, 1.9vh, 16px)", fontWeight: 600, letterSpacing: "-0.005em" };

const Check = ({ color }: { color: string }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
);
const dot: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", width: "clamp(16px, 2.4vh, 20px)", height: "clamp(16px, 2.4vh, 20px)", flexShrink: 0, borderRadius: "50%" };
const chip: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, fontSize: "clamp(12px, 1.8vh, 15px)", fontWeight: 600 };

function StatusChip({ s, icon }: { s: Status | "cf"; icon?: boolean }) {
  const label = tx(s === "p" ? "Partial" : s === "n" ? "Not available" : "Included");
  const color = s === "cf" ? "#0f2622" : s === "y" ? INK : s === "p" ? "#2a2e2c" : "#3d413f";
  const mark =
    s === "cf" ? <span aria-hidden style={{ ...dot, background: "#235149" }}><Check color="#fff" /></span> :
    s === "y" ? <span aria-hidden style={{ ...dot, background: "#e9eceb" }}><Check color={INK} /></span> :
    s === "p" ? <span aria-hidden style={{ ...dot, border: "1.5px solid #3d413f", background: "linear-gradient(90deg, #3d413f 50%, transparent 50%)" }} /> :
    <span aria-hidden style={{ ...dot, background: "#e6e8e7" }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3d413f" strokeWidth="3" strokeLinecap="round" style={{ display: "block" }}><path d="M6 6l12 12M18 6L6 18" /></svg>
    </span>;
  // icon-only (mobile table cells): the label stays available to screen readers and on long-press
  if (icon) return <span role="img" aria-label={label} title={label} style={{ display: "inline-flex", padding: "10px 0" }}>{mark}</span>;
  return <span style={{ ...chip, color }}>{mark}{label}</span>;
}

export default FeatureCard;
