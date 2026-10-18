import {Box3,Object3D,PerspectiveCamera,Vector3} from 'three';

function requireFiniteVector(value:Vector3,label:string){
 if(!Number.isFinite(value.x)||!Number.isFinite(value.y)||!Number.isFinite(value.z))throw new TypeError(`${label} must be finite`);
}

/**
 * Finds the closest camera distance that contains every point in a perspective
 * frustum. `direction` points from the target toward the camera.
 */
export function fitDistanceForPoints(points:readonly Vector3[],target:Vector3,direction:Vector3,up:Vector3,verticalFovDegrees:number,aspect:number,margin:number){
 if(!points.length)throw new TypeError('At least one camera-fit point is required');
 requireFiniteVector(target,'Target');requireFiniteVector(direction,'Direction');requireFiniteVector(up,'Up');
 if(direction.lengthSq()<1e-12)throw new TypeError('Direction must be non-zero');
 if(up.lengthSq()<1e-12)throw new TypeError('Up must be non-zero');
 if(!Number.isFinite(verticalFovDegrees)||verticalFovDegrees<=0||verticalFovDegrees>=179)throw new RangeError('Field of view must be between 0 and 179 degrees');
 if(!Number.isFinite(aspect)||aspect<=0)throw new RangeError('Aspect must be greater than zero');
 if(!Number.isFinite(margin)||margin<1)throw new RangeError('Camera-fit margin must be at least one');
 const z=direction.clone().normalize(),x=new Vector3().crossVectors(up,z);
 if(x.lengthSq()<1e-12)throw new TypeError('Up must not be parallel to direction');
 x.normalize();const y=new Vector3().crossVectors(z,x).normalize();
 const tanVertical=Math.tan(verticalFovDegrees*Math.PI/360),tanHorizontal=tanVertical*aspect;
 let distance=0;
 for(const point of points){
  requireFiniteVector(point,'Camera-fit point');const relative=point.clone().sub(target),depth=relative.dot(z);
  distance=Math.max(distance,depth+Math.abs(relative.dot(x))*margin/tanHorizontal,depth+Math.abs(relative.dot(y))*margin/tanVertical);
 }
 if(!Number.isFinite(distance)||distance<=0)throw new RangeError('Camera-fit bounds are degenerate');
 return distance;
}

export function fitObjectToCamera(camera:PerspectiveCamera,object:Object3D,target:Vector3,direction:Vector3,margin=1.08){
 const bounds=new Box3().setFromObject(object);
 if(bounds.isEmpty())throw new RangeError('Camera-fit object has no visible bounds');
 const min=bounds.min,max=bounds.max,points:Vector3[]=[];
 for(const x of [min.x,max.x])for(const y of [min.y,max.y])for(const z of [min.z,max.z])points.push(new Vector3(x,y,z));
 bounds.getCenter(target);const normalizedDirection=direction.clone().normalize();
 const distance=fitDistanceForPoints(points,target,normalizedDirection,camera.up,camera.fov,camera.aspect,margin);
 camera.position.copy(target).addScaledVector(normalizedDirection,distance);
 camera.updateProjectionMatrix();
 return distance;
}

