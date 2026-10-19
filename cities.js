import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
const V=THREE.Vector3,rand=(n)=>{let v=Math.sin(n*93.17+17.2)*43758.54;return v-Math.floor(v);};
export function batch(root){root.updateMatrixWorld(true);const buckets=new Map(),remove=[];root.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||Array.isArray(o.material))return;const key=o.material.uuid;if(!buckets.has(key))buckets.set(key,{mat:o.material,geos:[]});buckets.get(key).geos.push(o.geometry.clone().applyMatrix4(o.matrixWorld));remove.push(o);});for(const o of remove)o.removeFromParent();for(const b of buckets.values()){const geo=mergeGeometries(b.geos);b.geos.forEach(g=>g.dispose());if(geo){const m=new THREE.Mesh(geo,b.mat);m.castShadow=m.receiveShadow=true;root.add(m);}}}
function facadeTexture(snow){const c=document.createElement('canvas');c.width=512;c.height=1024;const x=c.getContext('2d');x.fillStyle=snow?'#797e7f':'#63746d';x.fillRect(0,0,512,1024);for(let i=0;i<17000;i++){const a=rand(i);x.fillStyle=`rgba(${a>.5?'210,218,207':'19,28,25'},${rand(i+5)*.16})`;x.fillRect(rand(i+1)*512,rand(i+2)*1024,1+rand(i+3)*4,3+rand(i+4)*28);}for(let row=0;row<16;row++){x.fillStyle=snow?'#adb3b0':'#8b998b';x.fillRect(0,row*64,512,5);for(let col=0;col<8;col++){const k=row*8+col,r=rand(k+9);x.fillStyle=r>.65?'#17221f':r>.4?'#384f4c':'#0d1919';x.fillRect(col*64+8,row*64+10,47,45);x.fillStyle='#78867c';x.fillRect(col*64+31,row*64+10,2,45);x.fillRect(col*64+8,row*64+36,47,2);if(r>.8){x.fillStyle='#556459';x.beginPath();x.moveTo(col*64+8,row*64+55);x.lineTo(col*64+30,row*64+12);x.lineTo(col*64+48,row*64+55);x.fill();}if(r<.35){x.fillStyle='#364d32';x.fillRect(col*64+3,row*64+4,8,60);}}}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;}
export function buildCity(kind,course,assets,textures){
 const snow=kind==='detroit',root=new THREE.Group(),geoMat=new THREE.MeshStandardMaterial({color:snow?0x9da9a8:0x727e6c,map:textures.rock,normalMap:textures.rockN,roughness:.95}),wall=new THREE.MeshStandardMaterial({map:facadeTexture(snow),roughness:snow?.85:.5,metalness:.12}),roof=new THREE.MeshStandardMaterial({color:snow?0xd4dfdc:0x546347,roughness:1}),steel=new THREE.MeshStandardMaterial({color:0x65564c,metalness:.6,roughness:.8}),glass=new THREE.MeshStandardMaterial({color:0x233c3b,metalness:.5,roughness:.3});
 const box=(w,h,d,m,x,y,z)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;root.add(o);return o;};
 box(720,2,850,roof,-25,16,240);const asphalt=new THREE.MeshStandardMaterial({color:snow?0x4b595b:0x243736,roughness:snow?.9:.35,metalness:.15});
 for(let x=-300;x<=280;x+=48)box(12,.05,800,asphalt,x,17.03,240);for(let z=-120;z<650;z+=48)box(650,.06,12,asphalt,-10,17.06,z);
 const samples=course.curve.getSpacedPoints(500),buildings=[];let id=0;
 function clear(x,z,r){return samples.every(p=>Math.hypot(p.x-x,p.z-z)>r+7);}
 for(let gx=-6;gx<=5;gx++)for(let gz=-2;gz<=12;gz++){const x=gx*48+24,z=gz*48+24,k=id++,w=20+rand(k)*12,d=22+rand(k+4)*10,r=Math.hypot(w,d)/2;if(!clear(x,z,r))continue;let floors=Math.floor(4+rand(k+30)*(snow?19:30));if(Math.abs(x)>220)floors+=8;const h=floors*3.8,y=17;
   box(w,h,d,wall,x,y+h/2,z);box(w+1,.4,d+1,roof,x,y+h+.2,z);box(w+2,3,d+2,geoMat,x,y+1.5,z);
   // Setbacks, roof plant, structural ledges and exposed broken crowns give real silhouette depth.
   if(k%3===0){box(w*.64,9,d*.65,geoMat,x+2,y+h+4.7,z);box(w*.68,.3,d*.69,roof,x+2,y+h+9.3,z);}
   for(let f=3;f<floors;f+=4)box(w+.6,.35,d+.6,geoMat,x,y+f*3.8,z);
   for(let j=0;j<3;j++){box(2.8,1.7,3.5,steel,x-w/3+j*4,y+h+1.1,z);if(j===0&&k%4===0)box(.16,10,.16,steel,x+w/3,y+h+5,z-d/3);}
   if(k%5===0)for(let j=0;j<4;j++)box(.28,7+rand(k+j)*8,.28,steel,x-w/2+j*w/3,y+h+3,z-d/2);
   buildings.push({x,z,w,d,h,y});
 }
 // Decayed green vines: bark stems plus textured, alpha-cut branches rather than flat green slabs.
 const leafMap=textures.twig;const ivyMat=new THREE.MeshStandardMaterial({map:leafMap,alphaMap:textures.twigAlpha,alphaTest:.45,side:THREE.DoubleSide,color:snow?0x748372:0x647a40,roughness:1});
 const placements=[];for(let k=0;k<buildings.length;k++){const b=buildings[k];for(let j=0;j<7;j++){const x=b.x-b.w/2+rand(k*7+j)*b.w,z=b.z-b.d/2-.25,top=b.y+b.h*(.3+rand(k+j)*.7);for(let h=top;h>top-14;h-=2.3)placements.push({x:x+Math.sin(h)*.6,y:Math.max(18,h),z,s:2.7+rand(h)*2});}}
 const ivy=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),ivyMat,placements.length),dummy=new THREE.Object3D();placements.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,0,rand(i)*2);dummy.scale.set(p.s,p.s*1.7,1);dummy.updateMatrix();ivy.setMatrixAt(i,dummy.matrix);});root.add(ivy);
 // Actual scan model trees return through streets and roof terraces.
 const trees=[];for(let i=0;i<75;i++){const x=-220+rand(i+900)*440,z=-50+rand(i+1200)*620;if(!clear(x,z,5)||buildings.some(b=>Math.abs(x-b.x)<b.w/2+3&&Math.abs(z-b.z)<b.d/2+3))continue;trees.push({x,z,y:17,s:.25+rand(i+5)*.18});}
 assets.island_tree_01.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(assets.island_tree_01),size=bb.getSize(new V());assets.island_tree_01.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.clone().applyMatrix4(o.matrixWorld);g.translate(0,-bb.min.y,0);const m=new THREE.InstancedMesh(g,o.material,trees.length);trees.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.setScalar((10+p.s*15)/size.y);dummy.rotation.set(0,rand(i)*6.28,0);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);});m.castShadow=true;root.add(m);});
 if(snow){for(let i=0;i<6;i++){const x=-150-i*20,z=480,h=50+i*5;const m=new THREE.Mesh(new THREE.CylinderGeometry(2.3,3.6,h,14),steel);m.position.set(x,17+h/2,z);root.add(m);}for(let i=0;i<5;i++){box(33,12,26,geoMat,-150+i*38,23,435);box(34,.5,27,roof,-150+i*38,29.3,435);}}
 else{const x=160,z=420;const mast=new THREE.Mesh(new THREE.CylinderGeometry(1.2,4,120,12),geoMat);mast.position.set(x,77,z);root.add(mast);const saucer=new THREE.Mesh(new THREE.CylinderGeometry(19,8,8,40),steel);saucer.position.set(x,136,z);root.add(saucer);box(1,21,1,steel,x,150,z);for(let a=0;a<3;a++){const p=new V(x+Math.cos(a*2.094)*12,17,z+Math.sin(a*2.094)*12),q=new V(x,132,z);root.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(p,q),1,.8,7,false),geoMat));}}
 // Abandoned street fixtures and low walls, outside the ride clearance envelope.
 for(let i=0;i<75;i++){const x=-200+rand(i+700)*400,z=rand(i+450)*580;if(!clear(x,z,3))continue;box(1.8,.8,4,steel,x,17.8,z);box(1.5,.7,2,glass,x,18.4,z-.2);}
 batch(root);root.visible=false;return{root,buildings,snow};
}
