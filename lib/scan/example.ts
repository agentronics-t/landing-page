import type { ScanReport } from "./types";

/** A real scan of example.com (the domain reserved for examples), captured 2026-10-24. Shown on the home page as the sample report. */
export const EXAMPLE_REPORT: ScanReport = {
  "url": "https://example.com/",
  "finalUrl": "https://example.com/",
  "host": "example.com",
  "scannedAt": "2026-10-24T00:00:00.000Z",
  "score": 39,
  "categories": [
    {
      "id": "find",
      "label": "Find",
      "question": "Can AI agents find your site?",
      "score": 54,
      "max": 100
    },
    {
      "id": "read",
      "label": "Read",
      "question": "Can they understand what's on it?",
      "score": 23,
      "max": 100
    },
    {
      "id": "act",
      "label": "Act",
      "question": "Can they actually do things on it?",
      "score": 40,
      "max": 100
    }
  ],
  "checks": [
    {
      "id": "ai-crawlers",
      "category": "find",
      "label": "AI assistants are allowed in",
      "status": "pass",
      "detail": "No robots.txt rules, so every AI assistant may read the site.",
      "max": 10,
      "points": 10
    },
    {
      "id": "sitemap",
      "category": "find",
      "label": "Sitemap lists your pages",
      "status": "fail",
      "detail": "No sitemap at /sitemap.xml or in robots.txt.",
      "fix": "Publish a sitemap.xml and point to it from robots.txt so agents can find every page, not just the ones linked from the home page.",
      "max": 5,
      "points": 0
    },
    {
      "id": "llms-txt",
      "category": "find",
      "label": "llms.txt guide for AI",
      "status": "fail",
      "detail": "No llms.txt at the root of the site.",
      "fix": "Add /llms.txt: a short Markdown summary of who you are and links to your key pages. It's a proposed standard that some AI tools already read.",
      "max": 4,
      "points": 0
    },
    {
      "id": "meta",
      "category": "find",
      "label": "Title and description are set",
      "status": "warn",
      "detail": "No meta description.",
      "fix": "Write a title and a one-sentence meta description that say what you offer. Agents quote them when they recommend you.",
      "max": 5,
      "points": 3
    },
    {
      "id": "content",
      "category": "read",
      "label": "Content is there without JavaScript",
      "status": "warn",
      "detail": "Only 156 characters of text arrive without JavaScript.",
      "fix": "Render the main content on the server (server-side rendering or static generation). Most agents read the HTML and don't run your JavaScript.",
      "max": 12,
      "points": 6
    },
    {
      "id": "structured-data",
      "category": "read",
      "label": "Structured data describes the business",
      "status": "fail",
      "detail": "No structured data on the page.",
      "fix": "Add schema.org JSON-LD (Organization, Product, Offer, FAQPage\u2026) so agents get prices, products and facts without guessing.",
      "max": 8,
      "points": 0
    },
    {
      "id": "structure",
      "category": "read",
      "label": "Page structure is clear",
      "status": "fail",
      "detail": "Missing a main heading (h1), a <main> region.",
      "fix": "Give the page one h1, set <html lang>, and wrap the main content in <main> so agents know what matters.",
      "max": 6,
      "points": 0
    },
    {
      "id": "names",
      "category": "read",
      "label": "Links and buttons say what they do",
      "status": "skip",
      "detail": "No links or buttons in the HTML.",
      "max": 6,
      "points": 0
    },
    {
      "id": "img-alt",
      "category": "read",
      "label": "Images have descriptions",
      "status": "skip",
      "detail": "No images in the HTML.",
      "max": 4,
      "points": 0
    },
    {
      "id": "webmcp",
      "category": "act",
      "label": "Agents can call your actions (WebMCP)",
      "status": "fail",
      "detail": "No WebMCP tools on this page. Agents have to click through it like a person and often get stuck.",
      "fix": "Publish your key actions (search, book, buy, sign up) as WebMCP tools. Agent Nick writes them into your code and opens a pull request.",
      "max": 18,
      "points": 0
    },
    {
      "id": "forms",
      "category": "act",
      "label": "Form fields are labelled",
      "status": "skip",
      "detail": "No forms on this page.",
      "max": 10,
      "points": 0
    },
    {
      "id": "bot-wall",
      "category": "act",
      "label": "Agents aren't stopped by bot checks",
      "status": "pass",
      "detail": "The page loaded for our agent without a challenge.",
      "max": 12,
      "points": 12
    }
  ]
};
