export function useSmoothScroll() {
  return (targetId) => {
    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });

    window.history.pushState(null, "", `#${targetId}`);
  };
}
