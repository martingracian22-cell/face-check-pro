export interface Employee {
  id: string;
  name: string;
  department: string;
  faceDescriptor: Float32Array | null;
  photoUrl: string;
  registeredAt: Date;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  timestamp: Date;
  type: 'check-in' | 'check-out';
  confidence: number;
}

export interface RecognitionResult {
  detected: boolean;
  employee: Employee | null;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
