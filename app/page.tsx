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
import BackgroundGradientAnimation from "./components/landing/BackgroundGradientAnimation";

export default function Home() {
  return (
    <>
      {/* Full-page animated gradient mesh — behind everything */}
      <BackgroundGradientAnimation />

      {/* All page content — above the background */}
      <div className="relative" style={{ zIndex: 1 }}>
        <Navbar />
        <main>
          <Hero />
          <Features />
          <GradientBand />
          <HowItWorks />
          <Integrations />
          <Testimonials />
          <Pricing />
          <CTA />
        </main>
        <Footer />
      </div>
    </>
  );
}
