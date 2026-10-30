import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-mare-creme px-5 py-40 text-center md:py-50">
      <h2 className="font-titulo text-5xl leading-tight text-mare-laranja md:text-7xl md:text-mare-rosa lg:text-8xl">
        Pronto para <br className="hidden md:block" />
        viver o litoral?
      </h2>
      <p className="mx-auto mt-6 max-w-md text-gray-700 md:mt-4 md:text-xl md:text-gray-900">
        Crie sua conta gratuita e não perca nenhum evento perto de você.
      </p>
      <Link
        href="/registro"
        className="mt-8 inline-block rounded-2xl bg-mare-rosa px-12 py-4 font-titulo text-2xl text-white md:rounded-xl md:px-10 md:py-3 md:text-xl md:font-(family-name:--font-elsie) md:font-black"
      >
        Criar conta
      </Link>
    </section>
  );
}