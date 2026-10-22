# 김재성 포트폴리오

연구 그림과 논문·프로젝트 탐색을 중심으로 구성한 개인 연구자 포트폴리오입니다. 웹 홈은 세리프 제목, 네이비 탐색 바, 실제 연구 그림을 사용하는 반응형 레이아웃이며, 기존 2026-10-09 슬라이드·인쇄 레이아웃은 유지합니다.

## 한 번 수정하고 웹·슬라이드·PDF 생성

1. **`source/content.json`만 수정합니다.** 문장·링크·그림은 같은 값의 항목을 두 보기에서 공유합니다. 키 이름보다 문장 검색으로 찾으면 쉽습니다. 도식은 `kind: html` 항목에 SVG 원본으로 들어 있습니다.
2. `python build.py`로 웹·슬라이드 HTML을 생성합니다.
3. `python render.py`로 브라우저 검증 후 같은 HTML에서 PDF 및 제출용 단일 HTML을 생성합니다.

원본 문구나 그림을 웹·슬라이드 DOM에 각각 옮겨 적을 필요가 없습니다. `source/layout.html`은 기존 두 보기의 배치를 보존하는 템플릿이며, 내용 자리에는 같은 원본을 가리키는 참조만 있습니다. `source/style-*.css`와 `source/script-*.js`는 기존 디자인과 동작입니다. 내용 추가로 새 배치가 필요한 경우에만 템플릿을 고칩니다.

`source/research-home.css`와 `source/research-home.js`는 웹 홈의 화면 전용 스타일과 연구 분류입니다. 웹 홈도 같은 `content.json`과 연구 그림을 참조합니다. 첫 화면의 밤하늘 사진은 연구 자료와 구분되는 분위기 배경이며, 출처·CC BY 4.0·변경 사항을 사진 바로 아래와 `THIRD_PARTY_ASSETS.md`에 기록했습니다. 인쇄에는 웹 홈의 추가 영역과 스타일이 포함되지 않습니다. 모션 줄이기 설정을 존중합니다.

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

웹의 연구·개발 요약은 압축된 텍스트 목록입니다. 본문 그림은 작게 표시하고 클릭하면 큰 원본을 볼 수 있습니다. 작은 화면에서는 확대창 안에서 좌우로 이동할 수 있습니다. 화면 전용 간격·크기는 `source/compact-web.css`에서 관리합니다.
