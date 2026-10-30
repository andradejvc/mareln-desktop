import type { ReactNode } from "react";
import type { Cidade } from "@/data/eventos";

function Svg({ size, children }: { size: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// Sol nascendo sobre as ondas
const Sol = ({ size }: { size: number }) => (
  <Svg size={size}>
    <path d="M7 15a5 5 0 0 1 10 0" />
    <path d="M12 5v2M5 8l1.4 1.4M19 8l-1.4 1.4M2.5 15H4M20 15h1.5" />
    <path d="M3 19c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0 3 1.2 4.5 0" />
  </Svg>
);

// Carro (a balsa/estrada para São Sebastião)
const Carro = ({ size }: { size: number }) => (
  <Svg size={size}>
    <path d="M5 16v-4l1.7-4.3a2 2 0 0 1 1.9-1.2h6.8a2 2 0 0 1 1.9 1.2L19 12v4" />
    <path d="M3.5 16h17v2.5a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5V16ZM5 12h14" />
    <circle cx="8" cy="15.5" r="0.8" />
    <circle cx="16" cy="15.5" r="0.8" />
  </Svg>
);

// Veleiro
const Veleiro = ({ size }: { size: number }) => (
  <Svg size={size}>
    <path d="M12 3v13" />
    <path d="M12 4c4 2 6 6 6 11h-6" />
    <path d="M10.5 7C7.5 9 6.5 12 6.5 15h4" />
    <path d="M4 18h16l-2.5 3h-11L4 18Z" />
  </Svg>
);

// Guarda-sol
const GuardaSol = ({ size }: { size: number }) => (
  <Svg size={size}>
    <path d="M3 12a9 9 0 0 1 18 0H3Z" />
    <path d="M12 12v7a2 2 0 0 0 4 0" />
    <path d="M12 3v-.5" />
  </Svg>
);

const porCidade: Record<Cidade, (p: { size: number }) => ReactNode> = {
  Caraguatatuba: Sol,
  "São Sebastião": Carro,
  Ilhabela: Veleiro,
  Ubatuba: GuardaSol,
};

export function IconeCidade({ cidade, size = 22 }: { cidade: Cidade; size?: number }) {
  const Icone = porCidade[cidade];
  return <Icone size={size} />;
}