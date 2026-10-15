import Image from "next/image";
import Link from "next/link";

const links = [
  { texto: "Início", href: "/" },
  { texto: "Eventos", href: "/explorar" },
  { texto: "Sobre", href: "#sobre" },
  { texto: "Contato", href: "#contato" },
];

const suporte = ["FAQ", "Política de privacidade", "Termos de uso", "Fale conosco"];

function Social({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-mare-creme text-gray-800 transition hover:scale-110"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        {children}
      </svg>
    </a>
  );
}

export default function Footer() {
  return (
    <footer id="contato" className="bg-mare-laranja px-5 pb-6 pt-14 text-white md:pt-16">
      {/* MOBILE */}
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 text-center md:hidden">
        <div className="flex flex-col items-center">
          <Image
            src="/image/logo.jpg"
            alt="Maré LN"
            width={120}
            height={120}
            className="-my-4 h-28 w-auto"
          />
          <h3 className="mt-4 font-titulo text-3xl font-bold">Maré LN</h3>
        </div>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-lg">
          {links.map((link) =>
            link.href.startsWith("#") ? (
              <a key={link.texto} href={link.href}>
                {link.texto}
              </a>
            ) : (
              <Link key={link.texto} href={link.href}>
                {link.texto}
              </Link>
            )
          )}
        </nav>

        <div className="space-y-2 text-lg">
          <p>contato@marelin.com.br</p>
          <p>@marelin</p>
          <p>(12) 99999-0000</p>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="mx-auto hidden max-w-6xl grid-cols-4 gap-8 md:grid">
        {/* Marca */}
        <div>
          <h3 className="text-xl font-bold italic">Maré LN</h3>
          <p className="mt-3 max-w-56 text-sm leading-relaxed">
            Conectando você aos melhores eventos e experiências.
          </p>
        </div>

        {/* Navegação */}
        <div>
          <h4 className="font-titulo text-sm font-bold">Navegação</h4>
          <ul className="mt-3 space-y-2 text-sm">
            {links.map((link) => (
              <li key={link.texto}>
                {link.href.startsWith("#") ? (
                  <a href={link.href}>{link.texto}</a>
                ) : (
                  <Link href={link.href}>{link.texto}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Suporte */}
        <div>
          <h4 className="font-titulo text-sm font-bold">Suporte</h4>
          <ul className="mt-3 space-y-2 text-sm">
            {suporte.map((item) => (
              <li key={item}>
                <Link href="#">{item}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Redes sociais */}
        <div>
          <h4 className="font-titulo text-sm font-bold">Siga-nos</h4>
          <div className="mt-3 flex gap-3">
            <Social href="#" label="Instagram">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
            </Social>
            <Social href="#" label="Facebook">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </Social>
            <Social href="#" label="TikTok">
              <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
              <path d="M14 3c.4 2.6 2.1 4.1 5 4.3" />
            </Social>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-12 max-w-6xl border-t border-white/30 pt-5 text-center text-xs md:text-sm">
        © 2026 Maré LN. Todos os direitos reservados.
      </p>
    </footer>
  );
}