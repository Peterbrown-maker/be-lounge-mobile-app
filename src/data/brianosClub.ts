// Briano's is a club + shisanyama, not just a kitchen. Prototype content for the
// venue side of the app (hours, weekly line-up). Swap in real details when known.

/** 0 = Sunday … 6 = Saturday. Times are 24h; a close <= open means past midnight. */
export const OPENING_HOURS: Record<number, { open: number; close: number }> = {
  0: { open: 11, close: 24 },
  1: { open: 11, close: 23 },
  2: { open: 11, close: 23 },
  3: { open: 11, close: 23 },
  4: { open: 11, close: 24 },
  5: { open: 11, close: 2 },
  6: { open: 11, close: 2 },
};

const fmt = (h: number) => `${String(h % 24).padStart(2, '0')}:00`;

/** Whether the venue is open right now, and a short status line. */
export function venueStatus(now = new Date()): { open: boolean; label: string } {
  const day = now.getDay();
  const hour = now.getHours() + now.getMinutes() / 60;

  // Still in last night's late session?
  const prev = OPENING_HOURS[(day + 6) % 7];
  if (prev.close < prev.open && hour < prev.close) {
    return { open: true, label: `Fire's lit till ${fmt(prev.close)}` };
  }

  const today = OPENING_HOURS[day];
  const closesAfterMidnight = today.close <= today.open || today.close === 24;
  if (hour >= today.open && (closesAfterMidnight || hour < today.close)) {
    return { open: true, label: `Fire's lit till ${fmt(today.close)}` };
  }
  if (hour < today.open) return { open: false, label: `Opens today at ${fmt(today.open)}` };
  return { open: false, label: `Opens tomorrow at ${fmt(OPENING_HOURS[(day + 1) % 7].open)}` };
}

export interface ClubEvent {
  id: string;
  day: number; // 0-6
  dayLabel: string;
  title: string;
  vibe: string;
  time: string;
  image: any;
}

export const WEEKLY_LINEUP: ClubEvent[] = [
  {
    id: 'wed',
    day: 3,
    dayLabel: 'WED',
    title: 'Wings & Wheels',
    vibe: 'Wing specials · car-wash beats',
    time: 'From 16:00',
    image: require('../assets/brianos/wings_and_sausage.jpg'),
  },
  {
    id: 'fri',
    day: 5,
    dayLabel: 'FRI',
    title: 'Amapiano Fridays',
    vibe: 'Resident DJs · log drum all night',
    time: '20:00 – late',
    image: require('../assets/brianos/cocktails.jpg'),
  },
  {
    id: 'sat',
    day: 6,
    dayLabel: 'SAT',
    title: 'Shisa & Groove',
    vibe: 'Braai by day · deep house by night',
    time: '14:00 – 02:00',
    image: require('../assets/brianos/mixed_grill_platter.jpg'),
  },
  {
    id: 'sun',
    day: 0,
    dayLabel: 'SUN',
    title: 'Sunday Chill Sessions',
    vibe: 'Live band · jazz · sundowners',
    time: '13:00 – 22:00',
    image: require('../assets/brianos/hero_feast.jpg'),
  },
];
