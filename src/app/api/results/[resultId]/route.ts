import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ resultId: string }> }) {
  const { resultId } = await params;
  // TODO: Implement result retrieval endpoint
  return NextResponse.json({ resultId });
}
