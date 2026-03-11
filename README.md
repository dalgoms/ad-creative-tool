[English](./README_EN.md) · **한국어**

# Ad Creative Tool - 광고 크리에이티브 자동화 도구

## 1. 프로젝트 개요

Ad Creative Tool은 캠페인 정보를 입력하면 카테고리별 카피, 플랫폼별 사이즈에 맞춘 광고 에셋을 자동 생성하는 풀스택 자동화 시스템이다. AI 카피 생성(GPT-4o), 서버사이드 이미지 렌더링(Satori + Sharp), 클라우드 스토리지(Supabase), 워크플로우 자동화(Make.com 웹훅)를 하나의 파이프라인으로 통합한다.

**Production URL:** https://ad-creative-tool.vercel.app

## 2. 왜 이 툴을 만들었는지

광고 크리에이티브 제작은 반복적이고 시간이 많이 든다. 같은 캠페인이라도 Meta, LinkedIn 등 플랫폼마다 다른 사이즈가 필요하고, 카테고리(SaaS, 뷰티, 교육)에 따라 톤과 키워드가 달라야 한다. 이 과정을 수작업으로 하면 일관성이 떨어지고 확장이 어렵다.

핵심 설계 철학은 **템플릿 기반 렌더링**이다. AI가 배너 전체를 이미지로 생성하면 텍스트 품질과 레이아웃을 통제할 수 없다. 이 시스템은 AI를 카피 생성과 배경 이미지 프롬프트에만 사용하고, 최종 에셋은 프로그래밍 가능한 템플릿 엔진(Satori)으로 렌더링한다.

## 3. 해결하려는 문제

| 문제 | 솔루션 |
|------|--------|
| 플랫폼별 사이즈를 수동으로 만들어야 함 | 플랫폼 프리셋으로 자동 멀티사이즈 렌더링 |
| 카테고리별로 톤과 키워드가 달라야 함 | 카테고리 룰 엔진으로 자동 적용 |
| AI 이미지 생성의 텍스트 품질 문제 | 템플릿 기반 렌더링으로 텍스트 완전 통제 |
| 브랜드 일관성 유지 어려움 | 브랜드 설정(색상, 폰트, 로고) 중앙 관리 |
| 퍼블리싱 자동화 연동 부재 | Make.com 웹훅으로 자동화 연결 준비 |

## 4. 주요 기능 요약

### MVP (현재 구현)
- 캠페인 생성 및 관리
- GPT-4o 카피 생성 (폴백: 결정적 템플릿)
- Satori + Sharp 서버사이드 렌더링 (한국어 지원)
- 5개 플랫폼 프리셋 (Meta 3종, LinkedIn 2종)
- 3개 카테고리 룰 (B2B SaaS, 뷰티, 교육)
- 에셋 상태 관리 (generated → approved → published)
- 카피 재생성 / 에셋 재렌더링
- Make.com 인바운드/아웃바운드 웹훅
- Supabase Storage 클라우드 에셋 저장

### 향후 확장
- 승인 워크플로우 (다단계 승인)
- Make.com 퍼블리싱 자동화
- 실시간 배경 이미지 AI 생성 (DALL-E)
- A/B 테스트 지원
- 멀티 브랜드 관리

## 5. 전체 아키텍처 요약

```mermaid
flowchart TB
  subgraph client [클라이언트]
    UI["Next.js React UI"]
  end

  subgraph vercel [Vercel 서버리스]
    API["API Routes"]
    CopyEngine["카피 생성 엔진"]
    RenderEngine["렌더링 엔진"]
  end

  subgraph external [외부 서비스]
    OpenAI["OpenAI GPT-4o"]
    Supabase["Supabase"]
    Make["Make.com"]
  end

  subgraph supabase_detail [Supabase]
    DB["PostgreSQL"]
    Storage["Storage Bucket"]
  end

  UI -->|"HTTP"| API
  API --> CopyEngine
  API --> RenderEngine
  CopyEngine -->|"카피 생성"| OpenAI
  RenderEngine -->|"에셋 업로드"| Storage
  API -->|"데이터 읽기/쓰기"| DB
  API -->|"웹훅 전송"| Make
  Make -->|"캠페인 생성 요청"| API
```

## 6. 사용 기술과 각 역할

