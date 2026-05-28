'use client';

import { useState, useTransition, useContext } from 'react';
import Link from 'next/link';
import { Trash2, UserPlus } from 'lucide-react';
import { addDentistToTeam, removeDentistFromPractice, updateDentistRecord } from './actions';
import { AccessTokenContext } from './token-context';

const D = {
  bg: '#0d0d12', card: '#13131a', card2: '#17171f',
  border: 'rgba(255,255,255,0.07)', border2: 'rgba(255,255,255,0.12)',
  text: '#edeef5', mid: 'rgba(237,238,245,0.72)', soft: 'rgba(237,238,245,0.5)',
  faint: 'rgba(237,238,245,0.28)', xfaint: 'rgba(237,238,245,0.13)',
  accent: '#34d399', accentPale: 'rgba(52,211,153,0.08)',
  gold: '#fbbf24',
} as const;

export type TeamDentist = {
  dentistId: string;
  fullName: string;
  gdcNumber: string | null;
  specialisms: string[];
  slug: string;
};

type Props = {
  practiceId: string;
  practiceSlug: string;
  initialDentists: TeamDentist[];
};

const COMMON_SPECIALISMS = [
  'General Dentistry', 'Orthodontics', 'Oral Surgery', 'Endodontics',
  'Periodontics', 'Implants', 'Cosmetic Dentistry', 'Paediatric Dentistry', 'Sedation',
];

const LABEL: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: D.soft, marginBottom: 6, fontFamily: 'var(--font-body)',
};

const INPUT: React.CSSProperties = {
  width: '100%', padding: '11px 13px', borderRadius: 8,
  border: `1.5px solid ${D.border2}`, fontSize: 14,
  fontFamily: 'var(--font-body)', color: D.text,
  background: D.card2, outline: 'none', boxSizing: 'border-box',
};

