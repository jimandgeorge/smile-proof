import type { Metadata } from 'next';
import FindFlow from './FindFlow';

export const metadata: Metadata = {
  title: 'Find your dentist | SmileProof',
  description: 'Answer a few quick questions and we\'ll match you with the right dental practice — based on treatment, location, and real patient reviews.',
};

type Props = { searchParams: Promise<{ treatment?: string }> };

export default async function FindPage({ searchParams }: Props) {
  const { treatment } = await searchParams;
  return <FindFlow initialTreatment={treatment} />;
}
