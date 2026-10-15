import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between bg-mare-laranja px-5 py-3">
      <Image src="/image/logo.jpg" alt="Maré LN" width={100} height={40} />

      {/* Links: aparecem só a partir do desktop (md) */}
      <nav className="hidden gap-8 text-white md:flex">
        <Link href="/">Início</Link>
        <Link href="/explorar">Eventos</Link>
        <Link href="#sobre">Sobre</Link>
        <Link href="#contato">Contato</Link>
      </nav>

      {/* Ícone do menu: aparece só no celular */}
      <button className="text-white md:hidden" aria-label="Abrir menu">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>
    </header>
  );
}