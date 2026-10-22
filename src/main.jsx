import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Copy, Download, ExternalLink, Factory, GraduationCap, Info, Link as LinkIcon, Maximize2, Minimize2, Monitor, Play, QrCode, RotateCcw, Settings2, ShieldCheck, SlidersHorizontal, Smartphone, TriangleAlert, Weight, X, XCircle, Zap } from 'lucide-react';
import { calculateRigging, MATERIALS, INITIAL, EXERCISES } from './rigging.js';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/dm-sans/latin-700.css';
import '@fontsource/barlow-condensed/latin-600.css';
import './styles.css';

const PUBLIC_URL = 'https://josvr.github.io/ABVL-VVLh/';
const kg = (value, digits = 0) => Number(value).toLocaleString('nl-NL', { maximumFractionDigits: digits });
const decimal = (value, digits = 2) => Number(value).toLocaleString('nl-NL', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const STATUSES = {
  within: { title: 'Binnen de WLL', label: 'De last past bij deze combinatie.', icon: CheckCircle2 },
  close: { title: 'Binnen de WLL · let op', label: 'Je gebruikt 90% of meer van de WLL.', icon: TriangleAlert },
  overload: { title: 'WLL overschreden', label: 'Deze combinatie is te licht voor de last.', icon: XCircle },
  forbidden: { title: 'Stop · hoek te groot', label: 'Vanaf 60° geen toegestane WLL in deze oefening.', icon: XCircle },
  unsupported: { title: 'Eerst de gebruiksaanwijzing', label: 'Deze situatie valt buiten de algemene tabel.', icon: BookOpen },
  invalid: { title: 'Controleer je invoer', label: 'Gebruik een last en WLL groter dan 0 kg.', icon: Info },
};

function Logo({ compact = false }) {
  return <div className={`logo ${compact ? 'compact' : ''}`}><span className="logo-symbol"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2v9M5 31l15-20 15 20M10 26h20v10H10z" /></svg></span><div><strong>hijs<span>inzicht</span></strong><small>ABVL / VVLh OEFENOMGEVING</small></div></div>;
}

function App() {
  const [page, setPage] = useState('simulator');
  const [config, setConfig] = useState({ ...INITIAL });
  const [classMode, setClassMode] = useState(false);
  const [share, setShare] = useState(false);
  const [source, setSource] = useState(false);
  const [forceVisible, setForceVisible] = useState(true);
  const [activeExercise, setActiveExercise] = useState(0);
  const [answers, setAnswers] = useState({});
  const [progressAvailable, setProgressAvailable] = useState(true);
  const initialized = useRef(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('hijsinzicht-progress-v1') || '{}');
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
        setAnswers(Object.fromEntries(Object.entries(saved).filter(([id, answer]) => EXERCISES.some(e => e.id === id) && ['within', 'overload', 'stop'].includes(answer))));
      }
    } catch { setProgressAvailable(false); }
    initialized.current = true;
  }, []);
  useEffect(() => {
    if (!initialized.current) return;
    try { localStorage.setItem('hijsinzicht-progress-v1', JSON.stringify(answers)); } catch { setProgressAvailable(false); }
  }, [answers]);
  const result = calculateRigging({ ...config, single: Number(config.single), weight: Number(config.weight) });
  const change = (key, value) => setConfig(c => ({ ...c, [key]: value }));
  const changeMaterial = material => setConfig(c => ({ ...c, material, single: MATERIALS[material].single }));
  const completed = EXERCISES.filter(e => answers[e.id]).length;
  const go = target => { setPage(target); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const toggleClass = async () => {
    const next = !classMode;
    setClassMode(next);
    try {
      if (next && !document.fullscreenElement) await document.documentElement.requestFullscreen();
      else if (!next && document.fullscreenElement) await document.exitFullscreen();
    } catch { /* De grotere lesweergave werkt ook zonder fullscreen-toestemming. */ }
  };
  return <div className={`app-shell ${classMode ? 'class-mode' : ''}`}>
    <aside className="sidebar">
      <Logo />
      <div className="sidebar-rule" />
      <p className="nav-label">JOUW OEFENOMGEVING</p>
      <nav aria-label="Hoofdnavigatie">
        <button className={page === 'simulator' ? 'active' : ''} onClick={() => go('simulator')}><SlidersHorizontal size={19} /><span>Hijssimulator</span><ChevronRight className="nav-chevron" size={15} /></button>
        <button className={page === 'exercises' ? 'active' : ''} onClick={() => go('exercises')}><GraduationCap size={20} /><span>Praktijkopdrachten</span><span className="nav-counter">{completed}/{EXERCISES.length}</span></button>
        <button className={page === 'reference' ? 'active' : ''} onClick={() => go('reference')}><BookOpen size={19} /><span>Zo werkt het</span></button>
      </nav>
      <div className="sidebar-tip"><span className="tip-icon"><Factory size={22} /></span><h3>Van inzicht naar praktijk.</h3><p>Oefen je keuzes. Begrijp de krachten. Bespreek het samen.</p><span className="tiny-label">LEREN DOOR TE DOEN</span></div>
      <div className="sidebar-bottom"><span className="brand-word">deltalinqs<span className="brand-mark">//</span></span><span>Training & Services</span><small>Oefenapp voor cursisten</small></div>
    </aside>
    <div className="main-shell">
      <header className="topbar"><div className="breadcrumb"><span>Training & ontwikkeling</span><ChevronRight size={14} /><strong>Veilig hijsen</strong></div><div className="top-actions"><button aria-label={classMode ? 'Verlaat lesmodus' : 'Lesmodus'} className={`text-button class-toggle ${classMode ? 'selected' : ''}`} onClick={toggleClass}>{classMode ? <Minimize2 size={17} /> : <Monitor size={18} />}<span>{classMode ? 'Verlaat lesmodus' : 'Lesmodus'}</span></button><button className="share-button" onClick={() => setShare(true)}><QrCode size={17} /><span>Delen & QR-code</span></button></div></header>
      <main id="main-content">
        <section className="page-heading"><div><div className="eyebrow"><span /> PRAKTIJK BEGINT MET INZICHT</div><h1>{page === 'simulator' ? <>Elke hoek maakt <span>verschil.</span></> : page === 'exercises' ? <>Jouw keuze. <span>Jouw inzicht.</span></> : <>De basis van <span>veilig aanslaan.</span></>}</h1><p>{page === 'simulator' ? 'Stel je hijssituatie samen en ontdek wat er met de krachten gebeurt.' : page === 'exercises' ? 'Herken de situatie, beoordeel de combinatie en bespreek je keuze.' : 'Van buitenhoek tot werklastfactor. Begrijp wat je berekent.'}</p></div><div className="course-badge"><span className="badge-icon"><ShieldCheck size={23} /></span><div><strong>ABVL / VVLh</strong><small>Theorie in de praktijk</small></div></div></section>
        <div className="mobile-nav" role="navigation" aria-label="Tabbladen"><button className={page === 'simulator' ? 'active' : ''} onClick={() => go('simulator')}><SlidersHorizontal size={16} />Simulator</button><button className={page === 'exercises' ? 'active' : ''} onClick={() => go('exercises')}><GraduationCap size={17} />Oefenen</button><button className={page === 'reference' ? 'active' : ''} onClick={() => go('reference')}><BookOpen size={16} />Uitleg</button></div>
        {page === 'simulator' && <>
          <div className="simulator-grid">
            <section className="panel setup-panel" aria-labelledby="setup-title"><div className="panel-heading"><span className="step">01</span><h2 id="setup-title">Stel je hijs samen</h2><button className="icon-button reset-button" title="Herstel beginwaarden" aria-label="Herstel beginwaarden" onClick={() => setConfig({ ...INITIAL })}><RotateCcw size={16} /></button></div><div className="setup-content">
              <label className="field-label" htmlFor="weight">Gewicht van de last <Weight size={15} /></label><div className="unit-input"><input id="weight" inputMode="decimal" type="number" min="1" step="1" value={config.weight} onChange={e => change('weight', e.target.value)} /><span>kg</span></div>
              <div className="control-block"><label className="field-label" htmlFor="material">Hijsmateriaal</label><div className="select-wrap"><select id="material" value={config.material} onChange={e => changeMaterial(e.target.value)}>{Object.entries(MATERIALS).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select><ChevronDown size={16} /></div><p className="field-hint">{MATERIALS[config.material].description}</p></div>
              <label className="field-label" htmlFor="single">WLL van één enkele leng <button className="inline-help" aria-label="Wat betekent WLL?" onClick={() => setSource(true)}><CircleHelp size={14} /></button></label><div className="unit-input"><input id="single" inputMode="decimal" type="number" min="1" step="1" value={config.single} onChange={e => change('single', e.target.value)} /><span>kg</span></div><p className="field-hint">Voorbeeldwaarde. Neem in de praktijk de WLL van het label.</p>
              <fieldset className="control-block"><legend className="field-label">Aantal lengen</legend><div className="segmented"><button aria-pressed={config.legs === 2} className={config.legs === 2 ? 'active' : ''} onClick={() => change('legs', 2)}><RigIcon legs={2} />2-sprong</button><button aria-pressed={config.legs === 4} className={config.legs === 4 ? 'active' : ''} onClick={() => change('legs', 4)}><RigIcon legs={4} />4-sprong</button></div></fieldset>
              <fieldset className="control-block"><legend className="field-label">Aanslagmethode</legend><div className="segmented"><button className={config.method === 'direct' ? 'active' : ''} aria-pressed={config.method === 'direct'} onClick={() => change('method', 'direct')}>Direct</button><button className={config.method === 'choke' ? 'active' : ''} aria-pressed={config.method === 'choke'} onClick={() => change('method', 'choke')}>Gestropt <span className="mini-factor">× 0,8*</span></button></div><p className="field-hint">{config.method === 'choke' ? '*Factor 0,8 bij een tweesprong. Viersprong: zie gebruiksaanwijzing.' : 'Rechtstreeks aan de hijspunten bevestigd.'}</p></fieldset>
              <label className="toggle-row"><input type="checkbox" checked={config.symmetric} onChange={e => change('symmetric', e.target.checked)} /><span className="toggle-track" /><span>Symmetrische belasting<small>Zwaartepunt in het midden</small></span></label>
            </div></section>
            <section className="panel visual-panel" aria-labelledby="visual-title"><div className="panel-heading"><span className="step">02</span><h2 id="visual-title">Ontdek het effect</h2><span className="live-label"><i />LIVE</span></div><div className="diagram-top"><span><span className="diagram-dot" />{MATERIALS[config.material].label} · {config.legs}-sprong · {config.method === 'direct' ? 'direct' : 'gestropt'}</span><button className={`force-toggle ${forceVisible ? 'on' : ''}`} aria-pressed={forceVisible} onClick={() => setForceVisible(!forceVisible)}><Zap size={13} />Krachten</button></div>
              <RigDiagram config={config} result={result} showForces={forceVisible} />
              <div className="angle-control"><div className="angle-heading"><label htmlFor="angle">Buitenhoek <span>β</span><small>tussen leng en verticaal</small></label><div className={`angle-value ${config.angle >= 60 ? 'danger-text' : ''}`}>{config.angle}<span>°</span></div></div><div className="slider-wrap"><input id="angle" type="range" min="0" max="75" step="1" value={config.angle} onChange={e => change('angle', Number(e.target.value))} style={{ '--progress': `${config.angle / 75 * 100}%` }} /><div className="slider-marks"><span>0°</span><span style={{ left: '60%' }}>45°</span><span style={{ left: '80%' }}>60°</span><span>75°</span></div></div><div className="angle-presets" aria-label="Kies een buitenhoek">{[0, 30, 45, 60, 75].map(a => <button className={a === config.angle ? 'active' : ''} key={a} onClick={() => change('angle', a)}>{a}°</button>)}</div><div className="angle-insight"><Info size={16} /><p>{config.angle >= 60 ? 'Deze hoek valt buiten de toegestane waarden in deze oefening.' : config.angle >= 45 ? 'Grotere buitenhoek = meer kracht in de lengen en een lagere WLL.' : 'Een kleinere buitenhoek verlaagt de kracht in elke dragende leng.'}</p></div></div>
            </section>
            <ResultPanel result={result} config={config} onSource={() => setSource(true)} />
          </div>
          <div className="below-grid"><section className="panel quick-reference"><div className="quick-title"><BookOpen size={18} /><h2>De factoren, in één oogopslag</h2><button onClick={() => go('reference')}>Bekijk uitleg <ArrowUpRight size={15} /></button></div><FactorTable angle={config.angle} legs={config.legs} /><p className="table-footnote">Direct aangeslagen · symmetrische belasting · gestropte 2-sprong: factor × 0,8</p></section><section className="practice-cta"><div className="cta-text"><span className="eyebrow">KLAAR VOOR DE PRAKTIJK?</span><h2>Wat zou jij kiezen?</h2><p>Test je inzicht met {EXERCISES.length} herkenbare hijssituaties.</p><button onClick={() => go('exercises')}>Start een oefening <ArrowRight size={17} /></button></div><div className="cta-graphic"><GraduationCap size={66} strokeWidth={1.2} /><span>01 — 08</span></div></section></div>
        </>}
        {page === 'exercises' && <Exercises active={activeExercise} setActive={setActiveExercise} answers={answers} setAnswers={setAnswers} progressAvailable={progressAvailable} openSimulator={exercise => { setConfig({ ...exercise.config }); go('simulator'); }} />}
        {page === 'reference' && <Reference onSource={() => setSource(true)} />}
        {page === 'simulator' && <button className={`mobile-result-bar ${result.status}`} onClick={() => document.getElementById('result-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><span>{React.createElement(STATUSES[result.status].icon, { size: 21 })}<span>{STATUSES[result.status].title}<small>Bekijk je beoordeling</small></span></span><strong>{result.capacity !== null ? `${kg(result.capacity, 1)} kg` : '—'}<ChevronRight size={17} /></strong></button>}
        <div className="training-notice"><ShieldCheck size={17} /><p><strong>Oefenen voor inzicht.</strong> Alleen voor onderwijs. Voor een echte hijs zijn het label, de gebruiksaanwijzing en het hijsplan leidend. Deze app geeft geen hijstoestemming.</p></div>
        <footer><span>Hijsinzicht <span className="footer-dot">/</span> ABVL & VVLh</span><button onClick={() => setSource(true)}>Gebaseerd op Lesbrief 7 · versie 2.0 <ExternalLink size={12} /></button><span className="footer-right">BEGRIJP DE KRACHT. MAAK DE KEUZE.</span></footer>
      </main>
    </div>
    {share && <ShareModal onClose={() => setShare(false)} />}
    {source && <SourceModal onClose={() => setSource(false)} />}
  </div>;
}

function RigIcon({ legs }) { return <svg viewBox="0 0 26 22" width="25" height="22" fill="none" aria-hidden="true"><circle cx="13" cy="3" r="2" stroke="currentColor" strokeWidth="1.5" /><path d="M13 5 3 20M13 5l10 15" stroke="currentColor" strokeWidth="1.5" />{legs === 4 && <path d="M13 5 8 19M13 5l5 14" stroke="currentColor" strokeWidth="1.5" />}<path d="M1 18v3h4M21 21h4v-3" stroke="currentColor" strokeWidth="1.5" /></svg>; }

function RigDiagram({ config, result, showForces, small = false }) {
  const angle = config.angle * Math.PI / 180;
  const cx = 300, top = 73;
  const spread = Math.sin(angle) * 232;
  const bottom = top + Math.cos(angle) * 232;
  const halfWidth = Math.max(90, spread + 20);
  const danger = ['forbidden', 'overload'].includes(result.status);
  const lineColor = danger ? '#d04b45' : '#526b7b';
  const loadWeight = Number(config.weight);
  const r = 53;
  const arcX = cx - Math.sin(angle) * r, arcY = top + Math.cos(angle) * r;
  const titleId = React.useId();
  return <div className={`rig-diagram ${small ? 'small' : ''}`}><svg viewBox="0 0 600 400" role="img" aria-labelledby={titleId}>
    <title id={titleId}>{config.legs}-sprong, buitenhoek {config.angle} graden, last {Number.isFinite(loadWeight) ? kg(loadWeight) : 'onbekend'} kilogram. {STATUSES[result.status].title}.</title>
    <defs><pattern id={`${titleId}-grid`} width="25" height="25" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".85" fill="#cbd6dc" /></pattern><marker id={`${titleId}-arrow`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill={danger ? '#d04b45' : '#ee7826'} /></marker><linearGradient id={`${titleId}-load`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e5edf1"/><stop offset="100%" stopColor="#d2dfe7"/></linearGradient></defs>
    <rect width="600" height="400" fill={`url(#${titleId}-grid)`} />
    <path d="M300 0v38" stroke="#a2b4be" strokeWidth="9" /><path d="M300 29v12c0 10 13 11 13 20s-6 14-13 14-13-5-13-13" fill="none" stroke="#173549" strokeWidth="6" strokeLinecap="round" /><circle cx={cx} cy={top} r="7" fill="#f8fafb" stroke="#173549" strokeWidth="3" />
    <path d={`M${cx} ${top + 15}V${bottom + 65}`} stroke="#97adba" strokeWidth="1.4" strokeDasharray="5 5" />
    <text x={cx + 10} y={Math.max(top + 47, bottom - 15)} fill="#8296a2" fontSize="12" transform={`rotate(-90 ${cx + 10} ${Math.max(top + 47, bottom - 15)})`}>verticaal</text>
    {config.legs === 4 && <><path d={`M${cx} ${top}L${cx - spread * .62} ${bottom - 24}M${cx} ${top}L${cx + spread * .62} ${bottom - 24}`} fill="none" stroke="#9bacb7" strokeWidth="4" strokeDasharray="6 4" /><path d={`M${cx - halfWidth} ${bottom + 8}l25-22h${halfWidth * 2}l-25 22`} fill="#eff3f6" stroke="#9cafbb" strokeWidth="1.5" /></>}
    <path d={`M${cx - halfWidth} ${bottom + 9}h${halfWidth * 2}v54H${cx - halfWidth}z`} fill={`url(#${titleId}-load)`} stroke="#8197a5" strokeWidth="1.6" />
    <path d={`M${cx - halfWidth + 13} ${bottom + 10}v52M${cx + halfWidth - 13} ${bottom + 10}v52`} stroke="#b7c9d4" strokeWidth="6" />
    {config.method === 'choke' && <><path d={`M${cx - spread} ${bottom}v65q0 8 12 8h${Math.max(spread * 2 - 24, 0)}q12 0 12-8V${bottom}`} fill="none" stroke={lineColor} strokeWidth="5" strokeLinejoin="round" /><circle cx={cx - spread} cy={bottom + 3} r="8" fill="#f8fafb" stroke={lineColor} strokeWidth="3" /><circle cx={cx + spread} cy={bottom + 3} r="8" fill="#f8fafb" stroke={lineColor} strokeWidth="3" /></>}
    <path d={`M${cx} ${top + 6}L${cx - spread} ${bottom}M${cx} ${top + 6}L${cx + spread} ${bottom}`} fill="none" stroke={lineColor} strokeWidth={config.material === 'webbing' ? 9 : 5} strokeLinecap="round" />
    {config.material === 'chain' && <path d={`M${cx} ${top + 6}L${cx - spread} ${bottom}M${cx} ${top + 6}L${cx + spread} ${bottom}`} fill="none" stroke="#d4dfe5" strokeWidth="2" strokeDasharray="4 6" />}
    {config.material === 'webbing' && <path d={`M${cx} ${top + 6}L${cx - spread} ${bottom}M${cx} ${top + 6}L${cx + spread} ${bottom}`} fill="none" stroke="white" strokeOpacity=".3" strokeWidth="1" />}
    <circle cx={cx - spread} cy={bottom + 2} r="5" fill="#e9eff3" stroke={lineColor} strokeWidth="2.5" /><circle cx={cx + spread} cy={bottom + 2} r="5" fill="#e9eff3" stroke={lineColor} strokeWidth="2.5" />
    <path d={`M${cx} ${top}L${cx} ${top + r}A${r} ${r} 0 0 1 ${arcX} ${arcY}Z`} fill="#f5822720" />
    <path d={`M${cx} ${top + r}A${r} ${r} 0 0 1 ${arcX} ${arcY}`} fill="none" stroke="#ee7826" strokeWidth="2" />
    <g transform={`translate(${cx - (config.angle < 15 ? 48 : 64)},${top + 57})`}><rect x="-12" y="-15" width="54" height="28" rx="6" fill="#fff4e9" /><text x="15" y="4" textAnchor="middle" fill="#ba5b16" fontSize="17" fontWeight="700">{config.angle}°</text></g>
    {showForces && result.forceKN != null && !['unsupported', 'invalid'].includes(result.status) && <>{[-1, 1].map(side => {
      const x1 = cx + side * spread * .72, y1 = top + (bottom - top) * .72;
      const x2 = cx + side * spread * .42, y2 = top + (bottom - top) * .42;
      return <g key={side}><path d={`M${x1 + side * 15} ${y1}L${x2 + side * 15} ${y2}`} fill="none" stroke={danger ? '#d04b45' : '#ee7826'} strokeWidth="2.5" markerEnd={`url(#${titleId}-arrow)`} /><g transform={`translate(${cx + side * Math.max(92, spread * .65 + 45)},${top + (bottom - top) * .57})`}><rect x="-43" y="-15" width="86" height="29" rx="5" fill="#fff" stroke="#e1e7eb" /><text textAnchor="middle" y="4" fill={danger ? '#bd3e38' : '#173549'} fontSize="14" fontWeight="600">{decimal(result.forceKN, 1)} kN</text></g></g>;
    })}</>}
    <rect x="246" y={bottom + 20} width="108" height="32" rx="5" fill="white" opacity=".93" /><text x="300" y={bottom + 42} textAnchor="middle" fontWeight="700" fontSize="20" fill="#173549">{Number.isFinite(loadWeight) && loadWeight > 0 ? kg(loadWeight) : '—'}<tspan fontWeight="400" fontSize="12"> kg</tspan></text>
    {!config.symmetric && <g transform={`translate(${cx + 55},${bottom + 10})`}><circle r="12" fill="#b97818" /><path d="M-7 0h14M0-7v14" stroke="white" strokeWidth="2" /></g>}
    <text x="300" y="388" fill="#8296a2" textAnchor="middle" fontSize="11">{config.legs === 4 ? 'Schematisch · rekenmodel met 3 dragende lengen' : 'Schematische weergave · buitenhoek β t.o.v. verticaal'}</text>
  </svg></div>;
}

function ResultPanel({ result, config, onSource }) {
  const status = STATUSES[result.status];
  const Icon = status.icon;
  const supported = result.capacity !== null;
  const remaining = supported ? result.capacity - Number(config.weight) : null;
  return <section className="panel result-panel" aria-labelledby="result-title"><div className="panel-heading"><span className="step">03</span><h2 id="result-title">Beoordeel je hijs</h2></div><div aria-live="polite" aria-atomic="true"><div className={`status-card ${result.status}`}><Icon size={25} /><h3>{status.title}</h3><p>{status.label}</p></div><div className="result-content"><p className="metric-label">WLL VAN HET SAMENSTEL</p><div className="capacity-value">{supported ? kg(result.capacity, 1) : '—'} <span>kg</span></div><p className="metric-description">Maximale last volgens de oefentabel</p><div className="result-divider" /><div className="result-row"><span>Lastgewicht</span><strong>{Number(config.weight) > 0 && Number.isFinite(Number(config.weight)) ? kg(Number(config.weight)) : '—'} <small>kg</small></strong></div><div className="result-row"><span>Werklastfactor</span><strong>{supported ? `× ${decimal(result.factor)}` : '—'}</strong></div>
    {supported ? <><div className="utilization-label"><span>Benutting van de WLL</span><strong className={result.status === 'overload' ? 'danger-text' : ''}>{kg(result.utilization)}%</strong></div><div className={`utilization-bar ${result.status}`}><span style={{ width: `${Math.min(100, result.utilization)}%` }} /></div><p className={`margin-label ${result.status === 'overload' ? 'danger-text' : ''}`}>{remaining >= 0 ? <Check size={14} /> : <X size={14} />}{kg(Math.abs(remaining), 1)} kg {remaining >= 0 ? 'onder de WLL' : 'boven de WLL'}</p><div className="calculation"><span>ZO REKEN JE HET UIT</span><p>{kg(Number(config.single))} × {decimal(result.baseFactor)}{result.chokeFactor !== 1 ? ' × 0,8' : ''}<br /><strong>= {kg(result.capacity, 1)} kg</strong></p></div></> : <div className="result-explanation"><Info size={17} /><p>{result.reason}</p></div>}
    <div className="force-result"><div><Zap size={16} /><span>Rekenkracht per leng</span></div><strong>{result.forceKN != null && !['unsupported', 'invalid'].includes(result.status) ? `${decimal(result.forceKN)} kN` : '—'}</strong><p>{config.legs === 4 ? 'Conservatief model met 3 dragende lengen. De echte krachtverdeling kan afwijken.' : 'Statische trekkracht bij gelijke verdeling over 2 lengen.'} Geen extra WLL.</p></div>
    </div></div><button className="result-help" onClick={onSource}><CircleHelp size={15} />Hoe moet ik dit lezen?<ArrowUpRight size={14} /></button></section>;
}

function FactorTable({ angle, legs }) {
  return <div className="table-scroll"><table className="factor-table"><caption className="sr-only">Werklastfactoren voor direct aangeslagen symmetrische lasten. Conservatieve grenswaarden uit de voorbeelden van Lesbrief 7.</caption><thead><tr><th>Buitenhoek β</th><th>2-sprong</th><th>4-sprong</th><th>Beoordeling</th></tr></thead><tbody><tr className={angle != null && angle < 45 ? 'current' : ''}><th><span className="range-dot green" />0° tot &lt; 45°</th><td className={legs === 2 && angle < 45 ? 'factor-active' : ''}>1,4</td><td className={legs === 4 && angle < 45 ? 'factor-active' : ''}>2,1</td><td>Lagere kracht</td></tr><tr className={angle >= 45 && angle < 60 ? 'current caution' : ''}><th><span className="range-dot amber" />45° tot &lt; 60°</th><td className={legs === 2 && angle >= 45 && angle < 60 ? 'factor-active' : ''}>1,0</td><td className={legs === 4 && angle >= 45 && angle < 60 ? 'factor-active' : ''}>1,5</td><td>Lagere WLL</td></tr><tr className={`forbidden-row ${angle >= 60 ? 'current' : ''}`}><th><span className="range-dot red" />Vanaf 60°</th><td>—</td><td>—</td><td>Stop in deze oefening</td></tr></tbody></table></div>;
}

function Exercises({ active, setActive, answers, setAnswers, openSimulator, progressAvailable }) {
  const exercise = EXERCISES[active];
  const answer = answers[exercise.id];
  const complete = EXERCISES.filter(e => answers[e.id]).length;
  const correct = EXERCISES.filter(e => answers[e.id] === e.answer).length;
  const currentResult = calculateRigging(exercise.config);
  return <div className="exercises-layout"><aside className="panel exercise-list"><div className="exercise-progress"><span className="eyebrow">JOUW VOORTGANG</span><h2>{complete}<span> / {EXERCISES.length} beoordeeld</span></h2><div className="progress-track"><span style={{ width: `${complete / EXERCISES.length * 100}%` }} /></div><p>{progressAvailable ? 'Bewaard op dit apparaat. Geen account nodig.' : 'Opslaan is niet beschikbaar. Je kunt gewoon oefenen.'}</p></div><div className="exercise-nav">{EXERCISES.map((e, i) => <button key={e.id} className={active === i ? 'active' : ''} onClick={() => setActive(i)}><span className={`exercise-number ${answers[e.id] ? answers[e.id] === e.answer ? 'correct' : 'incorrect' : ''}`}>{answers[e.id] ? answers[e.id] === e.answer ? <Check size={16} /> : <RotateCcw size={14} /> : String(i + 1).padStart(2, '0')}</span><span>{e.title}<small>{e.category}</small></span><ChevronRight size={16} /></button>)}</div><button className="reset-progress text-button" onClick={() => { setAnswers({}); setActive(0); }}><RotateCcw size={14} />Begin opnieuw</button></aside><section className="panel exercise-detail"><div className="exercise-detail-heading"><span className="tag">PRAKTIJKOPDRACHT {String(active + 1).padStart(2, '0')}</span><span>{exercise.category}</span></div><h2>{exercise.title}</h2><p className="exercise-description">{exercise.description}</p><div className="exercise-scene"><RigDiagram config={exercise.config} result={currentResult} showForces={false} small /><div className="exercise-specs"><div><span>Lastgewicht</span><strong>{kg(exercise.config.weight)} kg</strong></div><div><span>WLL enkele leng</span><strong>{kg(exercise.config.single)} kg</strong></div><div><span>Buitenhoek</span><strong>{exercise.config.angle}°</strong></div><div><span>Aanslagwijze</span><strong>{exercise.config.legs}-sprong · {exercise.config.method === 'direct' ? 'direct' : 'gestropt'}</strong></div></div></div><h3 className="exercise-question">{exercise.question}</h3><div className="answer-options">{[{ id: 'within', label: 'Binnen de WLL', icon: CheckCircle2 }, { id: 'overload', label: 'WLL overschreden', icon: Weight }, { id: 'stop', label: 'Stop / eerst opzoeken', icon: BookOpen }].map(option => <button key={option.id} disabled={Boolean(answer)} className={`${answer === option.id ? 'chosen' : ''} ${answer && exercise.answer === option.id ? 'right-answer' : ''} ${answer === option.id && answer !== exercise.answer ? 'wrong-answer' : ''}`} onClick={() => setAnswers(a => ({ ...a, [exercise.id]: option.id }))}><option.icon size={21} /><span>{option.label}</span>{answer && exercise.answer === option.id ? <CheckCircle2 size={17} /> : <span className="answer-radio" />}</button>)}</div>{answer && <div className={`exercise-feedback ${answer === exercise.answer ? 'correct' : 'incorrect'}`} role="status"><div>{answer === exercise.answer ? <CheckCircle2 size={22} /> : <Info size={22} />}<h3>{answer === exercise.answer ? 'Goed beoordeeld.' : 'Bekijk deze keuze nog eens.'}</h3></div><p>{exercise.explanation}</p><button onClick={() => openSimulator(exercise)}>Onderzoek dit in de simulator <ArrowUpRight size={15} /></button></div>}<div className="exercise-bottom"><button className="text-button" disabled={active === 0} onClick={() => setActive(active - 1)}><ArrowLeft size={16} />Vorige</button>{answer && <button className="text-button retry-answer" onClick={() => setAnswers(a => { const next = { ...a }; delete next[exercise.id]; return next; })}><RotateCcw size={14} />Opnieuw proberen</button>}<button className="primary-button" disabled={active === EXERCISES.length - 1} onClick={() => setActive(active + 1)}>Volgende<ArrowRight size={16} /></button></div>{complete === EXERCISES.length && <div className="completion-card"><GraduationCap size={28} /><div><h3>Alle {EXERCISES.length} situaties beoordeeld!</h3><p>{correct} van {EXERCISES.length} keuzes goed. Bespreek wat je hebt geleerd en probeer situaties gerust opnieuw.</p></div></div>}</section></div>;
}

function Reference({ onSource }) {
  return <div className="reference-page"><div className="reference-cards"><article className="panel explainer-card"><span className="explainer-number">01</span><h2>Wat is de buitenhoek?</h2><p>De buitenhoek <strong>β (bèta)</strong> is de hoek tussen een leng en de <strong>verticale lijn</strong>. Niet de hoek tussen de twee lengen.</p><div className="angle-examples">{[15, 45, 65].map(a => <div key={a}><svg viewBox="0 0 100 85" aria-hidden="true"><path d="M50 10v65" stroke="#a3b3be" strokeDasharray="3 3" /><path d={`M${50 - 60 * Math.sin(a * Math.PI / 180)} ${10 + 60 * Math.cos(a * Math.PI / 180)}L50 10l${60 * Math.sin(a * Math.PI / 180)} ${60 * Math.cos(a * Math.PI / 180)}`} stroke={a >= 60 ? '#c64b45' : '#31556c'} strokeWidth="4" fill="none" /><circle cx="50" cy="10" r="4" fill="#f58227" /></svg><strong>{a}°</strong><small>{a < 45 ? 'minder kracht' : a < 60 ? 'meer kracht' : 'stop'}</small></div>)}</div><p className="reference-key">Hoe platter de lengen hangen, hoe groter de trekkracht.</p></article><article className="panel explainer-card"><span className="explainer-number">02</span><h2>Wat betekent WLL?</h2><p><strong>Working Load Limit</strong> is de maximaal toegestane werklast. In deze app voer je de WLL van <strong>één enkele leng</strong> in.</p><div className="formula-box"><span>WLL samenstel</span><strong>WLL enkele leng × factor</strong><small>Bij een gestropte tweesprong komt daar × 0,8 bij.</small></div><p>De voorbeeldwaarden bij materiaalkeuze komen uit de lesbrief. Het materiaal alleen bepaalt de WLL niet: lees altijd het label.</p></article><article className="panel explainer-card"><span className="explainer-number">03</span><h2>Vier lengen ≠ vier keer WLL</h2><p>Bij een viersprong zijn niet vanzelf alle vier de lengen even zwaar belast. De tabel rekent conservatief met <strong>drie dragende lengen</strong>.</p><div className="four-legs-explainer"><RigIcon legs={4} /><span>4 lengen<strong>3 dragend in het rekenmodel</strong></span></div><p>De factor is daarom 2,1 of 1,5, afhankelijk van de hoek. Bij een gestropte viersprong zoek je de juiste toepassing op in de gebruiksaanwijzing.</p></article></div><div className="reference-bottom"><section className="panel reference-table"><div className="panel-heading"><BookOpen size={20} /><h2>Werklastfactoren in deze oefening</h2></div><FactorTable /><div className="reference-table-notes"><p><strong>Gestropte tweesprong:</strong> 1,4 × 0,8 = 1,12 of 1,0 × 0,8 = 0,8.</p><p><strong>Gestropte viersprong of asymmetrisch:</strong> geen algemene berekening in de app. Raadpleeg de gebruiksaanwijzing.</p><p><strong>Grenswaarden:</strong> we gebruiken vanaf 45° de lagere factor en stoppen vanaf 60°. De lesbrief is op deze grenzen niet eenduidig; deze app volgt de voorzichtige uitleg uit voorbeelden 4 en 5.</p></div><button className="text-button" onClick={onSource}>Bekijk bron en rekenafspraken<ArrowUpRight size={16} /></button></section><section className="panel checklist-card"><h2>Vóór elke echte hijs</h2><p>Een passende WLL is één van de controles.</p>{['Ken het gewicht en het zwaartepunt.', 'Controleer label, keuring en gebruiksaanwijzing.', 'Controleer hijspunten en scherpe randen.', 'Gebruik de juiste hoek en aanslagmethode.', 'Volg het hijsplan en maak duidelijke afspraken.'].map((text, index) => <div key={text}><span>{index + 1}</span><p>{text}</p></div>)}<div className="checklist-note"><TriangleAlert size={19} /><p>Een spanband is geen hijsband. Gebruik een spanband nooit om te hijsen.</p></div></section></div><article className="panel force-explanation"><Zap size={25} /><div><h2>Hoe wordt de kracht in een leng berekend?</h2><p>T = (massa × 9,81) ÷ (n × cos β). De uitkomst in newton delen we door 1.000 voor kilonewton (kN). Voor een tweesprong is n = 2. Voor de viersprong gebruiken we conservatief n = 3. Dit is een statisch onderwijsmodel met gelijke verdeling over de dragende lengen; schokken en andere praktijkeffecten zitten er niet in.</p><p>Bijvoorbeeld: 1.800 kg, twee lengen, 30° → 10,19 kN per leng. De trekkracht is iets anders dan de toegestane WLL van het samenstel. Bereken de WLL met de tabel, niet met een zelfbedachte hoekfactor.</p></div></article></div>;
}

function Modal({ onClose, title, children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    const keydown = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const focusable = [...ref.current.querySelectorAll('button, a[href], input, [tabindex="0"]')].filter(el => !el.disabled);
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [onClose]);
  return <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}><section className={`modal ${className}`} role="dialog" aria-modal="true" aria-label={title} tabIndex="-1" ref={ref}><button className="modal-close icon-button" aria-label="Sluiten" onClick={onClose}><X size={22} /></button>{children}</section></div>;
}

function SourceModal({ onClose }) {
  return <Modal onClose={onClose} title="Bron en rekenafspraken" className="source-modal"><span className="modal-icon"><BookOpen size={25} /></span><div className="eyebrow">ZO LEES JE DE UITKOMST</div><h2>Inzicht met een duidelijke basis.</h2><p>Gebaseerd op <strong>Lesbrief 7: Verminderingsfactoren 2- en 4-sprongen</strong>, versie 2.0, vastgesteld op 15 februari 2023 door de WBC VVL. © SSVV / VCA Examenbank.</p><h3>De WLL en de trekkracht zijn verschillend</h3><p>De WLL van het samenstel volgt uit de tabel: WLL enkele leng × werklastfactor. De krachtpijlen tonen de statische trekkracht in kN. Dat is een apart rekenmodel, geen toestemming om meer te hijsen.</p><h3>De grens bij 45° en 60°</h3><p>De tabel op pagina 7 en de voorbeelden op pagina 8 zijn op deze grenzen niet eenduidig. Deze app kiest conservatief: bij precies 45° geldt de lagere factor (voorbeeld 4). Vanaf 60° stopt de berekening (tekst bij voorbeeld 5). In de praktijk zijn het label en de gebruiksaanwijzing van het specifieke hijsgereedschap leidend.</p><h3>Waar de tabel niet voor geldt</h3><p>Alleen symmetrische belasting. Voor een gestropte viersprong of asymmetrische last geeft deze app geen WLL: raadpleeg de gebruiksaanwijzing. De kracht bij een viersprong wordt alleen ter illustratie berekend met drie gelijk dragende lengen; de werkelijke verdeling kan afwijken.</p><a className="source-download" href="./lesbrief-7.pdf" target="_blank" rel="noreferrer"><Download size={17} />Open de oorspronkelijke lesbrief (PDF)<ExternalLink size={14} /></a><button className="primary-button" onClick={onClose}>Duidelijk<Check size={16} /></button></Modal>;
}

function ShareModal({ onClose }) {
  const isLocal = ['localhost', '127.0.0.1', '0.0.0.0', ''].includes(window.location.hostname) || !window.location.hostname.includes('.');
  const [url, setUrl] = useState(isLocal ? PUBLIC_URL : `${window.location.origin}${window.location.pathname}`);
  const [qr, setQr] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let current = true;
    setQr(''); setError('');
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:' || !parsed.hostname.includes('.') || ['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname) || parsed.username || parsed.password) throw new Error();
      import('qrcode').then(module => module.default.toDataURL(url, { width: 700, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#122b3b', light: '#ffffff' } })).then(data => { if (current) setQr(data); }).catch(() => { if (current) setError('De QR-code kon niet worden gemaakt. Controleer het adres.'); });
    } catch { setError('Vul een geldig openbaar HTTPS-adres in.'); }
    return () => { current = false; };
  }, [url]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2500); }
    catch { setError('Kopiëren is niet beschikbaar. Selecteer en kopieer het adres in het invoerveld.'); }
  };
  const download = (data, filename) => { const link = document.createElement('a'); link.href = data; link.download = filename; link.click(); };
  const downloadSlide = async () => {
    setBusy(true);
    try {
      const canvas = document.createElement('canvas'); canvas.width = 1920; canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#122b3b'; ctx.fillRect(0, 0, 1920, 1080);
      ctx.fillStyle = '#f58227'; ctx.fillRect(100, 120, 70, 8);
      ctx.fillStyle = '#f58227'; ctx.font = 'bold 26px sans-serif'; ctx.fillText('ABVL / VVLh · OEFEN MEE', 100, 198);
      ctx.fillStyle = 'white'; ctx.font = 'bold 92px sans-serif'; ctx.fillText('Elke hoek', 100, 350); ctx.fillText('maakt verschil.', 100, 460);
      ctx.fillStyle = '#becdd7'; ctx.font = '34px sans-serif'; ctx.fillText('Scan de QR-code en open Hijsinzicht.', 100, 565); ctx.fillText('Kies je hijs. Verander de hoek.', 100, 625); ctx.fillText('Begrijp de kracht.', 100, 685);
      const img = new Image(); img.src = qr; await img.decode();
      ctx.fillStyle = 'white'; ctx.fillRect(1210, 200, 590, 590); ctx.drawImage(img, 1210, 200, 590, 590);
      ctx.fillStyle = '#f58227'; ctx.font = 'bold 28px sans-serif'; ctx.fillText('SCAN & OEFEN', 1398, 850);
      ctx.fillStyle = '#d4dfe6'; ctx.font = '28px sans-serif'; ctx.fillText(url, 100, 930, 1690);
      ctx.fillStyle = '#94a8b5'; ctx.font = '20px sans-serif'; ctx.fillText('Oefenapp voor onderwijs · Label, gebruiksaanwijzing en hijsplan zijn leidend.', 100, 1000);
      download(canvas.toDataURL('image/png'), 'hijsinzicht-presentatie-1920x1080.png');
    } catch { setError('Downloaden is niet gelukt. Probeer de losse QR-code.'); }
    finally { setBusy(false); }
  };
  return <Modal onClose={onClose} title="Deel Hijsinzicht met de groep" className="share-modal"><span className="modal-icon"><QrCode size={26} /></span><div className="eyebrow">SAMEN LEREN, ZELF OEFENEN</div><h2>Van het scherm naar je telefoon.</h2><p>Laat de groep scannen of voeg de QR-code toe aan je presentatie.</p><div className="qr-frame">{qr ? <img src={qr} width="220" height="220" alt={`QR-code voor ${url}`} /> : <span>{error ? <TriangleAlert size={40} /> : 'QR-code maken…'}</span>}</div><label className="field-label" htmlFor="share-url">Openbaar adres van de app</label><div className="share-url"><LinkIcon size={17} /><input id="share-url" type="url" value={url} onChange={e => setUrl(e.target.value)} /><button onClick={copy} disabled={!qr} aria-label="Kopieer de link">{copied ? <Check size={18} /> : <Copy size={18} />}</button></div>{isLocal && <p className="share-publish-note"><Info size={15} />Dit is het publicatieadres. De QR-code werkt voor cursisten nadat de app op dit adres is gepubliceerd.</p>}{error && <p role="alert" className="form-error">{error}</p>}<div className="share-downloads"><button className="primary-button" disabled={!qr || busy} onClick={downloadSlide}><Monitor size={17} />{busy ? 'Even geduld…' : 'Download presentatiedia'}<Download size={16} /></button><button className="secondary-button" disabled={!qr} onClick={() => download(qr, 'hijsinzicht-qr.png')}><QrCode size={17} />Alleen QR-code (PNG)<Download size={16} /></button></div><div className="share-devices"><span><Monitor size={17} />Klassikaal op groot scherm</span><span><Smartphone size={16} />Zelf oefenen op je telefoon</span></div></Modal>;
}

createRoot(document.getElementById('root')).render(<App />);
