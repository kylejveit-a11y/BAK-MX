function positive(...values:number[]):void { if(values.some(v=>!Number.isFinite(v)||v<=0)) throw new RangeError('Enter finite values greater than zero.'); }
function teeth(...values:number[]):void { positive(...values); if(values.some(v=>!Number.isInteger(v))) throw new RangeError('Sprocket teeth must be whole numbers.'); }
export function finalDrive(front:number,rear:number):number { teeth(front,rear); return rear/front; }
export function gearingChange(oldFront:number,oldRear:number,newFront:number,newRear:number):number { return (finalDrive(newFront,newRear)/finalDrive(oldFront,oldRear)-1)*100; }
export function sagPercent(extended:number,loaded:number,travel:number):number { positive(extended,loaded,travel); if(loaded>extended||extended-loaded>travel) throw new RangeError('Sag must be between zero and available travel.'); return (extended-loaded)/travel*100; }
export function speedKmh(rpm:number,primary:number,gear:number,front:number,rear:number,circumferenceMm:number):number { positive(primary,gear,circumferenceMm); if(!Number.isFinite(rpm)||rpm<0)throw new RangeError('RPM must be zero or greater.'); return rpm/(primary*gear*finalDrive(front,rear))*circumferenceMm*60/1_000_000; }
export function displacementCc(boreMm:number,strokeMm:number,cylinders:number):number { positive(boreMm,strokeMm,cylinders); if(!Number.isInteger(cylinders))throw new RangeError('Cylinder count must be a whole number.'); return Math.PI/4*boreMm*boreMm*strokeMm*cylinders/1000; }
export function springRateNmm(lbPerIn:number):number { positive(lbPerIn); return lbPerIn*4.4482216152605/25.4; }
export function compressionRatio(sweptCc:number,clearanceCc:number):number { positive(sweptCc,clearanceCc); return (sweptCc+clearanceCc)/clearanceCc; }
