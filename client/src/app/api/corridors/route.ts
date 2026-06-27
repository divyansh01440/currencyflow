import { NextResponse } from "next/server";

// In-memory fallback corridors (used when contract not deployed)
const FALLBACK_CORRIDORS = [
  {
    name: "US to Mexico",
    source_currency: "USD",
    dest_currency: "MXN",
    fee_bps: 200,
    active: true,
  },
  {
    name: "US to Philippines",
    source_currency: "USD",
    dest_currency: "PHP",
    fee_bps: 150,
    active: true,
  },
  {
    name: "EU to Nigeria",
    source_currency: "EUR",
    dest_currency: "NGN",
    fee_bps: 250,
    active: true,
  },
  {
    name: "UK to India",
    source_currency: "GBP",
    dest_currency: "INR",
    fee_bps: 180,
    active: true,
  },
  {
    name: "US to Kenya",
    source_currency: "USD",
    dest_currency: "KES",
    fee_bps: 220,
    active: true,
  },
  {
    name: "Canada to India",
    source_currency: "CAD",
    dest_currency: "INR",
    fee_bps: 160,
    active: true,
  },
];

// GET /api/corridors
export async function GET() {
  try {
    // Try to get from contract if address is configured
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

    if (!contractAddress) {
      return NextResponse.json({
        corridors: FALLBACK_CORRIDORS,
        source: "fallback",
      });
    }

    // Attempt Soroban contract call
    const { get_all_corridors } = await import(
      "@/packages/contract/src/index"
    );
    const corridors = await get_all_corridors(contractAddress);

    return NextResponse.json({
      corridors: corridors.length > 0 ? corridors : FALLBACK_CORRIDORS,
      source: corridors.length > 0 ? "contract" : "fallback",
    });
  } catch (error) {
    console.error("Failed to fetch corridors:", error);
    return NextResponse.json({
      corridors: FALLBACK_CORRIDORS,
      source: "fallback",
    });
  }
}