| 기술 | 역할 |
|------|------|
| **Next.js 15 (App Router)** | 프론트엔드 + API 라우트, 서버 컴포넌트 |
| **TypeScript** | 전체 코드베이스 타입 안정성 |
| **Tailwind CSS** | UI 스타일링 |
| **Prisma** | 타입 안전 ORM, 스키마 관리 |
| **PostgreSQL (Supabase)** | 주 데이터베이스 |
| **Supabase Storage** | 생성된 에셋 PNG 클라우드 저장 |
| **OpenAI GPT-4o** | AI 카피 생성 (헤드라인, 서브카피, CTA) |
| **Satori** | React JSX → SVG 서버사이드 렌더링 |
| **Sharp** | SVG → PNG 고해상도 변환 |
| **Zod** | API 입력 스키마 검증 |
| **Vercel** | 서버리스 호스팅, CI/CD |
| **Make.com** | 외부 워크플로우 자동화 연동 (웹훅) |

## 7. 폴더 구조 요약

```
ad-creative-tool/
├── app/                    # Next.js App Router
│   ├── api/v1/             # REST API 엔드포인트 (18개 라우트)
│   ├── campaigns/          # 캠페인 관리 UI
│   ├── brands/             # 브랜드 관리 UI
│   ├── categories/         # 카테고리 관리 UI
│   ├── settings/           # 플랫폼, 웹훅 설정
│   └── page.tsx            # 대시보드
├── components/             # 재사용 UI 컴포넌트
│   ├── campaigns/          # AssetGrid, CampaignForm, CampaignActions
│   ├── brands/             # BrandForm
│   └── layout/             # Sidebar
├── lib/
│   ├── engine/             # 핵심 엔진 (카피, 렌더링, 업로드, 리졸버)
│   ├── templates/          # AdTemplate (Satori용 JSX 컴포넌트)
│   ├── automation/         # Make.com 웹훅 빌더/디스패처
│   ├── validators/         # Zod 스키마
│   ├── utils/              # 폰트 로더, 텍스트 피팅, 상수
│   └── db/                 # Prisma 클라이언트 싱글톤
├── prisma/
│   ├── schema.prisma       # 데이터베이스 스키마
│   └── seed.ts             # 초기 데이터
├── public/fonts/           # Inter + Noto Sans KR TTF (한국어 지원)
└── next.config.ts          # Vercel 배포 설정
```

## 8. 전체 동작 흐름

### 캠페인 생성 → 에셋 생성 전체 과정

```mermaid
sequenceDiagram
  participant U as 사용자
  participant UI as 웹 UI
  participant API as Generate API
  participant DB as PostgreSQL
  participant AI as OpenAI
  participant Satori as Satori+Sharp
  participant S3 as Supabase Storage
  participant WH as Make.com

  U->>UI: 캠페인 정보 입력
  UI->>API: POST /api/v1/creatives/generate
  API->>DB: 브랜드, 카테고리, 프리셋 조회
  API->>AI: 카피 생성 요청
  AI-->>API: 헤드라인, 서브카피, CTA 반환
  API->>DB: 캠페인 + 카피 변형 저장

  loop 각 카피 변형 x 각 플랫폼 프리셋
    API->>Satori: JSX 템플릿 렌더링
    Satori-->>API: SVG 반환
    API->>API: Sharp로 PNG 변환
    API->>S3: PNG 업로드
    S3-->>API: 공개 URL 반환
    API->>DB: 에셋 레코드 저장
  end

  API->>DB: 캠페인 상태 → completed
  API->>WH: creative.completed 웹훅 발송
  API-->>UI: 캠페인 ID + 에셋 URL 반환
```

## 9. 캠페인 생성부터 에셋 생성까지의 과정

1. **입력 수집**: 사용자가 브랜드, 카테고리, 제품명, 대상 고객, 플랫폼을 선택한다.
2. **카테고리 룰 적용**: 선택된 카테고리에 따라 키워드, 톤, 카피 규칙, 시각적 방향이 자동으로 결정된다.
3. **카피 생성**: OpenAI GPT-4o가 카테고리 룰에 맞는 헤드라인, 서브카피, CTA를 생성한다. API 키가 없거나 실패하면 결정적 폴백이 작동한다.
4. **배경 프롬프트 생성**: 카테고리의 시각적 방향과 브랜드 색상을 기반으로 배경 이미지 프롬프트를 생성한다 (현재는 프롬프트만 생성, 실제 이미지 생성은 미래 확장).
5. **템플릿 리졸빙**: 카테고리-플랫폼 매핑에 따라 적절한 템플릿을 선택한다.
6. **렌더링**: 각 카피 변형 x 플랫폼 프리셋 조합마다 Satori가 JSX 템플릿을 SVG로 렌더링하고, Sharp가 PNG로 변환한다.
7. **업로드**: Supabase Storage에 PNG를 업로드하고 공개 URL을 받는다.
8. **저장**: 캠페인, 카피 변형, 에셋 레코드를 모두 PostgreSQL에 저장한다.
9. **웹훅 발송**: 등록된 웹훅 수신자에게 완료 이벤트를 발송한다.

