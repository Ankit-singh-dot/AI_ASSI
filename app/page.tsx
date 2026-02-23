import Navbar from "./components/landing/Navbar";
import Hero from "./components/landing/Hero";
import Features from "./components/landing/Features";
import GradientBand from "./components/landing/GradientBand";
import HowItWorks from "./components/landing/HowItWorks";
import Integrations from "./components/landing/Integrations";
import Testimonials from "./components/landing/Testimonials";
import Pricing from "./components/landing/Pricing";
import CTA from "./components/landing/CTA";
import Footer from "./components/landing/Footer";
import Beams from "../components/Beams";
import FlowingMenu from "./components/landing/FlowingMenu";

const demoItems = [
  { link: '#features', text: 'Features', image: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2832&auto=format&fit=crop' },
  { link: '#how-it-works', text: 'How It Works', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2864&auto=format&fit=crop' },
  { link: '#pricing', text: 'Pricing', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop' },
  { link: '/dashboard', text: 'Dashboard', image: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2870&auto=format&fit=crop' }
];

export default function Home() {
  return (
    <>
      <main className="min-h-screen bg-void text-text-primary selection:bg-white/20 relative" suppressHydrationWarning>
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <Beams
            beamWidth={2}
            beamHeight={15}
            beamNumber={12}
            lightColor="#ffffff"
            speed={2}
            noiseIntensity={1.75}
            scale={0.2}
            rotation={0}
          />
        </div>

        <div className="relative" style={{ zIndex: 1 }}>
          <Navbar />
          <Hero />

          {/* Flowing Menu Showcase directly on the page */}
          <div className="w-full h-[600px] relative border-y border-white/10 overflow-hidden bg-void/50 backdrop-blur-sm">
            <FlowingMenu
              items={demoItems}
              speed={15}
              textColor="#ffffff"
              bgColor="transparent"
              marqueeBgColor="#ffffff"
              marqueeTextColor="#030303"
              borderColor="rgba(255,255,255,0.1)"
            />
          </div>

          <Features />
          <GradientBand />
          <HowItWorks />
          <Integrations />
          <Testimonials />
          <Pricing />
          <CTA />
          <Footer />
        </div>
      </main>
    </>
  );
}
