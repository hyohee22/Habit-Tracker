import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Check, Calendar as CalendarIcon, BarChart3, Home, Trash2, ChevronLeft, ChevronRight, Sparkles, Users, Trophy, UserPlus, Heart, Bell, X, Medal, RefreshCcw, AlertCircle } from 'lucide-react';
import { Habit, DailyLog, TimeRange, ChartDataPoint, Friend } from './types';
import { CrystalOrb } from './components/CrystalOrb';
import { StatsChart } from './components/StatsChart';

// --- Helper Functions ---

// Use local time for date strings to avoid timezone issues
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayString = () => formatDate(new Date());

const generateId = () => Math.random().toString(36).substr(2, 9);
const generateUserCode = () => Math.random().toString(36).substr(2, 6).toUpperCase();

// --- Constants ---

const RECOMMENDED_HABITS = [
  {
    category: "건강",
    items: ["물 마시기 💧", "스트레칭 🧘", "영양제 먹기 💊", "7시간 수면 😴"]
  },
  {
    category: "성장",
    items: ["독서 30분 📚", "영어 단어 5개 🅰️", "뉴스 읽기 📰", "일기 쓰기 ✍️"]
  },
  {
    category: "마음챙김",
    items: ["명상하기 🧘‍♀️", "감사일기 💌", "스마트폰 멀리하기 📵"]
  }
];

const QUOTES = [
  { text: "습관은 밧줄과 같다. 매일 한 가닥씩 엮다 보면 끊을 수 없게 된다.", author: "호레이스 만" },
  { text: "성공은 매일 반복되는 작은 노력들의 합이다.", author: "로버트 콜리어" },
  { text: "오늘 걷지 않으면 내일은 뛰어야 한다.", author: "카를레스 푸욜" },
  { text: "작은 변화가 일어날 때 진정한 삶을 살게 된다.", author: "레프 톨스토이" },
  { text: "시작이 반이다.", author: "아리스토텔레스" },
  { text: "미래를 예측하는 가장 좋은 방법은 미래를 창조하는 것이다.", author: "피터 드러커" },
  { text: "멈추지 않는 한 얼마나 천천히 가는지는 중요하지 않다.", author: "공자" },
  { text: "나중은 결코 오지 않는다. 지금 하라.", author: "익명" },
  { text: "탁월함은 행동이 아니라 습관이다.", author: "아리스토텔레스" },
  { text: "우리가 반복적으로 하는 것이 우리 자신이다.", author: "아리스토텔레스" }
];

const MOCK_FRIEND_NAMES = ["Orbit", "Nova", "Luna", "Star", "Cosmos"];
const MOCK_AVATARS = ["👩‍🚀", "👽", "🤖", "👻", "👾"];

