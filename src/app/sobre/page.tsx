
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Waves, Users } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
    title: "Sobre nós | Maré LN",
    description:
        "Conheça a Maré LN, uma plataforma para descobrir eventos, cultura e experiências no Litoral Norte de São Paulo.",
};

const equipe = [
    {
        numero: "01",
        nome: "Ana B. Maya",
        github: "acomnene-source",
        foto: "/image/equipe/pessoa-1.jpg",
    },
    {
        numero: "02",
        nome: "Jean Brito",
        github: "jeanbrito-dev",
        foto: "/image/equipe/pessoa-2.jpg",
    },
    {
        numero: "03",
        nome: "João Andrade",
        github: "andradejvc",
        foto: "/image/equipe/pessoa-3.jpg",
    },
    {
        numero: "04",
        nome: "Reinan Santos",
        github: "reeincs",
        foto: "/image/equipe/pessoa-4.jpg",
    },
    {
        numero: "05",
        nome: "Yasmin Rodrigues",
        github: "yayars",
        foto: "/image/equipe/pessoa-5.jpg",
    },
];

function GithubIcon({ size = 17 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
        >
            <path d="M12 .297a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.72.08-.72 1.2.08 1.83 1.23 1.83 1.23 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.4s2.04.13 3 .4c2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.62-2.8 5.64-5.48 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .297" />
        </svg>
    );
}

