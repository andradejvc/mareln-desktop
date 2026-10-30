import { cidades, type Cidade } from "@/data/eventos";
import { IconeCidade } from "./iconesCidades";

type Props = {
  selecionada: Cidade | null;
  onSelecionar: (cidade: Cidade | null) => void;
};

// Caixa laranja com as 4 cidades: 2x2 no celular, 4 em linha no desktop.
// Clicar de novo na cidade ativa limpa o filtro.
export default function FiltroCidades({ selecionada, onSelecionar }: Props) {
  return (
    <div
      role="group"
      aria-label="Filtrar por cidade"
      className="grid grid-cols-2 gap-2.5 rounded-xl bg-mare-laranja p-3.5 lg:flex lg:flex-wrap lg:items-center lg:justify-center lg:gap-4 lg:rounded-2xl lg:px-6 lg:py-4 lg:shadow-md lg:shadow-orange-900/20"
    >
      {cidades.map((c) => {
        const ativa = selecionada === c;
        return (
          <button
            key={c}
            type="button"
            aria-pressed={ativa}
            onClick={() => onSelecionar(ativa ? null : c)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-stone-900 shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:w-44 ${
              ativa ? "bg-white ring-2 ring-mare-rosa" : "bg-orange-100 hover:bg-orange-50"
            }`}
          >
            <span className="shrink-0 text-mare-rosa">
              <IconeCidade cidade={c} size={20} />
            </span>
            <span className="flex-1 text-center">{c}</span>
          </button>
        );
      })}
    </div>
  );
}