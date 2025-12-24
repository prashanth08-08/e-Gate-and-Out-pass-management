import { PassRequest, PassStatus, PassType, User, UserRole, AppNotification } from '../types';

// Initial Mock Data
const MOCK_USERS: User[] = [
  { id: 's1', name: 'Rahul Kumar', role: UserRole.STUDENT, roomNumber: 'B-204', department: 'CS' }, // Computer Science Branch
  { id: 's2', name: 'Amit Singh', role: UserRole.STUDENT, roomNumber: 'A-101', department: 'ME' }, // Mechanical Branch
  { id: 'w1', name: 'Dr. Sharma (Warden)', role: UserRole.WARDEN },
];

const STORAGE_KEY = 'hostel_pass_data';
const NOTIFICATION_KEY = 'hostel_notifications';

export const getRequests = (): PassRequest[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  return JSON.parse(data);
};

// --- Notification System ---

const getNotificationsFromStorage = (): AppNotification[] => {
  const data = localStorage.getItem(NOTIFICATION_KEY);
  return data ? JSON.parse(data) : [];
};

export const getNotifications = (userId: string, role: UserRole): AppNotification[] => {
  const all = getNotificationsFromStorage();
  // Return notifications for this specific user OR generic warden notifications if the user is a warden
  return all.filter(n => n.recipientId === userId || (role === UserRole.WARDEN && n.recipientId === 'WARDEN')).sort((a, b) => b.timestamp - a.timestamp);
};

export const markNotificationAsRead = (notificationId: string) => {
  const all = getNotificationsFromStorage();
  const updated = all.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
  localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(updated));
};

const createNotification = (recipientId: string, message: string, type: 'info' | 'success' | 'error' = 'info') => {
  const all = getNotificationsFromStorage();
  const newNotification: AppNotification = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    recipientId,
    message,
    isRead: false,
    timestamp: Date.now(),
    type
  };
  localStorage.setItem(NOTIFICATION_KEY, JSON.stringify([newNotification, ...all]));
};

// --- Excel Export (CSV) ---

export const downloadDataAsExcel = () => {
  const requests = getRequests();
  
  // Define CSV Headers
  const headers = ['ID', 'Date Created', 'Student Name', 'Branch', 'Room', 'Type', 'Destination', 'Departure', 'Return', 'Reason', 'Status', 'Risk Level'];
  
  // Transform Data to CSV Rows
  const rows = requests.map(req => {
    const student = MOCK_USERS.find(u => u.id === req.studentId);
    const branch = student?.department || 'N/A';
    const risk = req.aiSummary ? JSON.parse(req.aiSummary).risk : 'N/A';
    
    // Helper to escape CSV fields
    const safe = (str: string) => `"${str.replace(/"/g, '""')}"`;

    return [
      req.id,
      new Date(req.createdAt).toLocaleDateString(),
      safe(req.studentName),
      safe(branch),
      safe(req.roomNumber),
      req.type,
      safe(req.destination),
      new Date(req.departureDate).toLocaleString(),
      new Date(req.returnDate).toLocaleString(),
      safe(req.reason),
      req.status,
      safe(risk)
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  
  // Trigger Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Hostel_Data_${new Date().toISOString().split('T')[0]}.csv`); // .csv opens in Excel
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- Main Data Operations ---

export const saveRequest = (req: PassRequest) => {
  const current = getRequests();
  const updated = [req, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Notify Warden
  createNotification('WARDEN', `New ${req.type === PassType.GATE_PASS ? 'Gate Pass' : 'Out Pass'} request from ${req.studentName}`, 'info');
};

export const updateRequestStatus = (id: string, status: PassStatus) => {
  const current = getRequests();
  const requestIndex = current.findIndex(r => r.id === id);
  
  if (requestIndex === -1) return;

  const request = current[requestIndex];
  
  // Simulate the 3-signature process instantly for demo
  const newFlow = { ...request.approvalFlow };
  if (status === PassStatus.APPROVED) {
    newFlow.mentor = true;
    newFlow.warden = true;
    newFlow.chiefWarden = true;
  }

  const updatedRequest = { ...request, status, approvalFlow: newFlow };
  current[requestIndex] = updatedRequest;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));

  // Notify Student
  const notifType = status === PassStatus.APPROVED ? 'success' : status === PassStatus.REJECTED ? 'error' : 'info';
  createNotification(
    request.studentId, 
    `Your pass to ${request.destination} has been ${status}`, 
    notifType
  );
};

export const getUsers = () => MOCK_USERS;