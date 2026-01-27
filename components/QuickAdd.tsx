import React, { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { SalesPerson, Hotel, PlanTask } from '../types';

interface QuickAddProps {
  selectedUser: SalesPerson | null;
  selectedHotel: Hotel | null;
  selectedMonth: string;
  subjects: string[];  // Changed from subjectOptions to subjects
  onAddTasks: (tasks: PlanTask[]) => void;
}

export const QuickAdd: React.FC<QuickAddProps> = ({
  selectedUser,
  selectedHotel,
  selectedMonth,
  subjects,  // Changed from subjectOptions to subjects
  onAddTasks
}) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleAdd = () => {
    if (!selectedUser || !selectedHotel || !selectedMonth || !subject || !dueDate) {
      alert('Please fill all required fields and select context (User, Hotel & Month)');
      return;
    }

    const newTask: PlanTask = {
      id: `task_${Date.now()}`,
      ownerId: selectedUser.id,
      ownerName: selectedUser.name,
      whatId: selectedHotel.id,
      whatName: selectedHotel.name,
      subject,
      description: description || 'No description provided',
      dueDate,
      month: selectedMonth,
      taskType: 'Monthly Plan',
      status: 'Not Started'
    };

    onAddTasks([newTask]);
    
    // Reset form
    setSubject('');
    setDescription('');
    setDueDate('');
  };

  // Defensive check for subjects array
  const availableSubjects = subjects || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject *
          </label>
          <select
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="">-- Select Subject --</option>
            {availableSubjects.length > 0 ? (
              availableSubjects.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))
            ) : (
              <option value="" disabled>No subjects available</option>
            )}
          </select>
          {availableSubjects.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">
              ⚠️ Configure subjects in Google Sheets
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Calendar size={16} />
            Due Date *
          </label>
          <input
            type="date"
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleAdd}
            disabled={!selectedUser || !selectedHotel || !selectedMonth}
            className="w-full bg-[#004A98] hover:bg-blue-900 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add to Plan
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comments / Description
        </label>
        <textarea
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
          rows={3}
          placeholder="Add any additional details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </div>
  );
};
