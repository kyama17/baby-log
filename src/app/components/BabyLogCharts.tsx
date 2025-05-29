'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO, startOfDay, eachDayOfInterval, subDays } from 'date-fns';
import { ja } from 'date-fns/locale';

type BabyLogEntry = {
  id: number;
  type: 'urination' | 'defecation';
  timestamp: string;
};

interface BabyLogChartsProps {
  logEntries: BabyLogEntry[];
}

// const COLORS = {
//   urination: '#3B82F6', // blue
//   defecation: '#F59E0B', // amber
// };

export default function BabyLogCharts({ logEntries }: BabyLogChartsProps) {
  // 日別データの集計
  const dailyData = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    return last7Days.map((day) => {
      const dayStart = startOfDay(day);
      const dayEntries = logEntries.filter((entry) => {
        const entryDay = startOfDay(parseISO(entry.timestamp));
        return entryDay.getTime() === dayStart.getTime();
      });

      const urinationCount = dayEntries.filter((entry) => entry.type === 'urination').length;
      const defecationCount = dayEntries.filter((entry) => entry.type === 'defecation').length;

      return {
        date: format(day, 'M/d', { locale: ja }),
        fullDate: format(day, 'yyyy-MM-dd'),
        おしっこ: urinationCount,
        うんち: defecationCount,
        total: urinationCount + defecationCount,
      };
    });
  }, [logEntries]);

  // 時間別データの集計
  const hourlyData = useMemo(() => {
    const hourCounts = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}時`,
      おしっこ: 0,
      うんち: 0,
    }));

    logEntries.forEach((entry) => {
      const hour = parseISO(entry.timestamp).getHours();
      if (entry.type === 'urination') {
        hourCounts[hour].おしっこ++;
      } else {
        hourCounts[hour].うんち++;
      }
    });

    return hourCounts;
  }, [logEntries]);

  // 種類別の総数
  const typeData = useMemo(() => {
    const urinationCount = logEntries.filter((entry) => entry.type === 'urination').length;
    const defecationCount = logEntries.filter((entry) => entry.type === 'defecation').length;

    return [
      { name: 'おしっこ', value: urinationCount, color: 'var(--chart-color-urination)' },
      { name: 'うんち', value: defecationCount, color: 'var(--chart-color-defecation)' },
    ];
  }, [logEntries]);

  // 今日の記録数
  const todayData = useMemo(() => {
    const today = startOfDay(new Date());
    const todayEntries = logEntries.filter((entry) => {
      const entryDay = startOfDay(parseISO(entry.timestamp));
      return entryDay.getTime() === today.getTime();
    });

    const urinationCount = todayEntries.filter((entry) => entry.type === 'urination').length;
    const defecationCount = todayEntries.filter((entry) => entry.type === 'defecation').length;

    return { urination: urinationCount, defecation: defecationCount };
  }, [logEntries]);

  if (logEntries.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">📊 グラフ</h2>
        <p className="text-gray-600 dark:text-gray-400">記録がありません。まずは記録を追加してください。</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-6">📊 グラフ</h2>

      {/* 今日の統計 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">今日の記録</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-100 dark:bg-blue-800 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">{todayData.urination}</div>
            <div className="text-sm text-blue-600 dark:text-blue-300">おしっこ</div>
          </div>
          <div className="bg-amber-100 dark:bg-amber-800 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-300">{todayData.defecation}</div>
            <div className="text-sm text-amber-600 dark:text-amber-300">うんち</div>
          </div>
        </div>
      </div>

      {/* 過去7日間の推移 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">過去7日間の推移</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--recharts-grid-color)" />
              <XAxis dataKey="date" tick={{ fill: "var(--recharts-text-color)" }} />
              <YAxis tick={{ fill: "var(--recharts-text-color)" }} />
              <Tooltip contentStyle={{ backgroundColor: "var(--tooltip-bg-color)", color: "var(--tooltip-text-color)", borderRadius: "0.375rem", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)" }} cursor={{ fill: "var(--tooltip-cursor-color)" }} />
              <Legend wrapperStyle={{ color: "var(--recharts-text-color)" }} />
              <Bar dataKey="おしっこ" fill="var(--chart-color-urination)" />
              <Bar dataKey="うんち" fill="var(--chart-color-defecation)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 時間別分布 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">時間別分布</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--recharts-grid-color)" />
              <XAxis dataKey="hour" interval={2} tick={{ fill: "var(--recharts-text-color)" }} />
              <YAxis tick={{ fill: "var(--recharts-text-color)" }} />
              <Tooltip contentStyle={{ backgroundColor: "var(--tooltip-bg-color)", color: "var(--tooltip-text-color)", borderRadius: "0.375rem", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)" }} cursor={{ fill: "var(--tooltip-cursor-color)" }} />
              <Legend wrapperStyle={{ color: "var(--recharts-text-color)" }} />
              <Line
                type="monotone"
                dataKey="おしっこ"
                stroke="var(--chart-color-urination)"
                strokeWidth={2}
                dot={{ fill: "var(--chart-color-urination)" }}
              />
              <Line
                type="monotone"
                dataKey="うんち"
                stroke="var(--chart-color-defecation)"
                strokeWidth={2}
                dot={{ fill: "var(--chart-color-defecation)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 種類別の割合 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">種類別の割合</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={{ fill: "var(--recharts-text-color)", fontSize: "0.875rem", formatter: ({ name, value, percent }) => `${name}: ${value}回 (${(percent * 100).toFixed(1)}%)` }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "var(--tooltip-bg-color)", color: "var(--tooltip-text-color)", borderRadius: "0.375rem", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)" }} cursor={{ fill: "var(--tooltip-cursor-color)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
          <div className="text-sm text-gray-600 dark:text-gray-300">総記録数</div>
          <div className="text-2xl font-bold">{logEntries.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
          <div className="text-sm text-gray-600 dark:text-gray-300">1日平均</div>
          <div className="text-2xl font-bold">
            {dailyData.length > 0 ? (logEntries.length / 7).toFixed(1) : 0}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border">
          <div className="text-sm text-gray-600 dark:text-gray-300">最多記録日</div>
          <div className="text-lg font-bold">
            {dailyData.reduce((max, day) => (day.total > max.total ? day : max), dailyData[0])?.date || '-'}
          </div>
        </div>
      </div>
    </div>
  );
}