import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <h1>404</h1>
      <p>Essa página não existe 🌊</p>
      <Link href="/">Voltar para o início</Link>
    </main>
  );
}