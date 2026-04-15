import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { resultId: string } }) {
  // TODO: Implement result retrieval endpoint
  return NextResponse.json({ resultId: params.resultId });
}
