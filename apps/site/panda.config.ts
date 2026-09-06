import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,
  include: ["./src/**/*.{astro,ts,tsx}"],
  exclude: ["./src/__tests__/**"],
  outdir: "styled-system",
  strictTokens: true,
  conditions: {
    extend: { dark: ".dark &" },
  },
  theme: {
    extend: {
      semanticTokens: {
        colors: {
          paper: { value: { base: "#faf8f5", _dark: "#202122" } },
          surface: { value: { base: "#f0ece6", _dark: "#2b2c2d" } },
          ink: { value: { base: "#292825", _dark: "#e9e5df" } },
          secondary: { value: { base: "#615e58", _dark: "#c0b9ae" } },
          muted: { value: { base: "#706a62", _dark: "#aaa297" } },
          line: { value: { base: "#dcd6cc", _dark: "#414244" } },
          accent: { value: { base: "#94552e", _dark: "#e0a06a" } },
          accentSoft: { value: { base: "#eee1d5", _dark: "#3b3028" } },
        },
      },
      tokens: {
        fonts: {
          body: { value: "'Instrument Sans Variable', 'PingFang SC', 'Microsoft YaHei', sans-serif" },
          heading: { value: "'Newsreader Variable', 'Noto Serif SC', 'Songti SC', Georgia, serif" },
          code: { value: "'JetBrains Mono Variable', 'SFMono-Regular', Consolas, monospace" },
        },
        fontSizes: {
          meta: { value: "0.8125rem" },
          body: { value: "1rem" },
          section: { value: "1.5rem" },
          title: { value: "clamp(1.75rem, 4vw, 2.25rem)" },
        },
        lineHeights: { reading: { value: "1.85" }, compact: { value: "1.6" } },
        durations: { feedback: { value: "220ms" } },
        sizes: { reading: { value: "60.25rem" } },
        spacing: { gutter: { value: "clamp(1rem, 4vw, 1.5rem)" } },
        radii: {
          control: { value: "0.5rem" },
          block: { value: "0.75rem" },
        },
      },
      textStyles: {
        body: { value: { fontFamily: "body", fontSize: "body", lineHeight: "1.85" } },
        meta: { value: { fontSize: "meta", lineHeight: "1.6", color: "muted" } },
        title: { value: { fontFamily: "heading", fontSize: "title", fontWeight: "500", lineHeight: "1.4" } },
        section: { value: { fontFamily: "heading", fontSize: "section", fontWeight: "500", lineHeight: "1.4" } },
      },
    },
  },
});