## 10. DB / Storage / Vercel / OpenAI / Make 역할

| 구성요소 | 역할 | 상세 |
|----------|------|------|
| **PostgreSQL (Supabase)** | 주 데이터 저장소 | 캠페인, 브랜드, 카테고리 룰, 프리셋, 템플릿, 카피, 에셋 메타데이터, 웹훅 설정 |
| **Supabase Storage** | 에셋 파일 저장 | `creative-assets` 버킷에 PNG 파일 저장, 공개 URL 반환 |
| **Vercel** | 호스팅 + 서버리스 | Next.js standalone 배포, API 라우트 실행, 폰트 번들링 |
| **OpenAI GPT-4o** | AI 카피 생성 | 카테고리 룰 기반 프롬프트로 헤드라인/서브카피/CTA 생성, JSON 응답 포맷 |
| **Make.com** | 외부 자동화 | 인바운드: 캠페인 생성 트리거, 아웃바운드: 완료/실패 이벤트 전송 |

## 11. 주요 API 요약

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/v1/creatives/generate` | 캠페인 생성 + 카피 + 에셋 전체 파이프라인 |
| PATCH | `/api/v1/assets/[id]/status` | 에셋 상태 변경 (approve/reject/publish) |
| POST | `/api/v1/campaigns/[id]/regenerate-copy` | 카피 재생성 |
| POST | `/api/v1/campaigns/[id]/regenerate-assets` | 에셋 재렌더링 |
| POST | `/api/v1/webhooks/make` | Make.com 인바운드 (create_campaign / get_status) |
| GET | `/api/v1/brands` | 브랜드 목록 |
| GET | `/api/v1/categories` | 카테고리 목록 |
| GET | `/api/v1/presets` | 플랫폼 프리셋 목록 |

## 12. 주요 화면 요약

| 경로 | 화면 | 기능 |
|------|------|------|
| `/` | 대시보드 | 전체 통계, 최근 캠페인 |
| `/campaigns/new` | 캠페인 생성 | 4단계 폼 (브랜드 → 제품 → 플랫폼 → 생성) |
| `/campaigns/[id]` | 캠페인 상세 | 카피 변형, 에셋 그리드, 재생성 버튼, 상태 관리 |
| `/campaigns` | 캠페인 목록 | 전체 캠페인 리스트 |
| `/brands` | 브랜드 관리 | 생성/수정, 색상/폰트/로고 |
| `/categories` | 카테고리 관리 | 키워드/톤/시각적 방향 편집 |
| `/settings/webhooks` | 웹훅 설정 | 웹훅 등록/테스트/이력 |

## 13. 상태 관리 흐름

### 캠페인 상태
```
draft → generating → completed
                  → failed
```

### 에셋 상태
```
generated → approved → published
         → rejected → generated (리셋)
```

에셋 상태 전환 규칙:
- `generated`: approve 또는 reject 가능
- `approved`: publish 또는 reject 가능
- `rejected`: generated로 리셋 가능
- `published`: 최종 상태 (변경 불가)

## 14. Regenerate 흐름

### 카피 재생성 (`POST /campaigns/[id]/regenerate-copy`)
1. 기존 카피 변형과 연결된 에셋을 모두 삭제
2. 카테고리 룰 기반으로 새 카피 변형 생성 (OpenAI 또는 폴백)
3. 캠페인 상태를 `draft`로 리셋
4. 에셋을 다시 렌더링하려면 별도로 "재렌더링" 실행 필요

### 에셋 재렌더링 (`POST /campaigns/[id]/regenerate-assets`)
1. 기존 에셋만 삭제 (카피 변형은 유지)
2. 현재 카피 변형으로 모든 프리셋에 대해 재렌더링
3. 새 PNG를 Supabase Storage에 업로드
4. 캠페인 상태를 `completed`로 업데이트

## 15. 로컬 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정 (.env.local)
DATABASE_URL="postgresql://postgres:password@localhost:5433/ad_creative_tool"
OPENAI_API_KEY="sk-..."                    # 선택사항
NEXT_PUBLIC_SUPABASE_URL=""                 # 선택사항 (없으면 로컬 저장)
SUPABASE_SERVICE_ROLE_KEY=""                # 선택사항

# 3. 로컬 DB 시작 (embedded-postgres)
node scripts/start-db.mjs

# 4. 스키마 푸시 및 시드
npx prisma db push
npx tsx prisma/seed.ts

# 5. 개발 서버 시작
npm run dev
```

## 16. 배포 구조 요약