function DentistCard({
  d,
  onRemove,
  onSave,
}: {
  d: TeamDentist;
  onRemove: () => void;
  onSave: (gdcNumber: string, specialisms: string[]) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [gdc, setGdc] = useState(d.gdcNumber ?? '');
  const [specs, setSpecs] = useState<string[]>(d.specialisms);
  const [custom, setCustom] = useState('');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const toggleSpec = (s: string) =>
    setSpecs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const addCustom = () => {
    const t = custom.trim();
    if (t && !specs.includes(t)) setSpecs(prev => [...prev, t]);
    setCustom('');
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(gdc, specs);
    setSaving(false);
    setEditing(false);
  };

  const handleRemove = async () => {
    setRemoving(true);
    await onRemove();
  };

  return (
    <div style={{
      background: D.card, border: `1.5px solid ${D.border}`, borderRadius: 12,
      padding: '18px 20px', transition: 'border-color 0.15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, flexShrink: 0,
            background: 'rgba(52,211,153,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: D.accent,
          }}>
            {d.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: D.text }}>
              {d.fullName}
            </div>
            {d.gdcNumber && (
              <div style={{ fontSize: 12, color: D.soft, fontFamily: 'var(--font-body)', marginTop: 2 }}>
                GDC {d.gdcNumber}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <Link
            href={`/dentist/${d.slug}`}
            target="_blank"
            style={{ fontSize: 12, color: D.accent, fontFamily: 'var(--font-body)', fontWeight: 500, textDecoration: 'none', padding: '5px 10px', borderRadius: 6, border: `1px solid rgba(52,211,153,0.25)`, background: D.accentPale }}
          >
            View profile →
          </Link>
          <button
            onClick={() => setEditing(e => !e)}
            style={{ fontSize: 12, color: D.mid, fontFamily: 'var(--font-body)', padding: '5px 10px', borderRadius: 6, border: `1.5px solid ${D.border}`, background: D.card2, cursor: 'pointer' }}
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button
            onClick={handleRemove}
            disabled={removing}
            title="Remove from practice"
            style={{ width: 32, height: 32, borderRadius: 6, border: `1.5px solid ${D.border}`, background: D.card2, cursor: removing ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: removing ? D.faint : '#dc2626' }}
          >
            <Trash2 size={13} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {d.specialisms.length > 0 && !editing && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {d.specialisms.map(s => (
            <span key={s} style={{ fontSize: 11, fontWeight: 600, color: D.accent, background: D.accentPale, border: `1px solid rgba(52,211,153,0.2)`, borderRadius: 20, padding: '2px 9px', fontFamily: 'var(--font-body)' }}>
              {s}
            </span>
          ))}
        </div>
      )}

      {editing && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={LABEL}>GDC number</label>
            <input value={gdc} onChange={e => setGdc(e.target.value)} placeholder="e.g. 123456" style={{ ...INPUT, maxWidth: 200 }} />
          </div>
          <div>
            <label style={LABEL}>Specialisms</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {COMMON_SPECIALISMS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpec(s)}
                  style={{
                    fontSize: 12, fontWeight: specs.includes(s) ? 700 : 400,
                    color: specs.includes(s) ? D.accent : D.soft,
                    background: specs.includes(s) ? 'rgba(52,211,153,0.1)' : D.card2,
                    border: `1.5px solid ${specs.includes(s) ? 'rgba(52,211,153,0.3)' : D.border}`,
                    borderRadius: 20, padding: '4px 11px', cursor: 'pointer', fontFamily: 'var(--font-body)',
                    transition: 'all 0.15s',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            {/* Custom specialism */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={custom}
                onChange={e => setCustom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
                placeholder="Add custom…"
                style={{ ...INPUT, flex: 1 }}
              />
              <button type="button" onClick={addCustom} style={{ padding: '0 14px', borderRadius: 8, border: `1.5px solid ${D.border}`, background: D.card2, cursor: 'pointer', fontSize: 13, color: D.mid, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                Add
              </button>
            </div>
            {/* Non-standard specialisms with remove */}
            {specs.filter(s => !COMMON_SPECIALISMS.includes(s)).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {specs.filter(s => !COMMON_SPECIALISMS.includes(s)).map(s => (
                  <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: D.accent, background: D.accentPale, border: `1px solid rgba(52,211,153,0.2)`, borderRadius: 20, padding: '2px 9px', fontFamily: 'var(--font-body)' }}>
                    {s}
                    <button onClick={() => setSpecs(p => p.filter(x => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', lineHeight: 1, padding: 0, fontSize: 13 }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ alignSelf: 'flex-start', padding: '9px 20px', borderRadius: 8, background: saving ? D.faint : D.accent, color: '#0d0d12', border: 'none', cursor: saving ? 'default' : 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)' }}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function TeamTab({ practiceId, practiceSlug, initialDentists }: Props) {
  const [dentists, setDentists] = useState<TeamDentist[]>(initialDentists);
  const [name, setName] = useState('');
  const [gdc, setGdc] = useState('');
  const [specs, setSpecs] = useState<string[]>([]);
  const [custom, setCustom] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const accessToken = useContext(AccessTokenContext);

  const toggleSpec = (s: string) =>
    setSpecs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const addCustom = () => {
    const t = custom.trim();
    if (t && !specs.includes(t)) setSpecs(prev => [...prev, t]);
    setCustom('');
  };

  const handleAdd = () => {
    if (!name.trim()) { setError('Name is required.'); return; }
    setError('');
    startTransition(async () => {
      const result = await addDentistToTeam(accessToken, practiceId, name.trim(), gdc.trim() || null, specs, practiceSlug);
      if (result.error) { setError(result.error); return; }
      if (result.dentist) {
        setDentists(prev => [...prev, result.dentist!]);
        setName(''); setGdc(''); setSpecs([]);
      }
    });
  };

  const handleRemove = (dentistId: string) => {
    startTransition(async () => {
      await removeDentistFromPractice(accessToken, practiceId, dentistId, practiceSlug);
      setDentists(prev => prev.filter(d => d.dentistId !== dentistId));
    });
  };

  const handleSave = (dentistId: string) => async (gdcNumber: string, specialisms: string[]) => {
    await updateDentistRecord(accessToken, dentistId, gdcNumber || null, specialisms, practiceSlug);
    setDentists(prev => prev.map(d => d.dentistId === dentistId ? { ...d, gdcNumber: gdcNumber || null, specialisms } : d));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

      {/* Left: team list */}
      <div>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: D.text, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Your Team
          </h2>
          <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', margin: 0 }}>
            Dentists at your practice. Each gets a public profile patients can link reviews to.
          </p>
        </div>

        {dentists.length === 0 ? (
          <div style={{ background: D.card, border: `1.5px solid ${D.border}`, borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: D.card2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <UserPlus size={20} strokeWidth={1.5} style={{ color: D.soft }} />
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: D.text, marginBottom: 6 }}>No dentists yet</p>
            <p style={{ fontSize: 13, color: D.soft, fontFamily: 'var(--font-body)', lineHeight: 1.6, maxWidth: 280, margin: '0 auto' }}>
              Use the form to add your first dentist.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {dentists.map(d => (
              <DentistCard
                key={d.dentistId}
                d={d}
                onRemove={() => handleRemove(d.dentistId)}
                onSave={handleSave(d.dentistId)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right: add form */}
      <div style={{ background: D.card, border: `1.5px solid ${D.border}`, borderRadius: 12, padding: '20px 22px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: D.text, marginBottom: 16, margin: '0 0 16px' }}>
          Add a dentist
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={LABEL}>Full name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Dr Sarah Patel" style={INPUT} />
          </div>
          <div>
            <label style={LABEL}>GDC number</label>
            <input value={gdc} onChange={e => setGdc(e.target.value)} placeholder="Optional" style={INPUT} />
          </div>

          <div>
            <label style={LABEL}>Specialisms</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
              {COMMON_SPECIALISMS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpec(s)}
                  style={{
                    fontSize: 11, fontWeight: specs.includes(s) ? 700 : 400,
                    color: specs.includes(s) ? D.accent : D.soft,
                    background: specs.includes(s) ? 'rgba(52,211,153,0.1)' : D.card2,
                    border: `1.5px solid ${specs.includes(s) ? 'rgba(52,211,153,0.3)' : D.border}`,
                    borderRadius: 20, padding: '3px 9px', cursor: 'pointer',
                    fontFamily: 'var(--font-body)', transition: 'all 0.15s',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 7 }}>
              <input
                value={custom}
                onChange={e => setCustom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
                placeholder="Add custom…"
                style={{ ...INPUT, flex: 1, fontSize: 13 }}
              />
              <button type="button" onClick={addCustom} style={{ padding: '0 12px', borderRadius: 8, border: `1.5px solid ${D.border}`, background: D.card2, cursor: 'pointer', fontSize: 12, color: D.mid, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                Add
              </button>
            </div>
            {specs.filter(s => !COMMON_SPECIALISMS.includes(s)).map(s => (
              <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: D.accent, background: D.accentPale, border: `1px solid rgba(52,211,153,0.2)`, borderRadius: 20, padding: '2px 8px', fontFamily: 'var(--font-body)', marginTop: 6, marginRight: 5 }}>
                {s}
                <button onClick={() => setSpecs(p => p.filter(x => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', lineHeight: 1, padding: 0, fontSize: 13 }}>×</button>
              </span>
            ))}
          </div>

          {error && (
            <p style={{ fontSize: 13, color: '#dc2626', fontFamily: 'var(--font-body)', margin: 0 }}>{error}</p>
          )}

          <button
            onClick={handleAdd}
            disabled={isPending || !name.trim()}
            style={{
              padding: '10px 0', borderRadius: 8, width: '100%',
              background: isPending || !name.trim() ? D.faint : D.accent,
              color: '#0d0d12', border: 'none',
              cursor: isPending || !name.trim() ? 'default' : 'pointer',
              fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)',
            }}
          >
            {isPending ? 'Adding…' : 'Add to team'}
          </button>
        </div>
      </div>
    </div>
  );
}
