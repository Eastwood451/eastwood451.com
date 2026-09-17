export function needsAnswerHelp(correct,ms){return !correct||ms>4000;}
export function numberLineExample(card){
  const start=80+card.a,end=start-card.b,left=40,unit=21;
  const x=n=>left+(n-70)*unit;
  const ticks=Array.from({length:21},(_,i)=>{
    const n=70+i,major=n%10===0;
    return `<line x1="${x(n)}" y1="${major?81:86}" x2="${x(n)}" y2="${major?103:98}" stroke="${major?'#34465f':'#b1bfd1'}" stroke-width="${major?2:1}"/>${major?`<text x="${x(n)}" y="128" text-anchor="middle" fill="#34465f" font-size="23">${n}</text>`:''}`;
  }).join('');
  const equation=`${start} − ${card.b} = ${end}`;
  const svg=`<svg viewBox="0 0 500 145" role="img" aria-label="${equation}. Rektanglet fra ${end} til ${start} har længden ${card.b}." xmlns="http://www.w3.org/2000/svg">
    <line x1="30" y1="92" x2="470" y2="92" stroke="#34465f" stroke-width="2"/>
    ${ticks}
    <line x1="${x(end)}" y1="77" x2="${x(end)}" y2="98" stroke="#7c3aed" stroke-width="2"/>
    <line x1="${x(start)}" y1="77" x2="${x(start)}" y2="98" stroke="#7c3aed" stroke-width="2"/>
    <rect x="${x(end)}" y="43" width="${card.b*unit}" height="34" rx="3" fill="#7c3aed"/>
    <text x="${(x(end)+x(start))/2}" y="67" text-anchor="middle" fill="white" font-size="23" font-weight="700">${card.b}</text>
    <text x="${x(end)-2}" y="29" text-anchor="end" fill="#5b21b6" font-size="24" font-weight="650">${end}</text>
    <text x="${x(start)+2}" y="29" text-anchor="start" fill="#5b21b6" font-size="24" font-weight="650">${start}</text>
  </svg>`;
  return {start,end,distance:card.b,equation,svg};
}
