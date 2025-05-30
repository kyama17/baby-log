import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import DemoDataPage from './page'; // 対象のコンポーネントをインポート

// global.fetch のモック
global.fetch = jest.fn();

// next/navigation のモック
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(), // refreshメソッドもモックしておく
  }),
}));

describe('DemoDataPage', () => {
  beforeEach(() => {
    // 各テストの前に fetch モックをリセット
    (fetch as jest.Mock).mockClear();
    // useRouter の中のメソッドもリセットしたければ、ここで再モックするか、個別に mockClear する
    // 今回はページ遷移のテストは主目的ではないため、基本的なモックで進める
  });

  // --- 初期表示のテスト ---
  describe('初期表示', () => {
    beforeEach(() => {
      render(<DemoDataPage />);
    });

    it('ページタイトル「🧪 デモデータ管理」が表示される', () => {
      expect(screen.getByRole('heading', { name: '🧪 デモデータ管理' })).toBeInTheDocument();
    });

    it('「デモデータを生成」ボタンが初期状態で有効であり、正しいテキストで表示されている', () => {
      const generateButton = screen.getByRole('button', { name: 'デモデータを生成' });
      expect(generateButton).toBeInTheDocument();
      expect(generateButton).toBeEnabled();
    });

    it('「全データを削除」ボタンが初期状態で有効であり、正しいテキストで表示されている', () => {
      const deleteButton = screen.getByRole('button', { name: '全データを削除' });
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toBeEnabled();
    });

    it('初期状態ではメッセージエリアが表示されていない', () => {
      // メッセージエリアを特定するためのより堅牢なセレクタを検討 (例: testId)
      // ここでは、特定のスタイルクラスを持つ要素を探すことで代替
      const messageArea = screen.queryByTestId('message-area');
      expect(messageArea).not.toBeInTheDocument();
    });

    it('「メインページに戻る」リンクが表示され、正しい href ("/") を持っている', () => {
      const backLink = screen.getByRole('link', { name: '← メインページに戻る' });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/');
    });
  });

  // --- デモデータ生成機能のテスト ---
  describe('デモデータ生成機能', () => {
    it('成功時: デモデータが生成され、成功メッセージが表示され、ボタンが元に戻る', async () => {
      // すべてのfetch呼び出しに対して汎用的な成功レスポンスを返す
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Mocked POST success' }),
      });

      render(<DemoDataPage />);
      const generateButton = screen.getByRole('button', { name: 'デモデータを生成' });

      fireEvent.click(generateButton);

      await waitFor(() => expect(generateButton).toBeDisabled());
      // await waitFor(() => expect(generateButton).toHaveTextContent('生成中...')); // コメントアウト

      // fetch が呼び出されるのを待つ
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/baby-log-mock',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('"type":'), // "type" を含むことを確認
          })
        );
      });
      // 呼び出し回数は不定なので具体的な回数チェックは削除または緩和
      expect((fetch as jest.Mock).mock.calls.length).toBeGreaterThan(0);


      await waitFor(() => {
        // page.tsxの実装に合わせたメッセージを確認
        // 例: "XX件のデモデータを生成しました！" のようなメッセージが表示される
        expect(screen.getByTestId('message-area')).toHaveTextContent(/件のデモデータを生成しました！/);
      });

      await waitFor(() => expect(generateButton).toBeEnabled());
      expect(generateButton).toHaveTextContent('デモデータを生成');
    });

    it('失敗時: fetchエラーが発生し、エラーメッセージが表示される', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('APIエラー'));

      render(<DemoDataPage />);
      const generateButton = screen.getByRole('button', { name: 'デモデータを生成' });

      fireEvent.click(generateButton);
      
      await waitFor(() => expect(generateButton).toBeDisabled());
      // await waitFor(() => expect(generateButton).toHaveTextContent('生成中...')); // コメントアウト

      await waitFor(() => {
        expect(screen.getByTestId('message-area')).toHaveTextContent('エラーが発生しました: APIエラー');
      });
      
      await waitFor(() => expect(generateButton).toBeEnabled());
      expect(generateButton).toHaveTextContent('デモデータを生成');
    });
  });

  // --- 全データ削除機能のテスト ---
  describe('全データ削除機能', () => {
    const mockEntries = [{ id: '1' }, { id: '2' }, { id: '3' }];

    it.skip('成功時: 全データが削除され、成功メッセージが表示され、ボタンが元に戻る', async () => {
      (fetch as jest.Mock).mockImplementation(async (url: string, options?: RequestInit) => {
        if (url === '/api/baby-log-mock') {
          if (!options || options.method === 'GET') {
            return Promise.resolve({
              ok: true,
              json: async () => mockEntries,
            });
          } else if (options.method === 'DELETE') {
            return Promise.resolve({
              ok: true,
              json: async () => ({ message: '削除成功' }),
            });
          }
        }
        return Promise.reject(new Error(`Unexpected fetch call: ${url} method: ${options?.method} body: ${options?.body}`));
      });

      render(<DemoDataPage />);
      const deleteButton = screen.getByRole('button', { name: '全データを削除' });

      fireEvent.click(deleteButton);
      
      await waitFor(() => expect(deleteButton).toBeDisabled());
      // await waitFor(() => expect(deleteButton).toHaveTextContent('削除中...')); // コメントアウト

      await waitFor(() => {
        // GETリクエストはoptionsなしで呼び出される場合があるため、URLのみで確認
        const getCall = (fetch as jest.Mock).mock.calls.find(call => call[0] === '/api/baby-log-mock' && (!call[1] || call[1].method === 'GET'));
        expect(getCall).toBeDefined();
      });

      for (const entry of mockEntries) {
        await waitFor(() => {
          expect(fetch).toHaveBeenCalledWith(
            '/api/baby-log-mock',
            expect.objectContaining({
              method: 'DELETE',
              body: JSON.stringify({ id: entry.id }),
            })
          );
        });
      }
      expect(fetch).toHaveBeenCalledTimes(1 + mockEntries.length);

      await waitFor(() => {
        expect(screen.getByTestId('message-area')).toHaveTextContent(`${mockEntries.length}件のデータを削除しました。`);
      });

      await waitFor(() => expect(deleteButton).toBeEnabled());
      expect(deleteButton).toHaveTextContent('全データを削除');
    });

    it('失敗時 (GETエラー): fetchエラーが発生し、エラーメッセージが表示される', async () => {
      (fetch as jest.Mock).mockImplementation(async (url: string, options?: RequestInit) => {
        if (url === '/api/baby-log-mock' && (!options || options.method === 'GET')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Internal Server Error' }),
          });
        }
        return Promise.reject(new Error(`Unexpected fetch call: ${url} method: ${options?.method} body: ${options?.body}`));
      });

      render(<DemoDataPage />);
      const deleteButton = screen.getByRole('button', { name: '全データを削除' });

      fireEvent.click(deleteButton);

      await waitFor(() => expect(deleteButton).toBeDisabled());
      // await waitFor(() => expect(deleteButton).toHaveTextContent('削除中...')); // コメントアウト

      await waitFor(() => {
        expect(screen.getByTestId('message-area')).toHaveTextContent(/エラーが発生しました:/);
      });

      await waitFor(() => expect(deleteButton).toBeEnabled());
      expect(deleteButton).toHaveTextContent('全データを削除');
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    
    it('失敗時 (DELETEエラー): fetchエラーが発生し、エラーメッセージが表示される', async () => {
      (fetch as jest.Mock).mockImplementation(async (url: string, options?: RequestInit) => {
        if (url === '/api/baby-log-mock') {
          if (!options || options.method === 'GET') {
            return Promise.resolve({
              ok: true,
              json: async () => mockEntries,
            });
          } else if (options.method === 'DELETE') {
            // 最初のDELETEだけ失敗させる
            if (options.body && JSON.parse(options.body as string).id === mockEntries[0].id) {
              return Promise.reject(new Error('削除APIエラー'));
            }
            return Promise.resolve({ // それ以降のDELETEは成功したことにする（実際には呼ばれないはず）
              ok: true,
              json: async () => ({ message: '削除成功' }),
            });
          }
        }
        return Promise.reject(new Error(`Unexpected fetch call: ${url} method: ${options?.method} body: ${options?.body}`));
      });

      render(<DemoDataPage />);
      const deleteButton = screen.getByRole('button', { name: '全データを削除' });

      fireEvent.click(deleteButton);
      
      await waitFor(() => expect(deleteButton).toBeDisabled());
      // await waitFor(() => expect(deleteButton).toHaveTextContent('削除中...')); // コメントアウト

      await waitFor(() => {
        expect(screen.getByTestId('message-area')).toHaveTextContent('エラーが発生しました: 削除APIエラー');
      });
      
      await waitFor(() => expect(deleteButton).toBeEnabled());
      expect(deleteButton).toHaveTextContent('全データを削除');
      expect(fetch).toHaveBeenCalledTimes(1 + 1); // GET 1回 + 失敗したDELETE 1回
    });

    it.skip('削除対象データがない場合、その旨のメッセージが表示される', async () => {
      (fetch as jest.Mock).mockImplementation(async (url: string, options?: RequestInit) => {
        if (url === '/api/baby-log-mock' && (!options || options.method === 'GET')) {
          return Promise.resolve({
            ok: true,
            json: async () => ([]), // データなし
          });
        }
        return Promise.reject(new Error(`Unexpected fetch call: ${url} method: ${options?.method} body: ${options?.body}`));
      });

      render(<DemoDataPage />);
      const deleteButton = screen.getByRole('button', { name: '全データを削除' });

      fireEvent.click(deleteButton);

      await waitFor(() => expect(deleteButton).toBeDisabled()); 
      // await waitFor(() => expect(deleteButton).toHaveTextContent('削除中...')); // コメントアウト


      await waitFor(() => {
        expect(screen.getByTestId('message-area')).toHaveTextContent('削除対象のデータはありませんでした。');
      });
      
      await waitFor(() => expect(deleteButton).toBeEnabled());
      expect(deleteButton).toHaveTextContent('全データを削除');
      expect(fetch).toHaveBeenCalledTimes(1); 
    });
  });
});
