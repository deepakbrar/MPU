import React, { useState, useCallback, useEffect } from 'react';
import { HeroHeader } from './components/HeroHeader';
import { QuickAdd } from './components/QuickAdd';
import { PlanList } from './components/PlanList';
import { Footer } from './components/Footer';
import { fetchGoogleSheetData } from './services/googleSheetsService';
import { uploadTasksToGoogleSheets } from './services/googleSheetsUpload';
import { SalesPerson, Hotel, PlanTask, Portfolio, HotelMapping, TaskTypeEnum } from './types';
import { Users, Building2, Loader2, AlertCircle, RefreshCw, CalendarDays, Briefcase, FolderKanban } from 'lucide-react';

const App: React.FC = () => {
  // Task Type Selection
  const [taskType, setTaskType] = useState<TaskTypeEnum | ''>('');
  
  const [selectedUser, setSelectedUser] = useState<SalesPerson | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [taskList, setTaskList] = useState<PlanTask[]>([]);
  
  // Data from Google Sheets
  const [users, setUsers] = useState<SalesPerson[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [hotelMappings, setHotelMappings] = useState<HotelMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Reset dependent fields when task type changes
  useEffect(() => {
    setSelectedUser(null);
    setSelectedHotel(null);
    setSelectedMonth('');
    setSelectedPortfolio(null);
  }, [taskType]);

  const getMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const shortMonth = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      months.push({ value: monthYear, label: shortMonth, year, fullLabel: monthYear });
    }
    return months;
  };

  const monthOptions = getMonthOptions();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchGoogleSheetData();
      
      if (!data.users || data.users.length === 0) {
        throw new Error('No users found in Google Sheets. Please add data to the "Users" tab.');
      }
      if (!data.hotels || data.hotels.length === 0) {
        throw new Error('No hotels found in Google Sheets. Please add data to the "Hotels" tab.');
      }
      if (!data.subjects || data.subjects.length === 0) {
        throw new Error('No subjects found in Google Sheets. Please add data to the "Subjects" tab.');
      }
      
      setUsers(data.users);
      setHotels(data.hotels);
      setSubjects(data.subjects);
      setPortfolios(data.portfolios || []);
      setHotelMappings(data.hotelMappings || []);
      
      console.log('✅ Successfully loaded from Google Sheets:', {
        users: data.users.length,
        hotels: data.hotels.length,
        subjects: data.subjects.length,
        portfolios: data.portfolios?.length || 0,
        hotelMappings: data.hotelMappings?.length || 0,
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data from Google Sheets';
      console.error('❌ Google Sheets Error:', err);
      setError(errorMessage);
      setUsers([]);
      setHotels([]);
      setSubjects([]);
      setPortfolios([]);
      setHotelMappings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddTasks = useCallback((newTasks: PlanTask[]) => {
    setTaskList((prev) => [...prev, ...newTasks]);
  }, []);

  const handleDeleteTask = useCallback((id: string) => {
    setTaskList((prev) => prev.filter(task => task.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    if (window.confirm("Are you sure you want to clear all tasks?")) {
      setTaskList([]);
    }
  }, []);

  const handleUploadToSheets = useCallback(async () => {
    if (taskList.length === 0) {
      alert('No tasks to upload. Please add tasks first.');
      return;
    }

    const confirmed = window.confirm(
      `Upload ${taskList.length} task(s) to Google Sheets?\n\nThis will add them to the "Tasks" tab.`
    );
    
    if (!confirmed) return;

    try {
      setUploading(true);
      const result = await uploadTasksToGoogleSheets(taskList);
      
      if (result.success) {
        alert(`✅ Success! ${result.rowsAdded} tasks uploaded to Google Sheets.\n\nCheck the "Tasks" tab in your spreadsheet.`);
        setTaskList([]);
      } else {
        alert(`❌ Upload failed: ${result.error}\n\nPlease check your Google Apps Script configuration.`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Failed to upload tasks. Please try again or check your configuration.');
    } finally {
      setUploading(false);
    }
  }, [taskList]);

  // Determine which fields to show based on task type
  const showMonthPicker = taskType === TaskTypeEnum.MonthlyPlan || taskType === TaskTypeEnum.PortfolioPlan;
  const showPortfolioSelector = taskType === TaskTypeEnum.PortfolioPlan;
  const showOwnerAndHotel = taskType === TaskTypeEnum.MonthlyPlan;
  const isOwnerTask = taskType === TaskTypeEnum.OwnerExternal || taskType === TaskTypeEnum.OwnerInternal;

  // Get unique brands from hotelMappings for portfolio options
  const brandOptions = [...new Set(hotelMappings.map(m => m.brand).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700 font-medium text-lg">Loading data from Google Sheets...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-red-200">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Unable to Load Data</h2>
            <p className="text-gray-600 text-center mb-6">{error}</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-700">
              <p className="font-semibold mb-2">Please check:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Google Sheets API key is valid</li>
                <li>Spreadsheet is shared publicly</li>
                <li>Required tabs: Users, Hotels, Subjects, Portfolios, HotelMapping</li>
              </ul>
            </div>
            <button
              onClick={loadData}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw size={20} />
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <HeroHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Success indicator */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-green-800 text-sm font-medium">
              Sync active • Data source configured • {users.length} Users, {hotels.length} Hotels, {subjects.length} Subjects, {portfolios.length} Portfolios
            </p>
          </div>
        </div>

        {/* Context Selectors */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          1. Select Context
          <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Required</span>
        </h2>
      
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          
          {/* Task Type Selector - Always First */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Briefcase size={16} />
              Task Type
              <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Required</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.values(TaskTypeEnum).map((type) => (
                <button
                  key={type}
                  onClick={() => setTaskType(type)}
                  className={`
                    p-3 rounded-lg font-medium text-sm transition-all duration-200 border-2
                    ${taskType === type
                      ? 'bg-[#004A98] text-white border-[#004A98] shadow-md'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }
                  `}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Fields based on Task Type */}
          {taskType && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                {/* Task Owner - For Monthly Plan */}
                {showOwnerAndHotel && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Users size={16} />
                      Task Owner (Sales Person)
                    </label>
                    <select
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                      onChange={(e) => {
                        const user = users.find(u => u.id === e.target.value);
                        setSelectedUser(user || null);
                      }}
                      value={selectedUser?.id || ''}
                    >
                      <option value="">-- Select Owner --</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Portfolio Selector - For Portfolio Plan */}
                {showPortfolioSelector && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
      <FolderKanban size={16} />
      Select Portfolio
    </label>
    <select
      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
      onChange={(e) => {
        const value = e.target.value;
        if (value) {
          setSelectedPortfolio({ name: value });
        } else {
          setSelectedPortfolio(null);
        }
      }}
      value={selectedPortfolio?.name || ''}
    >
      <option value="">-- Select Portfolio --</option>
      <option value="Atica Org">Atica Org (All Hotels)</option>
      {brandOptions.map((brand) => (
        <option key={brand} value={brand}>{brand}</option>
      ))}
    </select>
  </div>
)}

                {/* Related Hotel - For Monthly Plan */}
                {showOwnerAndHotel && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Building2 size={16} />
                      Related Hotel (WhatId)
                    </label>
                    <select
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                      onChange={(e) => {
                        const hotel = hotels.find(h => h.id === e.target.value);
                        setSelectedHotel(hotel || null);
                      }}
                      value={selectedHotel?.id || ''}
                    >
                      <option value="">-- Select Hotel --</option>
                      {hotels.map((hotel) => (
                        <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Month Picker - For Monthly Plan & Portfolio Plan */}
              {showMonthPicker && (
                <div className="border-t border-gray-100 pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <CalendarDays size={16} />
                    Planning Month
                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Required</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {monthOptions.map((month) => (
                      <button
                        key={month.value}
                        onClick={() => setSelectedMonth(month.value)}
                        className={`
                          relative px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
                          ${selectedMonth === month.value
                            ? 'bg-gradient-to-r from-[#004A98] to-blue-600 text-white shadow-md scale-105 ring-2 ring-blue-300'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm border border-gray-200'
                          }
                        `}
                      >
                        <span className="block">{month.label}</span>
                        <span className={`block text-xs mt-0.5 ${selectedMonth === month.value ? 'text-blue-100' : 'text-gray-400'}`}>
                          {month.year}
                        </span>
                        {selectedMonth === month.value && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedMonth && (
                    <p className="mt-3 text-sm text-green-600 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Selected: <strong>{selectedMonth}</strong>
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Input Area */}
        {taskType && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">2. Add Plan Items</h2>
            <QuickAdd 
              taskType={taskType}
              selectedUser={selectedUser} 
              selectedHotel={selectedHotel}
              selectedMonth={selectedMonth}
              selectedPortfolio={selectedPortfolio}
              subjects={subjects}
              users={users}
              hotels={hotels}
              hotelMappings={hotelMappings}
              onAddTasks={handleAddTasks} 
            />
          </div>
        )}

        {/* Review List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">3. Review & Upload</h2>
          <PlanList 
            tasks={taskList} 
            onDelete={handleDeleteTask} 
            onClear={handleClearAll}
            onExport={handleUploadToSheets}
            uploading={uploading}
          />
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default App;
