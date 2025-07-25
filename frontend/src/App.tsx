import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { fetchMeds, createMed, updateMed, deleteMed, Med } from "./api";

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
        </nav>
      </header>

      <main style={{ padding: 20 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-med" element={<AddMedication />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
