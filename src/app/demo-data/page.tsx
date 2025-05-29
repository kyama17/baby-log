'use client';

import { useState } from 'react';

export default function DemoDataPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState('');

  const generateDemoData = async () => {
    setIsGenerating(true);
    setMessage('');

    try {
      // 過去7日間のデモデータを生成
      const demoEntries = [];
      const now = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // 1日あたり3-8回のランダムな記録を生成
        const entriesPerDay = Math.floor(Math.random() * 6) + 3;

        for (let j = 0; j < entriesPerDay; j++) {
          const hour = Math.floor(Math.random() * 24);
          const minute = Math.floor(Math.random() * 60);
          const timestamp = new Date(date);
          timestamp.setHours(hour, minute, 0, 0);

          // おしっこの方が多くなるように調整
          const type = Math.random() < 0.7 ? 'urination' : 'defecation';

          demoEntries.push({
            type,
            timestamp: timestamp.toISOString(),
          });
        }
      }

      // APIに送信
      for (const entry of demoEntries) {
        await fetch('/api/baby-log-mock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry),
        });
      }

      setMessage(`${demoEntries.length}件のデモデータを生成しました！`);
    } catch (error) {
      setMessage('エラーが発生しました: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAllData = async () => {
    setIsGenerating(true);
    setMessage('');

    try {
      // 全データを取得
      const response = await fetch('/api/baby-log-mock');
      const entries = await response.json();

      // 全データを削除
      for (const entry of entries) {
        await fetch('/api/baby-log-mock', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: entry.id }),
        });
      }

      setMessage(`${entries.length}件のデータを削除しました。`);
    } catch (error) {
      setMessage('エラーが発生しました: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">🧪 デモデータ管理</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600 mb-6">
          グラフ機能をテストするためのデモデータを生成できます。
          過去7日間のランダムなおしっこ・うんちの記録が作成されます。
        </p>

        <div className="space-y-4">
          <button
            onClick={generateDemoData}
            disabled={isGenerating}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white p-3 rounded transition-colors duration-200"
          >
            {isGenerating ? '生成中...' : 'デモデータを生成'}
          </button>

          <button
            onClick={clearAllData}
            disabled={isGenerating}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white p-3 rounded transition-colors duration-200"
          >
            {isGenerating ? '削除中...' : '全データを削除'}
          </button>
        </div>

        {message && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
            {message}
          </div>
        )}

        <div className="mt-6 pt-6 border-t">
          <a
            href="/"
            className="text-blue-500 hover:text-blue-600 underline"
          >
            ← メインページに戻る
          </a>
        </div>
      </div>
    </div>
  );
}