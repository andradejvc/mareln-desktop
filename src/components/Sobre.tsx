import Image from "next/image";

export default function Sobre() {
  return (
    <section
      id="sobre"
      className="mx-auto grid max-w-5xl gap-8 bg-mare-creme px-5 py-12 text-gray-900 md:grid-cols-2 md:items-center"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="relative h-64 overflow-hidden rounded-2xl">
          <Image src="/image/segunda-img.jpg" alt="Pessoas em um evento" fill className="object-cover" />
        </div>
        <div className="relative h-64 overflow-hidden rounded-2xl">
          <Image src="/image/terceira-img.jpg" alt="Palmeira na praia" fill className="object-cover" />
        </div>
      </div>

      <p className="text-center text-xl uppercase leading-relaxed md:text-2xl">
        “<strong>MARÉ<span className="text-mare-laranja">LN</span></strong>: a sua
        plataforma para descobrir e vivenciar todos os eventos gratuitos do litoral
        norte de SP.”
      </p>
    </section>
  );
}