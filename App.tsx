
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
  isWeekend
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
  AlertTriangle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { MonthlyData, DayRecord } from './types';
import { TRIP_COST_PER_WAY } from './constants';
import { isHoliday, canRegister, getDateKey } from './utils/dateUtils';

interface ConfirmState {
  isOpen: boolean;
  date?: Date;
  user?: 'jorge' | 'william';
  type?: 'ida' | 'regresso';
  isCurrentlyDone?: boolean;
}

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [records, setRecords] = useState<MonthlyData>(() => {
    const saved = localStorage.getItem('moto_tracker_data');
    return saved ? JSON.parse(saved) : {};
  });

  const [confirmState, setConfirmState] = useState<ConfirmState>({ isOpen: false });

  useEffect(() => {
    localStorage.setItem('moto_tracker_data', JSON.stringify(records));
  }, [records]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const handleToggleClick = (date: Date, user: 'jorge' | 'william', type: 'ida' | 'regresso', isCurrentlyDone: boolean) => {
    setConfirmState({
      isOpen: true,
      date,
      user,
      type,
      isCurrentlyDone
    });
  };

  const confirmToggle = () => {
    if (!confirmState.date || !confirmState.user || !confirmState.type) return;

    const key = getDateKey(confirmState.date);
    setRecords(prev => {
      const dayRecord = prev[key] || {
        jorge: { ida: false, regresso: false },
        william: { ida: false, regresso: false }
      };

      const newUserState = {
        ...dayRecord[confirmState.user!],
        [confirmState.type!]: !dayRecord[confirmState.user!][confirmState.type!]
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

  const calculateStats = useMemo(() => {
    const monthKeyPrefix = format(currentDate, 'yyyy-MM');
    let jorgeTotal = 0;
    let williamTotal = 0;
    let jorgeCount = 0;
    let williamCount = 0;

    (Object.entries(records) as [string, DayRecord][]).forEach(([key, record]) => {
      if (key.startsWith(monthKeyPrefix)) {
        if (record.jorge.ida) { jorgeTotal += TRIP_COST_PER_WAY; jorgeCount += 0.5; }
        if (record.jorge.regresso) { jorgeTotal += TRIP_COST_PER_WAY; jorgeCount += 0.5; }
        if (record.william.ida) { williamTotal += TRIP_COST_PER_WAY; williamCount += 0.5; }
        if (record.william.regresso) { williamTotal += TRIP_COST_PER_WAY; williamCount += 0.5; }
      }
    });

    return { jorgeTotal, williamTotal, jorgeCount: Math.floor(jorgeCount), williamCount: Math.floor(williamCount) };
  }, [records, currentDate]);

  const chartData = [
    { name: 'Jorge', custo: calculateStats.jorgeTotal, viagens: calculateStats.jorgeCount },
    { name: 'William', custo: calculateStats.williamTotal, viagens: calculateStats.williamCount },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Bike size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">MotoTracker Angola</h1>
          </div>
          <p className="text-slate-500">Controle de deslocamento diário</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          <button 
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="px-4 font-semibold min-w-[140px] text-center capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </div>
          <button 
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Stats & Charts */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-indigo-600" size={20} />
              <h2 className="font-bold text-lg">Resumo do Mês</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="text-indigo-600 text-sm font-medium mb-1 flex items-center gap-2">
                  <Users size={16} /> Jorge
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {calculateStats.jorgeTotal.toLocaleString()} Kz
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {calculateStats.jorgeCount} viagens completas
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="text-emerald-600 text-sm font-medium mb-1 flex items-center gap-2">
                  <Users size={16} /> William
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {calculateStats.williamTotal.toLocaleString()} Kz
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {calculateStats.williamCount} viagens completas
                </div>
              </div>
            </div>

            <div className="mt-8 h-48 no-print">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="custo" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <button 
              onClick={handlePrint}
              className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl flex items-center justify-center gap-2 transition-all no-print"
            >
              <Download size={18} />
              Exportar Relatório (PDF)
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 no-print">
            <h3 className="font-semibold mb-4">Legenda</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-center gap-3">
                <span className="w-4 h-4 rounded bg-red-100 border border-red-200"></span>
                Feriados Nacionais
              </li>
              <li className="flex items-center gap-3">
                <span className="w-4 h-4 rounded bg-slate-100 border border-slate-200"></span>
                Fins de Semana (Inativo)
              </li>
              <li className="flex items-center gap-3 text-emerald-600 font-medium">
                <CheckCircle2 size={16} /> Viagem Realizada
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <XCircle size={16} /> Não Realizada
              </li>
            </ul>
          </div>
        </aside>

        {/* Right Column: Calendar */}
        <main className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Calendar Headers */}
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
                <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 auto-rows-fr">
              {calendarDays.map((day, idx) => {
                const isCurrentMonth = isSameMonth(day, monthStart);
                const holidayName = isHoliday(day);
                const active = canRegister(day);
                const dateKey = getDateKey(day);
                const record = records[dateKey] || {
                  jorge: { ida: false, regresso: false },
                  william: { ida: false, regresso: false }
                };

                return (
                  <div 
                    key={day.toISOString()}
                    className={`relative min-h-[140px] p-2 border-r border-b border-slate-100 flex flex-col transition-all duration-200 ease-out
                      ${!isCurrentMonth ? 'bg-slate-50/50 opacity-40' : 'z-0'}
                      ${!active ? 'bg-slate-50' : 'hover:bg-white hover:scale-[1.015] hover:shadow-md hover:z-10 cursor-default'}
                      ${holidayName ? 'bg-red-50/50' : ''}
                      ${isToday(day) ? 'ring-2 ring-inset ring-indigo-500 ring-opacity-50' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-sm font-semibold ${isToday(day) ? 'text-indigo-600 bg-indigo-50 w-7 h-7 flex items-center justify-center rounded-full' : 'text-slate-700'}`}>
                        {format(day, 'd')}
                      </span>
                      {holidayName && (
                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase" title={holidayName}>
                          FERIADO
                        </span>
                      )}
                    </div>

                    {active && isCurrentMonth ? (
                      <div className="flex flex-col gap-2 mt-auto">
                        {/* Jorge Buttons */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase">Jorge</span>
                          <div className="grid grid-cols-2 gap-1">
                            <button 
                              onClick={() => handleToggleClick(day, 'jorge', 'ida', record.jorge.ida)}
                              className={`text-[9px] py-1 px-1 rounded border flex items-center justify-center gap-1 transition-all
                                ${record.jorge.ida 
                                  ? 'bg-indigo-600 border-indigo-600 text-white font-bold' 
                                  : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300'}`}
                            >
                              Ida {record.jorge.ida ? '✅' : '❌'}
                            </button>
                            <button 
                              onClick={() => handleToggleClick(day, 'jorge', 'regresso', record.jorge.regresso)}
                              className={`text-[9px] py-1 px-1 rounded border flex items-center justify-center gap-1 transition-all
                                ${record.jorge.regresso 
                                  ? 'bg-indigo-600 border-indigo-600 text-white font-bold' 
                                  : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300'}`}
                            >
                              Reg. {record.jorge.regresso ? '✅' : '❌'}
                            </button>
                          </div>
                        </div>

                        {/* William Buttons */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase">William</span>
                          <div className="grid grid-cols-2 gap-1">
                            <button 
                              onClick={() => handleToggleClick(day, 'william', 'ida', record.william.ida)}
                              className={`text-[9px] py-1 px-1 rounded border flex items-center justify-center gap-1 transition-all
                                ${record.william.ida 
                                  ? 'bg-emerald-600 border-emerald-600 text-white font-bold' 
                                  : 'bg-white border-slate-200 text-slate-400 hover:border-emerald-300'}`}
                            >
                              Ida {record.william.ida ? '✅' : '❌'}
                            </button>
                            <button 
                              onClick={() => handleToggleClick(day, 'william', 'regresso', record.william.regresso)}
                              className={`text-[9px] py-1 px-1 rounded border flex items-center justify-center gap-1 transition-all
                                ${record.william.regresso 
                                  ? 'bg-emerald-600 border-emerald-600 text-white font-bold' 
                                  : 'bg-white border-slate-200 text-slate-400 hover:border-emerald-300'}`}
                            >
                              Reg. {record.william.regresso ? '✅' : '❌'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-auto py-2 text-center">
                         <span className="text-[10px] text-slate-300 font-medium italic">
                           {!isCurrentMonth ? '' : isWeekend(day) ? 'Fim de semana' : ''}
                         </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      {confirmState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-amber-600">
              <AlertTriangle size={24} />
              <h3 className="text-xl font-bold">Confirmar Alteração</h3>
            </div>
            
            <p className="text-slate-600 mb-6 leading-relaxed">
              Deseja marcar a <span className="font-bold text-slate-900 uppercase">{confirmState.type}</span> para 
              <span className="font-bold text-slate-900"> {confirmState.user?.charAt(0).toUpperCase()}{confirmState.user?.slice(1)}</span> em 
              <span className="font-bold text-slate-900"> {confirmState.date && format(confirmState.date, 'dd/MM/yyyy')}</span> como 
              <span className={`font-bold ${confirmState.isCurrentlyDone ? 'text-red-500' : 'text-emerald-600'}`}>
                {confirmState.isCurrentlyDone ? ' não realizada' : ' realizada'}
              </span>?
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmState({ isOpen: false })}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmToggle}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white transition-all shadow-md active:scale-95
                  ${confirmState.user === 'jorge' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print-only section */}
      <div className="hidden print:block mt-8 bg-white p-8">
        <h1 className="text-3xl font-bold mb-4">Relatório de Viagens - {format(currentDate, 'MMMM yyyy', { locale: ptBR })}</h1>
        <hr className="mb-6" />
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="p-4 border rounded">
            <h2 className="text-xl font-bold text-indigo-700">Jorge</h2>
            <p className="text-lg">Total Gasto: {calculateStats.jorgeTotal.toLocaleString()} Kz</p>
            <p>Viagens Realizadas: {calculateStats.jorgeCount}</p>
          </div>
          <div className="p-4 border rounded">
            <h2 className="text-xl font-bold text-emerald-700">William</h2>
            <p className="text-lg">Total Gasto: {calculateStats.williamTotal.toLocaleString()} Kz</p>
            <p>Viagens Realizadas: {calculateStats.williamCount}</p>
          </div>
        </div>
        
        <table className="w-full text-sm border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100">
              <th className="border p-2">Data</th>
              <th className="border p-2">Jorge (Ida)</th>
              <th className="border p-2">Jorge (Reg)</th>
              <th className="border p-2">William (Ida)</th>
              <th className="border p-2">William (Reg)</th>
            </tr>
          </thead>
          <tbody>
            {eachDayOfInterval({ start: monthStart, end: monthEnd }).map(day => {
              if (isWeekend(day)) return null;
              const key = getDateKey(day);
              const r = records[key];
              return (
                <tr key={key}>
                  <td className="border p-2 font-medium">{format(day, 'dd/MM/yyyy')}</td>
                  <td className="border p-2 text-center">{r?.jorge.ida ? '✅' : '-'}</td>
                  <td className="border p-2 text-center">{r?.jorge.regresso ? '✅' : '-'}</td>
                  <td className="border p-2 text-center">{r?.william.ida ? '✅' : '-'}</td>
                  <td className="border p-2 text-center">{r?.william.regresso ? '✅' : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        <div className="mt-8 text-xs text-slate-400">
          Gerado em {format(new Date(), 'dd/MM/yyyy HH:mm')} - MotoTracker Angola
        </div>
      </div>
    </div>
  );
};

export default App;
