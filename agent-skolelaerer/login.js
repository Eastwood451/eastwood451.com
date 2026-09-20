const panel=document.querySelector('#login-panel'),status=document.querySelector('#status'),form=document.querySelector('#login-form'),logout=document.querySelector('#logout'),button=document.querySelector('#login-button');
let client,unmount,activeToken='',loading,revision=0;
async function open(session){
 if(!session){revision++;activeToken='';unmount?.();unmount=null;document.querySelector('#app').replaceChildren();panel.hidden=false;logout.hidden=true;status.textContent='Log ind med din eksisterende Eastwood-konto.';await fetch('/api/agent-skolelaerer/session',{method:'DELETE'});return;}
 if(activeToken===session.access_token)return;
 const current=++revision;
 const response=await fetch('/api/agent-skolelaerer/session',{method:'POST',headers:{Authorization:'Bearer '+session.access_token}});
 if(!response.ok){const data=await response.json();throw Error(data.error||'Login kunne ikke bekræftes.');}
 if(current!==revision)return;
 activeToken=session.access_token;
 if(!unmount){
 status.textContent='Henter din forberedelse…';
 if(!document.querySelector('#app-styles')){const link=document.createElement('link');link.id='app-styles';link.rel='stylesheet';link.href='/api/agent-skolelaerer/assets/app.css';document.head.append(link);}
 const module=await import('/api/agent-skolelaerer/assets/app.js');
 if(current!==revision)return;
 unmount=module.mount(document.querySelector('#app'));
 }
 panel.hidden=true;logout.hidden=false;
}
function queue(session){loading=(loading||Promise.resolve()).catch(()=>{}).then(()=>open(session)).catch(error=>{unmount?.();unmount=null;activeToken='';document.querySelector('#app').replaceChildren();panel.hidden=false;status.textContent=error.message;logout.hidden=!session;});return loading;}
form.addEventListener('submit',async event=>{event.preventDefault();if(!client)return;button.disabled=true;status.textContent='Logger ind…';try{const {data,error}=await client.auth.signInWithPassword({email:document.querySelector('#email').value.trim(),password:document.querySelector('#password').value});if(error)throw Error('E-mail eller adgangskode blev ikke godkendt.');document.querySelector('#password').value='';await queue(data.session);}catch(error){status.textContent=error.message;}finally{button.disabled=false;}});
logout.addEventListener('click',async()=>{await client.auth.signOut({scope:'local'});await queue(null);});
try{
 const response=await fetch('/api/config');if(!response.ok)throw Error('Login kunne ikke indlæses. Prøv at genindlæse siden.');const config=await response.json();
 client=window.supabase.createClient(config.supabaseUrl,config.supabaseAnonKey);
 client.auth.onAuthStateChange((_event,session)=>{setTimeout(()=>void queue(session),0);});
 const {data,error}=await client.auth.getSession();if(error)throw error;await queue(data.session);
}catch(error){status.textContent=error.message;}
