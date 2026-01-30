
import React, { useState, useEffect, useMemo } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isToday,
  isWeekend,
  isFuture,
  isPast
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  Users, 
  Download, 
  CheckCircle2, 
  XCircle,
  Bike,
  AlertTriangle,
  PieChart as PieIcon,
  Calendar as CalendarIcon,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  FileSpreadsheet
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { MonthlyData, DayRecord } from './types';
import { TRIP_COST_PER_WAY, DAILY_TOTAL_POTENTIAL } from './constants';
import { isHoliday, canRegister, getDateKey } from './utils/dateUtils';

interface ConfirmState {
  isOpen: boolean;
  date?: Date;
  user?: 'jorge' | 'william';
  status?: 'full' | 'ida' | 'reg' | 'none';
}

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [records, setRecords] = useState<MonthlyData>(() => {
    const saved = localStorage.getItem('moto_tracker_pro_v2');
    return saved ? JSON.parse(saved) : {};
  });

  const [confirmState, setConfirmState] = useState<ConfirmState>({ isOpen: false });

  useEffect(() => {
    localStorage.setItem('moto_tracker_pro_v2', JSON.stringify(records));
  }, [records]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const handleStatusChange = (date: Date, user: 'jorge' | 'william', status: 'full' | 'ida' | 'reg' | 'none') => {
    setConfirmState({
      isOpen: true,
      date,
      user,
      status
    });
  };

  const confirmChange = () => {
    if (!confirmState.date || !confirmState.user || !confirmState.status) return;

    const key = getDateKey(confirmState.date);
    const status = confirmState.status;

    setRecords(prev => {
      const dayRecord = prev[key] || {
        jorge: { ida: false, regresso: false },
        william: { ida: false, regresso: false }
      };

      const newUserState = {
        ida: status === 'full' || status === 'ida',
        regresso: status === 'full' || status === 'reg'
      };

      return {
        ...prev,
        [key]: {
          ...dayRecord,
          [confirmState.user!]: newUserState
        }
      };
    });

    setConfirmState({ isOpen: false });
  };

  const stats = useMemo(() => {
    const monthKeyPrefix = format(currentDate, 'yyyy-MM');
    const allDaysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    let jorgeConfirmed = 0;
    let williamConfirmed = 0;
    let jorgeDaysCount = 0;
    let williamDaysCount = 0;
    let workingDaysTotal = 0;
    let workingDaysPassed = 0;
    let workingDaysRemaining = 0;

    allDaysInMonth.forEach(day => {
      if (canRegister(day) && !isHoliday(day)) {
        workingDaysTotal++;
        if (isFuture(day)) workingDaysRemaining++;
        else workingDaysPassed++;
      }
    });

    (Object.entries(records) as [string, DayRecord][]).forEach(([key, record]) => {
      if (key.startsWith(monthKeyPrefix)) {
        if (record.jorge.ida) jorgeConfirmed += TRIP_COST_PER_WAY;
        if (record.jorge.regresso) jorgeConfirmed += TRIP_COST_PER_WAY;
        if (record.william.ida) williamConfirmed += TRIP_COST_PER_WAY;
        if (record.william.regresso) williamConfirmed += TRIP_COST_PER_WAY;
        
        if (record.jorge.ida || record.jorge.regresso) jorgeDaysCount++;
        if (record.william.ida || record.william.regresso) williamDaysCount++;
      }
    });

    const forecastJorge = jorgeConfirmed + (workingDaysRemaining * DAILY_TOTAL_POTENTIAL);
    const forecastWilliam = williamConfirmed + (workingDaysRemaining * DAILY_TOTAL_POTENTIAL);

    return { 
      jorgeConfirmed, 
      williamConfirmed, 
      jorgeDaysCount, 
      williamDaysCount,
      forecastJorge,
      forecastWilliam,
      workingDaysTotal,
      workingDaysRemaining,
      avgJorge: jorgeDaysCount > 0 ? jorgeConfirmed / jorgeDaysCount : 0,
      avgWilliam: williamDaysCount > 0 ? williamConfirmed / williamDaysCount : 0
    };
  }, [records, currentDate]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-inter selection:bg-sky-500/30">
      
      {/* Header Premium */}
      <header className="sticky top-0 z-30 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800/60 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Bike className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">MotoTracker <span className="text-sky-500">PRO</span></h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Angola Logistics Control</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
              <button 
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-1.5 hover:bg-slate-800 rounded-md transition-colors text-slate-400"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="px-4 font-semibold text-sm capitalize min-w-[120px] text-center">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </div>
              <button 
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-1.5 hover:bg-slate-800 rounded-md transition-colors text-slate-400"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <button onClick={() => window.print()} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-all border border-slate-700">
              <Download size={14} /> EXPORTAR
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Gasto Total Confirmado</span>
              <Wallet className="text-emerald-500" size={16} />
            </div>
            <div className="text-2xl font-black text-white">{(stats.jorgeConfirmed + stats.williamConfirmed).toLocaleString()} Kz</div>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
              <ArrowUpRight size={12} /> +12% vs mês anterior
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Previsão de Fechamento</span>
              <TrendingUp className="text-sky-500" size={16} />
            </div>
            <div className="text-2xl font-black text-white">{(stats.forecastJorge + stats.forecastWilliam).toLocaleString()} Kz</div>
            <div className="mt-2 text-[10px] text-slate-500 font-medium">Considerando {stats.workingDaysRemaining} dias úteis restantes</div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Média Diária (Grupo)</span>
              <PieIcon className="text-indigo-500" size={16} />
            </div>
            <div className="text-2xl font-black text-white">{( (stats.avgJorge + stats.avgWilliam) ).toLocaleString()} Kz</div>
            <div className="mt-2 text-[10px] text-slate-500 font-medium">Por dia de deslocamento efetivo</div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Eficiência de Presença</span>
              <CheckCircle2 className="text-amber-500" size={16} />
            </div>
            <div className="text-2xl font-black text-white">
              {Math.round(((stats.jorgeDaysCount + stats.williamDaysCount) / (stats.workingDaysTotal * 2)) * 100) || 0}%
            </div>
            <div className="mt-2 text-[10px] text-slate-500 font-medium">Em relação aos dias úteis totais</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* User Profile Cards */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Jorge Profile */}
            <div className="group relative bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-3xl overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users size={80} />
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 font-black text-xl">J</div>
                <div>
                  <h3 className="text-lg font-bold text-white">Jorge</h3>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-sky-500/10 text-sky-500 rounded-full border border-sky-500/20 uppercase tracking-tighter">Premium User</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Confirmado</p>
                    <p className="text-2xl font-black text-white">{stats.jorgeConfirmed.toLocaleString()} <span className="text-xs font-medium text-slate-400">Kz</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Previsão</p>
                    <p className="text-sm font-bold text-sky-400">{stats.forecastJorge.toLocaleString()} Kz</p>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-500 transition-all duration-1000" 
                    style={{ width: `${(stats.jorgeConfirmed / stats.forecastJorge) * 100 || 0}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800/50">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Viagens</p>
                    <p className="text-sm font-bold text-white">{stats.jorgeDaysCount} dias</p>
                  </div>
                  <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800/50">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Média</p>
                    <p className="text-sm font-bold text-white">{Math.round(stats.avgJorge)} Kz</p>
                  </div>
                </div>
              </div>
            </div>

            {/* William Profile */}
            <div className="group relative bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-3xl overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users size={80} />
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-black text-xl">W</div>
                <div>
                  <h3 className="text-lg font-bold text-white">William</h3>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 uppercase tracking-tighter">Premium User</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Confirmado</p>
                    <p className="text-2xl font-black text-white">{stats.williamConfirmed.toLocaleString()} <span className="text-xs font-medium text-slate-400">Kz</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Previsão</p>
                    <p className="text-sm font-bold text-emerald-400">{stats.forecastWilliam.toLocaleString()} Kz</p>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000" 
                    style={{ width: `${(stats.williamConfirmed / stats.forecastWilliam) * 100 || 0}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800/50">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Viagens</p>
                    <p className="text-sm font-bold text-white">{stats.williamDaysCount} dias</p>
                  </div>
                  <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800/50">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Média</p>
                    <p className="text-sm font-bold text-white">{Math.round(stats.avgWilliam)} Kz</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl no-print">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileSpreadsheet size={16} className="text-sky-500" /> Relatórios Rápidos
              </h3>
              <div className="space-y-2">
                <button className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-2">
                   Baixar Excel Completo
                </button>
                <button className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-2">
                   Relatório PDF Detalhado
                </button>
              </div>
            </div>
          </aside>

          {/* Calendar Section */}
          <main className="lg:col-span-8">
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
              
              {/* Calendar Days Header */}
              <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950/50">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
                  <div key={day} className="py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, idx) => {
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const holidayName = isHoliday(day);
                  const active = canRegister(day) && !holidayName;
                  const dateKey = getDateKey(day);
                  const record = records[dateKey] || {
                    jorge: { ida: false, regresso: false },
                    william: { ida: false, regresso: false }
                  };

                  const isJFull = record.jorge.ida && record.jorge.regresso;
                  const isJIda = record.jorge.ida && !record.jorge.regresso;
                  const isJReg = !record.jorge.ida && record.jorge.regresso;
                  
                  const isWFull = record.william.ida && record.william.regresso;
                  const isWIda = record.william.ida && !record.william.regresso;
                  const isWReg = !record.william.ida && record.william.regresso;

                  return (
                    <div 
                      key={day.toISOString()}
                      className={`relative min-h-[160px] p-3 border-r border-b border-slate-800/50 group transition-all duration-300
                        ${!isCurrentMonth ? 'bg-slate-950/20 opacity-30 pointer-events-none' : ''}
                        ${!active && isCurrentMonth ? 'bg-slate-950/40' : 'bg-slate-900/10'}
                        ${isToday(day) ? 'bg-sky-500/5' : ''}
                      `}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-xs font-black p-1 rounded-md ${isToday(day) ? 'bg-sky-500 text-white' : 'text-slate-400'}`}>
                          {format(day, 'd')}
                        </span>
                        {holidayName && (
                          <span className="text-[8px] bg-rose-500/20 text-rose-500 px-1.5 py-0.5 rounded-full font-black border border-rose-500/30">
                            FERIADO
                          </span>
                        )}
                        {isWeekend(day) && (
                          <span className="text-[8px] text-slate-600 font-black uppercase">WND</span>
                        )}
                      </div>

                      {active && isCurrentMonth ? (
                        <div className="space-y-3">
                          {/* Jorge Status */}
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                              <span className="text-[9px] font-black text-slate-400 uppercase">Jorge</span>
                            </div>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => handleStatusChange(day, 'jorge', isJFull ? 'none' : 'full')}
                                className={`flex-1 py-1 rounded-md text-[8px] font-black border transition-all ${isJFull ? 'bg-sky-500 border-sky-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-sky-500/50'}`}
                              >
                                DIA
                              </button>
                              <div className="flex gap-1 flex-1">
                                <button 
                                  onClick={() => handleStatusChange(day, 'jorge', isJIda ? 'none' : 'ida')}
                                  className={`flex-1 py-1 rounded-md text-[8px] font-black border transition-all ${isJIda ? 'bg-sky-500/40 border-sky-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-sky-500/50'}`}
                                >
                                  ↑
                                </button>
                                <button 
                                  onClick={() => handleStatusChange(day, 'jorge', isJReg ? 'none' : 'reg')}
                                  className={`flex-1 py-1 rounded-md text-[8px] font-black border transition-all ${isJReg ? 'bg-sky-500/40 border-sky-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-sky-500/50'}`}
                                >
                                  ↓
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* William Status */}
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span className="text-[9px] font-black text-slate-400 uppercase">William</span>
                            </div>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => handleStatusChange(day, 'william', isWFull ? 'none' : 'full')}
                                className={`flex-1 py-1 rounded-md text-[8px] font-black border transition-all ${isWFull ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-emerald-500/50'}`}
                              >
                                DIA
                              </button>
                              <div className="flex gap-1 flex-1">
                                <button 
                                  onClick={() => handleStatusChange(day, 'william', isWIda ? 'none' : 'ida')}
                                  className={`flex-1 py-1 rounded-md text-[8px] font-black border transition-all ${isWIda ? 'bg-emerald-500/40 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-emerald-500/50'}`}
                                >
                                  ↑
                                </button>
                                <button 
                                  onClick={() => handleStatusChange(day, 'william', isWReg ? 'none' : 'reg')}
                                  className={`flex-1 py-1 rounded-md text-[8px] font-black border transition-all ${isWReg ? 'bg-emerald-500/40 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-emerald-500/50'}`}
                                >
                                  ↓
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col justify-center items-center opacity-20">
                           <XCircle size={20} className="text-slate-600 mb-1" />
                           <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Inativo</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      </main>

      {/* Confirmation Modal - Fintech Design */}
      {confirmState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300 no-print">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-center justify-center mb-6 text-sky-500">
              <CalendarIcon size={24} />
            </div>
            
            <h3 className="text-xl font-black text-white mb-2">Confirmar Lançamento</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Você está definindo o status de <span className="font-bold text-white uppercase">{confirmState.status === 'full' ? 'Dia Completo' : confirmState.status === 'ida' ? 'Apenas Ida' : confirmState.status === 'reg' ? 'Apenas Regresso' : 'Falta'}</span> para 
              <span className="font-bold text-sky-400 capitalize"> {confirmState.user}</span> no dia 
              <span className="font-bold text-white"> {confirmState.date && format(confirmState.date, 'dd/MM/yyyy')}</span>.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmState({ isOpen: false })}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-slate-400 bg-slate-800 border border-slate-700 hover:bg-slate-750 transition-colors"
              >
                DESCARTAR
              </button>
              <button 
                onClick={confirmChange}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-lg active:scale-95
                  ${confirmState.user === 'jorge' ? 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'}`}
              >
                CONFIRMAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer / Copyright */}
      <footer className="max-w-7xl mx-auto px-8 py-12 text-center no-print space-y-2">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
          Criado por <span className="text-sky-500">Jorge Anselmo</span>
        </p>
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
          Powered by MotoTracker Pro Angola © {new Date().getFullYear()} • Financial Control System V2.0
        </p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .bg-slate-900, .bg-slate-950, .bg-slate-800 { background: white !important; color: black !important; border-color: #ddd !important; }
          .text-white, .text-slate-200, .text-slate-400 { color: black !important; }
          .border-slate-800, .border-slate-700 { border-color: #eee !important; }
          button { display: none !important; }
          main { padding: 0 !important; max-width: 100% !important; }
          .rounded-3xl, .rounded-[2rem] { border-radius: 0 !important; }
        }
      `}} />
    </div>
  );
};

export default App;
