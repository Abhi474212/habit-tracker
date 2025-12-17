import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Trash2, TrendingUp, Calendar, Target, Award, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('#3b82f6');
  const [activeView, setActiveView] = useState('tracker');
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedHabitForCalendar, setSelectedHabitForCalendar] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('habitsData');
    if (saved) {
      setHabits(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('habitsData', JSON.stringify(habits));
  }, [habits]);

  const addHabit = () => {
    if (newHabitName.trim()) {
      const newHabit = {
        id: Date.now(),
        name: newHabitName,
        color: newHabitColor,
        completions: {}
      };
      setHabits([...habits, newHabit]);
      setNewHabitName('');
    }
  };

  const deleteHabit = (id) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const toggleCompletion = (habitId, date) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const completions = { ...habit.completions };
        if (completions[date]) {
          delete completions[date];
        } else {
          completions[date] = true;
        }
        return { ...habit, completions };
      }
      return habit;
    }));
  };

  const getWeekDays = (startDate) => {
    const days = [];
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const getCalendarDays = (month) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const startDay = firstDay.getDay();
    const days = [];
    
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, monthIndex, i);
      days.push(date.toISOString().split('T')[0]);
    }
    
    return days;
  };

  const previousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const nextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const goToToday = () => {
    const today = new Date();
    today.setDate(today.getDate() - today.getDay());
    setCurrentWeekStart(today);
  };

  const previousMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));
  };

  const getWeekdayName = (dateStr) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date(dateStr).getDay()];
  };

  const getDateRangeDays = () => {
    if (!dateRange.start || !dateRange.end) return [];
    const days = [];
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d).toISOString().split('T')[0]);
    }
    return days;
  };

  const getCompletionRate = (habit, days) => {
    if (days.length === 0) return 0;
    const completed = days.filter(day => habit.completions[day]).length;
    return ((completed / days.length) * 100).toFixed(0);
  };

  const getTotalCompletions = (habit) => {
    return Object.keys(habit.completions).length;
  };

  const getCurrentStreak = (habit) => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (habit.completions[dateStr]) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getLongestStreak = (habit) => {
    const dates = Object.keys(habit.completions).sort();
    let longest = 0;
    let current = 0;
    
    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        current = 1;
      } else {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diff = (currDate - prevDate) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          current++;
        } else {
          longest = Math.max(longest, current);
          current = 1;
        }
      }
    }
    return Math.max(longest, current);
  };

  const getChartData = (days) => {
    return days.map(date => {
      const dataPoint = { date: date.slice(5), day: getWeekdayName(date) };
      habits.forEach(habit => {
        dataPoint[habit.name] = habit.completions[date] ? 1 : 0;
      });
      return dataPoint;
    });
  };

  const getCompletionDistribution = (days) => {
    return habits.map(habit => ({
      name: habit.name,
      value: days.filter(day => habit.completions[day]).length,
      color: habit.color
    }));
  };

  const getWeeklyData = (days) => {
    return habits.map(habit => ({
      name: habit.name,
      completed: days.filter(day => habit.completions[day]).length,
      total: days.length,
      color: habit.color
    }));
  };

  const weekDays = getWeekDays(currentWeekStart);
  const calendarDays = getCalendarDays(selectedMonth);
  const statsDateRange = dateRange.start && dateRange.end ? getDateRangeDays() : weekDays;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-full md:max-w-7xl mx-auto p-3 md:p-6">
        <header className="mb-4 md:mb-8 overflow-hidden">
          <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 mb-2 animate-pulse">
            Habit Tracker ✨
          </h1>
          <p className="text-gray-600 text-sm md:text-base">Build better habits, one day at a time</p>
        </header>

        <div className="flex gap-2 mb-4 md:mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveView('tracker')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition flex-shrink-0 shadow-md ${
              activeView === 'tracker'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Calendar className="inline w-4 h-4 mr-2" />
            Tracker
          </button>
          <button
            onClick={() => setActiveView('stats')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition flex-shrink-0 shadow-md ${
              activeView === 'stats'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="inline w-4 h-4 mr-2" />
            Statistics
          </button>
        </div>

        {activeView === 'tracker' && (
          <>
            <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 mb-4 md:mb-6 transform hover:scale-105 transition-transform">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Add New Habit
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                  placeholder="Enter habit name..."
                  className="flex-1 px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={newHabitColor}
                    onChange={(e) => setNewHabitColor(e.target.value)}
                    className="w-16 h-10 rounded-lg cursor-pointer border-2 border-purple-200"
                  />
                  <button
                    onClick={addHabit}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 flex-1 sm:flex-none justify-center"
                  >
                    <Plus className="w-5 h-5" />
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 mb-4 md:mb-6">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={previousWeek}
                  className="p-2 rounded-full hover:bg-purple-100 transition"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                </button>
                <div className="text-center">
                  <div className="text-base md:text-lg font-bold text-gray-800">
                    {weekDays[0] && new Date(weekDays[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6] && new Date(weekDays[6]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <button
                    onClick={goToToday}
                    className="text-xs md:text-sm text-purple-600 hover:underline mt-1"
                  >
                    Go to Today
                  </button>
                </div>
                <button
                  onClick={nextWeek}
                  className="p-2 rounded-full hover:bg-purple-100 transition"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 md:mb-4">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-xs md:text-sm font-semibold text-gray-600">
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {habits.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center transform hover:scale-105 transition-transform">
                <Target className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-purple-400 animate-bounce" />
                <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">No habits yet</h3>
                <p className="text-gray-500 text-sm md:text-base">Start by adding your first habit above!</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {habits.map(habit => (
                  <div key={habit.id} className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 transform hover:scale-105 transition-all hover:shadow-purple-200">
                    <div className="flex justify-between items-start mb-3 md:mb-4 flex-wrap gap-2">
                      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                        <div
                          className="w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0 shadow-lg"
                          style={{ backgroundColor: habit.color }}
                        />
                        <h3 className="text-base md:text-xl font-bold text-gray-800 truncate">{habit.name}</h3>
                      </div>
                      <div className="flex items-center gap-2 md:gap-4">
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Streak</div>
                          <div className="text-lg md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                            {getCurrentStreak(habit)}🔥
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedHabitForCalendar(habit);
                            setShowCalendar(true);
                          }}
                          className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 transition"
                        >
                          <Calendar className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                        </button>
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition"
                        >
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 md:gap-2">
                      {weekDays.map(date => (
                        <button
                          key={date}
                          onClick={() => toggleCompletion(habit.id, date)}
                          className={`aspect-square rounded-lg md:rounded-xl transition-all text-xs md:text-sm font-semibold ${
                            habit.completions[date]
                              ? 'bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-lg transform scale-105'
                              : 'bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300'
                          }`}
                        >
                          {habit.completions[date] ? '✓' : new Date(date).getDate()}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2 md:gap-4 mt-3 md:mt-4 pt-3 md:pt-4 border-t-2 border-purple-100">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Week</div>
                        <div className="text-base md:text-lg font-bold text-blue-600">
                          {getCompletionRate(habit, weekDays)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Best</div>
                        <div className="text-base md:text-lg font-bold text-purple-600">
                          {getLongestStreak(habit)}d
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Total</div>
                        <div className="text-base md:text-lg font-bold text-green-600">
                          {getTotalCompletions(habit)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeView === 'stats' && habits.length > 0 && (
          <div className="space-y-4 md:space-y-6">
            <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  Custom Range
                </h2>
                <button
                  onClick={() => setShowDateRangePicker(!showDateRangePicker)}
                  className="px-3 md:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition text-sm md:text-base"
                >
                  <Filter className="inline w-4 h-4 mr-2" />
                  {dateRange.start && dateRange.end ? 'Change Range' : 'Set Range'}
                </button>
              </div>

              {showDateRangePicker && (
                <div className="mb-4 p-3 md:p-4 bg-purple-50 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setDateRange({ start: '', end: '' });
                      setShowDateRangePicker(false);
                    }}
                    className="mt-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                  >
                    Reset to Current Week
                  </button>
                </div>
              )}

              {dateRange.start && dateRange.end && (
                <div className="text-sm text-gray-600 mb-4">
                  Showing data from {new Date(dateRange.start).toLocaleDateString()} to {new Date(dateRange.end).toLocaleDateString()}
                </div>
              )}

              <div className="overflow-x-auto">
                <ResponsiveContainer width="100%" height={250} minWidth={300}>
                  <LineChart data={getChartData(statsDateRange)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                    <YAxis />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    {habits.map(habit => (
                      <Line
                        key={habit.id}
                        type="monotone"
                        dataKey={habit.name}
                        stroke={habit.color}
                        strokeWidth={3}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 transform hover:scale-105 transition-transform">
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                  Completion Rate
                </h2>
                <div className="overflow-x-auto">
                  <ResponsiveContainer width="100%" height={250} minWidth={250}>
                    <BarChart data={getWeeklyData(statsDateRange)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" style={{ fontSize: '11px' }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="completed" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                        {getWeeklyData(statsDateRange).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 transform hover:scale-105 transition-transform">
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">
                  Total Distribution
                </h2>
                <div className="overflow-x-auto">
                  <ResponsiveContainer width="100%" height={250} minWidth={250}>
                    <PieChart>
                      <Pie
                        data={getCompletionDistribution(statsDateRange)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {getCompletionDistribution(statsDateRange).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 flex items-center gap-2">
                <Award className="w-5 h-5 md:w-6 md:h-6" />
                Achievements
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {habits.map(habit => (
                  <div key={habit.id} className="border-2 border-purple-100 rounded-xl p-3 md:p-4 hover:border-purple-300 transition hover:shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-3 h-3 rounded-full shadow-md"
                        style={{ backgroundColor: habit.color }}
                      />
                      <h3 className="font-bold text-gray-800 text-sm md:text-base truncate">{habit.name}</h3>
                    </div>
                    <div className="space-y-2 text-xs md:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Streak:</span>
                        <span className="font-semibold text-orange-600">
                          {getCurrentStreak(habit)} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Best Streak:</span>
                        <span className="font-semibold text-purple-600">
                          {getLongestStreak(habit)} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-semibold text-green-600">
                          {getTotalCompletions(habit)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rate:</span>
                        <span className="font-semibold text-blue-600">
                          {getCompletionRate(habit, statsDateRange)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showCalendar && selectedHabitForCalendar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-4 md:p-6 border-b-2 border-purple-100 rounded-t-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                    {selectedHabitForCalendar.name}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCalendar(false);
                      setSelectedHabitForCalendar(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={previousMonth}
                    className="p-2 rounded-full hover:bg-purple-100 transition"
                  >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                  </button>
                  <div className="text-base md:text-lg font-bold">
                    {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                  <button
                    onClick={nextMonth}
                    className="p-2 rounded-full hover:bg-purple-100 transition"
                  >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 md:p-6">
                <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-xs font-semibold text-gray-600">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 md:gap-2">
                  {calendarDays.map((date, index) => (
                    <button
                      key={index}
                      onClick={() => date && toggleCompletion(selectedHabitForCalendar.id, date)}
                      disabled={!date}
                      className={`aspect-square rounded-lg transition-all text-xs md:text-sm font-semibold ${
                        !date
                          ? 'invisible'
                          : selectedHabitForCalendar.completions[date]
                          ? 'bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-lg'
                          : 'bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300'
                      }`}
                    >
                      {date ? (selectedHabitForCalendar.completions[date] ? '✓' : new Date(date).getDate()) : ''}
                    </button>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Month Total</div>
                      <div className="text-xl font-bold text-purple-600">
                        {calendarDays.filter(d => d && selectedHabitForCalendar.completions[d]).length}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Completion Rate</div>
                      <div className="text-xl font-bold text-blue-600">
                        {getCompletionRate(selectedHabitForCalendar, calendarDays.filter(d => d))}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitTracker;
                