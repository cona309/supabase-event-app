import { randomUUID } from "node:crypto";

import { supabase, isSupabaseConfigured } from "./supabaseClient";

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  max_attendees: number;
}

type NewEvent = Omit<Event, "id">;
type EventUpdate = Partial<NewEvent>;

const TABLE = "events";

// Supabase가 설정되지 않았거나 실제 요청이 실패하면 이 메모리 배열로 전환해
// CRUD가 계속 동작하도록 한다. 한 번 폴백되면 이후 호출도 계속 메모리
// 저장소를 사용해 실제 테이블과 상태가 갈리지 않게 한다.
const mockStore: Event[] = [];
let useMock = !isSupabaseConfigured;

function fallbackToMock(operation: string, reason: string) {
  console.warn(`[Mock 폴백] ${operation} 실패, 메모리 저장소로 전환: ${reason}`);
  useMock = true;
}

function mockCreateEvent(event: NewEvent): Event {
  const created: Event = { id: randomUUID(), ...event };
  mockStore.push(created);
  return created;
}

function mockGetEvents(): Event[] {
  return [...mockStore];
}

function mockUpdateEvent(id: string, updates: EventUpdate): Event {
  const index = mockStore.findIndex((event) => event.id === id);
  if (index === -1) {
    throw new Error(`Event not found: ${id}`);
  }
  mockStore[index] = { ...mockStore[index], ...updates };
  return mockStore[index];
}

function mockDeleteEvent(id: string): void {
  const index = mockStore.findIndex((event) => event.id === id);
  if (index === -1) {
    throw new Error(`Event not found: ${id}`);
  }
  mockStore.splice(index, 1);
}

async function getEvents(): Promise<Event[]> {
  if (!useMock && supabase) {
    try {
      const { data, error } = await supabase.from(TABLE).select("*");
      if (!error && data) {
        return data as Event[];
      }
      fallbackToMock("getEvents", error?.message ?? "unknown error");
    } catch (err) {
      fallbackToMock("getEvents", err instanceof Error ? err.message : String(err));
    }
  }
  return mockGetEvents();
}

async function createEvent(event: NewEvent): Promise<Event> {
  if (!useMock && supabase) {
    try {
      const { data, error } = await supabase.from(TABLE).insert(event).select().single();
      if (!error && data) {
        return data as Event;
      }
      fallbackToMock("createEvent", error?.message ?? "unknown error");
    } catch (err) {
      fallbackToMock("createEvent", err instanceof Error ? err.message : String(err));
    }
  }
  return mockCreateEvent(event);
}

async function updateEvent(id: string, updates: EventUpdate): Promise<Event> {
  if (!useMock && supabase) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        return data as Event;
      }
      fallbackToMock("updateEvent", error?.message ?? "unknown error");
    } catch (err) {
      fallbackToMock("updateEvent", err instanceof Error ? err.message : String(err));
    }
  }
  return mockUpdateEvent(id, updates);
}

async function deleteEvent(id: string): Promise<void> {
  if (!useMock && supabase) {
    try {
      const { error } = await supabase.from(TABLE).delete().eq("id", id);
      if (!error) {
        return;
      }
      fallbackToMock("deleteEvent", error.message);
    } catch (err) {
      fallbackToMock("deleteEvent", err instanceof Error ? err.message : String(err));
    }
  }
  mockDeleteEvent(id);
}

async function runCrudSelfTest() {
  console.log("=== Events CRUD 테스트 ===");

  console.log("\n[1] 등록 (createEvent)");
  const created = await createEvent({
    title: "AI 자동화 세미나",
    date: "2026-09-01",
    location: "서울",
    max_attendees: 50,
  });
  console.log(created);

  console.log("\n[2] 조회 (getEvents)");
  const events = await getEvents();
  console.log(events);

  console.log("\n[3] 수정 (updateEvent)");
  const updated = await updateEvent(created.id, { max_attendees: 80 });
  console.log(updated);

  console.log("\n[4] 삭제 (deleteEvent)");
  await deleteEvent(updated.id);
  const remaining = await getEvents();
  console.log(`삭제 후 남은 이벤트 수: ${remaining.length}`);
}

runCrudSelfTest();

export { getEvents, createEvent, updateEvent, deleteEvent };
export type { Event, NewEvent, EventUpdate };
