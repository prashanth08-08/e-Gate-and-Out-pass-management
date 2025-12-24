export enum PassType {
  GATE_PASS = 'GATE_PASS', // For going home (days)
  OUT_PASS = 'OUT_PASS',   // For shopping/local (hours)
}

export enum PassStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  USED = 'USED', // Checked out
  CLOSED = 'CLOSED' // Returned
}

export enum UserRole {
  STUDENT = 'STUDENT',
  WARDEN = 'WARDEN',
  SECURITY = 'SECURITY' // Optional extension
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  roomNumber?: string;
  department?: string;
}

export interface AppNotification {
  id: string;
  recipientId: string; // 'WARDEN' or specific student ID
  message: string;
  isRead: boolean;
  timestamp: number;
  type: 'info' | 'success' | 'error';
}

export interface PassRequest {
  id: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
  type: PassType;
  reason: string;
  destination: string;
  departureDate: string; // ISO Date string
  returnDate: string;   // ISO Date string
  status: PassStatus;
  createdAt: number;
  approvalFlow: {
    mentor: boolean;
    warden: boolean;
    chiefWarden: boolean;
  };
  aiSummary?: string;
}