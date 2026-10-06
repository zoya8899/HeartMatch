import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { Bell, Heart, Star, MessageSquare, Shield, Crown, X, CheckCheck } from 'lucide-react';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationRecord } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNotification?: (link?: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectNotification,
}) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);

  useEffect(() => {
    if (!currentUser || !isOpen) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationRecord));
      // Sort client-side by date descending
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(list);
    }, (err) => {
      console.warn('Notifications fetch note:', err);
    });

    return () => unsub();
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const markAllAsRead = async () => {
    notifications.filter((n) => !n.read).forEach((n) => {
      updateDoc(doc(db, 'notifications', n.id), { read: true }).catch(() => {});
    });
  };

  const getIcon = (type: NotificationRecord['type']) => {
    switch (type) {
      case 'match':
        return <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />;
      case 'superlike':
        return <Star className="w-4 h-4 text-amber-500 fill-amber-500" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'subscription':
        return <Crown className="w-4 h-4 text-amber-600" />;
      default:
        return <Shield className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/40 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white shadow-2xl border-l border-stone-200 flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-stone-900">Notifications</h3>
            </div>
            <div className="flex items-center gap-2">
              {notifications.some((n) => !n.read) && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400">
                <Bell className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p>No new notifications right now.</p>
                <p className="text-[11px] mt-1 text-stone-400">Likes and matches will appear here.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (onSelectNotification) onSelectNotification(item.link);
                    onClose();
                  }}
                  className={`p-3.5 hover:bg-stone-50 transition-colors cursor-pointer flex items-start gap-3 ${
                    !item.read ? 'bg-rose-50/40' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-stone-900">{item.title}</p>
                    <p className="text-xs text-stone-600 mt-0.5 line-clamp-2">{item.body}</p>
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {!item.read && (
                    <div className="w-2 h-2 rounded-full bg-rose-600 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