| 항목 | 서비스 | 비고 |
|------|--------|------|
| 호스팅 | Vercel (standalone output) | 자동 CI/CD (GitHub 연동) |
| 데이터베이스 | Supabase PostgreSQL | Transaction Pooler (포트 6543) |
| 에셋 저장 | Supabase Storage | `creative-assets` 버킷, 퍼블릭 |
| AI | OpenAI API | GPT-4o, 폴백 포함 |
| 도메인 | ad-creative-tool.vercel.app | 커스텀 도메인 추가 가능 |

## 17. 주의사항

- `.env`, `.env.local` 파일은 절대 git에 커밋하지 않는다
- `SUPABASE_SERVICE_ROLE_KEY`는 RLS를 우회하므로 서버사이드에서만 사용
- Vercel 서버리스 환경은 파일시스템이 읽기 전용이므로, Supabase Storage 키가 반드시 필요
- 폰트 파일(`public/fonts/`)은 ~9.4MB이며 반드시 git 레포에 포함되어야 함
- 한국어 폰트(Noto Sans KR)는 WOFF 형식이어야 Satori가 파싱 가능 (WOFF2 미지원)

## 18. 현재 한계

| 한계 | 상세 |
|------|------|
| 배경 이미지 생성 미구현 | 배경 프롬프트는 생성되지만 실제 DALL-E 호출은 아직 없음 |
| 카피 언어 제한 | OpenAI가 한국어 카피를 생성하지만 품질은 영어보다 낮을 수 있음 |
| 에셋 다운로드 일괄 기능 | "Download All" 버튼은 UI만 있고 기능 미구현 |
| 멀티 브랜드 | 현재 단일 브랜드로 운영, 멀티 브랜드 전환 UI 미구현 |
| 실시간 미리보기 | 생성 전 미리보기 불가 (생성 후 확인) |
| 에셋 편집 | 생성된 에셋의 텍스트/레이아웃 수동 편집 불가 |

## 19. 향후 확장 포인트

1. **배경 이미지 AI 생성**: DALL-E / Midjourney API 연동으로 실제 배경 이미지 생성
2. **Make.com 퍼블리싱**: 승인된 에셋을 Meta/LinkedIn에 자동 게시
3. **A/B 테스트**: 카피 변형별 성과 비교
4. **승인 워크플로우**: 역할 기반 다단계 승인 흐름
5. **커스텀 템플릿 빌더**: 드래그앤드롭 템플릿 편집기
6. **다국어 카피**: 한/영/일 동시 생성
7. **성과 분석**: 플랫폼 API 연동으로 에셋별 성과 추적
8. **벌크 캠페인**: CSV/스프레드시트에서 대량 캠페인 생성

---

## 용어 사전

| 용어 | 설명 |
|------|------|
| **캠페인 (Campaign)** | 하나의 제품/프로모션에 대한 광고 생성 단위 |
| **카피 변형 (Copy Variant)** | 같은 캠페인의 다른 버전 카피 (헤드라인, 서브카피, CTA) |
| **크리에이티브 에셋 (Creative Asset)** | 최종 렌더링된 PNG 이미지 파일 |
| **플랫폼 프리셋 (Platform Preset)** | 특정 광고 플랫폼의 사이즈/레이아웃 규칙 |
| **카테고리 룰 (Category Rule)** | 업종별 키워드, 톤, 카피 규칙, 시각적 방향 |
| **템플릿 (Template)** | 에셋 렌더링에 사용되는 레이아웃/스타일 정의 |
| **폴백 (Fallback)** | OpenAI 실패 시 자동으로 사용되는 결정적 카피 생성 |
| **웹훅 (Webhook)** | HTTP POST로 외부 시스템에 이벤트를 전달하는 메커니즘 |

## 이 프로젝트의 진화 과정

1. **로컬 MVP** (Week 1): Next.js 프로젝트 설정, 기본 API 구조, Satori 렌더링 검증
2. **렌더링 검증** (Week 1-2): 폰트 로딩 디버깅 (변수 폰트 → WOFF), 한국어 지원, 텍스트 피팅 알고리즘
3. **DB 통합** (Week 2): embedded-postgres 로컬 DB, Prisma 스키마, 시드 데이터
4. **파이프라인 완성** (Week 2): E2E 파이프라인 검증 (테스트 하네스 → 실제 API)
5. **프로덕션 준비** (Week 3): OpenAI 통합, 에셋 상태 플로우, 재생성 기능, 웹훅
6. **배포** (Week 3): Supabase DB/Storage 연동, Vercel 배포, 프로덕션 검증 (9/9 테스트 통과)
