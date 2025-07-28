import { loadUsers, updateUserBalance } from "@/app/_lib/userHelpers";
import { NextRequest, NextResponse } from "next/server";

async function getUser(username: string) {
    const users = await loadUsers();
    return users.find((u: any) => u.username === username);
}

export async function POST(req: NextRequest) {
    const { betAmount, prevMultiplier, currentMultiplier, username, didWin } = await req.json()
    if (!betAmount || !prevMultiplier || !currentMultiplier || !username) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    }
    if (currentMultiplier > prevMultiplier) {
        return NextResponse.json({ error: 'Cannot withdraw after game is over' }, { status: 400 });

    }

    let user = await getUser(username)
    console.log("--", user?.wallet.balance)
    console.log("=>", prevMultiplier, betAmount)
    console.log("==>", currentMultiplier, betAmount)
    let updatedBalanace;
    if (didWin) {
        console.log("win")
        updatedBalanace = user?.wallet.balance - (prevMultiplier * betAmount) + (currentMultiplier * betAmount)

    }
    else {
        console.log("lose")
        updatedBalanace = user?.wallet.balance + (betAmount * currentMultiplier)
    }
    await updateUserBalance(username, updatedBalanace)
    return NextResponse.json({ balance: updatedBalanace })


}