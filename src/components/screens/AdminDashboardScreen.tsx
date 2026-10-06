import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { AdminDashboard } from '../admin/AdminDashboard';

interface AdminDashboardScreenProps {
  onNavigate: (screen: string) => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 text-left">
        <button
          onClick={() => onNavigate('discover')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Member View</span>
        </button>
      </div>

      <AdminDashboard />
    </div>
  );
};
