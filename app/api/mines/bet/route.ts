import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { loadUsers, updateUserBalance } from '@/app/_lib/userHelpers';

async function getUser(username: string) {
  const users = await loadUsers();
  return users.find((u: any) => u.username === username);
}



export async function POST(req: NextRequest) {
  const { betAmount, username } = await req.json();
  if (!betAmount || !username) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const user = await getUser(username);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (user.wallet.balance < betAmount) return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });

  const newBalance = user.wallet.balance - betAmount;
  await updateUserBalance(username, newBalance);
  return NextResponse.json({ newBalance });
} 