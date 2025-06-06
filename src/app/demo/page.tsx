'use client';

import { useState, useEffect } from 'react';

type BabyLogEntry = {
  id: number;
  type: 'urination' | 'defecation';
  timestamp: string;
};

export default function DemoPage() {
  const [logEntries, setLogEntries] = useState<BabyLogEntry[]>([]);
  const [type, setType] = useState<'urination' | 'defecation'>('urination');
  const [datetime, setDatetime] = useState<string>(() => {
    // デフォルトは現在時刻（ローカルタイムゾーン）
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  useEffect(() => {
    // ローカルストレージからデータを読み込み
    const savedEntries = localStorage.getItem('baby-log-demo');
    if (savedEntries) {
      setLogEntries(JSON.parse(savedEntries));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEntry: BabyLogEntry = {
      id: Date.now(), // 簡単なID生成
      type,
      timestamp: new Date(datetime).toISOString()
    };

    const updatedEntries = [newEntry, ...logEntries];
    setLogEntries(updatedEntries);
    
    // ローカルストレージに保存
    localStorage.setItem('baby-log-demo', JSON.stringify(updatedEntries));
    
    // 送信後、日時を現在時刻にリセット
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setDatetime(now.toISOString().slice(0, 16));
  };

  const handleDelete = (id: number) => {
    const updatedEntries = logEntries.filter((entry) => entry.id !== id);
    setLogEntries(updatedEntries);
    localStorage.setItem('baby-log-demo', JSON.stringify(updatedEntries));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">子どものトイレログ（デモ版）</h1>
      <div className="mb-4 p-4 bg-blue-100 rounded dark:bg-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          このデモ版では、データはブラウザのローカルストレージに保存されます。
          日時を指定して記録できる機能をテストできます。
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'urination' | 'defecation')}
            className="border p-2 rounded"
          >
            <option value="urination">おしっこ</option>
            <option value="defecation">うんち</option>
          </select>
          <div className="flex flex-col">
            <label htmlFor="datetime" className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              日時
            </label>
            <input
              id="datetime"
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              required
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white p-2 rounded self-end">
            記録
          </button>
        </div>
      </form>
      
      <div>
        <h2 className="text-xl font-bold mb-2">ログエントリ</h2>
        {logEntries.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">まだ記録がありません。</p>
        ) : (
          <ul>
            {logEntries.map((entry) => (
              <li key={entry.id} className="mb-1 flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span>
                  {entry.type === 'urination' ? 'おしっこ' : 'うんち'} at {new Date(entry.timestamp).toLocaleString('ja-JP')}
                </span>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="bg-red-500 text-white p-1 rounded ml-2"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}