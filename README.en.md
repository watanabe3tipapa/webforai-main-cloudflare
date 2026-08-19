# webforai

[日本語](./README.md) / **English**

> **Prepare public web pages as Markdown that AI can use.**
>
> webforai is a TypeScript Web Content Prep toolkit that extracts the main content from HTML and converts it into **LLM-ready Markdown** or **MDAST**, while preserving useful structure such as headings, links, and code.

[Documentation](https://watanabe3tipapa.github.io/webforai-main-cloudflare/) · [Get started](https://watanabe3tipapa.github.io/webforai-main-cloudflare/getting-started/) · [npm](https://www.npmjs.com/package/webforai) · [GitHub](https://github.com/watanabe3tipapa/webforai-main-cloudflare)

## What it is for

Passing an entire web page to an AI system often adds navigation, cookie banners, footers, and visual chrome to the useful context. webforai prepares the content that matters for the next AI step. It is not a large-scale crawling product; it is a toolkit for turning **one public page into a clean, inspectable input**.

| Capability | What you get |
| --- | --- |
| Content-first extraction | Convert the core of an article or document into readable Markdown. |
| HTML to Markdown / MDAST | Work with a Markdown string or structured data for a custom pipeline. |
| Configurable representation | Control how links, tables, images, and other page elements are represented. |
| Flexible loading | Use `fetch` for static HTML, Playwright / Puppeteer for browser-rendered pages, or a Cloudflare Workers loader. |

## Try it first

webforai runs on Node.js 18 or later. Install the package, then start with the CLI or with HTML you already have.

```bash
npm install webforai

# Convert a URL to Markdown through the interactive CLI.
npx webforai@latest https://example.com/article
```

Use the library directly when your application already has the HTML.

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

> See [Getting Started](https://watanabe3tipapa.github.io/webforai-main-cloudflare/getting-started/) for the CLI flow, URL loading, and Playwright / Puppeteer usage.

## Where it fits

| Workflow | How webforai helps |
| --- | --- |
| RAG ingestion | Prepare content-first Markdown before chunking, embedding, and retrieval. |
| Research, summarization, and translation | Preserve heading structure and link context while making model input more consistent. |
| Custom applications | Use the conversion pipeline, including MDAST, to compose extraction, classification, and structured-output flows. |

Explore the [structured output](https://watanabe3tipapa.github.io/webforai-main-cloudflare/cookbook/structured-output/) and [translation](https://watanabe3tipapa.github.io/webforai-main-cloudflare/cookbook/translation/) recipes.

## Control the output

webforai exposes an HTML → HAST → MDAST → Markdown pipeline. Its default `takumi` extraction preset uses article and content regions to reduce surrounding page chrome. With `htmlToMdast` and `mdastToMarkdown`, you can work with the intermediate structure yourself.

```ts
import { htmlToMdast, mdastToMarkdown } from "webforai";

const mdast = htmlToMdast(html);
// Apply your own extraction, transformation, or splitting here.
const markdown = mdastToMarkdown(mdast);
```

See the [API reference](https://watanabe3tipapa.github.io/webforai-main-cloudflare/docs/html-to-markdown/) for options and API details.

## Cloudflare Workers and the Web UI portal

This repository includes a Cloudflare Worker implementation in `site`. It provides a Web UI and a `POST /api/convert` endpoint for converting a URL or HTML to Markdown. **The hosted Web UI portal is currently being prepared for public release.** You can deploy the Worker to your own Cloudflare account today.

```bash
# From the repository root, generate the static assets first.
pnpm --filter site build

cd site
cp wrangler.selfhost.toml.example wrangler.selfhost.toml
# Change `name` in wrangler.selfhost.toml to your own Worker name.
pnpm exec wrangler deploy --config wrangler.selfhost.toml
```

The [Cloudflare Portal guide](https://watanabe3tipapa.github.io/webforai-main-cloudflare/portal/) documents local development, URL validation, local-network restrictions, input limits, AI-ready / Reading modes, and Custom Domain deployment.

## Develop this repository

This repository is a pnpm workspace. Installing dependencies builds the library package.

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
```

Develop and build the site from `site`.

```bash
cd site
pnpm dev
pnpm build
```

## Documentation

| Topic | Link |
| --- | --- |
| Product overview and onboarding | [GitHub Pages](https://watanabe3tipapa.github.io/webforai-main-cloudflare/) |
| SDK / CLI onboarding | [Getting Started](https://watanabe3tipapa.github.io/webforai-main-cloudflare/getting-started/) |
| Recipes | [Cookbook](https://watanabe3tipapa.github.io/webforai-main-cloudflare/cookbook/) |
| Cloudflare Worker | [Portal guide](https://watanabe3tipapa.github.io/webforai-main-cloudflare/portal/) |

## License

Licensed under the [Apache License 2.0](./LICENSE).
