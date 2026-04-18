import { readFileSync } from "node:fs";
import path from "node:path";

export interface RawSpeaker {
  name: string;
  bio?: string;
  company?: string;
  talkTitle?: string;
  description?: string;
  date?: string | null;
  tags?: string[];
  imageUrl?: string;
  twitter?: string;
  bluesky?: string;
  linkedin?: string;
  panel?: unknown;
}

export interface Speaker {
  name: string;
  role: string;
  company: string;
  bio: string;
  talk: string;
  description: string;
  tags: string[];
  date: string | null;
  time: string;
  day: string | null;
  room: string;
  type: string;
  imageUrl: string;
  twitter: string;
  bluesky: string;
  linkedin: string;
  panel: unknown;
}

export interface ScheduleEvent {
  time: string;
  title: string;
  speaker: string;
  room: string;
  type: string;
  description?: string;
  tags?: string[];
}

export interface ScheduleDay {
  key: string;
  date: string;
  label: string;
  events: ScheduleEvent[];
}

const dataPath = path.join(import.meta.dirname, "data.json");
const raw = JSON.parse(readFileSync(dataPath, "utf-8")) as {
  speakers: RawSpeaker[];
};

const dateFixes: Record<string, string> = {
  "Sara Vieira": "2026-04-17T09:15+00:00",
  "Ali Spivak": "2026-04-17T14:00+00:00",
  "Tony Edwards": "2026-04-17T09:55+00:00",
  "Praveen Kumar Purushothaman": "2026-04-17T11:20+00:00",
  "Michael Hoffman": "2026-04-17T11:20+00:00",
  "Aprajita Verma": "2026-04-17T12:05+00:00",
  "Faris Aziz": "2026-04-17T14:25+01:00",
};

const logistics: Record<string, { room: string; type: string }> = {
  "Superpositioned Infraestructure and distributed Javascript": { room: "Tessl AI HQ", type: "meetup" },
  "WebGPU & the Future of Distributed Compute": { room: "Tessl AI HQ", type: "meetup" },
  "Pear: Hold my peer": { room: "Tessl AI HQ", type: "meetup" },
  "Build your own clanker in 15 minutes": { room: "Tessl AI HQ", type: "meetup" },
  "Pixel-Perfect AI: Making Agents Respect Your Figma Designs": { room: "Tessl AI HQ", type: "meetup" },
  "Silicon Valley Is Optional. GitHub Is Not. How to commit your way into the AI boom and how OpenJS is shaping responsible AI in the open.": { room: "Tessl AI HQ", type: "meetup" },

  "The New UX": { room: "Great Hall", type: "keynote" },
  "From Vibe Coding to Vibe Engineering": { room: "Great Hall", type: "talk" },
  "The New Node.js: Built-in Batteries and the Road Ahead": { room: "Great Hall", type: "talk" },
  "Implementing Server Driven UI": { room: "Great Hall", type: "talk" },
  "Pear - P2Pify all the apps": { room: "Great Hall", type: "talk" },
  "Segmentation fault! Low-level debugging for JS developers": { room: "Great Hall", type: "talk" },
  "The Other Local-First": { room: "Great Hall", type: "talk" },
  "Video Optimization for the Web: The Missing Piece in Lighthouse": { room: "Great Hall", type: "talk" },
  "Code Golf - Getting A Hole-in-One-(Liner)": { room: "Great Hall", type: "talk" },
  "Women in Tech the Panel ": { room: "Great Hall", type: "panel" },
  "Federation of Specialists: From Module Federation to AI Orchestration": { room: "Great Hall", type: "talk" },
  "Ripple: the Good Parts of React, Svelte, and Solid": { room: "Great Hall", type: "talk" },
  "The Dark Side of Micro-Frontends": { room: "Great Hall", type: "talk" },
  "The Future of the AI Bubble (Panel)": { room: "Great Hall", type: "panel" },
  "JavaScript: The Best Part": { room: "Great Hall", type: "keynote" },
  "Main stage MC": { room: "Great Hall", type: "mc" },

  "Beyond the Framework": { room: "Small Hall", type: "talk" },
  "React Beyond Components: The Rise of Generative UI": { room: "Small Hall", type: "talk" },
  "Achieving 93% Faster Next.js in (your) Kubernetes with Watt": { room: "Small Hall", type: "talk" },
  "A personal AI agent, off cloud, for $100": { room: "Small Hall", type: "talk" },
  "OTel You It's Not Just for Backend!": { room: "Small Hall", type: "talk" },
  "Replacing form libraries with native web APIs": { room: "Small Hall", type: "talk" },
  "Look ma, no hands! Multimodal AI-Agents in the browser": { room: "Small Hall", type: "talk" },
  "How to choose the right AI model for your project": { room: "Small Hall", type: "talk" },
  "Building Resilient UIs with React": { room: "Small Hall", type: "talk" },
  "A Decade and Counting: React’s Rhapsody of Life": { room: "Small Hall", type: "talk" },
  "What React Looks Like When Code Writes Itself": { room: "Small Hall", type: "talk" },
  "Improve your e-commerce with Agents and Model Context Protocol. ": { room: "Small Hall", type: "talk" },
  "JSBT: A Binary Serialization Format for Real JavaScript Object Graphs": { room: "Small Hall", type: "talk" },
  "JS at the speed of Rust: Oxc": { room: "Small Hall", type: "talk" },
  "MC Second Hall": { room: "Small Hall", type: "mc" },

  "From Isolation to Acceleration: Building the fastest payment platform on an iFrame": { room: "Session Room 1", type: "talk" },
  "WebAssembly + JavaScript: Partners, Not Competitors and Why now is the right time to pay attention": { room: "Session Room 1", type: "talk" },
  "Pigeon-Driven Development": { room: "Session Room 1", type: "talk" },
  "Effortlessly defend your dev machine from North Koreans on NPM": { room: "Session Room 1", type: "talk" },
  "Off-the-main-thread : Building fast, smooth and future-proof web apps.": { room: "Session Room 1", type: "talk" },

  "Securing AI-Generated Code with Semgrep": { room: "Session Room 2", type: "talk" },
  "Embeddable Agentic SaaS with A2UI and Microfrontends": { room: "Session Room 2", type: "talk" },
  "Embeddable Agentic SaaS with A2UI and Microfrontends ": { room: "Session Room 2", type: "talk" },
  "From Executor to Orchestrator: Building in the Age of AI Agents": { room: "Session Room 2", type: "talk" },
  "Six-Month Refactor in Six Days: Using AI to Update Deprecated JS Libraries": { room: "Session Room 2", type: "talk" },
  "MC ": { room: "Session Room 2", type: "mc" },
};

