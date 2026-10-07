// Os estabelecimentos A, B, C e D sempre existem; a pessoa pode cadastrar outros depois deles.
export const FIXOS = 4

export const letraEstab = (i) => (i < 26 ? String.fromCharCode(65 + i) : String(i + 1))
export const nomePadrao = (i) => `Estabelecimento ${letraEstab(i)}`
