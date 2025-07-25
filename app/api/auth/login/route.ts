import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { loadUsers } from '@/app/_lib/userHelpers';

// const USERS_PATH = path.resolve(process.cwd(), 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
  }
  let users = [];
  users = await loadUsers()
  console.log(users)
  const user = users.find((u: any) => u.username === username);
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
  return NextResponse.json({ token });
} 