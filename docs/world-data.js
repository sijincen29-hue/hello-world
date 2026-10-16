// All coordinates use the same x/z plane as the Three.js scene.
// Keeping room and route data separate makes later layout edits independent of the life loop.
export const ROOMS = [
  {id:'bedroom',label:'卧室',x:-4,z:-3.2,color:'#eddbd0'},
  {id:'bathroom',label:'厕所',x:-1,z:-3.2,color:'#dcebe8'},
  {id:'kitchen',label:'厨房',x:2,z:-3.2,color:'#eee5cb'},
  {id:'computer',label:'电脑房',x:-4,z:-.05,color:'#e2e5e1'},
  {id:'study',label:'书房',x:-1,z:-.05,color:'#e9ddc8'},
  {id:'living',label:'客厅',x:2,z:-.05,color:'#e8ddcb'},
];

// The route graph crosses each partition at its doorway. Furniture can stay clear of these points.
export const WAYPOINTS = {
  garden:{x:1.9,z:3.15,y:.22,neighbors:['path','vegetables']},
  vegetables:{x:3.2,z:3.2,y:.22,neighbors:['garden']},
  path:{x:-1,z:3.15,y:.22,neighbors:['garden','porch']},
  porch:{x:-1,z:1.85,y:.66,neighbors:['path','study']},
  study:{x:-1,z:.55,y:.66,neighbors:['porch','computerDoor','livingDoor','bathDoor']},
  computerDoor:{x:-2.5,z:-.05,y:.66,neighbors:['study','computer']},
  computer:{x:-3.65,z:.55,y:.66,neighbors:['computerDoor','bedroomDoor']},
  livingDoor:{x:.5,z:-.05,y:.66,neighbors:['study','living']},
  living:{x:2.9,z:.78,y:.66,neighbors:['livingDoor','kitchenDoor']},
  bedroomDoor:{x:-4,z:-1.65,y:.66,neighbors:['computer','bedroom']},
  bedroom:{x:-4,z:-2.38,y:.66,neighbors:['bedroomDoor']},
  bathDoor:{x:-1,z:-1.65,y:.66,neighbors:['study','bathroom']},
  bathroom:{x:-1,z:-2.28,y:.66,neighbors:['bathDoor']},
  kitchenDoor:{x:2,z:-1.65,y:.66,neighbors:['living','kitchen']},
  kitchen:{x:2.65,z:-2.5,y:.66,neighbors:['kitchenDoor']},
};

// A deterministic daily loop is useful before adding AI: the viewer can already observe a real state change.
export const RESIDENTS = {
  bunny:{name:'米米',start:'garden',speed:.9,plan:[
    {at:'garden',activity:'照看花草',seconds:10},
    {at:'vegetables',activity:'照料菜地',seconds:11},
    {at:'kitchen',activity:'准备午餐',seconds:11},
    {at:'study',activity:'读一本绘本',seconds:12},
    {at:'bedroom',activity:'整理床铺',seconds:10},
  ]},
  bear:{name:'栗栗',start:'living',speed:.83,plan:[
    {at:'living',activity:'喝一杯热茶',seconds:11},
    {at:'computer',activity:'写日记',seconds:13},
    {at:'study',activity:'安静看书',seconds:12},
    {at:'kitchen',activity:'烤小点心',seconds:11},
    {at:'garden',activity:'到院子散步',seconds:12},
  ]},
};

export function routeBetween(from,to){
  if(from===to)return [];
  const queue=[from],previous=new Map([[from,null]]);
  for(let i=0;i<queue.length;i++){
    const node=queue[i];
    if(node===to)break;
    for(const next of WAYPOINTS[node].neighbors)if(!previous.has(next)){
      previous.set(next,node);queue.push(next);
    }
  }
  if(!previous.has(to))throw Error(`No route from ${from} to ${to}`);
  const route=[];for(let node=to;node!==from;node=previous.get(node))route.unshift(node);
  return route;
}
