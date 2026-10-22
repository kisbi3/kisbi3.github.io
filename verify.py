"""Static guardrails before publishing. Contains no private-source content."""
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parent
def verify():
 doc=(ROOT/'dist/index.html').read_text(encoding='utf8')
 assert 'jaesungkim0523@gmail.com' in doc
 assert '10.1016/j.chaos.2026.119238' in doc
 assert '2608.10852' in doc
 assert len(re.findall(r'class="page(?: |")',doc))==12
 assert not re.search(r'@@(?:CONTENT|ATTR|SVG|SVGWEB|ASSET|FILE):',doc)
 footers=re.findall(r'<footer\b[^>]*>.*?</footer>',doc,re.S)
 assert footers and all('2026.09' not in footer for footer in footers)
 assert ' / 14' not in doc
 # The archive contains only the completed publications/presentations appendix.
 assert 'id="appendix-diffusion"' not in doc and 'id="web-appendix-diffusion"' not in doc
 assert 'id="research-cycle"' not in doc and 'id="web-research-cycle"' not in doc
 # Shared content has one editable value even across heading and menu attributes.
 content=json.loads((ROOT/'source/content.json').read_text(encoding='utf8'))
 values=[x['value'] for x in content.values()]
 assert len(values)==len(set(values))
 print('Public build static checks passed')
if __name__=='__main__':verify()
