# PKG Brasil — firmware 14.00

Esta pasta hospeda o [Afterglow para navegador](https://github.com/well0nez/afterglow-web) no layout do PKG Brasil. Os arquivos de execução vieram do commit [`acf25a831725f0d44fcb64725d4ce35acbba8f9d`](https://github.com/well0nez/afterglow-web/commit/acf25a831725f0d44fcb64725d4ce35acbba8f9d).

Abra `index.html` no navegador do PS4 e escolha GoldHEN ou PS4-HEN. O Afterglow identifica os firmwares 14.00 e 13.52. A página inicial verifica o firmware antes de liberar a execução. A navegação para `jb.html` deve começar em `index.html`, na mesma pasta, porque `jb.js` valida a página de origem.

`jb.js`, `ps4_offsets.js`, `core.js`, `mem.js`, `int64.js`, `afterglow.js`, os payloads e os patchsets foram copiados sem alterações. A interface de `index.html`, `style.css` e `launch.js` foi adaptada; em `jb.html` foram alterados apenas o texto e as cores. `cache.appcache` lista os arquivos de execução com hashes para atualização do cache offline. Execute `make-manifest.sh` novamente sempre que algum desses arquivos mudar.

O `hen.bin` é a versão corrigida para o firmware 14.00 distribuída pelo projeto original. Não substitua esse arquivo por outra compilação sem verificar a correção descrita no [README original](README-upstream.md). Detalhes técnicos estão em [TECHNICAL.md](TECHNICAL.md).

## Créditos e licenças

Afterglow por well0nez/m0zz. `afterglow.js` e os patchsets estão sob AGPL-3.0-or-later ([LICENSE](LICENSE)); o código herdado de raw13g mantém a licença MIT ([LICENSE-raw13g](LICENSE-raw13g)). `core.js`, `mem.js` e `int64.js` vêm de um fork da primitiva slopkit sem licença separada indicada pelo projeto original. Consulte [README-upstream.md](README-upstream.md) para os créditos, condições dos demais componentes e orientações em caso de falha.
