import React from 'react';
import { render, screen } from '@testing-library/react';
import BabyLogCharts, { LogEntry } from './BabyLogCharts'; // BabyLogChartsをデフォルトインポート, LogEntryの型をインポート
import { format } from 'date-fns';
import React from 'react'; // Reactのインポートを追加 (モック内でJSXを使用するため)

// Recharts のモック
jest.mock('recharts', () => {
  const OriginalRecharts = jest.requireActual('recharts');
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div className="recharts-responsive-container" style={{ width: '500px', height: '300px' }}>
        {children}
      </div>
    ),
    BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="mocked-bar-chart">{children}</div>,
    LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="mocked-line-chart">{children}</div>,
    PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="mocked-pie-chart">{children}</div>,
    Bar: () => <div data-testid="mocked-bar" />,
    Line: () => <div data-testid="mocked-line" />,
    Pie: () => <div data-testid="mocked-pie" />,
    XAxis: () => <div data-testid="mocked-x-axis" />,
    YAxis: () => <div data-testid="mocked-y-axis" />,
    CartesianGrid: () => <div data-testid="mocked-cartesian-grid" />,
    Tooltip: () => <div data-testid="mocked-tooltip" />,
    Legend: () => <div data-testid="mocked-legend" />,
    Cell: () => <div data-testid="mocked-cell" />,
  };
});

// テスト用の固定された「今日」の日付
const TODAY = new Date(2023, 10, 15); // 2023年11月15日 (月は0から始まるため10は11月)

describe('BabyLogCharts', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(TODAY);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  // --- データがない場合のテスト ---
  describe('データがない場合', () => {
    beforeEach(() => {
      render(<BabyLogCharts logEntries={[]} />);
    });

    it(' "記録がありません。まずは記録を追加してください。" というメッセージが表示される', () => {
      expect(screen.getByText('記録がありません。まずは記録を追加してください。')).toBeInTheDocument();
    });

    it('主要なチャートタイトル "📊 グラフ" は表示される', () => {
      expect(screen.getByText('📊 グラフ')).toBeInTheDocument();
    });

    it('各種チャートセクションのタイトルは表示されない', () => {
      expect(screen.queryByText('今日の記録')).not.toBeInTheDocument();
      expect(screen.queryByText('過去7日間の推移')).not.toBeInTheDocument();
      expect(screen.queryByText('時間別分布')).not.toBeInTheDocument();
      expect(screen.queryByText('種類別の割合')).not.toBeInTheDocument();
    });
  });

  // --- データがある場合のテスト ---
  describe('データがある場合', () => {
    // テスト用のダミーデータ
    const mockLogEntries: LogEntry[] = [
      // 今日のデータ
      { id: 1, type: 'urination', timestamp: new Date(2023, 10, 15, 10, 0).toISOString() },
      { id: 2, type: 'defecation', timestamp: new Date(2023, 10, 15, 12, 0).toISOString() },
      { id: 3, type: 'urination', timestamp: new Date(2023, 10, 15, 15, 0).toISOString() },
      // 昨日のデータ
      { id: 4, type: 'urination', timestamp: new Date(2023, 10, 14, 8, 0).toISOString() },
      { id: 5, type: 'defecation', timestamp: new Date(2023, 10, 14, 18, 0).toISOString() },
      // 3日前のデータ
      { id: 6, type: 'urination', timestamp: new Date(2023, 10, 12, 9, 0).toISOString() },
      // 7日前のデータ (日付を11/9に変更して、過去7日間に含める)
      { id: 7, type: 'defecation', timestamp: new Date(2023, 10, 9, 10, 0).toISOString() },
      // 8日前のデータ (7日間集計からは漏れる)
      { id: 8, type: 'urination', timestamp: new Date(2023, 10, 7, 10, 0).toISOString() },
    ];

    beforeEach(() => {
      render(<BabyLogCharts logEntries={mockLogEntries} />);
    });

    it('コンポーネントがエラーなくレンダリングされる', () => {
      // renderが成功すればOK
      expect(screen.getByText('📊 グラフ')).toBeInTheDocument();
    });

    it('主要なセクションのタイトルが表示される', () => {
      expect(screen.getByText('今日の記録')).toBeInTheDocument();
      expect(screen.getByText('過去7日間の推移')).toBeInTheDocument();
      expect(screen.getByText('時間別分布')).toBeInTheDocument();
      expect(screen.getByText('種類別の割合')).toBeInTheDocument();
    });

    it('今日の記録（おしっことうんちの回数）が正しく表示される', () => {
      // コンポーネント内の表示に合わせて確認 (今日の記録セクション内のおしっことうんちの値)
      const todaySection = screen.getByText('今日の記録').closest('div');
      // todaySection が null でないことをアサーション (より安全に)
      expect(todaySection).toBeInTheDocument();
      if (todaySection) {
        // おしっこのカウントは "おしっこ" ラベルの前の div の中にあると想定
        const urinationValueElement = Array.from(todaySection.querySelectorAll('div')).find(el => el.textContent === 'おしっこ')?.previousSibling;
        // うんちのカウントは "うんち" ラベルの前の div の中にあると想定
        const defecationValueElement = Array.from(todaySection.querySelectorAll('div')).find(el => el.textContent === 'うんち')?.previousSibling;

        expect(urinationValueElement).toHaveTextContent('2');
        expect(defecationValueElement).toHaveTextContent('1');
      }
    });

    it('総記録数が正しく表示される', () => {
      // "総記録数" というテキストの次の要素が値だと想定
      expect(screen.getByText('総記録数').nextElementSibling).toHaveTextContent('8');
    });

    it('1日平均が正しく計算されて表示される (過去7日間)', () => {
      // おしっこ: (今日2 + 昨日1 + 3日前1) = 4件 / 7日 = 0.57... -> 0.6
      // うんち: (今日1 + 昨日1 + 7日前1) = 3件 / 7日 = 0.42... -> 0.4
      // 注意: ラベルが '1日平均' から '1日平均 (過去7日間)' に変更されていることを確認
      const averageLabelElement = screen.getByText('1日平均 (過去7日間)');
      expect(averageLabelElement).toBeInTheDocument();
      expect(averageLabelElement.nextElementSibling).toHaveTextContent('おしっこ: 0.6回, うんち: 0.4回');
    });

    it('最多記録日が正しく特定されて表示される', () => {
      // 今日(11/15)が3件で最多。コンポーネントは 'M/d' 形式で表示
      const expectedDate = format(TODAY, 'M/d');
      expect(screen.getByText('最多記録日').nextElementSibling).toHaveTextContent(expectedDate);
    });

    it('Recharts の各種チャートコンポーネントがレンダリングされる', () => {
      expect(screen.getByTestId('mocked-bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('mocked-line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('mocked-pie-chart')).toBeInTheDocument();

      // 個別の要素も確認 (Bar, Line, Pieなど)
      // BarChart, LineChart, PieChart の子要素としてレンダリングされる想定
      expect(screen.getAllByTestId('mocked-bar').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('mocked-line').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('mocked-pie').length).toBeGreaterThan(0);
    });
  });
});
