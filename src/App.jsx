import { useState, useRef, useEffect } from "react";

const C = {
  bg:"#0C1519", card:"#162127", jet:"#3A3534",
  coffee:"#724B39", brass:"#CF9D7B", brassLight:"#e8c4a0",
  brassGlow:"rgba(207,157,123,0.12)", white:"#f5f0ea", dim:"#7a8a8f",
};
const FORMATS=[
  {id:"carousel",label:"Carousel",icon:"▦",w:360,h:450},
  {id:"post",    label:"Post 1:1",icon:"▪",w:380,h:380},
  {id:"story",   label:"Story 9:16",icon:"▮",w:260,h:462},
];
const PLATFORMS=["Instagram","LinkedIn","Facebook"];
const TONES=[
  {label:"Reassuring",emoji:"🤝"},
  {label:"Curious",   emoji:"🔍"},
  {label:"Data-Driven",emoji:"📊"},
  {label:"Playful",   emoji:"✨"},
];
const PILLARS=[
  {icon:"🧠",label:"Why Kids Struggle",  prompt:"Why kids struggle with math — link to mindset not ability — end with how the right environment changes everything"},
  {icon:"🔬",label:"Learning Science",   prompt:"How kids actually learn — spaced repetition, active recall — explained simply for parents"},
  {icon:"💪",label:"Confidence & Mindset",prompt:"Building a growth mindset in children around math — practical tips, signs to watch for, how to respond when kids say I am not a math person"},
  {icon:"📐",label:"Cuemath Method",     prompt:"What makes Cuemath different — visual learning, reasoning over rote, why it works for every child"},
  {icon:"🏠",label:"Parent Tips",        prompt:"Five things parents can do at home to support their child math learning — simple, actionable, no teaching required"},
  {icon:"🎯",label:"Forgetting Curve",   prompt:"Why kids forget what they learn — explain the forgetting curve — end with how spaced repetition fixes it"},
];
const THEMES=[
  {id:"dark",  label:"Midnight",bg:"#0e1a20",card:"#162127",accent:"#CF9D7B",text:"#f5f0ea",sub:"#a89880",grad:"linear-gradient(135deg,#0e1a20,#1a2a20)"},
  {id:"warm",  label:"Ember",   bg:"#1c1008",card:"#241508",accent:"#CF9D7B",text:"#f5ede0",sub:"#b09070",grad:"linear-gradient(135deg,#1c1008,#2a1a08)"},
  {id:"forest",label:"Forest",  bg:"#0a1a12",card:"#102018",accent:"#9fc882",text:"#eaf5e8",sub:"#80a870",grad:"linear-gradient(135deg,#0a1a12,#0f2418)"},
];

function safeParseJSON(raw){
  const c=raw.replace(/```json|```/gi,"").trim();
  const a=c.match(/(\[[\s\S]*\])/);
  const o=c.match(/(\{[\s\S]*\})/);
  if(a)return JSON.parse(a[1]);
  if(o)return JSON.parse(o[1]);
  throw new Error("No JSON");
}
function ensureArray(v){
  if(Array.isArray(v))return v;
  if(v&&typeof v==="object"){const f=Object.values(v).find(x=>Array.isArray(x));if(f)return f;return[v];}
  return[];
}
function sanitize(s,i,n){
  return{
    tag:s.tag||s.label||(i===0?"Hook":i===n-1?"Takeaway":"Insight"),
    headline:s.headline||s.title||s.heading||"Untitled",
    body:s.body||s.description||s.content||"",
    bullets:Array.isArray(s.bullets)?s.bullets:Array.isArray(s.points)?s.points:[],
    cta:s.cta||(i===n-1?"Save this ✨":undefined),
    imgPrompt:s.imgPrompt||s.image_prompt||"abstract dark warm cinematic background",
    stat:s.stat||null,
  };
}

async function callClaude(system,user,max=1200){
  const r=await fetch("/api/v1/messages",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:max,system,messages:[{role:"user",content:user}]}),
  });
  const raw=await r.text();
  let d=null;
  try{
    d=raw?JSON.parse(raw):null;
  }catch{
    d=null;
  }
  if(!r.ok){
    const detail=d?.error?.message
      || (r.status===401
        ?"Missing or invalid Anthropic API key. Add ANTHROPIC_API_KEY to your local environment and restart Vite."
        :r.status===404
          ?"API route not found. Make sure the Vite dev server proxy is running."
          :raw?.trim()||`API ${r.status}`);
    throw new Error(detail);
  }
  if(!d)throw new Error("The API returned a non-JSON response.");
  if(d.error)throw new Error(d.error.message);
  return d.content?.map(i=>i.text||"").join("").trim()||"";
}

