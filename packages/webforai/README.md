# webforai

**日本語** / [English](https://github.com/watanabe3tipapa/webforai-main-cloudflare/blob/main/README.en.md)

> **公開ウェブページを、AI が扱いやすい Markdown へ整える。**
>
> webforai は、HTML から主コンテンツを取り出し、見出し・リンク・コードなどの意味を保った **LLM-ready Markdown** または **MDAST** に変換する、TypeScript 向けの Web Content Prep ツールキットです。

[ドキュメント](https://watanabe3tipapa.github.io/webforai-main-cloudflare/) · [はじめる](https://watanabe3tipapa.github.io/webforai-main-cloudflare/getting-started/) · [npm](https://www.npmjs.com/package/webforai) · [GitHub](https://github.com/watanabe3tipapa/webforai-main-cloudflare)

## 何を解決するのか

ウェブページをそのまま AI に渡すと、ナビゲーション、Cookie バナー、フッター、装飾要素が文脈を埋めてしまいます。webforai は、コンテンツの中心を取り出し、次の AI 処理へ渡しやすい構造に整えます。大規模なクローリングを行うための製品ではなく、**公開された 1 ページを、見通しのよい入力へ準備する**ためのライブラリです。

| できること | 得られるもの |
| --- | --- |
| 本文を優先して抽出する | 記事・ドキュメントの中心を扱いやすい Markdown に変換できます。 |
| HTML を Markdown / MDAST に変換する | 文字列出力にも、独自パイプラインへつなぐ構造化データにも対応します。 |
| 表現を用途に合わせる | リンク、表、画像などの扱いを選び、入力情報の密度を調整できます。 |
| 取得方法を選ぶ | 静的 HTML の `fetch`、ブラウザー描画が必要な Playwright / Puppeteer、Cloudflare Workers 向けローダーを利用できます。 |

## まず試す

Node.js 18 以上で利用できます。パッケージを追加し、CLI またはライブラリから変換を開始してください。

```bash
npm install webforai

# 対話形式で URL を Markdown へ変換します。
npx webforai@latest https://example.com/article
```

ライブラリとして使う場合は、すでに取得済みの HTML をそのまま渡せます。

```ts
import { htmlToMarkdown } from "webforai";

const html = `
  <article>
    <h1>Building with AI</h1>
    <p>Useful context lives here.</p>
  </article>
`;

const markdown = htmlToMarkdown(html, {
  baseUrl: "https://example.com/article",
});

console.log(markdown);
```

> URL から HTML を読み込む方法、CLI の対話フロー、Playwright / Puppeteer の利用方法は、[導入ガイド](https://watanabe3tipapa.github.io/webforai-main-cloudflare/getting-started/)を参照してください。

## どんな場面で使うか

| ワークフロー | webforai の役割 |
| --- | --- |
| RAG の取込み | 本文中心の Markdown を作り、分割・埋め込み・検索の前処理を整えます。 |
| 調査・要約・翻訳 | ページの見出し構造とリンク文脈を保ち、モデルに渡す入力のばらつきを抑えます。 |
| 独自アプリへの組込み | MDAST を含む変換パイプラインを利用し、抽出・分類・構造化を自分の処理に合わせます。 |

レシピは、[構造化出力](https://watanabe3tipapa.github.io/webforai-main-cloudflare/cookbook/structured-output/) と [翻訳](https://watanabe3tipapa.github.io/webforai-main-cloudflare/cookbook/translation/) から確認できます。

## 出力をコントロールする

webforai は HTML → HAST → MDAST → Markdown の変換パイプラインを提供します。標準の `takumi` 抽出プリセットは、記事やコンテンツ領域を手がかりに周辺要素を抑えます。さらに、`htmlToMdast` と `mdastToMarkdown` を使えば、変換途中の構造を独自に扱えます。

```ts
import { htmlToMdast, mdastToMarkdown } from "webforai";

const mdast = htmlToMdast(html);
// ここで独自の抽出・変換・分割を実行できます。
const markdown = mdastToMarkdown(mdast);
```

API とオプションの詳細は、[API リファレンス](https://watanabe3tipapa.github.io/webforai-main-cloudflare/docs/html-to-markdown/)を参照してください。

## Cloudflare Workers と Web-UI ポータル

Cloudflare Worker で URL / HTML を Markdown に変換する Web-UI と `POST /api/convert` の実装を、このリポジトリの `site` に含めています。**ホスト済みの Web-UI ポータルは現在公開準備中です。** 現時点では、Worker を自分の Cloudflare アカウントへデプロイして利用できます。

```bash
cd site
pnpm worker:deploy
```

公開 URL の検査、ローカルネットワークの拒否、入力サイズ制限、AI-ready / Reading モードなどの仕様は、[Cloudflare Portal ガイド](https://watanabe3tipapa.github.io/webforai-main-cloudflare/portal/)に記載しています。

## プロジェクトを開発する

このリポジトリは pnpm ワークスペースです。依存関係をインストールすると、ライブラリのビルドが実行されます。

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
```

サイトは `site` ディレクトリで開発・ビルドできます。

```bash
cd site
pnpm dev
pnpm build
```

## ドキュメント

| 内容 | リンク |
| --- | --- |
| プロダクト概要と導入 | [GitHub Pages](https://watanabe3tipapa.github.io/webforai-main-cloudflare/) |
| SDK / CLI の導入 | [Getting Started](https://watanabe3tipapa.github.io/webforai-main-cloudflare/getting-started/) |
| レシピ | [Cookbook](https://watanabe3tipapa.github.io/webforai-main-cloudflare/cookbook/) |
| Cloudflare Worker | [Portal ガイド](https://watanabe3tipapa.github.io/webforai-main-cloudflare/portal/) |

## ライセンス

[Apache License 2.0](https://github.com/watanabe3tipapa/webforai-main-cloudflare/blob/main/LICENSE) の下で公開しています。
