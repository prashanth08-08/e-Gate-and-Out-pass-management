import React from 'react';
import { AppNotification } from '../types';
import { Bell, Check, Info, XCircle } from 'lucide-react';

interface NotificationDropdownProps {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications, onMarkRead, onClose }) => {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
          <span className="text-xs text-gray-500">{notifications.filter(n => !n.isRead).length} unread</span>
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs">No notifications yet</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id} 
                onClick={() => onMarkRead(notification.id)}
                className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex gap-3">
                  <div className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full ${!notification.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                  <div>
                    <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(notification.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <div className="ml-auto flex-shrink-0">
                     {notification.type === 'success' && <Check className="w-4 h-4 text-green-500" />}
                     {notification.type === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                     {notification.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;