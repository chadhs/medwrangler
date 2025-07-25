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
  Med,
  ScheduleItem,
} from "./api";

function Home() {
  return (
    <section>
      <p>
        MedWrangler helps you manage your medications easily. Track, edit, and
        delete your medications all in one place.
      </p>
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
  const [frequency, setFrequency] = useState<string>("");

  useEffect(() => {
    fetchMeds().then(setMeds);
    fetchSchedules().then(setScheduleItems);
  }, []);

  const addScheduleItem = async () => {
    if (!selectedMedId || !frequency) return;
    const item = await createSchedule(selectedMedId, frequency);
    setScheduleItems([...scheduleItems, item]);
    setSelectedMedId("");
    setFrequency("");
  };

  return (
    <section>
      <h2>Schedule</h2>

      <div>
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
        <label style={{ marginLeft: 16 }}>
          Frequency:
          <input
            type="text"
            value={frequency}
            placeholder="e.g., every 8 hours"
            onChange={(e) => setFrequency(e.target.value)}
          />
        </label>
        <button onClick={addScheduleItem} style={{ marginLeft: 16 }}>
          Add Schedule
        </button>
      </div>

      {scheduleItems.length > 0 && (
        <>
          <h3>Your Schedule</h3>
          <ul>
            {scheduleItems.map((item) => {
              const med = meds.find((m) => m.id === item.medId);
              return (
                <li key={item.id}>
                  {med?.name || item.medId}: {item.frequency}{" "}
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
                </li>
              );
            })}
          </ul>
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
