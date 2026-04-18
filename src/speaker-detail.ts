import { escapeHtml, initials, setupHost } from "./host.ts";
import "./global.css";

interface SpeakerDetail {
  name?: string;
  role?: string;
  company?: string;
  bio?: string;
  talk?: string;
  description?: string;
  tags?: string[];
  date?: string | null;
  time?: string;
  day?: string | null;
  room?: string;
  type?: string;
  imageUrl?: string;
  twitter?: string;
  bluesky?: string;
  linkedin?: string;
  error?: boolean;
  message?: string;
}

const contentEl = document.getElementById("content") as HTMLElement;

function socialUrl(kind: "twitter" | "bluesky" | "linkedin", handle?: string): string | null {
  if (!handle) return null;
  const h = handle.replace(/^@/, "").trim();
  if (!h) return null;
  if (h.startsWith("http")) return h;
  if (kind === "twitter") return `https://twitter.com/${h}`;
  if (kind === "bluesky") return `https://bsky.app/profile/${h}`;
  if (kind === "linkedin") return `https://linkedin.com/in/${h}`;
  return null;
}

function render(s: SpeakerDetail) {
  if (!s?.name) {
    contentEl.innerHTML = `<div class="empty">${escapeHtml(s?.message ?? "Speaker not found")}</div>`;
    return;
  }

  const tw = socialUrl("twitter", s.twitter);
  const bs = socialUrl("bluesky", s.bluesky);
  const li = socialUrl("linkedin", s.linkedin);
  const type = s.type || "talk";
  const avatar = s.imageUrl
    ? `<img src="${escapeHtml(s.imageUrl)}" alt="${escapeHtml(s.name)}" />`
    : escapeHtml(initials(s.name));

  contentEl.innerHTML = `
    <div class="detail-card">
      <div class="detail-top">
        <div class="detail-avatar">${avatar}</div>
        <div class="detail-top-info">
          <div class="detail-name">${escapeHtml(s.name)}</div>
          <div class="detail-role">${escapeHtml(s.role || s.company || "")}</div>
        </div>
      </div>
      <div class="detail-body">
        ${s.bio ? `<div class="detail-bio">${escapeHtml(s.bio)}</div>` : ""}
        <div class="session">
          <div class="session-type">
            <span class="badge badge-${escapeHtml(type)}">${escapeHtml(type)}</span>
          </div>
          <div class="session-title">${escapeHtml(s.talk || "TBA")}</div>
          <div class="session-meta">
            ${s.day ? `<span class="meta-chip">${escapeHtml(s.day)}</span>` : ""}
            ${s.time ? `<span class="meta-chip">${escapeHtml(s.time)}</span>` : ""}
            ${s.room ? `<span class="meta-chip">${escapeHtml(s.room)}</span>` : ""}
          </div>
          ${s.description ? `<div class="session-desc">${escapeHtml(s.description)}</div>` : ""}
          ${
            s.tags && s.tags.length
              ? `<div class="tags">${s.tags
                  .map((t) => `<span class="tag">#${escapeHtml(t.trim())}</span>`)
                  .join("")}</div>`
              : ""
          }
        </div>
        ${
          tw || bs || li
            ? `<div class="socials">
                ${tw ? `<a class="social-link" href="${escapeHtml(tw)}" target="_blank" rel="noopener">Twitter/X</a>` : ""}
                ${bs ? `<a class="social-link" href="${escapeHtml(bs)}" target="_blank" rel="noopener">Bluesky</a>` : ""}
                ${li ? `<a class="social-link" href="${escapeHtml(li)}" target="_blank" rel="noopener">LinkedIn</a>` : ""}
              </div>`
            : ""
        }
      </div>
    </div>
  `;
}

setupHost<SpeakerDetail>(render, "CityJS Speaker Detail");
