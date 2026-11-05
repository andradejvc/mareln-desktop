
const BANCO = "mareln-perfil";
const COLECAO = "fotos";

function abrirBanco(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("O armazenamento de fotos não está disponível."));
      return;
    }

    const requisicao = indexedDB.open(BANCO, 1);

    requisicao.onupgradeneeded = () => {
      const banco = requisicao.result;

      if (!banco.objectStoreNames.contains(COLECAO)) {
        banco.createObjectStore(COLECAO);
      }
    };

    requisicao.onsuccess = () => resolve(requisicao.result);
    requisicao.onerror = () =>
      reject(requisicao.error ?? new Error("Não foi possível abrir o banco."));
  });
}

export async function lerFotoPerfil(chave: string): Promise<Blob | null> {
  const banco = await abrirBanco();

  try {
    return await new Promise((resolve, reject) => {
      const transacao = banco.transaction(COLECAO, "readonly");
      const requisicao = transacao.objectStore(COLECAO).get(chave);

      requisicao.onsuccess = () => {
        const resultado = requisicao.result;
        resolve(resultado instanceof Blob ? resultado : null);
      };

      requisicao.onerror = () =>
        reject(requisicao.error ?? new Error("Não foi possível ler a foto."));
    });
  } finally {
    banco.close();
  }
}

export async function salvarFotoPerfil(
  chave: string,
  arquivo: Blob,
): Promise<void> {
  const banco = await abrirBanco();

  try {
    await new Promise<void>((resolve, reject) => {
      const transacao = banco.transaction(COLECAO, "readwrite");
      transacao.objectStore(COLECAO).put(arquivo, chave);

      transacao.oncomplete = () => resolve();
      transacao.onerror = () =>
        reject(transacao.error ?? new Error("Não foi possível salvar a foto."));
      transacao.onabort = () =>
        reject(transacao.error ?? new Error("O salvamento da foto foi cancelado."));
    });
  } finally {
    banco.close();
  }
}

export async function removerFotoPerfil(chave: string): Promise<void> {
  const banco = await abrirBanco();

  try {
    await new Promise<void>((resolve, reject) => {
      const transacao = banco.transaction(COLECAO, "readwrite");
      transacao.objectStore(COLECAO).delete(chave);

      transacao.oncomplete = () => resolve();
      transacao.onerror = () =>
        reject(transacao.error ?? new Error("Não foi possível remover a foto."));
      transacao.onabort = () =>
        reject(transacao.error ?? new Error("A remoção da foto foi cancelada."));
    });
  } finally {
    banco.close();
  }
}
