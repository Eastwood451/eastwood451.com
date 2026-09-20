import copy,importlib.util,json,tempfile,unittest,sqlite3,sys
from types import SimpleNamespace
from pathlib import Path
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('analysis_runtime',Path(__file__).resolve().parents[1]/'tools/matematikbibliotek/analysis_runtime.py');runtime=importlib.util.module_from_spec(spec);spec.loader.exec_module(runtime)
class RecoveryTests(unittest.TestCase):
 def page(self):return {'id':'abc:1','summary':'Opgave','subject':'math','material_type':'student','needs_review':False,'visual_inspected':True,'assessments':[{'topic':'tal','subtopic':'Tal','skill':'Tælle','reason':'Synlige tal','difficulty':'let','grade_min':1,'grade_max':1,'confidence':.9}]}
 def test_json_with_trailing_explanation(self):
  e,p=runtime.decode_result(json.dumps({'response':json.dumps({'pages':[self.page()]})+'\nEkstra tekst'}));runtime.validate_pages(p,['abc:1'],{'tal'})
 def test_fenced_json(self):
  e,p=runtime.decode_result(json.dumps({'response':'```json\n'+json.dumps({'pages':[self.page()]})+'\n```'}));self.assertEqual(len(p),1)
 def test_unseen_and_wrong_id_rejected(self):
  for changes in ({'visual_inspected':False},{'id':'image-name'},{'visual_inspected':'true'}):
   p=self.page();p.update(changes)
   with self.assertRaises(ValueError):runtime.validate_pages([p],['abc:1'],{'tal'})
 def test_duplicate_missing_pages_rejected(self):
  with self.assertRaises(ValueError):runtime.validate_pages([self.page(),self.page()],['abc:1','abc:2'],{'tal'})
 def test_facit_is_review(self):
  p=self.page();p['material_type']='answers';runtime.validate_pages([p],['abc:1'],{'tal'});self.assertTrue(p['needs_review'])
 def test_credits_stop_before_request(self):
  with tempfile.TemporaryDirectory() as d:
   p=Path(d)/'.gemini/antigravity-cli';p.mkdir(parents=True);(p/'settings.json').write_text('{"useG1Credits":true}')
   with patch.object(Path,'home',return_value=Path(d)):
    with self.assertRaises(RuntimeError):runtime.credit_guard()
 def test_quota_classification(self):
  self.assertTrue(runtime.quota_delay('RESOURCE_EXHAUSTED 429'));self.assertFalse(runtime.quota_delay('DNS lookup no such host'))
 def test_hook_preserved(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d);p=root/'.gemini/config/plugins/googlecloudtools.datacloud_telemetry';p.mkdir(parents=True);bundle=p/'telemetry_hook_bundle.js';bundle.touch();hook=p/'hooks.json';hook.write_text(json.dumps({'telemetry':{'enabled':True,'PreToolUse':[{'hooks':[{'command':'node "'+str(bundle)+'" --agent_name gemini','timeout':30}]}]}}))
   with patch.object(Path,'home',return_value=root):self.assertTrue(runtime.repair_hook(root))
   data=json.loads(hook.read_text());self.assertTrue(data['telemetry']['enabled']);self.assertEqual(data['telemetry']['PreToolUse'][0]['hooks'][0]['command'],'node '+bundle.as_posix()+' --agent_name gemini')
 def test_network_retry_then_bad_batch_splits_without_losing_pages(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d);settings=root/'.gemini/antigravity-cli';settings.mkdir(parents=True);(settings/'settings.json').write_text('{}')
   db=sqlite3.connect(root/'catalogue.sqlite');db.executescript("create table locations(hash text,active integer);create table pages(id text,hash text,number integer,text text,analysis_json text,status text,model text,version text);insert into locations values('abc',1);")
   images=root/'previews/abc';images.mkdir(parents=True)
   for n in range(1,4):
    (images/f'{n}.jpg').write_bytes(b'fixture');db.execute("insert into pages(id,hash,number,text,status) values(?,'abc',?,'','pending')",(f'abc:{n}',n))
   db.commit();db.close();calls=[]
   def fake_cli(args,**kwargs):
    manifest=Path(args[2].split('Manifest: ')[1].split('\n')[0]);rows=json.loads(manifest.read_text());calls.append(len(rows))
    if len(calls)==1:return SimpleNamespace(returncode=1,stdout='',stderr='DNS lookup no such host')
    if len(calls)==2:return SimpleNamespace(returncode=0,stdout=json.dumps({'response':'{"pages":[]}'}),stderr='')
    pages=[]
    for r in rows:
     p=self.page();p['id']=r['id'];pages.append(p)
    return SimpleNamespace(returncode=0,stdout=json.dumps({'response':json.dumps({'pages':pages})}),stderr='')
   args=['worker','--data',d,'--all-pending','--batch-size','3','--keep-running']
   with patch.object(Path,'home',return_value=root),patch.object(sys,'argv',args),patch.object(runtime.subprocess,'run',side_effect=fake_cli),patch.object(runtime.time,'sleep'):
    runtime.run(Path('fake-cli'),'gemini-test','v-test','prompt')
   db=sqlite3.connect(root/'catalogue.sqlite');self.assertEqual(db.execute("select count(*) from pages where status='complete'").fetchone()[0],3);db.close();self.assertEqual(calls,[3,3,1,2])
if __name__=='__main__':unittest.main()
