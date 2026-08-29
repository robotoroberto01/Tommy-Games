import { FACILITIES } from '../data.js'
import { useGame } from '../store.js'

/**
 * The room you're working in, drawn behind everything.
 *
 * It changes when you move site, so the garage really does become a shop and
 * then a data centre — progress you can see without reading a number.
 *
 * Two rules keep it from getting in the way:
 *
 *   1. It lives in the LOWER half. The top of the screen is dense (balance,
 *      meters, goal, warnings) and anything behind that is just noise. The
 *      bottom is mostly empty space around the coin, which is exactly where a
 *      backdrop earns its keep.
 *   2. It is drawn in the site's own accent at very low opacity, and it never
 *      uses the interface palette. Yellow still means "you can act here" — a
 *      background that borrowed it would quietly break that.
 *
 * All coordinates are in a 390x844 box (a phone screen) and the SVG is sliced,
 * so on a taller screen it crops rather than stretches.
 */

const SCENES = {
  // Where it all starts: a roll-up door, a concrete floor, a workbench.
  garage: (
    <>
      <path d="M42 498h306v248H42z" />
      <path d="M42 548h306M42 598h306M42 648h306M42 698h306" />
      <path d="M26 492h338" strokeWidth="3" />
      <path d="M0 770h390" strokeWidth="2" />
      {/* workbench and pegboard, left */}
      <path d="M0 664h72v82M12 746v-48M60 746v-48" />
      <path d="M14 628v22M30 624v26M46 630v20" />
      {/* stacked boxes, right */}
      <path d="M332 706h46v40h-46zM344 706v-22h34v22" />
    </>
  ),

  // A real storefront: awning, window, sign.
  shop: (
    <>
      <path d="M34 560h322v186H34z" />
      {/* awning with scalloped edge */}
      <path d="M22 500h346l-14 44H36z" />
      <path d="M40 544q11 14 22 0t22 0t22 0t22 0t22 0t22 0t22 0t22 0t22 0t22 0t22 0t22 0t22 0" />
      {/* window panes */}
      <path d="M62 590h120v120H62zM208 590h120v120H208z" />
      <path d="M122 590v120M62 650h120M268 590v120M208 650h120" />
      <path d="M0 770h390" strokeWidth="2" />
    </>
  ),

  // Rows of racks receding into a cold room.
  dataCenter: (
    <>
      <path d="M30 486h74v260H30zM118 486h74v260h-74zM206 486h74v260h-74zM294 486h74v260h-74z" />
      <path d="M30 538h74M30 590h74M30 642h74M30 694h74" />
      <path d="M118 538h74M118 590h74M118 642h74M118 694h74" />
      <path d="M206 538h74M206 590h74M206 642h74M206 694h74" />
      <path d="M294 538h74M294 590h74M294 642h74M294 694h74" />
      {/* status lights */}
      <path d="M40 512v.1M128 564v.1M216 616v.1M304 668v.1M40 668v.1M304 512v.1" strokeWidth="5" />
      <path d="M0 770h390" strokeWidth="2" />
    </>
  ),

  // Transmission towers and the lines strung between them.
  gridPartner: (
    <>
      <path d="M78 746V470M20 746l58-276 58 276M46 598h64M32 662h92M58 534h40" />
      <path d="M312 746V470M254 746l58-276 58 276M280 598h64M266 662h92M292 534h40" />
      {/* catenary */}
      <path d="M78 502q117 68 234 0M78 546q117 68 234 0" />
      <path d="M0 522q39 22 78 -20M312 502q39 42 78 20" />
      <path d="M0 770h390" strokeWidth="2" />
    </>
  ),

  // Looking down at a planet from somewhere you probably shouldn't be.
  orbital: (
    <>
      <path d="M-60 846a255 255 0 0 1 510 0" strokeWidth="2" />
      <path d="M-30 892a225 225 0 0 1 450 0" />
      {/* atmosphere band */}
      <path d="M-70 806a265 265 0 0 1 530 0" strokeDasharray="3 13" />
      {/* stars */}
      <path d="M54 520v.1M138 468v.1M246 502v.1M324 452v.1M92 604v.1M300 588v.1M188 430v.1M358 540v.1M20 466v.1" strokeWidth="4" />
      <path d="M270 640v.1M118 552v.1M348 622v.1" strokeWidth="3" />
    </>
  ),
}

export default function SiteBackdrop() {
  const level = useGame((s) => s.facilityLevel)
  const site = FACILITIES[level] ?? FACILITIES[0]
  const scene = SCENES[site.icon] ?? SCENES.garage

  return (
    <div className="site-backdrop" style={{ '--site': site.accent }} aria-hidden="true">
      <svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice">
        {scene}
      </svg>
    </div>
  )
}
