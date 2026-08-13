import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Lightbox from "../components/Lightbox";
import { ENTRIES, type ArchiveEntry } from "../data/archive";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

function monthLabel(year: number, monthIndex: number) {
  return new Date(year, monthIndex, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function formatDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ArchiveContent() {
  const [selected, setSelected] = useState<ArchiveEntry | null>(null);

  const byMonth = useMemo(() => {
    const map = new Map<string, ArchiveEntry[]>();
    for (const entry of ENTRIES) {
      const [y, m] = entry.date.split("-").map(Number);
      const key = `${y}-${String(m).padStart(2, "0")}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, []);

  return (
    <>
      <div>
        {byMonth.map(([key, entries]) => {
          const [year, month] = key.split("-").map(Number);
          const firstDow = new Date(year, month - 1, 1).getDay();
          const daysInMonth = new Date(year, month, 0).getDate();
          const entryByDay = new Map(entries.map((e) => [Number(e.date.split("-")[2]), e]));

          return (
            <div className="month-block" key={key}>
              <div className="month-title">{monthLabel(year, month - 1)}</div>
              <div className="cal-grid">
                {DOW.map((d, i) => (
                  <div className="cal-dow" key={i}>
                    {d}
                  </div>
                ))}
                {Array.from({ length: firstDow }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const entry = entryByDay.get(day);
                  return (
                    <div
                      key={day}
                      className={`cal-cell${entry ? " has-entry" : ""}`}
                      onClick={() => entry && setSelected(entry)}
                      title={entry?.title}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <AnimatePresence>
        {selected && (
          <Lightbox
            title={selected.title}
            subtitle={formatDate(selected.date)}
            description={selected.description}
            image={selected.image}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
