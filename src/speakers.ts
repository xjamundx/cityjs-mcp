import { escapeHtml, initials, setupHost } from "./host.ts";
import "./global.css";

interface SpeakerCard {
  name: string;
  role?: string;
  talk?: string;
  imageUrl?: string;
}

interface SpeakersData {
  speakers: SpeakerCard[];
}

const gridEl = document.getElementById("grid") as HTMLElement;

function render(data: SpeakersData) {
  if (!data?.speakers?.length) {
    gridEl.innerHTML = '<div class="empty">No speakers found</div>';
    return;
  }

  gridEl.innerHTML = data.speakers
    .map((s) => {
      const avatar = s.imageUrl
        ? `<img src="${escapeHtml(s.imageUrl)}" alt="${escapeHtml(s.name)}" />`
        : escapeHtml(initials(s.name));
      return `
        <div class="speaker-card">
          <div class="speaker-avatar">${avatar}</div>
          <div class="speaker-name">${escapeHtml(s.name)}</div>
          ${s.role ? `<div class="speaker-role">${escapeHtml(s.role)}</div>` : ""}
          ${s.talk ? `<div class="speaker-talk">${escapeHtml(s.talk)}</div>` : ""}
        </div>
      `;
    })
    .join("");
}

setupHost<SpeakersData>(render, "CityJS Speakers");
