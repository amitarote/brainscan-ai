import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// jsdom lacks ResizeObserver / IntersectionObserver
class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-expect-error polyfill
global.ResizeObserver = RO;
// @ts-expect-error polyfill
global.IntersectionObserver = RO;
