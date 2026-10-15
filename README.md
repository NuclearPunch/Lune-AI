# LUNE - Light Up New Emotions

감정 지능을 활용한 AI 기반 한국어 데이팅 앱 (모바일 웹뷰 최적화)

![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

## 프로젝트 개요

LUNE은 "Light Up New Emotions"의 줄임말로, 사용자들이 새로운 감정을 발견하고 키워나갈 수 있도록 돕는 지능형 데이팅 플랫폼입니다. 기존의 외모 중심 매칭과 달리, 감정적 호환성과 AI 기반 대화 코칭을 통해 의미 있는 연결을 만들어갑니다.

## 주요 기능

- ✨ **감정 기반 매칭**: OpenAI GPT-4o를 활용한 개성화된 호환성 분석
- 💬 **실시간 채팅**: WebSocket 기반 실시간 메시징
- 🧠 **AI 대화 코칭**: 상황별 맞춤형 메시지 제안
- 📱 **모바일 최적화**: 반응형 디자인으로 모든 기기에서 완벽한 경험
- 🌙 **한국어 지원**: 완전한 한국어 인터페이스와 문화적 맥락 반영

## 기술 스택

### 프론트엔드
- **React 18** + TypeScript + Vite
- **Shadcn/ui** + Radix UI (접근성 우선)
- **Tailwind CSS** (커스텀 moonlight 테마)
- **Wouter** (클라이언트 사이드 라우팅)
- **TanStack Query** (서버 상태 관리)

### 백엔드
- **Node.js** + Express.js + TypeScript
- **PostgreSQL** + Drizzle ORM
- **WebSocket** (실시간 통신)
- **Zod** (타입 안전 검증)

### AI 서비스
- **OpenAI GPT-4o** (프로필 분석, 매칭, 대화 제안)
- **text-embedding-3-small** 프로필 임베딩 기반 호환성 점수 계산

## 설치 및 실행

### 환경 변수 설정
`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
PGHOST=localhost
PGPORT=5432
PGDATABASE=lune
PGUSER=postgres
PGPASSWORD=password
```

### 의존성 설치 및 실행
```bash
npm install
npm run db:push    # 데이터베이스 스키마 생성
npm run dev        # 개발 서버 시작
```

## 프로젝트 구조

```
├── client/
│   └── src/
│       ├── components/     # 재사용 가능한 UI 컴포넌트
│       ├── pages/         # 페이지 컴포넌트
│       ├── hooks/         # 커스텀 React 훅
│       └── lib/           # 유틸리티 및 API 클라이언트
├── server/
│   ├── ai/               # AI 서비스 (OpenAI 통합)
│   ├── db.ts            # 데이터베이스 연결
│   ├── storage.ts       # 데이터 접근 계층
│   └── routes.ts        # API 라우트
├── shared/
│   └── schema.ts        # 공유 데이터 스키마
└── components.json      # Shadcn/ui 설정
```

## API 엔드포인트

### 온보딩
- `POST /api/onboarding/:userId` - 온보딩 완료

### 사용자 관리
- `GET /api/user/:userId` - 사용자 정보 조회
- `PUT /api/user/:userId` - 사용자 정보 업데이트

### 매칭
- `GET /api/matches/:userId` - 매칭된 사용자 목록

### 채팅
- `GET /api/conversations/:userId` - 대화 목록
- WebSocket `/ws` - 실시간 메시징

## 데이터베이스 스키마

주요 테이블:
- `users` - 사용자 기본 정보
- `profiles` - 상세 프로필 정보
- `matches` - 매칭 관계
- `conversations` - 대화방
- `messages` - 메시지
- `emotional_feedback` - 감정 피드백
- `ai_interactions` - AI 상호작용 로그

## 개발 가이드라인

- 모든 UI 컴포넌트는 모바일 우선으로 설계
- 한국어 텍스트와 문화적 맥락을 고려한 UX
- 감정 중심의 인터랙션 디자인
- 접근성 표준 준수 (WCAG 2.1 AA)

## 배포

Node.js 서버 하나(Express가 API·WebSocket·정적 파일을 함께 서빙)와 PostgreSQL만 있으면 됩니다.
`npm run build` 후 `npm start`로 실행하며 Railway, Render, Fly.io 같은 플랫폼에 그대로 올릴 수 있습니다.

## 라이선스

이 프로젝트는 개인 사용 및 학습 목적으로 제공됩니다.

---

💙 LUNE과 함께 새로운 감정을 발견해보세요!