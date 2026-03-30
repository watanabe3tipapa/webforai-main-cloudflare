<br/>

<p align="right">
  <a href="README_jp.md">日本語</a> / <a href="README.md">English</a>
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

## Features

- **HTML to Markdown** - Convert any HTML to clean, readable Markdown
- **HTML to MDAST** - Transform HTML into Markdown Abstract Syntax Tree for fine-grained control
- **Multiple Loaders** - Support for fetch, Playwright, Puppeteer, and Cloudflare Workers (Puppeteer)
- **Content Extraction** - Built-in extractors (takumi preset) for precise content extraction
- **Markdown Splitting** - Split large markdown into smaller chunks for AI context windows
- **GFM Support** - Full GitHub Flavored Markdown support (tables, task lists, strikethrough, etc.)
- **TypeScript** - Full TypeScript support

## Installation

```bash
npm install webforai
```

## Quick Start

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

## Loaders

| Loader | Use Case |
|--------|----------|
| `playwright` | JavaScript-rendered pages |
| `puppeteer` | Headless Chrome scraping |
| `cf-puppeteer` | Cloudflare Workers environment |
| `fetch` | Simple static HTML |

## API

### `htmlToMarkdown(html, options)`

Convert HTML string to Markdown.

```ts
import { htmlToMarkdown } from "webforai";

const markdown = htmlToMarkdown("<h1>Hello</h1><p>World</p>", {
  baseUrl: "https://example.com", // for resolving relative URLs
  gfm: true, // GitHub Flavored Markdown (default: true)
});
```

### `htmlToMdast(html, options)`

Convert HTML to MDAST (Markdown Abstract Syntax Tree).

```ts
import { htmlToMdast } from "webforai";

const mdast = htmlToMdast("<h1>Hello</h1>");
```

### `mdastToMarkdown(mdast, options)`

Convert MDAST to Markdown string.

```ts
import { mdastToMarkdown } from "webforai";

const markdown = mdastToMarkdown(mdast, {
  gfm: true,
});
```

### `mdastSplitter(markdown, options)`

Split large markdown into smaller chunks.

```ts
import { mdastSplitter } from "webforai";

const chunks = mdastSplitter(longMarkdown, {
  maxLength: 4000, // max characters per chunk
  overlap: 200,    // overlap between chunks
});
```

## Cloudflare Workers

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

## License

[Apache 2.0](/LICENSE) License
