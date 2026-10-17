/** Fixed stock MY25 KTM 450 SX-F markings, traced from the OEM side photographs.
 * Reference image dimensions: 918 × 629 pixels. Coordinates feed authoring.photo().
 * Sources: KTM's exact 2025 US standard-model product page and its linked
 * PHO_BIKE_90_RE / PHO_BIKE_90_LI MY25-KTM-450-SX-F studio PNGs.
 *
 * These are photographic estimates, not manufacturer vector artwork. The charcoal
 * boundaries were isolated from the source pixels, then simplified at roughly
 * one-pixel tolerance; remaining corner placement uncertainty is about 1–2 px.
 * Red shapes are separately traced underlays; portions hidden by the charcoal
 * mark are inferred. Tiny READY TO RACE lettering is deliberately not invented.
 *
 * The left mark is separately traced: mirroring the RIGHT lettering is incorrect.
 * Left-image pixels are mapped into the common bike tracing space with x = 912-x.
 * Registration uses the 456px axle midpoint and remains approximate; it preserves the actual side's letter shape.
 * Render red first, charcoal second. There is no broad silver band in these refs.
 * Source photos are reference-only and are not embedded in the rendered asset.
 */
export type OemPhotoPolygon = number[][];

export interface OemShroudMarks {
  red: OemPhotoPolygon[];
  charcoal: OemPhotoPolygon[];
}

export const KTM_MY25_RIGHT_SHROUD_MARKS: OemShroudMarks = {
  red: [
    // Forward upper red wedge. The long charcoal stroke overlaps its lower edge.
    [[547.5,255],[597,249.5],[610,249.5],[643,254],[615,272],[590,270]],
    // Separate red field on the descending radiator-shroud leg.
    [[562,286.5],[599,283],[576,298.5],[547,311.5]],
  ],
  charcoal: [[
    [481,248.5],[535,254.5],[608,265.5],[608,267.5],[604,268],
    [558,261.5],[538,269],[575,265.5],[614.5,272.5],[602,281.5],
    [596,282.5],[550,277.5],[556,272.5],[523,274.5],[411,262.5],
    [434,252.5],[459,249.5],[514,257.5],[489,261.5],[489,263.5],
    [496,267.5],[526.5,257],[484,251.5],[479,250.5],
  ]],
};

const fromLeftPhoto = (points: OemPhotoPolygon): OemPhotoPolygon =>
  points.map(([x,y]) => [912-x,y]);

export const KTM_MY25_LEFT_SHROUD_MARKS: OemShroudMarks = {
  red: [
    fromLeftPhoto([[276.5,258],[311,252.5],[353,254.5],[372.5,258],
      [357,259.5],[311,273.5],[302,274.5]]),
    fromLeftPhoto([[319.5,285],[358,288.5],[370,311.5],[336,296.5]]),
  ],
  charcoal: [fromLeftPhoto([
    [449,252.5],[451.5,253],[450.5,255],[445,256.5],[404,259.5],
    [393.5,270],[394,271.5],[422,260.5],[447,258.5],[445,264.5],
    [466,255.5],[474,255.5],[489.5,262],[479,270.5],[472,272.5],
    [412,276.5],[414,270.5],[397,277.5],[360,279.5],[319,284.5],
    [310.5,279],[317,271.5],[342,268.5],[341,273.5],[353,267.5],
    [365,265.5],[355,270.5],[354.5,272],[364,276.5],[377.5,263],
    [351,264.5],[350,262.5],[431,255.5],
  ])],
};
