import React, { useState } from 'react';
import { SHIFTS } from '../constants';
import { ShiftType } from '../types';
import { ClipboardList, Play, Calendar, Trash2 } from 'lucide-react';

interface InputSectionProps {
  onAnalyze: (rawText: string, shiftId: ShiftType, startDate?: string, endDate?: string) => void;
  onClear: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, onClear }) => {
  const [text, setText] = useState(() => localStorage.getItem('attendance_raw_text') || '');
  const [selectedShift, setSelectedShift] = useState<ShiftType>(
    () => (localStorage.getItem('attendance_selected_shift') as ShiftType) || ShiftType.SHIFT_1
  );
  const [fromDate, setFromDate] = useState(() => localStorage.getItem('attendance_from_date') || '');
  const [toDate, setToDate] = useState(() => localStorage.getItem('attendance_to_date') || '');

  const handleAnalyze = () => {
    if (!text.trim()) return;
    localStorage.setItem('attendance_raw_text', text);
    localStorage.setItem('attendance_selected_shift', selectedShift);
    localStorage.setItem('attendance_from_date', fromDate);
    localStorage.setItem('attendance_to_date', toDate);
    onAnalyze(text, selectedShift, fromDate, toDate);
  };

  const handlePasteSample = () => {
      // Sample data from prompt partially
      const sample = `Row1\n044873\n01/15/26  6:19:15PM\n10.2.182.151\nRow2\n044873\n01/15/26  8:02:16AM\n10.2.182.151\nRow11\n044873\n01/12/26  6:00:25PM\n10.2.182.151\nRow12\n044873\n01/12/26  8:01:19AM\n10.2.182.151`;
      setText(sample);
  };

  const handleClear = () => {
    setText('');
    setSelectedShift(ShiftType.SHIFT_1);
    setFromDate('');
    setToDate('');
    onClear();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="text-blue-600 w-6 h-6" />
          <h2 className="text-xl font-semibold text-slate-800">Nhập dữ liệu chấm công</h2>
        </div>
        {(text || fromDate || toDate) && (
          <button 
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-medium transition-colors bg-rose-5 px-3 py-1.5 rounded-lg border border-rose-100 hover:bg-rose-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Xóa lịch sử
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col h-full">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Dán dữ liệu (Format: MM/DD/YY Time)
          </label>
          <textarea
            className="w-full flex-grow p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm bg-slate-50 min-h-[12rem]"
            placeholder="Row1... 01/15/26 6:19:15PM..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
          <div className="mt-2">
            <button 
              onClick={handlePasteSample}
              className="text-xs text-blue-500 hover:text-blue-700 underline"
            >
              Dán dữ liệu mẫu
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* Shift Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Chọn Ca Làm Việc
            </label>
            <div className="space-y-2">
              {Object.values(SHIFTS).map((shift) => (
                <label
                  key={shift.id}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedShift === shift.id
                      ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="shift"
                    value={shift.id}
                    checked={selectedShift === shift.id}
                    onChange={() => setSelectedShift(shift.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-slate-900">
                      {shift.name}
                    </span>
                    <span className="block text-xs text-slate-500">
                      Đi muộn tối đa: {shift.graceMinutes} phút
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <div className="flex items-center gap-2 mb-2">
               <Calendar className="w-4 h-4 text-slate-500" />
               <label className="block text-sm font-medium text-slate-700">
                Lọc thời gian (Tùy chọn)
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Từ ngày</label>
                <input 
                  type="date" 
                  className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Đến ngày</label>
                <input 
                  type="date" 
                  className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!text.trim()}
            className="mt-auto w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5" />
            Phân Tích
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputSection;