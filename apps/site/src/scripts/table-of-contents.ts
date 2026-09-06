let dispose: (() => void) | undefined;

const setupToc = () => {
  dispose?.();
  const toc = document.querySelector<HTMLElement>("[data-toc]");
  const prose = document.querySelector<HTMLElement>(".prose");
  if (!toc || !prose) { return; }
  const panel = toc.querySelector<HTMLElement>("[data-toc-panel]")!;
  const sticky = toc.querySelector<HTMLElement>(".toc-sticky")!;
  const nav = toc.querySelector<HTMLElement>(".toc-nav")!;
  const list = toc.querySelector<HTMLElement>(".toc-list")!;
  const dialog = toc.querySelector<HTMLDialogElement>("dialog")!;
  const trigger = toc.querySelector<HTMLButtonElement>(".toc-trigger")!;
  const compact = toc.querySelector<HTMLButtonElement>(".toc-compact")!;
  const entries = [...panel.querySelectorAll<HTMLAnchorElement>(".toc-link")]
    .map((link) => ({ link, heading: document.getElementById(decodeURIComponent(link.hash.slice(1))) }))
    .filter((entry): entry is { link: HTMLAnchorElement; heading: HTMLElement } => entry.heading !== null);
  if (!entries.length) { return; }
  entries.forEach(({ link }) => { link.removeAttribute("aria-current"); });

  const marker = document.createElement("li");
  marker.className = "toc-marker";
  marker.setAttribute("aria-hidden", "true");
  list.prepend(marker);
  const controller = new AbortController();
  const { signal } = controller;
  const wide = matchMedia("(min-width: 1360px)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let idleTimer = 0;
  let pointerInside = false;
  let active: HTMLAnchorElement | undefined;
  let restoreFocus = true;
  let previousOverflow: string | undefined;
  const unlockScroll = () => {
    if (previousOverflow !== undefined) {
      document.documentElement.style.overflow = previousOverflow;
      previousOverflow = undefined;
    }
    dialog.getAnimations().forEach((animation) => { animation.cancel(); });
  };
  const rail = toc.querySelector(".toc-rail")!;
  const dots = entries.map(() => {
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    rail.append(dot);
    return dot;
  });
  const setCompact = (value: boolean) => {
    const collapse = value && wide.matches && !pointerInside && !toc.contains(document.activeElement);
    toc.dataset.compact = String(collapse);
    panel.inert = collapse;
    compact.tabIndex = collapse ? 0 : -1;
  };
  const queueCompact = () => {
    clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      if (prose.getBoundingClientRect().top < 100) { setCompact(true); }
    }, 1400);
  };
  const closeDialog = () => {
    unlockScroll();
    dialog.close();
  };
  const syncLayout = () => {
    closeDialog();
    setCompact(false);
    (wide.matches ? sticky : toc.querySelector<HTMLElement>("[data-toc-slot]")!).prepend(panel);
    toc.dataset.ready = "true";
    schedule();
  };
  const update = () => {
    frame = 0;
    let current = entries[0];
    for (const entry of entries) {
      if (entry.heading.getBoundingClientRect().top <= 120) { current = entry; }
    }
    const article = prose.getBoundingClientRect();
    const travel = Math.max(1, article.height - innerHeight + 120);
    const progress = Math.min(100, Math.max(0, (120 - article.top) / travel * 100));
    if (progress >= 100) { current = entries[entries.length - 1]; }
    const changed = active !== current.link;
    if (changed) {
      active?.removeAttribute("aria-current");
      active = current.link;
      active.setAttribute("aria-current", "location");
      toc.querySelector<HTMLElement>(".toc-current")!.textContent = active.textContent;
      compact.title = active.textContent ?? "展开本文目录";
    }
    if (panel.getClientRects().length) {
      marker.style.setProperty("--toc-top", `${current.link.parentElement!.offsetTop}px`);
      marker.style.setProperty("--toc-height", `${current.link.offsetHeight}px`);
      if (changed || dialog.open) {
        const item = current.link.getBoundingClientRect();
        const bounds = nav.getBoundingClientRect();
        if (item.top < bounds.top || item.bottom > bounds.bottom) {
          nav.scrollTo({ top: current.link.parentElement!.offsetTop - nav.clientHeight / 2 + item.height / 2, behavior: reduced.matches ? "instant" : "smooth" });
        }
      }
    }
    const percentage = `${Math.round(progress)}%`;
    toc.querySelectorAll<HTMLElement>("[data-toc-progress]").forEach((label) => { label.textContent = percentage; });
    toc.querySelector('[role="progressbar"]')!.setAttribute("aria-valuenow", String(Math.round(progress)));
    toc.querySelector(".toc-ring-value")!.setAttribute("stroke-dashoffset", String(100 - progress));
    const y = 30 + progress * 1.8;
    const curve = `M8 0 L8 ${y - 30} C8 ${y - 12} 20 ${y - 12} 20 ${y} C20 ${y + 12} 8 ${y + 12} 8 ${y + 30} L8 240`;
    toc.querySelectorAll("[data-toc-rail], [data-toc-rail-active]").forEach((path) => { path.setAttribute("d", curve); });
    toc.querySelector("[data-toc-rail-active]")!.setAttribute("stroke-dashoffset", String(-progress * .88));
    toc.style.setProperty("--toc-rail-y", `${y}px`);
    dots.forEach((dot, index) => {
      const position = (entries[index].heading.getBoundingClientRect().top - article.top) / article.height;
      const cy = Math.min(238, Math.max(2, position * 240));
      const bump = Math.max(0, 1 - Math.abs(cy - y) / 30);
      dot.setAttribute("cy", String(cy));
      dot.setAttribute("cx", String(8 + 12 * bump * bump));
      dot.setAttribute("r", entries[index].link === active ? "2.5" : "1.5");
      dot.setAttribute("fill", entries[index].link === active ? "var(--colors-accent)" : "var(--colors-muted)");
    });
  };
  const schedule = () => { if (!frame) { frame = requestAnimationFrame(update); } };
  syncLayout();
  wide.addEventListener("change", syncLayout, { signal });
  window.addEventListener("scroll", () => { schedule(); queueCompact(); }, { passive: true, signal });
  window.addEventListener("resize", schedule, { signal });
  window.addEventListener("hashchange", schedule, { signal });
  const observer = new ResizeObserver(schedule);
  observer.observe(prose);
  observer.observe(nav);
  toc.addEventListener("pointerenter", () => { pointerInside = true; setCompact(false); }, { signal });
  toc.addEventListener("pointerleave", () => { pointerInside = false; queueCompact(); }, { signal });
  toc.addEventListener("focusin", () => { setCompact(false); }, { signal });
  toc.addEventListener("focusout", queueCompact, { signal });
  compact.addEventListener("click", () => { setCompact(false); entries.find(({ link }) => link === active)?.link.focus(); }, { signal });
  trigger.addEventListener("click", () => {
    setCompact(false);
    restoreFocus = true;
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    dialog.getAnimations().forEach((animation) => { animation.cancel(); });
    dialog.showModal();
    trigger.setAttribute("aria-expanded", "true");
    if (!reduced.matches) { dialog.animate([{ opacity: 0, transform: "translateY(28px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 260, easing: "cubic-bezier(.22,1,.36,1)" }); }
    update();
  }, { signal });
  dialog.addEventListener("close", () => {
    unlockScroll();
    trigger.setAttribute("aria-expanded", "false");
    if (restoreFocus && !wide.matches) { trigger.focus({ preventScroll: true }); }
  }, { signal });
  reduced.addEventListener("change", () => {
    if (reduced.matches) { dialog.getAnimations().forEach((animation) => { animation.cancel(); }); }
  }, { signal });
  toc.querySelector(".toc-close")!.addEventListener("click", closeDialog, { signal });
  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) { closeDialog(); }
  }, { signal });
  // A small downward swipe on the sheet header dismisses it; body remains scrollable.
  const handle = toc.querySelector<HTMLElement>(".toc-dialog-header")!;
  let startY: number | undefined;
  handle.addEventListener("pointerdown", (event) => {
    if (event.target instanceof Element && event.target.closest("button")) { return; }
    startY = event.clientY;
    handle.setPointerCapture(event.pointerId);
  }, { signal });
  handle.addEventListener("pointerup", (event) => {
    if (startY !== undefined && event.clientY - startY > 60) { closeDialog(); }
    startY = undefined;
  }, { signal });
  handle.addEventListener("pointercancel", () => { startY = undefined; }, { signal });
  toc.addEventListener("click", (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) { return; }
    const target = event.target instanceof Element ? event.target.closest("a.toc-link") : null;
    const entry = entries.find(({ link }) => link === target);
    if (!entry) { return; }
    event.preventDefault();
    if (dialog.open) { restoreFocus = false; closeDialog(); }
    if (location.hash !== entry.link.hash) { history.pushState(history.state, "", entry.link.hash); }
    entry.heading.tabIndex = -1;
    entry.heading.focus({ preventScroll: true });
    window.scrollTo({ top: entry.heading.getBoundingClientRect().top + scrollY - 100, behavior: reduced.matches ? "instant" : "smooth" });
  }, { signal });
  toc.querySelector("[data-toc-top]")!.addEventListener("click", () => {
    history.replaceState(history.state, "", location.pathname + location.search);
    window.scrollTo({ top: 0, behavior: reduced.matches ? "instant" : "smooth" });
  }, { signal });
  update();
  dispose = () => {
    controller.abort(); observer.disconnect(); cancelAnimationFrame(frame); clearTimeout(idleTimer);
    marker.remove(); dots.forEach((dot) => { dot.remove(); }); closeDialog();
  };
};

document.addEventListener("astro:before-swap", () => { dispose?.(); });
document.addEventListener("astro:page-load", setupToc);
setupToc();
