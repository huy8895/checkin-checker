import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { DailyRecord, DayStatus } from '../types';
import { AlertCircle, CheckCircle2, Clock, CalendarX, AlertTriangle, LogIn, LogOut } from 'lucide-react';

interface ResultsTableProps {
  records: DailyRecord[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ records }) => {
  const stats = useMemo(() => {
    return records.reduce(
      (acc, rec) => {
        if (rec.status.includes(DayStatus.LATE)) acc.late++;
        if (rec.status.includes(DayStatus.EARLY_VIOLATION)) acc.earlyViolation++;
        if (rec.status.includes(DayStatus.EARLY_ALLOWED)) acc.earlyAllowed++;
        if (rec.status.includes(DayStatus.ABSENT)) acc.absent++;
        if (rec.status.includes(DayStatus.MISSING_IN) || rec.status.includes(DayStatus.MISSING_OUT)) acc.missing++;
        return acc;
      },
      { late: 0, earlyViolation: 0, earlyAllowed: 0, absent: 0, missing: 0 }
    );
  }, [records]);

  if (records.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Số lần đi muộn</p>
            <p className="text-2xl font-bold text-slate-800">{stats.late}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg text-red-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Về sớm (Vi phạm)</p>
            <p className="text-2xl font-bold text-slate-800">{stats.earlyViolation}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg text-green-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Về sớm (Hợp lệ)</p>
            <p className="text-2xl font-bold text-slate-800">{stats.earlyAllowed}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Thiếu log</p>
            <p className="text-2xl font-bold text-slate-800">{stats.missing}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
            <CalendarX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Nghỉ làm / Vắng</p>
            <p className="text-2xl font-bold text-slate-800">{stats.absent}</p>
          </div>
        </div>
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