export default function SobrePage() {
    return (
        <>
            <Navbar />

            <main className="overflow-hidden bg-mare-creme">
                {/* HERO */}
                <section className="relative isolate flex min-h-[470px] items-center md:min-h-[570px]">
                    <div className="absolute inset-0 -z-10">
                        <Image
                            src="/image/primeira-img.jpg"
                            alt="Paisagem do litoral norte de São Paulo"
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover"
                        />

                        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/55 to-stone-950/20" />
                    </div>

                    <div className="mx-auto w-full max-w-6xl px-5 py-20 md:px-10 md:py-28">
                        <div className="max-w-3xl text-white">

                            <h1 className="font-titulo mt-7 text-5xl leading-[1.08] md:text-7xl">
                                O litoral tem muito para viver.
                                <span className="mt-2 block text-orange-300">
                                    A gente ajuda você a descobrir.
                                </span>
                            </h1>

                            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/90 md:text-xl">
                                Uma plataforma para encontrar eventos, conhecer iniciativas
                                locais e aproveitar tudo o que acontece no Litoral Norte de São
                                Paulo.
                            </p>

                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href="/login?returnTo=/explorar"
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-mare-laranja px-7 py-3.5 font-bold text-white transition hover:-translate-y-0.5 hover:bg-orange-700"
                                >
                                    Explorar eventos
                                    <ArrowRight size={18} aria-hidden="true" />
                                </Link>

                                <Link
                                    href="/registro"
                                    className="inline-flex items-center justify-center rounded-full border border-white/70 px-7 py-3.5 font-bold text-white transition hover:bg-white hover:text-stone-900"
                                >
                                    Criar minha conta
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* NOSSA IDEIA */}
                <section className="px-5 py-20 md:px-10 md:py-28">
                    <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.85fr_1.15fr] md:items-center">
                        <div>
                            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-mare-rosa">
                                Nossa ideia
                            </p>

                            <h2 className="font-titulo mt-4 text-4xl leading-tight text-stone-900 md:text-5xl">
                                Mais perto do que acontece por aqui.
                            </h2>

                            <div className="mt-6 h-1.5 w-20 rounded-full bg-mare-laranja" />
                        </div>

                        <div className="space-y-5 text-base leading-relaxed text-stone-700 md:text-lg">
                            <p>
                                A Maré LN nasceu com uma proposta simples: tornar mais fácil
                                descobrir o que acontece no Litoral Norte de São Paulo. Em vez
                                de procurar informações em vários lugares, o público pode
                                encontrar diferentes tipos de programação em um só ambiente.
                            </p>

                            <p>
                                Reunimos oportunidades de música, cultura, esporte, natureza,
                                feiras e gastronomia para incentivar as pessoas a conhecerem
                                melhor a região e participarem da vida local.
                            </p>

                            <p className="font-semibold text-stone-900">
                                Acreditamos que cada evento pode ser o começo de uma nova
                                descoberta, de um encontro ou de uma boa memória.
                            </p>
                        </div>
                    </div>
                </section>

                {/* NOSSA EQUIPE */}
                <section className="bg-[#2f2622] px-5 py-20 text-white md:px-10 md:py-24">
                    <div className="mx-auto max-w-6xl">
                        <div className="mx-auto max-w-2xl text-center">
                            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white/10 text-orange-300">
                                <Users size={27} aria-hidden="true" />
                            </span>

                            <p className="mt-6 text-sm font-extrabold uppercase tracking-[0.18em] text-orange-300">
                                Quem faz acontecer
                            </p>

                            <h2 className="font-titulo mt-3 text-4xl md:text-5xl">
                                Nossa equipe
                            </h2>

                            <p className="mt-4 leading-relaxed text-white/70 md:text-lg">
                                Por trás da Maré LN, cinco pessoas unidas por uma ideia:
                                aproximar você de tudo o que acontece no Litoral Norte.
                            </p>
                        </div>

                        <div className="team-grid mt-14 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
                            {equipe.map((pessoa) => (
                                <article key={pessoa.numero} className="team-card">
                                    <div
                                        role="group"
                                        aria-label={`Foto de ${pessoa.nome}`}
                                        className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/15 bg-stone-700 bg-cover bg-center"
                                        style={{
                                            backgroundImage: `linear-gradient(to top, rgba(28, 25, 23, 0.95), rgba(28, 25, 23, 0.02) 75%), url("${pessoa.foto}")`,
                                        }}
                                    >
                                        <div className="absolute inset-x-0 bottom-0 p-4">
                                            <span className="text-xs font-bold tracking-widest text-orange-300">
                                                {pessoa.numero}
                                            </span>

                                            <h3 className="mt-1 font-titulo text-lg text-white">
                                                {pessoa.nome}
                                            </h3>

                                            <a
                                                href={`https://github.com/${pessoa.github}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={`GitHub de ${pessoa.nome}: ${pessoa.github}`}
                                                className="team-github mt-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
                                            >
                                                <GithubIcon size={16} />
                                                <span>@{pessoa.github}</span>
                                            </a>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <p className="mt-8 text-center text-xs text-white/50">
                            Cinco pessoas, uma ideia e um projeto em comum.
                        </p>
                    </div>
                </section>

                {/* CHAMADA FINAL */}
                <section className="px-5 py-20 md:px-10 md:py-28">
                    <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-mare-rosa px-6 py-14 text-center text-white md:px-16 md:py-20">
                        <div
                            aria-hidden="true"
                            className="absolute -right-12 -top-20 size-64 rounded-full border-[36px] border-white/10"
                        />

                        <div
                            aria-hidden="true"
                            className="absolute -bottom-28 -left-10 size-72 rounded-full border-[42px] border-white/10"
                        />

                        <div className="relative mx-auto max-w-2xl">
                            <Waves
                                size={30}
                                className="mx-auto text-orange-100"
                                aria-hidden="true"
                            />

                            <h2 className="font-titulo mt-5 text-4xl leading-tight md:text-5xl">
                                Sua próxima experiência pode estar mais perto do que imagina.
                            </h2>

                            <p className="mt-5 leading-relaxed text-white/90 md:text-lg">
                                Explore a programação, encontre algo novo e viva o Litoral
                                Norte de um jeito diferente.
                            </p>

                            <Link
                                href="/login?returnTo=/explorar"
                                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 font-bold text-mare-rosa transition hover:-translate-y-0.5 hover:bg-orange-50"
                            >
                                Descobrir eventos
                                <ArrowRight size={18} aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
