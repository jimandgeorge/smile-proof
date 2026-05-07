'use client';

import { useState, useEffect, useTransition } from 'react';
import { toggleVote, submitFlag } from './review-actions';

const FLAG_REASONS = [
  { value: 'fake',        label: 'Fake or misleading' },
  { value: 'defamatory', label: 'Defamatory or harmful' },
  { value: 'spam',        label: 'Spam or advertising' },
  { value: 'other',       label: 'Other' },
];

export function ReviewActions({
  reviewId,
  practiceSlug,
  initialCount,
}: {
  reviewId: string;
  practiceSlug: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);
  const [votePending, startVoteTransition] = useTransition();

  const [flagOpen, setFlagOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagDetails, setFlagDetails] = useState('');
  const [flagPending, startFlagTransition] = useTransition();
  const [flagDone, setFlagDone] = useState(false);
  const [flagError, setFlagError] = useState('');

  // Persist voted state in localStorage
  const storageKey = `voted:${reviewId}`;
  useEffect(() => {
    setVoted(localStorage.getItem(storageKey) === '1');
  }, [storageKey]);

  function handleVote() {
    startVoteTransition(async () => {
      const next = !voted;
      // Optimistic update
      setVoted(next);
      setCount((c) => c + (next ? 1 : -1));
      localStorage.setItem(storageKey, next ? '1' : '0');
      await toggleVote(reviewId);
    });
  }

  function handleShare() {
    const url = `${window.location.origin}/practices/${practiceSlug}#review-${reviewId}`;
    if (navigator.share) {
      navigator.share({ url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard');
      });
    }
  }

  function handleFlag(e: React.FormEvent) {
    e.preventDefault();
    startFlagTransition(async () => {
      const res = await submitFlag(reviewId, flagReason, flagDetails);
      if (res?.error) {
        setFlagError(res.error);
      } else {
        setFlagDone(true);
      }
    });
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-3 text-xs text-gray-500">
        {/* Useful */}
        <button
          onClick={handleVote}
          disabled={votePending}
          className={`flex items-center gap-1 rounded-full border px-3 py-1 transition-colors ${
            voted
              ? 'border-blue-300 bg-blue-50 text-blue-700 font-medium'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <span>{voted ? '👍' : '👍'}</span>
          <span>Useful{count > 0 ? ` · ${count}` : ''}</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <span>🔗</span>
          <span>Share</span>
        </button>

        {/* Flag */}
        {!flagDone ? (
          <button
            onClick={() => setFlagOpen((v) => !v)}
            className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <span>🚩</span>
            <span>Flag</span>
          </button>
        ) : (
          <span className="text-gray-400 italic">Flagged — thank you</span>
        )}
      </div>

      {/* Flag form */}
      {flagOpen && !flagDone && (
        <form
          onSubmit={handleFlag}
          className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50 text-xs"
        >
          <p className="font-medium text-gray-700">Report this review</p>
          <div className="flex flex-wrap gap-2">
            {FLAG_REASONS.map((r) => (
              <label key={r.value} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value={r.value}
                  checked={flagReason === r.value}
                  onChange={() => setFlagReason(r.value)}
                  className="accent-blue-700"
                />
                {r.label}
              </label>
            ))}
          </div>
          <textarea
            value={flagDetails}
            onChange={(e) => setFlagDetails(e.target.value)}
            placeholder="Optional details…"
            rows={2}
            className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          {flagError && <p className="text-red-600">{flagError}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={flagPending || !flagReason}
              className="rounded-full bg-red-600 text-white px-3 py-1 hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {flagPending ? 'Submitting…' : 'Submit report'}
            </button>
            <button
              type="button"
              onClick={() => setFlagOpen(false)}
              className="text-gray-400 hover:underline"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
