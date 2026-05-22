import React, { useState, useCallback, useEffect } from 'react';
import InputSection from './components/InputSection';
import ResultsTable from './components/ResultsTable';
import { ShiftType, DailyRecord } from './types';
import { parseRawInput, analyzeAttendance } from './utils/parser';
import { SHIFTS } from './constants';
import { Activity } from 'lucide-react';
import { parseISO } from 'date-fns';

const App: React.FC = () => {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = useCallback((rawText: string, shiftId: ShiftType, fromDate?: string, toDate?: string) => {
    // 1. Parse Input
    const logs = parseRawInput(rawText);
    
    // 2. Prepare filter dates
    const start = fromDate ? parseISO(fromDate) : undefined;
    const end = toDate ? parseISO(toDate) : undefined;

    // 3. Analyze based on selected shift and range
    const analyzedRecords = analyzeAttendance(logs, SHIFTS[shiftId], { start, end });
    
    // 4. Update state
    setRecords(analyzedRecords);
    setHasAnalyzed(true);
  }, []);

  const handleClear = useCallback(() => {
    localStorage.removeItem('attendance_raw_text');
    localStorage.removeItem('attendance_selected_shift');
    localStorage.removeItem('attendance_from_date');
    localStorage.removeItem('attendance_to_date');
    setRecords([]);
    setHasAnalyzed(false);
  }, []);

  useEffect(() => {
    const cachedText = localStorage.getItem('attendance_raw_text');
    const cachedShift = localStorage.getItem('attendance_selected_shift') as ShiftType;
    const cachedFrom = localStorage.getItem('attendance_from_date') || undefined;
    const cachedTo = localStorage.getItem('attendance_to_date') || undefined;
    
    if (cachedText && cachedShift) {
      handleAnalyze(cachedText, cachedShift, cachedFrom, cachedTo);
    }
  }, [handleAnalyze]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Activity className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Công Cụ Chấm Công
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InputSection onAnalyze={handleAnalyze} onClear={handleClear} />
        
        {hasAnalyzed && (
          <div className="animate-fade-in-up">
            <ResultsTable records={records} />
          </div>
        )}

        {!hasAnalyzed && (
          <div className="text-center py-20 text-slate-400">
            <p>Vui lòng nhập dữ liệu và chọn ca làm việc để bắt đầu phân tích.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;