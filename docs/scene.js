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
function rounded(x,y,z,w,h,d,c,p=scene){const g=new T.Group();g.position.set(x,y,z);p.add(g);const r=Math.min(w,h,d)*.22;box(0,0,0,w-2*r,h,d-2*r,c,g);box(0,0,0,w,h-2*r,d-2*r,c,g);box(0,0,0,w-2*r,h-2*r,d,c,g);for(const a of [-1,1])for(const b of [-1,1])for(const e of [-1,1])ball(a*(w/2-r),b*(h/2-r),e*(d/2-r),r,r,r,c,g);return g}
function twig(a,b,r1,r2,color,parent=scene){const from=new T.Vector3(...a),to=new T.Vector3(...b),delta=to.clone().sub(from);const m=mesh(new T.CylinderGeometry(r2,r1,delta.length(),7),color,...from.clone().add(to).multiplyScalar(.5).toArray(),parent);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m}
const windParts=[];
function wind(group,phase,strength=.04){windParts.push({group,phase,strength})}
const nightLights=[],glowingMaterials=[],roomLabelMaterials=[];
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
for(const {x,z,label} of ROOMS)roomLabel(label,x,z> -2?1.18:-1.94);
function roomLabel(label,x,z){const c=document.createElement('canvas');c.width=256;c.height=80;const ctx=c.getContext('2d');ctx.fillStyle='#fff8e9';ctx.beginPath();ctx.roundRect(2,3,252,74,24);ctx.fill();ctx.fillStyle='#66775f';ctx.font='bold 32px Microsoft YaHei, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,128,41);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(label.length>2?.92:.72,.28),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(x,.674,z);scene.add(m);roomLabelMaterials.push(m.material)}
// The rear/left perimeter frames the cutaway view. The kitchen, lounge,
// reading nook and computer corner have no enclosing partition walls.
box(-1,2.2,-4.8,9.2,3.3,.18,colors.wall);box(-5.5,1.85,-1.6,.16,2.6,6.5,colors.wall);box(3.5,1.02,-1.7,.15,.8,6.4,colors.wall);
function screenX(x,z1,z2,height=1.55){box(x,.65+height/2,(z1+z2)/2,.12,height,z2-z1,'#d9c9a9')}
function screenZ(z,x1,x2,height=1.55){box((x1+x2)/2,.65+height/2,z,x2-x1,height,.12,'#d9c9a9')}
// A small sleeping alcove and bathroom share one quiet wall, with wide entries.
screenX(-2.5,-4.82,-1.6);
screenX(.5,-4.82,-1.6);
screenZ(-1.66,-5.55,-4.65);screenZ(-1.66,-3.35,-2.45);
screenZ(-1.66,-2.55,-1.65);screenZ(-1.66,-.35,.55);
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
// Bathroom: tiled floor, bathtub, toilet, basin and a glass shower screen.
function furnishBathroom(){
for(let x=-2.38;x<.4;x+=.39)box(x,.659,-3.18,.012,.004,2.95,'#c9d9d2');for(let z=-4.63;z< -1.7;z+=.39)box(-1,.659,z,2.85,.004,.012,'#c9d9d2');
rounded(-1.2,.94,-4.03,1.55,.52,.92,'#f9f8ef');rounded(-1.2,1.205,-4.03,1.3,.08,.68,'#b6d7d6');for(const x of [-1.62,-1.25,-.88])ball(x,1.25,-4.04,.14,.08,.12,'#fffdfa');
const glass=new T.Mesh(new T.BoxGeometry(1.65,.9,.035),new T.MeshPhysicalMaterial({color:'#d9f0ed',transparent:true,opacity:.32,roughness:.12,metalness:.05,depthWrite:false}));glass.position.set(-1.2,1.54,-3.48);scene.add(glass);
rounded(-.06,.91,-2.45,.52,.43,.62,'#fff9ec');rounded(-.06,1.18,-2.45,.59,.1,.65,'#fff9ec');rounded(-.06,1.45,-2.72,.56,.5,.16,'#fff9ec');
rounded(-2.13,1.13,-2.48,.58,.19,.48,'#fff9ec');cyl(-2.13,1.38,-2.69,.035,.28,'#c3b68e');ball(-2.13,1.3,-2.48,.13,.02,.1,'#c6d9d1');box(-2.12,1.7,-4.55,.57,.75,.04,'#c9dfd7');
}
// Kitchen: a full counter run, stove, sink, fridge and breakfast stool.
function furnishKitchen(){
for(const x of [1.03,1.98,2.93]){rounded(x,1.13,-4.15,.9,.92,1.08,'#94ae9b');box(x,1.64,-4.15,.96,.11,1.16,'#fff4df');box(x,1.16,-3.59,.2,.04,.04,'#b28b58')}
box(1.03,1.71,-4.13,.61,.025,.58,'#b5cbc3');cyl(1.03,1.89,-4.34,.03,.29,'#c3b68e');
box(2,1.72,-4.12,.72,.04,.64,'#5e6557');for(const x of [1.78,2.22])for(const z of [-4.31,-3.94])cyl(x,1.75,z,.12,.025,'#abb1a2');cyl(2,1.9,-4.12,.2,.24,'#e5c7a1');glow(ball(2.7,2.35,-4.32,.16,.085,.11,'#fff1d1'));lamp(2.4,2.13,-3.95,6,3.1);
rounded(3.05,1.63,-2.75,.65,1.93,.7,'#f5ebd6');box(2.76,1.7,-2.37,.04,.34,.05,'#adb7a1');
 rounded(2.05,1.05,-2.65,1.05,.64,.68,'#b88f69');box(2.05,1.41,-2.65,1.13,.09,.76,'#f6e7c9');
 // The breakfast counter is the soft threshold between cooking and lounging.
 cyl(2.35,.92,-2.08,.23,.46,'#c5a478');cyl(2.35,1.18,-2.08,.27,.07,'#e6d5b4');
 cyl(1.73,1.52,-2.63,.16,.035,'#f9f4e6');ball(1.73,1.55,-2.63,.07,.06,.07,'#d49b76');
 box(1.95,2.3,-4.5,1.6,.07,.27,'#c19d74');for(const x of [1.55,1.92,2.29])cyl(x,2.43,-4.5,.08,.19,'#e8d9b7');
}
// Computer room: desk, luminous monitor, keyboard, tower and swivel chair.
function furnishComputer(){
rounded(-4.7,1.24,-.5,1.4,.15,.65,'#a98263');for(const x of [-5.25,-4.15])box(x,.95,-.5,.1,.58,.55,'#987356');
rounded(-4.7,1.74,-.72,.82,.68,.1,'#434f51');glow(box(-4.7,1.74,-.65,.68,.53,.02,'#80a9a1'),'#a9d9d5');box(-4.7,1.47,-.69,.08,.24,.08,'#6d7771');box(-4.7,1.34,-.25,.65,.035,.2,'#ddd8bc');
rounded(-4.12,1.03,-.48,.32,.55,.42,'#5d706d');ball(-3.98,1.13,-.25,.045,.045,.02,'#b6d9c5');cyl(-4.7,.87,.35,.34,.1,'#a8b8ab');cyl(-4.7,.72,.35,.08,.27,'#b9a587');rounded(-4.7,1.2,.58,.72,.57,.18,'#9cad9d');
box(-5.18,1.36,-.1,.16,1.36,1.14,'#b9946e');for(const z of [-.47,-.04,.39])box(-5.05,1.14,z,.2,.06,.31,'#e7d2ac');
}
// Study: a bookshelf, open book, writing desk and warm reading lamp.
function furnishStudy(){
rounded(-1,1.06,-.62,1.52,.16,.83,'#c49b70');for(const x of [-1.55,-.45])box(x,.88,-.62,.1,.48,.72,'#aa805b');
for(const x of [-1.26,-.74])box(x,1.16,-.56,.42,.025,.29,'#fff4df');box(-1,1.18,-.56,.018,.04,.29,'#be9b74');
cyl(-.43,1.34,-.98,.04,.4,'#bd9b68');glow(mesh(new T.ConeGeometry(.22,.32,18),colors.cream,-.43,1.66,-.98));lamp(-.43,1.55,-.98,8,3.1);
rounded(-1,.81,.26,.57,.1,.54,'#ad9d83');box(-1,1.1,.46,.57,.58,.11,'#ab9d85');
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
for(let bx of [3.5,5.3]){rounded(bx,.18,3.1,1.5,.28,2.8,'#b48b60');box(bx,.34,3.1,1.27,.04,2.57,'#795b40');for(let z=2.2;z<4.4;z+=.6)for(let x of [bx-.32,bx+.32]){const top=new T.Group();top.position.set(x,.41,z);scene.add(top);if(bx<4){ball(0,.13,0,.18,.17,.18,'#a8bc7e',top);for(let k=0;k<6;k++){const a=k*Math.PI/3;const leaf=ball(Math.cos(a)*.15,.12,Math.sin(a)*.15,.11,.08,.19,k%2?'#85a66b':'#94b276',top);leaf.rotation.y=a;leaf.rotation.z=Math.cos(a)*.35}}else{mesh(new T.ConeGeometry(.075,.2,10),'#d89355',x,.38,z);for(let k=0;k<4;k++){const a=k*Math.PI/2;twig([0,0,0],[Math.cos(a)*.1,.26,Math.sin(a)*.1],.017,.006,'#6d9461',top);const leaf=ball(Math.cos(a)*.13,.26,Math.sin(a)*.13,.04,.19,.055,'#83a66e',top);leaf.rotation.z=-Math.cos(a)*.32}}wind(top,x+z,.04)}}
// Tapered branches and irregular leaf clusters keep the trees soft without hiding their structure.
function tree(x,z,s=1,seed=0){
  const trunk=new T.Group();trunk.position.set(x,.26,z);trunk.scale.setScalar(s);scene.add(trunk);
  twig([0,0,0],[0,1.9,0],.23,.13,'#a38158',trunk);
  for(let i=0;i<7;i++){
    const angle=i*2.399+seed,level=i%3,base=1.08+level*.22;
    const reach=(i===6?.38:.72+.12*(i%2)),rise=.54+.13*((i+1)%3);
    const branch=new T.Group();branch.position.y=base;trunk.add(branch);
    const dx=Math.cos(angle)*reach,dz=Math.sin(angle)*reach;
    twig([0,0,0],[dx*.53,rise*.62,dz*.53],.095,.065,'#a38158',branch);
    twig([dx*.53,rise*.62,dz*.53],[dx,rise,dz],.065,.025,'#ad8c63',branch);
    for(let cluster=0;cluster<3;cluster++){
      const a=angle+cluster*2.094,r=.17+(cluster%2)*.13;
      const cx=dx+Math.cos(a)*r,cy=rise+.11+(cluster===1?.14:0),cz=dz+Math.sin(a)*r;
      ball(cx,cy,cz,.32,.27,.29,['#83a573','#91ae7d','#789b70'][(i+cluster+seed)%3|0],branch);
      for(let j=0;j<4;j++){
        const theta=a+j*1.57,leaf=ball(cx+Math.cos(theta)*.22,cy+.08+(j%2)*.13,cz+Math.sin(theta)*.18,.095,.15,.075,j%2?'#a6bd83':'#94b479',branch);
        leaf.rotation.z=-Math.cos(theta)*.55;leaf.rotation.x=Math.sin(theta)*.4;
      }
    }
    if(i<4)ball(dx*.87,rise+.02,dz*.87,.105,.11,.1,'#e1b783',branch);
    wind(branch,seed+i*.7,.035+(i%3)*.008);
  }
  for(let i=0;i<3;i++){const a=i*2.1+seed;twig([Math.cos(a)*.08,0,Math.sin(a)*.08],[Math.cos(a)*.28,.18,Math.sin(a)*.28],.06,.015,'#9c7956',trunk)}
}
tree(-5,3,1.1,.2);tree(5.6,-3.4,1.05,1.6);tree(5.5,-.5,.8,3.1);
function fence(x,z,axis,length){for(let i=0;i<=length;i+=.7){const px=x+(axis==='x'?i:0),pz=z+(axis==='z'?i:0);rounded(px,.65,pz,.16,1.1,.16,'#eee0bc');ball(px,1.2,pz,.12,.1,.12,'#eee0bc')}for(let y of [.45,.92])box(x+(axis==='x'?length/2:0),y,z+(axis==='z'?length/2:0),axis==='x'?length:.1,.12,axis==='z'?length:.1,'#e3cea4')}
fence(-6.4,5.5,'x',4.2);fence(.5,5.5,'x',6);fence(6.6,-5.5,'z',11);fence(-6.5,-5.5,'z',11);fence(-6.4,-5.5,'x',13);
// Flowers, little stones, mailbox and an outdoor bench.
for(let i=0;i<36;i++){const x=-6+((i*3.71)%12),z=4.5+((i*1.31)%.55);if(x>2&&x<6||x> -2&&x<.5)continue;const flower=new T.Group();flower.position.set(x,.18,z);scene.add(flower);twig([0,0,0],[0,.27,0],.018,.009,'#799461',flower);for(const side of [-1,1]){const leaf=ball(side*.075,.13,0,.09,.035,.055,'#89a672',flower);leaf.rotation.z=side*.35}for(let k=0;k<5;k++)ball(Math.cos(k*1.256)*.072,.29,Math.sin(k*1.256)*.072,.065,.035,.065,i%2?'#f0dab2':'#dca9a0',flower);ball(0,.3,0,.035,.03,.035,'#c5a366',flower);wind(flower,i*.7,.045)}
rounded(-3, .61,2.7,1.5,.16,.55,'#bd9465');for(let x of [-3.55,-2.45])box(x,.35,2.7,.1,.55,.4,'#a78054');box(-3,1,2.95,1.5,.5,.1,'#bd9465');cyl(.5,.68,4.9,.07,1.2,'#b28a60');rounded(.5,1.25,4.9,.6,.5,.6,'#8ca28a');box(.5,1.27,5.21,.38,.045,.025,'#526852');
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
function updateLighting(dt){
  const gap=timeMode-lightingPhase;
  if(gap===0)return;
  lightingPhase+=Math.sign(gap)*Math.min(Math.abs(gap),dt*.8);
  const a=Math.min(2,Math.floor(lightingPhase)),b=Math.min(2,a+1),mix=lightingPhase-a;
  const from=lightingPresets[a],to=lightingPresets[b];
  scene.background.lerpColors(from.sky,to.sky,mix);
  backdrop.material.color.copy(scene.background);
  sun.color.lerpColors(from.key,to.key,mix);
  sun.intensity=T.MathUtils.lerp(from.keyPower,to.keyPower,mix);
  hemi.color.lerpColors(from.skyLight,to.skyLight,mix);
  hemi.groundColor.lerpColors(from.groundLight,to.groundLight,mix);
  hemi.intensity=T.MathUtils.lerp(from.ambientPower,to.ambientPower,mix);
  renderer.toneMappingExposure=T.MathUtils.lerp(from.exposure,to.exposure,mix);
  const lampLevel=T.MathUtils.lerp(from.lamps,to.lamps,mix);
  for(const {light,power} of nightLights)light.intensity=power*lampLevel;
  for(const material of glowingMaterials)material.emissiveIntensity=lampLevel*.85;
  for(const material of roomLabelMaterials)material.color.lerpColors(from.label,to.label,mix);
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
displayLife('bunny');displayLife('bear');
function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);const aspect=w/h;const size=Math.max(9.4,10/aspect);camera.left=-size*aspect;camera.right=size*aspect;camera.top=size;camera.bottom=-size;camera.updateProjectionMatrix();camera.setViewOffset(w,h,aspect>1.2?w*.065:0,-h*.025,w,h)}addEventListener('resize',resize);resize();
document.querySelector('#loading').remove();
document.querySelector('#motion').onclick=e=>{paused=!paused;e.currentTarget.innerHTML=paused?'▶ <span>继续生活</span>':'Ⅱ <span>暂停生活</span>';e.currentTarget.setAttribute('aria-pressed',String(paused))};
document.querySelector('#light').onclick=()=>{
  timeMode=(timeMode+1)%timeModes.length;
  const mode=timeModes[timeMode],button=document.querySelector('#light');
  document.querySelector('#time-label').textContent=mode.label;
  document.querySelector('#weather-icon').textContent=mode.icon;
  document.querySelector('.weather small').textContent=mode.weather;
  button.innerHTML=`☼ <span>切换${mode.next}</span>`;
  button.setAttribute('aria-label',`切换${mode.next}场景`);
};
for(const b of document.querySelectorAll('[data-resident]'))b.onclick=()=>{selected=b.dataset.resident;camera.clearViewOffset();for(const [kind,state] of Object.entries(life))state.marker.visible=kind===selected;displayLife(selected)};
document.querySelector('#reset').onclick=()=>{selected=null;for(const state of Object.values(life))state.marker.visible=false;cameraAim.set(0,0,0);camera.zoom=1;camera.position.set(16,23,24);camera.lookAt(0,0,0);resize();document.querySelector('#note').textContent='今天也是适合发呆的好天气。'};
renderer.setAnimationLoop(()=>{
  const frameDt=clock.getDelta(),dt=Math.min(frameDt,.05);
  if(!paused){elapsed+=dt;for(const state of Object.values(life))updateLife(state,dt)}
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
  if(selected){const p=life[selected].group.position;cameraFocus.set(p.x,p.y+1,p.z)}else cameraFocus.set(0,0,0);
  cameraAim.lerp(cameraFocus,Math.min(1,dt*2.5));cameraHome.set(16+cameraAim.x,23+cameraAim.y,24+cameraAim.z);
  camera.position.copy(cameraHome);camera.lookAt(cameraAim);
  camera.zoom+=((selected?2.05:1)-camera.zoom)*Math.min(1,dt*2.5);camera.updateProjectionMatrix();
  updateLighting(Math.min(frameDt,.5));renderer.render(scene,camera);
});



