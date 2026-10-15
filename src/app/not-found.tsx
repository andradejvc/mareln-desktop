import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col bg-mare-creme">
      {/* Topo laranja com borda ondulada */}
      <div className="relative h-24 bg-mare-laranja md:h-32">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-8"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 100%, #FFF8F1 31px, transparent 32px)",
            backgroundSize: "64px 32px",
            backgroundRepeat: "repeat-x",
            backgroundPosition: "center bottom",
          }}
        />
      </div>

      <div className="flex flex-1 flex-col items-center px-5 pt-10 text-center md:pt-16">
        <h1 className="font-titulo text-8xl font-bold text-mare-laranja md:text-[10rem]">
          404
        </h1>

        {/* Faixa laranja com linha fina embaixo */}
        <div className="mt-6 w-full">
          <p className="font-titulo bg-mare-laranja px-5 py-2 text-lg font-bold text-white md:text-2xl">
            Página não encontrada
          </p>
          <div className="mt-1 h-1 bg-mare-laranja" />
        </div>

        <Link
          href="/"
          className="font-titulo mt-16 rounded-2xl bg-mare-laranja px-8 py-3 text-xs font-bold uppercase text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mare-laranja md:text-sm"
        >
          Voltar para o início
        </Link>
      </div>
    </main>
  );
}