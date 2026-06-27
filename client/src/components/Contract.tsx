"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/hooks/useWallet";
import {
  getCorridors,
  getUserPayments,
  createPayment,
  formatStatus,
  formatAmount,
  getStatusColor,
  submitSignedTx,
} from "@/hooks/contract";
import * as contract from "@/packages/contract/src/index";

// ---------- Corridor Card ----------
function CorridorCard({
  corridor,
  onSelect,
  isSelected,
  feeAmount,
}: {
  corridor: contract.Corridor;
  onSelect: () => void;
  isSelected: boolean;
  feeAmount?: string;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
            <span className="text-sm font-bold text-blue-600">
              {corridor.source_currency}
            </span>
          </div>
          <svg
            className="w-5 h-5 text-gray-400"
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
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-100 to-green-100 flex items-center justify-center">
            <span className="text-sm font-bold text-teal-600">
              {corridor.dest_currency}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">{corridor.name}</p>
          <p className="text-xs text-gray-500">
            Fee: {(corridor.fee_bps / 100).toFixed(2)}%
          </p>
          {feeAmount && (
            <p className="text-xs font-medium text-blue-600">{feeAmount}</p>
          )}
        </div>
      </div>
    </button>
  );
}

// ---------- Payment Status Badge ----------
function StatusBadge({ status }: { status: number }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}
    >
      {formatStatus(status)}
    </span>
  );
}

// ---------- Payment Row ----------
function PaymentRow({ payment }: { payment: contract.Payment }) {
  return (
    <div className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {formatAmount(payment.amount)} {payment.source_currency}
            </p>
            <p className="text-xs text-gray-500">
              To: {payment.recipient.slice(0, 6)}...{payment.recipient.slice(-4)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <StatusBadge status={payment.status} />
          <p className="text-xs text-gray-400 mt-1">
            {new Date(Number(payment.created_at) * 1000).toLocaleDateString()}
          </p>
        </div>
      </div>
      {payment.memo && (
        <p className="mt-2 text-xs text-gray-500 ml-13">Memo: {payment.memo}</p>
      )}
    </div>
  );
}

// ---------- Main Contract UI Component ----------
export default function ContractUI() {
  const { address, isConnected, signAndSendTx } = useWallet();
  const [corridors, setCorridors] = useState<contract.Corridor[]>([]);
  const [payments, setPayments] = useState<contract.Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);

  // Send form state
  const [selectedCorridor, setSelectedCorridor] = useState<number | null>(null);
  const [recipientAddr, setRecipientAddr] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendMemo, setSendMemo] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [c, p] = await Promise.all([
        getCorridors(),
        address ? getUserPayments(address) : Promise.resolve([]),
      ]);
      setCorridors(c);
      setPayments(p);
    } catch (err) {
      console.error("Failed to load contract data:", err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSendPayment = async () => {
    if (!address || selectedCorridor === null || !recipientAddr || !sendAmount)
      return;

    setSending(true);
    setTxHash(null);

    try {
      const amountFloat = parseFloat(sendAmount);
      if (isNaN(amountFloat) || amountFloat <= 0) {
        throw new Error("Invalid amount");
      }
      const amountStroops = BigInt(Math.round(amountFloat * 10_000_000));

      const corridor = corridors[selectedCorridor];
      if (!corridor) throw new Error("Invalid corridor");

      const xdr = await createPayment(
        address,
        address,
        recipientAddr,
        selectedCorridor,
        amountStroops,
        corridor.source_currency,
        sendMemo
      );

      const { signedXdr } = await signAndSendTx(xdr);
      const hash = await submitSignedTx(signedXdr);
      setTxHash(hash);
      setShowSendModal(false);

      // Reset form
      setSelectedCorridor(null);
      setRecipientAddr("");
      setSendAmount("");
      setSendMemo("");

      // Reload data
      setTimeout(loadData, 3000);
    } catch (err: any) {
      console.error("Send failed:", err);
      alert(err.message || "Transaction failed");
    } finally {
      setSending(false);
    }
  };

  const totalSent = payments
    .filter((p) => p.sender === address)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Connect your Freighter wallet to send money across borders and view
          your transaction history on the Stellar network.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
          <p className="text-sm text-blue-600 font-medium">Active Corridors</p>
          <p className="text-2xl font-bold text-blue-900">{corridors.length}</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl">
          <p className="text-sm text-teal-600 font-medium">Your Transactions</p>
          <p className="text-2xl font-bold text-teal-900">{payments.length}</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
          <p className="text-sm text-purple-600 font-medium">Total Sent</p>
          <p className="text-2xl font-bold text-purple-900">
            {formatAmount(totalSent)} USDC
          </p>
        </div>
      </div>

      {/* Corridors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Available Corridors
          </h2>
          <button
            onClick={() => setShowSendModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-teal-600 transition-all shadow-sm"
          >
            Send Money
          </button>
        </div>

        {corridors.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No corridors available yet. The contract needs to be initialized.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {corridors.map((corridor, idx) => (
              <CorridorCard
                key={idx}
                corridor={corridor}
                isSelected={selectedCorridor === idx}
                onSelect={() => {
                  setSelectedCorridor(idx);
                  setShowSendModal(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Transactions
        </h2>
        {payments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <svg
              className="w-12 h-12 mx-auto text-gray-300 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-sm text-gray-500">No transactions yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Send your first payment to get started
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {payments
              .sort((a, b) => b.created_at - a.created_at)
              .slice(0, 5)
              .map((payment) => (
                <PaymentRow key={payment.id} payment={payment} />
              ))}
          </div>
        )}
      </div>

      {/* Send Payment Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Send Money</h3>
              <button
                onClick={() => setShowSendModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Corridor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Corridor
                </label>
                <select
                  value={selectedCorridor ?? ""}
                  onChange={(e) =>
                    setSelectedCorridor(Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a corridor</option>
                  {corridors.map((c, idx) => (
                    <option key={idx} value={idx}>
                      {c.name} ({c.source_currency} → {c.dest_currency})
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Stellar Address
                </label>
                <input
                  type="text"
                  value={recipientAddr}
                  onChange={(e) => setRecipientAddr(e.target.value)}
                  placeholder="G... or C..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-2 text-sm text-gray-500">
                    {selectedCorridor !== null
                      ? corridors[selectedCorridor]?.source_currency
                      : "USD"}
                  </span>
                </div>
              </div>

              {/* Memo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Memo (optional)
                </label>
                <input
                  type="text"
                  value={sendMemo}
                  onChange={(e) => setSendMemo(e.target.value)}
                  placeholder="What's this for?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Fee Display */}
              {selectedCorridor !== null && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fee</span>
                    <span className="text-gray-900 font-medium">
                      {(
                        corridors[selectedCorridor].fee_bps / 100
                      ).toFixed(2)}
                      %
                    </span>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSendPayment}
                disabled={sending}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-medium rounded-lg hover:from-blue-700 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
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
                  "Send Payment"
                )}
              </button>
            </div>

            {txHash && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700 font-medium">
                  ✓ Transaction submitted
                </p>
                <p className="text-xs text-green-600 break-all mt-1">
                  Hash: {txHash}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
