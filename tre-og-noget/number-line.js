export function needsAnswerHelp(correct,ms){return !correct||ms>4000;}

export function numberLineExample(card){
  if(!card||!Number.isInteger(card.a)||!Number.isInteger(card.b)||card.a<0||card.a>=card.b||card.b>9){
    throw new RangeError('Tallinjen kræver cifre med 0 ≤ a < b ≤ 9.');
  }
  const start=80+card.a,end=start-card.b,middle=80;
  const firstStep=start-middle,secondStep=middle-end;
  const left=40,unit=21,axisY=150;
  const x=n=>left+(n-70)*unit;
  const colors={total:'#7c3aed',remainder:'#15803d',toTen:'#2563eb',axis:'#34465f'};
  const equation=`${start} − ${card.b} = ${end}`;
  const decomposition=`${secondStep} + ${firstStep} = ${card.b}`;
  const explanation=`Fra ${start} går du ${firstStep} tilbage til ${middle} og derefter ${secondStep} tilbage til ${end}. ${decomposition}.`;
  // Keep labels on their exact x coordinates. Stagger the only one-unit pair
  // vertically rather than moving either label away from its tick.
  const endLabelY=card.b===1?24:29,startLabelY=card.b===1?56:29;
  const ticks=Array.from({length:21},(_,i)=>{
    const n=70+i,major=n%10===0;
    return `<line x1="${x(n)}" y1="${major?138:145}" x2="${x(n)}" y2="${major?162:155}" stroke="${major?colors.axis:'#b1bfd1'}" stroke-width="${major?2:1}"/>${major?`<text x="${x(n)}" y="185" text-anchor="middle" fill="${colors.axis}" font-size="23"${n===middle?' font-weight="750"':''}>${n}</text>`:''}`;
  }).join('');
  function segment(from,to,distance,color,part){
    // A start at 80 has no first jump: do not draw a zero-width bar or arrow.
    if(distance===0)return '';
    const fromX=x(from)-2,toX=x(to)+2;
    return `<g data-step="${part}">
      <rect data-part="${part}" x="${x(to)}" y="102" width="${distance*unit}" height="29" fill="${color}"/>
      <text x="${(x(to)+x(from))/2}" y="124" text-anchor="middle" fill="white" font-size="23" font-weight="750">${distance}</text>
      <path data-direction="left" d="M ${fromX} 134 H ${toX} M ${toX+4} 131 L ${toX} 134 L ${toX+4} 137" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`;
  }
  const svg=`<svg viewBox="0 0 500 244" role="img" aria-label="${equation}. ${explanation}" xmlns="http://www.w3.org/2000/svg">
    <line x1="30" y1="${axisY}" x2="470" y2="${axisY}" stroke="${colors.axis}" stroke-width="2"/>
    ${ticks}
    <line data-guide="end" x1="${x(end)}" y1="${endLabelY+6}" x2="${x(end)}" y2="156" stroke="${colors.total}" stroke-width="2"/>
    <line data-guide="start" x1="${x(start)}" y1="${startLabelY+6}" x2="${x(start)}" y2="156" stroke="${colors.total}" stroke-width="2"/>
    <line data-guide="middle" x1="${x(middle)}" y1="96" x2="${x(middle)}" y2="156" stroke="${colors.axis}" stroke-width="2" stroke-dasharray="3 3"/>
    <rect data-part="whole" x="${x(end)}" y="64" width="${card.b*unit}" height="32" rx="3" fill="${colors.total}"/>
    <text x="${(x(end)+x(start))/2}" y="88" text-anchor="middle" fill="white" font-size="24" font-weight="750">${card.b}</text>
    ${segment(middle,end,secondStep,colors.remainder,'remainder')}
    ${segment(start,middle,firstStep,colors.toTen,'to-ten')}
    <text data-label="end" x="${x(end)}" y="${endLabelY}" text-anchor="middle" fill="#5b21b6" font-size="24" font-weight="700">${end}</text>
    <text data-label="start" x="${x(start)}" y="${startLabelY}" text-anchor="middle" fill="#5b21b6" font-size="24" font-weight="700">${start}</text>
    <text data-label="decomposition" x="250" y="227" text-anchor="middle" font-size="26" font-weight="750" fill="${colors.axis}"><tspan fill="${colors.remainder}">${secondStep}</tspan> + <tspan fill="${colors.toTen}">${firstStep}</tspan> = <tspan fill="${colors.total}">${card.b}</tspan></text>
  </svg>`;
  return {start,end,middle,firstStep,secondStep,distance:card.b,equation,decomposition,explanation,svg};
}
