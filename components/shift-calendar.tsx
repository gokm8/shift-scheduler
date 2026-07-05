"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  Views,
  type View,
  type SlotInfo,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { da } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ROLE_COLORS, ROLE_LABELS } from "@/lib/roles";
import type { ShiftDto } from "@/lib/types";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { da },
});

const messages = {
  today: "I dag",
  previous: "Forrige",
  next: "Næste",
  month: "Måned",
  week: "Uge",
  day: "Dag",
  agenda: "Liste",
  date: "Dato",
  time: "Tid",
  event: "Vagt",
  allDay: "Hele dagen",
  noEventsInRange: "Ingen vagter i denne periode.",
  showMore: (count: number) => `+${count} flere`,
};

export type ShiftEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  shift: ShiftDto;
};

export function shiftTitle(shift: ShiftDto) {
  return shift.employee
    ? `${ROLE_LABELS[shift.role]} — ${shift.employee.name}`
    : `Utildelt · ${ROLE_LABELS[shift.role]}`;
}

type ShiftCalendarProps = {
  shifts: ShiftDto[];
  onSelectShift?: (shift: ShiftDto) => void;
  onSelectSlot?: (slot: { start: Date; end: Date }) => void;
};

export function ShiftCalendar({
  shifts,
  onSelectShift,
  onSelectSlot,
}: ShiftCalendarProps) {
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());

  const events = useMemo<ShiftEvent[]>(
    () =>
      shifts.map((shift) => ({
        id: shift.id,
        title: shiftTitle(shift),
        start: new Date(shift.startsAt),
        end: new Date(shift.endsAt),
        shift,
      })),
    [shifts]
  );

  return (
    <div className="h-[70vh] rounded-xl border bg-background p-3">
      <Calendar<ShiftEvent>
        localizer={localizer}
        culture="da"
        messages={messages}
        events={events}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        scrollToTime={new Date(1970, 0, 1, 7)}
        selectable={Boolean(onSelectSlot)}
        onSelectEvent={(event) => onSelectShift?.(event.shift)}
        onSelectSlot={(slot: SlotInfo) =>
          onSelectSlot?.({ start: slot.start, end: slot.end })
        }
        eventPropGetter={(event) => ({
          style: event.shift.employee
            ? {
                backgroundColor: ROLE_COLORS[event.shift.role],
                borderColor: "transparent",
              }
            : {
                backgroundColor: "#f4f4f5",
                color: "#52525b",
                border: "1.5px dashed #a1a1aa",
              },
        })}
        formats={{
          timeGutterFormat: "HH:mm",
          eventTimeRangeFormat: ({ start, end }) =>
            `${format(start, "HH:mm")}–${format(end, "HH:mm")}`,
          dayHeaderFormat: (d) => format(d, "EEEE d. MMMM", { locale: da }),
          dayRangeHeaderFormat: ({ start, end }) =>
            `${format(start, "d. MMM", { locale: da })} – ${format(end, "d. MMM yyyy", { locale: da })}`,
        }}
      />
    </div>
  );
}
