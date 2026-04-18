import {
  App,
  applyDocumentTheme,
  applyHostFonts,
  applyHostStyleVariables,
  type McpUiHostContext,
} from "@modelcontextprotocol/ext-apps";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]!)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function setupHost<T>(
  render: (data: T) => void,
  name = "CityJS Widget",
): App {
  const app = new App({ name, version: "1.0.0" });

  app.onteardown = async () => ({});
  app.onerror = console.error;

  app.ontoolresult = (result: CallToolResult) => {
    const sc = result.structuredContent as T | undefined;
    if (sc) render(sc);
  };

  app.onhostcontextchanged = (ctx: McpUiHostContext) => {
    if (ctx.theme) applyDocumentTheme(ctx.theme);
    if (ctx.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
    if (ctx.styles?.css?.fonts) applyHostFonts(ctx.styles.css.fonts);
    if (ctx.safeAreaInsets) {
      const { top, right, bottom, left } = ctx.safeAreaInsets;
      document.body.style.paddingTop = `${top + 16}px`;
      document.body.style.paddingRight = `${right + 16}px`;
      document.body.style.paddingBottom = `${bottom + 16}px`;
      document.body.style.paddingLeft = `${left + 16}px`;
    }
  };

  app.connect().then(() => {
    const ctx = app.getHostContext();
    if (ctx && app.onhostcontextchanged) app.onhostcontextchanged(ctx);
  });

  return app;
}
