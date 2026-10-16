import Navbar from "@/components/Navbar";
import Hero from "@/components/landing/Hero";
import Sobre from "@/components/landing/Sobre";
import Eventos from "@/components/landing/Eventos";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Sobre />
      <Eventos />
      <CTA />
      <Footer />
    </>
  );
}