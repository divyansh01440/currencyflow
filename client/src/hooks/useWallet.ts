"use client";

import { useState, useEffect, useCallback } from "react";
import {
  isConnected,
  isAllowed,
  requestAccess,
  getAddress,
  signTransaction,
} from "@stellar/freighter-api";

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  const checkConnection = useCallback(async () => {
    try {
      const connected = await isConnected();
      if (connected.isConnected) {
        const addr = await getAddress();
        setWallet({
          address: addr.address,
          isConnected: true,
          isConnecting: false,
          error: null,
        });
      }
    } catch (err: any) {
      console.error("Wallet check error:", err);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const connect = useCallback(async () => {
    setWallet((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const connected = await isConnected();
      if (!connected.isConnected) {
        setWallet((prev) => ({
          ...prev,
          isConnecting: false,
          error: "Freighter is not installed or unlocked. Please install Freighter wallet extension.",
        }));
        return;
      }

      const allowed = await isAllowed();
      if (!allowed.isAllowed) {
        await requestAccess();
      }

      const addr = await getAddress();
      setWallet({
        address: addr.address,
        isConnected: true,
        isConnecting: false,
        error: null,
      });
    } catch (err: any) {
      setWallet((prev) => ({
        ...prev,
        isConnecting: false,
        error: err.message || "Failed to connect wallet",
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  }, []);

  const signAndSendTx = useCallback(
    async (xdr: string): Promise<{ hash: string; signedXdr: string }> => {
      if (!wallet.address) throw new Error("Wallet not connected");

      const networkPassphrase =
        process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ||
        "Test SDF Network ; September 2015";

      const signed = await signTransaction(xdr, {
        networkPassphrase,
      });

      return {
        signedXdr: signed.signedTxXdr,
        hash: "", // Will be filled after submission
      };
    },
    [wallet.address]
  );

  return {
    ...wallet,
    connect,
    disconnect,
    signAndSendTx,
    checkConnection,
  };
}
