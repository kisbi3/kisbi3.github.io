# 김재성 포트폴리오

2026-10-09 디자인을 유지한 공개 포트폴리오입니다.

## 한 번 수정하고 웹·슬라이드·PDF 생성

1. **`source/content.json`만 수정합니다.** 문장·링크·그림은 같은 값의 항목을 두 보기에서 공유합니다. 키 이름보다 문장 검색으로 찾으면 쉽습니다. 도식은 `kind: html` 항목에 SVG 원본으로 들어 있습니다.
2. `python build.py`로 웹·슬라이드 HTML을 생성합니다.
3. `python render.py`로 브라우저 검증 후 같은 HTML에서 PDF 및 제출용 단일 HTML을 생성합니다.

원본 문구나 그림을 웹·슬라이드 DOM에 각각 옮겨 적을 필요가 없습니다. `source/layout.html`은 기존 두 보기의 배치를 보존하는 템플릿이며, 내용 자리에는 같은 원본을 가리키는 참조만 있습니다. `source/style-*.css`와 `source/script-*.js`는 기존 디자인과 동작입니다. 내용 추가로 새 배치가 필요한 경우에만 템플릿을 고칩니다.

```sh
python -m pip install -r requirements.txt
python -m playwright install chromium
python build.py
python render.py
```

로컬 Chrome을 쓰려면 환경 변수 `BROWSER_CHANNEL=chrome`을 지정합니다. GitHub Actions는 Chromium을 설치하고 위 과정을 실행한 뒤 `dist/`만 Pages에 배포합니다. 이후에는 내용 수정 커밋만으로 웹과 PDF가 함께 갱신됩니다. 생성물을 별도로 편집하지 마세요.

## 공개 결과

- `/` 웹 읽기 보기, `/slides.html` 슬라이드 보기
- `/downloads/Jaesung_Kim_Portfolio_Slides.pdf` 제출·발표용 16:9 PDF
- `/downloads/Jaesung_Kim_Portfolio_Web.pdf` 연속 읽기용 PDF
- `/downloads/Jaesung_Kim_Portfolio_Web.html`, `/downloads/Jaesung_Kim_Portfolio_Slides.html`: 이미지와 새 공개 PDF까지 포함하는 오프라인 단일 HTML

본문 11장과 논문·발표 부록 1장입니다. 연구 성과, 금융 MVP 경험, 학력·자격 및 일반적인 연구 방향을 보존했습니다. 공개 범위에 맞춰 진행 중 프로젝트의 상세 설계·파일럿·과금 계획, 금융연구의 구체 가설 및 미완성 연구 방법은 제외했습니다. FRM은 시험 합격 상태이며 자격증 취득을 뜻하지 않습니다. TOEIC Speaking은 사용자가 확인한 Advanced Low (Speaking Score 160)로 표기하며, 시험일·발급번호·만료일은 추가하지 않았습니다.

기존 Drive 보관본은 이 저장소와 별개인 과거 원본이며 변경·삭제하지 않았습니다. 이 저장소에는 공개 가능한 원본만 들어 있습니다.

현재 화면은 최초 공개본 `a40e4b8`의 원래 2026-10-09 디자인을 기준으로 합니다. 최신 ContextTrail 소개와 공개 저장소 링크, TOEIC Speaking 점수를 같은 `source/content.json`에서 웹·슬라이드·PDF에 반영합니다.
