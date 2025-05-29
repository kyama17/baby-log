'use client';

import { useState, useEffect } from 'react';

type BabyLogEntry = {
  id: number;
  type: 'urination' | 'defecation';
  timestamp: string;
};

export default function BabyLogPage() {
  const [logEntries, setLogEntries] = useState<BabyLogEntry[]>([]);
  const [type, setType] = useState<'urination' | 'defecation'>('urination');

  useEffect(() => {
    fetch('/api/baby-log')
      .then((response) => response.json())
      .then((data) => setLogEntries(data as BabyLogEntry[]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/baby-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    });
    const newEntry = await response.json();
    setLogEntries((prev) => [...prev, newEntry] as BabyLogEntry[]);
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
      }
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">赤ちゃんのトイレログ</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex space-x-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'urination' | 'defecation')}
            className="border p-2 rounded"
          >
            <option value="urination">おしっこ</option>
            <option value="defecation">うんち</option>
          </select>
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            記録
          </button>
        </div>
      </form>
      <div>
        <h2 className="text-xl font-bold mb-2">ログエントリ</h2>
        <ul>
          {logEntries.map((entry) => (
            <li key={entry.id} className="mb-1 flex justify-between items-center">
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
      </div>
    </div>
  );
}