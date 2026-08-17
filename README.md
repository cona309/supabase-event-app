# Supabase Event App

[![CI](https://github.com/cona309/supabase-event-app/actions/workflows/ci.yml/badge.svg)](https://github.com/cona309/supabase-event-app/actions/workflows/ci.yml)

Supabase를 이용해 이벤트(`events` 테이블)를 관리하는 TypeScript 프로젝트입니다.
Supabase 연결 정보가 없거나 연결에 실패해도 인메모리 Mock 저장소로 자동 전환되어
CRUD 로직을 항상 끝까지 검증할 수 있습니다.

## 설치

```sh
npm install
```

`@supabase/supabase-js`, `dotenv`, `typescript`, `@types/node`, `tsx`가 함께 설치됩니다.

## .env 설정

`.env.example`을 복사해 `.env`를 만들고 실제 Supabase 프로젝트 정보를 채웁니다. `.env`는
`.gitignore`에 포함되어 있어 커밋되지 않습니다.

```sh
cp .env.example .env
```

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`: Supabase 대시보드의 Project Settings → API에서
  확인할 수 있는 Project URL과 anon public key
- `SUPABASE_SERVICE_ROLE_KEY`: 서버 전용 관리자 키(현재 코드에서는 사용하지 않으며,
  추후 관리자 권한이 필요한 작업을 위해 예약된 값)
- `events` 테이블에는 `id`(uuid, PK), `title`(text), `date`(text), `location`(text),
  `max_attendees`(int4) 컬럼이 있어야 실제 연동 시 정상 동작합니다.

`SUPABASE_URL` 또는 `SUPABASE_ANON_KEY`가 비어 있으면 모든 기능이 **Mock 모드**로
동작합니다.

## 실행 방법

### 연결 상태 확인 — `src/index.ts`

```sh
npx tsx src/index.ts
```

`.env`가 설정되어 있으면 Supabase REST 엔드포인트(`/rest/v1/`)에 실제 요청을 보내
연결 가능 여부를 확인합니다. 설정이 없거나 요청이 실패하면 그 이유를 콘솔에 출력합니다.

### Events CRUD 모의 테스트 — `src/events.ts`

```sh
npx tsx src/events.ts
```

`getEvents`/`createEvent`/`updateEvent`/`deleteEvent`를 **등록 → 조회 → 수정 → 삭제**
순서로 순차 실행하며 각 단계의 결과를 콘솔에 출력합니다.

**Mock 폴백 동작 방식**: 각 CRUD 함수는 우선 실제 Supabase `events` 테이블에 요청을
시도합니다. `SUPABASE_URL`/`SUPABASE_ANON_KEY`가 없거나, 있어도 요청이 실패(네트워크
오류, 잘못된 자격증명, 테이블 없음 등)하면 그 즉시 내부 메모리 배열(In-memory Mock
Store)로 전환됩니다. 한 번 전환되면 이후 호출도 계속 메모리 저장소를 사용해, 일부는
실제 DB에 일부는 메모리에 남는 상태 불일치를 방지합니다. 즉, Supabase 프로젝트를
따로 준비하지 않아도 `npx tsx src/events.ts` 한 번으로 CRUD 로직 전체가 정상 동작하는지
검증할 수 있습니다.

실행 예시(Mock 모드일 때):

```
=== Events CRUD 테스트 ===

[1] 등록 (createEvent)
[Mock 폴백] createEvent 실패, 메모리 저장소로 전환: TypeError: fetch failed
{ id: '...', title: 'AI 자동화 세미나', date: '2026-09-01', location: '서울', max_attendees: 50 }

[2] 조회 (getEvents)
[ { id: '...', ... } ]

[3] 수정 (updateEvent)
{ id: '...', ..., max_attendees: 80 }

[4] 삭제 (deleteEvent)
삭제 후 남은 이벤트 수: 0
```
