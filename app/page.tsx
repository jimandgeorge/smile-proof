import { redirect } from 'next/navigation';
import HeroSection from './components/HeroSection';
import ProblemSection from './components/ProblemSection';
import IntelligenceDashboardSection from './components/IntelligenceDashboardSection';
import AIInsightSection from './components/AIInsightSection';
import OutcomesSection from './components/OutcomesSection';
import GoogleIntelSection from './components/GoogleIntelSection';
import EnterpriseSection from './components/EnterpriseSection';
import PricingPreviewSection from './components/PricingPreviewSection';
import HomepageCTA from './components/HomepageCTA';

type Props = { searchParams: Promise<Record<string, string>> };

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  if (params.error_code === 'otp_expired' || params.error === 'access_denied') {
    redirect('/auth/confirm-expired');
  }

  return (
    <div style={{ background: '#07070e' }}>
      <HeroSection />
      <ProblemSection />
      <IntelligenceDashboardSection />
      <AIInsightSection />
      <OutcomesSection />
      <GoogleIntelSection />
      <EnterpriseSection />
      <PricingPreviewSection />
      <HomepageCTA />
    </div>
  );
}