export default function App() {
  // --- State ---
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habits');
    return saved ? JSON.parse(saved) : [];
  });

  const [logs, setLogs] = useState<DailyLog>(() => {
    const saved = localStorage.getItem('logs');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [friends, setFriends] = useState<Friend[]>(() => {
      const saved = localStorage.getItem('friends');
      return saved ? JSON.parse(saved) : [
          { id: 'bot1', name: 'Nova', avatar: '👽', score: 75, statusMessage: 'Focusing...' },
          { id: 'bot2', name: 'Luna', avatar: '🤖', score: 40, statusMessage: 'Beep Boop' }
      ];
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Custom Calendar State
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(new Date());

  const [view, setView] = useState<'home' | 'stats' | 'recommendations' | 'social'>('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  // Streak Modal State
  const [streakModal, setStreakModal] = useState<{ show: boolean, days: number } | null>(null);
  
  const [newHabitName, setNewHabitName] = useState('');
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.WEEK);
  const [userCode] = useState(() => localStorage.getItem('userCode') || generateUserCode());

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('friends', JSON.stringify(friends));
  }, [friends]);
  
  useEffect(() => {
      localStorage.setItem('userCode', userCode);
  }, [userCode]);

  // --- Logic ---

  const dateKey = formatDate(selectedDate);
  const activeHabits = habits.filter(h => !h.isDeleted);
  const deletedHabits = habits.filter(h => h.isDeleted);
  const completedToday = logs[dateKey] || [];
  
  const completionPercentage = useMemo(() => {
    if (activeHabits.length === 0) return 0;
    return (completedToday.length / activeHabits.length) * 100;
  }, [activeHabits.length, completedToday.length]);

  const todayQuote = useMemo(() => {
    const str = formatDate(selectedDate);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % QUOTES.length;
    return QUOTES[index];
  }, [selectedDate]);

  // Helper to check streak
  const checkStreak = (currentLogs: DailyLog, targetHabits: Habit[]) => {
      const today = getTodayString();
      if (dateKey !== today) return; 

      const todayCompleted = currentLogs[today]?.length || 0;
      // Only check streak if today's active habits are fully done
      const currentActiveHabits = targetHabits.filter(h => !h.isDeleted);
      if (todayCompleted < currentActiveHabits.length || currentActiveHabits.length === 0) return;

      let streak = 1; 
      const now = new Date();
      
      for (let i = 1; i <= 30; i++) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dKey = formatDate(d);
          const dayLog = currentLogs[dKey] || [];
          
          if (dayLog.length >= currentActiveHabits.length) {
              streak++;
          } else {
              break;
          }
      }

      if (streak === 7) {
          setStreakModal({ show: true, days: 7 });
      } else if (streak === 30) {
          setStreakModal({ show: true, days: 30 });
      }
  };

  const toggleHabit = (habitId: string) => {
    let newLogs: DailyLog = {};
    
    setLogs(prev => {
      const currentDayLogs = prev[dateKey] || [];
      const isCompleted = currentDayLogs.includes(habitId);
      
      let newDayLogs;
      if (isCompleted) {
        newDayLogs = currentDayLogs.filter(id => id !== habitId);
      } else {
        newDayLogs = [...currentDayLogs, habitId];
      }

      newLogs = {
        ...prev,
        [dateKey]: newDayLogs
      };
      return newLogs;
    });

    setTimeout(() => checkStreak(newLogs, habits), 0);
  };

  const addHabit = (name?: string) => {
    const habitName = name || newHabitName;
    if (!habitName.trim()) return;
    
    if (name && habits.some(h => h.name === name && !h.isDeleted)) {
        alert("이미 등록된 습관입니다.");
        return;
    }

    const newHabit: Habit = {
      id: generateId(),
      name: habitName,
      category: 'General',
      color: 'teal',
      createdAt: Date.now(),
      isDeleted: false
    };
    setHabits([...habits, newHabit]);
    
    if (!name) {
        setNewHabitName('');
        setIsModalOpen(false);
    }
  };

  const softDeleteHabit = (id: string) => {
    if(window.confirm("휴지통으로 이동하시겠습니까?")) {
        setHabits(habits.map(h => h.id === id ? { ...h, isDeleted: true } : h));
    }
  };

  const restoreHabit = (id: string) => {
      setHabits(habits.map(h => h.id === id ? { ...h, isDeleted: false } : h));
  };

  const permanentlyDeleteHabit = (id: string) => {
      if(window.confirm("영구적으로 삭제됩니다. 계속하시겠습니까?")) {
          setHabits(habits.filter(h => h.id !== id));
      }
  };

  const completeAll = () => {
    const allHabitIds = activeHabits.map(h => h.id);
    const newLogs = {
        ...logs,
        [dateKey]: allHabitIds
    };
    setLogs(newLogs);
    setTimeout(() => checkStreak(newLogs, habits), 0);
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  // Calendar Helpers
  const openCalendar = () => {
    setCalendarViewDate(new Date(selectedDate));
    setIsCalendarOpen(true);
  };

  const changeCalendarMonth = (delta: number) => {
    const newDate = new Date(calendarViewDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCalendarViewDate(newDate);
  };

  const selectCalendarDate = (date: Date) => {
    setSelectedDate(date);
    setIsCalendarOpen(false);
  };

  const addFriend = () => {
      if (!friendCodeInput.trim()) return;
      
      const randomName = MOCK_FRIEND_NAMES[Math.floor(Math.random() * MOCK_FRIEND_NAMES.length)];
      const randomAvatar = MOCK_AVATARS[Math.floor(Math.random() * MOCK_AVATARS.length)];
      const randomScore = Math.floor(Math.random() * 100);

      const newFriend: Friend = {
          id: generateId(),
          name: randomName,
          avatar: randomAvatar,
          score: randomScore,
          statusMessage: 'Just joined!'
      };

      setFriends([...friends, newFriend]);
      setFriendCodeInput('');
      setIsFriendModalOpen(false);
  };

  // --- Stats Data Calculation ---
  const chartData: ChartDataPoint[] = useMemo(() => {
    const data: ChartDataPoint[] = [];
    const now = new Date();
    
    if (timeRange === TimeRange.WEEK) {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const k = formatDate(d);
        const dayLogs = logs[k] || [];
        
        data.push({
          name: d.toLocaleDateString('ko-KR', { weekday: 'short' }),
          goal: activeHabits.length,
          completed: dayLogs.length,
          amt: activeHabits.length
        });
      }
    } else if (timeRange === TimeRange.MONTH) {
       for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const k = formatDate(d);
        const dayLogs = logs[k] || [];
        const name = i % 5 === 0 ? d.getDate().toString() : ''; 
        data.push({
          name,
          goal: activeHabits.length,
          completed: dayLogs.length,
          amt: activeHabits.length
        });
      }
    } else if (timeRange === TimeRange.YEAR) {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = d.toLocaleDateString('ko-KR', { month: 'short' });
        
        let monthlyCompleted = 0;
        let monthlyGoal = 0;
        
        const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        for(let j=1; j<=daysInMonth; j++) {
            const currentDay = new Date(d.getFullYear(), d.getMonth(), j);
            const k = formatDate(currentDay);
            monthlyCompleted += (logs[k] || []).length;
            monthlyGoal += activeHabits.length; 
        }

        data.push({
          name: monthName,
          goal: monthlyGoal,
          completed: monthlyCompleted,
          amt: monthlyGoal
        });
      }
    }
    return data;
  }, [timeRange, logs, activeHabits.length]);
  
  // Advanced Insights
  const statsInsights = useMemo(() => {
    const now = new Date();
    // 1. Weekly Success Rate
    let weeklyCompleted = 0;
    let weeklyGoal = 0;
    for(let i=0; i<7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const k = formatDate(d);
        weeklyCompleted += (logs[k] || []).length;
        // Approximation: assumes activeHabits count was constant, which is a limitation but fine for MVP
        weeklyGoal += activeHabits.length; 
    }
    const weeklyRate = weeklyGoal > 0 ? Math.round((weeklyCompleted / weeklyGoal) * 100) : 0;

    // 2. Top 3 Habits (Last 30 days)
    const habitCounts: Record<string, number> = {};
    for(let i=0; i<30; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const k = formatDate(d);
        const dayLogs = logs[k] || [];
        dayLogs.forEach(id => {
            habitCounts[id] = (habitCounts[id] || 0) + 1;
        });
    }
    const topHabits = Object.entries(habitCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([id, count]) => {
            const h = habits.find(habit => habit.id === id);
            return h ? { name: h.name, count } : null;
        })
        .filter(Boolean) as { name: string, count: number }[];

    // 3. Worst Day of Week (Last 30 days)
    const dayStats: Record<number, { completed: number, total: number }> = {
        0: {completed: 0, total: 0}, 1: {completed: 0, total: 0}, 2: {completed: 0, total: 0},
        3: {completed: 0, total: 0}, 4: {completed: 0, total: 0}, 5: {completed: 0, total: 0},
        6: {completed: 0, total: 0}
    };
    for(let i=0; i<30; i++) {
         const d = new Date(now);
         d.setDate(d.getDate() - i);
         const dayIdx = d.getDay();
         const k = formatDate(d);
         const completed = (logs[k] || []).length;
         dayStats[dayIdx].completed += completed;
         dayStats[dayIdx].total += activeHabits.length;
    }
    
    let worstDayIndex = -1;
    let worstRate = 101;
    Object.entries(dayStats).forEach(([day, stat]) => {
        if(stat.total > 0) {
            const rate = (stat.completed / stat.total) * 100;
            if(rate < worstRate) {
                worstRate = rate;
                worstDayIndex = Number(day);
            }
        }
    });
    
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const worstDayName = worstDayIndex !== -1 ? days[worstDayIndex] : '-';

    return { weeklyRate, topHabits, worstDayName };

  }, [logs, activeHabits, habits]);

  const rankedUsers = useMemo(() => {
      const myData = {
          id: 'me',
          name: '나',
          avatar: '🧑‍🚀',
          score: Math.round(completionPercentage),
          statusMessage: '집중하는 중...',
          isMe: true
      };
      return [...friends, myData].sort((a, b) => b.score - a.score);
  }, [friends, completionPercentage]);

  // --- UI Components ---

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-teal-500 selection:text-white pb-24">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-900/20 blur-[100px]" />
      </div>

      {/* Header / Date Selector */}
      {view === 'home' && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/5 px-4 py-4">
          <div className="max-w-md mx-auto relative flex items-center justify-center">
            
            {/* Left Button */}
            <button onClick={() => changeDate(-1)} className="absolute left-0 p-2 hover:bg-white/10 rounded-full transition-colors">
              <ChevronLeft size={20} className="text-gray-400" />
            </button>
            
            {/* Center Title */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-teal-400 font-medium tracking-wider mb-1">
                {selectedDate.toLocaleDateString('ko-KR', { year: 'numeric' })}
              </span>
              <h1 className="text-lg font-bold">
                 {selectedDate.toDateString() === new Date().toDateString() 
                  ? "오늘" 
                  : selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
              </h1>
            </div>

            {/* Right Buttons: Next & Calendar */}
            <div className="absolute right-0 flex items-center gap-1">
                <button onClick={() => changeDate(1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ChevronRight size={20} className="text-gray-400" />
                </button>
                <button 
                    onClick={openCalendar}
                    className="p-2 rounded-full text-gray-400 hover:bg-white/10 transition-colors"
                >
                    <CalendarIcon size={18} />
                </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="relative z-10 max-w-md mx-auto px-4 pt-24">
        
        {view === 'home' && (
          <>
            {/* Quote Card */}
            <div className="mb-2 mt-4 mx-1 p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 relative overflow-hidden backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-700">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-400 to-purple-400 opacity-70" />
                <p className="text-sm text-gray-200 font-medium leading-relaxed italic">
                    "{todayQuote.text}"
                </p>
                <p className="text-xs text-gray-500 mt-2 text-right font-medium">
                    {todayQuote.author}
                </p>
            </div>

            {/* Visualizer */}
            <CrystalOrb percentage={completionPercentage} />

            {/* Habit List */}
            <div className="space-y-3">
              <div className="flex justify-between items-end mb-4 px-1">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-200">내 습관</h2>
                    <button 
                        onClick={() => setIsTrashOpen(true)}
                        className="text-gray-600 hover:text-red-400 transition-colors p-1"
                        title="휴지통"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> 추가하기
                </button>
              </div>

              {activeHabits.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-gray-500">아직 등록된 습관이 없어요.</p>
                </div>
              ) : (
                activeHabits.map((habit) => {
                  const isDone = completedToday.includes(habit.id);
                  return (
                    <div 
                      key={habit.id}
                      onClick={() => toggleHabit(habit.id)}
                      className={`group relative overflow-hidden p-4 rounded-2xl border transition-all duration-300 cursor-pointer
                        ${isDone 
                          ? 'bg-teal-900/20 border-teal-500/30 shadow-[0_0_15px_-3px_rgba(20,184,166,0.2)]' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between z-10 relative">
                         <span className={`text-base font-medium transition-colors ${isDone ? 'text-teal-100' : 'text-gray-300'}`}>
                            {habit.name}
                         </span>
                         <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all
                            ${isDone ? 'bg-teal-500 border-teal-500' : 'border-gray-600 bg-transparent'}
                         `}>
                             {isDone && <Check size={14} className="text-black" strokeWidth={3} />}
                         </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); softDeleteHabit(habit.id); }}
                        className="absolute right-12 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Complete All Button */}
            {activeHabits.length > 0 && (
              <div className="mt-8">
                <button 
                    onClick={completeAll}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold text-lg shadow-lg shadow-teal-900/50 hover:shadow-teal-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                    <Sparkles size={18} />
                    모두 완료하기
                </button>
                <p className="text-center text-gray-600 text-xs mt-3">
                  오늘의 달성률: {Math.round(completionPercentage)}%
                </p>
              </div>
            )}
          </>
        )}

        {view === 'stats' && (
          <div className="animate-in fade-in pt-4 pb-20">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <BarChart3 size={20} className="text-teal-400" /> 통계 및 분석
            </h2>

            {/* Insight Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                {/* Weekly Rate */}
                <div className="col-span-2 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-end">
                        <div>
                            <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider block mb-1">이번 주 성공률</span>
                            <div className="text-3xl font-bold text-white">{statsInsights.weeklyRate}%</div>
                        </div>
                        <div className="bg-white/10 p-2 rounded-full">
                            <BarChart3 size={20} className="text-indigo-200" />
                        </div>
                    </div>
                </div>

                {/* Worst Day */}
                <div className="col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-2">
                         <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">가장 힘든 요일</span>
                         <AlertCircle size={16} className="text-red-400" />
                    </div>
                    <div className="text-xl font-bold text-white flex items-center gap-2">
                        {statsInsights.worstDayName}
                        {statsInsights.worstDayName !== '-' && <span className="text-sm font-normal text-gray-500">에 가장 많이 실패했어요</span>}
                    </div>
                </div>
            </div>

            {/* Top 3 Habits */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-4">가장 잘 지킨 습관 TOP 3</span>
                <div className="space-y-4">
                    {statsInsights.topHabits.length > 0 ? (
                        statsInsights.topHabits.map((h, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg
                                    ${i === 0 ? 'bg-yellow-400 text-yellow-900' : 
                                      i === 1 ? 'bg-gray-300 text-gray-800' : 
                                      'bg-amber-600 text-amber-100'}
                                `}>
                                    {i+1}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-white">{h.name}</div>
                                    <div className="text-[10px] text-gray-500">{h.count}회 완료</div>
                                </div>
                                {i === 0 && <Trophy size={16} className="text-yellow-500" />}
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">아직 데이터가 충분하지 않아요.</p>
                    )}
                </div>
            </div>
            
            <div className="flex bg-white/5 p-1 rounded-xl mb-4">
              {Object.values(TimeRange).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all
                    ${timeRange === range 
                      ? 'bg-white/10 text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-300'
                    }
                  `}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Main Chart */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-6">
                <div className="flex justify-between items-end mb-4">
                    <div>
                    <span className="text-xs text-gray-400 block mb-1">차트 분석</span>
                    <div className="text-lg font-bold text-white">
                        습관 달성 추이
                    </div>
                    </div>
                </div>
                <StatsChart data={chartData} />
            </div>
          </div>
        )}

        {view === 'recommendations' && (
          <div className="animate-in fade-in pt-4">
             <div className="mb-6">
               <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                   <Sparkles size={20} className="text-purple-400" /> 추천 습관
               </h2>
               <p className="text-gray-500 text-sm">새로운 루틴을 시작해보세요.</p>
             </div>

             <div className="space-y-6">
                {RECOMMENDED_HABITS.map((section, idx) => (
                  <div key={idx}>
                     <h3 className="text-sm font-bold text-gray-400 mb-3 ml-1">{section.category}</h3>
                     <div className="grid grid-cols-1 gap-2">
                        {section.items.map((item, i) => {
                            const isAdded = activeHabits.some(h => h.name === item);
                            return (
                                <button
                                    key={i}
                                    onClick={() => addHabit(item)}
                                    disabled={isAdded}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left
                                        ${isAdded 
                                            ? 'bg-white/5 border-white/5 opacity-50 cursor-default' 
                                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                        }
                                    `}
                                >
                                    <span className="text-sm">{item}</span>
                                    {isAdded ? <Check size={14} className="text-teal-500" /> : <Plus size={14} className="text-gray-400" />}
                                </button>
                            )
                        })}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {view === 'social' && (
            <div className="animate-in fade-in pt-4">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Users size={20} className="text-blue-400" /> 소셜
                        </h2>
                    </div>
                    <button 
                        onClick={() => setIsFriendModalOpen(true)}
                        className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
                    >
                        <UserPlus size={20} />
                    </button>
                </div>

                {/* My Code Ticket */}
                <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-white/10 rounded-2xl p-5 mb-8 relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <span className="text-xs text-indigo-300 font-medium block mb-1">내 친구 코드</span>
                            <span className="text-2xl font-mono font-bold tracking-widest text-white">{userCode}</span>
                        </div>
                        <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center">
                            <Users size={20} className="text-indigo-200" />
                        </div>
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <Trophy size={14} className="text-yellow-500" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">랭킹</span>
                    </div>

                    {rankedUsers.map((user, index) => (
                        <div 
                            key={user.id}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all
                                ${user.id === 'me' 
                                    ? 'bg-teal-900/10 border-teal-500/30' 
                                    : 'bg-white/5 border-white/5'
                                }
                            `}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-6 text-center font-bold text-sm ${index < 3 ? 'text-yellow-400' : 'text-gray-600'}`}>
                                    {index + 1}
                                </div>
                                <div className="text-2xl">
                                    {user.avatar}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-medium ${user.id === 'me' ? 'text-teal-400' : 'text-white'}`}>
                                            {user.name}
                                        </span>
                                        {user.id === 'me' && <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded">ME</span>}
                                    </div>
                                    <div className="text-xs text-gray-500">{user.statusMessage}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="font-bold text-lg">{user.score}%</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 pb-safe z-50">
        <div className="max-w-md mx-auto flex justify-around items-center h-16">
          {[
            { id: 'home', icon: Home, label: '홈' },
            { id: 'recommendations', icon: Sparkles, label: '추천' },
            { id: 'social', icon: Users, label: '소셜' },
            { id: 'stats', icon: BarChart3, label: '통계' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`flex flex-col items-center justify-center w-16 gap-1 transition-all
                ${view === item.id ? 'text-teal-400' : 'text-gray-600 hover:text-gray-400'}
              `}
            >
              <item.icon size={22} strokeWidth={view === item.id ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Streak Celebration Modal */}
      {streakModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
           <div className="relative bg-gradient-to-b from-gray-900 to-black border border-teal-500/30 w-full max-w-sm rounded-[2rem] p-8 shadow-[0_0_50px_-10px_rgba(20,184,166,0.5)] animate-in zoom-in-95 duration-500 flex flex-col items-center text-center">
              
              <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
                 <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(45,212,191,0.2)_0%,transparent_70%)] animate-pulse" />
              </div>

              <div className="relative z-10 mb-6 bg-teal-500/20 p-4 rounded-full border border-teal-400/30 shadow-[0_0_20px_rgba(45,212,191,0.4)]">
                 <Medal size={48} className="text-teal-400" />
              </div>

              <h2 className="relative z-10 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-teal-500 mb-2">
                {streakModal.days}일 연속 성공!
              </h2>
              <p className="relative z-10 text-gray-400 mb-8 text-sm">
                꾸준함이 빛을 발하고 있어요.<br/>정말 대단합니다!
              </p>

              <button 
                onClick={() => setStreakModal(null)}
                className="relative z-10 w-full py-4 rounded-xl bg-teal-600 text-white font-bold text-lg hover:bg-teal-500 transition-all shadow-lg shadow-teal-900/40"
              >
                멋져요!
              </button>
           </div>
        </div>
      )}

      {/* Custom Calendar Modal */}
      {isCalendarOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsCalendarOpen(false)}>
            <div 
                className="bg-gray-900 border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Calendar Header */}
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => changeCalendarMonth(-1)} className="p-2 hover:bg-white/5 rounded-full text-gray-400">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-bold text-lg text-white">
                        {calendarViewDate.getFullYear()}년 {calendarViewDate.getMonth() + 1}월
                    </span>
                    <button onClick={() => changeCalendarMonth(1)} className="p-2 hover:bg-white/5 rounded-full text-gray-400">
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 text-center mb-2">
                    {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                        <div key={day} className="text-xs font-medium text-gray-500 py-1">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-y-3 gap-x-1">
                    {(() => {
                        const year = calendarViewDate.getFullYear();
                        const month = calendarViewDate.getMonth();
                        const firstDay = new Date(year, month, 1).getDay();
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        const days = [];

                        // Empty slots for start of month
                        for (let i = 0; i < firstDay; i++) {
                            days.push(<div key={`empty-${i}`} />);
                        }

                        // Days
                        for (let i = 1; i <= daysInMonth; i++) {
                            const date = new Date(year, month, i);
                            const dateString = formatDate(date);
                            const isSelected = formatDate(selectedDate) === dateString;
                            const isToday = formatDate(new Date()) === dateString;
                            const hasData = logs[dateString] && logs[dateString].length > 0;

                            days.push(
                                <button
                                    key={i}
                                    onClick={() => selectCalendarDate(date)}
                                    className={`relative flex flex-col items-center justify-center h-10 w-10 rounded-full text-sm font-medium transition-all
                                        ${isSelected 
                                            ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/50' 
                                            : isToday 
                                                ? 'border border-teal-500 text-teal-400' 
                                                : 'text-gray-300 hover:bg-white/5'
                                        }
                                    `}
                                >
                                    {i}
                                    {hasData && !isSelected && (
                                        <span className="absolute bottom-1 w-1 h-1 bg-purple-500 rounded-full" />
                                    )}
                                </button>
                            );
                        }
                        return days;
                    })()}
                </div>
                
                <button 
                    onClick={() => selectCalendarDate(new Date())}
                    className="w-full mt-6 py-3 rounded-xl bg-white/5 text-teal-400 font-medium hover:bg-white/10 transition-colors text-sm"
                >
                    오늘로 이동
                </button>
            </div>
        </div>
      )}

      {/* Add Habit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white mb-4">새로운 습관 추가</h3>
            <input
              autoFocus
              type="text"
              placeholder="예: 물 마시기, 독서하기..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 mb-6 transition-colors"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addHabit()}
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3.5 rounded-xl bg-white/5 text-gray-400 font-medium hover:bg-white/10 transition-colors"
              >
                취소
              </button>
              <button 
                onClick={() => addHabit()}
                className="flex-1 py-3.5 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-500 transition-colors shadow-lg shadow-teal-900/50"
              >
                추가하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trash Bin Modal */}
      {isTrashOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 h-[70vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                   <Trash2 size={20} className="text-red-400" /> 휴지통
                </h3>
                <button onClick={() => setIsTrashOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
                    <X size={20} />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {deletedHabits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                        <Trash2 size={30} className="opacity-30" />
                        <p>비어있습니다</p>
                    </div>
                ) : (
                    deletedHabits.map((habit) => (
                        <div key={habit.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                            <span className="text-gray-400 line-through">{habit.name}</span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => restoreHabit(habit.id)}
                                    className="p-2 bg-teal-900/30 text-teal-400 rounded-lg hover:bg-teal-900/50 transition-colors"
                                    title="복구"
                                >
                                    <RefreshCcw size={16} />
                                </button>
                                <button 
                                    onClick={() => permanentlyDeleteHabit(habit.id)}
                                    className="p-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors"
                                    title="영구 삭제"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
          </div>
        </div>
      )}

      {/* Add Friend Modal */}
      {isFriendModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white mb-2">친구 추가</h3>
            <p className="text-sm text-gray-500 mb-6">친구의 코드를 입력하여 함께 습관을 만들어가요.</p>
            
            <input
              autoFocus
              type="text"
              placeholder="코드 입력 (예: AB12CD)"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 mb-6 text-center font-mono uppercase tracking-widest text-lg"
              value={friendCodeInput}
              onChange={(e) => setFriendCodeInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && addFriend()}
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setIsFriendModalOpen(false)}
                className="flex-1 py-3.5 rounded-xl bg-white/5 text-gray-400 font-medium hover:bg-white/10 transition-colors"
              >
                닫기
              </button>
              <button 
                onClick={addFriend}
                className="flex-1 py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/50"
              >
                친구 추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}