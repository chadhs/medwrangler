import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import {
  fetchMeds,
  createMed,
  updateMed,
  deleteMed,
  fetchSchedules,
  createSchedule,
  deleteSchedule,
  fetchTaken,
  createTaken,
  deleteTaken,
  Med,
  ScheduleItem,
  TakenDose,
} from "./api";

function Home() {
  const [meds, setMeds] = useState<Med[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [taken, setTaken] = useState<TakenDose[]>([]);

  useEffect(() => {
    fetchMeds().then(setMeds);
    fetchSchedules().then(setSchedules);
    fetchTaken().then(setTaken);
  }, []);

  const now = new Date();
  const horizon = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const upcoming: {
    medName: string;
    time: Date;
    scheduleId: string;
    doseTime: string;
  }[] = [];

  schedules.forEach((s) => {
    const med = meds.find((m) => m.id === s.medId);
    if (!med) return;
    const freqMs = s.frequency * 60 * 60 * 1000;
    let t = new Date(s.startTime);
    if (t < now) {
      const diff = now.getTime() - t.getTime();
      const skips = Math.floor(diff / freqMs);
      t = new Date(t.getTime() + skips * freqMs);
      if (t < now) {
        t = new Date(t.getTime() + freqMs);
      }
    }
    while (t <= horizon) {
      upcoming.push({
        medName: med.name,
        time: new Date(t),
        scheduleId: s.id,
        doseTime: t.toISOString(),
      });
      t = new Date(t.getTime() + freqMs);
    }
  });
  upcoming.sort((a, b) => a.time.getTime() - b.time.getTime());

  return (
    <section>
      <p>
        MedWrangler helps you manage your medications easily. Track, edit, and
        delete your medications all in one place.
      </p>

      <h2>Upcoming Doses (Next 24h)</h2>
      {upcoming.length === 0 ? (
        <p>No doses scheduled in the next 24 hours.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {upcoming.map((u) => {
            const takenEntry = taken.find(
              (t) => t.scheduleId === u.scheduleId && t.doseTime === u.doseTime,
            );
            return (
              <li key={`${u.scheduleId}-${u.doseTime}`}>
                <label>
                  <input
                    type="checkbox"
                    checked={!!takenEntry}
                    onChange={async (e) => {
                      if (e.target.checked) {
                        const newEntry = await createTaken(
                          u.scheduleId,
                          u.doseTime,
                        );
                        setTaken([...taken, newEntry]);
                      } else if (takenEntry) {
                        await deleteTaken(takenEntry.id);
                        setTaken(taken.filter((t) => t.id !== takenEntry.id));
                      }
                    }}
                  />
                  {u.medName} @{" "}
                  {u.time.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function AddMedication() {
  const [text, setText] = useState("");
  const [meds, setMeds] = useState<Med[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetchMeds().then(setMeds);
  }, []);

  const add = async () => {
    if (!text) return;
    const m = await createMed(text);
    setMeds([...meds, m]);
    setText("");
  };

  const save = async (id: string) => {
    const m = await updateMed(id, editText);
    setMeds(meds.map((x) => (x.id === id ? m : x)));
    setEditId(null);
  };

  const remove = async (id: string) => {
    await deleteMed(id);
    setMeds(meds.filter((x) => x.id !== id));
  };

  return (
    <section>
      <h2>Add Medication</h2>

      <div>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="New medication name"
        />
        <button onClick={add}>Add</button>
      </div>

      <h2>Your Medications</h2>
      <ul>
        {meds.map((m) => (
          <li key={m.id}>
            {editId === m.id ? (
              <>
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <button onClick={() => save(m.id)}>Save</button>
                <button onClick={() => setEditId(null)}>Cancel</button>
              </>
            ) : (
              <>
                {m.name}{" "}
                <button
                  onClick={() => {
                    setEditId(m.id);
                    setEditText(m.name);
                  }}
                >
                  Edit
                </button>{" "}
                <button onClick={() => remove(m.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Schedule() {
  const [meds, setMeds] = useState<Med[]>([]);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [selectedMedId, setSelectedMedId] = useState<string>("");
  const [frequency, setFrequency] = useState<number>(8);
  const [days, setDays] = useState<number[]>([]);

  useEffect(() => {
    fetchMeds().then(setMeds);
    fetchSchedules().then(setScheduleItems);
  }, []);

  const addScheduleItem = async () => {
    if (!selectedMedId || frequency <= 0 || days.length === 0) return;
    const item = await createSchedule(selectedMedId, frequency, days);
    setScheduleItems([...scheduleItems, item]);
    setSelectedMedId("");
    setFrequency(0);
    setDays([]);
  };

  return (
    <section>
      <h2>Schedule</h2>

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <label>
            Medication:
            <select
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(e.target.value)}
            >
              <option value="">-- Select --</option>
              {meds.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Frequency:
            <select
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
            >
              <option value="">-- Select --</option>
              {[4, 6, 8, 12, 24].map((f) => (
                <option key={f} value={f}>
                  Every {f}h
                </option>
              ))}
            </select>
          </label>

          <div>
            Days:
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, idx) => (
              <label key={d} style={{ marginLeft: 8 }}>
                <input
                  type="checkbox"
                  value={idx}
                  checked={days.includes(idx)}
                  onChange={() => {
                    setDays(
                      days.includes(idx)
                        ? days.filter((x) => x !== idx)
                        : [...days, idx],
                    );
                  }}
                />
                {d}
              </label>
            ))}
          </div>

          <button onClick={addScheduleItem}>Add Schedule</button>
        </div>
      </div>

      {scheduleItems.length > 0 && (
        <>
          <h3>Your Schedule</h3>
          <table>
            <thead>
              <tr>
                <th>Medication</th>
                <th>Frequency</th>
                <th>Days</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {scheduleItems.map((item) => {
                const med = meds.find((m) => m.id === item.medId);
                const dayNames = [
                  "Sun",
                  "Mon",
                  "Tue",
                  "Wed",
                  "Thu",
                  "Fri",
                  "Sat",
                ];
                const daysList = item.days.map((d) => dayNames[d]).join(", ");
                return (
                  <tr key={item.id}>
                    <td>{med?.name || item.medId}</td>
                    <td>Every {item.frequency}h</td>
                    <td>{daysList}</td>
                    <td>
                      <button
                        onClick={async () => {
                          await deleteSchedule(item.id);
                          setScheduleItems(
                            scheduleItems.filter((i) => i.id !== item.id),
                          );
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <header>
        <h1>
          <Link to="/">MedWrangler</Link>
        </h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/add-med">Add Medication</Link>
          <Link to="/schedule">Schedule</Link>
        </nav>
      </header>

      <main style={{ padding: 20 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-med" element={<AddMedication />} />
          <Route path="/schedule" element={<Schedule />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
