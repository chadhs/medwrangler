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
  frequency: number;
  startTime: string;
  days: number[];
}

export interface TakenDose {
  id: string;
  scheduleId: string;
  doseTime: string;
  takenAt: string;
}

export const fetchSchedules = async (): Promise<ScheduleItem[]> => {
  const r = await fetch(`${API}/schedules`);
  if (!r.ok) throw new Error("Fetch schedules failed");
  return r.json();
};

export const createSchedule = async (
  medId: string,
  frequency: number,
  days: number[],
): Promise<ScheduleItem> => {
  const r = await fetch(`${API}/schedules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ medId, frequency, days }),
  });
  if (!r.ok) throw new Error("Create schedule failed");
  return r.json();
};

export const updateSchedule = async (
  id: string,
  medId: string,
  frequency: number,
  days: number[],
): Promise<ScheduleItem> => {
  const r = await fetch(`${API}/schedules/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ medId, frequency, days }),
  });
  if (!r.ok) throw new Error("Update schedule failed");
  return r.json();
};

export const deleteSchedule = async (id: string): Promise<void> => {
  const r = await fetch(`${API}/schedules/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("Delete schedule failed");
};

export const fetchTaken = async (): Promise<TakenDose[]> => {
  const r = await fetch(`${API}/taken`);
  if (!r.ok) throw new Error("Fetch taken failed");
  return r.json();
};

export const createTaken = async (
  scheduleId: string,
  doseTime: string,
): Promise<TakenDose> => {
  const r = await fetch(`${API}/taken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scheduleId, doseTime }),
  });
  if (!r.ok) throw new Error("Create taken failed");
  return r.json();
};

export const deleteTaken = async (id: string): Promise<void> => {
  const r = await fetch(`${API}/taken/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("Delete taken failed");
};
