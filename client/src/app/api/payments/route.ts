import { NextResponse } from "next/server";
import { rpc, Networks } from "@stellar/stellar-sdk";

const RPC_URL = "https://soroban-testnet.stellar.org";

// GET /api/payments?user=G...
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user = searchParams.get("user");

  if (!user) {
    return NextResponse.json(
      { error: "User address required" },
      { status: 400 }
    );
  }

  try {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

    if (!contractAddress) {
      return NextResponse.json({
        payments: [],
        source: "empty",
      });
    }

    const { get_payments_by_user } = await import(
      "@/packages/contract/src/index"
    );
    const payments = await get_payments_by_user(contractAddress, user);

    return NextResponse.json({
      payments,
      source: "contract",
    });
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
