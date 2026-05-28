import HeroSection from './components/HeroSection';
import ProblemSection from './components/ProblemSection';
import IntelligenceDashboardSection from './components/IntelligenceDashboardSection';
import GoogleIntelSection from './components/GoogleIntelSection';
import OutcomesSection from './components/OutcomesSection';
import ForPatientsSection from './components/ForPatientsSection';
import HomepageCTA from './components/HomepageCTA';

export default function Home() {
  return (
    <div style={{ background: '#07070e' }}>
      <HeroSection />
      <ProblemSection />
      <IntelligenceDashboardSection />
      <GoogleIntelSection />
      <OutcomesSection />
      <ForPatientsSection />
      <HomepageCTA />
    </div>
  );
}
