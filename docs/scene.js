import * as T from './three.module.js';
const host=document.querySelector('#scene');
const scene=new T.Scene();scene.background=new T.Color('#f5f3e9');
const renderer=new T.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;host.appendChild(renderer.domElement);
const camera=new T.OrthographicCamera();camera.position.set(16,20,24);camera.lookAt(0,0,0);
const hemi=new T.HemisphereLight(0xfff9e9,0x93a675,2.5);scene.add(hemi);const sun=new T.DirectionalLight(0xffe3ae,4);sun.position.set(-5,15,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-13,right:13,top:13,bottom:-13});sun.shadow.normalBias=.03;scene.add(sun);
const colors={grass:'#a7bd83',wood:'#b3855d',cream:'#fff1d5',wall:'#ebdfbd',pink:'#d8a19a',green:'#829d87',dark:'#51463b'};
const mats=new Map();function mat(c){if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,roughness:.85}));return mats.get(c)}
function mesh(geo,c,x,y,z,parent=scene){const m=new T.Mesh(geo,mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function box(x,y,z,w,h,d,c,p=scene){return mesh(new T.BoxGeometry(w,h,d),c,x,y,z,p)}
function ball(x,y,z,a,b,c,col,p=scene){const m=mesh(new T.SphereGeometry(1,24,16),col,x,y,z,p);m.scale.set(a,b,c);return m}
function cyl(x,y,z,r,h,c,p=scene,r2=r){return mesh(new T.CylinderGeometry(r2,r,h,24),c,x,y,z,p)}
function rounded(x,y,z,w,h,d,c,p=scene){const g=new T.Group();g.position.set(x,y,z);p.add(g);const r=Math.min(w,h,d)*.22;box(0,0,0,w-2*r,h,d-2*r,c,g);box(0,0,0,w,h-2*r,d-2*r,c,g);box(0,0,0,w-2*r,h-2*r,d,c,g);for(const a of [-1,1])for(const b of [-1,1])for(const e of [-1,1])ball(a*(w/2-r),b*(h/2-r),e*(d/2-r),r,r,r,c,g);return g}
// Floating garden and house foundation.
rounded(0,-.5,0,15,.9,13,'#c9b590');rounded(0,-.04,0,15,.35,13,colors.grass);
box(0,-1.08,0,200,.2,200,'#f5f3e9');
rounded(-1,.27,-1.6,9.3,.55,6.7,'#bd9d78');box(-1,.57,-1.6,9,.13,6.4,'#e1c49c');
for(let x=-5.4;x<3.5;x+=.48)box(x,.646,-1.6,.018,.008,6.3,'#caaa81');
// Back and side walls; low room dividers preserve sight lines.
box(-1,2.2,-4.8,9.2,3.3,.18,colors.wall);box(-5.5,1.85,-1.6,.16,2.6,6.5,colors.wall);box(3.5,1.02,-1.7,.15,.8,6.4,colors.wall);
box(-2.1,1.05,-2.6,.13,.85,4.1,'#e4d5b3');box(-3.8,1.05,-.55,3.3,.85,.13,'#e4d5b3');
box(-1,3.88,-4.8,9.4,.12,.26,'#c0a47b');box(-5.5,3.2,-1.6,.23,.12,6.6,'#c0a47b');
function windowAt(x){box(x,2.55,-4.66,1.9,1.65,.1,'#b0936a');box(x,2.55,-4.58,1.65,1.42,.1,'#b4d9ce');box(x,2.55,-4.5,.065,1.5,.08,colors.cream);box(x,2.55,-4.49,1.7,.065,.08,colors.cream);box(x,1.75,-4.4,2.1,.12,.4,colors.cream)}windowAt(-3.8);windowAt(1.55);
// Bedroom: bed, pillows, blanket, bedside lamp, round rug.
cyl(-3.8,.67,-2.4,1.3,.025,'#d5aaa0');rounded(-3.8,.98,-2.9,1.9,.52,2.8,colors.wood);rounded(-3.8,1.28,-2.9,1.8,.26,2.7,colors.cream);rounded(-3.8,1.45,-2.45,1.83,.18,1.8,'#a9b6a0');rounded(-3.8,1.48,-3.8,1.3,.22,.58,'#fff7e6');rounded(-3.8,1.35,-4.23,2,.9,.16,'#c49772');
rounded(-5,1,-3.6,.6,.7,.7,'#b98d64');cyl(-5,1.62,-3.6,.05,.55,'#c8ac75');mesh(new T.ConeGeometry(.34,.4,24),colors.cream,-5,1.96,-3.6);
// Kitchen cabinets, sink, hob and refrigerator.
for(let x=-1.45;x<2;x+=1.1){rounded(x,1.14,-3.95,1.05,1.02,1.2,'#92aa97');box(x,1.69,-3.95,1.12,.12,1.3,colors.cream);box(x,1.23,-3.32,.27,.055,.045,'#b28b58')}
box(-.35,1.76,-3.95,.75,.03,.7,'#829b97');box(-.35,1.78,-3.95,.58,.025,.5,'#b5cbc3');cyl(-.35,1.97,-4.23,.035,.4,'#c3b68e');
box(1.85,1.76,-3.95,.95,.035,.85,'#575d52');for(let x of [1.6,2.1])for(let z of [-4.18,-3.75])cyl(x,1.8,z,.16,.025,'#929b88');cyl(1.6,1.92,-4.18,.19,.25,'#dbc4a0');cyl(1.6,2.06,-4.18,.21,.04,colors.cream);
rounded(2.8,1.75,-3.9,.95,2.2,1.2,'#f3ead2');box(2.8,2.05,-3.27,.88,.035,.025,'#cccfb6');box(2.45,1.6,-3.24,.04,.4,.05,'#a9ae96');
box(.2,2.8,-4.56,2.5,.12,.45,'#b78e66');for(let x of [-.6,.1,.8]){cyl(x,3,-4.52,.13,.29,'#e8ccaa');cyl(x,3.17,-4.52,.14,.055,'#b28c63')}
// Living room: woven rug, soft sofa, coffee table, books, plant.
const rug=cyl(.55,.68,-.1,1.8,.03,'#e4d0a1');rug.scale.z=.74;for(let r of [1.65,1.48]){const ring=mesh(new T.TorusGeometry(r,.012,6,64),'#b5b78d',.55,.703,-.1);ring.rotation.x=-Math.PI/2;ring.scale.y=.74}
rounded(.2,1.05,-1.4,2.5,.65,1,colors.green);rounded(.2,1.5,-1.79,2.55,.95,.28,colors.green);for(let x of [-.95,1.35])rounded(x,1.32,-1.35,.32,.72,1.15,colors.green);for(let x of [-.37,.62])rounded(x,1.38,-1.33,.91,.18,.8,'#b1c0a4');rounded(-.4,1.66,-1.65,.6,.56,.18,'#edd3a2');
rounded(.4,1.03,.3,1.65,.16,1,'#c79a6c');for(let x of [-.2,1])for(let z of [0,.6])cyl(x,.84,z,.065,.4,'#a97c53');cyl(.65,1.18,.3,.13,.2,colors.cream);cyl(.65,1.29,.3,.1,.015,'#8e6849');box(.05,1.14,.3,.43,.07,.48,'#9caa91');
rounded(2.65,.95,-.8,.8,.58,.7,'#ba9169');box(2.65,1.3,-.8,.7,.09,.65,'#f1dfbb');
function plant(x,y,z){cyl(x,y+.2,z,.22,.4,'#c28f73',scene,.3);for(let i=0;i<6;i++){const a=i*Math.PI/3;const leaf=ball(x+Math.cos(a)*.16,y+.65,z+Math.sin(a)*.16,.12,.4,.11,'#6f9271');leaf.rotation.z=Math.cos(a)*.6}}plant(2.8,.65,-2.1);
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
// Original animal residents, composed of soft geometry.
function resident(kind,x,z){const g=new T.Group();g.position.set(x,.22,z);scene.add(g);const rabbit=kind==='bunny',fur=rabbit?'#f0dfc4':'#b78a61';ball(0,.55,0,.37,.46,.28,rabbit?'#d5a6a0':'#91a6a0',g);ball(0,1.12,0,.43,.41,.35,fur,g);for(let side of [-1,1]){ball(side*.19,.13,.02,.15,.18,.2,fur,g);ball(side*.38,.57,0,.12,.26,.13,fur,g);if(rabbit){ball(side*.22,1.67,0,.13,.43,.13,fur,g);ball(side*.22,1.68,.11,.065,.3,.025,'#d9b3a9',g)}else{ball(side*.32,1.45,0,.18,.18,.12,fur,g);ball(side*.32,1.46,.1,.1,.1,.025,'#dcc09a',g)}ball(side*.15,1.17,.324,.043,.058,.028,'#403e36',g);ball(side*.25,1.03,.31,.07,.035,.025,'#d6a092',g)}ball(0,1.01,.31,.18,.12,.09,rabbit?'#fff2dc':'#e5c8a4',g);ball(0,1.06,.395,.045,.03,.025,'#755543',g);if(!rabbit){box(0,.71,.272,.35,.04,.035,'#e6d3a5',g);for(let i=0;i<2;i++)ball(0,.52+i*.13,.28,.025,.025,.025,'#e8d7b6',g)}else ball(.3,1.45,.16,.12,.07,.06,'#d0a86b',g);return g}
const bunny=resident('bunny',1.9,3.15),bear=resident('bear',1.95,.1);bear.position.y=.66;bear.rotation.y=-.35;bunny.rotation.y=.15;
let paused=false,dusk=false,selected=null;const clock=new T.Clock();let elapsed=0;
function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);const aspect=w/h;const size=Math.max(10.5,10/aspect);camera.left=-size*aspect;camera.right=size*aspect;camera.top=size;camera.bottom=-size;camera.updateProjectionMatrix();camera.setViewOffset(w,h,aspect>1.2?w*.065:0,-h*.025,w,h)}addEventListener('resize',resize);resize();
document.querySelector('#loading').remove();
document.querySelector('#motion').onclick=e=>{paused=!paused;e.currentTarget.innerHTML=paused?'▶ <span>继续微动</span>':'Ⅱ <span>暂停微动</span>';e.currentTarget.setAttribute('aria-pressed',String(paused))};
document.querySelector('#light').onclick=()=>{dusk=!dusk;sun.color.set(dusk?'#ffb577':'#ffe3ae');sun.intensity=dusk?2.4:4;hemi.intensity=dusk?1.4:2.5;scene.background.set(dusk?'#e9dfd2':'#f5f3e9');document.body.style.background=dusk?'#e9dfd2':'#f5f3e9';document.querySelector('#time-label').textContent=dusk?'温柔黄昏':'暖暖午后';document.querySelector('#light').innerHTML=dusk?'☼ <span>切换午后</span>':'☼ <span>切换黄昏</span>'};
for(const b of document.querySelectorAll('[data-resident]'))b.onclick=()=>{selected=b.dataset.resident;document.querySelector('#note').textContent=selected==='bunny'?'米米：想把院子种满小花。':'栗栗：茶已经泡好啦。';};
document.querySelector('#reset').onclick=()=>{selected=null;resize();document.querySelector('#note').textContent='今天也是适合发呆的好天气。'};
renderer.setAnimationLoop(()=>{const dt=clock.getDelta();if(!paused)elapsed+=dt;bunny.scale.y=1+Math.sin(elapsed*2)*.015;bear.scale.y=1+Math.sin(elapsed*1.8+1)*.015;for(let i=0;i<crowns.length;i++)crowns[i].rotation.z=Math.sin(elapsed*.7+i)*.012;[bunny,bear].forEach((g,i)=>{const isSelected=selected===(i===0?'bunny':'bear');g.rotation.y=(i===0?.15:-.35)+(isSelected?Math.sin(elapsed*2)*.13:0)});renderer.render(scene,camera)});


