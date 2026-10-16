import * as T from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import {ROOMS,WAYPOINTS,RESIDENTS,routeBetween} from './world-data.js?v=4';
const host=document.querySelector('#scene');
const scene=new T.Scene();scene.background=new T.Color('#f5f3e9');
const renderer=new T.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;host.appendChild(renderer.domElement);
const camera=new T.OrthographicCamera();camera.position.set(16,23,24);camera.lookAt(0,0,0);
const hemi=new T.HemisphereLight(0xfff9e9,0x93a675,2.5);scene.add(hemi);const sun=new T.DirectionalLight(0xffe3ae,4);sun.position.set(-5,15,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-13,right:13,top:13,bottom:-13});sun.shadow.normalBias=.03;scene.add(sun);
const colors={grass:'#a7bd83',wood:'#b3855d',cream:'#fff1d5',wall:'#ebdfbd',pink:'#d8a19a',green:'#829d87',dark:'#51463b'};
const mats=new Map();function mat(c){if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,roughness:.85}));return mats.get(c)}
function mesh(geo,c,x,y,z,parent=scene){const m=new T.Mesh(geo,mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function box(x,y,z,w,h,d,c,p=scene){return mesh(new T.BoxGeometry(w,h,d),c,x,y,z,p)}
function ball(x,y,z,a,b,c,col,p=scene){const m=mesh(new T.SphereGeometry(1,24,16),col,x,y,z,p);m.scale.set(a,b,c);return m}
function cyl(x,y,z,r,h,c,p=scene,r2=r){return mesh(new T.CylinderGeometry(r2,r,h,24),c,x,y,z,p)}
function rounded(x,y,z,w,h,d,c,p=scene){const g=new T.Group();g.position.set(x,y,z);p.add(g);const r=Math.min(w,h,d)*.22;box(0,0,0,w-2*r,h,d-2*r,c,g);box(0,0,0,w,h-2*r,d-2*r,c,g);box(0,0,0,w-2*r,h-2*r,d,c,g);for(const a of [-1,1])for(const b of [-1,1])for(const e of [-1,1])ball(a*(w/2-r),b*(h/2-r),e*(d/2-r),r,r,r,c,g);return g}
// Six distinct roofless rooms in a two-by-three dollhouse plan.
rounded(0,-.5,0,15,.9,13,'#c9b590');rounded(0,-.04,0,15,.35,13,colors.grass);
box(0,-1.08,0,200,.2,200,'#f5f3e9');
rounded(-1,.27,-1.6,9.3,.55,6.7,'#bd9d78');box(-1,.57,-1.6,9,.13,6.4,'#e1c49c');
for(const {x,z,label,color} of ROOMS){box(x,.649,z,2.89,.014,3.04,color);roomLabel(label,x,z> -2?1.18:-1.94)}
function roomLabel(label,x,z){const c=document.createElement('canvas');c.width=256;c.height=80;const ctx=c.getContext('2d');ctx.fillStyle='#fff8e9';ctx.beginPath();ctx.roundRect(2,3,252,74,24);ctx.fill();ctx.fillStyle='#66775f';ctx.font='bold 32px Microsoft YaHei, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,128,41);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(label.length>2?.92:.72,.28),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(x,.674,z);scene.add(m)}
for(let x=-5.4;x<3.5;x+=.48)box(x,.659,-1.6,.018,.008,6.3,'#caaa81');
// Tall exterior walls and low interior partitions leave every room visible.
box(-1,2.2,-4.8,9.2,3.3,.18,colors.wall);box(-5.5,1.85,-1.6,.16,2.6,6.5,colors.wall);box(3.5,1.02,-1.7,.15,.8,6.4,colors.wall);
// Data-derived gaps align with the route graph, so residents walk through doors.
function partitionWithDoor(axis,fixed,start,end,opening){
  const half=.53;
  for(const [a,b] of [[start,opening-half],[opening+half,end]]){
    if(b<=a)continue;
    if(axis==='x')box((a+b)/2,1.13,fixed,b-a,.92,.13,'#d7c9a9');
    else box(fixed,1.13,(a+b)/2,.13,.92,b-a,'#d7c9a9');
  }
}
for(const x of [-2.5,.5]){
  partitionWithDoor('z',x,-4.7,-1.73,-3.2);
  partitionWithDoor('z',x,-1.59,1.45,-.05);
}
let wallStart=-5.45;
for(const x of [-4,-1,2]){
  partitionWithDoor('x',-1.66,wallStart,x+.53,x);
  wallStart=x+.53;
}
box((wallStart+3.45)/2,1.13,-1.66,3.45-wallStart,.92,.13,'#d7c9a9');
box(-1,3.88,-4.8,9.4,.12,.26,'#c0a47b');box(-5.5,3.2,-1.6,.23,.12,6.6,'#c0a47b');
function windowAt(x,w=1.38){box(x,2.6,-4.66,w,1.42,.1,'#b0936a');box(x,2.6,-4.58,w-.2,1.22,.1,'#b4d9ce');box(x,2.6,-4.5,.06,1.3,.08,colors.cream);box(x,2.6,-4.49,w-.15,.06,.08,colors.cream);box(x,1.8,-4.4,w+.17,.1,.4,colors.cream)}
windowAt(-4);windowAt(2);windowAt(-1,.9);box(-1,2.6,-4.45,.7,1.1,.025,'#d9e7df');
// Bedroom: a bed, wardrobe, bedside table and little lamp.
function furnishBedroom(){
rounded(-3.96,.96,-3.52,1.55,.5,2.1,'#b78762');rounded(-3.96,1.26,-3.52,1.48,.23,2.02,'#fff3dc');rounded(-3.96,1.43,-3.16,1.48,.14,1.25,'#aab99d');rounded(-3.96,1.47,-4.28,1.18,.2,.43,'#fff8e8');rounded(-3.96,1.38,-4.56,1.68,.69,.15,'#b78762');
rounded(-5.08,1.39,-3.87,.53,1.42,.88,'#b79471');box(-4.78,1.42,-3.87,.04,.45,.035,'#e9d3a4');
rounded(-2.85,.94,-4.24,.46,.52,.5,'#b98d64');cyl(-2.85,1.41,-4.24,.04,.4,'#c8ac75');mesh(new T.ConeGeometry(.24,.32,20),colors.cream,-2.85,1.76,-4.24);
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
box(2,1.72,-4.12,.72,.04,.64,'#5e6557');for(const x of [1.78,2.22])for(const z of [-4.31,-3.94])cyl(x,1.75,z,.12,.025,'#abb1a2');cyl(2,1.9,-4.12,.2,.24,'#e5c7a1');
rounded(3.05,1.63,-2.75,.65,1.93,.7,'#f5ebd6');box(2.76,1.7,-2.37,.04,.34,.05,'#adb7a1');
rounded(1.5,1.05,-2.65,1.3,.64,.68,'#b88f69');box(1.5,1.41,-2.65,1.38,.09,.76,'#f6e7c9');cyl(1.49,.9,-1.96,.25,.5,'#c5a478');
}
// Computer room: desk, luminous monitor, keyboard, tower and swivel chair.
function furnishComputer(){
rounded(-4.15,1.24,-1.04,1.95,.15,.75,'#a98263');for(const x of [-4.9,-3.4])box(x,.95,-1.03,.1,.58,.65,'#987356');
rounded(-4.18,1.74,-1.25,.87,.68,.1,'#434f51');box(-4.18,1.74,-1.18,.73,.53,.02,'#80a9a1');box(-4.18,1.47,-1.22,.08,.24,.08,'#6d7771');box(-4.18,1.34,-.78,.65,.035,.2,'#ddd8bc');
rounded(-3.18,1.03,-1.09,.35,.55,.47,'#5d706d');ball(-3.04,1.13,-.84,.045,.045,.02,'#b6d9c5');cyl(-4.18,.87,.04,.37,.1,'#a8b8ab');cyl(-4.18,.72,.04,.08,.27,'#b9a587');rounded(-4.18,1.2,.29,.75,.57,.18,'#9cad9d');
box(-5.18,1.36,-.1,.16,1.36,1.14,'#b9946e');for(const z of [-.47,-.04,.39])box(-5.05,1.14,z,.2,.06,.31,'#e7d2ac');
}
// Study: a bookshelf, open book, writing desk and warm reading lamp.
function furnishStudy(){
rounded(-1,1.06,-.62,1.52,.16,.83,'#c49b70');for(const x of [-1.55,-.45])box(x,.88,-.62,.1,.48,.72,'#aa805b');
for(const x of [-1.26,-.74])box(x,1.16,-.56,.42,.025,.29,'#fff4df');box(-1,1.18,-.56,.018,.04,.29,'#be9b74');
cyl(-.43,1.34,-.98,.04,.4,'#bd9b68');mesh(new T.ConeGeometry(.22,.32,18),colors.cream,-.43,1.66,-.98);
rounded(-1,.81,.46,.57,.1,.54,'#ad9d83');box(-1,1.1,.66,.57,.58,.11,'#ab9d85');
box(-2.29,1.38,-.13,.3,1.35,1.65,'#b68f68');for(const y of [.85,1.33,1.8]){box(-2.07,y,-.13,.15,.055,1.58,'#d7b789');for(let i=0;i<6;i++)box(-2.02,y+.15,-.77+i*.25,.1,.29,.1,['#9aa890','#d4a895','#c5bd96'][i%3])}
}
// Living room: sofa, low table, rug, plant and a small tea tray.
function furnishLiving(){
const loungeRug=cyl(2,.675,-.02,1.06,.027,'#dbceb0');loungeRug.scale.z=.8;
rounded(2,1.03,-1.04,1.75,.58,.72,colors.green);rounded(2,1.39,-1.39,1.8,.68,.22,colors.green);for(const x of [1.23,2.77])rounded(x,1.22,-1.03,.25,.57,.83,colors.green);for(const x of [1.62,2.38])rounded(x,1.33,-1.02,.64,.15,.61,'#b9c9ad');
rounded(2,1.02,.06,1.1,.13,.64,'#c79a6c');for(const x of [1.6,2.4])for(const z of [-.13,.25])cyl(x,.84,z,.055,.34,'#a97c53');cyl(2.22,1.17,.04,.13,.18,'#fff4de');box(1.74,1.12,.04,.31,.04,.37,'#9caa91');
function plant(x,y,z){cyl(x,y+.2,z,.19,.36,'#c28f73',scene,.27);for(let i=0;i<6;i++){const a=i*Math.PI/3;const leaf=ball(x+Math.cos(a)*.15,y+.61,z+Math.sin(a)*.15,.1,.32,.1,'#6f9271');leaf.rotation.z=Math.cos(a)*.6}}plant(3.1,.66,-.15);
}
const FURNISHERS={bedroom:furnishBedroom,bathroom:furnishBathroom,kitchen:furnishKitchen,computer:furnishComputer,study:furnishStudy,living:furnishLiving};
for(const room of ROOMS)FURNISHERS[room.id]();
// Front steps and stepping-stone garden path.
rounded(-1,.4,1.9,2.3,.32,.85,'#c8ab83');rounded(-1,.2,2.4,2.6,.25,.65,'#d8bea0');for(let i=0;i<5;i++){const stone=cyl(-1+Math.sin(i)*.16,.18,2.9+i*.65,.44,.12,'#ded6b9');stone.scale.z=.69;}
// Vegetable beds, with soil rows and leafy cabbages / carrots.
for(let bx of [3.5,5.3]){rounded(bx,.18,3.1,1.5,.28,2.8,'#b48b60');box(bx,.34,3.1,1.27,.04,2.57,'#795b40');for(let z=2.2;z<4.4;z+=.6)for(let x of [bx-.32,bx+.32]){if(bx<4){ball(x,.49,z,.22,.19,.22,'#8ea66b');for(let k=0;k<4;k++)ball(x+Math.cos(k*1.57)*.12,.5,z+Math.sin(k*1.57)*.12,.14,.14,.14,'#a9be7a')}else{mesh(new T.ConeGeometry(.08,.24,12),'#d89355',x,.43,z);for(let k=0;k<3;k++){const l=ball(x+(k-1)*.08,.65,z,.055,.23,.06,'#6d9461');l.rotation.z=(k-1)*.35}}}}
const crowns=[];function tree(x,z,s=1){cyl(x,.95,z,.23,1.8,'#a38158');const g=new T.Group();g.position.set(x,2,z);scene.add(g);for(const [a,b,c,r] of [[0,.6,0,1],[-.55,.2,.1,.8],[.55,.25,.2,.82],[0,.15,-.5,.86]])ball(a*s,b*s,c*s,r*s,r*.9*s,r*s,'#82a174',g);for(let i=0;i<4;i++)ball(Math.sin(i*2)*.7, .35+Math.cos(i)*.2,.65,.13,.15,.13,'#e2b47d',g);crowns.push(g)}tree(-5,3,1.1);tree(5.6,-3.4,1.05);tree(5.5,-.5,.8);
function fence(x,z,axis,length){for(let i=0;i<=length;i+=.7){const px=x+(axis==='x'?i:0),pz=z+(axis==='z'?i:0);rounded(px,.65,pz,.16,1.1,.16,'#eee0bc');ball(px,1.2,pz,.12,.1,.12,'#eee0bc')}for(let y of [.45,.92])box(x+(axis==='x'?length/2:0),y,z+(axis==='z'?length/2:0),axis==='x'?length:.1,.12,axis==='z'?length:.1,'#e3cea4')}
fence(-6.4,5.5,'x',4.2);fence(.5,5.5,'x',6);fence(6.6,-5.5,'z',11);fence(-6.5,-5.5,'z',11);fence(-6.4,-5.5,'x',13);
// Flowers, little stones, mailbox and an outdoor bench.
for(let i=0;i<36;i++){const x=-6+((i*3.71)%12),z=4.5+((i*1.31)%.55);if(x>2&&x<6||x> -2&&x<.5)continue;cyl(x,.28,z,.018,.3,'#799461');for(let k=0;k<5;k++)ball(x+Math.cos(k*1.256)*.075,.46,z+Math.sin(k*1.256)*.075,.065,.035,.065,i%2?'#f0dab2':'#dca9a0');ball(x,.48,z,.035,.03,.035,'#c5a366')}
rounded(-3, .61,2.7,1.5,.16,.55,'#bd9465');for(let x of [-3.55,-2.45])box(x,.35,2.7,.1,.55,.4,'#a78054');box(-3,1,2.95,1.5,.5,.1,'#bd9465');cyl(.5,.68,4.9,.07,1.2,'#b28a60');rounded(.5,1.25,4.9,.6,.5,.6,'#8ca28a');box(.5,1.27,5.21,.38,.045,.025,'#526852');
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
let paused=false,dusk=false,selected=null;const clock=new T.Clock();let elapsed=0;
const cameraAim=new T.Vector3(),cameraFocus=new T.Vector3(),cameraHome=new T.Vector3();
function placeLabel(node){
  return ({garden:'院子',vegetables:'菜地',bedroom:'卧室',bathroom:'厕所',kitchen:'厨房',computer:'电脑房',study:'书房',living:'客厅'})[node]||'屋内';
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
document.querySelector('#light').onclick=()=>{dusk=!dusk;sun.color.set(dusk?'#ffb577':'#ffe3ae');sun.intensity=dusk?2.4:4;hemi.intensity=dusk?1.4:2.5;scene.background.set(dusk?'#e9dfd2':'#f5f3e9');document.body.style.background=dusk?'#e9dfd2':'#f5f3e9';document.querySelector('#time-label').textContent=dusk?'温柔黄昏':'暖暖午后';document.querySelector('#light').innerHTML=dusk?'☼ <span>切换午后</span>':'☼ <span>切换黄昏</span>'};
for(const b of document.querySelectorAll('[data-resident]'))b.onclick=()=>{selected=b.dataset.resident;camera.clearViewOffset();for(const [kind,state] of Object.entries(life))state.marker.visible=kind===selected;displayLife(selected)};
document.querySelector('#reset').onclick=()=>{selected=null;for(const state of Object.values(life))state.marker.visible=false;cameraAim.set(0,0,0);camera.zoom=1;camera.position.set(16,23,24);camera.lookAt(0,0,0);resize();document.querySelector('#note').textContent='今天也是适合发呆的好天气。'};
renderer.setAnimationLoop(()=>{const dt=Math.min(clock.getDelta(),.05);if(!paused){elapsed+=dt;for(const state of Object.values(life))updateLife(state,dt)}for(const [kind,state] of Object.entries(life)){const phase=elapsed*(state.moving?10:2)+(kind==='bear'?1:0),pace=state.moving?.03:.015;state.group.scale.y=1+Math.sin(phase)*pace;const {head,arms,feet}=state.group.userData;head.rotation.z=Math.sin(elapsed*1.3+(kind==='bear'?1:0))*.035;head.rotation.y=Math.sin(elapsed*.65+(kind==='bear'?1.4:0))*.08;for(let i=0;i<2;i++){const swing=state.moving?Math.sin(phase+i*Math.PI)*.26:Math.sin(elapsed*1.5+i*Math.PI)*.025;arms[i].rotation.x=swing;feet[i].rotation.x=state.moving?-swing*.7:0}}for(let i=0;i<crowns.length;i++)crowns[i].rotation.z=Math.sin(elapsed*.7+i)*.012;if(selected){const p=life[selected].group.position;cameraFocus.set(p.x,p.y+1,p.z)}else cameraFocus.set(0,0,0);cameraAim.lerp(cameraFocus,Math.min(1,dt*2.5));cameraHome.set(16+cameraAim.x,23+cameraAim.y,24+cameraAim.z);camera.position.copy(cameraHome);camera.lookAt(cameraAim);camera.zoom+=((selected?2.05:1)-camera.zoom)*Math.min(1,dt*2.5);camera.updateProjectionMatrix();renderer.render(scene,camera)});


