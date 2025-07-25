import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import {
  fetchMeds,
  createMed,
  updateMed,
  deleteMed,
  fetchSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  fetchTaken,
  createTaken,
  deleteTaken,
  Med,
  ScheduleItem,
  TakenDose,
} from "./api";
import { ModernNavBar } from "./components/ModernNavBar";
import { DoseCard } from "./components/DoseCard";
import { TimeSection } from "./components/TimeSection";
import { StatusIndicator } from "./components/StatusIndicator";

function Home() {
  const [meds, setMeds] = useState<Med[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [taken, setTaken] = useState<TakenDose[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "warning" | "info">(
    "success",
  );

  useEffect(() => {
    fetchMeds().then(setMeds);
    fetchSchedules().then(setSchedules);
    fetchTaken().then(setTaken);
  }, []);

  const showStatus = (
    message: string,
    type: "success" | "warning" | "info" = "success",
  ) => {
    setStatusMessage(message);
    setStatusType(type);
    setTimeout(() => setStatusMessage(null), 3000);
  };

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

  // Group doses by time periods
  const overdueDoses = upcoming.filter((u) => u.time < now);
  const nowDoses = upcoming.filter((u) => {
    const diffMs = u.time.getTime() - now.getTime();
    return diffMs >= 0 && diffMs <= 15 * 60 * 1000; // Within 15 minutes
  });
  const todayDoses = upcoming.filter((u) => {
    const diffMs = u.time.getTime() - now.getTime();
    return (
      diffMs > 15 * 60 * 1000 && u.time.toDateString() === now.toDateString()
    );
  });
  const tomorrowDoses = upcoming.filter((u) => {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return u.time.toDateString() === tomorrow.toDateString();
  });

  const handleDoseToggle = async (
    scheduleId: string,
    doseTime: string,
    newTakenState: boolean,
  ) => {
    try {
      if (newTakenState) {
        const newEntry = await createTaken(scheduleId, doseTime);
        setTaken([...taken, newEntry]);
        showStatus("Dose marked as taken! 💊", "success");
      } else {
        const takenEntry = taken.find(
          (t) => t.scheduleId === scheduleId && t.doseTime === doseTime,
        );
        if (takenEntry) {
          await deleteTaken(takenEntry.id);
          setTaken(taken.filter((t) => t.id !== takenEntry.id));
          showStatus("Dose unmarked", "info");
        }
      }
    } catch (error) {
      showStatus("Failed to update dose status", "warning");
    }
  };

  const renderDoseSection = (
    doses: typeof upcoming,
    isOverdue: boolean = false,
  ) => {
    return doses.map((u) => {
      const takenEntry = taken.find(
        (t) => t.scheduleId === u.scheduleId && t.doseTime === u.doseTime,
      );

      return (
        <DoseCard
          key={`${u.scheduleId}-${u.doseTime}`}
          medName={u.medName}
          time={u.time}
          isTaken={!!takenEntry}
          isOverdue={isOverdue}
          onToggle={(taken) =>
            handleDoseToggle(u.scheduleId, u.doseTime, taken)
          }
        />
      );
    });
  };

  return (
    <section className="home-section">
      {statusMessage && (
        <StatusIndicator
          type={statusType}
          message={statusMessage}
          onDismiss={() => setStatusMessage(null)}
        />
      )}

      <div className="welcome-section">
        <h2>Welcome to MedWrangler</h2>
        <p>
          Stay on top of your medication schedule with our easy-to-use tracking
          system.
        </p>
      </div>

      {upcoming.length === 0 ? (
        <div className="empty-state">
          <h3>No doses scheduled</h3>
          <p>
            Get started by <Link to="/add-med">adding medications</Link> and
            setting up your <Link to="/schedule">dosing schedule</Link>.
          </p>
        </div>
      ) : (
        <div className="doses-container">
          <TimeSection title="⚠️ Overdue" count={overdueDoses.length}>
            {renderDoseSection(overdueDoses, true)}
          </TimeSection>

          <TimeSection title="🔔 Due Now" count={nowDoses.length}>
            {renderDoseSection(nowDoses)}
          </TimeSection>

          <TimeSection title="📅 Later Today" count={todayDoses.length}>
            {renderDoseSection(todayDoses)}
          </TimeSection>

          <TimeSection title="➡️ Tomorrow" count={tomorrowDoses.length}>
            {renderDoseSection(tomorrowDoses)}
          </TimeSection>
        </div>
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
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchMeds().then(setMeds);
    fetchSchedules().then(setScheduleItems);
  }, []);

  const addScheduleItem = async () => {
    if (!selectedMedId || frequency <= 0 || days.length === 0) return;
    if (editId) {
      const updated = await updateSchedule(
        editId,
        selectedMedId,
        frequency,
        days,
      );
      setScheduleItems(
        scheduleItems.map((s) => (s.id === editId ? updated : s)),
      );
      setEditId(null);
    } else {
      const item = await createSchedule(selectedMedId, frequency, days);
      setScheduleItems([...scheduleItems, item]);
    }
    setSelectedMedId("");
    setFrequency(8);
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

          <button onClick={addScheduleItem}>
            {editId ? "Save Changes" : "Add Schedule"}
          </button>
          {editId && (
            <button
              onClick={() => {
                setEditId(null);
                setSelectedMedId("");
                setFrequency(8);
                setDays([]);
              }}
              style={{ marginLeft: 8 }}
            >
              Cancel
            </button>
          )}
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
                        style={{ marginRight: 8 }}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          setEditId(item.id);
                          setSelectedMedId(item.medId);
                          setFrequency(item.frequency);
                          setDays(item.days);
                        }}
                      >
                        Edit
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
      <ModernNavBar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-med" element={<AddMedication />} />
          <Route path="/schedule" element={<Schedule />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
