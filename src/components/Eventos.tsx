import Image from "next/image";

const categorias = [
  { titulo: "MUSICAL", imagem: "/image/musical.jpg" },
  { titulo: "CULTURA", imagem: "/image/cultura.jpg" },
  { titulo: "ESPORTES", imagem: "/image/esportes.jpg" },
  { titulo: "FEIRAS", imagem: "/image/feiras.jpg" },
];

export default function Eventos() {
  return (
    <section className="rounded-t-[60px] bg-mare-laranja px-5 py-12">
      <h2 className="font-titulo mb-8 text-center text-4xl font-semibold text-white">EVENTOS</h2>

      <div className="mx-auto flex max-w-5xl flex-col gap-5 md:grid md:grid-cols-2">
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
              <h3 className="text-xl">{cat.titulo}</h3>
              <p className="mt-2 text-xs uppercase">
                Shows incríveis e experiências que ficam na memória.
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}