import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-mare-creme px-5 py-16 text-center">
      <h2 className="font-titulo text-4xl font-bold text-mare-laranja md:text-6xl">
        Pronto para viver o litoral?
      </h2>
      <p className="mx-auto mt-6 max-w-md text-gray-700">
        Crie sua conta gratuita e não perca nenhum evento perto de você.
      </p>
      <Link
        href="/registro"
        className="font-titulo mt-8 inline-block rounded-2xl bg-mare-rosa px-12 py-4 text-2xl font-bold text-white"
      >
        Criar conta
      </Link>
    </section>
  );
}