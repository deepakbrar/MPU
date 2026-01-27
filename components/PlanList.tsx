import React from 'react';
import { Trash2, Upload, XCircle, ListChecks, Loader2 } from 'lucide-react';
import { PlanTask } from '../types';

interface PlanListProps {
  tasks: PlanTask[];
  onDelete: (id: string) => void;
  onClear: () => void;
  onExport: () => void;
  uploading?: boolean;
}

export const PlanList: React.FC<PlanListProps> = ({
  tasks,
  onDelete,
  onClear,
  onExport,
  uploading = false
}) => {
  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <ListChecks size={48} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 text-lg">No tasks added yet</p>
        <p className="text-gray-400 text-sm mt-1">Add tasks above to build your monthly plan</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ListChecks size={20} className="text-gray-600" />
          <span className="font-medium text-gray-700">
            {tasks.length} Task{tasks.length !== 1 ? 's' : ''} Planned
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClear}
            disabled={uploading}
            className="px-4 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center gap-2 transition-colors"
          >
            <XCircle size={16} />
            Clear All
          </button>
          <button
            onClick={onExport}
            disabled={uploading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload to Sheets
              </>
            )}
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {tasks.map((task) => (
          <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {task.subject}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    📅 {task.month}
                  </span>
                  <span className="text-sm text-gray-500">
                    Due: {task.dueDate}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  <strong>Owner:</strong> {task.ownerName} • <strong>Hotel:</strong> {task.whatName}
                </div>
                {task.description && (
                  <p className="text-sm text-gray-700 mt-2">{task.description}</p>
                )}
              </div>
              <button
                onClick={() => onDelete(task.id)}
                disabled={uploading}
                className="ml-4 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                title="Delete task"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
