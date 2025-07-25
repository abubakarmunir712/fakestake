import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { loadUsers, saveUser } from '@/app/_lib/userHelpers';

const USERS_PATH = path.resolve(process.cwd(), 'users.json');

function generateWallet() {
  const hex = [...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  return {
    address: `wallet_${hex}`,
    balance: 1000,
  };
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
  }
  let users = [];
  users = await loadUsers()
  console.log(users)
  if (users.find((u: any) => u.username === username)) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const wallet = generateWallet();
  let user = { username, password: hashedPassword, wallet }
  let a = await saveUser(user)
  

  return NextResponse.json({ success: true });
} 