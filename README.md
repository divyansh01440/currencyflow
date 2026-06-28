# 🌊 currencyflow — Cross-Border Micro-Remittance on Stellar

> **Stellar Community Fund Grant Proposal**
> Solving the $800B+ global remittance market with blockchain technology

---

## Environment Variables

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=CCJCXKDXJNWGNOVOL4PCNC7S5K43VC4GZWSGJAT6RHG6B365WIXFXENF
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

> ⚠️ These are testnet credentials. Never use testnet keys in production.

---

## The Problem

**800 million people** depend on remittances. Migrant workers in the US, UAE, UK, and Canada
send money home to India, Philippines, Nigeria, and Mexico — but:

- Legacy providers (Western Union, banks) charge **7–10% fees**
- Transfers take **3–5 business days**
- Hundreds of millions remain **unbanked** with no access to formal finance
- $56 billion in fees are extracted from migrants annually

---

## The Solution: RemitFlow

RemitFlow is a **non-custodial cross-border payment platform** built on Stellar that:

- ✅ Settles in **3–5 seconds** (Stellar's consensus)
- ✅ Charges **~$0.001** per transaction (Stellar base fee)
- ✅ Supports **180+ countries** via Stellar Anchors
- ✅ Generates **4–5% APY** on idle funds via Stellar AMM
- ✅ Works without a bank account (wallet-native)
- ✅ Fully **non-custodial** (SEP-10, SEP-24, SEP-31)

---

## Technical Architecture

### Frontend
- **Next.js 14** with App Router + Server Components
- **Tailwind CSS** with dark Web3 design system
- **Freighter + WalletConnect** for Stellar wallet integration
- **Framer Motion** for micro-animations
- **Recharts** for financial dashboards

### Backend
- **Node.js + Express** REST API
- **PostgreSQL** with comprehensive schema
- **Redis** for rate caching and sessions
- **JWT** auth with SEP-10 wallet authentication

### Stellar Integration
- **Path Payment Strict Send** — optimal DEX routing
- **USDC on Stellar** (Circle) — stable value transfer
- **Stellar AMM** — USDC/XLM liquidity pools for yield
- **SEP-10** — Non-custodial wallet authentication
- **SEP-24** — Interactive fiat on/off ramp (Anchors)
- **SEP-31** — Direct payment API for businesses
- **MoneyGram** + **Flutterwave** Anchor integration

### Smart Contract Logic (Stellar-native)
- Path payment operations with slippage protection
- Trustline management for multi-asset support
- Liquidity pool deposit/withdrawal operations
- Stellar Turrets for conditional transaction logic

---

## Stellar SEP Standards Used

| SEP | Purpose |
|-----|---------|
| SEP-10 | Web authentication (non-custodial login) |
| SEP-24 | Interactive fiat deposit/withdrawal |
| SEP-31 | Cross-border payment API |
| SEP-38 | Anchor quote API |

---

## Market Opportunity

| Corridor | Senders | Annual Volume | Current Fee |
|----------|---------|---------------|-------------|
| US → India    | 4.5M  | $28B | 5–7% |
| UAE → India   | 3.5M  | $18B | 3–5% |
| UK → Nigeria  | 1.2M  | $6B  | 8–12% |
| US → Mexico   | 11M   | $60B | 3–5% |
| GCC → Phil.   | 2.5M  | $12B | 4–6% |

**Total addressable market: ~$800B annually**

---

## Revenue Model

1. **0.5% convenience fee** on fiat-to-fiat conversions (vs 7–10% banks)
2. **AMM fee revenue share** from liquidity pool positions
3. **B2B API** — white-label for neobanks and HR platforms (payroll)
4. **Premium features** — bulk payments, scheduled transfers, analytics

---

## Competitive Advantage

| Feature | RemitFlow | Western Union | Wise | Ripple |
|---------|-----------|--------------|------|--------|
| Settlement Time | 3–5s | 3–5 days | 1–2 days | ~30min |
| Fee | $0.001 | $5–25 | 0.5–2% | Unknown |
| Non-custodial | ✅ | ❌ | ❌ | ❌ |
| Yield on idle | ✅ | ❌ | ❌ | ❌ |
| Open source | ✅ | ❌ | ❌ | ❌ |

---

## Grant Request & Use of Funds

**Requested: $200,000 USD (in XLM)**

| Allocation | Amount | Purpose |
|-----------|--------|---------|
| Engineering | $80K | 2 full-time engineers × 6 months |
| Anchor Integrations | $40K | MoneyGram, Flutterwave, AnchorUSD |
| Security Audit | $30K | Smart contract + API security review |
| KYC/AML Compliance | $20K | Jumio integration, legal counsel |
| Marketing & Growth | $20K | Community, partnerships, onboarding |
| Infrastructure | $10K | Cloud, monitoring, redundancy |

---

## Roadmap

**Q3 2025 — MVP**
- [x] Stellar wallet connect (Freighter)
- [x] USDC path payments (testnet)
- [x] Dashboard + transaction history
- [x] Yield farming UI

**Q4 2025 — Beta**
- [ ] MoneyGram off-ramp (India, Philippines)
- [ ] SEP-24 interactive anchor flows
- [ ] KYC integration (Jumio)
- [ ] Mobile-optimized PWA

**Q1 2026 — Launch**
- [ ] 3 live corridors (US→IN, UAE→PH, UK→NG)
- [ ] 1,000 active users
- [ ] SEP-31 B2B API
- [ ] $1M monthly volume

**Q2 2026 — Scale**
- [ ] 10 corridors
- [ ] 10,000 users
- [ ] $10M monthly volume
- [ ] Series A fundraise

---

## Team

- **CEO/Product** — 8 years fintech (ex-Wise, Remitly)
- **CTO** — Stellar developer since 2019 (SEP-10/24 contributor)
- **Blockchain Eng** — Smart contracts + Stellar AMM expert
- **Design** — Led design at 2 Y Combinator fintech startups

---

## Why Stellar?

1. **Purpose-built for payments** — Not an afterthought like EVM chains
2. **Anchors ecosystem** — Real fiat on/off ramps already exist
3. **USDC native** — Circle's official Stellar USDC is battle-tested
4. **Cost** — $0.00001 base fee makes micro-remittances viable
5. **Compliance-friendly** — Memo fields, multi-sig, regulatory tooling

---

## Links

- GitHub: [github.com/remitflow/remitflow](https://github.com/remitflow/remitflow)
- Demo: [demo.remitflow.io](https://demo.remitflow.io)
- Testnet: [testnet.remitflow.io](https://testnet.remitflow.io)
- Docs: [docs.remitflow.io](https://docs.remitflow.io)

---

*Built with ❤️ for the 800 million people who deserve better than Western Union.*
