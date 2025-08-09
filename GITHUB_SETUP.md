# GitHub 연동 가이드

## LUNE 데이팅 앱을 GitHub에 업로드하는 방법

### 1. GitHub 저장소 생성
1. GitHub에 로그인
2. 새 저장소 생성 (New repository)
3. 저장소 이름: `lune-dating-app`
4. Public 또는 Private 선택
5. README 생성 체크 해제 (이미 있음)

### 2. Replit에서 GitHub 연동
1. Replit 왼쪽 사이드바에서 "Version control" (Git 아이콘) 클릭
2. "Connect to GitHub" 버튼 클릭
3. GitHub 계정으로 로그인 및 권한 부여
4. 생성한 저장소 선택

### 3. 수동으로 파일 업로드 (대안)
GitHub 웹사이트에서 직접 파일 업로드:
1. 생성한 저장소로 이동
2. "uploading an existing file" 클릭
3. 프로젝트 파일들을 드래그 앤 드롭

### 4. 프로젝트 구조
```
lune-dating-app/
├── client/           # React 프론트엔드
├── server/           # Express 백엔드
├── shared/           # 공유 스키마
├── components.json   # UI 컴포넌트 설정
├── package.json      # 의존성 관리
├── README.md         # 프로젝트 설명
└── replit.md         # 기술 문서
```

### 5. 환경 변수 설정
GitHub에 업로드할 때 다음 환경 변수들을 제외하고 업로드하세요:
- `OPENAI_API_KEY`
- `DATABASE_URL`
- PostgreSQL 관련 변수들

### 6. README.md 업데이트 권장
프로젝트에 대한 설명과 설치 방법을 추가하세요.

## 주의사항
- 민감한 정보 (API 키, 데이터베이스 URL)는 절대 GitHub에 올리지 마세요
- .env.example 파일을 생성해서 필요한 환경 변수 목록을 제공하세요