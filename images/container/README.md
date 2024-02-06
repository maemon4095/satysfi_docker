# 概要
devcontainerなど，Docker内でsatysfiを使うためのイメージ．

# 内容
## latest
- satysfi
- satyrographos
- satysfi language server
- opam (OCaml パッケージマネージャ, satysfiに必要)
- rust (LSPに必要)
- HackGen (font)
- 原ノ味フォント

## slim
- satysfi
- satyrographos
- satysfi language server
- opam (OCaml パッケージマネージャ, satysfiに必要)
- rust (LSPに必要)

# 使い方
コンテナのイメージに`ghcr.io/maemon4095/satysfi:latest`を指定する．

## 例 (devcontainer)
`devcontainer.json`
```json
{
  "image": "ghcr.io/maemon4095/satysfi:latest",
}
```

