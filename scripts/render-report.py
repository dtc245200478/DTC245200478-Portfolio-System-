"""Render verified Word-exported PDF using the packaged render_docx raster pipeline."""
import importlib.util,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
renderer=Path(r'C:\Users\vietdo1201\.cache\codex-runtimes\codex-primary-runtime\plugins\openai-primary-runtime\plugins\documents\skills\documents\render_docx.py')
spec=importlib.util.spec_from_file_location('render_docx',renderer);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
pdf=ROOT/'docs/Bao_Cao_Link_Me_Tran_Trung_Dung.pdf'
def word_pdf(doc_path,user_profile,convert_tmp_dir,stem,verbose):
 target=Path(convert_tmp_dir)/(stem+'.pdf');shutil.copyfile(pdf,target)
 return str(target),'Microsoft Word native PDF export; LibreOffice is not bundled on Windows.'
module.convert_to_pdf=word_pdf
out=ROOT/'.local/report-render';out.mkdir(parents=True,exist_ok=True)
paths=module.rasterize(str(ROOT/'docs/Bao_Cao_Link_Me_Tran_Trung_Dung.docx'),str(out),110,False,False)
print('Rendered',len(paths),'pages to',out)
