"""Exercise live bridge with an isolated test diagram; never prints credentials."""
import json,sys,time,secrets,hashlib,base64
import urllib.request,urllib.error,urllib.parse
base=sys.argv[1] if len(sys.argv)>1 else 'https://wpriingzftsboauvkmsj.supabase.co/functions/v1/smfi-mcp'
site='https://eastwood451.com';resource=site+'/api/smfi/mcp'
def call(path,method='GET',data=None,token=None):
    headers={'Content-Type':'application/json','Origin':site,'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'}
    if token:headers['Authorization']='Bearer '+token
    req=urllib.request.Request(base+path,data=None if data is None else json.dumps(data).encode(),headers=headers,method=method)
    try:
        with urllib.request.urlopen(req,timeout=25) as r:return r.status,json.loads(r.read())
    except urllib.error.HTTPError as e:return e.code,json.loads(e.read())
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args):return None
owner=None
try:
    status,health=call('/health');assert status==200,(status,health)
    state={'version':'4.0','operatorName':'MCP integration test','actors':[{'id':'a1','personId':'person_line','name':'Test Actor','children':[]}],'holonNotes':{},'holonTags':{},'holonSizes':{},'customHolons':{},'personalityData':{},'savedPeopleLibrary':[],'savedPeopleVisibility':{}}
    status,workspace=call('/bootstrap','POST',{'state':state,'label':'MCP isolated integration test'});assert status==201,(status,workspace)
    owner=workspace['owner_token'];wid=workspace['id']
    assert call('/workspace')[0]==401
    redirect='https://chatgpt.com/connector_platform_oauth_redirect'
    status,client=call('/register','POST',{'client_name':'MCP integration test','redirect_uris':[redirect],'token_endpoint_auth_method':'none'});assert status==201,(status,client)
    verifier=secrets.token_urlsafe(48);challenge=base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip('=')
    query=urllib.parse.urlencode({'client_id':client['client_id'],'redirect_uri':redirect,'response_type':'code','code_challenge':challenge,'code_challenge_method':'S256','resource':resource,'scope':'smfi:read smfi:write offline_access','state':'test-state'})
    opener=urllib.request.build_opener(NoRedirect())
    try:opener.open(urllib.request.Request(base+'/authorize?'+query,headers={'User-Agent':'Mozilla/5.0'}),timeout=25);raise AssertionError('Expected redirect')
    except urllib.error.HTTPError as e:
        assert e.code==302,e.code
        request=urllib.parse.parse_qs(urllib.parse.urlparse(e.headers['Location']).query)['request'][0]
    status,consent=call('/consent','POST',{'request':request,'approved':True},owner);assert status==200,(status,consent)
    params=urllib.parse.parse_qs(urllib.parse.urlparse(consent['redirect_url']).query)
    assert params['state']==['test-state'];assert params['iss']==[site+'/api/smfi']
    exchange={'grant_type':'authorization_code','client_id':client['client_id'],'redirect_uri':redirect,'code':params['code'][0],'code_verifier':verifier,'resource':resource}
    status,tokens=call('/token','POST',exchange);assert status==200,(status,tokens)
    def rpc(name,args={}):
        status,result=call('/mcp','POST',{'jsonrpc':'2.0','id':1,'method':'tools/call','params':{'name':name,'arguments':args}},tokens['access_token']);assert status==200,status
        return result['result']
    read=rpc('smfi_read_model');assert not read.get('isError'),read
    assert read['structuredContent']['revision']==1
    created=rpc('smfi_create_holon',{'expected_revision':1,'zone':'person_line/mof','title':'Live test holon','content':'Written through MCP'});assert not created.get('isError'),created
    key=created['structuredContent']['created_key'];assert created['structuredContent']['revision']==2
    saved=call('/workspace',token=owner)[1];assert saved['state']['holonNotes'][key]=='Written through MCP'
    assert rpc('smfi_update_holon',{'expected_revision':1,'holon_key':key,'content':'stale'})['isError']
    moved=rpc('smfi_move_holon',{'expected_revision':2,'holon_key':key,'zone':'top/lof'});assert not moved.get('isError'),moved
    assert moved['structuredContent']['model']['holons'][key]['content']=='Written through MCP'
    history=call('/history',token=owner)[1];assert len(history)>=2,len(history)
    assert call('/token','POST',exchange)[0]==400
    status,refresh=call('/token','POST',{'grant_type':'refresh_token','client_id':client['client_id'],'refresh_token':tokens['refresh_token'],'resource':resource});assert status==200,(status,refresh)
    assert call('/disconnect','POST',{},owner)[0]==200
    assert rpc('smfi_read_model')['isError']
    print('PASS: live OAuth/PKCE, private diagram, MCP read/create/move, stale-edit rejection, history, refresh and disconnect.')
finally:
    if owner:
        status,_=call('/workspace','DELETE',token=owner)
        if status!=200:print('Isolated test cleanup failed; workspace id:',wid,file=sys.stderr)
