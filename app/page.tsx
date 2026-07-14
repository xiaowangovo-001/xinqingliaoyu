import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { WisemanShowcase } from '@/components/landing/WisemanShowcase';
import { CTASection } from '@/components/landing/CTASection';

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <HowItWorks />
      <WisemanShowcase />
      <CTASection />
    </main>
  );
}
