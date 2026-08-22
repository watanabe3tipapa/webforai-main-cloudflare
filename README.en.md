# webforai

> Prepare public web pages as Markdown that AI can use.

webforai is a TypeScript toolkit that extracts the main content from HTML and converts it into LLM-ready Markdown or MDAST while preserving useful structure such as headings, links, and code. It focuses on converting a single public page into a clean, inspectable input rather than large-scale crawling.

Documentation · Get started · npm · GitHub

- Documentation: https://watanabe3tipapa.github.io/webforai-main-cloudflare/
- Getting started: https://watanabe3tipapa.github.io/webforai-main-cloudflare/getting-started/
- Repository: https://github.com/watanabe3tipapa/webforai-main-cloudflare

## Key capabilities

| Capability | What you get |
| --- | --- |
| Content-first extraction | Convert the core of an article or document into readable Markdown. |
| HTML → Markdown / MDAST | Obtain a Markdown string or structured MDAST for custom pipelines. |
| Configurable representation | Control how links, tables, images, and other elements are represented. |
| Flexible loading | Use fetch for static HTML, Playwright / Puppeteer for browser-rendered pages, or a Cloudflare Workers loader (see site). |

## Try it first

Requirements: Node.js 18 or later.

Install the package and try the CLI or convert known HTML.

```bash
npm install webforai

# Convert a URL to Markdown through the interactive CLI.
npx webforai@latest https://example.com/article
```

Use the library directly when you already have the HTML:

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

See the Getting Started documentation for the CLI flow, URL loading, and Playwright / Puppeteer usage.

## Control the output (pipeline)

webforai exposes an HTML → HAST → MDAST → Markdown pipeline. The default `takumi` extraction preset targets article and content regions to reduce surrounding page chrome. You can work with intermediate structures to apply custom extraction, transformation, or splitting.

```ts
import { htmlToMdast, mdastToMarkdown } from "webforai";

const mdast = htmlToMdast(html);
// Apply your own extraction, transformation, or splitting here.
const markdown = mdastToMarkdown(mdast);
```

Refer to the API reference in the documentation for options and API details.

## Cloudflare Workers and the Web UI portal

This repository includes a Cloudflare Worker implementation in the `site` directory. The Worker provides a Web UI and a `POST /api/convert` endpoint for converting a URL or HTML to Markdown. The hosted Web UI portal is currently being prepared for public release. You can deploy the Worker to your own Cloudflare account.

Example deployment steps from the repository (as provided):

```bash
# From the repository root, generate the static assets first.
pnpm --filter site build

cd site
cp wrangler.selfhost.toml.example wrangler.selfhost.toml
# Change `name` in wrangler.selfhost.toml to your own Worker name.
pnpm exec wrangler deploy --config wrangler.selfhost.toml
```

See the Cloudflare Portal guide in the documentation for local development details, URL validation, input limits, and deployment notes.

## Where it fits

| Workflow | How webforai helps |
| --- | --- |
| RAG ingestion | Prepare content-first Markdown before chunking, embedding, and retrieval. |
| Research, summarization, translation | Preserve heading structure and link context while making model input more consistent. |
| Custom applications | Use the conversion pipeline, including MDAST, to compose extraction, classification, and structured-output flows. |

Explore the structured output and translation recipes in the documentation.

## Develop this repository

This repository is a pnpm workspace. Installing dependencies builds the library packages.

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
```

Develop and build the site from the `site` directory:

```bash
cd site
pnpm dev
pnpm build
```

The repository contains scripts and workspace configuration in package.json and pnpm workspace files.

## Documentation

| Topic | Link |
| --- | --- |
| Product overview and onboarding | https://watanabe3tipapa.github.io/webforai-main-cloudflare/ |
| SDK / CLI onboarding | https://watanabe3tipapa.github.io/webforai-main-cloudflare/getting-started/ |
| Recipes | https://watanabe3tipapa.github.io/webforai-main-cloudflare/cookbook/ |
| Cloudflare Worker | https://watanabe3tipapa.github.io/webforai-main-cloudflare/portal/ |

## License

Licensed under the Apache License 2.0: see ./LICENSE
