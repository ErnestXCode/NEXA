import { openDB } from 'idb';

export const dbPromise = openDB('nexa-db', 1, {
  upgrade(db) {
    db.createObjectStore('attendance', { keyPath: 'id', autoIncrement: true });
  },
});

export async function saveAttendanceLocally(attendanceRecord) {
  const db = await dbPromise;
  await db.add('attendance', { ...attendanceRecord, synced: false });
}

export async function getAllAttendanceRecords() {
  const db = await dbPromise;
  return await db.getAll('attendance');
}

export async function deleteAttendanceRecord(id) {
  const db = await dbPromise;
  await db.delete('attendance', id);
}
