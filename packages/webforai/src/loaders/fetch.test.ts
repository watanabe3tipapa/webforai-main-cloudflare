import { describe, expect, it } from "vitest";
import { loadHtml } from "./fetch";

describe("Fetch loader", () => {
	it.skip("should load the HTML of a URL", async () => {
		const html = await loadHtml("https://example.com");
		expect(html).toContain("Example Domain");
	});
});
