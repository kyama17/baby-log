'use client';

import { useState, useEffect } from 'react';
import BabyLogCharts from './components/BabyLogCharts';

type BabyLogEntry = {
  id: number;
  type: 'urination' | 'defecation';
  timestamp: string;
};

export default function BabyLogPage() {
  const [logEntries, setLogEntries] = useState<BabyLogEntry[]>([]);
  const [type, setType] = useState<'urination' | 'defecation'>('urination');
  const [datetime, setDatetime] = useState<string>(() => {
    // デフォルトは現在時刻（ローカルタイムゾーン）
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  useEffect(() => {
    fetch('/api/baby-log')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setLogEntries(data as BabyLogEntry[]);
        } else {
          console.error('Received non-array data:', data);
          setLogEntries([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching baby log:', error);
        setLogEntries([]);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/baby-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type, 
          timestamp: new Date(datetime).toISOString() 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newEntry = await response.json();
      if (newEntry && typeof newEntry === 'object') {
        setLogEntries((prev) => [newEntry, ...prev] as BabyLogEntry[]);
        
        // 送信後、日時を現在時刻にリセット
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        setDatetime(now.toISOString().slice(0, 16));
      } else {
        throw new Error('Invalid response data');
      }
    } catch (error) {
      console.error('Error submitting baby log:', error);
      alert('データの保存に失敗しました。Supabaseの設定を確認してください。');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch('/api/baby-log', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setLogEntries((prev) => prev.filter((entry) => entry.id !== id));
      } else {
        const errorData = await response.json();
        console.error('Failed to delete entry:', errorData);
        alert('データの削除に失敗しました。Supabaseの設定を確認してください。');
      }
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('データの削除に失敗しました。Supabaseの設定を確認してください。');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🍼 赤ちゃんのトイレログ</h1>
        <a
          href="/demo-data"
          className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded transition-colors duration-200"
        >
          🧪 デモデータ
        </a>
      </div>
      
      {/* 記録フォーム */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">📝 新しい記録</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'urination' | 'defecation')}
              className="border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="urination">💧 おしっこ</option>
              <option value="defecation">💩 うんち</option>
            </select>
            <div className="flex flex-col">
              <label htmlFor="datetime" className="text-sm text-gray-600 mb-1">
                日時
              </label>
              <input
                id="datetime"
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                className="border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <button 
              type="submit" 
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded self-end transition-colors duration-200"
            >
              記録
            </button>
          </div>
        </form>
      </div>

      {/* グラフセクション */}
      <div className="mb-6">
        <BabyLogCharts logEntries={logEntries} />
      </div>

      {/* ログエントリ一覧 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">📋 最近の記録</h2>
        {logEntries.length === 0 ? (
          <p className="text-gray-500 text-center py-8">まだ記録がありません。上のフォームから記録を追加してください。</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logEntries.slice(0, 20).map((entry) => (
              <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="flex items-center space-x-2">
                  <span className="text-lg">
                    {entry.type === 'urination' ? '💧' : '💩'}
                  </span>
                  <span>
                    {entry.type === 'urination' ? 'おしっこ' : 'うんち'}
                  </span>
                  <span className="text-gray-500">
                    {new Date(entry.timestamp).toLocaleString('ja-JP')}
                  </span>
                </span>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                >
                  削除
                </button>
              </div>
            ))}
            {logEntries.length > 20 && (
              <p className="text-gray-500 text-center text-sm">
                最新の20件を表示しています（全{logEntries.length}件）
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}