import {Box3,InstancedMesh,Matrix4,Mesh,Object3D,PerspectiveCamera,Vector3} from 'three';

function requireFiniteVector(value:Vector3,label:string){
 if(!Number.isFinite(value.x)||!Number.isFinite(value.y)||!Number.isFinite(value.z))throw new TypeError(`${label} must be finite`);
}

function createFitProjection(target:Vector3,direction:Vector3,up:Vector3,verticalFovDegrees:number,aspect:number,margin:number){
 requireFiniteVector(target,'Target');requireFiniteVector(direction,'Direction');requireFiniteVector(up,'Up');
 if(direction.lengthSq()<1e-12)throw new TypeError('Direction must be non-zero');
 if(up.lengthSq()<1e-12)throw new TypeError('Up must be non-zero');
 if(!Number.isFinite(verticalFovDegrees)||verticalFovDegrees<=0||verticalFovDegrees>=179)throw new RangeError('Field of view must be between 0 and 179 degrees');
 if(!Number.isFinite(aspect)||aspect<=0)throw new RangeError('Aspect must be greater than zero');
 if(!Number.isFinite(margin)||margin<1)throw new RangeError('Camera-fit margin must be at least one');
 const z=direction.clone().normalize(),x=new Vector3().crossVectors(up,z);
 if(x.lengthSq()<1e-12)throw new TypeError('Up must not be parallel to direction');
 x.normalize();const y=new Vector3().crossVectors(z,x).normalize(),tanVertical=Math.tan(verticalFovDegrees*Math.PI/360);
 return {target,z,x,y,tanVertical,tanHorizontal:tanVertical*aspect,margin,distance:0,relative:new Vector3()};
}
function includeFitPoint(projection:ReturnType<typeof createFitProjection>,point:Vector3){
 requireFiniteVector(point,'Camera-fit point');const relative=projection.relative.copy(point).sub(projection.target),depth=relative.dot(projection.z);
 projection.distance=Math.max(projection.distance,depth+Math.abs(relative.dot(projection.x))*projection.margin/projection.tanHorizontal,depth+Math.abs(relative.dot(projection.y))*projection.margin/projection.tanVertical);
}
function requireFitDistance(projection:ReturnType<typeof createFitProjection>){
 if(!Number.isFinite(projection.distance)||projection.distance<=0)throw new RangeError('Camera-fit bounds are degenerate');
 return projection.distance;
}

/**
 * Finds the closest camera distance that contains every point in a perspective
 * frustum. `direction` points from the target toward the camera.
 */
export function fitDistanceForPoints(points:readonly Vector3[],target:Vector3,direction:Vector3,up:Vector3,verticalFovDegrees:number,aspect:number,margin:number){
 if(!points.length)throw new TypeError('At least one camera-fit point is required');
 const projection=createFitProjection(target,direction,up,verticalFovDegrees,aspect,margin);
 for(const point of points)includeFitPoint(projection,point);
 return requireFitDistance(projection);
}

export function fitObjectToCamera(camera:PerspectiveCamera,object:Object3D,target:Vector3,direction:Vector3,margin=1.08){
 const bounds=new Box3().setFromObject(object);
 if(bounds.isEmpty())throw new RangeError('Camera-fit object has no visible bounds');
 bounds.getCenter(target);const normalizedDirection=direction.clone().normalize();
 const projection=createFitProjection(target,normalizedDirection,camera.up,camera.fov,camera.aspect,margin),instanceMatrix=new Matrix4(),worldMatrix=new Matrix4(),point=new Vector3();let count=0;
 object.updateWorldMatrix(true,true);
 object.traverse(child=>{
  if(!(child instanceof Mesh)||!child.visible)return;
  const position=child.geometry.getAttribute('position');if(!position)return;
  if(child instanceof InstancedMesh){
   for(let instance=0;instance<child.count;instance++){
    child.getMatrixAt(instance,instanceMatrix);worldMatrix.multiplyMatrices(child.matrixWorld,instanceMatrix);
    for(let index=0;index<position.count;index++){includeFitPoint(projection,point.fromBufferAttribute(position,index).applyMatrix4(worldMatrix));count++;}
   }
  }else for(let index=0;index<position.count;index++){includeFitPoint(projection,point.fromBufferAttribute(position,index).applyMatrix4(child.matrixWorld));count++;}
 });
 if(!count)throw new RangeError('Camera-fit object has no visible geometry');
 const distance=requireFitDistance(projection);
 camera.position.copy(target).addScaledVector(normalizedDirection,distance);
 camera.updateProjectionMatrix();
 return distance;
}
