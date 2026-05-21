import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { DailyRecord, DayStatus } from '../types';
import { AlertCircle, CheckCircle2, Clock, CalendarX, AlertTriangle, LogIn, LogOut } from 'lucide-react';

interface ResultsTableProps {
  records: DailyRecord[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ records }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const stats = useMemo(() => {
    return records.reduce(
      (acc, rec) => {
        if (rec.status.includes(DayStatus.LATE)) acc.late.push(rec);
        if (rec.status.includes(DayStatus.EARLY_VIOLATION)) acc.earlyViolation.push(rec);
        if (rec.status.includes(DayStatus.EARLY_ALLOWED)) acc.earlyAllowed.push(rec);
        if (rec.status.includes(DayStatus.ABSENT)) acc.absent.push(rec);
        if (rec.status.includes(DayStatus.MISSING_IN) || rec.status.includes(DayStatus.MISSING_OUT)) acc.missing.push(rec);
        return acc;
      },
      { 
        late: [] as DailyRecord[], 
        earlyViolation: [] as DailyRecord[], 
        earlyAllowed: [] as DailyRecord[], 
        absent: [] as DailyRecord[], 
        missing: [] as DailyRecord[] 
      }
    );
  }, [records]);

  if (records.length === 0) return null;

  const renderStatCard = (
    title: string, 
    recordsList: DailyRecord[], 
    icon: any, 
    iconBg: string, 
    iconColor: string, 
    categoryKey: string
  ) => {
    const isExpanded = expandedCategory === categoryKey;
    const Icon = icon;
    
    return (
      <div 
        className={`bg-white p-4 rounded-xl shadow-sm border transition-all cursor-pointer ${isExpanded ? 'border-blue-400 ring-1 ring-blue-400 col-span-1 sm:col-span-2 lg:col-span-2' : 'border-slate-200 hover:border-blue-200'}`}
        onClick={() => setExpandedCategory(isExpanded ? null : categoryKey)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconBg} ${iconColor}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{recordsList.length}</p>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-slate-100 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {recordsList.length > 0 ? (
              <ul className="space-y-2">
                {recordsList.map((rec: DailyRecord, idx: number) => (
                  <li key={idx} className="flex flex-wrap items-center justify-between text-xs p-2.5 bg-slate-50 rounded-lg hover:bg-slate-100 border border-slate-100">
                    <span className="font-semibold text-slate-700 w-24">
                      {format(rec.date, 'dd/MM/yyyy')}
                    </span>
                    <span className="text-slate-500 font-mono bg-white px-2 py-1 rounded border border-slate-200">
                      {rec.checkIn ? format(rec.checkIn, 'HH:mm:ss') : '--:--:--'} - {rec.checkOut ? format(rec.checkOut, 'HH:mm:ss') : '--:--:--'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic text-center py-2">Không có dữ liệu</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
        {renderStatCard('Số lần đi muộn', stats.late, Clock, 'bg-yellow-100', 'text-yellow-600', 'late')}
        {renderStatCard('Về sớm (Vi phạm)', stats.earlyViolation, AlertCircle, 'bg-red-100', 'text-red-600', 'earlyViolation')}
        {renderStatCard('Về sớm (Hợp lệ)', stats.earlyAllowed, CheckCircle2, 'bg-green-100', 'text-green-600', 'earlyAllowed')}
        {renderStatCard('Thiếu log', stats.missing, AlertTriangle, 'bg-orange-100', 'text-orange-600', 'missing')}
        {renderStatCard('Nghỉ làm / Vắng', stats.absent, CalendarX, 'bg-gray-100', 'text-gray-600', 'absent')}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Chi tiết chấm công</h3>
          <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border">
            {format(records[0].date, 'dd/MM/yyyy')} - {format(records[records.length - 1].date, 'dd/MM/yyyy')}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3">Ngày</th>
                <th className="px-6 py-3">Thứ</th>
                <th className="px-6 py-3">Giờ Vào</th>
                <th className="px-6 py-3">Giờ Ra</th>
                <th className="px-6 py-3">Trạng Thái</th>
                <th className="px-6 py-3">Ghi Chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {records.map((rec) => {
                const dateStr = format(rec.date, 'dd/MM/yyyy');
                const isWeekend = rec.status.includes(DayStatus.WEEKEND);
                const isAbsent = rec.status.includes(DayStatus.ABSENT);
                
                let rowClass = "hover:bg-slate-50";
                if (isAbsent) rowClass = "bg-red-50 hover:bg-red-100";
                else if (isWeekend) rowClass = "bg-slate-50 text-slate-400";

                return (
                  <tr key={dateStr} className={rowClass}>
                    <td className="px-6 py-4 font-medium text-slate-900">{dateStr}</td>
                    <td className="px-6 py-4 capitalize">
                      {format(rec.date, 'EEEE', { locale: vi })}
                    </td>
                    <td className="px-6 py-4">
                      {rec.checkIn ? (
                        <span className="font-mono text-slate-700">
                          {format(rec.checkIn, 'HH:mm:ss')}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">--:--:--</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {rec.checkOut ? (
                        <span className="font-mono text-slate-700">
                          {format(rec.checkOut, 'HH:mm:ss')}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">--:--:--</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {rec.status.map((status, idx) => (
                          <StatusBadge key={idx} status={status} />
                        ))}
                        {rec.status.length === 0 && !isWeekend && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                                Đủ công
                            </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <ul className="list-disc list-inside">
                        {rec.notes.map((note, idx) => (
                          <li key={idx} className="text-xs">{note}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: DayStatus }> = ({ status }) => {
  let colorClass = "bg-gray-100 text-gray-700";
  let Icon: any = null;

  switch (status) {
    case DayStatus.LATE:
      colorClass = "bg-yellow-100 text-yellow-700";
      Icon = Clock;
      break;
    case DayStatus.EARLY_VIOLATION:
      colorClass = "bg-red-100 text-red-700";
      Icon = AlertCircle;
      break;
    case DayStatus.EARLY_ALLOWED:
      colorClass = "bg-blue-100 text-blue-700";
      Icon = CheckCircle2;
      break;
    case DayStatus.ABSENT:
      colorClass = "bg-rose-100 text-rose-700";
      Icon = CalendarX;
      break;
    case DayStatus.MISSING_IN:
      colorClass = "bg-orange-100 text-orange-700";
      Icon = LogIn;
      break;
    case DayStatus.MISSING_OUT:
      colorClass = "bg-orange-100 text-orange-700";
      Icon = LogOut;
      break;
    case DayStatus.WEEKEND:
      return <span className="text-xs italic text-slate-400">Cuối tuần</span>;
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {status}
    </span>
  );
};

export default ResultsTable;