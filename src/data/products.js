// qtd = quantidade padrão na unidade base (g, ml ou unid); label = como aparece na tabela da UCE
const raw = [
  ['Abacaxi', 1, 'unid', '1 unidade'], ['Absorvente higiênico', 10, 'unid', '10 unid.'],
  ['Açúcar', 1000, 'g', '1 kg'], ['Água sanitária', 1000, 'ml', '1 L'],
  ['Alho', 1000, 'g', '1 kg'], ['Amaciante de roupa', 500, 'ml', '500 ml'],
  ['Arroz', 1000, 'g', '1 kg'], ['Banana', 1000, 'g', '1 kg'],
  ['Barbeador', 1, 'unid', '1 unidade'], ['Batata-doce', 1000, 'g', '1 kg'],
  ['Batata inglesa', 1000, 'g', '1 kg'], ['Beterraba', 1000, 'g', '1 kg'],
  ['Biscoito cream cracker', 1000, 'g', '1 kg'], ['Biscoito comum', 1000, 'g', '1 kg'],
  ['Bolachas', 1000, 'g', '1 kg'], ['Café', 1000, 'g', '1 kg'],
  ['Carne bovina com osso', 1000, 'g', '1 kg'], ['Carne bovina sem osso', 1000, 'g', '1 kg'],
  ['Cebola', 1000, 'g', '1 kg'], ['Cenoura', 1000, 'g', '1 kg'],
  ['Colônia simples', 100, 'ml', '100 ml'], ['Condicionador de cabelo', 500, 'ml', '500 ml'],
  ['Cotonetes', 75, 'unid', '75 unid.'], ['Creme dental', 90, 'g', '90 g'],
  ['Desinfetante', 750, 'ml', '750 ml'], ['Desodorante', 90, 'ml', '90 ml'],
  ['Detergente', 500, 'ml', '500 ml'], ['Doce em barras', 1000, 'g', '1 kg'],
  ['Doce em lata', 1000, 'g', '1 kg'], ['Farinha de mandioca', 1000, 'g', '1 kg'],
  ['Farinha de trigo', 1000, 'g', '1 kg'], ['Feijão de corda', 1000, 'g', '1 kg'],
  ['Feijão mulatinho', 1000, 'g', '1 kg'], ['Feijão preto', 1000, 'g', '1 kg'],
  ['Frango congelado', 1000, 'g', '1 kg'], ['Fubá de milho', 1000, 'g', '1 kg'],
  ['Laranja', 1000, 'g', '1 kg'], ['Leite em caixa', 1000, 'ml', '1 L'],
  ['Leite in natura (leiteiro)', 1000, 'ml', '1 L'], ['Macarrão', 1000, 'g', '1 kg'],
  ['Maionese', 250, 'ml', '250 ml'], ['Margarina', 250, 'ml', '250 ml'],
  ['Óleo de algodão', 1000, 'ml', '1 L'], ['Óleo de girassol', 1000, 'ml', '1 L'],
  ['Óleo de milho', 1000, 'ml', '1 L'], ['Óleo de soja', 1000, 'ml', '1 L'],
  ['Ovos', 12, 'unid', '1 dúzia'], ['Pão doce', 1000, 'g', '1 kg'],
  ['Pão de forma', 1000, 'g', '1 kg'], ['Pão francês', 1000, 'g', '1 kg'],
  ['Papel higiênico', 1, 'unid', '1 unid.'], ['Pimentão', 1000, 'g', '1 kg'],
  ['Rapadura', 1000, 'g', '1 kg'], ['Refrigerante', 1000, 'ml', '1 L'],
  ['Sabão em barra', 1000, 'g', '1 kg'], ['Sabão em pó', 1000, 'g', '1 kg'],
  ['Sabonete', 100, 'g', '100 g'], ['Sal', 1000, 'g', '1 kg'],
  ['Shampoo', 250, 'ml', '250 ml'], ['Tempero', 1000, 'ml', '1 L'],
  ['Tomate', 1000, 'g', '1 kg'], ['Vassoura (piaçava)', 1, 'unid', '1 unidade'],
]

