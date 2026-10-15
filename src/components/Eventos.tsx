import Image from "next/image";
import OndaDivisor from "@/components/OndaDivisor";

// Cards do MOBILE
const categorias = [
  { titulo: "MUSICAL", imagem: "/image/musical.jpg" },
  { titulo: "CULTURA", imagem: "/image/cultura.jpg" },
  { titulo: "ESPORTES", imagem: "/image/esportes.jpg" },
  { titulo: "FEIRAS", imagem: "/image/feiras.jpg" },
];

// Cards do DESKTOP
const experiencias = [
  { titulo: "Show ao pôr do sol", descricao: "Música, praia e boa vibe", local: "Jericoacoara, CE", imagem: "/image/show-por-do-sol.jpg" },
  { titulo: "Vida noturna", descricao: "Bares e baladas", local: "Florianópolis, SC", imagem: "/image/vida-noturna.jpg" },
  { titulo: "Passeio de barco", descricao: "Explore ilhas paradisíacas", local: "Rio Grande, RJ", imagem: "/image/passeio-barco.jpg" },
  { titulo: "Aulas de surf", descricao: "Aventura e adrenalina", local: "Itacaré, BA", imagem: "/image/aulas-surf.jpg" },
  { titulo: "Trilhas e cachoeiras", descricao: "Conecte-se com a natureza", local: "Chapada dos Veadeiros, GO", imagem: "/image/trilhas.jpg" },
  { titulo: "Cultura local", descricao: "História, arte e gastronomia", local: "Olinda, PE", imagem: "/image/cultura-local.jpg" },
];

function IconePin() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}

function OndaTitulo({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 90 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
    >
      <path d="M2 6c6-6 11-6 17 0s11 6 17 0 11-6 17 0 11 6 17 0 11-6 17 0" />
    </svg>
  );
}

export default function Eventos() {
  return (
    <section className="relative rounded-t-[60px] bg-mare-laranja px-5 py-12 md:rounded-none md:py-20">
      {/* Onda no topo (só no desktop) */}
      <OndaDivisor className="absolute inset-x-0 bottom-full hidden h-10 w-full translate-y-px text-mare-laranja md:block md:h-16" />

      {/* MOBILE */}
      <div className="md:hidden">
        <h2 className="mb-8 text-center font-titulo text-4xl font-semibold text-white">EVENTOS</h2>

        <div className="flex flex-col gap-5">
          {categorias.map((cat, i) => (
            <div
              key={cat.titulo}
              className={`flex overflow-hidden rounded-xl bg-white/20 ${
                i % 2 === 1 ? "flex-row-reverse" : ""
              }`}
            >
              <div className="relative h-32 w-1/2">
                <Image src={cat.imagem} alt={cat.titulo} fill className="object-cover" />
              </div>
              <div className="flex w-1/2 flex-col justify-center p-4 text-center text-white">
                <h3 className="font-titulo text-xl">{cat.titulo}</h3>
                <p className="mt-2 text-xs uppercase">
                  Shows incríveis e experiências que ficam na memória.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DESKTOP */}
      <div className="mx-auto hidden max-w-6xl md:block">
        <h2 className="text-center font-titulo text-4xl text-white">Experiências populares</h2>
        <OndaTitulo className="mx-auto mt-3 w-20 text-white" />

        <div className="mt-12 grid grid-cols-3 gap-6">
          {experiencias.map((exp) => (
            <article key={exp.titulo} className="overflow-hidden rounded-2xl bg-white/15">
              <div className="relative aspect-[9/4]">
                <Image src={exp.imagem} alt={exp.titulo} fill className="object-cover" />
              </div>
              <div className="p-4 text-white">
                <h3 className="text-base font-bold">{exp.titulo}</h3>
                <p className="mt-1 text-sm text-white/80">{exp.descricao}</p>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-white/70">
                  <IconePin />
                  {exp.local}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}