'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext'; // Using alias
import BabyLogCharts from './components/BabyLogCharts';
import { BabyLogEntry, ApiError } from '@/types'; // Import ApiError

// type BabyLogEntry = {
//   id: number;
//   // user_id?: string; // This field exists in the DB but might not be used directly in frontend state unless needed
//   type: 'urination' | 'defecation';
//   timestamp: string;
// };

export default function BabyLogPage() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();

  const [logEntries, setLogEntries] = useState<BabyLogEntry[]>([]);
  const [type, setType] = useState<'urination' | 'defecation'>('urination');
  const [datetime, setDatetime] = useState<string>(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [isLoadingLogs, setIsLoadingLogs] = useState(true); // For loading state of logs

  // Authentication check and redirection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Data fetching - only if user is authenticated
  useEffect(() => {
    if (user) {
      setIsLoadingLogs(true);
      fetch('/api/baby-log')
        .then((response) => {
          if (!response.ok) {
            // If unauthorized, Supabase middleware might redirect or API returns 401
            // which will be caught here.
            if (response.status === 401) {
              router.push('/login'); // Explicitly redirect if API call fails due to auth
            }
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
          setLogEntries([]); // Clear logs on error
        })
        .finally(() => {
          setIsLoadingLogs(false);
        });
    } else {
      // If no user, clear logs and don't attempt to fetch
      setLogEntries([]);
      setIsLoadingLogs(false);
    }
  }, [user, router]); // router added as dependency for the push call

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { // Should not happen if UI is correctly showing loading/redirecting
      alert("User not authenticated. Please login.");
      router.push('/login');
      return;
    }
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
        if (response.status === 401) {
          alert('Authentication error. Please login again.');
          router.push('/login');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newEntry = await response.json() as BabyLogEntry;
      if (newEntry && typeof newEntry === 'object' && newEntry.id) {
        setLogEntries((prev) => [newEntry, ...prev]); // No need for 'as BabyLogEntry[]' if newEntry is already typed
        
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        setDatetime(now.toISOString().slice(0, 16));
      } else {
        throw new Error('Invalid response data from server');
      }
    } catch (error) {
      console.error('Error submitting baby log:', error);
      alert('データの保存に失敗しました。');
    }
  };

  const handleDelete = async (id: number) => {
    if (!user) {
      alert("User not authenticated. Please login.");
      router.push('/login');
      return;
    }
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
        // Assuming if response is not ok, it will be an ApiError JSON
        const errorData = await response.json() as ApiError; 
        console.error('Failed to delete entry:', errorData);
        if (response.status === 401) {
            alert('Authentication error. Please login again.');
            router.push('/login');
        } else {
            // errorData should have an .error property due to ApiError type
            alert(`データの削除に失敗しました: ${errorData.error || 'Server error'}`); 
        }
      }
    } catch (error) {
      // This outer catch will handle network errors or if response.json() fails parsing
      console.error('Failed to delete entry or parse error response:', error);
      alert('データの削除中に予期せぬエラーが発生しました。');
    }
  };

  // Display loading indicator while checking auth or if user is null (before redirect)
  // or while logs are loading
  if (authLoading || isLoadingLogs || !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Render the actual page content here if user is authenticated
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🍼 赤ちゃんのトイレログ</h1>
        {/* The AuthButton could be placed here or in the main layout */}
        {/* For example: <AuthButton /> */}
        <a
          href="/demo-data"
          className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded transition-colors duration-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
        >
          🧪 デモデータ
        </a>
      </div>
      
      {/* 記録フォーム */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
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
              <label htmlFor="datetime" className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                日時
              </label>
              <input
                id="datetime"
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                className="border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">📋 最近の記録</h2>
        {logEntries.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">まだ記録がありません。上のフォームから記録を追加してください。</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logEntries.slice(0, 20).map((entry) => (
              <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="flex items-center space-x-2">
                  <span className="text-lg">
                    {entry.type === 'urination' ? '💧' : '💩'}
                  </span>
                  <span>
                    {entry.type === 'urination' ? 'おしっこ' : 'うんち'}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
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
              <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
                最新の20件を表示しています（全{logEntries.length}件）
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}