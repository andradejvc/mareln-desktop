import Image from "next/image";
import Link from "next/link";

const links = [
  { texto: "Início", href: "/" },
  { texto: "Eventos", href: "/explorar" },
  { texto: "Sobre", href: "#sobre" },
  { texto: "Contato", href: "#contato" },
];

export default function Footer() {
  return (
    <footer id="contato" className="bg-mare-laranja px-5 pb-6 pt-14 text-white md:pt-20">
      <div className="mx-auto grid max-w-5xl gap-10 text-center md:grid-cols-3 md:text-left">
        {/* Marca */}
        <div className="flex flex-col items-center md:items-start">
          <Image
            src="/image/logo.jpg"
            alt="Maré LN"
            width={120}
            height={120}
            className="-my-4 h-28 w-auto md:h-32"
          />
          <h3 className="mt-4 font-titulo text-3xl font-bold">Maré LN</h3>
          <p className="mt-2 max-w-xs text-base opacity-90">
            Levando você a descobrir o litoral.
          </p>
        </div>

        {/* Navegação */}
        <div>
          <h4 className="mb-3 hidden font-titulo text-sm uppercase tracking-wider opacity-80 md:block">
            Navegação
          </h4>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-lg md:flex-col md:justify-start">
            {links.map((link) => (
              <Link key={link.texto} href={link.href}>
                {link.texto}
              </Link>
            ))}
          </nav>
        </div>

        {/* Contato */}
        <div className="space-y-2 text-lg">
          <h4 className="mb-3 hidden font-titulo text-sm uppercase tracking-wider opacity-80 md:block">
            Contato
          </h4>
          <p>contato@marelin.com.br</p>
          <p>@marelin</p>
          <p>(12) 99999-0000</p>
        </div>
      </div>

      <p className="mx-auto mt-12 max-w-5xl border-t border-white/30 pt-5 text-center text-sm">
        © 2026 Maré LN. Todos os direitos reservados.
      </p>
    </footer>
  );
}