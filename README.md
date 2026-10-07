# Coleta – Custo de Vida (UCE)

App para coletar preços da tabela do Projeto Custo de Vida no celular, funcionando offline, com conversão automática por regra de 3 e exportação em CSV.

## Como funciona

- Escolha o estabelecimento no topo. Os quatro primeiros (A, B, C e D) sempre existem. Na engrenagem dá para trocar os nomes e **cadastrar mais estabelecimentos** (E, F, G…), que podem ser removidos depois. Com mais de quatro, as abas rolam para o lado.
- A tela inicial é a **lista de produtos** do estabelecimento escolhido, por seção, com o preço de cada um. Toque em **Iniciar** para entrar no modo de coleta (abre no primeiro produto sem resposta) ou toque direto num produto para coletá-lo. O botão **Lista**, no topo, volta para cá.
- O app mostra **um produto por vez**. Preencha **Preço**, **Quantidade** e **Marca** (a marca é opcional) e toque em **Próximo** (ou use Enter: Preço → Quantidade → Marca → próximo produto).
- Logo abaixo do nome do produto, uma caixa pequena mostra o que já foi anotado nos **outros estabelecimentos** (marca, embalagem e preço) para comparar.
- **Seções**: use os botões abaixo das abas, na lista ou na coleta, para ver e percorrer só uma seção (Limpeza, Higiene, Carnes, Padaria, Biscoitos e doces, Hortifruti, Mercearia, Óleos e molhos, Leite/ovos/bebidas) ou **Todas**, seção por seção. Ao terminar uma seção, o app oferece ir para a próxima.
- **Quantidade** em branco significa que a embalagem é a da tabela. Se for diferente, digite a quantidade e escolha a unidade (g/kg, ml/L, unid/dúzia). O app calcula:
  `preço convertido = preço encontrado × qtd padrão ÷ qtd encontrada`
- Preços convertidos aparecem em laranja.
- **Não encontrado** marca o produto como ausente naquele estabelecimento.
- **Observação**: o botão abre um campo de texto livre e opcional para anotar algo sobre o produto (promoção, embalagem danificada…). Se o produto já tem observação, o campo abre sozinho. A marca também é opcional.
- **Exportar** (menu no topo, e também na tela de fim de seção) baixa a planilha em dois formatos:
  - **Excel (.xlsx)**: preenche o modelo `docs/UCE_Custo_de_Vida.xlsx`. Os nomes dos estabelecimentos, preços e quantidades entram nas células amarelas, e as fórmulas do modelo (preço convertido, média, menor, maior e total da cesta) continuam funcionando. Com mais de quatro estabelecimentos, a aba Coleta ganha um bloco de colunas para cada um e o resumo passa a considerar todos. Uma terceira aba, **Marcas e observações**, guarda o que o modelo não comporta: marca, embalagem encontrada, situação ("não encontrado", convertido, quantidade inválida) e a observação digitada.
  - **CSV**: todos os estabelecimentos (marca, quantidade, preço encontrado e convertido, situação e observação), média, menor e maior preço e o total da cesta.

Os dados ficam salvos no próprio aparelho (localStorage). Limpar os dados do navegador apaga a coleta, então exporte o CSV ao final de cada dia.

## Rodar localmente

```bash
npm install
npm run dev
```

## Publicar no GitHub Pages

1. Crie um repositório no GitHub e envie este projeto para a branch `main`.
2. No repositório, vá em **Settings → Pages** e, em **Source**, escolha **GitHub Actions**.
3. A cada push na `main`, o workflow em `.github/workflows/deploy.yml` faz o build e publica.

O endereço fica `https://SEU-USUARIO.github.io/NOME-DO-REPO/`. Como o `base` do Vite é relativo (`./`), funciona com qualquer nome de repositório.

## Ícones do app

Os ícones PNG (`public/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` e `apple-touch-icon.png`) são gerados a partir de `public/icon.svg`, que é a única fonte do desenho. Depois de mexer no SVG, rode `bash scripts/gerar-icones.sh` (precisa do Inkscape). Para instalar o app, o Android exige PNG de 192 e 512 px; o iOS usa o `apple-touch-icon`.

## Usar offline no celular

Abra o endereço uma vez com internet. Depois disso o app funciona sem conexão. Para ficar como um app, use **Adicionar à tela inicial** no menu do navegador.

Quando você publicar uma nova versão, o app baixa a atualização em segundo plano na próxima vez que estiver com internet e mostra o aviso **Nova versão disponível**. Toque em **Atualizar** quando quiser: os preços já estão salvos no aparelho, então nada se perde. Enquanto você não atualiza, o app segue funcionando na versão anterior, sem quebrar nada no meio da coleta.

O service worker é gerado no build por `plugins/offlineServiceWorker.js`: lê a pasta `dist`, guarda todos os arquivos para uso offline (inclusive os de `public/`) e usa o conteúdo deles para definir a versão do cache. Abrir o app não depende de internet.

## Abrir o CSV no Google Sheets

O CSV usa `;` como separador e vírgula decimal, padrão brasileiro. No Google Sheets: **Arquivo → Importar → Upload**, e em "Tipo de separador" escolha **Personalizado: `;`** (ou detectar automaticamente). Com a planilha em português (Arquivo → Configurações → Localidade: Brasil), os números entram corretamente.

## Estrutura

Stack: React, Vite, Tailwind CSS 4, React Router (HashRouter, funciona no GitHub Pages e offline), zustand, react-icons e fflate (gera o .xlsx).

```
src/
  main.jsx            entrada: providers + RouterProvider
  index.css           Tailwind e cores do tema
  routes/             definição das rotas (/ lista, /coleta, /fim, /ajustes)
  pages/              uma por rota: ListaPage, ColetaPage, FimPage, AjustesPage
  components/
    layout/           AppLayout, Header, EstabTabs, ColetaLayout
    coleta/           ProductForm, CompareBox, SectionChips
    ui/               Button, Field, PriceTag
  stores/             zustand: useColetaStore (preços, salvo no aparelho) e useNavStore (onde parou)
  contexts/           ConnectivityContext (aviso offline), UpdateContext (nova versão) e ConfirmContext (diálogo de confirmação)
  hooks/              useColetaNav (posição e movimento entre produtos), useProgresso, useExportar
  data/products.js    lista dos 62 produtos, quantidades padrão e seções
  utils/              calc (regra de 3), csv, xlsx, download, escopo, estabs, migrate, text
docs/                 modelo UCE_Custo_de_Vida.xlsx usado na exportação (troque o arquivo para mudar o modelo)
plugins/             offlineServiceWorker.js: gera o service worker no build
scripts/             gerar-icones.sh: gera os PNGs dos ícones a partir do SVG
vite.config.js        configuração do build
```
