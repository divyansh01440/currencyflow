"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/hooks/useWallet";
import {
  getUserPayments,
  getCorridors,
  formatStatus,
  formatAmount,
  getStatusColor,
} from "@/hooks/contract";
import * as contract from "@/packages/contract/src/index";

export default function HistoryPage() {
  const { address, isConnected, connect, isConnecting } = useWallet();
  const [payments, setPayments] = useState<contract.Payment[]>([]);
  const [corridors, setCorridors] = useState<contract.Corridor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | number>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        getUserPayments(address),
        getCorridors(),
      ]);
      setPayments(p);
      setCorridors(c);
    } catch (err) {
      console.error("Load failed:", err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredPayments =
    filter === "all"
      ? payments
      : payments.filter((p) => p.status === filter);

  const statusCounts = payments.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Transaction History
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Connect your wallet to view your transaction history.
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Transaction History
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {payments.length} total transactions
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <svg
            className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            filter === "all"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All ({payments.length})
        </button>
        {[0, 1, 2, 3].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === status
                ? `${getStatusColor(status)} border`
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {formatStatus(status)} ({statusCounts[status] || 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
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
          <p className="text-sm text-gray-500">
            {filter === "all"
              ? "No transactions yet. Send your first payment!"
              : `No transactions with status "${formatStatus(filter as number)}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPayments
            .sort((a, b) => b.created_at - a.created_at)
            .map((payment) => (
              <div
                key={payment.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedId(
                      expandedId === payment.id ? null : payment.id
                    )
                  }
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
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
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {formatAmount(payment.amount)}{" "}
                        {payment.source_currency}
                      </p>
                      <p className="text-xs text-gray-400">
                        To: {payment.recipient.slice(0, 6)}...
                        {payment.recipient.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}
                    >
                      {formatStatus(payment.status)}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        expandedId === payment.id ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {expandedId === payment.id && (
                  <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-400">Payment ID</p>
                        <p className="text-gray-900 font-medium">
                          #{payment.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Sender</p>
                        <p className="text-gray-900 font-mono text-xs">
                          {payment.sender.slice(0, 8)}...
                          {payment.sender.slice(-6)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Recipient</p>
                        <p className="text-gray-900 font-mono text-xs">
                          {payment.recipient.slice(0, 8)}...
                          {payment.recipient.slice(-6)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Corridor ID</p>
                        <p className="text-gray-900 font-medium">
                          #{payment.corridor_id}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Created</p>
                        <p className="text-gray-900">
                          {new Date(
                            Number(payment.created_at) * 1000
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Amount</p>
                        <p className="text-gray-900 font-medium">
                          {formatAmount(payment.amount)}{" "}
                          {payment.source_currency}
                        </p>
                      </div>
                    </div>

                    {payment.memo && (
                      <div className="mt-2 text-sm">
                        <p className="text-xs text-gray-400">Memo</p>
                        <p className="text-gray-700">{payment.memo}</p>
                      </div>
                    )}

                    {/* Status Timeline */}
                    <div className="mt-4">
                      <p className="text-xs text-gray-400 mb-2">
                        Status Timeline
                      </p>
                      <div className="space-y-2">
                        {payment.status_history.map((entry, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-2.5 h-2.5 rounded-full ${
                                  i === payment.status_history.length - 1
                                    ? "bg-blue-500"
                                    : "bg-green-500"
                                }`}
                              />
                              {i < payment.status_history.length - 1 && (
                                <div className="w-0.5 h-4 bg-gray-200" />
                              )}
                            </div>
                            <div className="text-xs">
                              <span
                                className={`font-medium ${
                                  i === payment.status_history.length - 1
                                    ? "text-blue-700"
                                    : "text-green-700"
                                }`}
                              >
                                {formatStatus(entry.status)}
                              </span>
                              <span className="text-gray-400 ml-2">
                                {new Date(
                                  Number(entry.timestamp) * 1000
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
