import { defineConfig } from "vocs";
import { version } from "../packages/webforai/package.json";

// biome-ignore lint/style/noDefaultExport: This is a config file
export default defineConfig({
	title: "webforai — Web Content Prep",
	description: "Prepare public web content as source-aware, LLM-ready Markdown.",
	basePath: "/webforai-main-cloudflare",
	baseUrl: "https://watanabe3tipapa.github.io",
	logoUrl: {
		light: "/images/logo-full-light.svg",
		dark: "/images/logo-full-dark.svg",
	},
	iconUrl: {
		light: "/images/logo-light.png",
		dark: "/images/logo-dark.png",
	},
	editLink: {
		pattern: "https://github.com/watanabe3tipapa/webforai-main-cloudflare/edit/main/site/docs/pages/:path",
		text: "Suggest changes to this page",
	},
	theme: {
		accentColor: {
			light: "#1f8fff",
			dark: "#4db8ff",
		},
	},
	socials: [
		{
			icon: "github",
			link: "https://github.com/watanabe3tipapa/webforai-main-cloudflare",
		},
	],
	topNav: [
		{ text: "Cloudflare Portal", link: "/portal" },
		{ text: "Getting Started", link: "/getting-started" },
		{ text: "Cookbook", link: "/cookbook" },
		{
			text: version, // <= should update automatically
			items: [
				{
					text: "Releases",
					link: "https://github.com/watanabe3tipapa/webforai-main-cloudflare/releases",
				},
				{
					text: "Contributing",
					link: "https://github.com/watanabe3tipapa/webforai-main-cloudflare",
				},
			],
		},
	],
	sidebar: [
		{
			text: "Cloudflare Portal",
			link: "/portal",
		},
		{
			text: "API とアクセス制御",
			link: "/api-security",
		},
		{
			text: "Installation",
			link: "/installation",
		},
		{
			text: "Getting Started",
			link: "/getting-started",
		},
		{
			text: "How it works",
			link: "/how-it-works",
		},
		{
			text: "API Reference",
			items: [
				{
					text: "htmlToMarkdown",
					link: "/docs/html-to-markdown",
				},
				{
					text: "htmlToMdast",
					link: "/docs/html-to-mdast",
				},
				{
					text: "mdastToMarkdown",
					link: "/docs/mdast-to-markdown",
				},
				{
					text: "loaders",
					link: "/docs/loaders",
				},
			],
		},
		{
			text: "Cookbook",
			link: "/cookbook",

			items: [
				{
					text: "Simple usage",
					link: "/cookbook/simple",
				},
				{
					text: "Structured output",
					link: "/cookbook/structured-output",
				},
				{
					text: "Translation",
					link: "/cookbook/translation",
				},
				{
					text: "Custom extractor",
					link: "/cookbook/custom-extractor",
				},
				{
					text: "With Cloudflare Workers",
					link: "/cookbook/cf-workers",
				},
			],
		},
	],
	sponsors: [
		{
			name: "Personal",
			height: 60,
			items: [
				[
					{
						name: "ClankPan ∞",
						link: "https://x.com/ClankPan",
						image: "https://pbs.twimg.com/profile_images/1407277306414989315/iIZ-R1jd_400x400.jpg",
					},
				],
			],
		},
	],
});
