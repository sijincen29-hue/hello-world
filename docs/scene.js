import * as T from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import {ROOMS,WAYPOINTS,RESIDENTS,routeBetween} from './world-data.js?v=6';
const host=document.querySelector('#scene');
const scene=new T.Scene();scene.background=new T.Color('#f5f3e9');
const renderer=new T.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;host.appendChild(renderer.domElement);
const camera=new T.OrthographicCamera();camera.position.set(16,23,24);camera.lookAt(0,0,0);
const hemi=new T.HemisphereLight(0xfff9e9,0x93a675,2.5);scene.add(hemi);
const sun=new T.DirectionalLight(0xffe3ae,4);sun.position.set(-5,15,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-13,right:13,top:13,bottom:-13});sun.shadow.normalBias=.03;scene.add(sun);
const colors={grass:'#a7bd83',wood:'#b3855d',cream:'#fff1d5',wall:'#ebdfbd',pink:'#d8a19a',green:'#829d87',dark:'#51463b'};
const mats=new Map();function mat(c){if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,roughness:.85}));return mats.get(c)}
function mesh(geo,c,x,y,z,parent=scene){const m=new T.Mesh(geo,mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function box(x,y,z,w,h,d,c,p=scene){return mesh(new T.BoxGeometry(w,h,d),c,x,y,z,p)}
function ball(x,y,z,a,b,c,col,p=scene){const m=mesh(new T.SphereGeometry(1,24,16),col,x,y,z,p);m.scale.set(a,b,c);return m}
function cyl(x,y,z,r,h,c,p=scene,r2=r){return mesh(new T.CylinderGeometry(r2,r,h,24),c,x,y,z,p)}
function rounded(x,y,z,w,h,d,c,p=scene){
  const radius=Math.min(w,h,d)*.22,geo=new T.BoxGeometry(w,h,d,12,12,12);
  const positions=geo.attributes.position,normals=geo.attributes.normal;
  const halves=[w/2,h/2,d/2];
  for(let i=0;i<positions.count;i++){
    const source=[positions.getX(i),positions.getY(i),positions.getZ(i)];
    const mapped=source.map((v,axis)=>{const half=halves[axis],t=Math.abs(v)/half;return Math.sign(v)*(t<=2/3?t*(half-radius)*1.5:half-radius+(t-2/3)*radius*3)});
    const inner=mapped.map((v,axis)=>T.MathUtils.clamp(v,-halves[axis]+radius,halves[axis]-radius));
    const outward=new T.Vector3(mapped[0]-inner[0],mapped[1]-inner[1],mapped[2]-inner[2]).normalize();
    positions.setXYZ(i,inner[0]+outward.x*radius,inner[1]+outward.y*radius,inner[2]+outward.z*radius);
    normals.setXYZ(i,outward.x,outward.y,outward.z);
  }
  positions.needsUpdate=true;normals.needsUpdate=true;
  return mesh(geo,c,x,y,z,p);
}
function twig(a,b,r1,r2,color,parent=scene){const from=new T.Vector3(...a),to=new T.Vector3(...b),delta=to.clone().sub(from);const m=mesh(new T.CylinderGeometry(r2,r1,delta.length(),7),color,...from.clone().add(to).multiplyScalar(.5).toArray(),parent);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m}
const windParts=[],cropGroups=[],flowerGroups=[],treeVisuals=[];
function wind(group,phase,strength=.04){windParts.push({group,phase,strength})}
const nightLights=[],glowingMaterials=[];
function glow(mesh,color='#ffd29a'){
  mesh.material=new T.MeshStandardMaterial({color:mesh.material.color,roughness:.78,emissive:color,emissiveIntensity:0});
  glowingMaterials.push(mesh.material);
  return mesh;
}
function lamp(x,y,z,power=7,reach=3.2,color=0xffcf91){
  const light=new T.PointLight(color,0,reach,2);
  light.position.set(x,y,z);scene.add(light);nightLights.push({light,power});
}
// A shared timber floor lets the social spaces read as one home, with only
// sleeping and bathing screened for privacy.
rounded(0,-.5,0,15,.9,13,'#c9b590');rounded(0,-.04,0,15,.35,13,colors.grass);
const backdrop=box(0,-1.08,0,200,.2,200,'#f5f3e9');
rounded(-1,.27,-1.6,9.3,.55,6.7,'#bd9d78');box(-1,.57,-1.6,9,.13,6.4,'#e9d4ad');
for(let x=-5.35;x<3.5;x+=.48)box(x,.646,-1.6,.013,.006,6.35,'#d8bb91');
// The rear/left perimeter frames the cutaway view. The kitchen, lounge,
// reading nook and computer corner have no enclosing partition walls.
box(-1,2.2,-4.8,9.2,3.3,.18,colors.wall);box(-5.5,1.85,-1.6,.16,2.6,6.5,colors.wall);box(3.5,1.02,-1.7,.15,.8,6.4,colors.wall);
function screenX(x,z1,z2,height=1.55){box(x,.65+height/2,(z1+z2)/2,.12,height,z2-z1,'#d9c9a9')}
function screenZ(z,x1,x2,height=1.55){box((x1+x2)/2,.65+height/2,z,x2-x1,height,.12,'#d9c9a9')}
// A small sleeping alcove and bathroom share one quiet wall, with wide entries.
screenX(-2.5,-4.82,-1.6);
screenX(.5,-4.82,-1.6,1.05);
// Bedroom and computer corner share a continuous floor and one wide opening.
screenZ(-1.66,-2.55,-1.65,.9);screenZ(-1.66,-.35,.55,.9);
// Open shelf and runner mark the work/reading edge without closing the view.
const runner=rounded(-1.05,.669,.2,2.05,.028,1.55,'#e6d9be');runner.rotation.y=-.07;
box(-1,3.88,-4.8,9.4,.12,.26,'#c0a47b');box(-5.5,3.2,-1.6,.23,.12,6.6,'#c0a47b');
function windowAt(x,w=1.38){box(x,2.6,-4.66,w,1.42,.1,'#b0936a');glow(box(x,2.6,-4.58,w-.2,1.22,.1,'#b4d9ce'),'#ffdbab');box(x,2.6,-4.5,.06,1.3,.08,colors.cream);box(x,2.6,-4.49,w-.15,.06,.08,colors.cream);box(x,1.8,-4.4,w+.17,.1,.4,colors.cream)}
windowAt(-4);windowAt(2);windowAt(-1,.9);box(-1,2.6,-4.45,.7,1.1,.025,'#d9e7df');
// Bedroom: a bed, wardrobe, bedside table and little lamp.
function furnishBedroom(){
rounded(-3.96,.96,-3.52,1.55,.5,2.1,'#b78762');rounded(-3.96,1.26,-3.52,1.48,.23,2.02,'#fff3dc');rounded(-3.96,1.43,-3.16,1.48,.14,1.25,'#aab99d');rounded(-3.96,1.47,-4.28,1.18,.2,.43,'#fff8e8');rounded(-3.96,1.38,-4.56,1.68,.69,.15,'#b78762');
rounded(-5.08,1.39,-3.87,.53,1.42,.88,'#b79471');box(-4.78,1.42,-3.87,.04,.45,.035,'#e9d3a4');
rounded(-2.85,.94,-4.24,.46,.52,.5,'#b98d64');cyl(-2.85,1.41,-4.24,.04,.4,'#c8ac75');glow(mesh(new T.ConeGeometry(.24,.32,20),colors.cream,-2.85,1.76,-4.24));lamp(-2.85,1.65,-4.24,8,3.1);
const bedRug=cyl(-4,.672,-2.38,.52,.025,'#e9bdb1');bedRug.scale.z=.6;
}
// Bathroom: the bath sits against the rear wall, the sink stays left of the
// entry, and the toilet has its own clear space on the right.
function furnishBathroom(){
for(let x=-2.38;x<.4;x+=.39)box(x,.659,-3.18,.012,.004,2.95,'#c9d9d2');
for(let z=-4.63;z< -1.7;z+=.39)box(-1,.659,z,2.85,.004,.012,'#c9d9d2');
// Raised white rim and a visible water surface make the bath recognizable.
rounded(-1.53,.94,-4.05,1.54,.56,.96,'#f9f8ef');
rounded(-1.53,1.23,-4.05,1.28,.045,.7,'#fffdf5');
rounded(-1.53,1.255,-4.05,1.1,.014,.53,'#acd2d4');
for(const x of [-1.83,-1.54,-1.25])ball(x,1.29,-4.06,.11,.055,.1,'#fffdfa');
cyl(-1.35,1.36,-4.47,.034,.21,'#c6ad83');
const glass=new T.Mesh(new T.BoxGeometry(.035,.74,.88),new T.MeshPhysicalMaterial({color:'#d9f0ed',transparent:true,opacity:.28,roughness:.1,metalness:.04,depthWrite:false}));
glass.position.set(-.68,1.57,-4.03);scene.add(glass);
// Basin and mirror on the left leave a central walking line from the door.
rounded(-2.05,1.02,-2.62,.38,.57,.42,'#c9c2af');
rounded(-2.05,1.34,-2.62,.67,.14,.55,'#fffaf0');
rounded(-2.05,1.42,-2.58,.38,.02,.29,'#bfd8d7');
cyl(-2.05,1.57,-2.78,.027,.22,'#c6ad83');
rounded(-2.43,1.96,-2.62,.045,.83,.67,'#b4d6d3');
rounded(-2.4,1.96,-2.62,.038,.72,.56,'#dcebe7');
// The toilet faces the open aisle; its tank remains clearly behind the bowl.
rounded(-.18,.94,-3.02,.48,.49,.64,'#f9f8ef');
rounded(-.18,1.21,-3.02,.55,.09,.67,'#fffdf7');
rounded(-.18,1.265,-2.98,.38,.018,.42,'#c0d5d3');
const seatRing=mesh(new T.TorusGeometry(.205,.035,8,24),'#fffdf7',-.18,1.292,-2.98);
seatRing.rotation.x=-Math.PI/2;seatRing.scale.y=1.16;
rounded(-.18,1.44,-3.44,.58,.51,.16,'#fff9ef');
rounded(-.18,.675,-2.25,.65,.026,.48,'#d8e4dc');
}
// Kitchen: a full counter run, stove, sink, fridge and breakfast stool.
function furnishKitchen(){
// One continuous cabinet carcass and worktop replace the overlapping modules.
rounded(1.98,1.13,-4.16,2.8,.9,1.02,'#94ae9b');
rounded(1.98,1.64,-4.16,2.87,.12,1.14,'#fff4df');
for(const x of [1.08,1.98,2.88]){
  rounded(x,1.11,-3.6,.76,.69,.036,'#9fb6a2');
  rounded(x,1.24,-3.55,.22,.035,.035,'#b28b58');
}
rounded(1.03,1.703,-4.12,.66,.018,.6,'#b6d0cf');
rounded(1.03,1.718,-4.12,.49,.012,.43,'#8db7b6');
cyl(1.03,1.88,-4.37,.029,.27,'#c3b68e');
rounded(2,1.708,-4.12,.75,.026,.64,'#5e6557');
for(const x of [1.78,2.22])for(const z of [-4.31,-3.94])cyl(x,1.735,z,.115,.02,'#abb1a2');
cyl(2,1.86,-4.12,.2,.22,'#e5c7a1');
glow(ball(2.7,2.35,-4.32,.16,.085,.11,'#fff1d1'));lamp(2.4,2.13,-3.95,6,3.1);
rounded(3.05,1.63,-2.75,.65,1.93,.7,'#f5ebd6');box(2.76,1.7,-2.37,.04,.34,.05,'#adb7a1');
 rounded(2.05,1.05,-2.65,1.05,.64,.68,'#b88f69');rounded(2.05,1.41,-2.65,1.13,.09,.76,'#f6e7c9');
 // The breakfast counter is the soft threshold between cooking and lounging.
 cyl(2.35,.92,-2.08,.23,.46,'#c5a478');cyl(2.35,1.18,-2.08,.27,.07,'#e6d5b4');
 cyl(1.73,1.52,-2.63,.16,.035,'#f9f4e6');ball(1.73,1.55,-2.63,.07,.06,.07,'#d49b76');
 box(1.95,2.3,-4.5,1.6,.07,.27,'#c19d74');for(const x of [1.55,1.92,2.29])cyl(x,2.43,-4.5,.08,.19,'#e8d9b7');
}
// Computer room: desk, luminous monitor, keyboard, tower and swivel chair.
function furnishComputer(){
const corner=new T.Group();corner.position.set(-5.17,0,-.55);corner.rotation.y=Math.PI/2;scene.add(corner);
rounded(0,1.24,0,1.35,.15,.62,'#a98263',corner);
for(const x of [-.51,.51])rounded(x,.94,0,.09,.56,.48,'#987356',corner);
rounded(0,1.72,-.2,.8,.66,.09,'#434f51',corner);
glow(box(0,1.72,-.14,.66,.52,.025,'#80a9a1',corner),'#a9d9d5');
rounded(0,1.42,-.19,.07,.17,.07,'#6d7771',corner);
rounded(0,1.34,.17,.61,.035,.18,'#ddd8bc',corner);
rounded(.43,1.02,.03,.26,.52,.36,'#5d706d',corner);
ball(.43,1.14,.23,.04,.04,.02,'#b6d9c5',corner);
cyl(0,1.06,.88,.28,.11,'#a8b8ab',corner);cyl(0,.85,.88,.07,.38,'#b9a587',corner);
rounded(0,1.45,1.09,.63,.62,.16,'#9cad9d',corner);
rounded(-.66,1.18,-.18,.12,1.05,.77,'#b9946e',corner);
for(const y of [.82,1.17,1.52])rounded(-.56,y,-.18,.24,.05,.67,'#e7d2ac',corner);
}
// Study: a bookshelf, open book, writing desk and warm reading lamp.
function furnishStudy(){
rounded(-1,1.27,-.62,1.52,.16,.83,'#c49b70');for(const x of [-1.55,-.45])rounded(x,.97,-.62,.1,.64,.72,'#aa805b');
for(const x of [-1.26,-.74])box(x,1.37,-.56,.42,.025,.29,'#fff4df');box(-1,1.39,-.56,.018,.04,.29,'#be9b74');
cyl(-.43,1.54,-.98,.04,.38,'#bd9b68');glow(mesh(new T.ConeGeometry(.22,.32,18),colors.cream,-.43,1.86,-.98));lamp(-.43,1.82,-.98,8,3.1);
for(const x of [-1.21,-.79])for(const z of [.07,.45])rounded(x,.86,z,.055,.36,.055,'#9d9078');
rounded(-1,1.055,.26,.57,.1,.54,'#ad9d83');rounded(-1,1.36,.48,.57,.55,.12,'#ab9d85');
box(-2.29,1.38,-.13,.3,1.35,1.65,'#b68f68');for(const y of [.85,1.33,1.8]){box(-2.07,y,-.13,.15,.055,1.58,'#d7b789');for(let i=0;i<6;i++)box(-2.02,y+.15,-.77+i*.25,.1,.29,.1,['#9aa890','#d4a895','#c5bd96'][i%3])}
}
// Living room: sofa, low table, rug, plant and a small tea tray.
function furnishLiving(){
const loungeRug=cyl(2.2,.675,.18,1.02,.027,'#dbceb0');loungeRug.scale.z=.82;
rounded(2.25,1.03,-.79,1.55,.58,.72,colors.green);rounded(2.25,1.39,-1.14,1.6,.68,.22,colors.green);for(const x of [1.58,2.92])rounded(x,1.22,-.78,.25,.57,.83,colors.green);for(const x of [1.9,2.6])rounded(x,1.33,-.77,.55,.15,.61,'#b9c9ad');
rounded(2.2,1.02,.28,1.05,.13,.64,'#c79a6c');for(const x of [1.82,2.58])for(const z of [.09,.47])cyl(x,.84,z,.055,.34,'#a97c53');cyl(2.42,1.17,.26,.13,.18,'#fff4de');box(1.94,1.12,.26,.31,.04,.37,'#9caa91');
rounded(2.72,.86,1.25,.56,.35,.42,'#c8a47b');box(2.72,1.08,1.25,.4,.045,.28,'#e6d9bc');
rounded(3.13,.89,.92,.38,.47,.38,'#a78260');cyl(3.13,1.37,.92,.035,.48,'#c3a778');glow(ball(3.13,1.7,.92,.24,.17,.24,'#ffe5b9'));lamp(3.13,1.72,.92,9,3.2);
function plant(x,y,z){cyl(x,y+.2,z,.19,.36,'#c28f73',scene,.27);const leaves=new T.Group();leaves.position.set(x,y+.38,z);scene.add(leaves);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;twig([0,0,0],[Math.cos(a)*.17,.27,Math.sin(a)*.17],.025,.012,'#6b8b6b',leaves);const leaf=ball(Math.cos(a)*.2,.31,Math.sin(a)*.2,.1,.3,.085,i%2?'#779b79':'#87a880',leaves);leaf.rotation.z=-Math.cos(a)*.55;leaf.rotation.x=Math.sin(a)*.55}wind(leaves,2.1,.055)}plant(3.1,.66,-.15);
}
const FURNISHERS={bedroom:furnishBedroom,bathroom:furnishBathroom,kitchen:furnishKitchen,computer:furnishComputer,study:furnishStudy,living:furnishLiving};
for(const room of ROOMS)FURNISHERS[room.id]();
// Front steps and stepping-stone garden path.
rounded(-1,.4,1.9,2.3,.32,.85,'#c8ab83');rounded(-1,.2,2.4,2.6,.25,.65,'#d8bea0');for(let i=0;i<5;i++){const stone=cyl(-1+Math.sin(i)*.16,.18,2.9+i*.65,.44,.12,'#ded6b9');stone.scale.z=.69;}
// Each crop has a rooted stem and a separate leafy crown, so only the soft parts sway.
for(let bx of [3.5,5.3]){rounded(bx,.18,3.1,1.5,.28,2.8,'#b48b60');box(bx,.34,3.1,1.27,.04,2.57,'#795b40');for(let z=2.2;z<4.4;z+=.6)for(let x of [bx-.32,bx+.32]){const top=new T.Group();top.position.set(x,.41,z);scene.add(top);cropGroups.push(top);if(bx<4){ball(0,.13,0,.18,.17,.18,'#a8bc7e',top);for(let k=0;k<6;k++){const a=k*Math.PI/3;const leaf=ball(Math.cos(a)*.15,.12,Math.sin(a)*.15,.11,.08,.19,k%2?'#85a66b':'#94b276',top);leaf.rotation.y=a;leaf.rotation.z=Math.cos(a)*.35}}else{mesh(new T.ConeGeometry(.075,.2,10),'#d89355',x,.38,z);for(let k=0;k<4;k++){const a=k*Math.PI/2;twig([0,0,0],[Math.cos(a)*.1,.26,Math.sin(a)*.1],.017,.006,'#6d9461',top);const leaf=ball(Math.cos(a)*.13,.26,Math.sin(a)*.13,.04,.19,.055,'#83a66e',top);leaf.rotation.z=-Math.cos(a)*.32}}wind(top,x+z,.04)}}
// A leaf-shaped mesh is reused for the whole crown. Its folded center catches the warm light.
const leafGeometry=new T.BufferGeometry();
leafGeometry.setAttribute('position',new T.Float32BufferAttribute([
  0,0,0, -.42,.27,0, -.49,.61,0, 0,1,0,
  .49,.61,0, .42,.27,0, 0,.52,.08
],3));
leafGeometry.setIndex([0,1,6,1,2,6,2,3,6,3,4,6,4,5,6,5,0,6]);
leafGeometry.computeVertexNormals();
const leafMaterial=new T.MeshStandardMaterial({color:'#ffffff',roughness:1,side:T.DoubleSide});
function tree(x,z,s=1,seed=0){
  let randomState=(Math.floor(seed*10000)+9317)>>>0;
  const random=()=>((randomState=(1664525*randomState+1013904223)>>>0)/4294967296);
  const trunk=new T.Group();trunk.position.set(x,.26,z);trunk.scale.setScalar(s);scene.add(trunk);
  const bark='#9f805c';
  twig([0,0,0],[.045,.82,-.025],.23,.19,bark,trunk);
  twig([.045,.82,-.025],[-.025,1.37,.035],.19,.13,bark,trunk);
  twig([.02,1.08,0],[-.45,1.7,.12],.12,.042,bark,trunk);
  twig([-.01,1.18,.02],[.5,1.73,-.12],.11,.04,bark,trunk);
  const crown=new T.Group();crown.position.set(-.025,1.34,.035);trunk.add(crown);
  twig([0,0,0],[.055,.76,-.025],.13,.065,bark,crown);
  for(let i=0;i<7;i++){
    const angle=seed+i*2.399,reach=.65+random()*.3;
    const dx=Math.cos(angle)*reach,dz=Math.sin(angle)*reach;
    const start=[0,(i%3)*.1,0],bend=[dx*.48,.29+(i%2)*.06,dz*.48],tip=[dx,.62+random()*.2,dz];
    twig(start,bend,.09,.055,bark,crown);
    twig(bend,tip,.055,.022,'#a88a64',crown);
    for(const side of [-1,1]){
      const a=angle+side*.34,outer=[dx+Math.cos(a)*.25,tip[1]+.16+random()*.12,dz+Math.sin(a)*.25];
      twig(tip,outer,.024,.008,'#a88a64',crown);
    }
  }
  // One gently uneven crown is the visual mass; leaves break its edge into foliage.
  const canopyGeometry=new T.SphereGeometry(1,32,20),positions=canopyGeometry.attributes.position;
  for(let i=0;i<positions.count;i++){
    const px=positions.getX(i),py=positions.getY(i),pz=positions.getZ(i);
    const uneven=1+.075*Math.sin(px*7+py*4+seed)*Math.sin(pz*5-py*3)+.04*Math.sin(py*10+pz*6+seed);
    const skirt=py<0?1-py*.06:1;
    positions.setXYZ(i,px*uneven*skirt,py*uneven*(py<0?.72:1),pz*uneven*skirt);
  }
  canopyGeometry.computeVertexNormals();
  const foliageCanvas=document.createElement('canvas');foliageCanvas.width=512;foliageCanvas.height=256;
  const foliage=foliageCanvas.getContext('2d');foliage.fillStyle='#dedbd0';foliage.fillRect(0,0,512,256);
  const leafShades=['#f0eadb','#d2d1c5','#babdb4','#e6e2d4','#c5c9bd'];
  for(let i=0;i<440;i++){
    const px=random()*512,py=random()*256,w=6+random()*8,h=9+random()*11;
    foliage.save();foliage.translate(px,py);foliage.rotate((random()-.5)*2.4);
    foliage.fillStyle=leafShades[Math.floor(random()*leafShades.length)];
    foliage.beginPath();foliage.moveTo(0,-h*.5);
    foliage.bezierCurveTo(-w*.65,-h*.45,-w*.8,h*.18,0,h*.5);
    foliage.bezierCurveTo(w*.8,h*.18,w*.65,-h*.45,0,-h*.5);
    foliage.fill();foliage.restore();
  }
  const foliageTexture=new T.CanvasTexture(foliageCanvas);foliageTexture.colorSpace=T.SRGBColorSpace;
  const canopy=new T.Mesh(canopyGeometry,new T.MeshStandardMaterial({map:foliageTexture,roughness:1,transparent:true}));
  canopy.position.set(.02,.79,0);canopy.castShadow=true;canopy.receiveShadow=true;crown.add(canopy);
  canopy.scale.set(1.12,.67,.94);
  const leafCount=100,leaves=new T.InstancedMesh(leafGeometry,leafMaterial,leafCount);
  leaves.castShadow=false;leaves.receiveShadow=true;leaves.frustumCulled=false;crown.add(leaves);
  const dummy=new T.Object3D(),up=new T.Vector3(0,1,0);
  const palette=['#f4f0e7','#e8e5dd','#d9dbd4','#ffffff'];
  for(let i=0;i<leafCount;i++){
    const angle=random()*Math.PI*2,u=-.62+random()*1.58,ring=Math.sqrt(1-u*u);
    const depth=.78+random()*.2;
    const nx=Math.cos(angle)*ring,ny=u,nz=Math.sin(angle)*ring;
    const skirt=ny<0?1-ny*.06:1;
    dummy.position.set(.02+nx*1.12*depth*skirt,.79+ny*.67*depth*(ny<0?.72:1),nz*.94*depth*skirt);
    const direction=new T.Vector3(nx*.7+(random()-.5)*.3,.42+ny*.48,nz*.7+(random()-.5)*.3).normalize();
    dummy.quaternion.setFromUnitVectors(up,direction);dummy.rotateY(random()*Math.PI*2);
    const size=.12+random()*.07;dummy.scale.set(size*.78,size,size*.78);dummy.updateMatrix();
    leaves.setMatrixAt(i,dummy.matrix);leaves.setColorAt(i,new T.Color(palette[Math.floor(random()*palette.length)]));
  }
  leaves.instanceMatrix.needsUpdate=true;leaves.instanceColor.needsUpdate=true;
  treeVisuals.push({canopy,leaves,leafCount});
  wind(crown,seed,.014);
  for(let i=0;i<3;i++){const a=i*2.1+seed;twig([Math.cos(a)*.08,0,Math.sin(a)*.08],[Math.cos(a)*.3,.18,Math.sin(a)*.3],.06,.014,'#987650',trunk)}
}
tree(-5,3,1.1,.2);tree(5.6,-3.4,1.05,1.6);tree(5.5,-.5,.8,3.1);
function fence(x,z,axis,length){for(let i=0;i<=length;i+=.7){const px=x+(axis==='x'?i:0),pz=z+(axis==='z'?i:0);rounded(px,.65,pz,.16,1.1,.16,'#eee0bc');ball(px,1.2,pz,.12,.1,.12,'#eee0bc')}for(let y of [.45,.92])box(x+(axis==='x'?length/2:0),y,z+(axis==='z'?length/2:0),axis==='x'?length:.1,.12,axis==='z'?length:.1,'#e3cea4')}
fence(-6.4,5.5,'x',4.2);fence(.5,5.5,'x',6);fence(6.6,-5.5,'z',11);fence(-6.5,-5.5,'z',11);fence(-6.4,-5.5,'x',13);
// Flowers, little stones, mailbox and an outdoor bench.
for(let i=0;i<36;i++){const x=-6+((i*3.71)%12),z=4.5+((i*1.31)%.55);if(x>2&&x<6||x> -2&&x<.5)continue;const flower=new T.Group();flower.position.set(x,.18,z);scene.add(flower);flowerGroups.push(flower);twig([0,0,0],[0,.27,0],.018,.009,'#799461',flower);for(const side of [-1,1]){const leaf=ball(side*.075,.13,0,.09,.035,.055,'#89a672',flower);leaf.rotation.z=side*.35}for(let k=0;k<5;k++)ball(Math.cos(k*1.256)*.072,.29,Math.sin(k*1.256)*.072,.065,.035,.065,i%2?'#f0dab2':'#dca9a0',flower);ball(0,.3,0,.035,.03,.035,'#c5a366',flower);wind(flower,i*.7,.045)}
const gardenBench=new T.Group();gardenBench.position.set(-4.05,0,3.1);scene.add(gardenBench);
rounded(0,.62,0,1.48,.17,.54,'#bd9465',gardenBench);
for(const x of [-.57,.57])rounded(x,.36,0,.105,.52,.39,'#a78054',gardenBench);
rounded(0,1.02,-.27,1.48,.5,.12,'#bd9465',gardenBench);
for(const x of [-.7,.7])rounded(x,.77,.12,.1,.12,.5,'#c9a77b',gardenBench);
cyl(.5,.68,4.9,.07,1.2,'#b28a60');rounded(.5,1.25,4.9,.6,.5,.6,'#8ca28a');box(.5,1.27,5.21,.38,.045,.025,'#526852');
// A path lantern helps the small garden read at night without casting another shadow map.
cyl(-1.85,.86,3.55,.045,1.25,'#9e825e');glow(ball(-1.85,1.56,3.55,.22,.24,.22,'#ffe0a7'));rounded(-1.85,1.83,3.55,.39,.08,.39,'#aa8d64');lamp(-1.85,1.62,3.55,11,4);
// Keep the previous resident silhouette; small nested pivots give it gentle motion.
function resident(kind,x,z){
  const g=new T.Group();g.position.set(x,.22,z);scene.add(g);
  const rabbit=kind==='bunny';
  const fur=rabbit?'#f0dfc4':'#b78a61';
  const clothes=rabbit?'#d5a6a0':'#91a6a0';
  const arms=[],feet=[];
  ball(0,.55,0,.37,.46,.28,clothes,g);
  ball(0,.22,-.27,rabbit?.13:.11,.12,.13,fur,g);
  const head=new T.Group();head.position.y=1.12;g.add(head);
  ball(0,0,0,.43,.41,.35,fur,head);
  for(const side of [-1,1]){
    const foot=new T.Group();foot.position.set(side*.19,.13,.02);g.add(foot);
    ball(0,0,0,.15,.18,.2,fur,foot);feet.push(foot);
    const arm=new T.Group();arm.position.set(side*.36,.77,0);g.add(arm);
    ball(side*.02,-.2,0,.12,.26,.13,fur,arm);
    ball(0,-.07,0,.13,.13,.135,clothes,arm);arms.push(arm);
    if(rabbit){
      const ear=new T.Group();ear.position.set(side*.22,.3,0);ear.rotation.z=-side*.09;head.add(ear);
      ball(0,.25,0,.13,.43,.13,fur,ear);
      ball(0,.26,.11,.065,.3,.025,'#d9b3a9',ear);
    }else{
      ball(side*.32,.33,0,.18,.18,.12,fur,head);
      ball(side*.32,.34,.1,.1,.1,.025,'#dcc09a',head);
    }
    ball(side*.15,.05,.324,.043,.058,.028,'#403e36',head);
    ball(side*.15+.013,.073,.349,.011,.015,.007,'#fff8ee',head);
    ball(side*.25,-.09,.31,.07,.035,.025,'#d6a092',head);
  }
  ball(0,-.11,.31,.18,.12,.09,rabbit?'#fff2dc':'#e5c8a4',head);
  ball(0,-.06,.395,.045,.03,.025,'#755543',head);
  if(rabbit){
    ball(.3,.33,.16,.12,.07,.06,'#d0a86b',head);
  }else{
    box(0,.71,.272,.35,.04,.035,'#e6d3a5',g);
    for(let i=0;i<2;i++)ball(0,.52+i*.13,.28,.025,.025,.025,'#e8d7b6',g);
  }
  g.userData={head,arms,feet};
  return g;
}
const bunny=resident('bunny',WAYPOINTS.garden.x,WAYPOINTS.garden.z),bear=resident('bear',WAYPOINTS.living.x,WAYPOINTS.living.z);bear.position.y=WAYPOINTS.living.y;
const life={};
for(const [kind,group] of Object.entries({bunny,bear})){
  const config=RESIDENTS[kind];
  const marker=new T.Mesh(new T.RingGeometry(.37,.48,32),new T.MeshBasicMaterial({color:kind==='bunny'?'#d39c8e':'#91ad81',side:T.DoubleSide,transparent:true,opacity:.8}));
  marker.rotation.x=-Math.PI/2;marker.position.y=.045;marker.visible=false;group.add(marker);
  life[kind]={group,config,node:config.start,step:0,remaining:config.plan[0].seconds,route:[],moving:false,marker};
}
let paused=false,selected=null;const clock=new T.Clock();let elapsed=0;
// One full cycle follows the local calendar. The preview button only overrides its target.
const seasons=[
  {name:'春',icon:'🌸',grass:'#a9c887',leaf:'#95b879',sky:'#eef5e7',sun:'#fff0c5',sunHeight:14,flowers:1,crops:.52,foliage:.83,snow:0,fallen:0},
  {name:'夏',icon:'☀',grass:'#91b46f',leaf:'#719b63',sky:'#f4f3df',sun:'#ffe3aa',sunHeight:17,flowers:.78,crops:1,foliage:1,snow:0,fallen:0},
  {name:'秋',icon:'🍂',grass:'#b5ac75',leaf:'#bf8754',sky:'#f3e6d2',sun:'#ffd29f',sunHeight:12,flowers:.28,crops:.66,foliage:.68,snow:0,fallen:1},
  {name:'冬',icon:'❄',grass:'#c8c8b2',leaf:'#b7ae95',sky:'#e5edf1',sun:'#d9e8f1',sunHeight:9,flowers:0,crops:.08,foliage:.03,snow:1,fallen:.14}
];
function calendarSeason(date=new Date()){
  let month=date.getMonth()+(date.getDate()-1+date.getHours()/24)/new Date(date.getFullYear(),date.getMonth()+1,0).getDate();
  if(month<3.5)month+=12;
  const index=Math.min(3,Math.floor((month-3.5)/3));
  const t=T.MathUtils.clamp((month-(3.5+index*3))/3,0,1);
  return index+t*t*(3-2*t);
}
let seasonOverride=-1,seasonPhase=calendarSeason(),seasonClock=0;
const snowCover=new T.Mesh(new T.PlaneGeometry(14.85,12.85),new T.MeshBasicMaterial({color:'#f4f7f4',transparent:true,opacity:0,depthWrite:false}));
snowCover.rotation.x=-Math.PI/2;snowCover.position.y=.145;scene.add(snowCover);
const fallenLeafMaterial=new T.MeshStandardMaterial({color:'#bc7f51',roughness:1,side:T.DoubleSide,transparent:true,opacity:0,depthWrite:false});
const fallenLeaves=new T.InstancedMesh(leafGeometry,fallenLeafMaterial,90),leafDummy=new T.Object3D();
for(let i=0;i<90;i++){
  const x=-6.05+((i*7.917)%12.1),z=-5.15+((i*4.381)%10.3);
  leafDummy.position.set(x,.16+(i%5)*.002,z);leafDummy.rotation.set(-Math.PI/2,0,i*2.399);
  leafDummy.scale.setScalar(.08+(i%4)*.012);leafDummy.updateMatrix();fallenLeaves.setMatrixAt(i,leafDummy.matrix);
  fallenLeaves.setColorAt(i,new T.Color(['#d69257','#b77348','#e6af72','#aa7146'][i%4]));
}
fallenLeaves.instanceMatrix.needsUpdate=true;fallenLeaves.instanceColor.needsUpdate=true;fallenLeaves.frustumCulled=false;fallenLeaves.visible=false;scene.add(fallenLeaves);
const snowPositions=new Float32Array(110*3);
for(let i=0;i<110;i++){snowPositions[i*3]=-6.2+(i*4.971)%12.4;snowPositions[i*3+1]=.35+(i*1.749)%5;snowPositions[i*3+2]=-5.2+(i*3.473)%10.4}
const snowGeometry=new T.BufferGeometry();snowGeometry.setAttribute('position',new T.BufferAttribute(snowPositions,3));
const snowfall=new T.Points(snowGeometry,new T.PointsMaterial({color:'#fffefd',size:.045,transparent:true,opacity:0,depthWrite:false}));scene.add(snowfall);
const poolCanvas=document.createElement('canvas');poolCanvas.width=64;poolCanvas.height=64;
const poolContext=poolCanvas.getContext('2d'),poolGradient=poolContext.createRadialGradient(32,32,1,32,32,32);
poolGradient.addColorStop(0,'rgba(255,220,144,.7)');poolGradient.addColorStop(.5,'rgba(255,218,147,.23)');poolGradient.addColorStop(1,'rgba(255,218,147,0)');poolContext.fillStyle=poolGradient;poolContext.fillRect(0,0,64,64);
const poolTexture=new T.CanvasTexture(poolCanvas),lightPools=[];
for(const [x,z,r,y] of [[-1.85,3.55,3.2,.17],[3.13,.92,2.4,.69],[-2.85,-4.24,2,.68],[-.43,-.98,1.9,.68]]){
  const pool=new T.Mesh(new T.PlaneGeometry(r,r),new T.MeshBasicMaterial({map:poolTexture,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending}));
  pool.rotation.x=-Math.PI/2;pool.position.set(x,y,z);scene.add(pool);lightPools.push(pool);
}
const lightingPresets=[
  {sky:new T.Color('#f5f3e9'),skyLight:new T.Color('#fff9e9'),groundLight:new T.Color('#93a675'),key:new T.Color('#ffe3ae'),keyPower:4,ambientPower:2.5,exposure:1.3,lamps:0,label:new T.Color('#ffffff')},
  {sky:new T.Color('#ddc9be'),skyLight:new T.Color('#ffe1c5'),groundLight:new T.Color('#947f80'),key:new T.Color('#ffae77'),keyPower:2.25,ambientPower:1.7,exposure:1.22,lamps:.45,label:new T.Color('#f7ead9')},
  {sky:new T.Color('#293749'),skyLight:new T.Color('#b5c9e7'),groundLight:new T.Color('#435369'),key:new T.Color('#9dbbe0'),keyPower:.55,ambientPower:1.02,exposure:1.18,lamps:1,label:new T.Color('#b8c3d2')}
];
const timeModes=[
  {label:'暖暖午后',weather:'微风 · 宜享受生活',icon:'☀',next:'黄昏'},
  {label:'温柔黄昏',weather:'晚霞 · 小院亮起灯火',icon:'◒',next:'夜晚'},
  {label:'灯火夜晚',weather:'晚风 · 适合慢慢休息',icon:'☾',next:'午后'}
];
let timeMode=0,lightingPhase=0;
const seasonColor=new T.Color(),seasonSun=new T.Color(),seasonSky=new T.Color();
function seasonValue(key,index,mix){return T.MathUtils.lerp(seasons[index][key],seasons[(index+1)%4][key],mix)}
function updateLighting(dt){
  const gap=timeMode-lightingPhase;
  lightingPhase+=Math.sign(gap)*Math.min(Math.abs(gap),dt*.8);
  seasonClock+=dt;
  if(seasonClock>60){seasonClock=0;if(seasonOverride<0)document.querySelector('#season-label').textContent=`${seasons[Math.floor(calendarSeason())].name}日 · 随日期缓慢变化`}
  const targetSeason=seasonOverride<0?calendarSeason():seasonOverride;
  let seasonGap=((targetSeason-seasonPhase+6)%4)-2;
  if(Math.abs(seasonGap)>1.95)seasonGap=targetSeason-seasonPhase;
  seasonPhase=(seasonPhase+Math.sign(seasonGap)*Math.min(Math.abs(seasonGap),dt*.48)+4)%4;
  const si=Math.floor(seasonPhase),sm=seasonPhase-si;
  const seasonA=seasons[si],seasonB=seasons[(si+1)%4];
  seasonColor.set(seasonA.leaf).lerp(new T.Color(seasonB.leaf),sm);
  leafMaterial.color.copy(seasonColor);
  for(const {canopy,leaves,leafCount} of treeVisuals){
    const foliage=seasonValue('foliage',si,sm);
    canopy.material.color.copy(seasonColor);canopy.material.opacity=Math.min(1,foliage*1.18);
    canopy.visible=foliage>.06;canopy.castShadow=foliage>.35;
    leaves.count=Math.round(leafCount*foliage);leaves.visible=foliage>.06;
  }
  const flowerSize=seasonValue('flowers',si,sm),cropSize=seasonValue('crops',si,sm);
  for(const flower of flowerGroups)flower.scale.setScalar(Math.max(.001,flowerSize));
  for(const crop of cropGroups)crop.scale.setScalar(Math.max(.001,cropSize));
  mat(colors.grass).color.set(seasonA.grass).lerp(new T.Color(seasonB.grass),sm);
  const snow=seasonValue('snow',si,sm),fallen=seasonValue('fallen',si,sm);
  snowCover.material.opacity=snow*.82;snowCover.visible=snow>.01;
  snowfall.material.opacity=snow*.85;snowfall.visible=snow>.05;
  fallenLeafMaterial.opacity=fallen*.95;fallenLeaves.visible=fallen>.05;
  const a=Math.min(2,Math.floor(lightingPhase)),b=Math.min(2,a+1),mix=lightingPhase-a;
  const from=lightingPresets[a],to=lightingPresets[b];
  scene.background.lerpColors(from.sky,to.sky,mix);
  seasonSky.set(seasonA.sky).lerp(new T.Color(seasonB.sky),sm);
  scene.background.lerp(seasonSky,1-Math.min(1,lightingPhase*.74));
  backdrop.material.color.copy(scene.background);
  sun.color.lerpColors(from.key,to.key,mix);
  seasonSun.set(seasonA.sun).lerp(new T.Color(seasonB.sun),sm);
  sun.color.lerp(seasonSun,1-Math.min(1,lightingPhase*.65));
  sun.intensity=T.MathUtils.lerp(from.keyPower,to.keyPower,mix);
  sun.position.set(T.MathUtils.lerp(-5,-9,Math.min(1,lightingPhase)),T.MathUtils.lerp(seasonValue('sunHeight',si,sm),5,Math.min(1,lightingPhase)),8);
  hemi.color.lerpColors(from.skyLight,to.skyLight,mix);
  hemi.groundColor.lerpColors(from.groundLight,to.groundLight,mix);
  hemi.intensity=T.MathUtils.lerp(from.ambientPower,to.ambientPower,mix);
  renderer.toneMappingExposure=T.MathUtils.lerp(from.exposure,to.exposure,mix);
  const lampLevel=T.MathUtils.lerp(from.lamps,to.lamps,mix);
  for(const {light,power} of nightLights)light.intensity=power*lampLevel;
  for(const pool of lightPools)pool.material.opacity=lampLevel*.85;
  for(const material of glowingMaterials)material.emissiveIntensity=lampLevel*.85;
  document.body.style.backgroundColor=scene.background.getStyle();
  document.body.dataset.time=lightingPhase>=1.45?'night':lightingPhase>=.5?'dusk':'day';
}
const cameraAim=new T.Vector3(),cameraFocus=new T.Vector3(),cameraHome=new T.Vector3();
function placeLabel(node){
  return ({garden:'院子',vegetables:'菜地',bedroom:'卧室',bathroom:'浴室',kitchen:'厨房',computer:'电脑角',study:'书房',living:'客厅'})[node]||'屋内';
}
function displayLife(kind){
  const state=life[kind],button=document.querySelector(`[data-resident="${kind}"]`);
  const target=state.config.plan[state.step];
  button.querySelector('small').textContent=state.moving?`正在前往${placeLabel(target.at)}`:`正在${target.activity}`;
  button.querySelector('em').textContent=state.moving?'路上':placeLabel(target.at);
  if(selected===kind)document.querySelector('#note').textContent=`${state.config.name}：${state.moving?'正在前往'+placeLabel(target.at):target.activity}。`;
}
function updateLife(state,dt){
  if(state.route.length){
    state.moving=true;
    const next=WAYPOINTS[state.route[0]],dx=next.x-state.group.position.x,dz=next.z-state.group.position.z,distance=Math.hypot(dx,dz),travel=state.config.speed*dt;
    if(distance<=travel){state.group.position.set(next.x,next.y,next.z);state.node=state.route.shift();if(!state.route.length){state.moving=false;state.remaining=state.config.plan[state.step].seconds;displayLife(state.config===RESIDENTS.bunny?'bunny':'bear')}}
    else{state.group.position.x+=dx/distance*travel;state.group.position.z+=dz/distance*travel;state.group.position.y+=Math.sign(next.y-state.group.position.y)*Math.min(Math.abs(next.y-state.group.position.y),travel*.6)}
    if(distance>.01)state.group.rotation.y=Math.atan2(dx,dz);
    return;
  }
  state.remaining-=dt;
  if(state.remaining>0)return;
  state.step=(state.step+1)%state.config.plan.length;
  state.route=routeBetween(state.node,state.config.plan[state.step].at);
  state.moving=state.route.length>0;
  if(!state.moving)state.remaining=state.config.plan[state.step].seconds;
  displayLife(state.config===RESIDENTS.bunny?'bunny':'bear');
}
const socialScripts=[
  {title:'在院里分享点心',lines:[['bunny','栗栗，今天的点心是什么味道？'],['bear','是烤栗子味，留了最大的一块给你。'],['bunny','那我拿刚摘的菜来交换！'],['bear','成交。我们坐在这里慢慢吃吧。']]},
  {title:'一起照看菜地',lines:[['bear','这排菜苗长高了好多。'],['bunny','昨天浇过水，今天轮到松土啦。'],['bear','我来帮你拿小铲子。'],['bunny','有你帮忙，菜地一下就整理好了！']]},
  {title:'傍晚的小院闲聊',lines:[['bunny','今天的云像一只软软的小熊。'],['bear','我觉得更像刚出炉的面包。'],['bunny','那我们都猜对了一半。'],['bear','再看一会儿吧，天空还会变颜色。']]},
  {title:'交换阅读心得',lines:[['bear','你那本绘本看到结尾了吗？'],['bunny','看到了，最后他们一起种了一棵树。'],['bear','真好。下次我们也一起种点什么。'],['bunny','那就从窗边的小花开始！']]}
];
const historyKey='mossy-home-dialogue-v1';let dialogueHistory=[];
try{const saved=JSON.parse(localStorage.getItem(historyKey)||'[]');if(Array.isArray(saved))dialogueHistory=saved.filter(entry=>entry&&typeof entry.text==='string'&&typeof entry.kind==='string').slice(-80)}catch{}
const dialogueList=document.querySelector('#dialogue-list'),dialoguePanel=document.querySelector('#dialogue-panel');
function renderDialogue(){
  dialogueList.replaceChildren();
  if(!dialogueHistory.length){const empty=document.createElement('p');empty.className='dialogue-empty';empty.textContent='小院还很安静。等两位居民相遇，故事就会从这里开始。';dialogueList.append(empty);return}
  for(const entry of dialogueHistory){
    if(entry.kind==='event'){const row=document.createElement('p');row.className='dialogue-event';row.textContent=`✿ ${entry.text} · ${entry.time}`;dialogueList.append(row);continue}
    const row=document.createElement('div');row.className=`dialogue-line ${entry.kind}`;
    const avatar=document.createElement('span');avatar.className='dialogue-avatar';avatar.textContent=entry.kind==='bunny'?'🐰':'🐻';
    const body=document.createElement('div');body.className='dialogue-body';const name=document.createElement('b');name.textContent=entry.kind==='bunny'?'米米':'栗栗';
    const time=document.createElement('time');time.textContent=entry.time;const line=document.createElement('p');line.textContent=entry.text;
    body.append(time,name,line);row.append(avatar,body);dialogueList.append(row);
  }
  dialogueList.scrollTop=dialogueList.scrollHeight;
}
function logDialogue(kind,text){dialogueHistory.push({kind,text,time:new Date().toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})});dialogueHistory=dialogueHistory.slice(-80);try{localStorage.setItem(historyKey,JSON.stringify(dialogueHistory))}catch{}renderDialogue()}
renderDialogue();
const speechLayer=document.querySelector('#speech-layer'),speechBubbles={};
for(const kind of ['bunny','bear']){const bubble=document.createElement('div');bubble.className=`speech-bubble ${kind}`;speechLayer.append(bubble);speechBubbles[kind]={element:bubble,until:0}}
const social={phase:'idle',nextAt:9,index:0,script:null,line:0,timer:0,place:'garden',planned:false};
const socialMat=rounded(1.9,.173,3.7,1.1,.025,.75,'#eee0ba');socialMat.visible=false;
const teaTray=cyl(1.9,.21,3.7,.21,.035,'#bd9369');teaTray.visible=false;
const teaCups=[cyl(1.76,.27,3.7,.065,.09,'#fff1d8'),cyl(2.04,.27,3.7,.065,.09,'#fff1d8')];for(const cup of teaCups)cup.visible=false;
function socialProps(visible){socialMat.visible=visible;teaTray.visible=visible;for(const cup of teaCups)cup.visible=visible}
function socialStatus(text){for(const kind of ['bunny','bear']){const button=document.querySelector(`[data-resident="${kind}"]`);button.querySelector('small').textContent=text;button.querySelector('em').textContent=social.place==='garden'?'院子':placeLabel(social.place)}}
function beginSocial(planned=false,place='garden'){
  if(social.phase!=='idle')return;
  social.planned=planned;social.place=place;social.phase=planned?'travel':'talk';social.timer=0;social.line=0;
  social.script=socialScripts[social.index++%socialScripts.length];
  if(planned){for(const state of Object.values(life)){state.route=routeBetween(state.node,'garden');state.moving=state.route.length>0}socialStatus('正在前往院子相聚')}
  else activateSocial();
}
function activateSocial(){
  social.phase='talk';social.timer=0;
  if(social.planned){
    life.bunny.group.position.set(1.22,.22,3.22);
    life.bear.group.position.set(2.52,.22,4.16);
    const dx=life.bear.group.position.x-life.bunny.group.position.x,dz=life.bear.group.position.z-life.bunny.group.position.z;
    life.bunny.group.rotation.y=Math.atan2(dx,dz);
    life.bear.group.rotation.y=Math.atan2(-dx,-dz);
  }
  socialProps(social.place==='garden');
  socialStatus(social.script.title);
  logDialogue('event',social.script.title);
  document.querySelector('#note').textContent=`米米和栗栗：${social.script.title}。`;
}
function updateSocial(dt){
  if(social.phase==='idle'){
    const a=life.bunny,b=life.bear,distance=a.group.position.distanceTo(b.group.position);
    const safe=!['bedroom','bathroom'].includes(a.node)&&!['bedroom','bathroom'].includes(b.node);
    if(!a.moving&&!b.moving&&safe&&distance>=1.4&&distance<2.1&&elapsed>=social.nextAt)beginSocial(false,a.node);
    else if(elapsed>=social.nextAt)beginSocial(true,'garden');
    return;
  }
  if(social.phase==='travel'){
    if(!life.bunny.route.length&&!life.bear.route.length)activateSocial();
    return;
  }
  social.timer+=dt;
  const nextLineAt=social.line*3.7+.5;
  if(social.line<social.script.lines.length&&social.timer>=nextLineAt){
    const [kind,text]=social.script.lines[social.line++];
    speechBubbles[kind].element.textContent=text;speechBubbles[kind].until=elapsed+3.15;
    logDialogue(kind,text);
  }
  if(social.timer>social.script.lines.length*3.7+2){
    social.phase='idle';social.nextAt=elapsed+55;socialProps(false);
    for(const state of Object.values(life)){state.remaining=0;state.moving=false}
    document.querySelector('#note').textContent='小院里又添了一段温暖的小故事。';
  }
}
document.querySelector('#dialogue').onclick=()=>{dialoguePanel.hidden=!dialoguePanel.hidden;document.querySelector('#dialogue').setAttribute('aria-expanded',String(!dialoguePanel.hidden));if(!dialoguePanel.hidden)dialogueList.scrollTop=dialogueList.scrollHeight};
document.querySelector('#close-dialogue').onclick=()=>{dialoguePanel.hidden=true;document.querySelector('#dialogue').setAttribute('aria-expanded','false')};
document.querySelector('#meet-now').onclick=()=>{if(social.phase==='idle'){social.nextAt=elapsed;beginSocial(true,'garden')}dialoguePanel.hidden=true;document.querySelector('#dialogue').setAttribute('aria-expanded','false')};
const bubblePoint=new T.Vector3();
function updateSpeech(){
  const w=host.clientWidth,h=host.clientHeight;
  for(const [kind,{element,until}] of Object.entries(speechBubbles)){
    const visible=elapsed<until&&until>0;
    element.classList.toggle('is-visible',visible);
    if(!visible)continue;
    const group=life[kind].group;
    bubblePoint.set(group.position.x,group.position.y+(kind==='bunny'?2.15:1.95),group.position.z).project(camera);
    element.style.left=`${(bubblePoint.x*.5+.5)*w}px`;
    element.style.top=`${(-bubblePoint.y*.5+.5)*h}px`;
  }
}
displayLife('bunny');displayLife('bear');
function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);const aspect=w/h;const size=Math.max(9.4,10/aspect);camera.left=-size*aspect;camera.right=size*aspect;camera.top=size;camera.bottom=-size;camera.updateProjectionMatrix();camera.setViewOffset(w,h,aspect>1.2?w*.065:0,-h*.025,w,h)}addEventListener('resize',resize);resize();
document.querySelector('#loading').remove();
document.querySelector('#motion').onclick=e=>{paused=!paused;e.currentTarget.innerHTML=paused?'▶ <span>继续生活</span>':'Ⅱ <span>暂停生活</span>';e.currentTarget.setAttribute('aria-pressed',String(paused))};
document.querySelector('#light').onclick=()=>{
  timeMode=(timeMode+1)%timeModes.length;
  const mode=timeModes[timeMode],button=document.querySelector('#light');
  document.querySelector('#time-label').textContent=mode.label;
  document.querySelector('#weather-icon').textContent=mode.icon;
  document.querySelector('.weather small').firstChild.textContent=mode.weather;
  button.innerHTML=`☼ <span>切换${mode.next}</span>`;
  button.setAttribute('aria-label',`切换${mode.next}场景`);
};
const seasonButton=document.querySelector('#season');
function showSeasonControl(){
  const automatic=seasonOverride<0,season=seasons[automatic?Math.floor(calendarSeason()):seasonOverride];
  seasonButton.innerHTML=`${season.icon} <span>${automatic?'四季自动':season.name+'季预览'}</span>`;
  seasonButton.setAttribute('aria-label',automatic?'切换至春季预览':`当前${season.name}季预览，切换季节`);
  seasonButton.setAttribute('aria-pressed',String(!automatic));
  document.querySelector('#season-label').textContent=automatic?`${season.name}日 · 随日期缓慢变化`:`${season.name}季 · 手动预览`;
}
seasonButton.onclick=()=>{seasonOverride=(seasonOverride+1)%5;if(seasonOverride===4)seasonOverride=-1;showSeasonControl()};
showSeasonControl();
for(const b of document.querySelectorAll('[data-resident]'))b.onclick=()=>{selected=b.dataset.resident;camera.clearViewOffset();for(const [kind,state] of Object.entries(life))state.marker.visible=kind===selected;displayLife(selected)};
document.querySelector('#reset').onclick=()=>{selected=null;for(const state of Object.values(life))state.marker.visible=false;cameraAim.set(0,0,0);camera.zoom=1;camera.position.set(16,23,24);camera.lookAt(0,0,0);resize();document.querySelector('#note').textContent='今天也是适合发呆的好天气。'};
renderer.setAnimationLoop(()=>{
  const frameDt=clock.getDelta(),dt=Math.min(frameDt,.05);
  if(!paused){
    elapsed+=dt;
    if(social.phase==='idle')for(const state of Object.values(life))updateLife(state,dt);
    else if(social.phase==='travel')for(const state of Object.values(life))if(state.route.length)updateLife(state,dt);
    updateSocial(dt);
  }
  for(const [kind,state] of Object.entries(life)){
    const phase=elapsed*(state.moving?10:2)+(kind==='bear'?1:0),pace=state.moving?.03:.015;
    state.group.scale.y=1+Math.sin(phase)*pace;
    const {head,arms,feet}=state.group.userData;
    head.rotation.z=Math.sin(elapsed*1.3+(kind==='bear'?1:0))*.035;
    head.rotation.y=Math.sin(elapsed*.65+(kind==='bear'?1.4:0))*.08;
    for(let i=0;i<2;i++){
      const swing=state.moving?Math.sin(phase+i*Math.PI)*.26:Math.sin(elapsed*1.5+i*Math.PI)*.025;
      arms[i].rotation.x=swing;feet[i].rotation.x=state.moving?-swing*.7:0;
    }
  }
  const breeze=Math.sin(elapsed*.36)*.65+Math.sin(elapsed*.71+1.2)*.35;
  for(const {group,phase,strength} of windParts){group.rotation.z=(breeze+Math.sin(elapsed*1.13+phase)*.28)*strength;group.rotation.x=Math.sin(elapsed*.83+phase)*strength*.55}
  if(snowfall.visible){const positions=snowGeometry.attributes.position;for(let i=0;i<positions.count;i++){let y=positions.getY(i)-dt*(.23+(i%7)*.035);if(y<.2)y+=5;positions.setY(i,y);positions.setX(i,positions.getX(i)+Math.sin(elapsed*.7+i)*dt*.025)}positions.needsUpdate=true}
  if(selected){const p=life[selected].group.position;cameraFocus.set(p.x,p.y+1,p.z)}else cameraFocus.set(0,0,0);
  cameraAim.lerp(cameraFocus,Math.min(1,dt*2.5));cameraHome.set(16+cameraAim.x,23+cameraAim.y,24+cameraAim.z);
  camera.position.copy(cameraHome);camera.lookAt(cameraAim);
  camera.zoom+=((selected?2.05:1)-camera.zoom)*Math.min(1,dt*2.5);camera.updateProjectionMatrix();
  updateSpeech();updateLighting(Math.min(frameDt,.5));renderer.render(scene,camera);
});


