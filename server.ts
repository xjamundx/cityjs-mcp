import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult, ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { speakers, schedule, type ScheduleDay } from "./data/cityjs.ts";

const DIST_DIR = import.meta.filename.endsWith(".ts")
  ? path.join(import.meta.dirname, "dist")
  : import.meta.dirname;

const SCHEDULE_URI = "ui://cityjs/schedule.html";
const SPEAKERS_URI = "ui://cityjs/speakers.html";
const SPEAKER_DETAIL_URI = "ui://cityjs/speaker-detail.html";

const readOnly = {
  readOnlyHint: true,
  idempotentHint: true,
  openWorldHint: false,
};

const scheduleDaySchema = z.object({
  key: z.string(),
  date: z.string(),
  label: z.string(),
  events: z.array(
    z.object({
      time: z.string(),
      title: z.string(),
      speaker: z.string(),
      room: z.string(),
      type: z.string(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }),
  ),
});

const speakerSchema = z.object({
  name: z.string(),
  role: z.string().optional(),
  company: z.string().optional(),
  bio: z.string().optional(),
  talk: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  date: z.string().nullable().optional(),
  time: z.string().optional(),
  day: z.string().nullable().optional(),
  room: z.string().optional(),
  type: z.string().optional(),
  imageUrl: z.string().optional(),
  twitter: z.string().optional(),
  bluesky: z.string().optional(),
  linkedin: z.string().optional(),
});

function registerWidget(server: McpServer, uri: string, filename: string) {
  registerAppResource(
    server,
    uri,
    uri,
    { mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => {
      const html = await fs.readFile(path.join(DIST_DIR, filename), "utf-8");
      return {
        contents: [{ uri, mimeType: RESOURCE_MIME_TYPE, text: html }],
      };
    },
  );
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: "CityJS London 2026 MCP App",
    version: "1.0.0",
  });

  registerWidget(server, SCHEDULE_URI, "schedule.html");
  registerWidget(server, SPEAKERS_URI, "speakers.html");
  registerWidget(server, SPEAKER_DETAIL_URI, "speaker-detail.html");

  registerAppTool(
    server,
    "get_schedule",
    {
      title: "Get Schedule",
      description:
        "Show the CityJS London 2026 schedule. Filter by day: day1=Apr 15 meetup, day2=Apr 16 workshops, day3=Apr 17 main conference. Omit `day` or pass 'all' for the full three-day view.",
      inputSchema: {
        day: z.enum(["day1", "day2", "day3", "all"]).optional(),
      },
      outputSchema: z.object({ days: z.array(scheduleDaySchema) }),
      annotations: readOnly,
      _meta: { ui: { resourceUri: SCHEDULE_URI } },
    },
    async ({ day }): Promise<CallToolResult> => {
      const days: ScheduleDay[] =
        day && day !== "all"
          ? [schedule[day]]
          : [schedule.day1, schedule.day2, schedule.day3];

      return {
        content: [{ type: "text", text: JSON.stringify({ days }, null, 2) }],
        structuredContent: { days },
      };
    },
  );

  registerAppTool(
    server,
    "get_speakers",
    {
      title: "Get Speakers",
      description:
        "Show the CityJS London 2026 speaker lineup as a card grid. Optionally search by name to narrow the grid.",
      inputSchema: {
        search: z.string().optional().describe("Substring match on speaker name"),
      },
      outputSchema: z.object({ speakers: z.array(speakerSchema) }),
      annotations: readOnly,
      _meta: { ui: { resourceUri: SPEAKERS_URI } },
    },
    async ({ search }): Promise<CallToolResult> => {
      const results = search
        ? speakers.filter((s) =>
            s.name.toLowerCase().includes(search.toLowerCase()),
          )
        : speakers;

      const compact = results.map((s) => ({
        name: s.name,
        role: s.role,
        company: s.company,
        talk: s.talk,
        time: s.time,
        room: s.room,
        type: s.type,
        imageUrl: s.imageUrl,
      }));

      return {
        content: [
          { type: "text", text: JSON.stringify({ speakers: compact }, null, 2) },
        ],
        structuredContent: { speakers: compact },
      };
    },
  );

  registerAppTool(
    server,
    "get_speaker_detail",
    {
      title: "Get Speaker Detail",
      description:
        "Show a single CityJS London 2026 speaker's full profile — bio, talk, time slot, room, tags, and social links.",
      inputSchema: {
        name: z
          .string()
          .describe("Speaker name, e.g. 'Douglas Crockford', 'Rich Harris'."),
      },
      outputSchema: z.looseObject({
        name: z.string().optional(),
        error: z.boolean().optional(),
        message: z.string().optional(),
      }),
      annotations: readOnly,
      _meta: { ui: { resourceUri: SPEAKER_DETAIL_URI } },
    },
    async ({ name }): Promise<CallToolResult> => {
      const speaker = speakers.find((s) =>
        s.name.toLowerCase().includes(name.toLowerCase()),
      );
      if (!speaker) {
        const err = { error: true as const, message: `Speaker "${name}" not found.` };
        return {
          content: [{ type: "text", text: err.message }],
          structuredContent: err,
        };
      }
      return {
        content: [{ type: "text", text: JSON.stringify(speaker, null, 2) }],
        structuredContent: { ...speaker },
      };
    },
  );

  registerAppTool(
    server,
    "find_talks_by_topic",
    {
      title: "Find Talks By Topic",
      description:
        "Search CityJS London 2026 talks by keyword across titles, descriptions, speaker names, and tags (e.g. 'AI', 'React', 'Node', 'MCP', 'performance'). Results render in the schedule view.",
      inputSchema: {
        keyword: z.string().describe("Keyword to search for"),
      },
      outputSchema: z.object({ days: z.array(scheduleDaySchema) }),
      annotations: readOnly,
      _meta: { ui: { resourceUri: SCHEDULE_URI } },
    },
    async ({ keyword }): Promise<CallToolResult> => {
      const kw = keyword.toLowerCase();
      const matches = speakers
        .filter(
          (s) =>
            s.talk.toLowerCase().includes(kw) ||
            s.name.toLowerCase().includes(kw) ||
            s.description.toLowerCase().includes(kw) ||
            s.tags.some((t) => t.toLowerCase().includes(kw)),
        )
        .map((s) => ({
          time: s.time,
          title: s.talk,
          speaker: s.name,
          room: s.room,
          type: s.type,
        }));

      const days = [
        {
          key: "search",
          date: "",
          label: `Talks matching "${keyword}" (${matches.length})`,
          events: matches,
        },
      ];

      return {
        content: [{ type: "text", text: JSON.stringify({ days }, null, 2) }],
        structuredContent: { days },
      };
    },
  );

  return server;
}
