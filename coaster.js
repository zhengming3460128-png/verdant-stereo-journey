import * as THREE from 'three';
const V=THREE.Vector3, UP=new V(0,1,0);
export function createCourse(ground,variant="forest"){
  const points=[[-44,22,100],[-48,24,138],[-57,65,182],[-44,70,211],[-13,20,255],[20,18,284],[48,23,261],[48,34,231],[22,25,213],[9,22,249],[-10,34,302],[-47,49,332],[-77,43,300],[-72,29,245],[-91,43,193],[-84,27,137],[-62,22,91]].map(p=>new V(...p));
  if(variant!=="forest")points.forEach((p,i)=>{p.x*=variant==="seattle"?1.4:-1.25;p.z=210+(p.z-210)*(variant==="seattle"?1.15:1.35);p.y+=variant==="seattle"?12:6;});
  const curve=new THREE.CatmullRomCurve3(points,true,'centripetal');curve.arcLengthDivisions=3000;
  let lift=0;for(let i=0;i<1500;i++){const p=curve.getPointAt(i/1500);lift=Math.max(lift,ground(p.x,p.z)+5-p.y);}points.forEach(p=>p.y+=lift);curve.updateArcLengths();
  const length=curve.getLength(),top=Math.max(...points.map(p=>p.y));
  function frame(s){const u=((s%length)+length)%length/length,p=curve.getPointAt(u),t=curve.getTangentAt(u).normalize(),ta=curve.getTangentAt((u+.001)%1),cross=t.x*ta.z-t.z*ta.x,bank=THREE.MathUtils.clamp(-cross*25,-.88,.88),right=new V().crossVectors(UP,t).normalize(),up=new V().crossVectors(t,right).normalize();right.applyAxisAngle(t,bank);up.applyAxisAngle(t,bank);return{p,t,right,up,bank,u};}
  let start=0,highest=-Infinity;for(let i=0;i<500;i++){const p=curve.getPointAt(i/500);if(p.y>highest){highest=p.y;start=i/500*length+5;}}return{curve,length,top,frame,start};
}
export function buildCourse(course,world,ground,mat){
  const group=new THREE.Group();world.add(group);const metal=new THREE.MeshStandardMaterial({color:0x655443,metalness:.72,roughness:.48}),paint=new THREE.MeshStandardMaterial({color:0xb0a987,metalness:.4,roughness:.65});
  const add=(geo,m,p)=>{const o=new THREE.Mesh(geo,m);if(p)o.position.copy(p);o.castShadow=o.receiveShadow=true;group.add(o);return o;};
  for(const side of [-1,1]){const pts=[];for(let i=0;i<=900;i++){const f=course.frame(i/900*course.length);pts.push(f.p.clone().addScaledVector(f.right,side*.88));}const c=new THREE.CatmullRomCurve3(pts);add(new THREE.TubeGeometry(c,1500,.105,7,false),paint);}
  const count=Math.ceil(course.length/1.3),ties=new THREE.InstancedMesh(new THREE.BoxGeometry(2.5,.18,.25),metal,count),d=new THREE.Object3D(),basis=new THREE.Matrix4();
  for(let i=0;i<count;i++){const f=course.frame(i/count*course.length);d.position.copy(f.p).addScaledVector(f.up,-.18);basis.makeBasis(f.right,f.up,f.t);d.quaternion.setFromRotationMatrix(basis);d.updateMatrix();ties.setMatrixAt(i,d.matrix);}ties.castShadow=ties.receiveShadow=true;group.add(ties);
  for(let s=0;s<course.length;s+=14){const f=course.frame(s),g=ground(f.p.x,f.p.z),h=f.p.y-g-1;if(h<1)continue;add(new THREE.CylinderGeometry(.22,.4,h,7),metal,new V(f.p.x,g+h/2,f.p.z));add(new THREE.BoxGeometry(3,.3,.45),metal,f.p.clone().add(new V(0,-.65,0)));if(h>13){const a=new V(f.p.x-4,g,f.p.z+3),b=f.p.clone().add(new V(0,-2,0)),c=new THREE.LineCurve3(a,b);add(new THREE.TubeGeometry(c,1,.18,5,false),metal);}}
  const buildings=[];
  // Open-ended, roofed halls: rail, vehicle and camera all pass through the same corridor.
  for(const [fraction,len,name] of [[.012,26,'NORTHLINE / 07'],[.30,22,'TURBINE HALL'],[.68,25,'TRANSFER / 03']]){
    const f=course.frame(course.length*fraction),g=new THREE.Group();g.position.copy(f.p);const side=new V().crossVectors(UP,f.t).normalize(),roofUp=new V().crossVectors(f.t,side).normalize();g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(side,roofUp,f.t));group.add(g);buildings.push({position:f.p.clone(),inverse:g.quaternion.clone().invert(),length:len,width:18});
    function b(w,h,dep,m,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,dep),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o);return o;}
    b(19,.5,len,mat,0,-1.4,0);b(.6,11,len,mat,-9,4,0);b(.6,11,len,mat,9,4,0);
    // Long skylights create broad moving patches of light, without strobe effects.
    b(6,.65,len,mat,-6,9.2,0);b(6,.65,len,mat,6,9.2,0);b(6,.65,6,mat,0,9.2,-len/2+3);b(6,.65,6,mat,0,9.2,len/2-3);
    for(let z=-len/2;z<=len/2;z+=6){for(const x of [-8,8]){b(.5,11,.6,metal,x,4,z);b(.22,2,2.7,paint,x*.98,5.3,z);}b(17,.35,.4,metal,0,8.3,z);}
    for(const x of [-7.4,7.4]){b(.35,.35,len,metal,x,6.8,0);b(2.1,.9,len*.65,metal,x,-.7,0);}
    for(let i=0;i<5;i++)b(1.5,1.5,1.5,mat,(i%2?1:-1)*7,-.2,-len/2+3+i*4);
    // Weathered station sign drawn locally; no external assets or tracking.
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=160;const ctx=canvas.getContext('2d');ctx.fillStyle='#223d37';ctx.fillRect(0,0,1024,160);ctx.fillStyle='#c8c5a2';ctx.font='bold 67px monospace';ctx.fillText(name,35,105);const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;const sign=new THREE.Mesh(new THREE.PlaneGeometry(12,1.9),new THREE.MeshStandardMaterial({map:tex,roughness:.8,side:THREE.DoubleSide}));sign.position.set(0,6.1,-len/2-.4);g.add(sign);
    const lamp=new THREE.PointLight(0xffba69,55,15,2);lamp.position.set(-5,5,0);g.add(lamp);b(.9,.15,.5,new THREE.MeshStandardMaterial({color:0xffcd89,emissive:0xffb45c,emissiveIntensity:2}),-5,5,0);
  }
  function enclosure(p){let value=0;for(const b of buildings){const d=p.clone().sub(b.position).applyQuaternion(b.inverse);if(Math.abs(d.x)<b.width/2&&d.y>-2&&d.y<10){value=Math.max(value,THREE.MathUtils.smoothstep(b.length/2-Math.abs(d.z),0,5));}}return value;}
  return{group,enclosure,buildings};
}
