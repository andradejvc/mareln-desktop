import Image from "next/image";

function Onda({ className = "" }: { className?: string }) {
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

export default function Sobre() {
  return (
    <section id="sobre" className="bg-mare-creme text-gray-900">
      <div className="mx-auto grid max-w-5xl gap-10 px-5 py-12 md:grid-cols-2 md:items-center md:py-20">
        {/* Fotos sobrepostas */}
        <div className="relative mx-auto aspect-[303/355] w-full max-w-sm md:order-2 md:max-w-md">
          <div
            aria-hidden="true"
            className="absolute left-[16%] top-[15%] h-[13%] w-[20%] rounded-tl-full bg-mare-laranja"
          />
          <div
            aria-hidden="true"
            className="absolute left-[61%] top-[67%] h-[14%] w-[23%] rounded-br-full bg-mare-laranja"
          />

          <div className="absolute right-0 top-0 h-[67%] w-[64%] overflow-hidden rounded-2xl">
            <Image src="/image/terceira-img.jpg" alt="Palmeira na praia" fill className="object-cover" />
          </div>

          <div className="absolute bottom-0 left-0 h-[72%] w-[61%] overflow-hidden rounded-2xl border-8 border-mare-creme">
            <Image src="/image/segunda-img.jpg" alt="Pessoas em um evento" fill className="object-cover" />
          </div>
        </div>

        {/* Mobile: frase em maiúsculas */}
        <p className="text-center text-xl uppercase leading-relaxed md:hidden">
          “<strong>MARÉ<span className="text-mare-laranja">LN</span></strong>: a sua
          plataforma para descobrir e vivenciar todos os eventos gratuitos do litoral
          norte de SP.”
        </p>

        {/* Desktop: bloco "Sobre nós" */}
        <div className="hidden md:block">
          <h2 className="font-titulo text-3xl text-mare-laranja">Sobre nós</h2>
          <Onda className="mt-1 w-24 text-mare-laranja" />

          <h3 className="mt-6 text-4xl font-bold">Sua jornada começa aqui</h3>
          <p className="mt-4 max-w-md leading-relaxed text-gray-700">
            A Maré LN nasceu para transformar eventos em memórias. Oferecemos shows,
            cultura, esportes e feiras gratuitas que conectam você ao melhor do litoral
            norte de SP.
          </p>

          <p className="mt-6 flex items-center gap-2 font-titulo text-xl text-mare-rosa">
            <Onda className="w-7" />
            Viaje. Descubra. Viva.
          </p>
        </div>
      </div>
    </section>
  );
}