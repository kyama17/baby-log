'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import BabyLogCharts from './BabyLogCharts';
import { BabyLogEntry, ApiError } from '@/types';
import { useTranslations } from 'next-intl';

export default function BabyLogContent({ user }: { user: User }) {
  const router = useRouter();
  const t = useTranslations('BabyLogContent');

  const [logEntries, setLogEntries] = useState<BabyLogEntry[]>([]);
  const [type, setType] = useState<'urination' | 'defecation'>('urination');
  const [datetime, setDatetime] = useState<string>(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  useEffect(() => {
    setIsLoadingLogs(true);
    fetch('/api/baby-log')
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
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
        setLogEntries([]);
      })
      .finally(() => {
        setIsLoadingLogs(false);
      });
  }, [router]);

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
        if (response.status === 401) {
          alert(t('alertAuthError'));
          router.push('/login');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newEntry = await response.json() as BabyLogEntry;
      if (newEntry && typeof newEntry === 'object' && newEntry.id) {
        setLogEntries((prev) => [newEntry, ...prev]);
        
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        setDatetime(now.toISOString().slice(0, 16));
      } else {
        throw new Error('Invalid response data from server');
      }
    } catch (error) {
      console.error('Error submitting baby log:', error);
      alert(t('alertErrorSaving'));
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
        const errorData = await response.json() as ApiError;
        console.error('Failed to delete entry:', errorData);
        if (response.status === 401) {
            alert(t('alertAuthError'));
            router.push('/login');
        } else {
            alert(t('alertErrorDeleting', { error: errorData.error || 'Server error' }));
        }
      }
    } catch (error) {
      console.error('Failed to delete entry or parse error response:', error);
      alert(t('alertErrorDeletingUnexpected'));
    }
  };

  if (isLoadingLogs) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>{t('loadingMessage')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('pageTitle')}</h1>
        {/* The AuthButton could be placed here or in the main layout */}
        {/* For example: <AuthButton /> */}
        <a
          href="/demo-data" // This link might need localization if it routes within the app
          className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded transition-colors duration-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
        >
          {t('demoDataLink')}
        </a>
      </div>
      
      {/* 記録フォーム */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">{t('newRecordTitle')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            {/* Consider adding a label for the select element for accessibility */}
            {/* <label htmlFor="type" className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('typeLabel')}</label> */}
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as 'urination' | 'defecation')}
              className="border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label={t('typeLabel')}
            >
              <option value="urination">{t('urinationOption')}</option>
              <option value="defecation">{t('defecationOption')}</option>
            </select>
            <div className="flex flex-col">
              <label htmlFor="datetime" className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t('datetimeLabel')}
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
              {t('recordButton')}
            </button>
          </div>
        </form>
      </div>

      {/* グラフセクション */}
      {/* BabyLogCharts component itself would need to be localized if it contains text */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">{t('chartsTitle')}</h2>
        <BabyLogCharts logEntries={logEntries} />
      </div>

      {/* ログエントリ一覧 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">{t('recentRecordsTitle')}</h2>
        {logEntries.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">{t('noRecordsMessage')}</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logEntries.slice(0, 20).map((entry) => (
              <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="flex items-center space-x-2">
                  {/* Emoji is part of the translated option text now */}
                  <span>
                    {entry.type === 'urination' ? t('urinationOption') : t('defecationOption')}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {/* Date/time formatting should ideally use locale-aware methods if not already */}
                    {new Date(entry.timestamp).toLocaleString()} {/* Consider using next-intl's formatDate */}
                  </span>
                </span>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                >
                  {t('deleteButton')}
                </button>
              </div>
            ))}
            {logEntries.length > 20 && (
              <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
                {t('paginationMessage', { count: logEntries.length })}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
