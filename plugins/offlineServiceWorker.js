import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const PREFIXO = 'uce-coleta-'

function listar(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? listar(join(dir, d.name)) : [join(dir, d.name)])
}

// Gera o service worker depois do build, lendo a pasta de saída de verdade. Assim a lista de arquivos para
// uso offline inclui tudo (index.html, arquivos de public/, assets com hash) e a versão do cache muda sempre
// que o conteúdo de qualquer um deles muda, mesmo os que não têm hash no nome.
export default function offlineServiceWorker() {
  return {
    name: 'offline-service-worker',
    apply: 'build',
    writeBundle(options) {
      const dir = options.dir
      const arquivos = listar(dir)
        .map((f) => ({ f, caminho: relative(dir, f).split(sep).join('/') }))
        .filter(({ caminho }) => caminho !== 'sw.js' && !caminho.endsWith('.map'))
        .sort((a, b) => a.caminho.localeCompare(b.caminho))

      const hash = createHash('sha1')
      for (const { f, caminho } of arquivos) hash.update(caminho).update(readFileSync(f))
      const version = hash.digest('hex').slice(0, 10)
      const files = ['./', ...arquivos.map(({ caminho }) => './' + caminho)]

      writeFileSync(join(dir, 'sw.js'), `
const CACHE = '${PREFIXO}${version}';
const PREFIXO = '${PREFIXO}';
const FILES = ${JSON.stringify(files)};

// "reload" ignora o cache HTTP do navegador, para nunca guardar uma cópia velha de index.html ou do manifest
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))));
});

// A versão nova espera as páginas abertas fecharem (não derruba quem está usando a anterior).
// O app pede a troca na hora com esta mensagem, quando a pessoa toca em "Atualizar".
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// Só apaga os caches deste app: o mesmo domínio (ex.: github.io) pode hospedar outros projetos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith(PREFIXO) && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Tudo sai do cache desta versão primeiro; a rede só entra para o que não está nele.
// Abrir o app nunca depende de sinal, e o app é uma página só (HashRouter), então toda navegação usa o index.html.
// ignoreVary: o servidor pode responder com "Vary: Origin", e o <script type="module" crossorigin> manda esse
// cabeçalho enquanto a cópia guardada na instalação não tem; sem isso o cache "não encontra" o arquivo e o app
// abre em branco sem internet. Os arquivos são todos deste mesmo app, então ignorar o Vary é seguro.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const alvo = e.request.mode === 'navigate' ? './index.html' : e.request;
  e.respondWith(caches.match(alvo, { cacheName: CACHE, ignoreVary: true }).then((hit) => hit || fetch(e.request)));
});
`)
    },
  }
}
