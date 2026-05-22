import Link from 'next/link';
import { submitPractice } from './actions';
import { Check, ChevronLeft } from 'lucide-react';

export const metadata = { title: 'Add a dental practice | SmileProof' };

const FIELD = 'w-full rounded-lg border px-3 py-2.5 text-sm outline-none';
const FIELD_STYLE = { borderColor: 'var(--cream-dark)', color: 'var(--ink)', background: 'white' };
const LABEL = 'block text-xs font-semibold uppercase tracking-wide mb-1.5';
const LABEL_STYLE = { color: 'var(--ink-soft)', letterSpacing: '0.1em' };

export default async function AddPracticePage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; error?: string }>;
}) {
  const { submitted, error } = await searchParams;

  if (submitted) {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <div
          className="rounded-2xl bg-white p-10"
          style={{ border: '1.5px solid var(--cream-dark)' }}
        >
          <div
            className="mx-auto mb-5 flex items-center justify-center rounded-full"
            style={{ width: 56, height: 56, background: 'var(--forest-pale)' }}
          >
            <Check size={24} strokeWidth={2.5} style={{ color: 'var(--forest)' }} />
          </div>
          <h1
            className="font-bold mb-2"
            style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--ink)' }}
          >
            Thanks — we'll review it shortly
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)', lineHeight: 1.65 }}>
            Your submission has been received. Once approved it will appear in search results and patients can leave reviews.
          </p>
          <Link
            href="/search"
            className="inline-block rounded-full px-6 py-2.5 text-sm font-semibold text-white"
            style={{ background: 'var(--forest)' }}
          >
            Back to search
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <Link
        href="/search"
        className="inline-flex items-center gap-1.5 text-sm mb-6"
        style={{ color: 'var(--ink-soft)' }}
      >
        <ChevronLeft size={14} strokeWidth={2} />
        Back to search
      </Link>

      <div
        className="rounded-2xl bg-white p-8"
        style={{ border: '1.5px solid var(--cream-dark)' }}
      >
        <h1
          className="font-bold mb-1"
          style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink)' }}
        >
          Add a dental practice
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--ink-soft)', lineHeight: 1.65 }}>
          Can't find your dentist? Submit the details below and we'll add them after a quick review —
          usually within 48 hours.
        </p>

        {error && (
          <div
            className="rounded-lg px-4 py-3 text-sm mb-6"
            style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c' }}
          >
            Something went wrong — please check the form and try again.
          </div>
        )}

        <form action={submitPractice} className="space-y-6">
          {/* Practice details */}
          <section>
            <p
              className="mb-4"
              style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--forest)' }}
            >
              Practice details
            </p>
            <div className="space-y-4">
              <div>
                <label className={LABEL} style={LABEL_STYLE}>
                  Practice name <span style={{ color: 'var(--forest)' }}>*</span>
                </label>
                <input name="name" type="text" required className={FIELD} style={FIELD_STYLE} placeholder="e.g. Brightside Family Dentistry" />
              </div>
              <div>
                <label className={LABEL} style={LABEL_STYLE}>Type</label>
                <div className="flex gap-3">
                  {([['mixed', 'NHS & Private'], ['nhs', 'NHS only'], ['private', 'Private only']] as const).map(([val, label]) => (
                    <label
                      key={val}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                      style={{ color: 'var(--ink-mid)' }}
                    >
                      <input type="radio" name="practice_type" value={val} defaultChecked={val === 'mixed'} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Address */}
          <section style={{ borderTop: '1px solid var(--cream-dark)', paddingTop: 24 }}>
            <p
              className="mb-4"
              style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--forest)' }}
            >
              Address
            </p>
            <div className="space-y-4">
              <div>
                <label className={LABEL} style={LABEL_STYLE}>
                  Address line 1 <span style={{ color: 'var(--forest)' }}>*</span>
                </label>
                <input name="address_line1" type="text" required className={FIELD} style={FIELD_STYLE} placeholder="Street address" />
              </div>
              <div>
                <label className={LABEL} style={LABEL_STYLE}>Address line 2</label>
                <input name="address_line2" type="text" className={FIELD} style={FIELD_STYLE} placeholder="Suite, floor, etc." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL} style={LABEL_STYLE}>
                    City / Town <span style={{ color: 'var(--forest)' }}>*</span>
                  </label>
                  <input name="city" type="text" required className={FIELD} style={FIELD_STYLE} />
                </div>
                <div>
                  <label className={LABEL} style={LABEL_STYLE}>
                    Postcode <span style={{ color: 'var(--forest)' }}>*</span>
                  </label>
                  <input name="postcode" type="text" required className={FIELD} style={FIELD_STYLE} placeholder="e.g. EH1 1YZ" />
                </div>
              </div>
              <div>
                <label className={LABEL} style={LABEL_STYLE}>Country</label>
                <select name="country" className={FIELD} style={FIELD_STYLE}>
                  <option value="england">England</option>
                  <option value="scotland">Scotland</option>
                  <option value="wales">Wales</option>
                  <option value="northern_ireland">Northern Ireland</option>
                </select>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section style={{ borderTop: '1px solid var(--cream-dark)', paddingTop: 24 }}>
            <p
              className="mb-4"
              style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--forest)' }}
            >
              Contact (optional)
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL} style={LABEL_STYLE}>Phone</label>
                  <input name="phone" type="tel" className={FIELD} style={FIELD_STYLE} placeholder="01234 567890" />
                </div>
                <div>
                  <label className={LABEL} style={LABEL_STYLE}>Email</label>
                  <input name="email" type="email" className={FIELD} style={FIELD_STYLE} placeholder="hello@practice.co.uk" />
                </div>
              </div>
              <div>
                <label className={LABEL} style={LABEL_STYLE}>Website</label>
                <input name="website" type="url" className={FIELD} style={FIELD_STYLE} placeholder="https://…" />
              </div>
            </div>
          </section>

          {/* About you */}
          <section style={{ borderTop: '1px solid var(--cream-dark)', paddingTop: 24 }}>
            <p
              className="mb-4"
              style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--forest)' }}
            >
              About you (optional)
            </p>
            <div className="space-y-4">
              <div>
                <label className={LABEL} style={LABEL_STYLE}>Your email</label>
                <input name="submitter_email" type="email" className={FIELD} style={FIELD_STYLE} placeholder="We'll notify you when it's live" />
              </div>
              <div>
                <label className={LABEL} style={LABEL_STYLE}>Anything else we should know?</label>
                <textarea
                  name="notes"
                  rows={3}
                  className={FIELD}
                  style={{ ...FIELD_STYLE, resize: 'vertical' }}
                  placeholder="e.g. this practice recently opened, or changed its name"
                />
              </div>
            </div>
          </section>

          <button
            type="submit"
            className="w-full rounded-full py-3 text-sm font-semibold text-white"
            style={{ background: 'var(--forest)', transition: 'var(--transition)' }}
          >
            Submit for review
          </button>
        </form>
      </div>
    </main>
  );
}
