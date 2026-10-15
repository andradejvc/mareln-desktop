import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-mare-creme px-5 py-16 text-center md:py-24">
      <h2 className="font-titulo text-4xl font-bold text-mare-laranja md:text-6xl md:text-mare-rosa">
        Pronto para <br className="hidden md:block" />
        viver o litoral?
      </h2>
      <p className="mx-auto mt-6 max-w-md text-gray-700 md:mt-4 md:text-xl md:text-gray-900">
        Crie sua conta gratuita e não perca nenhum evento perto de você.
      </p>
      <Link
        href="/registro"
        className="mt-8 inline-block rounded-2xl bg-mare-rosa px-12 py-4 font-titulo text-2xl font-bold text-white md:rounded-xl md:px-10 md:py-3 md:text-xl"
      >
        Criar conta
      </Link>
    </section>
  );
}