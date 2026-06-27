"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/hooks/useWallet";
import {
  getCorridors,
  createPayment,
  submitSignedTx,
} from "@/hooks/contract";
import * as contract from "@/packages/contract/src/index";

export default function SendPage() {
  const { address, isConnected, connect, isConnecting, signAndSendTx } =
    useWallet();

  const [corridors, setCorridors] = useState<contract.Corridor[]>([]);
  const [step, setStep] = useState<"corridor" | "details" | "confirm" | "done">(
    "corridor"
  );

  // Form state
  const [selectedCorridorId, setSelectedCorridorId] = useState<number | null>(
    null
  );
  const [recipientAddr, setRecipientAddr] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendMemo, setSendMemo] = useState("");

  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCorridors().then(setCorridors).catch(console.error);
  }, []);

  const selectedCorridor =
    selectedCorridorId !== null ? corridors[selectedCorridorId] : null;

  const handleSelectCorridor = (idx: number) => {
    setSelectedCorridorId(idx);
    setStep("details");
    setError(null);
  };

  const handleBack = () => {
    if (step === "details") {
      setStep("corridor");
      setSelectedCorridorId(null);
    } else if (step === "confirm") {
      setStep("details");
    }
    setError(null);
  };

  const handleNext = () => {
    if (!recipientAddr || !sendAmount) {
      setError("Please fill in all required fields");
      return;
    }
    if (parseFloat(sendAmount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    setStep("confirm");
    setError(null);
  };

  const handleSend = async () => {
    if (!address || selectedCorridor === null || !recipientAddr || !sendAmount)
      return;

    setSending(true);
    setError(null);

    try {
      const amountFloat = parseFloat(sendAmount);
      const amountStroops = BigInt(Math.round(amountFloat * 10_000_000));

      const xdr = await createPayment(
        address,
        address,
        recipientAddr,
        selectedCorridorId!,
        amountStroops,
        selectedCorridor.source_currency,
        sendMemo
      );

      const { signedXdr } = await signAndSendTx(xdr);
      const hash = await submitSignedTx(signedXdr);
      setTxHash(hash);
      setStep("done");

      // Reset after 5 seconds
      setTimeout(() => {
        setSelectedCorridorId(null);
        setRecipientAddr("");
        setSendAmount("");
        setSendMemo("");
        setTxHash(null);
        setStep("corridor");
      }, 5000);
    } catch (err: any) {
      setError(err.message || "Transaction failed");
    } finally {
      setSending(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Send Money
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Connect your Freighter wallet to start sending money internationally.
          </p>
          <button
            onClick={connect}
            disabled={isConnecting}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-medium rounded-lg hover:from-blue-700 hover:to-teal-600 disabled:opacity-50 transition-all"
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {["corridor", "details", "confirm"].map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s
                  ? "bg-blue-600 text-white"
                  : ["done", "confirm"].includes(step) &&
                      ["corridor", "details"].includes(s) ||
                    (step === "done" && s !== "confirm")
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {["done", "confirm"].includes(step) &&
              ["corridor", "details"].includes(s)
                ? "✓"
                : i + 1}
            </div>
            {i < 2 && (
              <div
                className={`w-12 h-0.5 ${
                  (step === "done" || step === "confirm") && s === "details"
                    ? "bg-green-500"
                    : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
        {step === "corridor" && "Choose a Corridor"}
        {step === "details" && "Payment Details"}
        {step === "confirm" && "Confirm Transfer"}
        {step === "done" && "Transfer Submitted!"}
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Step 1: Corridor Selection */}
      {step === "corridor" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 mb-4">
            Select where you're sending money from and to:
          </p>
          {corridors.map((c, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectCorridor(idx)}
              className="w-full p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {c.source_currency}
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                    <span className="text-sm font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">
                      {c.dest_currency}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 ml-2">{c.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    Fee: {(c.fee_bps / 100).toFixed(2)}%
                  </p>
                  <svg
                    className="w-5 h-5 text-gray-300 mt-1 ml-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </button>
          ))}
          {corridors.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">
              No corridors available. Deploy the contract first.
            </p>
          )}
        </div>
      )}

      {/* Step 2: Details */}
      {step === "details" && selectedCorridor && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            Sending via: {selectedCorridor.name} (
            {selectedCorridor.source_currency} →{" "}
            {selectedCorridor.dest_currency})
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Stellar Address
            </label>
            <input
              type="text"
              value={recipientAddr}
              onChange={(e) => setRecipientAddr(e.target.value)}
              placeholder="G... or C..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount ({selectedCorridor.source_currency})
            </label>
            <input
              type="number"
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Memo (optional)
            </label>
            <input
              type="text"
              value={sendMemo}
              onChange={(e) => setSendMemo(e.target.value)}
              placeholder="What's this for?"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleBack}
              className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-medium rounded-xl hover:from-blue-700 hover:to-teal-600 transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === "confirm" && selectedCorridor && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Corridor</span>
              <span className="font-medium text-gray-900">
                {selectedCorridor.name}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Recipient</span>
              <span className="font-medium text-gray-900 font-mono text-xs">
                {recipientAddr.slice(0, 8)}...{recipientAddr.slice(-6)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount</span>
              <span className="font-bold text-gray-900">
                {sendAmount} {selectedCorridor.source_currency}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Fee</span>
              <span className="text-gray-900">
                {(selectedCorridor.fee_bps / 100).toFixed(2)}%
              </span>
            </div>
            {sendMemo && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Memo</span>
                <span className="text-gray-900">{sendMemo}</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-3 flex justify-between text-sm">
              <span className="font-medium text-gray-700">
                Total (estimated)
              </span>
              <span className="font-bold text-gray-900">
                {sendAmount} {selectedCorridor.source_currency}
              </span>
            </div>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-800">
            <strong>⚠ Important:</strong> This transaction will be submitted to
            the Stellar testnet. Make sure the recipient address is correct.
            Transactions cannot be reversed.
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleBack}
              disabled={sending}
              className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-medium rounded-xl hover:from-blue-700 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
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
                  Processing...
                </span>
              ) : (
                "Confirm & Send"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Done */}
      {step === "done" && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Payment Submitted!
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Your transfer has been recorded on the Stellar network.
          </p>
          {txHash && (
            <div className="p-3 bg-gray-50 rounded-xl text-xs font-mono text-gray-600 break-all mb-6">
              TX: {txHash}
            </div>
          )}
          <p className="text-xs text-gray-400">
            Redirecting to start a new transfer...
          </p>
        </div>
      )}
    </div>
  );
}
