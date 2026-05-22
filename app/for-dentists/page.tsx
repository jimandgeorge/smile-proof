import Link from 'next/link';
import PricingSection from './PricingSection';

export const metadata = {
  title: 'For Dental Practices | SmileProof',
  description: 'Claim your free SmileProof listing. Respond to patient reviews, track your reputation, invite patients, and get found by new patients. Built for single practices and multi-location dental groups.',
};

// ── Tiny reusable mockup primitives ──────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ background: 'white', border: '1px solid #e8e0d5', borderRadius: 10, padding: '14px 16px' }}>
      <p style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 700, color: '#1a2e22', lineHeight: 1, marginBottom: 4 }}>{value}</p>
      <p style={{ fontSize: 11, color: '#999' }}>{sub}</p>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 12, color: '#666' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#1a2e22' }}>{value.toFixed(1)}</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: '#f0ebe4', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(value / 5) * 100}%`, background: '#1c4535', borderRadius: 3 }} />
      </div>
    </div>
  );
}

function StarRow({ filled }: { filled: number }) {
  return (
    <span style={{ color: '#f59e0b', fontSize: 13, letterSpacing: -1 }}>
      {'★'.repeat(filled)}{'☆'.repeat(5 - filled)}
    </span>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ForDentistsPage() {
  return (
    <div>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(160deg, #1c4535 0%, #2a5e49 40%, #3a7a5e 100%)', position: 'relative', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', width: 480, height: 480, top: -100, right: -100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 24px 72px', textAlign: 'center', position: 'relative' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>
            For dental practices
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 700, color: 'var(--cream)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 20 }}>
            Turn patient reviews into<br /><em>your biggest growth channel</em>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, maxWidth: 500, margin: '0 auto 40px' }}>
            SmileProof gives your practice a verified review profile — and a dashboard to respond, get insights, invite patients, and attract new enquiries. Built for single practices and multi-location dental groups.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/search"
              style={{ display: 'inline-block', background: 'var(--cream)', color: 'var(--forest)', fontWeight: 700, fontSize: 15, padding: '14px 32px', borderRadius: 50, textDecoration: 'none' }}
            >
              Claim your practice free →
            </Link>
            <a
              href="#features"
              style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)', fontWeight: 600, fontSize: 15, padding: '14px 28px', borderRadius: 50, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              See what's included
            </a>
          </div>
        </div>
      </section>

      {/* ── Trust bar ────────────────────────────────────────────────────── */}
      <div style={{ background: 'var(--cream)', borderBottom: '1px solid var(--cream-dark)', padding: '14px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            '✓ Free to claim',
            '✓ No credit card required',
            '✓ Verified reviews only',
            '✓ Respond publicly',
            '✓ AI-powered insights',
            '✓ Dental groups supported',
          ].map(t => (
            <span key={t} style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Feature 1: Overview dashboard ────────────────────────────────── */}
      <section id="features" style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 56, alignItems: 'center' }}>

          {/* Text */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--forest)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Practice dashboard</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,34px)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 16 }}>
              See exactly how your patients rate you
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 24 }}>
              Your dashboard shows your overall rating, monthly profile views, new reviews, and response rate at a glance — plus scores broken down across six dimensions.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Overall rating and review count',
                'Profile views over the last 30 days',
                'Month-on-month review growth',
                'Response rate — shown to patients on your profile',
                'Scores for pain, communication, value, cleanliness, and anxiety handling',
                'How you rank against practices in your city',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--forest)', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Mockup */}
          <div style={{ background: '#f4f1ec', borderRadius: 16, padding: 20, boxShadow: '0 8px 32px rgba(28,69,53,0.12)', border: '1px solid #e0d9d0' }}>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <StatCard label="Overall rating" value="4.8" sub="from 24 reviews" />
              <StatCard label="Profile views" value="213" sub="last 30 days" />
              <StatCard label="New reviews" value="6" sub="this month +4 vs last" />
              <StatCard label="Response rate" value="100%" sub="All reviews answered" />
            </div>

            {/* Ranking banner */}
            <div style={{ background: '#ede9f8', border: '1px solid #c4b8ee', borderRadius: 8, padding: '8px 14px', fontSize: 12, color: '#5b3fc8', fontWeight: 600, marginBottom: 16 }}>
              ↗ You're ranked #1 in your city — great work!
            </div>

            {/* Patient scores */}
            <div style={{ background: 'white', borderRadius: 10, padding: '14px 16px', border: '1px solid #e8e0d5' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Patient scores</p>
              <ScoreBar label="Pain Management" value={4.6} />
              <ScoreBar label="Communication" value={4.8} />
              <ScoreBar label="Value for Money" value={4.3} />
              <ScoreBar label="Cleanliness" value={4.9} />
              <ScoreBar label="Anxiety Handling" value={4.7} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature 2: Reviews ───────────────────────────────────────────── */}
      <section style={{ background: 'var(--cream)', borderTop: '1px solid var(--cream-dark)', borderBottom: '1px solid var(--cream-dark)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 56, alignItems: 'center' }}>

            {/* Mockup — left on desktop */}
            <div style={{ background: '#f4f1ec', borderRadius: 16, padding: 20, boxShadow: '0 8px 32px rgba(28,69,53,0.12)', border: '1px solid #e0d9d0' }}>

              {/* Review 1 */}
              <div style={{ background: 'white', borderRadius: 10, padding: '14px 16px', border: '1px solid #e8e0d5', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <StarRow filled={5} />
                  <span style={{ fontSize: 11, color: '#aaa' }}>2 days ago</span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1a2e22', marginBottom: 4 }}>Transformed my smile — and my confidence</p>
                <span style={{ fontSize: 10, padding: '2px 8px', background: '#f4f1ec', border: '1px solid #e0d9d0', borderRadius: 20, color: '#666' }}>Veneers</span>
                <p style={{ fontSize: 12, color: '#555', lineHeight: 1.6, marginTop: 8 }}>
                  "The team took their time, explained everything. Genuinely life-changing."
                </p>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f0ebe4' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Your response</p>
                  <p style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>
                    "Thank you so much — we're absolutely thrilled…"
                  </p>
                  <button style={{ marginTop: 6, fontSize: 11, color: 'var(--forest)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 600 }}>Edit response</button>
                </div>
              </div>

              {/* Review 2 */}
              <div style={{ background: 'white', borderRadius: 10, padding: '14px 16px', border: '1px solid #e8e0d5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <StarRow filled={2} />
                  <span style={{ fontSize: 11, color: '#aaa' }}>1 week ago</span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1a2e22', marginBottom: 8 }}>Long waiting times</p>
                <p style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>
                  "Waited over 40 minutes past my appointment time."
                </p>
                <div style={{ marginTop: 10 }}>
                  <button style={{ fontSize: 11, background: 'var(--forest)', color: 'white', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontWeight: 600 }}>Reply publicly →</button>
                </div>
              </div>
            </div>

            {/* Text */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--forest)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Reviews</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,34px)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 16 }}>
                Respond to every review publicly
              </h2>
              <p style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 24 }}>
                A thoughtful reply to a negative review is one of the most powerful trust signals in healthcare. Patients trust practices that engage — far more than those with suspiciously perfect scores.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'View all published reviews in one place',
                  'Reply publicly — response shown on your listing',
                  'Edit your response any time',
                  'Track your response rate — visible to patients',
                  'Verified reviews only: every reviewer confirmed by email',
                  'Unverified reviews clearly labelled so patients know',
                ].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--forest)', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature 3: AI Insights ───────────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 56, alignItems: 'center' }}>

          {/* Text */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--forest)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>AI insights</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,34px)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 16 }}>
              Understand what patients really think
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 24 }}>
              SmileProof uses AI to surface recurring themes across your reviews — so you can see what's working and what to fix without reading every review yourself.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'AI-generated patient sentiment themes from your reviews',
                'Identify your top strengths at a glance',
                'Spot recurring concerns before they cost you patients',
                'AI summary shown on your public listing to attract new patients',
                'Featured practices get a deeper, in-depth AI summary',
                'Automatically updated as new reviews arrive',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--forest)', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Mockup */}
          <div style={{ background: '#f4f1ec', borderRadius: 16, padding: 20, boxShadow: '0 8px 32px rgba(28,69,53,0.12)', border: '1px solid #e0d9d0' }}>
            {/* AI summary */}
            <div style={{ background: 'linear-gradient(135deg, #eaf3ee 0%, #f0f7f3 100%)', border: '1.5px solid rgba(28,69,53,0.15)', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, background: '#1c4535', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M2 6h5M2 9h6" stroke="white" strokeWidth="1.4" strokeLinecap="round" /><circle cx="10" cy="9" r="1.5" fill="white" /></svg>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#1c4535', letterSpacing: '0.08em', textTransform: 'uppercase' }}>AI Review Summary</span>
              </div>
              <p style={{ fontSize: 13, color: '#2a3d30', lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>
                "Patients consistently highlight the warmth of the team and how well anxiety is handled. Wait times occasionally draw comment, though the quality of results is praised across cosmetic and restorative treatments."
              </p>
            </div>

            {/* Sentiment themes */}
            <div style={{ background: 'white', borderRadius: 10, padding: '14px 16px', border: '1px solid #e8e0d5' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Patient sentiment themes</p>
              {[
                { label: 'Friendly, caring staff', pct: 82, positive: true },
                { label: 'Anxiety handled well', pct: 74, positive: true },
                { label: 'Clear communication', pct: 68, positive: true },
                { label: 'Wait times', pct: 31, positive: false },
              ].map(({ label, pct, positive }) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12, color: '#555' }}>{label}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: positive ? '#1c4535' : '#b45309' }}>{pct}%</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: '#f0ebe4', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: positive ? '#1c4535' : '#f59e0b', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature 4: Get Reviews + Profile ────────────────────────────── */}
      <section style={{ background: 'var(--cream)', borderTop: '1px solid var(--cream-dark)', borderBottom: '1px solid var(--cream-dark)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 56, alignItems: 'start' }}>

            {/* Mockup */}
            <div>
              {/* Invite form */}
              <div style={{ background: '#f4f1ec', borderRadius: 16, padding: 20, boxShadow: '0 8px 32px rgba(28,69,53,0.12)', border: '1px solid #e0d9d0', marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1a2e22', marginBottom: 12 }}>Request a review</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                  <div>
                    <p style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>PATIENT EMAIL *</p>
                    <div style={{ background: 'white', border: '1px solid #ddd', borderRadius: 6, padding: '7px 10px', fontSize: 12, color: '#aaa' }}>patient@email.com</div>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>FIRST NAME <span style={{ fontWeight: 400 }}>(optional)</span></p>
                    <div style={{ background: 'white', border: '1px solid #ddd', borderRadius: 6, padding: '7px 10px', fontSize: 12, color: '#aaa' }}>e.g. Sarah</div>
                  </div>
                </div>
                <div style={{ background: '#1c4535', color: 'white', borderRadius: 6, padding: '8px 16px', fontSize: 12, fontWeight: 600, display: 'inline-block' }}>Send invite →</div>
              </div>

              {/* Services */}
              <div style={{ background: '#f4f1ec', borderRadius: 16, padding: 20, boxShadow: '0 8px 32px rgba(28,69,53,0.12)', border: '1px solid #e0d9d0' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1a2e22', marginBottom: 4 }}>Services offered</p>
                <p style={{ fontSize: 11, color: '#888', marginBottom: 14 }}>Shown on your profile · used in search</p>
                {[
                  { cat: 'Availability', tags: ['Evening appointments', 'Same-day', 'Emergency care'] },
                  { cat: 'NHS / Funding', tags: ['NHS treatment', 'Private treatment', 'NHS & private'] },
                  { cat: 'Orthodontics', tags: ['Invisalign', 'Fixed braces', 'Clear aligners'] },
                  { cat: 'Accessibility', tags: ['Wheelchair accessible', 'Anxiety-friendly', 'Child-friendly'] },
                ].map(({ cat, tags }) => (
                  <div key={cat} style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{cat}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {tags.map(t => (
                        <span key={t} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: 'white', border: '1px solid #d5cfc6', color: '#555' }}>{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Text */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--forest)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Get reviews & profile</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,34px)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 16 }}>
                Grow your reputation and get found
              </h2>
              <p style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 28 }}>
                Send branded email invites to patients after their appointment. Tell us what services you offer and we'll surface your practice when patients search for exactly that.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>One-click patient invites</h3>
                  <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6 }}>Enter a patient's email. They receive a branded SmileProof invite that links directly to your review form. Each invite is single-use and can't be forwarded.</p>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Service-based discovery</h3>
                  <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6 }}>Tag your practice with the services you offer — Invisalign, NHS, anxiety-friendly, evening appointments — and appear in the right searches on the SmileProof homepage.</p>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Website badge</h3>
                  <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6 }}>Paste a one-line snippet into your website. The badge renders your live SmileProof rating and review count automatically — always up to date.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features by tier ─────────────────────────────────────────────── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--ink)', textAlign: 'center', marginBottom: 8, letterSpacing: '-0.01em' }}>
          What's included
        </h2>
        <p style={{ fontSize: 15, color: 'var(--ink-soft)', textAlign: 'center', marginBottom: 48, lineHeight: 1.6 }}>
          Core tools are free forever. Upgrade when you're ready to grow.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {([
            {
              icon: '★',
              tier: 'Free' as const,
              title: 'Verified patient reviews',
              body: 'Every review is tied to a confirmed email address. No fake reviews, no anonymous attacks.',
            },
            {
              icon: '↩',
              tier: 'Free' as const,
              title: 'Public response tool',
              body: 'Reply to any review. Your response appears on your listing immediately and can be edited any time.',
            },
            {
              icon: '✦',
              tier: 'Free' as const,
              title: 'Six-dimension scoring',
              body: 'Patients score pain, communication, value, cleanliness, anxiety handling, and overall separately.',
            },
            {
              icon: '◎',
              tier: 'Free' as const,
              title: 'Transparent pricing data',
              body: 'Patients report what they actually paid. Competitive prices shown publicly attract more enquiries.',
            },
            {
              icon: '⊕',
              tier: 'Free' as const,
              title: 'Service tagging',
              body: 'Tag your services — NHS, Invisalign, anxiety-friendly, evening appointments — to surface in relevant searches.',
            },
            {
              icon: '↗',
              tier: 'Free' as const,
              title: 'Local ranking',
              body: 'See how you rank against other practices in your city. Updated as new reviews come in.',
            },
            {
              icon: '→',
              tier: 'Pro' as const,
              title: 'Patient invite tool',
              body: 'Send a branded one-time invite link to any patient email. Drives genuine reviews without gaming the system.',
            },
            {
              icon: '◈',
              tier: 'Pro' as const,
              title: 'Website badge embed',
              body: 'A one-line embed that shows your live SmileProof rating on your own website. Always current.',
            },
            {
              icon: '⬡',
              tier: 'Pro' as const,
              title: 'AI reputation intelligence',
              body: 'AI surfaces recurring themes across your reviews — strengths to promote, concerns to address before they cost you patients.',
            },
            {
              icon: '★',
              tier: 'Pro' as const,
              title: 'Priority placement in treatment searches',
              body: 'Your practice surfaces first when patients search by treatment — Invisalign, implants, NHS, anxiety-friendly, and more.',
            },
            {
              icon: '◫',
              tier: 'Group' as const,
              title: 'Centralised group dashboard',
              body: 'Manage all your locations from one place — ratings, new reviews, and response status across every practice.',
            },
            {
              icon: '↗',
              tier: 'Group' as const,
              title: 'Cross-practice analytics',
              body: 'See which locations are performing well and where to focus your attention — with group-level trend reports.',
            },
          ] as const).map((b) => {
            const tierStyle =
              b.tier === 'Free'
                ? { bg: '#f4f1ec', color: '#888', label: 'Free' }
                : b.tier === 'Pro'
                ? { bg: 'var(--forest-pale)', color: 'var(--forest)', label: 'Pro' }
                : { bg: 'rgba(251,191,36,0.12)', color: '#92400e', label: 'Group' };
            return (
              <div key={b.title} style={{ background: 'white', border: '1.5px solid var(--cream-dark)', borderRadius: 'var(--radius)', padding: '20px 20px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--forest-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--forest)' }}>
                    {b.icon}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: tierStyle.bg, color: tierStyle.color, letterSpacing: '0.06em' }}>
                    {tierStyle.label}
                  </span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 5 }}>{b.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0 }}>{b.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Dental groups callout ─────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(160deg, #0d1f17 0%, #1a3829 100%)', borderTop: '1px solid rgba(251,191,36,0.15)', borderBottom: '1px solid rgba(251,191,36,0.1)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center' }}>

            {/* Text */}
            <div>
              <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fbbf24', marginBottom: 14 }}>
                For dental groups
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 700, color: 'rgba(255,255,255,0.95)', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 16 }}>
                Running more than one practice?
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 28 }}>
                SmileProof works across your whole group — one dashboard, all your locations. See how each practice is performing, spot trends across the group, and manage your reputation from a single place.
              </p>
              <a
                href="mailto:hello@smileproof.co.uk"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)',
                  border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 8,
                  padding: '12px 24px', fontSize: 14, fontWeight: 600, textDecoration: 'none',
                }}
              >
                Talk to us →
              </a>
            </div>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { title: 'Centralised group dashboard', body: 'All your locations — ratings, reviews, and response status — in one place.' },
                { title: 'Cross-practice analytics', body: 'Group-level reporting with per-location breakdowns. See what\'s working and where to focus.' },
                { title: 'Group AI sentiment summary', body: 'Understand how your group is perceived across treatments and locations.' },
                { title: 'Bulk patient invite tools', body: 'Send review invites at scale across all your practices with one workflow.' },
              ].map(({ title, body }) => (
                <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fbbf24', flexShrink: 0, marginTop: 7 }} />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 2, fontFamily: 'var(--font-display)' }}>{title}</p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <div style={{ background: 'var(--cream)', borderTop: '1px solid var(--cream-dark)' }}>
        <PricingSection />
      </div>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--forest-pale)', borderTop: '1px solid rgba(28,69,53,0.1)', borderBottom: '1px solid rgba(28,69,53,0.1)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--ink)', textAlign: 'center', marginBottom: 48, letterSpacing: '-0.01em' }}>
            Claim your listing in 60 seconds
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 32 }}>
            {[
              { n: '1', title: 'Find your practice', body: 'Search by postcode or name. Most English practices are already listed from the CQC register.' },
              { n: '2', title: 'Enter your work email', body: 'We send a one-click verification link to your practice email address.' },
              { n: '3', title: 'Dashboard ready', body: "That's it — respond to reviews, track scores, and invite patients immediately." },
            ].map((s) => (
              <div key={s.n} style={{ textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--forest)', color: 'var(--cream)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  {s.n}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6 }}>{s.body}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link
              href="/search"
              style={{ display: 'inline-block', background: 'var(--forest)', color: 'var(--cream)', fontWeight: 600, fontSize: 15, padding: '14px 36px', borderRadius: 50, textDecoration: 'none' }}
            >
              Find my practice →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 640, margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--ink)', marginBottom: 36, letterSpacing: '-0.01em' }}>
          Common questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            {
              q: 'Is it really free?',
              a: 'Yes — claiming your listing, responding to reviews, and your basic dashboard are free forever. Pro (£99/month) adds the patient invite tool, consultation enquiry capture, AI reputation intelligence, priority treatment search placement, live trust badge, and extended analytics. Group pricing is custom — talk to us.',
            },
            {
              q: 'Do you support multi-location practices?',
              a: 'Yes. If you run more than one practice, we can set you up with a centralised group dashboard, cross-practice analytics, and reporting across all your locations. Pricing is based on the number of practices. Email hello@smileproof.co.uk to get started.',
            },
            {
              q: 'Can I cancel at any time?',
              a: 'Yes — no contracts, no lock-in. Cancel Pro at any time and your account drops back to Starter. Your listing, reviews, and responses all stay intact.',
            },
            {
              q: 'Can I remove negative reviews?',
              a: "No — but you can respond to them publicly. Patients trust practices that engage with criticism far more than those with suspiciously perfect scores. A good response often converts a bad review into a trust signal.",
            },
            {
              q: 'How do you verify reviews are real?',
              a: 'Every reviewer confirms ownership of their email address via a magic link before their review goes live. Unverified reviews are clearly labelled so patients can weigh them accordingly.',
            },
            {
              q: 'What does the AI summary do?',
              a: "Once you have enough reviews, SmileProof automatically generates a balanced summary of what patients say about your practice — shown publicly on your listing. Pro practices get a longer, in-depth version that refreshes as new reviews arrive.",
            },
            {
              q: 'What if my practice is not listed?',
              a: 'We seed England listings from the CQC register, so most English practices are already here. Scotland, Wales, and Northern Ireland can be added on request.',
            },
          ].map(({ q, a }, i, arr) => (
            <div key={q} style={{ padding: '24px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--cream-dark)' : 'none' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>{q}</h3>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.65 }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(160deg, #1c4535 0%, #2a5e49 100%)', padding: '72px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,4vw,40px)', fontWeight: 700, color: 'var(--cream)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 16 }}>
          Ready to take control of your reputation?
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', maxWidth: 440, margin: '0 auto 36px', lineHeight: 1.65 }}>
          Claim your listing for free. No credit card. No contracts. Your dashboard is live in under a minute.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/search"
            style={{ display: 'inline-block', background: 'var(--cream)', color: 'var(--forest)', fontWeight: 700, fontSize: 15, padding: '14px 32px', borderRadius: 50, textDecoration: 'none' }}
          >
            Claim your practice free →
          </Link>
          <a
            href="mailto:hello@smileproof.co.uk"
            style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: 15, padding: '14px 28px', borderRadius: 50, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            Dental group? Talk to us
          </a>
        </div>
      </section>

    </div>
  );
}
