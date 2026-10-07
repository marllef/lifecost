#!/usr/bin/env bash
# Gera os ícones PNG do app a partir de public/icon.svg (a única fonte do desenho). Requer o Inkscape.
#   public/icon-192.png, icon-512.png        ícone "any" (cantos arredondados), exigido para instalar o app
#   public/icon-maskable-512.png             ocupa o quadrado inteiro; o Android recorta no formato que quiser
#   public/apple-touch-icon.png              180x180 opaco, usado pelo iOS na tela inicial
# Uso: bash scripts/gerar-icones.sh
set -euo pipefail
cd "$(dirname "$0")/.."

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# O "R$" do SVG é texto e depende da fonte instalada: converte para curvas antes, para o PNG sair igual em qualquer máquina
inkscape public/icon.svg --export-text-to-path --export-type=svg --export-filename="$TMP/any.svg" >/dev/null 2>&1
# Versão sem cantos arredondados: o fundo vai até as bordas (o desenho já cabe na zona segura central de 80%)
sed 's/ rx="96"//' "$TMP/any.svg" > "$TMP/cheio.svg"

png() { inkscape "$1" --export-type=png --export-filename="$2" -w "$3" -h "$3" >/dev/null 2>&1; echo "  $2"; }

echo "Gerando ícones em public/:"
png "$TMP/any.svg"   public/icon-192.png 192
png "$TMP/any.svg"   public/icon-512.png 512
png "$TMP/cheio.svg" public/icon-maskable-512.png 512
png "$TMP/cheio.svg" public/apple-touch-icon.png 180
