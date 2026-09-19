import importlib.util,json,tempfile,unittest
from pathlib import Path
import fitz
spec=importlib.util.spec_from_file_location('library_import',Path(__file__).resolve().parents[1]/'tools/matematikbibliotek/import.py');lib=importlib.util.module_from_spec(spec);spec.loader.exec_module(lib)
class ImportTests(unittest.TestCase):
 def test_duplicate_empty_ambiguous_and_resume(self):
  with tempfile.TemporaryDirectory() as temp:
   base=Path(temp);root=base/'originals';data=base/'private';root.mkdir();(data/'drive').mkdir(parents=True)
   pdf=fitz.open();page=pdf.new_page();page.insert_text((72,72),'Matematik: 3 + 4 = ?');pdf.save(root/'Opgave.pdf');pdf.close();(root/'Kopi.pdf').write_bytes((root/'Opgave.pdf').read_bytes());(root/'Tom.pdf').write_bytes(b'')
   (data/'drive/folders.json').write_text(json.dumps([{'id':'root','name':'Root','parents':[]}]),encoding='utf-8')
   records=[{'id':name,'name':name,'size':p.stat().st_size,'parents':['root']} for p in root.iterdir() for name in [p.name]];records.append({**records[0],'id':'ambiguous'})
   (data/'drive/pdf-001.json').write_text(json.dumps(records),encoding='utf-8');lib.ingest(root,data);db=lib.connect(data)
   self.assertEqual(db.execute('select count(*) from contents').fetchone()[0],2);self.assertEqual(db.execute('select count(*) from pages').fetchone()[0],1)
   self.assertEqual(db.execute("select count(*) from locations where drive_status='ambiguous'").fetchone()[0],1)
   self.assertIsNotNone(db.execute("select error from locations where path='Tom.pdf'").fetchone()[0])
   db.execute("update pages set analysis_json='preserved',status='complete'");db.commit();db.close();lib.ingest(root,data);db=lib.connect(data)
   self.assertEqual(db.execute('select analysis_json from pages').fetchone()[0],'preserved');db.close()
   (root/'Kopi.pdf').unlink();lib.ingest(root,data);db=lib.connect(data);self.assertEqual(db.execute("select active from locations where path='Kopi.pdf'").fetchone()[0],0);db.close()
if __name__=='__main__':unittest.main()
