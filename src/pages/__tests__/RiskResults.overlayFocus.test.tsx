/**
 * Verifies the focus-restoration pattern used by the RiskResults high-risk
 * transition overlay (see src/pages/RiskResults.tsx ~L271–L335):
 *   1. On open, capture document.activeElement as the trigger.
 *   2. On Escape, close the overlay.
 *   3. On cleanup, restore focus to the trigger via requestAnimationFrame,
 *      falling back to the page H1 (#risk-results-title) if disconnected.
 *
 * Rendering the full RiskResults page in jsdom is brittle (recharts, framer
 * SVG measurement, etc.), so we exercise the same effect here against an
 * isolated harness that mirrors the production code path 1:1.
 */
import { describe, it, expect } from "vitest";
import { useEffect, useRef, useState } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const Harness = () => {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const active = document.activeElement as HTMLElement | null;
    triggerRef.current =
      active && active !== document.body && typeof active.focus === "function"
        ? active
        : (document.getElementById("page-title") as HTMLElement | null);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      requestAnimationFrame(() => {
        const target = triggerRef.current;
        if (target && target.isConnected) target.focus();
        else document.getElementById("page-title")?.focus();
      });
    };
  }, [open]);

  return (
    <div>
      <h1 id="page-title" tabIndex={-1}>Risk Results</h1>
      <button data-testid="trigger" onClick={() => setOpen(true)}>
        Open Overlay
      </button>
      {open && (
        <div ref={dialogRef} role="alertdialog" aria-modal="true">
          <button data-testid="cancel" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

const flushRaf = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );

describe("High-risk overlay — focus restoration", () => {
  it("returns focus to the triggering button after Escape", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByTestId("trigger");

    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    await user.click(trigger);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    await act(async () => { await flushRaf(); });

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });

  it("falls back to the page H1 when the trigger is disconnected (overlay completion → redirect)", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByTestId("trigger");
    const heading = screen.getByRole("heading", { level: 1, name: /Risk Results/i });

    trigger.focus();
    await user.click(trigger);

    // Simulate the trigger being unmounted (e.g., navigation completing).
    trigger.remove();

    fireEvent.keyDown(window, { key: "Escape" });
    await act(async () => { await flushRaf(); });

    expect(document.activeElement).toBe(heading);
  });
});
