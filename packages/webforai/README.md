<br/>

<p align="right">
  <a href="#english">English</a> / <a href="#japanese">日本語</a>
</p>

<p align="center">
  <a href="https://webforai.dev">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://webforai.dev/images/logo-full-dark.svg">
      <img alt="webforai logo" src="https://webforai.dev/images/logo-full-light.svg" width="auto" height="40">
    </picture>
  </a>
</p>

<p align="center">
  A powerful HTML to Markdown converter for AI applications
<p>

<p align="center">
  <a href="https://www.npmjs.com/package/webforai">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/npm/v/webforai?style=flat">
      <img src="https://img.shields.io/npm/v/webforai?style=flat" alt="Version">
    </picture>
  </a>
  <a href="https://github.com/inaridiy/webforai/blob/main/LICENSE">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/npm/l/webforai?style=flat">
      <img src="https://img.shields.io/npm/l/webforai?style=flat" alt="Apache License">
    </picture>
  </a>
</p>

---

## English

### Features

- **HTML to Markdown** - Convert any HTML to clean, readable Markdown
- **HTML to MDAST** - Transform HTML into Markdown Abstract Syntax Tree for fine-grained control
- **Multiple Loaders** - Support for fetch, Playwright, Puppeteer, and Cloudflare Workers (Puppeteer)
- **Content Extraction** - Built-in extractors (takumi preset) for precise content extraction
- **Markdown Splitting** - Split large markdown into smaller chunks for AI context windows
- **GFM Support** - Full GitHub Flavored Markdown support (tables, task lists, strikethrough, etc.)
- **TypeScript** - Full TypeScript support

### Installation

```bash
npm install webforai
```

### Quick Start

```bash
npx webforai <url>
```

Or use it in your code:

```ts
import { htmlToMarkdown, htmlToMdast } from "webforai";
import { loadHtml } from "webforai/loaders/playwright";

// Load HTML from URL
const url = "https://example.com";
const html = await loadHtml(url);

// Convert HTML to Markdown
const markdown = htmlToMarkdown(html, { baseUrl: url });

// Or convert to MDAST for more control
const mdast = htmlToMdast(html);
```

### Loaders

| Loader | Use Case |
|--------|----------|
| `playwright` | JavaScript-rendered pages |
| `puppeteer` | Headless Chrome scraping |
| `cf-puppeteer` | Cloudflare Workers environment |
| `fetch` | Simple static HTML |

### API

#### `htmlToMarkdown(html, options)`

Convert HTML string to Markdown.

```ts
import { htmlToMarkdown } from "webforai";

const markdown = htmlToMarkdown("<h1>Hello</h1><p>World</p>", {
  baseUrl: "https://example.com", // for resolving relative URLs
  gfm: true, // GitHub Flavored Markdown (default: true)
});
```

#### `htmlToMdast(html, options)`

Convert HTML to MDAST (Markdown Abstract Syntax Tree).

```ts
import { htmlToMdast } from "webforai";

const mdast = htmlToMdast("<h1>Hello</h1>");
```

#### `mdastToMarkdown(mdast, options)`

Convert MDAST to Markdown string.

```ts
import { mdastToMarkdown } from "webforai";

const markdown = mdastToMarkdown(mdast, {
  gfm: true,
});
```

#### `mdastSplitter(markdown, options)`

Split large markdown into smaller chunks.

```ts
import { mdastSplitter } from "webforai";

const chunks = mdastSplitter(longMarkdown, {
  maxLength: 4000, // max characters per chunk
  overlap: 200,    // overlap between chunks
});
```

### Cloudflare Workers

```ts
import { htmlToMarkdown } from "webforai";
import { loadHtml } from "webforai/loaders/cf-puppeteer";

export default {
  async fetch(request) {
    const html = await loadHtml(request.url);
    const markdown = htmlToMarkdown(html);
    return new Response(markdown);
  },
};
```

### License

[Apache 2.0](/LICENSE) License

---

## Japanese

### 機能

- **HTML to Markdown** - 任意のHTMLをクリーンで読みやすいMarkdownに変換
- **HTML to MDAST** - HTMLをMarkdown抽象構文木に変換し、詳細な制御が可能
- **複数のローダー** - fetch、Playwright、Puppeteer、Cloudflare Workers（Puppeteer）をサポート
- **コンテンツ抽出** - 組み込みの抽出器（takumiプリセット）で正確なコンテンツ抽出
- **Markdown分割** - 大きなMarkdownをAIコンテキストウィンドウ用に小さなチャンクに分割
- **GFMサポート** - GitHub Flavored Markdown完全サポート（テーブル、タスクリスト、取り消し線など）
- **TypeScript** - 完全なTypeScriptサポート

### インストール

```bash
npm install webforai
```

### クイックスタート

```bash
npx webforai <url>
```

またはコードで使用:

```ts
import { htmlToMarkdown, htmlToMdast } from "webforai";
import { loadHtml } from "webforai/loaders/playwright";

// URLからHTMLを読み込み
const url = "https://example.com";
const html = await loadHtml(url);

// HTMLをMarkdownに変換
const markdown = htmlToMarkdown(html, { baseUrl: url });

// より詳細な制御が必要な場合はMDASTに変換
const mdast = htmlToMdast(html);
```

### ローダー

| ローダー | ユースケース |
|----------|---------------|
| `playwright` | JavaScriptで描画されるページ |
| `puppeteer` | ヘッドレスChromeスクレイピング |
| `cf-puppeteer` | Cloudflare Workers環境 |
| `fetch` | 単純な静的HTML |

### API

#### `htmlToMarkdown(html, options)`

HTML文字列をMarkdownに変換します。

```ts
import { htmlToMarkdown } from "webforai";

const markdown = htmlToMarkdown("<h1>Hello</h1><p>World</p>", {
  baseUrl: "https://example.com", // 相対URL解決用
  gfm: true, // GitHub Flavored Markdown (デフォルト: true)
});
```

#### `htmlToMdast(html, options)`

HTMLをMDAST（Markdown抽象構文木）に変換します。

```ts
import { htmlToMdast } from "webforai";

const mdast = htmlToMdast("<h1>Hello</h1>");
```

#### `mdastToMarkdown(mdast, options)`

MDASTをMarkdown文字列に変換します。

```ts
import { mdastToMarkdown } from "webforai";

const markdown = mdastToMarkdown(mdast, {
  gfm: true,
});
```

#### `mdastSplitter(markdown, options)`

大きなMarkdownを小さなチャンクに分割します。

```ts
import { mdastSplitter } from "webforai";

const chunks = mdastSplitter(longMarkdown, {
  maxLength: 4000, // チャンクあたりの最大文字数
  overlap: 200,    // チャンク間のオーバーラップ
});
```

### Cloudflare Workers

```ts
import { htmlToMarkdown } from "webforai";
import { loadHtml } from "webforai/loaders/cf-puppeteer";

export default {
  async fetch(request) {
    const html = await loadHtml(request.url);
    const markdown = htmlToMarkdown(html);
    return new Response(markdown);
  },
};
```

### ライセンス

[Apache 2.0](/LICENSE) License
