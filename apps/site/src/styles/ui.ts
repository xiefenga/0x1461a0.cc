import { css, cva } from "../../styled-system/css";

export const container = css({
  width: "full", maxWidth: "reading", mx: "auto", px: { base: "4", sm: "12" },
});

export const iconButton = cva({
  base: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: "11", height: "11", flexShrink: "0", borderRadius: "control",
    color: "secondary", cursor: "pointer", textDecoration: "none",
    transition: "colors", transitionDuration: "feedback",
    _hover: { bg: "surface", color: "accent" },
    _active: { bg: "accentSoft" },
    "& svg": { width: "5", height: "5" },
  },
});

export const postRow = css({
  display: "flex", flexDirection: { base: "column", sm: "row" },
  alignItems: { base: "flex-start", sm: "baseline" }, justifyContent: "space-between",
  gap: { base: "1", sm: "6" }, py: "4", px: "3", mx: "-3",
  borderRadius: "control", color: "ink", textDecoration: "none", lineHeight: "compact",
  transition: "background", transitionDuration: "feedback", _hover: { bg: "surface" },
});
