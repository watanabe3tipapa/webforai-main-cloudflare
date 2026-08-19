import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";
import { Hono } from "hono";
import { htmlToMarkdown } from "webforai";
import { z } from "zod";

const MAX_INPUT_CHARACTERS = 1_500_000;
const FETCH_TIMEOUT_MS = 12_000;
const USER_AGENT = "webforai-content-prep/1.0 (+https://webforai.dev)";

type ConversionMode = "ai" | "reading";

type ConversionInput = {
	url?: string;
	html?: string;
	mode: ConversionMode;
};

const conversionSchema = z
	.object({
		url: z.string().trim().max(2_048).optional(),
		html: z.string().min(1).max(MAX_INPUT_CHARACTERS).optional(),
		mode: z.enum(["ai", "reading"]).default("ai"),
	})
	.superRefine((input, context) => {
		if (!input.url && !input.html) {
			context.addIssue({ code: z.ZodIssueCode.custom, message: "URL または HTML を入力してください。" });
		}
		if (input.url && input.html) {
			context.addIssue({ code: z.ZodIssueCode.custom, message: "URL と HTML はどちらか一方だけ指定してください。" });
		}
	});

const isBlockedHostname = (hostname: string) => {
	const normalized = hostname.toLowerCase().replace(/\.$/, "");
	if (normalized === "localhost" || normalized.endsWith(".localhost") || normalized.endsWith(".local")) {
		return true;
	}

	// Public-domain names are accepted. Direct IP literals are rejected entirely, which avoids
	// fetching local, loopback, link-local, or otherwise non-public network addresses.
	if (normalized.includes(":")) return true;
	if (/^\d{1,3}(\.\d{1,3}){3}$/.test(normalized)) return true;
	return false;
};

const toPublicHttpUrl = (value: string) => {
	let url: URL;
	try {
		url = new URL(value);
	} catch {
		throw new Error("有効な URL を入力してください。");
	}

	if (url.protocol !== "https:" && url.protocol !== "http:") {
		throw new Error("http または https の公開 URL のみ利用できます。");
	}
	if (url.username || url.password || isBlockedHostname(url.hostname)) {
		throw new Error("ローカルネットワーク、IP アドレス、または認証情報を含む URL は利用できません。");
	}
	if (url.port && url.port !== "80" && url.port !== "443") {
		throw new Error("標準 HTTP(S) ポートの公開 URL のみ利用できます。");
	}
	return url;
};

const getTitle = (html: string) => {
	const matched = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
	return matched?.replace(/\s+/g, " ").trim();
};

const quoteYaml = (value: string) => {
	const sanitized = Array.from(value, (character) => (character.charCodeAt(0) < 32 ? " " : character)).join("");
	return JSON.stringify(sanitized);
};

const estimateTokens = (value: string) => Math.max(1, Math.ceil(value.trim().length / 4));

const buildFrontmatter = ({ title, sourceUrl, mode }: { title: string; sourceUrl?: string; mode: ConversionMode }) => {
	const lines = ["---", `title: ${quoteYaml(title)}`];
	if (sourceUrl) lines.push(`source: ${quoteYaml(sourceUrl)}`);
	lines.push(
		`prepared_with: ${quoteYaml("webforai")}`,
		`mode: ${mode}`,
		`converted_at: ${new Date().toISOString()}`,
		"---",
		"",
	);
	return lines.join("\n");
};

const loadPublicPage = async (sourceUrl: string) => {
	const requestedUrl = toPublicHttpUrl(sourceUrl);
	const response = await fetch(requestedUrl.toString(), {
		headers: {
			Accept: "text/html,application/xhtml+xml,text/markdown;q=0.9",
			"User-Agent": USER_AGENT,
		},
		redirect: "follow",
		signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
	});

	if (!response.ok) {
		throw new Error(`ページを取得できませんでした（HTTP ${response.status}）。`);
	}

	const finalUrl = toPublicHttpUrl(response.url || requestedUrl.toString()).toString();
	const contentType = response.headers.get("content-type")?.toLowerCase() || "";
	if (
		!contentType.includes("text/html") &&
		!contentType.includes("application/xhtml+xml") &&
		!contentType.includes("text/markdown")
	) {
		throw new Error("HTML または Markdown を返す公開ページを指定してください。");
	}

	const contentLength = Number(response.headers.get("content-length"));
	if (Number.isFinite(contentLength) && contentLength > MAX_INPUT_CHARACTERS) {
		throw new Error("ページが大きすぎます。1.5MB 以下のページを指定してください。");
	}

	const body = await response.text();
	if (body.length > MAX_INPUT_CHARACTERS) {
		throw new Error("ページが大きすぎます。1.5MB 以下のページを指定してください。");
	}
	return { body, contentType, sourceUrl: finalUrl };
};

