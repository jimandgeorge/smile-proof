import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type ReviewInput = {
  rating_overall: number;
  body: string;
  verification_status: string;
};

export async function generatePracticeSummary(
  practiceName: string,
  reviews: ReviewInput[],
): Promise<string | null> {
  if (!reviews.length) return null;

  const reviewText = reviews
    .slice(0, 20)
    .map(
      (r, i) =>
        `Review ${i + 1} (${r.rating_overall}/5${r.verification_status === 'verified' ? ', verified' : ''}): ${r.body}`,
    )
    .join('\n\n');

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `You are summarising patient reviews for a UK dental practice listing. Write 2–3 balanced sentences summarising what patients say about "${practiceName}". Mention standout positives and any recurring concerns honestly. Do not use bullet points. Do not invent details not in the reviews. Write in third person, present tense.

Reviews:
${reviewText}`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === 'text');
  return text?.text ?? null;
}
