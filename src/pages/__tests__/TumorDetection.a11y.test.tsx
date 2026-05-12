import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TumorDetection from "@/pages/TumorDetection";

// Silence the AI Navigator side-effect (it pops a global panel)
vi.mock("@/components/AINavigator", async () => {
  const actual = await vi.importActual<typeof import("@/components/AINavigator")>(
    "@/components/AINavigator",
  );
  return { ...actual, sayToNavigator: vi.fn() };
});

describe("TumorDetection accessibility — initial focus on redirect", () => {
  it("moves focus to the page's main heading after mount", async () => {
    render(
      <MemoryRouter initialEntries={["/tumor-detection"]}>
        <TumorDetection />
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", {
      level: 1,
      name: /Stage 2: Tumor Detection/i,
    });

    // Focus is moved on a 120ms timeout — wait it out deterministically.
    await new Promise((r) => setTimeout(r, 200));

    expect(heading).toHaveAttribute("tabindex", "-1");
    expect(document.activeElement).toBe(heading);
  });
});
