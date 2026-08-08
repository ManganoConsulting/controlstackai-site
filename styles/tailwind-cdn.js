/* Design tokens lifted from the Agentic OS Center Island
   (controlstackai-nixos/modules/quickshell/alina-bar/shell.qml) by way of the
   product film's src/theme.ts, so the site and the system on screen read as one
   brand rather than two that happen to share a blue. */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        ink: '#07111f',     // base00 — page background
        surface: '#0d1b2e', // base01 — panels, the island
        edge: '#24466f',    // base02 — borders
        // base03 (#4a6285) is the island's de-emphasised UI colour, but as body
        // copy on #07111f it lands at 2.98:1 and fails WCAG AA. Lifted to the
        // nearest tone that clears 4.5:1.
        dim: '#6b82a3',
        muted: '#a3b8d4',   // base04 — body copy
        fg: '#dce7f7',      // base05 — headings
        accent: '#6cb0ff',  // base0D — links, primary action
        voice: '#a67df3',   // hero purple — the realtime voice affordance
        ok: '#7ee0a8',
        warn: '#ffbf69',
        grid: '#1F2937'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      }
    }
  }
};