// Canvas-based generative art — vibrant, always visible
function CoverVisual({prompt,seed,theme,style={}}){
  const canvasRef=useRef();
  useEffect(()=>{
    const c=canvasRef.current;if(!c)return;
    const ctx=c.getContext("2d");
    const W=c.width=400,H=c.height=500;
    // seeded random
    let s=seed*9301+49297;
    const rand=()=>{ s=(s*9301+49297)%233280; return s/233280; };
    const ri=(a,b)=>Math.floor(rand()*(b-a)+a);
    const rf=(a,b)=>rand()*(b-a)+a;

    const palettes=[
      ["#CF9D7B","#724B39","#e8c4a0","#8B5E3C"],
      ["#9fc882","#3a6b22","#c8f0a8","#5a8b42"],
      ["#7bb8cf","#1a5a7a","#a8d8f0","#3a7a9a"],
      ["#cf7b9b","#7a1a4a","#f0a8c8","#9a3a6a"],
      ["#cfbc7b","#7a6a1a","#f0e0a8","#9a8a3a"],
      ["#9b7bcf","#4a1a7a","#c8a8f0","#6a3a9a"],
    ];
    const hash=prompt.split("").reduce((a,c)=>Math.imul(31,a)+c.charCodeAt(0)|0,seed);
    const pal=palettes[Math.abs(hash)%palettes.length];
    const [p1,p2,p3,p4]=pal;

    const hex2rgb=h=>{const r=parseInt(h.slice(1),16);return[(r>>16)&255,(r>>8)&255,r&255];};
    const rgba=(h,a)=>{const [r,g,b]=hex2rgb(h);return`rgba(${r},${g},${b},${a})`;};

    // Dark bg
    ctx.fillStyle="#0C1519";
    ctx.fillRect(0,0,W,H);

    // Style picker
    const style2=Math.abs(hash)%4;

    if(style2===0){
      // Glowing orbs
      for(let i=0;i<6;i++){
        const x=rf(0,W),y=rf(0,H*0.7),r=rf(60,160);
        const g=ctx.createRadialGradient(x,y,0,x,y,r);
        const c1=i%2===0?p1:p3;
        g.addColorStop(0,rgba(c1,0.55));
        g.addColorStop(1,rgba(c1,0));
        ctx.fillStyle=g;
        ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
      }
      // Rings
      for(let i=0;i<4;i++){
        ctx.beginPath();
        ctx.arc(W*rf(0.3,0.7),H*rf(0.2,0.6),rf(40,120),0,Math.PI*2);
        ctx.strokeStyle=rgba(p1,rf(0.15,0.35));
        ctx.lineWidth=rf(1,2.5);
        ctx.stroke();
      }
    } else if(style2===1){
      // Geometric triangles + glow
      const cx=W*0.5,cy=H*0.38;
      for(let i=0;i<5;i++){
        const r=rf(80,200),angle=rf(0,Math.PI*2);
        ctx.beginPath();
        for(let j=0;j<3;j++){
          const a=angle+j*Math.PI*2/3;
          j===0?ctx.moveTo(cx+r*Math.cos(a),cy+r*Math.sin(a)):ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));
        }
        ctx.closePath();
        ctx.strokeStyle=rgba(i%2===0?p1:p3,rf(0.2,0.5));
        ctx.lineWidth=rf(0.5,2);ctx.stroke();
      }
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,180);
      g.addColorStop(0,rgba(p1,0.45));g.addColorStop(1,rgba(p2,0));
      ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    } else if(style2===2){
      // Wave lines
      for(let i=0;i<18;i++){
        ctx.beginPath();
        const yBase=H*0.1+i*(H*0.05);
        const amp=rf(10,40),freq=rf(0.008,0.02),phase=rf(0,Math.PI*2);
        for(let x=0;x<=W;x+=2){
          const y=yBase+Math.sin(x*freq+phase)*amp+Math.cos(x*freq*1.7+phase)*amp*0.4;
          x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.strokeStyle=rgba(i%3===0?p1:i%3===1?p3:p4,rf(0.12,0.4));
        ctx.lineWidth=rf(0.5,2);ctx.stroke();
      }
      const g=ctx.createRadialGradient(W*0.6,H*0.35,0,W*0.6,H*0.35,200);
      g.addColorStop(0,rgba(p1,0.35));g.addColorStop(1,rgba(p1,0));
      ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    } else {
      // Starburst / radial lines
      const cx=W*rf(0.35,0.65),cy=H*rf(0.2,0.5);
      for(let i=0;i<60;i++){
        const angle=i*(Math.PI*2/60);
        const len=rf(80,240);
        ctx.beginPath();
        ctx.moveTo(cx,cy);
        ctx.lineTo(cx+len*Math.cos(angle),cy+len*Math.sin(angle));
        ctx.strokeStyle=rgba(i%2===0?p1:p3,rf(0.08,0.28));
        ctx.lineWidth=rf(0.5,1.5);ctx.stroke();
      }
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,150);
      g.addColorStop(0,rgba(p1,0.6));g.addColorStop(0.5,rgba(p2,0.2));g.addColorStop(1,rgba(p2,0));
      ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    }

    // Bottom gradient for text readability
    const fade=ctx.createLinearGradient(0,H*0.35,0,H);
    fade.addColorStop(0,"rgba(0,0,0,0)");
    fade.addColorStop(0.5,"rgba(0,0,0,0.6)");
    fade.addColorStop(1,"rgba(0,0,0,0.96)");
    ctx.fillStyle=fade;ctx.fillRect(0,0,W,H);

  },[prompt,seed]);

  return(
    <div style={{position:"absolute",inset:0,overflow:"hidden",...style}}>
      <canvas ref={canvasRef} style={{width:"100%",height:"100%",display:"block"}}/>
    </div>
  );
}

// ── SLIDE LAYOUTS ─────────────────────────────────────────────────────────────
// Each layout is a pure function → JSX, given {slide,fmt,theme,edit,editable}

function EditableText({value,field,onEdit,style,multiline=false,disabled=false}){
  const [editing,setEditing]=useState(false);
  const [val,setVal]=useState(value);
  const ref=useRef();
  useEffect(()=>setVal(value),[value]);
  useEffect(()=>{if(editing&&ref.current)ref.current.focus();},[editing]);
  if(disabled)return<div style={style}>{value}</div>;
  if(editing)return(
    <textarea ref={ref} value={val}
      onChange={e=>setVal(e.target.value)}
      onBlur={()=>{setEditing(false);onEdit(field,val);}}
      onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();setEditing(false);onEdit(field,val);}}}
      style={{...style,background:"rgba(0,0,0,0.5)",border:`1px solid ${style.color||"#CF9D7B"}`,
        borderRadius:6,outline:"none",resize:"none",fontFamily:"inherit",
        width:"100%",boxSizing:"border-box",padding:"3px 6px",minHeight:40}}/>
  );
  return(
    <div onClick={()=>setEditing(true)} title="Click to edit"
      style={{...style,cursor:"text",borderRadius:4,padding:"2px 4px",transition:"background 0.12s"}}
      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
      {value}
    </div>
  );
}

