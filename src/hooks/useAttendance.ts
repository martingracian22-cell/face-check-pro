import { useState, useEffect, useCallback } from 'react';
import { Employee, AttendanceRecord } from '@/types/attendance';

const EMPLOYEES_KEY = 'face-attendance-employees';
const RECORDS_KEY = 'face-attendance-records';

// Helper to serialize/deserialize Float32Array
const serializeEmployee = (emp: Employee) => ({
  ...emp,
  faceDescriptor: emp.faceDescriptor ? Array.from(emp.faceDescriptor) : null,
  registeredAt: emp.registeredAt.toISOString(),
});

const deserializeEmployee = (emp: any): Employee => ({
  ...emp,
  faceDescriptor: emp.faceDescriptor ? new Float32Array(emp.faceDescriptor) : null,
  registeredAt: new Date(emp.registeredAt),
});

const serializeRecord = (record: AttendanceRecord) => ({
  ...record,
  timestamp: record.timestamp.toISOString(),
});

const deserializeRecord = (record: any): AttendanceRecord => ({
  ...record,
  timestamp: new Date(record.timestamp),
});

export const useAttendance = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const storedEmployees = localStorage.getItem(EMPLOYEES_KEY);
    const storedRecords = localStorage.getItem(RECORDS_KEY);

    if (storedEmployees) {
      try {
        const parsed = JSON.parse(storedEmployees);
        setEmployees(parsed.map(deserializeEmployee));
      } catch (e) {
        console.error('Failed to parse employees:', e);
      }
    }

    if (storedRecords) {
      try {
        const parsed = JSON.parse(storedRecords);
        setAttendanceRecords(parsed.map(deserializeRecord));
      } catch (e) {
        console.error('Failed to parse records:', e);
      }
    }
  }, []);

  // Persist employees to localStorage
  useEffect(() => {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees.map(serializeEmployee)));
  }, [employees]);

  // Persist records to localStorage
  useEffect(() => {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(attendanceRecords.map(serializeRecord)));
  }, [attendanceRecords]);

  const registerEmployee = useCallback((
    name: string,
    department: string,
    faceDescriptor: Float32Array | null,
    photoUrl: string
  ) => {
    const newEmployee: Employee = {
      id: crypto.randomUUID(),
      name,
      department,
      faceDescriptor,
      photoUrl,
      registeredAt: new Date(),
    };
    setEmployees(prev => [...prev, newEmployee]);
    return newEmployee;
  }, []);

  const removeEmployee = useCallback((id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    setAttendanceRecords(prev => prev.filter(r => r.employeeId !== id));
  }, []);

  const markAttendance = useCallback((
    employeeId: string,
    employeeName: string,
    confidence: number,
    type: 'check-in' | 'check-out' = 'check-in'
  ) => {
    const record: AttendanceRecord = {
      id: crypto.randomUUID(),
      employeeId,
      employeeName,
      timestamp: new Date(),
      type,
      confidence,
    };
    setAttendanceRecords(prev => [record, ...prev]);
    return record;
  }, []);

  const getTodayRecords = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return attendanceRecords.filter(r => r.timestamp >= today);
  }, [attendanceRecords]);

  const getEmployeeLastRecord = useCallback((employeeId: string) => {
    return attendanceRecords.find(r => r.employeeId === employeeId);
  }, [attendanceRecords]);

  return {
    employees,
    attendanceRecords,
    registerEmployee,
    removeEmployee,
    markAttendance,
    getTodayRecords,
    getEmployeeLastRecord,
  };
};
