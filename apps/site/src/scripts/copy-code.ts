// Delegation survives Astro ClientRouter swaps without duplicating listeners.
document.addEventListener("click", async (event) => {
  if (!(event.target instanceof Element)) { return; }
  const button = event.target.closest<HTMLButtonElement>(".code-block-copy");
  const code = button?.closest(".code-block-wrapper")?.querySelector("code");
  if (!button || !code || button.dataset.pending === "true" || button.dataset.isCopying === "true") { return; }
  const status = document.getElementById("copy-status");
  button.dataset.pending = "true";
  try {
    await navigator.clipboard.writeText(code.textContent ?? "");
    button.dataset.isCopying = "true";
    button.setAttribute("aria-label", "已复制代码");
    if (status) { status.textContent = "代码已复制"; }
  } catch {
    button.setAttribute("aria-label", "复制失败，点击重试");
    if (status) { status.textContent = "复制失败，请重试或手动选择代码复制"; }
  } finally {
    delete button.dataset.pending;
    window.setTimeout(() => {
      delete button.dataset.isCopying;
      button.setAttribute("aria-label", "复制代码");
      if (status) { status.textContent = ""; }
    }, 2000);
  }
});
