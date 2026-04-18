# CityJS London 2026 MCP

An MCP App server for the CityJS London 2026 conference. Exposes the schedule, speaker lineup, individual speaker profiles, and keyword search over talks — each rendered as a themed inline UI widget.

Built on [`@modelcontextprotocol/ext-apps`](https://www.npmjs.com/package/@modelcontextprotocol/ext-apps).

Heavily modified version of Tejas Kumar's [tejasq/basically-mcp-apps](https://github.com/tejasq/basically-mcp-apps) — thanks Tejas!

## Tools

| Tool | Arguments | Widget |
|------|-----------|--------|
| `get_schedule` | `day?: "day1" \| "day2" \| "day3" \| "all"` | Schedule timeline |
| `get_speakers` | `search?: string` | Speaker card grid |
| `get_speaker_detail` | `name: string` | Single speaker profile |
| `find_talks_by_topic` | `keyword: string` | Schedule timeline (filtered) |

## Requirements

- Node.js 20+
- `npm`

## Install

```bash
npm install
```

## Build

```bash
npm run build
```

Outputs three single-file widgets to `dist/` (`schedule.html`, `speakers.html`, `speaker-detail.html`).

## Run

Dev mode (watches both the UI build and the server):

```bash
npm run dev
```

HTTP only:

```bash
npm run serve
# → MCP server listening on http://localhost:3001/mcp
```

stdio transport:

```bash
npm run serve:stdio
```

## Exposing the server publicly via Cloudflare

Some MCP clients (including hosted ones) can't reach `localhost`. Use [`cloudflared`](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) to open a quick tunnel:

1. `npm run serve`
2. In another terminal: `cloudflared tunnel --url http://localhost:3001`
3. Append `/mcp` to the printed `trycloudflare.com` URL and use it as your MCP server URL.

## Project layout

```
server.ts                MCP tool + widget resource registration
main.ts                  HTTP + stdio transport entrypoint
src/
  schedule.html          Schedule widget entry
  speakers.html          Speakers grid entry
  speaker-detail.html    Speaker detail entry
  host.ts                Shared App/host-context setup
  schedule.ts            Schedule widget logic
  speakers.ts            Speakers widget logic
  speaker-detail.ts      Speaker detail widget logic
  global.css             Shared widget styles
data/
  data.json              Raw conference data (speakers, talks, bios)
  cityjs.ts              Enriches raw data with rooms, types, schedule buckets
vite.config.ts           Single-file bundle config (3 entry points)
```
