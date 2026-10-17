/** Versioned, renderer-independent contract. Coordinates: meters, +X forward, +Y up, +Z rider's right.
 * Hardpoint coordinates remain estimates until the platform asset is visually approved. */
export const assetContractVersion=1;
export const representativeAssets={
 'generic-slip-on':{target:'exhaust-muffler',parent:'exhaust',hardpoint:'muffler-mount'},
 'generic-full-exhaust':{target:'exhaust',parent:'exhaust',hardpoint:'exhaust-port'},
 'generic-fatbar':{target:'bars',parent:'controls',hardpoint:'bar-clamp'},
 'generic-crossbar':{target:'bars',parent:'controls',hardpoint:'bar-clamp'},
 'generic-clamps':{target:'clamps',parent:'fork',hardpoint:'steering-stem'},
 'generic-skid-plate':{target:'skid-plate',parent:'frame',hardpoint:'engine-cradle'},
 'generic-frame-guards':{target:'frame-guards',parent:'frame',hardpoint:'frame-pivot'},
 'generic-radiator-braces':{target:'radiator-braces',parent:'cooling',hardpoint:'radiator-mount'},
 'generic-hand-guards':{target:'hand-guards',parent:'controls',hardpoint:'bar-clamp'},
} as const;
export type RepresentativeAssetId=keyof typeof representativeAssets;
