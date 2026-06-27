// RemitFlow Contract Hooks
// Provides typed interfaces to interact with the RemitFlow Soroban contract

import { submitTransaction } from "@/lib/utils";
import * as contract from "@/packages/contract/src/index";

const CONTRACT_ID =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

// ---------- Read Helpers ----------

export async function getCorridors(): Promise<contract.Corridor[]> {
  if (!CONTRACT_ID) return [];
  try {
    return await contract.get_all_corridors(CONTRACT_ID);
  } catch (err) {
    console.error("Failed to load corridors:", err);
    return [];
  }
}

export async function getCorridor(id: number): Promise<contract.Corridor> {
  return contract.get_corridor(CONTRACT_ID, id);
}

export async function getCorridorCount(): Promise<number> {
  return contract.get_corridor_count(CONTRACT_ID);
}

export async function getUserPayments(
  userAddress: string
): Promise<contract.Payment[]> {
  if (!CONTRACT_ID || !userAddress) return [];
  try {
    return await contract.get_payments_by_user(CONTRACT_ID, userAddress);
  } catch (err) {
    console.error("Failed to load user payments:", err);
    return [];
  }
}

export async function getPayment(id: number): Promise<contract.Payment> {
  return contract.get_payment(CONTRACT_ID, id);
}

export async function getPaymentCount(): Promise<number> {
  return contract.get_payment_count(CONTRACT_ID);
}

// ---------- Write Helpers ----------

export async function createPayment(
  source: string,
  sender: string,
  recipient: string,
  corridorId: number,
  amount: bigint | number,
  sourceCurrency: string,
  memo: string
): Promise<string> {
  return contract.build_create_payment(
    CONTRACT_ID,
    source,
    sender,
    recipient,
    corridorId,
    amount,
    sourceCurrency,
    memo
  );
}

export async function submitSignedTx(signedXdr: string): Promise<string> {
  return submitTransaction(signedXdr);
}

// Re-export contract constants for convenience
export const PAYMENT_STATUS = contract.PAYMENT_STATUS;
export const STATUS_LABELS = contract.STATUS_LABELS;

// ---------- Utility ----------

export function formatStatus(status: number): string {
  return STATUS_LABELS[status] || "Unknown";
}

export function formatAmount(amount: bigint | number, decimals: number = 7): string {
  const num = typeof amount === "bigint" ? Number(amount) : amount;
  return (num / 10 ** decimals).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}

export function getStatusColor(status: number): string {
  switch (status) {
    case 0:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case 1:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case 2:
      return "bg-green-100 text-green-800 border-green-200";
    case 3:
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}
