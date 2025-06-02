import Link from 'next/link';

export default function LandingPage() {
  return (
    <div>
      <h1>ようこそ！</h1>
      <p>
        素晴らしい機能の数々をぜひ体験してください。アカウントをお持ちでない方は新規登録、既にお持ちの方はログインしてください。
      </p>
      <div>
        <Link href="/login">
          <button>ログイン</button>
        </Link>
        {/* サインアップ機能が実装されたら、ここにサインアップボタン/リンクを追加します */}
      </div>
    </div>
  );
}
