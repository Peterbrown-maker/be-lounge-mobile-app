// In-app notifications (prototype: no push). Announcements are seeded from events and
// specials; "Remind me" on an event adds a confirmation now and a "Tonight" alert when the
// app is opened on the event day. Read state and reminders persist in AsyncStorage.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { MACNOSE_EVENTS, formatEventWhen, isTonight } from "../data/macnoseEvents";

export type NotificationKind = "order" | "delivery" | "event" | "deal";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  createdAt: number; // epoch ms
  /** Event to open when tapped. */
  eventId?: string;
  /** Menu category to open when tapped. */
  categoryId?: string;
}

const KEY_READ = "notifications:read";
const KEY_EXTRA = "notifications:extra";
const KEY_REMINDERS = "events:reminders";

const at = (iso: string) => new Date(iso).getTime();

// Announcements Be Lounge would send (prototype content).
const SEED: AppNotification[] = [
  {
    id: "welcome",
    kind: "event",
    title: "Welcome to Be Lounge",
    message: "Good food takes time to prepare. Good memories are made here. Book a table and come through.",
    createdAt: at("2026-11-01T10:00:00+02:00"),
  },
  ...MACNOSE_EVENTS.map((e, i) => ({
    id: `announce-${e.id}`,
    kind: "event" as const,
    title: `${e.artist} live at Be Lounge`,
    message: `${e.title}: ${formatEventWhen(e)}. Tap to see details and book your table.`,
    createdAt: at("2026-11-10T12:00:00+02:00") + i * 3600 * 1000,
    eventId: e.id,
  })),
  {
    id: "deal-midweek",
    kind: "deal",
    title: "Midweek specials are on",
    message: "Tue–Thu: full chicken, fries & 2L Coke R160, or a large pizza & 6 KIX R250.",
    createdAt: at("2026-11-11T09:00:00+02:00"),
    categoryId: "specials",
  },
];

// ----- tiny shared store -----

let readIds = new Set<string>();
let extra: AppNotification[] = [];
let reminders = new Set<string>();
let loaded = false;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

const persist = () => {
  AsyncStorage.multiSet([
    [KEY_READ, JSON.stringify([...readIds])],
    [KEY_EXTRA, JSON.stringify(extra)],
    [KEY_REMINDERS, JSON.stringify([...reminders])],
  ]).catch(() => {});
};

const addOnce = (n: AppNotification) => {
  if (extra.some((x) => x.id === n.id)) return false;
  extra = [n, ...extra];
  return true;
};

function ensureLoaded() {
  if (loaded) return Promise.resolve();
  if (!loading) {
    loading = AsyncStorage.multiGet([KEY_READ, KEY_EXTRA, KEY_REMINDERS])
      .then((rows) => {
        const get = (k: string) => rows.find(([key]) => key === k)?.[1];
        readIds = new Set(JSON.parse(get(KEY_READ) || "[]"));
        extra = JSON.parse(get(KEY_EXTRA) || "[]");
        reminders = new Set(JSON.parse(get(KEY_REMINDERS) || "[]"));
      })
      .catch(() => {})
      .finally(() => {
        // Day-of alert for events the user asked to be reminded about.
        let changed = false;
        for (const e of MACNOSE_EVENTS) {
          if (reminders.has(e.id) && isTonight(e)) {
            changed =
              addOnce({
                id: `tonight-${e.id}`,
                kind: "event",
                title: `Tonight: ${e.artist} at Be Lounge`,
                message: `${e.title} starts at ${e.startTime}. See you at Be Lounge!`,
                createdAt: Date.now(),
                eventId: e.id,
              }) || changed;
          }
        }
        if (changed) persist();
        loaded = true;
        emit();
      });
  }
  return loading;
}

function snapshot() {
  const now = Date.now();
  const items = [...extra, ...SEED.filter((n) => n.createdAt <= now)]
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((n) => ({ ...n, read: readIds.has(n.id) }));
  return { items, unread: items.filter((n) => !n.read).length };
}

function useStore<T>(select: () => T): T {
  const [value, setValue] = useState(select);
  useEffect(() => {
    const update = () => setValue(select());
    listeners.add(update);
    ensureLoaded().then(update);
    return () => {
      listeners.delete(update);
    };
  }, []);
  return value;
}

// ----- public API -----

export function useNotifications() {
  const { items, unread } = useStore(snapshot);
  return {
    items,
    unread,
    markRead: (id: string) => {
      if (readIds.has(id)) return;
      readIds = new Set(readIds).add(id);
      persist();
      emit();
    },
    markAllRead: () => {
      readIds = new Set([...readIds, ...items.map((n) => n.id)]);
      persist();
      emit();
    },
  };
}

/** [isOn, toggle] for an event's "Remind me" button. */
export function useEventReminder(eventId: string): [boolean, () => void] {
  const on = useStore(() => reminders.has(eventId));
  const toggle = () => {
    const e = MACNOSE_EVENTS.find((x) => x.id === eventId);
    if (!e) return;
    reminders = new Set(reminders);
    if (reminders.has(eventId)) {
      reminders.delete(eventId);
    } else {
      reminders.add(eventId);
      // Fresh id each time so re-enabling shows a new confirmation.
      addOnce({
        id: `reminder-${eventId}-${Date.now()}`,
        kind: "event",
        title: `Reminder set: ${e.artist}`,
        message: `We'll remind you on ${formatEventWhen(e)}. ${e.title} at Be Lounge.`,
        createdAt: Date.now(),
        eventId,
      });
    }
    persist();
    emit();
  };
  return [on, toggle];
}

/** "just now", "5 min ago", "3 h ago", "2 days ago" */
export function timeAgo(ms: number, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - ms) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}