// Seções na ordem sugerida para percorrer a coleta. Cada produto da lista acima pertence a exatamente uma seção.
export const SECTIONS = [
  { id: 'limpeza', nome: 'Limpeza', itens: ['Água sanitária', 'Amaciante de roupa', 'Desinfetante', 'Detergente', 'Sabão em barra', 'Sabão em pó', 'Vassoura (piaçava)'] },
  { id: 'higiene', nome: 'Higiene', itens: ['Absorvente higiênico', 'Barbeador', 'Colônia simples', 'Condicionador de cabelo', 'Cotonetes', 'Creme dental', 'Desodorante', 'Papel higiênico', 'Sabonete', 'Shampoo'] },
  { id: 'carnes', nome: 'Carnes', itens: ['Carne bovina com osso', 'Carne bovina sem osso', 'Frango congelado'] },
  { id: 'padaria', nome: 'Padaria', itens: ['Pão doce', 'Pão de forma', 'Pão francês'] },
  { id: 'biscoitos', nome: 'Biscoitos e doces', itens: ['Biscoito cream cracker', 'Biscoito comum', 'Bolachas', 'Doce em barras', 'Doce em lata', 'Rapadura'] },
  { id: 'hortifruti', nome: 'Hortifruti', itens: ['Abacaxi', 'Alho', 'Banana', 'Batata-doce', 'Batata inglesa', 'Beterraba', 'Cebola', 'Cenoura', 'Laranja', 'Pimentão', 'Tomate'] },
  { id: 'mercearia', nome: 'Mercearia', itens: ['Açúcar', 'Arroz', 'Café', 'Farinha de mandioca', 'Farinha de trigo', 'Feijão de corda', 'Feijão mulatinho', 'Feijão preto', 'Fubá de milho', 'Macarrão', 'Sal', 'Tempero'] },
  { id: 'oleos', nome: 'Óleos e molhos', itens: ['Maionese', 'Margarina', 'Óleo de algodão', 'Óleo de girassol', 'Óleo de milho', 'Óleo de soja'] },
  { id: 'leite', nome: 'Leite, ovos e bebidas', itens: ['Leite em caixa', 'Leite in natura (leiteiro)', 'Ovos', 'Refrigerante'] },
]

const secaoDe = new Map(SECTIONS.flatMap((s) => s.itens.map((n) => [n, s.id])))

export const PRODUCTS = raw.map(([nome, qtd, base, label], i) => ({ id: i + 1, nome, qtd, base, label, secao: secaoDe.get(nome) }))

// Garante que as seções cobrem a lista inteira, sem produto faltando, repetido ou inventado
if (secaoDe.size !== PRODUCTS.length || PRODUCTS.some((p) => !p.secao)) {
  throw new Error('As seções precisam conter exatamente os produtos da lista.')
}

// Os produtos da tabela vão de 1 a 62; os que a pessoa cadastra recebem ids acima deste valor
export const ID_ADICIONAL = 1000

export const BY_ID = new Map(PRODUCTS.map((p) => [p.id, p]))

// Produtos na ordem de coleta: seção por seção, mantendo a ordem da lista dentro de cada uma
export const ORDERED = SECTIONS.flatMap((s) => PRODUCTS.filter((p) => p.secao === s.id))

// Unidades que a pessoa pode escolher ao informar a embalagem encontrada, com fator para a unidade base
export const UNITS = {
  g: [{ id: 'g', label: 'g', f: 1 }, { id: 'kg', label: 'kg', f: 1000 }],
  ml: [{ id: 'ml', label: 'ml', f: 1 }, { id: 'L', label: 'L', f: 1000 }],
  unid: [{ id: 'unid', label: 'unid', f: 1 }, { id: 'duzia', label: 'dúzia', f: 12 }],
}

// Unidades oferecidas para um produto (dúzia só quando a tabela usa dúzia)
export const unidadesDe = (p) => UNITS[p.base].filter((u) => u.id !== 'duzia' || p.label.includes('dúzia'))

// Unidade e valor da embalagem padrão como aparecem na tabela (1 kg, 1 L, 1 dúzia, 500 ml...)
export function unidadePadrao(p) {
  if (p.base === 'unid') return p.label.includes('dúzia') ? { id: 'duzia', valor: p.qtd / 12 } : { id: 'unid', valor: p.qtd }
  if (p.qtd >= 1000) return { id: p.base === 'g' ? 'kg' : 'L', valor: p.qtd / 1000 }
  return { id: p.base, valor: p.qtd }
}
