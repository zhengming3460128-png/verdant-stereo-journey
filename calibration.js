export function bindCalibration(api){
 const $=id=>document.getElementById(id);let calibrated=null;
 const note=s=>{$('calResult').textContent=s;};
 function ruler(){const max=Math.min(650,innerWidth-110);$('rulerPixels').max=max;if(+$('rulerPixels').value>max)$('rulerPixels').value=max;$('rulerLine').style.width=$('rulerPixels').value+'px';}
 function valid(v,min,max){return Number.isFinite(v)&&v>=min&&v<=max;}
 function apply(){
   const ipd=+$('ipd').value,dist=+$('viewDistance').value,px=+$('rulerPixels').value;
   if(!valid(ipd,45,80)||!valid(dist,25,150)||!valid(px,100,650)){note('请检查：瞳距 45–80 mm，观看距离 25–150 cm，并用实体尺校准。超出范围请使用单画面。');return;}
   if(!$('rulerConfirmed').checked){note('先用实体尺确认线段确实为 50 mm，再勾选确认。屏幕像素不能直接当作毫米。');return;}
   if($('symptoms').checked){api.stop();note('目前有不适：已暂停并切换单画面。不要继续融合；持续或新出现的重影请就医。');return;}
   calibrated={ipd,dist,pxPerMM:px/50,dpr:devicePixelRatio};
   const width=percentage();if(width<10){note('当前窗口不适合此校准，请缩小浏览器窗口或使用单画面。');calibrated=null;return;}
   api.apply(width);$('calibration').close();$('fusionCheck').hidden=false;positionDots();
   try{if($('rememberCal').checked)localStorage.setItem('verdant-display-calibration',JSON.stringify(calibrated));else localStorage.removeItem('verdant-display-calibration');}catch{}
   note('显示校准已应用。零立体深度、静止预览；不代表通过临床检查。');updateBadge();
 }
 function percentage(){return Math.min(100,2*.8*calibrated.ipd*calibrated.pxPerMM/innerWidth*100);}
 function positionDots(){if(!calibrated)return;const gap=innerWidth*percentage()/200;document.querySelectorAll('.fusion-dot').forEach((e,i)=>e.style.left=`calc(50% + ${(i?1:-1)*gap/2}px)`);}
 function updateBadge(){$('calBadge').textContent=calibrated?`已校准 · 对应中心间距约 ${(innerWidth*percentage()/200/calibrated.pxPerMM).toFixed(1)} mm · 非治疗设置`:'未校准 · 普通屏幕不能自动分眼';}
 $('calibrateBtn').onclick=()=>{api.pause();$('calibration').showModal();ruler();};$('rulerPixels').oninput=()=>{ruler();$('rulerConfirmed').checked=false;};$('applyCal').onclick=apply;
 $('fusionComfort').onclick=()=>{$('fusionCheck').hidden=true;api.message('已记录本次主观舒适反馈。当前深度为 0；这不是立体视检查结果。');};
 $('fusionDifficult').onclick=()=>{$('fusionCheck').hidden=true;api.stop();api.message('已切换单画面。不要勉强融合。');};
 $('discomfort').onclick=()=>{api.stop();$('fusionCheck').hidden=true;$('comfortDialog').showModal();};
 $('clearCal').onclick=()=>{calibrated=null;try{localStorage.removeItem('verdant-display-calibration');}catch{}$('rememberCal').checked=false;note('已清除本机校准数据。');updateBadge();};
 window.addEventListener('resize',()=>{ruler();if(!calibrated)return;if(Math.abs(devicePixelRatio-calibrated.dpr)>.01){calibrated=null;api.stop();note('屏幕或缩放比例已变化，请重新用实体尺校准。');updateBadge();return;}api.resize(percentage());positionDots();updateBadge();});
 // Restore values only. User must verify the ruler before applying on a new visit.
 try{const c=JSON.parse(localStorage.getItem('verdant-display-calibration'));if(c&&valid(c.ipd,45,80)&&valid(c.dist,25,150)&&valid(c.pxPerMM,2,13)){$('ipd').value=c.ipd;$('viewDistance').value=c.dist;$('rulerPixels').value=c.pxPerMM*50;$('rememberCal').checked=true;note('已读入上次的本机数值；请重新核对尺子后应用。');}}catch{}
 ruler();updateBadge();
 return{invalidate(){calibrated=null;updateBadge();},hideCheck(){$('fusionCheck').hidden=true;}};
}
