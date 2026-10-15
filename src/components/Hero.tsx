import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section>
      {/* Parte da foto */}
      <div className="relative h-105 md:h-140">
        <Image
          src="/image/primeira-img.jpg"
          alt="Praia do litoral norte"
          fill
          priority
          className="object-cover"
        />
        <div className="relative z-10 flex flex-col items-center pt-20 text-center md:pt-32">
          <h1 className="font-titulo text-5xl font-bold text-mare-laranja md:text-8xl">Maré LN</h1>
          <p className="mt-2 text-lg text-gray-800 md:text-2xl">
            Levando você a descobrir o litoral
          </p>
        </div>
      </div>

      {/* Faixa rosa inclinada com o botão */}
      <div className="-mt-10 bg-mare-rosa px-6 pb-16 pt-24 text-center [clip-path:polygon(0_12%,100%_0,100%_100%,0_100%)]">
        <Link
          href="/login"
          className="font-titulo inline-block rounded-xl bg-mare-creme px-14 py-3 text-3xl font-bold text-mare-laranja"
        >
          Acessar
        </Link>
      </div>
    </section>
  );
}