// COVER slide — generative visual bg, big headline bottom-anchored
function CoverSlide({slide,fmt,theme,onEdit,forExport}){
  const isStory=fmt.id==="story";
  return(
    <div style={{width:"100%",height:"100%",position:"relative",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <CoverVisual prompt={slide.imgPrompt} seed={42} theme={theme}/>
      {/* Top badge */}
      <div style={{position:"absolute",top:18,left:18,zIndex:3}}>
        <div style={{background:theme.accent,borderRadius:4,padding:"3px 10px"}}>
          <span style={{fontSize:9,fontWeight:900,letterSpacing:2,color:"#0C1519",textTransform:"uppercase"}}>Cuemath</span>
        </div>
      </div>
      {/* Bottom content */}
      <div style={{position:"relative",zIndex:3,padding:isStory?"22px 20px":"20px 22px"}}>
        <div style={{fontSize:9.5,fontWeight:700,letterSpacing:2.5,color:theme.accent,textTransform:"uppercase",opacity:0.8,marginBottom:8}}>
          {slide.tag}
        </div>
        <EditableText value={slide.headline} field="headline" onEdit={onEdit} disabled={forExport}
          style={{fontSize:isStory?28:24,fontWeight:900,lineHeight:1.15,color:"#ffffff",letterSpacing:-0.5,marginBottom:10}}/>
        {slide.body&&(
          <EditableText value={slide.body} field="body" onEdit={onEdit} disabled={forExport}
            style={{fontSize:13,lineHeight:1.65,color:"rgba(255,255,255,0.75)"}}/>
        )}
        <div style={{marginTop:14,display:"flex",alignItems:"center",gap:6,opacity:0.5}}>
          <div style={{width:24,height:2,background:theme.accent,borderRadius:2}}/>
          <span style={{fontSize:9,color:theme.accent,letterSpacing:1.5,fontWeight:700,textTransform:"uppercase"}}>Swipe</span>
        </div>
      </div>
    </div>
  );
}

// BUILD slide — split layout: accent bar left, content right
function BuildSlide({slide,fmt,theme,onEdit,index,total,forExport}){
  const isStory=fmt.id==="story";
  return(
    <div style={{width:"100%",height:"100%",position:"relative",display:"flex",flexDirection:"column"}}>
      <CoverVisual prompt={slide.imgPrompt} seed={index*17+3} theme={theme} style={{opacity:0.18}}/>
      <div style={{position:"absolute",inset:0,background:theme.grad}}/>
      {/* Left accent bar */}
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:`linear-gradient(to bottom,${theme.accent},transparent)`,opacity:0.6}}/>
      {/* Slide number watermark */}
      <div style={{position:"absolute",right:16,bottom:40,fontSize:72,fontWeight:900,color:theme.accent,opacity:0.04,lineHeight:1,userSelect:"none"}}>
        {String(index+1).padStart(2,"0")}
      </div>
      <div style={{position:"relative",zIndex:2,flex:1,display:"flex",flexDirection:"column",padding:isStory?"20px 20px":"18px 22px"}}>
        {/* Top row */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <span style={{fontSize:9,fontWeight:700,letterSpacing:2,color:theme.accent,textTransform:"uppercase",opacity:0.65}}>{slide.tag}</span>
          <span style={{fontSize:10,color:C.jet,fontWeight:600}}>{index+1}<span style={{opacity:0.4}}>/{total}</span></span>
        </div>
        {/* Stat callout if present */}
        {slide.stat&&(
          <div style={{marginBottom:12,padding:"10px 14px",background:`rgba(207,157,123,0.08)`,borderRadius:10,border:`1px solid ${theme.accent}22`}}>
            <div style={{fontSize:28,fontWeight:900,color:theme.accent,lineHeight:1}}>{slide.stat.value}</div>
            <div style={{fontSize:11,color:theme.sub,marginTop:2}}>{slide.stat.label}</div>
          </div>
        )}
        <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:10}}>
          <EditableText value={slide.headline} field="headline" onEdit={onEdit} disabled={forExport}
            style={{fontSize:isStory?22:18,fontWeight:900,lineHeight:1.2,color:theme.accent,letterSpacing:-0.2}}/>
          {slide.body&&(
            <EditableText value={slide.body} field="body" onEdit={onEdit} disabled={forExport}
              style={{fontSize:12.5,lineHeight:1.75,color:theme.text,opacity:0.85}}/>
          )}
          {slide.bullets?.length>0&&(
            <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:4}}>
              {slide.bullets.map((b,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:theme.accent,marginTop:5,flexShrink:0}}/>
                  <span style={{fontSize:12,color:theme.text,lineHeight:1.6,opacity:0.88}}>{b}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Brand footer */}
        <div style={{paddingTop:10,borderTop:`1px solid rgba(255,255,255,0.06)`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:8,fontWeight:800,letterSpacing:2,color:theme.accent,opacity:0.35,textTransform:"uppercase"}}>Cuemath</span>
          <div style={{display:"flex",gap:3}}>{Array.from({length:total}).map((_,i)=>(
            <div key={i} style={{width:i===index?12:4,height:3,borderRadius:2,background:i===index?theme.accent:C.jet,transition:"all 0.2s"}}/>
          ))}</div>
        </div>
      </div>
    </div>
  );
}

