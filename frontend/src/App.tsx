import { useEffect, useState } from 'react';
import { fetchMeds, createMed, updateMed, deleteMed, Med } from './api';

export function App() {
  const [meds, setMeds] = useState<Med[]>([]);
  const [text, setText] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchMeds().then(setMeds);
  }, []);

  const add = async () => {
    if (!text) return;
    const m = await createMed(text);
    setMeds([...meds, m]);
    setText('');
  };

  const save = async (id: string) => {
    const m = await updateMed(id, editText);
    setMeds(meds.map(x => (x.id === id ? m : x)));
    setEditId(null);
  };

  const remove = async (id: string) => {
    await deleteMed(id);
    setMeds(meds.filter(x => x.id !== id));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>MedWrangler</h1>
      <input value={text} onChange={e => setText(e.target.value)} placeholder="New med" />
      <button onClick={add}>Add</button>
      <ul>
        {meds.map(m => (
          <li key={m.id}>
            {editId === m.id ? (
              <>
                <input value={editText} onChange={e => setEditText(e.target.value)} />
                <button onClick={() => save(m.id)}>Save</button>
                <button onClick={() => setEditId(null)}>Cancel</button>
              </>
            ) : (
              <>
                {m.name}{' '}
                <button onClick={() => { setEditId(m.id); setEditText(m.name); }}>
                  Edit
                </button>{' '}
                <button onClick={() => remove(m.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
