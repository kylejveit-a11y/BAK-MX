/** Exact-pilot catalog nominal dimensions. See vendor-dimensions.json for provenance.
 * Rim sizes are bead-seat dimensions, not outer tire or outer flange dimensions. */
export const pilotGeometryAnchors={
 frontDiscDiameter:.260,
 rearDiscDiameter:.220,
 frontRimBeadSeatDiameter:21*.0254,
 rearRimBeadSeatDiameter:19*.0254,
 handlebarClampDiameter:.028,
} as const;
