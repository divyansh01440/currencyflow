import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CCJCXKDXJNWGNOVOL4PCNC7S5K43VC4GZWSGJAT6RHG6B365WIXFXENF",
  }
} as const

export type DataKey = {tag: "Admin", values: void} | {tag: "CorridorCount", values: void} | {tag: "Corridor", values: readonly [u32]} | {tag: "PaymentCount", values: void} | {tag: "Payment", values: readonly [u32]} | {tag: "UserPaymentCount", values: readonly [string]} | {tag: "UserPayment", values: readonly [string, u32]};


export interface Payment {
  amount: i128;
  corridor_id: u32;
  created_at: u64;
  id: u32;
  memo: string;
  recipient: string;
  sender: string;
  source_currency: string;
  status: u32;
  status_history: Array<StatusEntry>;
}


export interface Corridor {
  active: boolean;
  dest_currency: string;
  fee_bps: i64;
  name: string;
  source_currency: string;
}


export interface StatusEntry {
  status: u32;
  timestamp: u64;
}

export interface Client {
  /**
   * Construct and simulate a init transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  init: ({admin}: {admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_payment transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_payment: ({id}: {id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Payment>>

  /**
   * Construct and simulate a add_corridor transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  add_corridor: ({admin, name, source_currency, dest_currency, fee_bps}: {admin: string, name: string, source_currency: string, dest_currency: string, fee_bps: i64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_corridor transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_corridor: ({id}: {id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Corridor>>

  /**
   * Construct and simulate a create_payment transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_payment: ({sender, recipient, corridor_id, amount, source_currency, memo}: {sender: string, recipient: string, corridor_id: u32, amount: i128, source_currency: string, memo: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_all_corridors transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_all_corridors: (options?: MethodOptions) => Promise<AssembledTransaction<Array<Corridor>>>

  /**
   * Construct and simulate a get_payment_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_payment_count: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_corridor_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_corridor_count: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_payments_by_user transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_payments_by_user: ({user}: {user: string}, options?: MethodOptions) => Promise<AssembledTransaction<Array<Payment>>>

  /**
   * Construct and simulate a update_payment_status transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  update_payment_status: ({admin, payment_id, new_status}: {admin: string, payment_id: u32, new_status: u32}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAAAAAAAAEaW5pdAAAAAEAAAAAAAAABWFkbWluAAAAAAAAEwAAAAA=",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABwAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAANQ29ycmlkb3JDb3VudAAAAAAAAAEAAAAAAAAACENvcnJpZG9yAAAAAQAAAAQAAAAAAAAAAAAAAAxQYXltZW50Q291bnQAAAABAAAAAAAAAAdQYXltZW50AAAAAAEAAAAEAAAAAQAAAAAAAAAQVXNlclBheW1lbnRDb3VudAAAAAEAAAATAAAAAQAAAAAAAAALVXNlclBheW1lbnQAAAAAAgAAABMAAAAE",
        "AAAAAQAAAAAAAAAAAAAAB1BheW1lbnQAAAAACgAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAtjb3JyaWRvcl9pZAAAAAAEAAAAAAAAAApjcmVhdGVkX2F0AAAAAAAGAAAAAAAAAAJpZAAAAAAABAAAAAAAAAAEbWVtbwAAABAAAAAAAAAACXJlY2lwaWVudAAAAAAAABMAAAAAAAAABnNlbmRlcgAAAAAAEwAAAAAAAAAPc291cmNlX2N1cnJlbmN5AAAAABAAAAAAAAAABnN0YXR1cwAAAAAABAAAAAAAAAAOc3RhdHVzX2hpc3RvcnkAAAAAA+oAAAfQAAAAC1N0YXR1c0VudHJ5AA==",
        "AAAAAQAAAAAAAAAAAAAACENvcnJpZG9yAAAABQAAAAAAAAAGYWN0aXZlAAAAAAABAAAAAAAAAA1kZXN0X2N1cnJlbmN5AAAAAAAAEAAAAAAAAAAHZmVlX2JwcwAAAAAHAAAAAAAAAARuYW1lAAAAEAAAAAAAAAAPc291cmNlX2N1cnJlbmN5AAAAABA=",
        "AAAAAQAAAAAAAAAAAAAAC1N0YXR1c0VudHJ5AAAAAAIAAAAAAAAABnN0YXR1cwAAAAAABAAAAAAAAAAJdGltZXN0YW1wAAAAAAAABg==",
        "AAAAAAAAAAAAAAALZ2V0X3BheW1lbnQAAAAAAQAAAAAAAAACaWQAAAAAAAQAAAABAAAH0AAAAAdQYXltZW50AA==",
        "AAAAAAAAAAAAAAAMYWRkX2NvcnJpZG9yAAAABQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAARuYW1lAAAAEAAAAAAAAAAPc291cmNlX2N1cnJlbmN5AAAAABAAAAAAAAAADWRlc3RfY3VycmVuY3kAAAAAAAAQAAAAAAAAAAdmZWVfYnBzAAAAAAcAAAAA",
        "AAAAAAAAAAAAAAAMZ2V0X2NvcnJpZG9yAAAAAQAAAAAAAAACaWQAAAAAAAQAAAABAAAH0AAAAAhDb3JyaWRvcg==",
        "AAAAAAAAAAAAAAAOY3JlYXRlX3BheW1lbnQAAAAAAAYAAAAAAAAABnNlbmRlcgAAAAAAEwAAAAAAAAAJcmVjaXBpZW50AAAAAAAAEwAAAAAAAAALY29ycmlkb3JfaWQAAAAABAAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAA9zb3VyY2VfY3VycmVuY3kAAAAAEAAAAAAAAAAEbWVtbwAAABAAAAAA",
        "AAAAAAAAAAAAAAARZ2V0X2FsbF9jb3JyaWRvcnMAAAAAAAAAAAAAAQAAA+oAAAfQAAAACENvcnJpZG9y",
        "AAAAAAAAAAAAAAARZ2V0X3BheW1lbnRfY291bnQAAAAAAAAAAAAAAQAAAAQ=",
        "AAAAAAAAAAAAAAASZ2V0X2NvcnJpZG9yX2NvdW50AAAAAAAAAAAAAQAAAAQ=",
        "AAAAAAAAAAAAAAAUZ2V0X3BheW1lbnRzX2J5X3VzZXIAAAABAAAAAAAAAAR1c2VyAAAAEwAAAAEAAAPqAAAH0AAAAAdQYXltZW50AA==",
        "AAAAAAAAAAAAAAAVdXBkYXRlX3BheW1lbnRfc3RhdHVzAAAAAAAAAwAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAApwYXltZW50X2lkAAAAAAAEAAAAAAAAAApuZXdfc3RhdHVzAAAAAAAEAAAAAA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    init: this.txFromJSON<null>,
        get_payment: this.txFromJSON<Payment>,
        add_corridor: this.txFromJSON<null>,
        get_corridor: this.txFromJSON<Corridor>,
        create_payment: this.txFromJSON<null>,
        get_all_corridors: this.txFromJSON<Array<Corridor>>,
        get_payment_count: this.txFromJSON<u32>,
        get_corridor_count: this.txFromJSON<u32>,
        get_payments_by_user: this.txFromJSON<Array<Payment>>,
        update_payment_status: this.txFromJSON<null>
  }
}