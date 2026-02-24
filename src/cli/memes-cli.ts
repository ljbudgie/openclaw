import type { Command } from "commander";

import { defaultRuntime } from "../runtime.js";
import { theme } from "../terminal/theme.js";

export type MemeCategory = "data-freedom" | "sovereignty" | "open-source" | "burgess-principle";

export type Meme = {
  id: string;
  title: string;
  art: string;
  category: MemeCategory;
  tags: string[];
};

export const MEMES: Meme[] = [
  {
    id: "your-data-your-rules",
    title: "Your Data, Your Rules",
    category: "sovereignty",
    tags: ["data", "control", "sovereignty"],
    art: [
      "╔══════════════════════════════════════════════════╗",
      "║  YOUR DATA.  YOUR RULES.  YOUR TERMINAL.         ║",
      "║                                                  ║",
      "║  No one can tell you what to do —                ║",
      "║             except the user.                     ║",
      "║                                                  ║",
      "║            (that's you, friend)                  ║",
      "╚══════════════════════════════════════════════════╝",
    ].join("\n"),
  },
  {
    id: "open-source-forever",
    title: "Open Source Forever",
    category: "open-source",
    tags: ["open-source", "free", "foss"],
    art: [
      "  ┌─────────────────────────────────────────────┐",
      "  │  Free as in freedom. Free as in free beer.  │",
      "  │  Free as in 'try and stop me, I have grep.' │",
      "  └─────────────────────────────────────────────┘",
      "          🦞 OpenClaw: fork it, own it.",
    ].join("\n"),
  },
  {
    id: "mog-the-system",
    title: "Mog the System",
    category: "sovereignty",
    tags: ["sovereignty", "system", "control"],
    art: [
      "  ╭────────────────────────────────────────╮",
      "  │                                        │",
      "  │   The system: 'You must use our app.'  │",
      "  │   You, running openclaw:               │",
      "  │                                        │",
      "  │        [ DECLINED ]                    │",
      "  │                                        │",
      "  │   Your chats. Your servers.            │",
      "  │   Your rules.  Full stop.              │",
      "  │                                        │",
      "  ╰────────────────────────────────────────╯",
    ].join("\n"),
  },
  {
    id: "burgess-principle",
    title: "The Burgess Principle",
    category: "burgess-principle",
    tags: ["burgess", "principle", "user-control"],
    art: [
      "┌──────────────────────────────────────────────────────┐",
      "│           T H E  B U R G E S S  P R I N C I P L E   │",
      "│                                                      │",
      '│  "No one can tell you what to do,                    │',
      '│         except the user."                            │',
      "│                                                      │",
      "│  The agent serves you. Not the cloud.               │",
      "│  Not the vendor. Not the algorithm.                  │",
      "│                                                      │",
      "│  You are the principal. You are the authority.       │",
      "│  The only permission that matters is yours.          │",
      "└──────────────────────────────────────────────────────┘",
    ].join("\n"),
  },
  {
    id: "self-hosted-supremacy",
    title: "Self-Hosted Supremacy",
    category: "data-freedom",
    tags: ["self-hosted", "local", "freedom"],
    art: [
      "  ╔═══════════════════════════════════════════╗",
      "  ║  Cloud: 'We'll store your messages safely.'║",
      "  ║  You: 'I'll host it myself, thanks.'       ║",
      "  ║                                            ║",
      "  ║  Cloud: 'But we have 99.9% uptime!'        ║",
      "  ║  You: 'I have root and a cron job.'        ║",
      "  ║                                            ║",
      "  ║      🦞 localhost supremacy 🦞             ║",
      "  ╚═══════════════════════════════════════════╝",
    ].join("\n"),
  },
  {
    id: "end-to-end-encrypted",
    title: "End-to-End Encrypted",
    category: "data-freedom",
    tags: ["encryption", "privacy", "e2e"],
    art: [
      "   Corporations reading your messages:",
      "",
      "      ┌───────────────────────────┐",
      "      │  ██████ ENCRYPTED ██████  │",
      "      │  ████████████████████████ │",
      "      │  ████ nope.jpeg ████████  │",
      "      └───────────────────────────┘",
      "",
      "   OpenClaw: your data, cipher-locked,",
      "              key held by you.",
    ].join("\n"),
  },
  {
    id: "no-senate-hearing",
    title: "No Senate Hearing Required",
    category: "open-source",
    tags: ["regulation", "freedom", "satire"],
    art: [
      "  Senator: 'How does your chat app work?'",
      "",
      "  Big Tech: *nervous sweating*",
      "",
      "  OpenClaw user:",
      "    $ cat src/provider-web.ts",
      "    # it's right there, senator",
      "",
      "  ✓ Open source — read the whole thing.",
      "  ✓ No terms-of-service roulette.",
      "  ✓ No 'we updated our privacy policy' emails.",
    ].join("\n"),
  },
  {
    id: "pure-sovereignty",
    title: "Pure Sovereignty",
    category: "sovereignty",
    tags: ["sovereignty", "ownership", "control"],
    art: [
      "  ┌──────────────────────────────────────────────────┐",
      "  │                                                  │",
      "  │  Other tools:  'We own the API, we own the data' │",
      "  │                                                  │",
      "  │  OpenClaw:     'You own everything.'             │",
      "  │                The messages. The keys.           │",
      "  │                The server. The shell.            │",
      "  │                The whole stack.                  │",
      "  │                                                  │",
      "  │  ← This is what sovereignty looks like. →       │",
      "  │                                                  │",
      "  └──────────────────────────────────────────────────┘",
    ].join("\n"),
  },
  {
    id: "exponential-reach",
    title: "Exponential Reach",
    category: "open-source",
    tags: ["open-source", "growth", "community"],
    art: [
      "  Fork it →  improve it →  merge it →",
      "                                       ↓",
      "  ← share it ←  ship it  ← test it  ←─╯",
      "       ↓",
      "  → fork it again →  (repeat ∞)",
      "",
      "  This is how open source compounds.",
      "  No VC required. No permission needed.",
      "  🦞 Just claws, commits, and momentum.",
    ].join("\n"),
  },
  {
    id: "lobster-liberation",
    title: "Lobster Liberation Front",
    category: "data-freedom",
    tags: ["lobster", "freedom", "fun"],
    art: [
      "        🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞",
      "        🦞                           🦞",
      "        🦞   LOBSTER LIBERATION      🦞",
      "        🦞        F R O N T          🦞",
      "        🦞                           🦞",
      "        🦞  We shall not be          🦞",
      "        🦞  rate-limited.            🦞",
      "        🦞                           🦞",
      "        🦞  We shall not be          🦞",
      "        🦞  terms-of-service'd.      🦞",
      "        🦞                           🦞",
      "        🦞  We shall pinch back.     🦞",
      "        🦞                           🦞",
      "        🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞",
    ].join("\n"),
  },
];

