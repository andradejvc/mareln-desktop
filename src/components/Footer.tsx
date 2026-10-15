import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer id="contato" className="bg-mare-laranja px-5 py-10 text-center text-white">
      <Image src="/image/logo.jpg" alt="Maré LN" width={80} height={32} className="mx-auto" />
      <h3 className="mt-4 text-2xl font-semibold">Maré LN</h3>

      <nav className="mt-4 flex justify-center gap-4 text-sm">
        <Link href="/">Início</Link>
        <Link href="/explorar">Eventos</Link>
        <Link href="#sobre">Sobre</Link>
        <Link href="#contato">Contato</Link>
      </nav>

      <p className="mt-6 text-sm">contato@marelin.com.br</p>
      <p className="text-sm">@marelin • (12) 99999-0000</p>

      <p className="mt-8 border-t border-white/30 pt-4 text-xs">
        © 2026 Maré LN. Todos os direitos reservados.
      </p>
    </footer>
  );
}