import { escapeHtml, setupHost } from "./host.ts";
import "./global.css";

interface ScheduleEvent {
  time: string;
  title: string;
  speaker?: string;
  room?: string;
  type?: string;
}

interface ScheduleDay {
  key: string;
  date: string;
  label: string;
  events: ScheduleEvent[];
}

interface ScheduleData {
  days: ScheduleDay[];
}

const contentEl = document.getElementById("content") as HTMLElement;

function render(data: ScheduleData) {
  if (!data?.days?.length) {
    contentEl.innerHTML = '<div class="empty">No schedule data available</div>';
    return;
  }

  contentEl.innerHTML = data.days
    .map((day) => {
      const dateLabel = day.date ? ` &mdash; ${escapeHtml(day.date)}` : "";
      const events = day.events.length
        ? day.events
            .map((ev) => {
              const type = ev.type || "talk";
              return `
                <div class="event">
                  <div class="event-time">${escapeHtml(ev.time || "")}</div>
                  <div class="event-info">
                    <div class="event-title">
                      ${escapeHtml(ev.title || "")}
                      <span class="badge badge-${escapeHtml(type)}">${escapeHtml(type)}</span>
                    </div>
                    ${ev.speaker ? `<div class="event-speaker">${escapeHtml(ev.speaker)}</div>` : ""}
                    ${ev.room ? `<div class="event-room">${escapeHtml(ev.room)}</div>` : ""}
                  </div>
                </div>
              `;
            })
            .join("")
        : '<div class="empty">No events</div>';

      return `
        <div class="day">
          <div class="day-header">${escapeHtml(day.label)}${dateLabel}</div>
          <div class="day-body">${events}</div>
        </div>
      `;
    })
    .join("");
}

setupHost<ScheduleData>(render, "CityJS Schedule");
