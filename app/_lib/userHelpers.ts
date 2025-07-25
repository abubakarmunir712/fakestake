import clientPromise from "./db";

const DB_NAME = "fakestake";
const COLLECTION = "users";

// Load all users
export async function loadUsers() {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = await db.collection(COLLECTION).find().toArray();
    return users;
}

// Save a new user object
export async function saveUser(userObj: any) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const result = await db.collection(COLLECTION).insertOne(userObj);
    return result;
}

// Update balance of a user by username
export async function updateUserBalance(username: string, newBalance: number) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const result = await db.collection(COLLECTION).updateOne(
        { username },
        { $set: { "wallet.balance": newBalance } }
    );
    return result;
}
