"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/hooks/useWallet";
import {
  getCorridors,
  getUserPayments,
  formatStatus,
  formatAmount,
  getStatusColor,
  PAYMENT_STATUS,
} from "@/hooks/contract";
import type { Corridor, Payment } from "@/packages/contract/src/index";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const { address, isConnected, connect, isConnecting } = useWallet();
  const [corridors, setCorridors] = useState<Corridor[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const [c, p] = await Promise.all([
        getCorridors(),
        getUserPayments(address),
      ]);
      setCorridors(c);
      setPayments(p);
    } catch (err) {
      console.error("Load failed:", err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activePayments = payments.filter(
    (p) => p.status === PAYMENT_STATUS.CREATED || p.status === PAYMENT_STATUS.SENT
  );
  const completedPayments = payments.filter(
    (p) => p.status === PAYMENT_STATUS.COMPLETED
  );

  const totalSent = payments
    .filter((p) => p.sender === address)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Connect Freighter to view your dashboard and transaction history.
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatAmount(totalSent)} USDC
              </p>
            </div>
            <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {payments.length}
              </p>
            </div>
            <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Active</p>
              <p className="text-2xl font-bold text-yellow-600">
                {activePayments.length}
              </p>
            </div>
            <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {completedPayments.length}
              </p>
            </div>
          </div>

          {/* Corridors */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Available Corridors
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {corridors.map((c, i) => (
                <div
                  key={i}
                  className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
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
                      <span className="text-sm font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                        {c.dest_currency}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {(c.fee_bps / 100).toFixed(2)}% fee
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{c.name}</p>
                </div>
              ))}
              {corridors.length === 0 && (
                <p className="text-sm text-gray-400 col-span-full text-center py-8">
                  No corridors loaded yet
                </p>
              )}
            </div>
          </div>

          {/* All Transactions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Transaction History
            </h2>
            {payments.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
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
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-50">
                  {payments
                    .sort((a, b) => b.created_at - a.created_at)
                    .map((payment) => (
                      <div
                        key={payment.id}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-blue-500"
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
                                {formatAmount(payment.amount)}{" "}
                                {payment.source_currency}
                              </p>
                              <p className="text-xs text-gray-400">
                                To: {payment.recipient.slice(0, 6)}...
                                {payment.recipient.slice(-4)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}
                            >
                              {formatStatus(payment.status)}
                            </span>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(
                                Number(payment.created_at) * 1000
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {payment.memo && (
                          <p className="mt-1 ml-12 text-xs text-gray-400">
                            {payment.memo}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
