import Image from "next/image";
import Link from "next/link";
import OndaDivisor from "@/components/landing/OndaDivisor";

export default function Hero() {
  return (
    <section>
      {/* Foto */}
      <div className="relative h-105 md:h-170">
        <Image
          src="/image/primeira-img.jpg"
          alt="Praia do litoral norte"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* Filtro laranja (só no desktop) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden bg-mare-laranja/20 mix-blend-multiply md:block"
        />
        {/* Degradê laranja na parte de baixo (só no desktop) */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 hidden h-1/4 bg-linear-to-t from-mare-laranja/60 to-transparent md:block"
        />

        {/* Onda na base da foto (só no desktop) */}
        <OndaDivisor className="absolute inset-x-0 -bottom-px z-10 hidden h-10 w-full text-mare-creme md:block md:h-16" />

        <div className="relative z-10 flex flex-col items-center pt-20 text-center md:pt-48">
          <h1 className="font-titulo text-6xl leading-none text-mare-laranja md:text-8xl lg:text-[10rem]">
            Maré LN
          </h1>
          <p className="mt-3 text-lg text-gray-800 md:mt-4 md:text-2xl md:text-white">
            Levando você a descobrir o litoral
          </p>

          {/* Botão só no desktop */}
          <Link
            href="/explorar"
            className="mt-8 hidden rounded-full bg-white px-10 py-3 font-[family-name:var(--font-elsie)] font-black text-mare-laranja md:inline-block"
          >
            Explorar agora
          </Link>
        </div>
      </div>

      {/* Faixa rosa só no celular */}
      <div className="relative -mt-10 md:hidden">
        {/* Listra fina paralela ao topo da faixa */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-4 h-12 bg-mare-rosa [clip-path:polygon(0_30px,100%_0,100%_8px,0_38px)]"
        />

        {/* Faixa principal, inclinada em cima e embaixo */}
        <div className="bg-mare-rosa px-6 pb-20 pt-24 text-center [clip-path:polygon(0_30px,100%_0,100%_calc(100%_-_40px),0_100%)]">
          <Link
            href="/login"
            className="inline-block rounded-xl bg-mare-creme px-14 py-3 font-[family-name:var(--font-elsie)] text-3xl font-black text-mare-rosa"
          >
            Acessar
          </Link>

          {/* Linha branca embaixo do botão */}
          <span
            aria-hidden="true"
            className="mx-auto mt-5 block h-0.75 w-36 rounded-full bg-white"
          />
        </div>
      </div>
    </section>
  );
}