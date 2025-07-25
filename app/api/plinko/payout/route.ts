// app/api/plinko/payout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { loadUsers, updateUserBalance } from '@/app/_lib/userHelpers'

const USERS_PATH = path.resolve(process.cwd(), 'users.json')

function saveUsers(u: any[]) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(u, null, 2))
}
function getUser(users: any[], username: string) {
  return users.find(u => u.username === username)
}

export async function POST(req: NextRequest) {
  const { username, betAmount, payoutMultiplier } = await req.json()
  if (
    typeof username !== 'string' ||
    typeof betAmount !== 'number' ||
    typeof payoutMultiplier !== 'number'
  ) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const users = await  loadUsers()
  const user = getUser(users, username)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Compute payout and credit
  const payout = betAmount * payoutMultiplier
  user.wallet.balance += payout
  await updateUserBalance(username, user.wallet.balance)

  return NextResponse.json({
    payout,
    newBalance: user.wallet.balance,
  })
}
