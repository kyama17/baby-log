import { NextResponse } from 'next/server';

type BabyLogEntry = {
  id: number;
  type: 'urination' | 'defecation';
  timestamp: string;
};

let babyLog: BabyLogEntry[] = [];

export async function GET(request: Request) {
  return NextResponse.json(babyLog);
}

export async function POST(request: Request) {
  const { type }: { type: 'urination' | 'defecation' } = await request.json();
  const newEntry: BabyLogEntry = {
    id: babyLog.length + 1,
    type,
    timestamp: new Date().toISOString(),
  };
  babyLog.push(newEntry);
  return NextResponse.json(newEntry, { status: 201 });
}