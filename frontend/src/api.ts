export interface Med { id: string; name: string; }
const API = import.meta.env.VITE_API_URL;

export const fetchMeds = async (): Promise<Med[]> => {
  const r = await fetch(`${API}/meds`);
  if (!r.ok) throw new Error('Fetch failed');
  return r.json();
};

export const createMed = async (name: string): Promise<Med> => {
  const r = await fetch(`${API}/meds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!r.ok) throw new Error('Create failed');
  return r.json();
};

export const updateMed = async (id: string, name: string): Promise<Med> => {
  const r = await fetch(`${API}/meds/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!r.ok) throw new Error('Update failed');
  return r.json();
};

export const deleteMed = async (id: string): Promise<void> => {
  const r = await fetch(`${API}/meds/${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error('Delete failed');
};
