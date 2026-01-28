import React, { useState, useEffect } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { SalesPerson, Hotel, PlanTask, Portfolio, HotelMapping, TaskTypeEnum } from '../types';

interface QuickAddProps {
  taskType: TaskTypeEnum;
  selectedUser: SalesPerson | null;
  selectedHotel: Hotel | null;
  selectedMonth: string;
  selectedPortfolio: Portfolio | null;
  subjects: string[];
  users: SalesPerson[];
  hotels: Hotel[];
  hotelMappings: HotelMapping[];
  onAddTasks: (tasks: PlanTask[]) => void;
}

export const QuickAdd: React.FC<QuickAddProps> = ({
  taskType,
  selectedUser,
  selectedHotel,
  selectedMonth,
  selectedPortfolio,
  subjects,
  users,
  hotels,
  hotelMappings,
  onAddTasks
}) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const isOwnerTask = taskType === TaskTypeEnum.OwnerExternal || taskType === TaskTypeEnum.OwnerInternal;
  const isPortfolioTask = taskType === TaskTypeEnum.PortfolioPlan;
  const isMonthlyTask = taskType === TaskTypeEnum.MonthlyPlan;

  // Auto-set subject for Owner tasks
  useEffect(() => {
    if (isOwnerTask) {
      setSubject('Owner Account Management/Owner Approval');
    }
  }, [isOwnerTask]);

  const handleAdd = () => {
    // Validation based on task type
    if (isMonthlyTask) {
      if (!selectedUser || !selectedHotel || !selectedMonth || !subject || !dueDate) {
        alert('Please fill all required fields (User, Hotel, Month, Subject, Due Date)');
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
        taskType: taskType,
        status: 'Not Started'
      };
      
      onAddTasks([newTask]);
    }
    else if (isOwnerTask) {
      if (!selectedHotel || !dueDate) {
        alert('Please select a Hotel and Due Date');
        return;
      }
      
      if (!selectedUser) {
        alert('No user found in HotelMapping for the selected hotel. Please update HotelMapping sheet.');
        return;
      }
      
      const newTask: PlanTask = {
        id: `task_${Date.now()}`,
        ownerId: selectedUser.id,
        ownerName: selectedUser.name,
        whatId: selectedHotel.id,
        whatName: selectedHotel.name,
        subject: 'Owner Account Management/Owner Approval',
        description: description || 'No description provided',
        dueDate,
        month: '',
        taskType: taskType,
        status: 'Not Started'
      };
      
      onAddTasks([newTask]);
    }
    else if (isPortfolioTask) {
      if (!selectedPortfolio || !selectedMonth || !subject || !dueDate) {
        alert('Please fill all required fields (Portfolio, Month, Subject, Due Date)');
        return;
      }

      let newTasks: PlanTask[] = [];

      if (selectedPortfolio.name === 'Atica Org') {
        // Use HotelMapping if available, otherwise fall back to Hotels sheet
        if (hotelMappings && hotelMappings.length > 0) {
          newTasks = hotelMappings.map((mapping, index) => {
            const hotel = hotels.find(h => h.id === mapping.propertyId);
            const user = users.find(u => u.id === mapping.sfUserId);
            
            return {
              id: `task_${Date.now()}_${index}`,
              ownerId: mapping.sfUserId,
              ownerName: user?.name || mapping.sfUserId,
              whatId: mapping.propertyId,
              whatName: hotel?.name || mapping.propertyId,
              subject,
              description: description || 'No description provided',
              dueDate,
              month: selectedMonth,
              taskType: TaskTypeEnum.PortfolioPlan,
              status: 'Not Started' as const,
              portfolio: selectedPortfolio.name
            };
          });
        } else {
          // Fallback: Create one task per hotel from Hotels sheet
          newTasks = hotels.map((hotel, index) => ({
            id: `task_${Date.now()}_${index}`,
            ownerId: '',
            ownerName: '(No user assigned - setup HotelMapping)',
            whatId: hotel.id,
            whatName: hotel.name,
            subject,
            description: description || 'No description provided',
            dueDate,
            month: selectedMonth,
            taskType: TaskTypeEnum.PortfolioPlan,
            status: 'Not Started' as const,
            portfolio: selectedPortfolio.name
          }));
        }
      } else {
        // Filter by brand
        const relevantMappings = hotelMappings.filter(m => m.brand === selectedPortfolio.name);
        
        if (relevantMappings.length === 0) {
          alert(`No hotels found for brand "${selectedPortfolio.name}". Please check HotelMapping sheet.`);
          return;
        }

        newTasks = relevantMappings.map((mapping, index) => {
          const hotel = hotels.find(h => h.id === mapping.propertyId);
          const user = users.find(u => u.id === mapping.sfUserId);
          
          return {
            id: `task_${Date.now()}_${index}`,
            ownerId: mapping.sfUserId,
            ownerName: user?.name || mapping.sfUserId,
            whatId: mapping.propertyId,
            whatName: hotel?.name || mapping.propertyId,
            subject,
            description: description || 'No description provided',
            dueDate,
            month: selectedMonth,
            taskType: TaskTypeEnum.PortfolioPlan,
            status: 'Not Started' as const,
            portfolio: selectedPortfolio.name
          };
        });
      }

      if (newTasks.length === 0) {
        alert('No tasks could be created. Please check your data.');
        return;
      }

      onAddTasks(newTasks);
      
      const warningMsg = hotelMappings.length === 0 
        ? `\n\n⚠️ Note: HotelMapping sheet is empty. Tasks created without user assignments.`
        : '';
      alert(`✅ ${newTasks.length} tasks created for ${selectedPortfolio.name}${warningMsg}`);
    }
    
    // Reset form
    if (!isOwnerTask) setSubject('');
    setDescription('');
    setDueDate('');
  };

  const availableSubjects = subjects || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject *
          </label>
          {isOwnerTask ? (
            <input
              type="text"
              className="block w-full rounded-lg border-gray-300 shadow-sm bg-gray-100 sm:text-sm p-3 border"
              value={subject}
              readOnly
            />
          ) : (
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

      {isPortfolioTask && selectedPortfolio && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          <strong>Note:</strong> This will create individual tasks for each hotel under "{selectedPortfolio.name}" with their respective sales associates.
        </div>
      )}
    </div>
  );
};
