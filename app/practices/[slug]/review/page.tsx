import { notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase';
import { ReviewForm } from './ReviewForm';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase.from('practices').select('name').eq('slug', slug).single();
  return { title: data ? `Review ${data.name} | SmileProof` : 'Leave a review' };
}

export default async function ReviewPage({ params }: Params) {
  const { slug } = await params;
  const supabase = await createServerSupabase();

  const [practiceRes, treatmentsRes] = await Promise.all([
    supabase.from('practices').select('id, name, city, slug').eq('slug', slug).single(),
    supabase.from('treatments').select('id, name, category').order('category').order('name'),
  ]);

  if (practiceRes.error || !practiceRes.data) notFound();
  const practice = practiceRes.data;

  const { data: dentistRows } = await supabase
    .from('practice_dentists')
    .select('dentists(id, full_name)')
    .eq('practice_id', practice.id)
    .eq('active', true);

  const dentists = (dentistRows ?? [])
    .map((r: any) => r.dentists)
    .filter(Boolean);

  return (
    <main>
      <ReviewForm
        practice={practice}
        treatments={treatmentsRes.data ?? []}
        dentists={dentists}
      />
    </main>
  );
}
