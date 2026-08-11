'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const DEFAULT_EVENT_LINE = 'This Saturday, 8PM, HSR Layout';
const DEFAULT_TPL_MAN =
  "Hey {{name}}! 👋 This is GreenFlag — you're on our Bangalore waitlist. Our next date night is {{event}}. 20 seats, curated, ₹599 entry. Reply YES and we'll lock in your seat before it fills up!";
const DEFAULT_TPL_WOMAN =
  "Hey {{name}}! 👋 This is GreenFlag — you're on our Bangalore waitlist. Our next date night is {{event}}. Entry's free for you, just 20 seats total. Reply YES and we'll reserve your spot!";

const CONTACTED_KEY = 'greenflag_outreach_contacted_v1';
const CONFIG_KEY = 'greenflag_outreach_config_v1';
const STALE_DAYS = 2;

function loadJSON(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    return JSON.parse(window.localStorage.getItem(key) || 'null') || fallback;
  } catch {
    return fallback;
  }
}
function saveJSON(key, val) {
  window.localStorage.setItem(key, JSON.stringify(val));
}

function normalizePhone(raw) {
  if (!raw) return null;
  let digits = String(raw).replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits.slice(1);
  if (digits.length === 10) return '91' + digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
}

function firstName(fullName) {
  return (fullName || '').trim().split(/\s+/)[0] || 'there';
}

function cleanInstagram(handle) {
  const h = (handle || '').trim();
  if (!h || h === '@') return null;
  return h;
}

function parseTimestamp(ts) {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/.exec(ts || '');
  if (!m) return null;
  const [, mo, d, y, h, mi, s] = m.map(Number);
  return new Date(y, mo - 1, d, h, mi, s);
}

function relativeTime(date) {
  if (!date) return '';
  const diffH = (Date.now() - date.getTime()) / 36e5;
  if (diffH < 1) return 'just now';
  if (diffH < 24) return Math.floor(diffH) + 'h ago';
  return Math.floor(diffH / 24) + 'd ago';
}