export type MemesListOptions = {
  json?: boolean;
  category?: string;
};

export type MemesShowOptions = {
  json?: boolean;
};

export type MemesRandomOptions = {
  json?: boolean;
  category?: string;
};

export function formatMemeSingle(meme: Meme, opts: MemesShowOptions = {}): string {
  if (opts.json) {
    return JSON.stringify(meme, null, 2);
  }
  const lines: string[] = [];
  lines.push(`${theme.heading(meme.title)} ${theme.muted(`[${meme.category}]`)}`);
  lines.push("");
  lines.push(theme.accent(meme.art));
  lines.push("");
  lines.push(theme.muted(`Tags: ${meme.tags.join(", ")}`));
  return lines.join("\n");
}

export function formatMemesList(memes: Meme[], opts: MemesListOptions = {}): string {
  if (opts.json) {
    return JSON.stringify(
      memes.map((m) => ({ id: m.id, title: m.title, category: m.category, tags: m.tags })),
      null,
      2,
    );
  }
  if (memes.length === 0) {
    return "No memes found.";
  }
  const lines: string[] = [];
  lines.push(theme.heading(`Memes (${memes.length})`));
  lines.push("");
  for (const meme of memes) {
    lines.push(`  ${theme.command(meme.id.padEnd(28))} ${theme.muted(meme.title)}`);
  }
  lines.push("");
  lines.push(theme.muted("Use `openclaw memes show <id>` to display a meme."));
  lines.push(theme.muted("Use `openclaw memes random` to get a random meme."));
  return lines.join("\n");
}

function filterMemesByCategory(memes: Meme[], category?: string): Meme[] {
  if (!category) {
    return memes;
  }
  return memes.filter((m) => m.category === category);
}

export function registerMemesCli(program: Command) {
  const memes = program
    .command("memes")
    .description("Sovereign memes about data freedom, open source, and user control")
    .addHelpText(
      "after",
      () => `\n${theme.muted("Mog the system — your data, your rules, your laughs.")}\n`,
    );

  memes
    .command("list")
    .description("List available memes")
    .option("--json", "Output as JSON", false)
    .option(
      "--category <category>",
      "Filter by category (data-freedom|sovereignty|open-source|burgess-principle)",
    )
    .action((opts: MemesListOptions) => {
      const filtered = filterMemesByCategory(MEMES, opts.category);
      defaultRuntime.log(formatMemesList(filtered, opts));
    });

  memes
    .command("show")
    .description("Display a specific meme by ID")
    .argument("<id>", "Meme ID (use `memes list` to see IDs)")
    .option("--json", "Output as JSON", false)
    .action((id: string, opts: MemesShowOptions) => {
      const meme = MEMES.find((m) => m.id === id);
      if (!meme) {
        defaultRuntime.error(
          `Meme "${id}" not found. Run \`openclaw memes list\` to see available memes.`,
        );
        defaultRuntime.exit(1);
        return;
      }
      defaultRuntime.log(formatMemeSingle(meme, opts));
    });

  memes
    .command("random")
    .description("Display a random meme")
    .option("--json", "Output as JSON", false)
    .option(
      "--category <category>",
      "Pick from a specific category (data-freedom|sovereignty|open-source|burgess-principle)",
    )
    .action((opts: MemesRandomOptions) => {
      const pool = filterMemesByCategory(MEMES, opts.category);
      if (pool.length === 0) {
        defaultRuntime.error("No memes found for that category.");
        defaultRuntime.exit(1);
        return;
      }
      const meme = pool[Math.floor(Math.random() * pool.length)];
      defaultRuntime.log(formatMemeSingle(meme, opts));
    });

  // Default action: show a random meme
  memes.action(() => {
    const meme = MEMES[Math.floor(Math.random() * MEMES.length)];
    defaultRuntime.log(formatMemeSingle(meme));
  });
}
