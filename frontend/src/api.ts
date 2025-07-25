export interface Med {
  id: string;
  name: string;
}
const API = import.meta.env.VITE_API_URL;

export const fetchMeds = async (): Promise<Med[]> => {
  const r = await fetch(`${API}/meds`);
  if (!r.ok) throw new Error("Fetch failed");
  return r.json();
};

export const createMed = async (name: string): Promise<Med> => {
  const r = await fetch(`${API}/meds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!r.ok) throw new Error("Create failed");
  return r.json();
};

export const updateMed = async (id: string, name: string): Promise<Med> => {
  const r = await fetch(`${API}/meds/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!r.ok) throw new Error("Update failed");
  return r.json();
};

export const deleteMed = async (id: string): Promise<void> => {
  const r = await fetch(`${API}/meds/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("Delete failed");
};

export interface ScheduleItem {
  id: string;
  medId: string;
  frequency: string;
}

export const fetchSchedules = async (): Promise<ScheduleItem[]> => {
  const r = await fetch(`${API}/schedules`);
  if (!r.ok) throw new Error("Fetch schedules failed");
  return r.json();
};

export const createSchedule = async (
  medId: string,
  frequency: string,
): Promise<ScheduleItem> => {
  const r = await fetch(`${API}/schedules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ medId, frequency }),
  });
  if (!r.ok) throw new Error("Create schedule failed");
  return r.json();
};

export const updateSchedule = async (
  id: string,
  medId: string,
  frequency: string,
): Promise<ScheduleItem> => {
  const r = await fetch(`${API}/schedules/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ medId, frequency }),
  });
  if (!r.ok) throw new Error("Update schedule failed");
  return r.json();
};

export const deleteSchedule = async (id: string): Promise<void> => {
  const r = await fetch(`${API}/schedules/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("Delete schedule failed");
};