// TAKEAWAY slide — bold CTA, centered, high contrast
function TakeawaySlide({slide,fmt,theme,onEdit,forExport}){
  const isStory=fmt.id==="story";
  return(
    <div style={{width:"100%",height:"100%",position:"relative",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
      <CoverVisual prompt={slide.imgPrompt} seed={99} theme={theme} style={{opacity:0.22}}/>
      <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at center,${theme.card}99 0%,${theme.bg}ff 70%)`}}/>
      {/* Decorative ring */}
      <div style={{position:"absolute",width:200,height:200,borderRadius:"50%",border:`1px solid ${theme.accent}`,opacity:0.07,top:"50%",left:"50%",transform:"translate(-50%,-50%)"}}/>
      <div style={{position:"absolute",width:280,height:280,borderRadius:"50%",border:`1px solid ${theme.accent}`,opacity:0.04,top:"50%",left:"50%",transform:"translate(-50%,-50%)"}}/>
      <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",padding:isStory?"24px 20px":"22px 24px",gap:12}}>
        <div style={{padding:"4px 14px",borderRadius:20,border:`1px solid ${theme.accent}44`,background:`${theme.accent}11`}}>
          <span style={{fontSize:9,fontWeight:800,letterSpacing:2.5,color:theme.accent,textTransform:"uppercase"}}>Key Takeaway</span>
        </div>
        <EditableText value={slide.headline} field="headline" onEdit={onEdit} disabled={forExport}
          style={{fontSize:isStory?24:21,fontWeight:900,lineHeight:1.2,color:theme.accent,letterSpacing:-0.3,textAlign:"center"}}/>
        {slide.body&&(
          <EditableText value={slide.body} field="body" onEdit={onEdit} disabled={forExport}
            style={{fontSize:12.5,lineHeight:1.75,color:theme.text,opacity:0.8,textAlign:"center"}}/>
        )}
        {slide.bullets?.length>0&&(
          <div style={{display:"flex",flexDirection:"column",gap:7,width:"100%",textAlign:"left"}}>
            {slide.bullets.map((b,i)=>(
              <div key={i} style={{display:"flex",gap:9,alignItems:"flex-start"}}>
                <span style={{color:theme.accent,fontSize:10,marginTop:3,flexShrink:0}}>◆</span>
                <span style={{fontSize:12,color:theme.text,lineHeight:1.6,opacity:0.88}}>{b}</span>
              </div>
            ))}
          </div>
        )}
        {slide.cta&&(
          <div style={{marginTop:8,padding:"11px 24px",background:`linear-gradient(135deg,${C.coffee},${theme.accent})`,borderRadius:10,boxShadow:`0 4px 20px ${theme.accent}33`}}>
            <span style={{fontSize:12,fontWeight:800,color:"#0C1519",letterSpacing:0.3}}>{slide.cta}</span>
          </div>
        )}
        <div style={{marginTop:4,display:"flex",alignItems:"center",gap:8,opacity:0.4}}>
          <div style={{width:16,height:1,background:theme.accent}}/>
          <span style={{fontSize:8,fontWeight:800,letterSpacing:2,color:theme.accent,textTransform:"uppercase"}}>Cuemath</span>
          <div style={{width:16,height:1,background:theme.accent}}/>
        </div>
      </div>
    </div>
  );
}

// SINGLE POST — bold centered, image left half, text right (or stacked for story)
function PostSlide({slide,fmt,theme,onEdit,forExport}){
  return(
    <div style={{width:"100%",height:"100%",position:"relative",display:"flex",flexDirection:"column"}}>
      {/* Top visual area with generative art */}
      <div style={{height:"45%",position:"relative",overflow:"hidden"}}>
        <CoverVisual prompt={slide.imgPrompt} seed={55} theme={theme} style={{opacity:1}}/>
        <div style={{position:"absolute",inset:0,background:`linear-gradient(to bottom,transparent 40%,${theme.bg} 100%)`}}/>
        <div style={{position:"absolute",top:14,left:14,background:theme.accent,borderRadius:4,padding:"2px 9px",zIndex:3}}>
          <span style={{fontSize:8,fontWeight:900,letterSpacing:2,color:"#0C1519",textTransform:"uppercase"}}>Cuemath</span>
        </div>
      </div>
      {/* Bottom content */}
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"16px 20px",background:theme.bg,position:"relative"}}>
        <div style={{fontSize:9.5,fontWeight:700,letterSpacing:2,color:theme.accent,textTransform:"uppercase",opacity:0.7,marginBottom:8}}>{slide.tag}</div>
        <EditableText value={slide.headline} field="headline" onEdit={onEdit} disabled={forExport}
          style={{fontSize:20,fontWeight:900,lineHeight:1.2,color:theme.accent,letterSpacing:-0.3,marginBottom:10}}/>
        {slide.body&&<EditableText value={slide.body} field="body" onEdit={onEdit} disabled={forExport}
          style={{fontSize:12.5,lineHeight:1.7,color:theme.text,opacity:0.85,marginBottom:8}}/>}
        {slide.bullets?.length>0&&(
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {slide.bullets.map((b,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:theme.accent,marginTop:4,flexShrink:0}}/>
                <span style={{fontSize:12,color:theme.text,lineHeight:1.55,opacity:0.88}}>{b}</span>
              </div>
            ))}
          </div>
        )}
        {slide.cta&&(
          <div style={{marginTop:12,display:"inline-block",padding:"8px 16px",background:`linear-gradient(135deg,${C.coffee},${theme.accent})`,borderRadius:8,alignSelf:"flex-start"}}>
            <span style={{fontSize:11,fontWeight:800,color:"#0C1519"}}>{slide.cta}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SlideCanvas({slide,index,total,fmt,theme,onEdit,onRegen,regenLoading,active,forExport=false}){
  const isPost=fmt.id==="post";
  const isCover=index===0&&!isPost;
  const isTakeaway=index===total-1&&!isPost&&total>1;

  const handleEdit=(field,val)=>onEdit&&onEdit(index,field,val);

  let content;
  if(isPost)         content=<PostSlide     slide={slide} fmt={fmt} theme={theme} onEdit={handleEdit} forExport={forExport}/>;
  else if(isCover)   content=<CoverSlide    slide={slide} fmt={fmt} theme={theme} onEdit={handleEdit} forExport={forExport}/>;
  else if(isTakeaway)content=<TakeawaySlide slide={slide} fmt={fmt} theme={theme} onEdit={handleEdit} forExport={forExport}/>;
  else               content=<BuildSlide    slide={slide} fmt={fmt} theme={theme} onEdit={handleEdit} index={index} total={total} forExport={forExport}/>;

  return(
    <div style={{width:fmt.w,height:fmt.h,borderRadius:forExport?0:16,overflow:"hidden",position:"relative",flexShrink:0,
      border:forExport?"none":active?`2px solid ${theme.accent}`:"2px solid transparent",
      boxShadow:forExport?"none":active?`0 0 0 1px ${theme.accent}40,0 16px 48px rgba(0,0,0,0.7)`:"0 4px 20px rgba(0,0,0,0.4)",
      background:theme.bg,transition:"box-shadow 0.2s"}}>
      {content}
      {!forExport&&(
        <button onClick={()=>onRegen&&onRegen(index)} disabled={regenLoading} title="Regenerate this slide"
          style={{position:"absolute",top:10,right:10,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)",
            border:`1px solid ${C.jet}`,borderRadius:6,padding:"3px 8px",
            color:regenLoading?C.jet:theme.accent,cursor:"pointer",fontSize:12,zIndex:10}}>
          {regenLoading?"…":"↺"}
        </button>
      )}
    </div>
  );
}

// ── DOWNLOAD ─────────────────────────────────────────────────────────────────
function DownloadBtn({slides,fmt,theme,disabled}){
  const [dl,setDl]=useState(false);
  const download=async()=>{
    if(disabled||dl)return;
    setDl(true);
    try{
      if(!window.html2canvas){
        await new Promise((res,rej)=>{
          const s=document.createElement("script");
          s.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
          s.onload=res;s.onerror=rej;document.head.appendChild(s);
        });
      }
      for(let i=0;i<slides.length;i++){
        const wrap=document.createElement("div");
        wrap.style.cssText=`position:fixed;left:-9999px;top:0;width:${fmt.w}px;height:${fmt.h}px;overflow:hidden;`;
        const s=slides[i];
        wrap.innerHTML=`<div style="width:${fmt.w}px;height:${fmt.h}px;background:${theme.bg};font-family:sans-serif;display:flex;flex-direction:column;justify-content:flex-end;position:relative;overflow:hidden;">
          <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.9),rgba(0,0,0,0.2));"></div>
          <div style="position:relative;z-index:2;padding:24px;">
            <div style="font-size:10px;font-weight:800;letter-spacing:2px;color:${theme.accent};text-transform:uppercase;margin-bottom:8px;opacity:0.7;">${s.tag||""}</div>
            <div style="font-size:22px;font-weight:900;color:${theme.accent};line-height:1.2;margin-bottom:10px;">${s.headline||""}</div>
            <div style="font-size:13px;color:${theme.text};line-height:1.7;opacity:0.85;">${s.body||""}</div>
            ${(s.bullets||[]).map(b=>`<div style="font-size:12px;color:${theme.text};margin-top:6px;opacity:0.85;">• ${b}</div>`).join("")}
            ${s.cta?`<div style="margin-top:14px;display:inline-block;padding:9px 18px;background:${C.coffee};border-radius:8px;font-size:11px;font-weight:800;color:${C.brassLight};">${s.cta}</div>`:""}
            <div style="margin-top:16px;font-size:8px;font-weight:800;letter-spacing:2px;color:${theme.accent};opacity:0.4;text-transform:uppercase;">Cuemath</div>
          </div>
        </div>`;
        document.body.appendChild(wrap);
        await new Promise(r=>setTimeout(r,300));
        const canvas=await window.html2canvas(wrap.firstChild,{backgroundColor:theme.bg,scale:2,useCORS:true,logging:false});
        const a=document.createElement("a");
        a.href=canvas.toDataURL("image/png");
        a.download=`cuemath-slide-${i+1}.png`;
        a.click();
        document.body.removeChild(wrap);
        await new Promise(r=>setTimeout(r,400));
      }
    }catch(e){console.error(e);alert("Download failed. Try a different browser.");}
    finally{setDl(false);}
  };
  return(
    <button onClick={download} disabled={disabled||dl} style={{padding:"7px 14px",borderRadius:8,
      border:`1px solid ${disabled?C.jet:C.brass}`,background:disabled?"transparent":C.brassGlow,
      color:disabled?C.jet:C.brass,fontSize:11,fontWeight:700,cursor:disabled?"not-allowed":"pointer",
      fontFamily:"inherit",display:"flex",alignItems:"center",gap:6,transition:"all 0.15s"}}>
      {dl?"⏳ Saving…":"⬇ Download"}
    </button>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function CarouselCraft(){
  const [prompt,setPrompt]=useState("");
  const [fmtId,setFmtId]=useState("carousel");
  const [platform,setPlatform]=useState("Instagram");
  const [tone,setTone]=useState("Reassuring");
  const [themeId,setThemeId]=useState("dark");
  const [slides,setSlides]=useState(null);
  const [caption,setCaption]=useState(null);
  const [loading,setLoading]=useState(false);
  const [captionLoading,setCaptionLoading]=useState(false);
  const [regenIdx,setRegenIdx]=useState(null);
  const [activeSlide,setActiveSlide]=useState(0);
  const [activeTab,setActiveTab]=useState("slides");
  const [error,setError]=useState("");
  const [copied,setCopied]=useState(false);
  const [captionCopied,setCaptionCopied]=useState(false);

  const fmt=FORMATS.find(f=>f.id===fmtId)||FORMATS[0];
  const theme=THEMES.find(t=>t.id===themeId)||THEMES[0];

  const platformHint={
    Instagram:"Concise emotional hooks. Max 3 bullets. Relatable parent language.",
    LinkedIn:"Data-led, professional. Slightly longer copy ok. Credibility-first.",
    Facebook:"Conversational warm storytelling. Encourage comments.",
  }[platform];

  const fmtHint={
    carousel:"4 to 6 slides. Slide 1 = bold hook (parent pain/question). Slides 2-N-1 = one clear insight each. Last slide = resolution + takeaway + CTA. Each slide one idea only. For slide 1 include a vivid imgPrompt for a full-bleed hero image.",
    post:"Exactly 1 slide. Single bold message. Strong headline. Max 3 bullets. Include imgPrompt for a strong visual.",
    story:"1 to 3 slides. Very short punchy copy. Each slide one big statement. Minimal body text.",
  }[fmtId];

  const sys=()=>`You are a social media creative director for Cuemath, an edtech brand making content for parents about children's math education.
Tone: ${tone}. Platform: ${platform}. ${platformHint}
Format: ${fmt.label}. ${fmtHint}

CRITICAL: You MUST return ONLY a valid JSON array. No markdown. No backticks. No explanation text before or after. Your entire response must be parseable by JSON.parse().
The array contains slide objects. Each object has these fields:
- tag: string, 2-4 words
- headline: string, 4-8 words
- body: string, 1-2 sentences (leave out if using bullets)
- bullets: array of strings (leave out if using body)
- cta: string, only on the very last slide
- imgPrompt: string, 6-10 words describing a visual scene for AI image generation
- stat: object with value and label fields, optional, only for data-heavy slides

Example of correct output format:
[{"tag":"Did You Know","headline":"Kids forget 70% within a day","body":"The forgetting curve shows memory drops fast without review.","imgPrompt":"child staring at notebook dimly lit room","cta":null}]

Now generate slides for: `;

  const generate=async()=>{
    if(!prompt.trim())return;
    setLoading(true);setError("");setSlides(null);setCaption(null);setActiveSlide(0);setActiveTab("slides");
    try{
      const raw=await callClaude(sys(),prompt);
      let arr;
      try{
        arr=ensureArray(safeParseJSON(raw));
      }catch{
        // Last resort: ask Claude to fix its own output
        const fixRaw=await callClaude(
          "You are a JSON repair tool. The user will give you broken or non-JSON text. Return ONLY a valid JSON array of slide objects, nothing else. Start with [ end with ].",
          `Fix this into a valid JSON array of slides:\n${raw}`,800
        );
        arr=ensureArray(safeParseJSON(fixRaw));
      }
      if(!arr.length)throw new Error("Empty array");
      setSlides(arr.map((s,i)=>sanitize(s,i,arr.length)));
    }catch(e){
      console.error("Generation error:",e);
      setError(`Generation failed: ${e.message}. Please try again.`);
    }
    finally{setLoading(false);}
  };

  const regenSlide=async(idx)=>{
    setRegenIdx(idx);
    const role=idx===0?"hook slide with a relatable parent pain point and vivid hero image prompt":idx===slides.length-1?"final takeaway slide with strong CTA":"middle build slide with one clear insight";
    const s2=`You are a social media creative director for Cuemath. Tone: ${tone}. Platform: ${platform}.
Regenerate slide ${idx+1} of a ${fmt.label}. Role: ${role}. Topic: "${prompt}".
Return ONLY a single raw JSON object. Start with { end with }.
Keys: tag, headline, body (or bullets), cta (last slide only), imgPrompt, stat (optional).`;
    try{
      const raw=await callClaude(s2,`Regenerate slide ${idx+1}`,500);
      const parsed=safeParseJSON(raw);
      const obj=Array.isArray(parsed)?parsed[0]:parsed;
      setSlides(p=>p.map((s,i)=>i===idx?sanitize(obj,idx,p.length):s));
    }catch(e){console.error(e);}
    finally{setRegenIdx(null);}
  };

  const editSlide=(idx,field,val)=>setSlides(p=>p.map((s,i)=>i===idx?{...s,[field]:val}:s));

  const genCaption=async()=>{
    if(!slides)return;
    setCaptionLoading(true);setCaption(null);setActiveTab("caption");
    const sum=slides.map((s,i)=>`${i+1}: ${s.headline} — ${s.body||(s.bullets||[]).join(", ")}`).join("\n");
    const s2=`You are a social media copywriter for Cuemath. Platform: ${platform}. Tone: ${tone}.
Return ONLY raw JSON object. Keys: "caption" (engaging, ends with question or CTA, platform-appropriate), "hashtags" (array 8-12 strings, no # symbol). No markdown.`;
    try{setCaption(safeParseJSON(await callClaude(s2,`Caption for this ${fmt.label}:\n${sum}`,600)));}
    catch{setCaption({caption:"Could not generate caption.",hashtags:[]});}
    finally{setCaptionLoading(false);}
  };

  const copyAll=()=>{
    navigator.clipboard.writeText(slides.map((s,i)=>`SLIDE ${i+1}\n${s.headline}\n${s.body||""}\n${(s.bullets||[]).map(b=>`• ${b}`).join("\n")}\n${s.cta||""}`).join("\n\n---\n\n"));
    setCopied(true);setTimeout(()=>setCopied(false),2000);
  };
  const copyCaption=()=>{
    navigator.clipboard.writeText(`${caption.caption}\n\n${caption.hashtags.map(h=>`#${h}`).join(" ")}`);
    setCaptionCopied(true);setTimeout(()=>setCaptionCopied(false),2000);
  };

  const Tab=({id,label})=>(
    <button onClick={()=>setActiveTab(id)} style={{padding:"10px 14px",background:"none",border:"none",fontFamily:"inherit",
      fontWeight:700,fontSize:11,letterSpacing:0.8,textTransform:"uppercase",cursor:"pointer",
      color:activeTab===id?C.brass:C.dim,
      borderBottom:activeTab===id?`2px solid ${C.brass}`:"2px solid transparent",
      transition:"all 0.15s",marginBottom:-1}}>
      {label}
    </button>
  );

  const Label=({text})=>(
    <div style={{fontSize:10,color:C.dim,letterSpacing:1.5,textTransform:"uppercase",fontWeight:700,marginBottom:8}}>{text}</div>
  );

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Segoe UI',system-ui,sans-serif",color:C.white,paddingBottom:80}}>
      {/* Header */}
      <div style={{borderBottom:`1px solid ${C.jet}`,padding:"18px 24px",display:"flex",alignItems:"center",
        justifyContent:"space-between",background:`linear-gradient(180deg,${C.card},transparent)`}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:34,height:34,borderRadius:9,background:`linear-gradient(135deg,${C.coffee},${C.brass})`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>✦</div>
          <div>
            <div style={{fontSize:17,fontWeight:800,color:C.brass,letterSpacing:-0.3}}>Carousel Craft</div>
            <div style={{fontSize:10,color:C.brass,opacity:0.45,letterSpacing:1.5,textTransform:"uppercase"}}>Social Media Studio</div>
          </div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <span style={{fontSize:10,color:C.dim,letterSpacing:1,textTransform:"uppercase",marginRight:4}}>Theme</span>
          {THEMES.map(t=>(
            <button key={t.id} onClick={()=>setThemeId(t.id)} title={t.label}
              style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${themeId===t.id?C.brass:"transparent"}`,
                background:t.accent,cursor:"pointer",padding:0,transition:"all 0.15s"}}/>
          ))}
        </div>
      </div>

      <div style={{maxWidth:680,margin:"0 auto",padding:"24px 18px 0"}}>
        {/* Pillars */}
        <div style={{marginBottom:20}}>
          <Label text="Content Pillars"/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
            {PILLARS.map(p=>(
              <button key={p.label} onClick={()=>setPrompt(p.prompt)} style={{
                padding:"9px 12px",borderRadius:9,border:`1px solid ${prompt===p.prompt?C.brass:C.jet}`,
                background:prompt===p.prompt?C.brassGlow:"transparent",
                color:prompt===p.prompt?C.brass:C.white,cursor:"pointer",textAlign:"left",
                fontFamily:"inherit",transition:"all 0.15s",display:"flex",alignItems:"center",gap:7}}>
                <span style={{fontSize:14}}>{p.icon}</span>
                <span style={{fontSize:11,fontWeight:600,opacity:0.9,lineHeight:1.3}}>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Label text="Format"/>
        <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
          {FORMATS.map(f=>(
            <button key={f.id} onClick={()=>setFmtId(f.id)} style={{
              padding:"7px 13px",borderRadius:7,border:`1px solid ${fmtId===f.id?C.brass:C.jet}`,
              background:fmtId===f.id?C.brassGlow:"transparent",
              color:fmtId===f.id?C.brass:C.dim,cursor:"pointer",fontFamily:"inherit",
              fontSize:11,fontWeight:600,display:"flex",alignItems:"center",gap:5,transition:"all 0.15s"}}>
              <span>{f.icon}</span>{f.label}
            </button>
          ))}
        </div>

        <Label text="Platform"/>
        <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
          {PLATFORMS.map(p=>(
            <button key={p} onClick={()=>setPlatform(p)} style={{
              padding:"7px 13px",borderRadius:7,fontSize:11,fontWeight:600,fontFamily:"inherit",
              border:`1px solid ${platform===p?C.coffee:C.jet}`,
              background:platform===p?"rgba(114,75,57,0.2)":"transparent",
              color:platform===p?C.brassLight:C.dim,cursor:"pointer",transition:"all 0.15s"}}>
              {p}
            </button>
          ))}
        </div>

        <Label text="Tone"/>
        <div style={{display:"flex",gap:6,marginBottom:18,flexWrap:"wrap"}}>
          {TONES.map(t=>(
            <button key={t.label} onClick={()=>setTone(t.label)} style={{
              padding:"6px 13px",borderRadius:7,border:`1px solid ${tone===t.label?C.brass:C.jet}`,
              background:tone===t.label?C.brassGlow:"transparent",
              color:tone===t.label?C.brass:C.dim,cursor:"pointer",fontFamily:"inherit",
              fontSize:11,fontWeight:600,display:"flex",gap:5,alignItems:"center",transition:"all 0.15s"}}>
              <span>{t.emoji}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Prompt */}
        <div style={{background:C.card,border:`1px solid ${C.jet}`,borderRadius:13,overflow:"hidden",
          boxShadow:"0 4px 24px rgba(0,0,0,0.3)"}}>
          <textarea value={prompt} onChange={e=>setPrompt(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&(e.metaKey||e.ctrlKey))generate();}}
            placeholder={`Describe your idea, or pick a Content Pillar above…\n\nE.g. "Why kids forget math — explain the forgetting curve — end with spaced repetition"`}
            rows={4} style={{width:"100%",background:"transparent",border:"none",outline:"none",
              color:C.white,fontSize:14,lineHeight:1.7,padding:"16px 18px",resize:"none",
              fontFamily:"inherit",boxSizing:"border-box"}}/>
          <div style={{padding:"10px 14px",display:"flex",justifyContent:"space-between",
            alignItems:"center",borderTop:`1px solid ${C.jet}`}}>
            <span style={{fontSize:11,color:C.jet}}>⌘ + Enter to generate</span>
            <button onClick={generate} disabled={loading||!prompt.trim()} style={{
              padding:"9px 22px",borderRadius:8,border:"none",
              background:prompt.trim()?`linear-gradient(135deg,${C.coffee},${C.brass})`:C.jet,
              color:prompt.trim()?"#0C1519":"#555",fontSize:13,fontWeight:700,
              cursor:prompt.trim()?"pointer":"not-allowed",fontFamily:"inherit"}}>
              {loading?"Generating…":`Generate ${fmt.label}`}
            </button>
          </div>
        </div>

        {error&&<div style={{color:"#e07070",fontSize:13,marginTop:10,textAlign:"center",
          padding:"10px 16px",background:"rgba(224,112,80,0.08)",borderRadius:8,
          border:"1px solid rgba(224,112,80,0.2)"}}>{error}</div>}

        {loading&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,padding:"44px 0"}}>
            <div style={{width:40,height:40,borderRadius:"50%",border:`3px solid ${C.jet}`,
              borderTop:`3px solid ${C.brass}`,animation:"spin 0.9s linear infinite"}}/>
            <p style={{color:C.brass,fontSize:13,opacity:0.7,margin:0}}>Crafting your visual creative…</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {slides&&!loading&&(
          <div style={{marginTop:30}}>
            {/* Tab bar */}
            <div style={{display:"flex",borderBottom:`1px solid ${C.jet}`,marginBottom:22,
              justifyContent:"space-between",alignItems:"flex-end"}}>
              <div style={{display:"flex"}}>
                <Tab id="slides" label={`🎴 Slides (${slides.length})`}/>
                <Tab id="caption" label="✍️ Caption"/>
                <Tab id="arc" label="🗺️ Arc"/>
              </div>
              <div style={{display:"flex",gap:8,paddingBottom:8}}>
                <button onClick={copyAll} style={{padding:"6px 11px",borderRadius:6,
                  border:`1px solid ${C.jet}`,background:copied?C.brassGlow:"transparent",
                  color:copied?C.brass:C.dim,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                  {copied?"✓ Copied":"Copy All"}
                </button>
                <DownloadBtn slides={slides} fmt={fmt} theme={theme} disabled={!slides?.length}/>
              </div>
            </div>

            {/* SLIDES */}
            {activeTab==="slides"&&(
              <>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <span style={{fontSize:11,color:C.brass,letterSpacing:1,textTransform:"uppercase",fontWeight:700}}>
                    {fmt.label} · {platform} · {tone} · {THEMES.find(t=>t.id===themeId).label}
                  </span>
                  <button onClick={genCaption} style={{padding:"6px 12px",borderRadius:6,
                    border:`1px solid ${C.jet}`,background:"transparent",color:C.brassLight,
                    fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                    ✍️ Caption
                  </button>
                </div>
                {slides.length>1&&(
                  <div style={{display:"flex",gap:5,justifyContent:"center",marginBottom:18}}>
                    {slides.map((_,i)=>(
                      <button key={i} onClick={()=>setActiveSlide(i)} style={{
                        width:i===activeSlide?20:6,height:6,borderRadius:3,
                        background:i===activeSlide?C.brass:C.jet,
                        border:"none",cursor:"pointer",padding:0,transition:"all 0.2s"}}/>
                    ))}
                  </div>
                )}
                <div style={{display:"flex",justifyContent:"center"}}>
                  <SlideCanvas slide={slides[activeSlide]} index={activeSlide} total={slides.length}
                    fmt={fmt} theme={theme} onEdit={editSlide} onRegen={regenSlide}
                    regenLoading={regenIdx===activeSlide} active/>
                </div>
                {slides.length>1&&(
                  <div style={{display:"flex",justifyContent:"center",gap:10,marginTop:14}}>
                    <button onClick={()=>setActiveSlide(p=>Math.max(0,p-1))} disabled={activeSlide===0}
                      style={{padding:"8px 18px",borderRadius:7,border:`1px solid ${C.jet}`,background:"transparent",
                        color:activeSlide===0?C.jet:C.brass,fontSize:12,fontWeight:600,
                        cursor:activeSlide===0?"not-allowed":"pointer",fontFamily:"inherit"}}>← Prev</button>
                    <button onClick={()=>setActiveSlide(p=>Math.min(slides.length-1,p+1))} disabled={activeSlide===slides.length-1}
                      style={{padding:"8px 18px",borderRadius:7,border:`1px solid ${C.jet}`,background:"transparent",
                        color:activeSlide===slides.length-1?C.jet:C.brass,fontSize:12,fontWeight:600,
                        cursor:activeSlide===slides.length-1?"not-allowed":"pointer",fontFamily:"inherit"}}>Next →</button>
                  </div>
                )}
                {slides.length>1&&(
                  <div style={{marginTop:24}}>
                    <div style={{fontSize:10,color:C.dim,letterSpacing:1.2,textTransform:"uppercase",fontWeight:600,marginBottom:10}}>All Slides</div>
                    <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:6}}>
                      {slides.map((s,i)=>(
                        <div key={i} onClick={()=>setActiveSlide(i)} style={{
                          minWidth:100,padding:"9px 11px",borderRadius:9,cursor:"pointer",flexShrink:0,
                          background:i===activeSlide?C.brassGlow:C.card,
                          border:`1px solid ${i===activeSlide?C.brass:C.jet}`,transition:"all 0.15s"}}>
                          <div style={{fontSize:8,color:C.brass,fontWeight:700,opacity:0.6,marginBottom:3,textTransform:"uppercase",letterSpacing:1}}>
                            {i===0?"Hook":i===slides.length-1?"End":`Slide ${i+1}`}
                          </div>
                          <div style={{fontSize:10,color:C.white,lineHeight:1.4,opacity:0.85}}>
                            {s.headline?.slice(0,36)}{s.headline?.length>36?"…":""}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* CAPTION */}
            {activeTab==="caption"&&(
              <div>
                {captionLoading&&(
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,padding:"40px 0"}}>
                    <div style={{width:38,height:38,borderRadius:"50%",border:`3px solid ${C.jet}`,
                      borderTop:`3px solid ${C.brass}`,animation:"spin 0.9s linear infinite"}}/>
                    <p style={{color:C.brass,fontSize:13,opacity:0.7,margin:0}}>Writing your caption…</p>
                  </div>
                )}
                {!captionLoading&&!caption&&(
                  <div style={{textAlign:"center",padding:"40px 0"}}>
                    <p style={{color:C.dim,fontSize:14,marginBottom:16}}>Ready-to-post caption + hashtags for {platform}.</p>
                    <button onClick={genCaption} style={{padding:"10px 24px",borderRadius:9,border:"none",
                      background:`linear-gradient(135deg,${C.coffee},${C.brass})`,color:"#0C1519",
                      fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>✍️ Generate Caption</button>
                  </div>
                )}
                {caption&&!captionLoading&&(
                  <div style={{display:"flex",flexDirection:"column",gap:14}}>
                    <div style={{background:C.card,border:`1px solid ${C.jet}`,borderRadius:13,padding:"20px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                        <span style={{fontSize:10,color:C.brass,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase"}}>Caption</span>
                        <button onClick={copyCaption} style={{fontSize:11,padding:"4px 10px",border:`1px solid ${C.jet}`,
                          background:captionCopied?C.brassGlow:"transparent",color:captionCopied?C.brass:C.dim,
                          borderRadius:5,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
                          {captionCopied?"✓ Copied":"Copy"}
                        </button>
                      </div>
                      <p style={{color:C.white,fontSize:14,lineHeight:1.8,margin:0,opacity:0.9,whiteSpace:"pre-wrap"}}>{caption.caption}</p>
                    </div>
                    <div style={{background:C.card,border:`1px solid ${C.jet}`,borderRadius:13,padding:"16px 20px"}}>
                      <div style={{fontSize:10,color:C.brass,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10}}>Hashtags</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                        {caption.hashtags.map((h,i)=>(
                          <span key={i} style={{padding:"4px 11px",borderRadius:20,background:"rgba(114,75,57,0.25)",
                            border:`1px solid ${C.coffee}`,color:C.brassLight,fontSize:12,fontWeight:600}}>#{h}</span>
                        ))}
                      </div>
                    </div>
                    <button onClick={genCaption} style={{alignSelf:"flex-start",padding:"7px 14px",borderRadius:7,
                      border:`1px solid ${C.jet}`,background:"transparent",color:C.dim,
                      fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>↺ Regenerate</button>
                  </div>
                )}
              </div>
            )}

            {/* ARC */}
            {activeTab==="arc"&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <p style={{fontSize:12,color:C.dim,margin:"0 0 8px"}}>Your carousel's narrative structure — click any slide to jump to it.</p>
                {slides.map((s,i)=>{
                  const role=i===0?"Hook":i===slides.length-1?"Takeaway":"Build";
                  const rc={Hook:"#e07050",Build:C.brass,Takeaway:"#9fc882"}[role];
                  return(
                    <div key={i} onClick={()=>{setActiveSlide(i);setActiveTab("slides");}} style={{
                      display:"flex",gap:14,padding:"13px 15px",borderRadius:11,
                      background:C.card,border:`1px solid ${C.jet}`,cursor:"pointer",transition:"all 0.15s"}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor=C.brass}
                      onMouseLeave={e=>e.currentTarget.style.borderColor=C.jet}>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
                        <div style={{width:27,height:27,borderRadius:"50%",background:rc+"22",border:`2px solid ${rc}`,
                          display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:rc}}>{i+1}</div>
                        {i<slides.length-1&&<div style={{width:2,flex:1,minHeight:8,background:C.jet,borderRadius:2}}/>}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:3}}>
                          <span style={{fontSize:9,fontWeight:800,letterSpacing:1.5,textTransform:"uppercase",color:rc,background:rc+"18",padding:"2px 7px",borderRadius:4}}>{role}</span>
                          {s.tag&&<span style={{fontSize:10,color:C.dim}}>{s.tag}</span>}
                        </div>
                        <div style={{fontSize:13,color:C.white,fontWeight:700,marginBottom:2}}>{s.headline}</div>
                        {s.body&&<div style={{fontSize:11.5,color:C.dim,lineHeight:1.5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.body}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
