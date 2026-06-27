"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";

export default function FaucetPage() {
  const { address, isConnected, connect } = useWallet();
  const [amount, setAmount] = useState("100");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetTestTokens = async () => {
    if (!address) return;
    setSending(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `https://friendbot.stellar.org?addr=${address}`
      );
      const data = await response.json();
      if (data.hash) {
        setResult(`Funded! Transaction hash: ${data.hash}`);
      } else {
        setError("Failed to get test tokens. The account may already be funded.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to friendbot");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Testnet Faucet</h1>
        <p className="text-sm text-gray-500 mt-2">
          Get free XLM tokens on Stellar testnet to try RemitFlow.
        </p>
      </div>

      {!isConnected ? (
        <div className="text-center">
          <button
            onClick={connect}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-medium rounded-lg hover:from-blue-700 hover:to-teal-600 transition-all"
          >
            Connect Wallet First
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Address
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-mono text-gray-600 break-all">
              {address}
            </div>
          </div>

          <button
            onClick={handleGetTestTokens}
            disabled={sending}
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium rounded-lg hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {sending ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Requesting...
              </span>
            ) : (
              "Get 10,000 Test XLM"
            )}
          </button>

          {result && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">{result}</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> This works on Stellar testnet only. The
              friendbot faucet automatically funds your account with 10,000 test
              XLM. These have no real value.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
