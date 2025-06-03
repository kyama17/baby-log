import Link from 'next/link';

export default function LandingPage() {
  return (
    <div>
      <h1>ようこそ！</h1>
      <p>
        素晴らしい機能の数々をぜひ体験してください。アカウントをお持ちでない方は新規登録、既にお持ちの方はログインしてください。
      </p>
      {/* Features Section */}
      <section style={{ marginBottom: '20px', marginTop: '20px' }}>
        <h2 style={{ fontSize: '1.5em', marginBottom: '10px' }}>特徴</h2>
        <ul style={{ listStylePosition: 'inside' }}>
          <li style={{ marginBottom: '5px' }}>赤ちゃんのおしっことうんちを記録</li>
          <li style={{ marginBottom: '5px' }}>記録されたログを表示</li>
          <li style={{ marginBottom: '5px' }}>日本語対応のユーザーインターフェース</li>
          <li style={{ marginBottom: '5px' }}><strong>ユーザー認証</strong>: Supabaseを利用したメールアドレスとパスワードによるサインアップ・サインイン機能。ユーザーはアカウントを作成して、自分の赤ちゃんの活動記録を管理できます。</li>
        </ul>
      </section>
      <div>
        <Link href="/login">
          <button>ログイン</button>
        </Link>
        {/* サインアップ機能が実装されたら、ここにサインアップボタン/リンクを追加します */}
      </div>
    </div>
  );
}
