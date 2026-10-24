/**
 * The home page FAQ (spec v3 §3.11), shared by the accordion and the
 * FAQPage JSON-LD. Every product claim here is checked against the code:
 * Agent Nick commits to its own branch and merges only on the customer's
 * click; the GitHub App asks for Contents + Pull requests (read & write) and
 * Checks + Metadata (read); Free needs no card; paid plans cancel from the
 * Dodo customer portal. The Adobe figure is AI-referred visits, not purchases.
 */
export const FAQ: { q: string; a: string }[] = [
  {
    q: "What exactly does the Agent Readiness Score measure?",
    a: "A number from 0 to 100 from 12 checks in three groups: can agents find your site, read it, and act on it. Each check says what's wrong and how to fix it.",
  },
  {
    q: "Do I have to give you access to my code?",
    a: "Not for the score: the scan only reads public pages. For fixes, you install our GitHub App on the repositories you choose. It asks for read and write access to code and pull requests (to commit to its own branch and open the pull request) and read-only access to checks. Agent Nick never pushes to your main branch, and it merges only when you click Accept & merge. Remove access anytime in your GitHub settings.",
  },
  {
    q: "Can I trust AI-written code?",
    a: "You don't have to trust it blindly. Every change is a normal pull request with an explanation, and your team reviews it before merging.",
  },
  {
    q: "Will this change how my site looks?",
    a: "No. Fixes are invisible to people: labels on buttons and fields, structured data, and actions agents can call.",
  },
  {
    q: "Will it hurt or help my Google rankings?",
    a: "It won't hurt. Server-rendered content, clear headings and structured data are what search engines already reward. Some fixes, like llms.txt, are for AI tools rather than Google, and Google says it ignores llms.txt for rankings. We never show agents different content from people.",
  },
  {
    q: "Are AI agents really visiting websites yet?",
    a: "Yes, and fast. Adobe Analytics measured a 693% jump in AI-referred visits to US retail sites in the 2025 holidays, and those visitors converted better. Your dashboard shows which agents visit your site.",
  },
  {
    q: "Which AI agents does this help?",
    a: "Any agent that reads web pages, like ChatGPT, Claude, Perplexity and Gemini. Browsers that support WebMCP, which Chrome is testing, can also call your site's actions directly.",
  },
  {
    q: "Can agents do things I don't want?",
    a: "No. For each action you choose allow, ask the person first, or deny. Agents can still browse like anyone else.",
  },
  {
    q: "How long does setup take? Do I need a developer?",
    a: "The score takes 30 seconds; connecting GitHub takes minutes. Someone who can approve a pull request reviews the changes, usually one developer, once.",
  },
  {
    q: "My score is already high. Do I still need this?",
    a: "Maybe not today. But sites change weekly, and one new form can break agent access. Paid plans alert you when your code changes and re-scan in one click.",
  },
  {
    q: "Is Free really free? Can I cancel anytime?",
    a: "Yes: $0, no card needed. Paid plans are monthly, and you can cancel anytime from the billing portal. Merged fixes stay in your code.",
  },
];