function timeOf(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const m = dateStr.match(/T(\d{2}:\d{2})/);
  return m ? m[1] : "";
}

function dayOf(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  return dateStr.slice(0, 10);
}

export const speakers: Speaker[] = raw.speakers.map((s) => {
  const date = dateFixes[s.name] ?? s.date ?? null;
  const log = logistics[s.talkTitle ?? ""] ?? { room: "TBA", type: "talk" };
  return {
    name: s.name.trim(),
    role: s.company ?? "",
    company: s.company ?? "",
    bio: s.bio ?? "",
    talk: (s.talkTitle ?? "").trim(),
    description: s.description ?? "",
    tags: s.tags ?? [],
    date,
    time: timeOf(date),
    day: dayOf(date),
    room: log.room,
    type: log.type,
    imageUrl: s.imageUrl ?? "",
    twitter: s.twitter ?? "",
    bluesky: s.bluesky ?? "",
    linkedin: s.linkedin ?? "",
    panel: s.panel ?? null,
  };
});

const dayMeta: Record<string, { key: string; date: string; label: string }> = {
  "2026-04-15": { key: "day1", date: "2026-04-15", label: "Day 1 — Evening Meetup @ Tessl AI HQ" },
  "2026-04-16": { key: "day2", date: "2026-04-16", label: "Day 2 — Workshops @ Just Eat Offices" },
  "2026-04-17": { key: "day3", date: "2026-04-17", label: "Day 3 — Main Conference @ Kensington Town Hall" },
};

const bucketed: Record<string, ScheduleDay> = {};
for (const sp of speakers) {
  if (!sp.day) continue;
  const meta = dayMeta[sp.day];
  if (!meta) continue;
  if (!bucketed[meta.key]) bucketed[meta.key] = { ...meta, events: [] };
  bucketed[meta.key]!.events.push({
    time: sp.time,
    title: sp.talk,
    speaker: sp.name,
    room: sp.room,
    type: sp.type,
    description: sp.description,
    tags: sp.tags,
  });
}

for (const day of Object.values(bucketed)) {
  day.events.sort((a, b) => a.time.localeCompare(b.time));
}

export const schedule: Record<"day1" | "day2" | "day3", ScheduleDay> = {
  day1: bucketed.day1 ?? { key: "day1", date: "2026-04-15", label: "Day 1 — Evening Meetup @ Tessl AI HQ", events: [] },
  day2: bucketed.day2 ?? { key: "day2", date: "2026-04-16", label: "Day 2 — Workshops @ Just Eat Offices", events: [] },
  day3: bucketed.day3 ?? { key: "day3", date: "2026-04-17", label: "Day 3 — Main Conference @ Kensington Town Hall", events: [] },
};