export default function Dashboard() {
  const router = useRouter();
  const [registrants, setRegistrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contacted, setContacted] = useState({});
  const [config, setConfig] = useState({
    event: DEFAULT_EVENT_LINE,
    tplMan: DEFAULT_TPL_MAN,
    tplWoman: DEFAULT_TPL_WOMAN,
  });

  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [hideContacted, setHideContacted] = useState(false);
  const [oldestFirst, setOldestFirst] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    setContacted(loadJSON(CONTACTED_KEY, {}));
    setConfig(loadJSON(CONFIG_KEY, {
      event: DEFAULT_EVENT_LINE,
      tplMan: DEFAULT_TPL_MAN,
      tplWoman: DEFAULT_TPL_WOMAN,
    }));
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/registrants', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setRegistrants(data.registrants || []);
    } catch (e) {
      setError(e.message || 'Failed to load registrants');
    } finally {
      setLoading(false);
    }
  }

  function updateConfig(patch) {
    const next = { ...config, ...patch };
    setConfig(next);
    saveJSON(CONFIG_KEY, next);
  }

  function toggleContacted(key) {
    const next = { ...contacted };
    if (next[key]) delete next[key];
    else next[key] = true;
    setContacted(next);
    saveJSON(CONTACTED_KEY, next);
  }

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  function buildMessage(reg) {
    const isWoman = reg.gender.toLowerCase() === 'woman';
    const tpl = isWoman ? config.tplWoman : config.tplMan;
    return tpl.replace(/\{\{name\}\}/g, firstName(reg.name)).replace(/\{\{event\}\}/g, config.event || DEFAULT_EVENT_LINE);
  }

  function waLink(reg) {
    const phone = normalizePhone(reg.phone);
    if (!phone) return null;
    return `https://wa.me/${phone}?text=${encodeURIComponent(buildMessage(reg))}`;
  }

  async function handleCopy(reg, key) {
    try {
      await navigator.clipboard.writeText(buildMessage(reg));
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    } catch {
      // clipboard may be unavailable; the WhatsApp link still works
    }
  }

  const stats = useMemo(() => {
    const men = registrants.filter((r) => r.gender.toLowerCase() === 'man').length;
    const women = registrants.filter((r) => r.gender.toLowerCase() === 'woman').length;
    const contactedCount = registrants.filter((r) => contacted[r.phone || r.email]).length;
    const stale = registrants.filter((r) => {
      if (contacted[r.phone || r.email]) return false;
      const d = parseTimestamp(r.timestamp);
      return d && (Date.now() - d.getTime()) / 36e5 / 24 >= STALE_DAYS;
    }).length;
    return { total: registrants.length, men, women, contacted: contactedCount, stale };
  }, [registrants, contacted]);

  const visible = useMemo(() => {
    let list = registrants.slice();
    list.sort((a, b) => {
      const da = parseTimestamp(a.timestamp);
      const db = parseTimestamp(b.timestamp);
      if (!da || !db) return 0;
      return oldestFirst ? da - db : db - da;
    });
    const q = search.trim().toLowerCase();
    return list.filter((r) => {
      const key = r.phone || r.email;
      if (hideContacted && contacted[key]) return false;
      if (genderFilter && r.gender.toLowerCase() !== genderFilter) return false;
      if (q) {
        const hay = `${r.name} ${r.location} ${r.instagram}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [registrants, contacted, search, genderFilter, hideContacted, oldestFirst]);

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontSize: 20, margin: '0 0 4px 0' }}>
            GreenFlag Waitlist Outreach{' '}
            <span style={pill}>{visible.length} shown of {stats.total}</span>
          </h1>
          <div style={{ fontSize: 13, color: '#666' }}>
            Live from the waitlist sheet. Click "WhatsApp" to open a pre-filled message — nothing sends automatically.
          </div>
        </div>
        <button onClick={handleLogout} style={logoutBtn}>Log out</button>
      </div>

      <div style={statsGrid}>
        <StatCard num={stats.total} label="Total signups" accent />
        <StatCard num={stats.men} label="Men" />
        <StatCard num={stats.women} label="Women" />
        <StatCard num={stats.contacted} label="Contacted" />
        <StatCard num={stats.stale} label="Waiting 2+ days" warn={stats.stale > 0} />
      </div>

      <div style={box}>
        <label style={labelStyle}>This week's event line (feeds into &#123;&#123;event&#125;&#125; below)</label>
        <input
          type="text"
          value={config.event}
          onChange={(e) => updateConfig({ event: e.target.value })}
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <div style={box}>
          <label style={labelStyle}>Message template — Men (₹599 entry)</label>
          <textarea
            value={config.tplMan}
            onChange={(e) => updateConfig({ tplMan: e.target.value })}
            style={textareaStyle}
          />
          <div style={hintStyle}>Use &#123;&#123;name&#125;&#125; and &#123;&#123;event&#125;&#125;.</div>
        </div>
        <div style={box}>
          <label style={labelStyle}>Message template — Women (free entry)</label>
          <textarea
            value={config.tplWoman}
            onChange={(e) => updateConfig({ tplWoman: e.target.value })}
            style={textareaStyle}
          />
          <div style={hintStyle}>Use &#123;&#123;name&#125;&#125; and &#123;&#123;event&#125;&#125;.</div>
        </div>
      </div>

      <div style={toolbar}>
        <input
          type="text"
          placeholder="Search name, location, Instagram…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchStyle}
        />
        <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} style={selectStyle}>
          <option value="">All genders</option>
          <option value="man">Men only</option>
          <option value="woman">Women only</option>
        </select>
        <label style={toolbarLabel}>
          <input type="checkbox" checked={hideContacted} onChange={(e) => setHideContacted(e.target.checked)} /> Hide contacted
        </label>
        <label style={toolbarLabel}>
          <input type="checkbox" checked={oldestFirst} onChange={(e) => setOldestFirst(e.target.checked)} /> Oldest signups first
        </label>
        <button onClick={loadData} style={refreshBtn}>Refresh</button>
      </div>

      {loading ? (
        <div style={empty}>Loading registrants…</div>
      ) : error ? (
        <div style={{ ...empty, color: '#B23B3B' }}>{error}</div>
      ) : visible.length === 0 ? (
        <div style={empty}>No registrants match right now.</div>
      ) : (
        <table style={table}>
          <thead>
            <tr>
              <th style={th}></th>
              <th style={th}>Person</th>
              <th style={th}>Details</th>
              <th style={th}>Instagram</th>
              <th style={th}>Signed up</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((reg) => {
              const key = reg.phone || reg.email;
              const isContacted = !!contacted[key];
              const link = waLink(reg);
              const genderLower = reg.gender.toLowerCase();
              const isWoman = genderLower === 'woman';
              const initial = (reg.name || '?').trim()[0]?.toUpperCase() || '?';
              const ig = cleanInstagram(reg.instagram);
              const regDate = parseTimestamp(reg.timestamp);
              const isStale = regDate && !isContacted && (Date.now() - regDate.getTime()) / 36e5 / 24 >= STALE_DAYS;

              return (
                <tr key={key} style={{ background: isContacted ? '#FAFCF8' : 'transparent', opacity: isContacted ? 0.55 : 1 }}>
                  <td style={td}>
                    <input type="checkbox" checked={isContacted} onChange={() => toggleContacted(key)} />
                  </td>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ ...avatar, background: isWoman ? '#D96BA0' : '#5B8DD9' }}>{initial}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{reg.name || '—'}</div>
                        <div style={{ fontSize: 11, color: '#999' }}>
                          {reg.age ? reg.age + ' yrs' : ''}{reg.age && reg.location ? ' · ' : ''}{reg.location || ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={td}>
                    <span style={{ ...badge, ...(isWoman ? badgeWoman : badgeMan) }}>{reg.gender || '—'}</span>
                  </td>
                  <td style={td}>
                    {ig ? (
                      <a href={`https://instagram.com/${ig.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer">
                        {ig}
                      </a>
                    ) : (
                      <span style={hintStyle}>—</span>
                    )}
                  </td>
                  <td style={{ ...td, fontSize: 12, color: isStale ? '#B4762B' : '#888', fontWeight: isStale ? 600 : 400 }}>
                    {reg.timestamp || '—'}
                    {regDate && <div style={{ fontSize: 10.5, color: '#999', fontWeight: 400 }}>{relativeTime(regDate)}</div>}
                  </td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {link ? (
                        <a href={link} target="_blank" rel="noopener noreferrer" style={sendBtn}>WhatsApp →</a>
                      ) : (
                        <span style={hintStyle}>no phone</span>
                      )}
                      <button onClick={() => handleCopy(reg, key)} style={copiedKey === key ? copyBtnCopied : copyBtn}>
                        {copiedKey === key ? 'Copied ✓' : 'Copy text'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StatCard({ num, label, accent, warn }) {
  return (
    <div style={statCard}>
      <div style={{ fontSize: 20, fontWeight: 700, color: warn ? '#B4762B' : accent ? '#C9A961' : '#1A1A1A' }}>{num}</div>
      <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</div>
    </div>
  );
}

const pill = { display: 'inline-block', background: '#F0EDE9', color: '#666', fontSize: 11, padding: '3px 10px', borderRadius: 20 };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, margin: '18px 0' };
const statCard = { background: '#fff', border: '1px solid #E8E6E1', borderRadius: 10, padding: '10px 14px' };
const box = { background: '#fff', border: '1px solid #E8E6E1', borderRadius: 10, padding: 12, marginBottom: 14 };
const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#C9A961', marginBottom: 6 };
const inputStyle = { width: '100%', border: '1px solid #E8E6E1', borderRadius: 8, padding: 8, fontSize: 13, background: '#FAF9F7', boxSizing: 'border-box' };
const textareaStyle = { width: '100%', minHeight: 80, border: '1px solid #E8E6E1', borderRadius: 8, padding: 8, fontSize: 12.5, resize: 'vertical', background: '#FAF9F7', boxSizing: 'border-box', fontFamily: 'inherit' };
const hintStyle = { fontSize: 10.5, color: '#999', marginTop: 4 };
const toolbar = { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' };
const searchStyle = { flex: 1, minWidth: 160, padding: '8px 12px', border: '1px solid #E8E6E1', borderRadius: 20, fontSize: 13, background: '#fff' };
const selectStyle = { padding: '7px 10px', borderRadius: 20, border: '1px solid #E8E6E1', fontSize: 12, background: '#fff' };
const toolbarLabel = { fontSize: 12, color: '#555', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' };
const refreshBtn = { padding: '7px 14px', borderRadius: 20, border: '1px solid #E8E6E1', background: '#fff', fontSize: 12, cursor: 'pointer' };
const logoutBtn = { padding: '8px 14px', borderRadius: 20, border: 'none', background: '#F0EDE9', color: '#B23B3B', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
const table = { width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #E8E6E1', borderRadius: 10 };
const th = { textAlign: 'left', padding: '10px 12px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.03em', color: '#666', background: '#F0EDE9' };
const td = { textAlign: 'left', padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #F0EDE9', verticalAlign: 'middle' };
const avatar = { width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 };
const badge = { display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 };
const badgeMan = { background: '#EAF1FB', color: '#2A5C9E' };
const badgeWoman = { background: '#FCEAF1', color: '#A03B6B' };
const sendBtn = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 20, textDecoration: 'none', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', background: '#25D366', color: 'white' };
const copyBtn = { padding: '7px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: '#F0EDE9', color: '#555' };
const copyBtnCopied = { ...copyBtn, background: '#C9A961', color: 'white' };
const empty = { padding: 30, textAlign: 'center', color: '#999', fontSize: 13, background: '#fff', border: '1px solid #E8E6E1', borderRadius: 10 };
