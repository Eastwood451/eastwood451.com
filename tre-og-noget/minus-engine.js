export const DIGIT_MODES=['one','two'];
export const ONES_MODES=['borrow','random'];

function intBetween(min,max,random){
  return min+Math.floor(random()*(max-min+1));
}

export function createMinusQuestion({digits='one',ones='borrow',random=Math.random}={}){
  if(!DIGIT_MODES.includes(digits))throw new Error('Ugyldigt antal cifre');
  if(!ONES_MODES.includes(ones))throw new Error('Ugyldig enertilstand');
  let top,bottom;
  if(digits==='one'){
    if(ones==='borrow'){
      const topTens=intBetween(1,9,random);
      const topOnes=intBetween(0,8,random);
      top=topTens*10+topOnes;
      bottom=intBetween(topOnes+1,9,random);
    }else{
      top=intBetween(10,99,random);
      bottom=intBetween(1,9,random);
    }
  }else if(ones==='borrow'){
    const topTens=intBetween(2,9,random);
    const topOnes=intBetween(0,8,random);
    const bottomTens=intBetween(1,topTens-1,random);
    const bottomOnes=intBetween(topOnes+1,9,random);
    top=topTens*10+topOnes;
    bottom=bottomTens*10+bottomOnes;
  }else{
    top=intBetween(20,99,random);
    bottom=intBetween(10,top-1,random);
  }
  return {top,bottom,answer:top-bottom};
}

export function nextMinusQuestion(settings,lastKey='',random=Math.random){
  let question=createMinusQuestion({...settings,random});
  for(let i=0;i<20&&`${question.top}-${question.bottom}`===lastKey;i++){
    question=createMinusQuestion({...settings,random});
  }
  return question;
}