const prepareMarkdown = async ({ url, html, mode }: ConversionInput) => {
	let sourceUrl: string | undefined;
	let input = html;
	let contentType = "text/html";

	if (url) {
		const loaded = await loadPublicPage(url);
		input = loaded.body;
		sourceUrl = loaded.sourceUrl;
		contentType = loaded.contentType;
	}

	if (!input) throw new Error("変換するコンテンツが見つかりませんでした。");

	const title = contentType.includes("text/markdown")
		? sourceUrl
			? new URL(sourceUrl).hostname
			: "Pasted Markdown"
		: getTitle(input) || (sourceUrl ? new URL(sourceUrl).hostname : "Pasted HTML");

	const body = contentType.includes("text/markdown")
		? input.trim()
		: htmlToMarkdown(input, {
				baseUrl: sourceUrl,
				linkAsText: mode === "ai",
				tableAsText: mode === "ai",
				hideImage: mode === "ai",
			});
	const markdown = `${buildFrontmatter({ title, sourceUrl, mode })}${body.trim()}\n`;

	return {
		markdown,
		title,
		sourceUrl,
		inputCharacters: input.length,
		outputCharacters: markdown.length,
		estimatedTokens: estimateTokens(markdown),
		mode,
	};
};

const PORTAL_HTML = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="公開ウェブコンテンツを LLM-ready Markdown に整える webforai の変換ポータル" />
    <title>webforai Portal — Web Content Prep</title>
    <style>
      :root { color-scheme: light; --ink:#101828; --muted:#475467; --line:#d0d5dd; --surface:#fff; --subtle:#f8fafc; --blue:#1769e0; --blue-dark:#0b4aab; --error:#b42318; }
      * { box-sizing:border-box; }
      body { margin:0; background:linear-gradient(155deg,#f6faff 0%,#fff 44%,#f8fbff 100%); color:var(--ink); font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
      a { color:inherit; }
      .shell { width:min(1180px,calc(100% - 32px)); margin:0 auto; }
      header { display:flex; justify-content:space-between; align-items:center; gap:16px; padding:22px 0; border-bottom:1px solid var(--line); }
      .brand { display:flex; gap:10px; align-items:center; text-decoration:none; font-weight:800; letter-spacing:-.04em; font-size:20px; }
      .mark { display:grid; place-items:center; width:28px; height:28px; border-radius:8px; background:var(--blue); color:#fff; font-size:15px; }
      header a:not(.brand) { color:var(--muted); font-size:14px; font-weight:650; }
      main { padding:58px 0 72px; }
      .eyebrow { margin:0 0 9px; color:var(--blue); font-size:12px; font-weight:800; letter-spacing:.14em; }
      h1 { max-width:720px; margin:0; font-size:clamp(36px,6vw,70px); line-height:1.01; letter-spacing:-.06em; }
      .lead { max-width:680px; margin:20px 0 38px; color:var(--muted); font-size:18px; line-height:1.75; }
      .grid { display:grid; grid-template-columns:minmax(0,.94fr) minmax(0,1.06fr); gap:16px; }
      .panel { min-width:0; border:1px solid var(--line); border-radius:16px; background:rgba(255,255,255,.92); box-shadow:0 18px 46px rgba(15,23,42,.08); }
      form { display:flex; flex-direction:column; padding:20px; }
      .tabs { display:inline-flex; width:max-content; gap:4px; padding:4px; border-radius:10px; background:var(--subtle); }
      .tabs button,.actions button { border:0; border-radius:7px; background:transparent; color:var(--muted); font:inherit; font-size:14px; font-weight:700; cursor:pointer; }
      .tabs button { padding:9px 13px; }
      .tabs button.active { background:#fff; color:var(--ink); box-shadow:0 1px 3px rgba(15,23,42,.16); }
      label.field { display:flex; flex-direction:column; gap:8px; margin-top:24px; font-size:14px; font-weight:750; }
      input[type=url],textarea { width:100%; border:1px solid var(--line); border-radius:10px; outline:0; background:#fff; color:var(--ink); padding:12px; font:inherit; font-weight:450; transition:border .15s,box-shadow .15s; }
      input[type=url] { height:49px; }
      textarea { min-height:208px; resize:vertical; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:12px; line-height:1.5; }
      input:focus,textarea:focus { border-color:var(--blue); box-shadow:0 0 0 3px rgba(23,105,224,.18); }
      fieldset { display:grid; grid-template-columns:1fr 1fr; gap:9px; margin:21px 0 17px; padding:0; border:0; }
      legend { margin-bottom:8px; font-size:14px; font-weight:750; }
      .mode { display:flex; min-height:84px; gap:8px; padding:12px; border:1px solid var(--line); border-radius:10px; cursor:pointer; }
      .mode.selected { border-color:var(--blue); background:#f0f5ff; }
      .mode input { width:16px; height:16px; margin:2px 0 0; accent-color:var(--blue); }
      .mode span { display:flex; flex-direction:column; gap:3px; }
      .mode strong { font-size:13px; }
      .mode small { color:var(--muted); font-size:11px; line-height:1.35; }
      .primary { min-height:48px; border:0; border-radius:10px; background:var(--blue); color:#fff; font:inherit; font-weight:800; cursor:pointer; transition:background .15s,transform .15s; }
      .primary:hover:not(:disabled) { background:var(--blue-dark); transform:translateY(-1px); }
      .primary:disabled { cursor:wait; opacity:.62; }
      .hint { margin:12px 0 0; color:var(--muted); font-size:11px; line-height:1.55; }
      .result { display:flex; flex-direction:column; min-height:100%; padding:20px; }
      .result-head { display:flex; justify-content:space-between; gap:12px; padding-bottom:16px; border-bottom:1px solid var(--line); }
      .output-label { margin:0 0 7px; color:var(--blue); font-size:11px; font-weight:800; letter-spacing:.13em; }
      h2 { max-width:360px; margin:0; overflow:hidden; font-size:18px; line-height:1.2; text-overflow:ellipsis; white-space:nowrap; }
      .actions { display:flex; flex-shrink:0; gap:5px; }
      .actions button { padding:8px 9px; border:1px solid var(--line); color:var(--ink); }
      .actions button:hover { border-color:var(--blue); color:var(--blue); }
      .metrics { display:flex; flex-wrap:wrap; gap:6px; margin:16px 0 10px; }
      .metrics span { padding:5px 8px; border-radius:999px; background:var(--subtle); color:var(--muted); font-size:11px; }
      .source { overflow:hidden; margin:0 0 10px; color:var(--muted); font-size:11px; text-overflow:ellipsis; white-space:nowrap; }
      .source a { color:inherit; }
      pre { overflow:auto; flex:1; min-height:238px; max-height:550px; margin:0; padding:15px; border-radius:10px; background:#101828; color:#e4e7ec; font:12px/1.58 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; white-space:pre-wrap; tab-size:2; }
      .empty { display:grid; place-content:center; flex:1; min-height:260px; padding:16px; color:var(--muted); text-align:center; }
      .empty p { max-width:330px; margin:0; font-size:14px; line-height:1.65; }
      .error { display:none; margin:16px 0 0; padding:12px; border:1px solid #fecdca; border-radius:9px; background:#fff5f4; color:var(--error); font-size:13px; line-height:1.5; }
      .error.visible { display:block; }
      .hidden { display:none !important; }
      footer { padding:26px 0 42px; color:var(--muted); font-size:12px; line-height:1.5; }
      @media (max-width:780px) { main { padding-top:40px; } .grid { grid-template-columns:1fr; } .lead { font-size:16px; } }
      @media (max-width:450px) { .shell { width:min(100% - 24px,1180px); } header { padding:16px 0; } header a:not(.brand) { font-size:12px; } fieldset { grid-template-columns:1fr; } .result-head { display:block; } .actions { margin-top:12px; } }
    </style>
  </head>
  <body>
    <header class="shell">
      <a class="brand" href="/app/"><span class="mark">w</span>webforai <span style="color:#667085;font-weight:650">Portal</span></a>
      <a href="https://watanabe3tipapa.github.io/webforai-main-cloudflare/">LP・ドキュメントへ</a>
    </header>
    <main class="shell">
      <p class="eyebrow">WEB CONTENT PREP</p>
      <h1>ウェブの本文を、<br />AI が使える知識へ。</h1>
      <p class="lead">公開 URL または HTML から、主コンテンツを抽出し、出典と変換条件を保った LLM-ready Markdown を作成します。</p>
      <div class="grid">
        <form class="panel" id="convert-form">
          <div class="tabs" role="tablist" aria-label="入力形式">
            <button class="active" data-kind="url" type="button" role="tab" aria-selected="true">公開 URL</button>
            <button data-kind="html" type="button" role="tab" aria-selected="false">HTML を貼り付け</button>
          </div>
          <label class="field" id="url-field"><span>変換する公開ページ</span><input id="url" type="url" placeholder="https://example.com/article" autocomplete="url" required /></label>
          <label class="field hidden" id="html-field"><span>HTML（最大 1.5MB）</span><textarea id="html" spellcheck="false" placeholder="&lt;article&gt;...&lt;/article&gt;"></textarea></label>
          <fieldset>
            <legend>出力の目的</legend>
            <label class="mode selected"><input type="radio" name="mode" value="ai" checked /><span><strong>AI-ready</strong><small>本文を中心に、画像・表・リンクの装飾を抑えます。</small></span></label>
            <label class="mode"><input type="radio" name="mode" value="reading" /><span><strong>Reading</strong><small>リンク・画像・表の情報を可能な限り保持します。</small></span></label>
          </fieldset>
          <button class="primary" id="submit" type="submit">LLM-ready Markdown を作成</button>
          <p class="hint">公開コンテンツのみを対象とします。JavaScript 描画、認証、CAPTCHA が必要なページには対応しません。サイトの利用規約とコンテンツ利用条件を確認してご利用ください。</p>
        </form>
        <section class="panel result" aria-live="polite" aria-label="変換結果">
          <div class="result-head"><div><p class="output-label">OUTPUT</p><h2 id="result-title">変換結果がここに表示されます</h2></div><div class="actions hidden" id="actions"><button id="copy" type="button">コピー</button><button id="download" type="button">.md を保存</button></div></div>
          <p class="error" id="error" role="alert"></p>
          <div id="result-content" class="empty"><p>変換後には、YAML frontmatter・整理された本文・推定トークン数を表示します。</p></div>
        </section>
      </div>
    </main>
    <footer class="shell">webforai is an open-source Web Content Prep toolkit. GitHub Pages はプロダクト紹介と導入ガイド、ここは変換ポータルです。</footer>
    <script>
      const form = document.querySelector("#convert-form");
      const urlField = document.querySelector("#url-field");
      const htmlField = document.querySelector("#html-field");
      const urlInput = document.querySelector("#url");
      const htmlInput = document.querySelector("#html");
      const submit = document.querySelector("#submit");
      const errorBox = document.querySelector("#error");
      const title = document.querySelector("#result-title");
      const resultContent = document.querySelector("#result-content");
      const actions = document.querySelector("#actions");
      const copyButton = document.querySelector("#copy");
      const downloadButton = document.querySelector("#download");
      let inputKind = "url";
      let latestResult;

      document.querySelectorAll("[data-kind]").forEach((button) => button.addEventListener("click", () => {
        inputKind = button.dataset.kind;
        document.querySelectorAll("[data-kind]").forEach((item) => { const active = item === button; item.classList.toggle("active", active); item.setAttribute("aria-selected", String(active)); });
        urlField.classList.toggle("hidden", inputKind !== "url");
        htmlField.classList.toggle("hidden", inputKind !== "html");
        urlInput.required = inputKind === "url";
        htmlInput.required = inputKind === "html";
      }));

      document.querySelectorAll("input[name=mode]").forEach((input) => input.addEventListener("change", () => {
        document.querySelectorAll(".mode").forEach((label) => label.classList.toggle("selected", label.querySelector("input").checked));
      }));

      const number = (value) => new Intl.NumberFormat("en-US").format(value);
      const fileName = (value) => (value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "webforai-content") + ".md";
      const clearError = () => { errorBox.classList.remove("visible"); errorBox.textContent = ""; };
      const showError = (message) => { errorBox.textContent = message; errorBox.classList.add("visible"); };

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearError();
        submit.disabled = true;
        submit.textContent = "変換しています…";
        try {
          const mode = document.querySelector("input[name=mode]:checked").value;
          const payload = inputKind === "url" ? { url: urlInput.value, mode } : { html: htmlInput.value, mode };
          const response = await fetch("/api/convert", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
          const data = await response.json();
          if (!response.ok || !data.markdown) throw new Error(data.error || "変換に失敗しました。もう一度お試しください。");
          latestResult = data;
          title.textContent = data.title;
          resultContent.className = "";
          resultContent.replaceChildren();
          const metrics = document.createElement("div");
          metrics.className = "metrics";
          [[number(data.inputCharacters)+" 入力文字"],[number(data.outputCharacters)+" 出力文字"],["約 "+number(data.estimatedTokens)+" トークン"]].forEach(([text]) => { const badge = document.createElement("span"); badge.textContent = text; metrics.append(badge); });
          if (data.sourceUrl) { const source = document.createElement("p"); source.className = "source"; source.append("出典: "); const link = document.createElement("a"); link.href = data.sourceUrl; link.target = "_blank"; link.rel = "noreferrer"; link.textContent = data.sourceUrl; source.append(link); resultContent.append(source); }
          const pre = document.createElement("pre"); pre.textContent = data.markdown;
          resultContent.append(metrics, pre);
          actions.classList.remove("hidden");
        } catch (exception) { showError(exception instanceof Error ? exception.message : "変換に失敗しました。もう一度お試しください。"); }
        finally { submit.disabled = false; submit.textContent = "LLM-ready Markdown を作成"; }
      });

      copyButton.addEventListener("click", async () => { if (!latestResult) return; try { await navigator.clipboard.writeText(latestResult.markdown); copyButton.textContent = "コピー済み"; setTimeout(() => { copyButton.textContent = "コピー"; }, 1600); } catch { showError("クリップボードへコピーできませんでした。出力欄から手動でコピーしてください。"); } });
      downloadButton.addEventListener("click", () => { if (!latestResult) return; const blob = new Blob([latestResult.markdown], {type:"text/markdown;charset=utf-8"}); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = fileName(latestResult.title); link.click(); URL.revokeObjectURL(link.href); });
    </script>
  </body>
</html>`;

const fetchImage = async (env: Env, url: string) => {
	const response = await env.ASSETS.fetch(url).then((asset) => (asset.status !== 404 ? asset : fetch(url)));
	const contentType = response.headers.get("Content-Type") || "application/octet-stream";
	const arrayBuffer = await response.arrayBuffer();
	const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
	return `data:${contentType};base64,${base64String}`;
};

// biome-ignore lint/style/useNamingConvention: Cloudflare Worker binding
const app = new Hono<{ Bindings: Env }>();

app.get("/app", (context) => context.html(PORTAL_HTML));
app.get("/app/", (context) => context.html(PORTAL_HTML));

app.post("/api/convert", async (context) => {
	let body: unknown;
	try {
		body = await context.req.json();
	} catch {
		return context.json({ error: "JSON 形式のリクエスト本文を指定してください。" }, 400);
	}

	const parsed = conversionSchema.safeParse(body);
	if (!parsed.success) {
		return context.json({ error: parsed.error.issues[0]?.message || "入力を確認してください。" }, 400);
	}

	try {
		const result = await prepareMarkdown(parsed.data);
		return context.json(result, 200, {
			"Cache-Control": "no-store",
			"X-Content-Type-Options": "nosniff",
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "変換中に予期しないエラーが発生しました。";
		return context.json({ error: message }, 422, { "Cache-Control": "no-store" });
	}
});

app.get("/api/ogp", async (context) => {
	const logo = context.req.query("logo");
	const title = context.req.query("title");
	const description = context.req.query("description");
	const logoDataUrl = logo && (await fetchImage(context.env, logo));

	return new ImageResponse(
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				backgroundColor: "#101828",
				color: "white",
				padding: "80px",
			}}
		>
			{/* biome-ignore lint/a11y/useAltText: Generated social image */}
			{logoDataUrl && <img src={logoDataUrl} height="120px" style={{ marginTop: 48 }} />}
			<div style={{ fontSize: "42px", fontWeight: "bold", marginTop: 48, marginBottom: -12 }}>{title}</div>
			{description && <div style={{ opacity: 0.8, fontSize: "32px", marginTop: 24 }}>{description}</div>}
		</div>,
		{ width: 1200, height: 630 },
	);
});

// biome-ignore lint/style/noDefaultExport: Cloudflare Worker entry point
export default app;
