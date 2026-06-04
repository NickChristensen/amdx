# TODO

## Mobile table overflow

- Markdown tables render through the generated shadcn table component, but on a real phone the page can still horizontally scroll instead of confining horizontal scroll to the table container.
- Agent Browser/Chromium mobile emulation at 375px and iPhone profile showed `document.scrollWidth === viewport width` and the table container scrolling independently, so this may be Safari/WebKit-specific or device/browser-state-specific.
- Revisit with real mobile Safari remote inspection or a browser trace from the device.
- Prefer keeping the generated shadcn table component as-is unless a targeted, well-understood fix is found.
