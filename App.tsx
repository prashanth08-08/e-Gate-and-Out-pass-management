import React, { useEffect, useState } from 'react';
import { User, UserRole, PassRequest, PassStatus, AppNotification } from './types';
import { getUsers, getRequests, saveRequest, updateRequestStatus, getNotifications, markNotificationAsRead, downloadDataAsExcel } from './services/mockDatabase';
import { summarizeForWarden } from './services/geminiService';
import PassCard from './components/PassCard';
import CreatePassModal from './components/CreatePassModal';
import NotificationDropdown from './components/NotificationDropdown';
import { LogOut, Plus, Shield, GraduationCap, Building2, FileText, Bell, Download } from 'lucide-react';

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<PassRequest[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [users] = useState(getUsers());

  // Data Loading & Polling
  useEffect(() => {
    const loadData = () => {
      setRequests(getRequests());
      if (currentUser) {
        setNotifications(getNotifications(currentUser.id, currentUser.role));
      }
    };

    loadData();
    const interval = setInterval(loadData, 2000); // Poll every 2s to simulate real-time updates
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleLogin = (role: UserRole) => {
    const user = users.find(u => u.role === role);
    if (user) setCurrentUser(user);
  };

  const handleCreateRequest = async (data: any) => {
    if (!currentUser) return;

    // Simulate AI Summary generation for Warden view
    const start = new Date(data.departureDate).getTime();
    const end = new Date(data.returnDate).getTime();
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    const aiSummary = await summarizeForWarden(data.reason, days);

    const newRequest: PassRequest = {
      id: Date.now().toString(),
      studentId: currentUser.id,
      studentName: currentUser.name,
      roomNumber: currentUser.roomNumber || 'N/A',
      type: data.type,
      reason: data.reason,
      destination: data.destination,
      departureDate: data.departureDate,
      returnDate: data.returnDate,
      status: PassStatus.PENDING,
      createdAt: Date.now(),
      approvalFlow: {
        mentor: false,
        warden: false,
        chiefWarden: false
      },
      aiSummary
    };

    saveRequest(newRequest);
    setRequests(getRequests()); // Refresh immediately
    setShowCreateModal(false);
  };

  const handleApprove = (id: string) => {
    updateRequestStatus(id, PassStatus.APPROVED);
    setRequests(getRequests());
  };

  const handleReject = (id: string) => {
    updateRequestStatus(id, PassStatus.REJECTED);
    setRequests(getRequests());
  };

  const handleMarkRead = (id: string) => {
    markNotificationAsRead(id);
    if (currentUser) {
       setNotifications(getNotifications(currentUser.id, currentUser.role));
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl w-full max-w-sm border border-white/20 shadow-2xl">
          <div className="flex justify-center mb-6">
            <Building2 className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-center mb-2">Hostel Pass</h1>
          <p className="text-center text-blue-100 mb-8">Digital Gate & Out Pass System</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => handleLogin(UserRole.STUDENT)}
              className="w-full bg-white text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center"
            >
              <GraduationCap className="w-5 h-5 mr-3" /> Login as Student
            </button>
            <button 
              onClick={() => handleLogin(UserRole.WARDEN)}
              className="w-full bg-blue-800/50 border border-blue-400/30 text-white py-3 rounded-xl font-bold hover:bg-blue-800/70 transition-all flex items-center justify-center"
            >
              <Shield className="w-5 h-5 mr-3" /> Login as Warden
            </button>
          </div>
          <p className="text-xs text-center mt-6 text-blue-200">Replaces the 3-signature manual process</p>
        </div>
      </div>
    );
  }

  const myRequests = currentUser.role === UserRole.STUDENT 
    ? requests.filter(r => r.studentId === currentUser.id)
    : requests;

  // For warden, sort pending first
  const displayRequests = currentUser.role === UserRole.WARDEN 
    ? [...myRequests].sort((a, b) => (a.status === PassStatus.PENDING ? -1 : 1))
    : [...myRequests].sort((a, b) => b.createdAt - a.createdAt);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            {currentUser.role === UserRole.WARDEN ? <Shield className="w-6 h-6 text-indigo-600 mr-2" /> : <GraduationCap className="w-6 h-6 text-blue-600 mr-2" />}
            <span className="font-bold text-gray-800 truncate max-w-[120px]">{currentUser.name}</span>
          </div>
          
          <div className="flex items-center space-x-3">
             {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              
              {showNotifications && (
                <NotificationDropdown 
                  notifications={notifications} 
                  onMarkRead={handleMarkRead} 
                  onClose={() => setShowNotifications(false)} 
                />
              )}
            </div>

            <button onClick={() => setCurrentUser(null)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentUser.role === UserRole.STUDENT ? 'My Passes' : 'Approvals'}
            </h2>
            <p className="text-sm text-gray-500">
              {currentUser.role === UserRole.STUDENT 
                ? 'Manage your gate and out passes' 
                : 'Review pending student requests'}
            </p>
          </div>
          
          {currentUser.role === UserRole.STUDENT && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}

          {currentUser.role === UserRole.WARDEN && (
            <button 
              onClick={downloadDataAsExcel}
              className="bg-green-600 text-white p-2.5 rounded-lg shadow-md hover:bg-green-700 transition-all flex items-center text-sm font-medium"
              title="Download as Excel"
            >
              <Download className="w-4 h-4 mr-1.5" /> Excel
            </button>
          )}
        </div>

        <div className="space-y-4">
          {displayRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No pass requests found.</p>
            </div>
          ) : (
            displayRequests.map(req => (
              <PassCard 
                key={req.id} 
                request={req} 
                isWarden={currentUser.role === UserRole.WARDEN}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))
          )}
        </div>
      </main>

      {showCreateModal && currentUser && (
        <CreatePassModal 
          user={currentUser}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateRequest}
        />
      )}
    </div>
  );
};

export default App;