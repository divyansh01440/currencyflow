// RemitFlow Contract TypeScript Bindings
// Auto-generated typed wrappers for the Soroban smart contract

import {
  nativeToScVal,
  scValToNative,
  Address,
  Contract,
  rpc,
  TransactionBuilder,
  Networks,
  xdr,
} from "@stellar/stellar-sdk";

// Types matching the Rust contract
export interface Corridor {
  name: string;
  source_currency: string;
  dest_currency: string;
  fee_bps: number;
  active: boolean;
}

export interface StatusEntry {
  status: number;
  timestamp: number;
}

export interface Payment {
  id: number;
  sender: string;
  recipient: string;
  corridor_id: number;
  amount: bigint;
  source_currency: string;
  memo: string;
  status: number;
  status_history: StatusEntry[];
  created_at: number;
}

// Status constants
export const PAYMENT_STATUS = {
  CREATED: 0,
  SENT: 1,
  COMPLETED: 2,
  CANCELLED: 3,
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const STATUS_LABELS: Record<number, string> = {
  0: "Created",
  1: "Sent",
  2: "Completed",
  3: "Cancelled",
};

// Config
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;

let serverInstance: rpc.Server | null = null;
function getServer(): rpc.Server {
  if (!serverInstance) {
    serverInstance = new rpc.Server(RPC_URL);
  }
  return serverInstance;
}

function toScValString(v: string) {
  return nativeToScVal(v, { type: "string" });
}

function toScValU32(v: number) {
  return nativeToScVal(v, { type: "u32" });
}

function toScValI128(v: bigint | number) {
  return nativeToScVal(v, { type: "i128" });
}

function toScValAddress(v: string) {
  return new Address(v).toScVal();
}

function toScValBool(v: boolean) {
  return nativeToScVal(v);
}

function fromScVal(sv: xdr.ScVal): any {
  return scValToNative(sv);
}

function parseCorridor(val: any): Corridor {
  return {
    name: val.name,
    source_currency: val.source_currency,
    dest_currency: val.dest_currency,
    fee_bps: Number(val.fee_bps),
    active: val.active,
  };
}

function parseStatusEntry(val: any): StatusEntry {
  return {
    status: val.status,
    timestamp: Number(val.timestamp),
  };
}

function parsePayment(val: any): Payment {
  return {
    id: val.id,
    sender: val.sender?.toString?.() || val.sender,
    recipient: val.recipient?.toString?.() || val.recipient,
    corridor_id: val.corridor_id,
    amount: BigInt(val.amount),
    source_currency: val.source_currency,
    memo: val.memo,
    status: val.status,
    status_history: (val.status_history || []).map(parseStatusEntry),
    created_at: Number(val.created_at),
  };
}

// Read methods
export async function get_corridor_count(contractId: string): Promise<number> {
  const server = getServer();
  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(
    await server.getAccount("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"),
    { fee: "100", networkPassphrase: NETWORK_PASSPHRASE }
  )
    .addOperation(contract.call("get_corridor_count"))
    .setTimeout(30)
    .build();

  const result = await server.simulateTransaction(tx);
  const retval = (result as any).result?.retval;
  return retval ? Number(fromScVal(retval)) : 0;
}

export async function get_corridor(
  contractId: string,
  id: number
): Promise<Corridor> {
  const server = getServer();
  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(
    await server.getAccount("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"),
    { fee: "100", networkPassphrase: NETWORK_PASSPHRASE }
  )
    .addOperation(contract.call("get_corridor", toScValU32(id)))
    .setTimeout(30)
    .build();

  const result = await server.simulateTransaction(tx);
  const retval = (result as any).result?.retval;
  return parseCorridor(fromScVal(retval));
}

export async function get_all_corridors(
  contractId: string
): Promise<Corridor[]> {
  const server = getServer();
  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(
    await server.getAccount("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"),
    { fee: "100", networkPassphrase: NETWORK_PASSPHRASE }
  )
    .addOperation(contract.call("get_all_corridors"))
    .setTimeout(30)
    .build();

  const result = await server.simulateTransaction(tx);
  const retval = (result as any).result?.retval;
  if (!retval) return [];
  const raw = fromScVal(retval);
  return (raw || []).map(parseCorridor);
}

export async function get_payment_count(contractId: string): Promise<number> {
  const server = getServer();
  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(
    await server.getAccount("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"),
    { fee: "100", networkPassphrase: NETWORK_PASSPHRASE }
  )
    .addOperation(contract.call("get_payment_count"))
    .setTimeout(30)
    .build();

  const result = await server.simulateTransaction(tx);
  const retval = (result as any).result?.retval;
  return retval ? Number(fromScVal(retval)) : 0;
}

export async function get_payment(
  contractId: string,
  id: number
): Promise<Payment> {
  const server = getServer();
  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(
    await server.getAccount("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"),
    { fee: "100", networkPassphrase: NETWORK_PASSPHRASE }
  )
    .addOperation(contract.call("get_payment", toScValU32(id)))
    .setTimeout(30)
    .build();

  const result = await server.simulateTransaction(tx);
  const retval = (result as any).result?.retval;
  return parsePayment(fromScVal(retval));
}

export async function get_payments_by_user(
  contractId: string,
  user: string
): Promise<Payment[]> {
  const server = getServer();
  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(
    await server.getAccount("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"),
    { fee: "100", networkPassphrase: NETWORK_PASSPHRASE }
  )
    .addOperation(contract.call("get_payments_by_user", toScValAddress(user)))
    .setTimeout(30)
    .build();

  const result = await server.simulateTransaction(tx);
  const retval = (result as any).result?.retval;
  if (!retval) return [];
  const raw = fromScVal(retval);
  return (raw || []).map(parsePayment);
}

// Build transactions (for wallet to sign)
export async function build_create_payment(
  contractId: string,
  source: string,
  sender: string,
  recipient: string,
  corridorId: number,
  amount: bigint | number,
  sourceCurrency: string,
  memo: string
): Promise<string> {
  const server = getServer();
  const account = await server.getAccount(source);
  const contract = new Contract(contractId);

  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "create_payment",
        toScValAddress(sender),
        toScValAddress(recipient),
        toScValU32(corridorId),
        toScValI128(amount),
        toScValString(sourceCurrency),
        toScValString(memo)
      )
    )
    .setTimeout(30)
    .build();

  const simulation = await server.simulateTransaction(tx);
  const minFee = (simulation as any).minResourceFee
    ? String(Number((simulation as any).minResourceFee) + 100)
    : "100";

  const prepared = rpc.assembleTransaction(tx, simulation as any);
  const finalTx = prepared.build();
  return finalTx.toXDR();
}
