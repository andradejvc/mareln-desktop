export type DetalhesEvento = {
  descricao: string[];
  recomendacoes: string[];
};

// Textos editoriais iniciais, elaborados a partir do título, categoria e local
// dos eventos de demonstração. Devem ser revisados com a organização antes
// de serem tratados como informações oficiais de um evento real.
export const detalhesEventos: Record<number, DetalhesEvento> = {
  1: {
    descricao: [
      "Uma programação dedicada ao jazz em um cenário de praia. O evento convida o público a aproveitar apresentações musicais e a atmosfera do litoral na Praia Grande de Ubatuba.",
      "Uma opção para quem gosta de música ao vivo e quer incluir uma experiência cultural no passeio pela cidade.",
    ],
    recomendacoes: [
      "Confira previamente a programação e a duração das apresentações com a organização.",
      "Chegue com antecedência e combine um ponto de encontro.",
      "Leve proteção solar ou um agasalho conforme o horário e a previsão do tempo.",
    ],
  },
  2: {
    descricao: [
      "Feira voltada ao artesanato local, reunindo trabalhos manuais e produtos de pequenos expositores na Praça Cândido Mota, em Caraguatatuba.",
      "A proposta é valorizar a produção artesanal da região e oferecer ao público um espaço para conhecer diferentes trabalhos e iniciativas locais.",
    ],
    recomendacoes: [
      "Leve uma bolsa reutilizável para acomodar possíveis compras.",
      "Confirme com cada expositor as formas de pagamento disponíveis.",
      "Reserve tempo para circular pelos estandes sem bloquear as passagens.",
    ],
  },
  3: {
    descricao: [
      "Encontro com temática de forró pé de serra na Praça de Eventos do Galeão, em Ilhabela. A proposta é aproveitar a música e a dança em clima de celebração.",
      "Uma opção para quem gosta de ritmos brasileiros e quer aproveitar uma atividade cultural na cidade.",
    ],
    recomendacoes: [
      "Use roupas e calçados confortáveis para dançar.",
      "Consulte a organização sobre horário e estrutura do evento.",
      "Planeje o transporte de ida e volta com antecedência.",
    ],
  },
  4: {
    descricao: [
      "Atividade ao ar livre na região do Parque Estadual da Serra do Mar, em Ubatuba. O percurso tem proposta de contato com a Mata Atlântica e observação da paisagem natural.",
      "A experiência é voltada a quem deseja caminhar e conhecer melhor o ambiente da região, sempre respeitando as orientações de conservação e segurança.",
    ],
    recomendacoes: [
      "Use tênis ou bota adequados para caminhada.",
      "Leve água e proteção contra sol e insetos.",
      "Siga apenas percursos autorizados e as orientações da equipe responsável.",
    ],
  },
  5: {
    descricao: [
      "Competição de vôlei de praia na Praia de Maresias, em São Sebastião. O público poderá acompanhar partidas e atividades ligadas ao esporte na areia.",
      "Uma alternativa para quem gosta de esporte e quer aproveitar o ambiente da praia durante a programação.",
    ],
    recomendacoes: [
      "Leve água e proteção solar.",
      "Prepare-se para circular pela areia e pelo entorno da praia.",
      "Confirme com a organização as regras de acesso e a programação das partidas.",
    ],
  },
  6: {
    descricao: [
      "Exposição dedicada a temas marinhos no Centro Cultural de São Sebastião, com proposta de aproximar o público de expressões artísticas ligadas ao oceano e ao litoral.",
      "Uma oportunidade de apreciar diferentes interpretações visuais e culturais do ambiente marinho.",
    ],
    recomendacoes: [
      "Consulte os horários e as regras de visitação do espaço.",
      "Evite tocar nas obras ou nos materiais expostos.",
      "Reserve tempo para percorrer a mostra com tranquilidade.",
    ],
  },
  7: {
    descricao: [
      "Aula aberta de surf na Praia da Vila, em Ubatuba. A atividade apresenta o universo do surf e propõe uma aproximação com a prática esportiva no mar.",
      "Antes de participar, é importante confirmar com a organização o formato da aula, os equipamentos necessários e as condições adequadas para a atividade.",
    ],
    recomendacoes: [
      "Confirme se é necessário levar prancha ou outro equipamento.",
      "Respeite as orientações de segurança e as condições do mar.",
      "Use proteção solar e mantenha a hidratação.",
    ],
  },
  8: {
    descricao: [
      "Encontro gastronômico na Praça da Cultura, em Caraguatatuba, com foco em conhecer diferentes opções de comida e experiências culinárias.",
      "Uma oportunidade para circular pelo espaço, descobrir sabores e aproveitar a programação gastronômica da cidade.",
    ],
    recomendacoes: [
      "Verifique preços e meios de pagamento diretamente nos estandes.",
      "Avise os responsáveis sobre alergias ou restrições alimentares.",
      "Descarte resíduos nas lixeiras adequadas e mantenha o espaço organizado.",
    ],
  },
  9: {
    descricao: [
      "Evento inspirado pela cultura do surf em Maresias, São Sebastião. A proposta é reunir pessoas interessadas no esporte e no estilo de vida ligado ao mar.",
      "Consulte a programação oficial para saber quais atividades estarão disponíveis durante o festival.",
    ],
    recomendacoes: [
      "Confira a programação e os horários antes de sair.",
      "Leve água e proteção solar.",
      "Respeite as orientações de segurança da praia e da organização.",
    ],
  },
  10: {
    descricao: [
      "Feira no Centro de Ubatuba com foco em produtos e iniciativas de comércio local. Uma oportunidade para circular, conhecer expositores e apoiar a economia da cidade.",
      "Os detalhes sobre os produtos disponíveis e as condições de compra devem ser confirmados diretamente com os participantes da feira.",
    ],
    recomendacoes: [
      "Leve uma bolsa reutilizável para as compras.",
      "Confirme as formas de pagamento com cada expositor.",
      "Mantenha livres as áreas de circulação.",
    ],
  },
  11: {
    descricao: [
      "Atividade de subida ao Morro Santo Antônio, em Caraguatatuba, com proposta de aproveitar a paisagem no fim da tarde.",
      "A experiência depende das condições de acesso e do clima. Verifique previamente as orientações locais antes de iniciar o percurso.",
    ],
    recomendacoes: [
      "Use calçado adequado para caminhar em terreno irregular.",
      "Leve água e comece o percurso com tempo suficiente antes do anoitecer.",
      "Não ultrapasse áreas sinalizadas ou restritas.",
    ],
  },
  12: {
    descricao: [
      "Apresentação musical ligada à comemoração do aniversário de Ilhabela, na Praça de Eventos do Galeão.",
      "Uma programação para celebrar a cidade por meio da música. A atração e os detalhes de acesso devem ser conferidos nos canais oficiais do evento.",
    ],
    recomendacoes: [
      "Confira os horários e a programação divulgada pela organização.",
      "Combine um ponto de encontro caso vá acompanhado.",
      "Planeje o deslocamento e o retorno, considerando o movimento no entorno.",
    ],
  },
  13: {
    descricao: [
      "Encontro cultural dedicado às tradições caiçaras na Praça Cândido Mota, em Caraguatatuba.",
      "A proposta é valorizar referências culturais e a identidade do litoral, aproximando o público de manifestações ligadas à história da região.",
    ],
    recomendacoes: [
      "Consulte previamente a programação e os horários das atividades.",
      "Chegue com antecedência para circular pelo espaço.",
      "Respeite os participantes, as apresentações e o espaço público.",
    ],
  },
  14: {
    descricao: [
      "Atividade de caminhada na região da Praia da Almada, em Ubatuba, com foco em conhecer paisagens e ambientes naturais.",
      "Consulte previamente as condições do percurso e as orientações de acesso, especialmente por se tratar de uma atividade em ambiente natural.",
    ],
    recomendacoes: [
      "Use calçado adequado para trilha e leve água.",
      "Siga os caminhos autorizados e não deixe resíduos no percurso.",
      "Verifique as condições climáticas e as orientações locais antes de sair.",
    ],
  },
};
