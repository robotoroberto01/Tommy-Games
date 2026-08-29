// The icon set.
//
// Every icon is drawn on the same 24x24 grid with the same 2px stroke and no
// fill, so they all look like they belong together and they all take their
// colour from whatever text colour is around them.
//
// This replaced the emoji the game used to use. Emoji were quick to write but
// they render differently on every phone, they can't be recoloured, and two of
// the ones in use here weren't reliable emoji at all — Server Rack and Cold
// Room were bare Unicode symbols that show up as an empty box on some devices.
//
// TO ADD AN ICON: add an entry to PATHS below, then use <Icon name="yourName" />.
// Keep it inside the 24x24 box with a couple of px of margin, use only stroke
// (never fill), and don't set a colour — the surrounding text colour wins.

const PATHS = {
  // ---- rigs, in the order they unlock -------------------------------------
  handCrank: (
    <>
      <circle cx="7" cy="17" r="2.5" />
      <path d="M7 17L13 7h5" />
    </>
  ),
  usbMiner: (
    <>
      <rect x="8" y="7" width="8" height="13" rx="1.5" />
      <path d="M10 7V4M14 7V4" />
    </>
  ),
  gpuRig: (
    <>
      <rect x="3" y="7" width="18" height="11" rx="1.5" />
      <circle cx="9" cy="12.5" r="3" />
      <path d="M15 10h3M15 13h3M15 16h3" />
    </>
  ),
  asicBox: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
      <path d="M9 6V3M15 6V3M9 21v-3M15 21v-3M6 9H3M6 15H3M21 9h-3M21 15h-3" />
    </>
  ),
  miniRack: (
    <>
      <rect x="4" y="6" width="16" height="5" rx="1" />
      <rect x="4" y="13" width="16" height="5" rx="1" />
    </>
  ),
  serverRack: (
    <>
      <rect x="4" y="3" width="16" height="4" rx="1" />
      <rect x="4" y="10" width="16" height="4" rx="1" />
      <rect x="4" y="17" width="16" height="4" rx="1" />
    </>
  ),
  coldRoom: <path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9" />,
  warehouse: (
    <>
      <path d="M3 10l9-6 9 6v10H3z" />
      <path d="M8 20v-6h8v6" />
    </>
  ),
  solarArray: (
    <>
      <rect x="3" y="11" width="18" height="8" rx="1" />
      <path d="M9 11v8M15 11v8M3 15h18" />
      <path d="M12 3v4M7 5.5l1.6 2.2M17 5.5l-1.6 2.2" />
    </>
  ),
  gridTap: <path d="M12 3v18M6 21l6-14 6 14M8.5 12h7M7 16h10" />,
  orbitalRelay: (
    <>
      <circle cx="12" cy="9.5" r="5.5" />
      <path d="M12 15v6M8.5 21h7" />
    </>
  ),
  quantumCore: (
    <>
      <circle cx="12" cy="12" r="2.5" />
      <ellipse cx="12" cy="12" rx="9.5" ry="4" />
      <ellipse cx="12" cy="12" rx="4" ry="9.5" />
    </>
  ),

  // ---- sites --------------------------------------------------------------
  garage: (
    <>
      <path d="M4 20V9l8-5 8 5v11" />
      <path d="M8 20v-6h8v6" />
    </>
  ),
  shop: (
    <>
      <path d="M4 9h16v11H4z" />
      <path d="M3 9l2-5h14l2 5" />
    </>
  ),
  dataCenter: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M8 7h8M8 11h8M8 15h8" />
    </>
  ),
  gridPartner: <path d="M12 3v18M6 21l6-14 6 14M8.5 12h7M7 16h10" />,
  orbital: (
    <>
      <circle cx="12" cy="12" r="3.5" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-22 12 12)" />
    </>
  ),

  // ---- infrastructure -----------------------------------------------------
  generator: (
    <>
      <rect x="3" y="7" width="16" height="10" rx="2" />
      <path d="M21 10.5v3" />
      <path d="M11.5 9.5l-2.5 3.5h3l-2 3" />
    </>
  ),
  coolingUnit: (
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 10c0-4 6-3.4 6 0.6M14 12c4 0 3.4 6-0.6 6M12 14c0 4-6 3.4-6-0.6M10 12c-4 0-3.4-6 0.6-6" />
    </>
  ),

  // ---- crew ---------------------------------------------------------------
  hardHat: (
    <>
      <path d="M4.5 16a7.5 7.5 0 0 1 15 0" />
      <path d="M9.5 9.2a3 3 0 0 1 5 0" />
      <path d="M3 16h18" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9.5 4V2.8h5V4" />
      <path d="M9 11h6M9 15h4" />
    </>
  ),
  flask: (
    <>
      <path d="M10 3v6.5L5.5 18a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L14 9.5V3" />
      <path d="M9 3h6" />
    </>
  ),
  headset: (
    <>
      <path d="M4.5 14v-2a7.5 7.5 0 0 1 15 0v2" />
      <rect x="2.5" y="13" width="4" height="6" rx="1.5" />
      <rect x="17.5" y="13" width="4" height="6" rx="1.5" />
    </>
  ),

  // ---- the coin you tap ---------------------------------------------------
  // A Bitcoin-style B: a stem with two bowls and four ticks crossing top and
  // bottom. Drawn rather than borrowed, so it's Hashline's own coin and it
  // matches the rest of the set instead of sitting in it as foreign artwork.
  hashCoin: (
    <>
      <path d="M8 4.6v14.8" />
      <path d="M8 4.6h5.6a3.3 3.3 0 0 1 0 6.6H8" />
      <path d="M8 11.2h6.4a4.1 4.1 0 0 1 0 8.2H8" />
      <path d="M11 2.1v2.5M15 2.1v2.5M11 19.4v2.5M15 19.4v2.5" />
    </>
  ),

  // ---- market -------------------------------------------------------------
  crate: (
    <>
      <path d="M3 8.5l9-4.5 9 4.5v7L12 20l-9-4.5z" />
      <path d="M3 8.5l9 4.5 9-4.5M12 13v7" />
      <path d="M12 4v9" />
    </>
  ),
  dice: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9 9v.01M15 15v.01M12 12v.01" />
    </>
  ),

  // ---- interface ----------------------------------------------------------
  bolt: <path d="M13 3L5 14h6l-1 7 8-11h-6z" />,
  gem: <path d="M12 3l9 9-9 9-9-9z" />,
  person: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  rebuild: (
    <>
      <circle cx="7" cy="5" r="2" />
      <circle cx="17" cy="5" r="2" />
      <circle cx="12" cy="19" r="2" />
      <path d="M7 7v3a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V7M12 13v4" />
    </>
  ),
  arrowUp: <path d="M12 20V4M5 11l7-7 7 7" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  chevronRight: <path d="M9 5l7 7-7 7" />,
  chevronLeft: <path d="M15 5l-7 7 7 7" />,
  play: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M10 9.5l5 2.5-5 2.5z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.2 1.9" />
    </>
  ),
  warning: (
    <>
      <path d="M12 3.5L21.5 20H2.5z" />
      <path d="M12 10v4.5M12 17.4v.2" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8.5 10V7a3.5 3.5 0 0 1 7 0v3" />
    </>
  ),
  plus: <path d="M12 6v12M6 12h12" />,
  check: <path d="M5 12.5l5 5L19 7" />,
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
}

/**
 * Draw an icon.
 *
 *   <Icon name="handCrank" />
 *   <Icon name="bolt" size={16} />
 *
 * It has no colour of its own — it uses the text colour of whatever it sits in,
 * so to recolour one, set `color` on the element around it.
 */
export default function Icon({ name, size = 22, className = '', style }) {
  const paths = PATHS[name]
  if (!paths) return null

  return (
    <svg
      className={`hl-icon${className ? ' ' + className : ''}`}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {paths}
    </svg>
  )
}
