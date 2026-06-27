import {
  nativeToScVal,
  scValToNative,
  xdr,
  Address,
  Contract,
  rpc,
  TransactionBuilder,
  Networks,
} from "@stellar/stellar-sdk";

export const RPC_URL = "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE = Networks.TESTNET;

export const REMITFLOW_CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

// ScVal converters
export function toScValString(v: string) {
  return nativeToScVal(v, { type: "string" });
}

export function toScValU32(v: number) {
  return nativeToScVal(v, { type: "u32" });
}

export function toScValI128(v: bigint | number) {
  return nativeToScVal(v, { type: "i128" });
}

export function toScValAddress(v: string) {
  return new Address(v).toScVal();
}

export function toScValBool(v: boolean) {
  return nativeToScVal(v); // boolean auto-detected as scvBool
}

export function toScValU64(v: number | bigint) {
  return nativeToScVal(v, { type: "u64" });
}

export function toScValI64(v: number | bigint) {
  return nativeToScVal(v, { type: "i64" });
}

export function fromScVal(sv: xdr.ScVal): any {
  return scValToNative(sv);
}

// Server instance
let serverInstance: rpc.Server | null = null;
export function getServer(): rpc.Server {
  if (!serverInstance) {
    serverInstance = new rpc.Server(RPC_URL);
  }
  return serverInstance;
}

// Read-only contract call
export async function readContract(
  method: string,
  params: xdr.ScVal[],
  source?: string
): Promise<any> {
  const server = getServer();
  const contract = new Contract(REMITFLOW_CONTRACT_ID);
  const tx = new TransactionBuilder(
    await server.getAccount(source || "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"),
    { fee: "100", networkPassphrase: NETWORK_PASSPHRASE }
  )
    .addOperation(contract.call(method, ...params))
    .setTimeout(30)
    .build();

  const result = await server.simulateTransaction(tx);
  if ((result as any).error) {
    throw new Error((result as any).error);
  }
  const res = (result as any).result;
  if (res?.[0]?.retval) {
    return scValToNative(res[0].retval);
  }
  return null;
}

// State-changing contract call helper (returns XDR to sign)
export async function buildContractCall(
  method: string,
  params: xdr.ScVal[],
  source: string
): Promise<string> {
  const server = getServer();
  const account = await server.getAccount(source);
  const contract = new Contract(REMITFLOW_CONTRACT_ID);

  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...params))
    .setTimeout(30)
    .build();

  const simulation = await server.simulateTransaction(tx);
  const fee = (simulation as any).minResourceFee
    ? String(Number((simulation as any).minResourceFee) + 100)
    : "100";

  const prepared = rpc.assembleTransaction(tx, simulation as any);
  const finalTx = prepared.build();
  return finalTx.toXDR();
}

// Submit signed XDR
export async function submitTransaction(signedXdr: string): Promise<string> {
  const server = getServer();
  const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const result = await server.sendTransaction(tx);
  return result.hash;
}
