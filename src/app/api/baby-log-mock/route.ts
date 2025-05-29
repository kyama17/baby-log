import { NextResponse } from 'next/server';

type BabyLogEntry = {
  id: number;
  type: 'urination' | 'defecation';
  timestamp: string;
};

// メモリ内ストレージ（開発用）
let mockData: BabyLogEntry[] = [];
let nextId = 1;

export async function GET(request: Request) {
  // 日付順でソート（新しい順）
  const sortedData = [...mockData].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return NextResponse.json(sortedData);
}

export async function POST(request: Request) {
  const { type, timestamp }: { type: 'urination' | 'defecation'; timestamp?: string } = await request.json();
  
  const newEntry: BabyLogEntry = {
    id: nextId++,
    type,
    timestamp: timestamp || new Date().toISOString(),
  };

  mockData.push(newEntry);
  
  return NextResponse.json(newEntry, { status: 201 });
}

export async function DELETE(request: Request) {
  const body = await request.json() as { id?: number };
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing id in request body" }, { status: 400 });
  }

  const index = mockData.findIndex(entry => entry.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  mockData.splice(index, 1);
  
  return NextResponse.json({ message: "Log entry deleted successfully" }, { status: 200 });
}