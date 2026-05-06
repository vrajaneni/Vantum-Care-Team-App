import React from 'react';
import { motion } from 'motion/react';
import { 
  Bell, 
  MessageSquare, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  X
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'message' | 'alert' | 'system' | 'task';
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'alert',
    title: 'Critical RPM Alert',
    description: 'Patient Sarah Jenkins: Heart rate exceeded 120bpm for 5 minutes.',
    time: '2 mins ago',
    isRead: false,
    priority: 'high'
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message from Dr. Chen',
    description: 'Regarding the lab results for patient Michael Ross.',
    time: '15 mins ago',
    isRead: false,
    priority: 'medium'
  },
  {
    id: '3',
    type: 'task',
    title: 'Task Assigned',
    description: 'Review and sign off on the weekly RPM report.',
    time: '1 hour ago',
    isRead: true,
    priority: 'low'
  },
  {
    id: '4',
    type: 'system',
    title: 'System Update',
    description: 'Nuvia AI Co-Pilot has been updated with new clinical guidelines.',
    time: '3 hours ago',
    isRead: true,
    priority: 'low'
  }
];

interface NotificationsProps {
  onClose: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ onClose }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="w-4 h-4" />;
      case 'alert': return <AlertCircle className="w-4 h-4" />;
      case 'task': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      default: return 'bg-emerald-500';
    }
  };

  return (
    <div className="absolute top-full right-0 mt-4 w-96 bg-white rounded-[32px] shadow-2xl border border-zinc-200 overflow-hidden z-[100]">
      <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-zinc-900 tracking-tight">Notifications</h3>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Stay updated with your care team</p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto no-scrollbar">
        {MOCK_NOTIFICATIONS.length > 0 ? (
          <div className="divide-y divide-zinc-50">
            {MOCK_NOTIFICATIONS.map((notification) => (
              <motion.div 
                key={notification.id}
                whileHover={{ backgroundColor: 'rgba(244, 244, 245, 0.5)' }}
                className={`p-5 flex gap-4 transition-colors cursor-pointer ${notification.isRead ? 'opacity-60' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  notification.type === 'alert' ? 'bg-red-50 text-red-600' : 
                  notification.type === 'message' ? 'bg-blue-50 text-blue-600' : 
                  'bg-emerald-50 text-emerald-600'
                }`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-zinc-900 truncate">{notification.title}</p>
                    {!notification.isRead && (
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 mb-2">
                    {notification.description}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <Clock className="w-3 h-3" />
                    {notification.time}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-zinc-200" />
            </div>
            <p className="text-sm font-bold text-zinc-400">All caught up!</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-zinc-50 border-t border-zinc-100">
        <button className="w-full py-3 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">
          Mark all as read
        </button>
      </div>
    </div>
  );
};

export default Notifications;
