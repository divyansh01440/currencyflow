#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec};

#[contracttype]
pub enum DataKey {
    Admin,
    CorridorCount,
    Corridor(u32),
    PaymentCount,
    Payment(u32),
    UserPaymentCount(Address),
    UserPayment(Address, u32),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Corridor {
    pub name: String,
    pub source_currency: String,
    pub dest_currency: String,
    pub fee_bps: i64,
    pub active: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct StatusEntry {
    pub status: u32,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Payment {
    pub id: u32,
    pub sender: Address,
    pub recipient: Address,
    pub corridor_id: u32,
    pub amount: i128,
    pub source_currency: String,
    pub memo: String,
    pub status: u32,
    pub status_history: Vec<StatusEntry>,
    pub created_at: u64,
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn init(env: Env, admin: Address) {
        assert!(!env.storage().instance().has(&DataKey::Admin), "already initialized");
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::CorridorCount, &0u32);
        env.storage().instance().set(&DataKey::PaymentCount, &0u32);
    }

    pub fn add_corridor(
        env: Env,
        admin: Address,
        name: String,
        source_currency: String,
        dest_currency: String,
        fee_bps: i64,
    ) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert_eq!(admin, stored_admin, "unauthorized");

        let mut count: u32 = env.storage().instance().get(&DataKey::CorridorCount).unwrap();
        let corridor = Corridor {
            name,
            source_currency,
            dest_currency,
            fee_bps,
            active: true,
        };
        env.storage().instance().set(&DataKey::Corridor(count), &corridor);
        count += 1;
        env.storage().instance().set(&DataKey::CorridorCount, &count);
    }

    pub fn get_corridor_count(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::CorridorCount).unwrap_or(0)
    }

    pub fn get_corridor(env: Env, id: u32) -> Corridor {
        env.storage().instance().get(&DataKey::Corridor(id)).expect("corridor not found")
    }

    pub fn get_all_corridors(env: Env) -> Vec<Corridor> {
        let count: u32 = env.storage().instance().get(&DataKey::CorridorCount).unwrap_or(0);
        let mut corridors: Vec<Corridor> = Vec::new(&env);
        for i in 0..count {
            if let Some(c) = env.storage().instance().get::<_, Corridor>(&DataKey::Corridor(i)) {
                corridors.push_back(c);
            }
        }
        corridors
    }

    pub fn create_payment(
        env: Env,
        sender: Address,
        recipient: Address,
        corridor_id: u32,
        amount: i128,
        source_currency: String,
        memo: String,
    ) {
        sender.require_auth();
        assert!(amount > 0, "amount must be positive");

        let corridor: Corridor = env.storage().instance().get(&DataKey::Corridor(corridor_id))
            .expect("corridor not found");
        assert!(corridor.active, "corridor not active");

        let ts = env.ledger().timestamp();
        let mut count: u32 = env.storage().instance().get(&DataKey::PaymentCount).unwrap();
        let payment_id = count;

        let entry = StatusEntry { status: 0, timestamp: ts };
        let mut history: Vec<StatusEntry> = Vec::new(&env);
        history.push_back(entry.clone());

        let payment = Payment {
            id: payment_id,
            sender: sender.clone(),
            recipient: recipient.clone(),
            corridor_id,
            amount,
            source_currency,
            memo,
            status: 0,
            status_history: history,
            created_at: ts,
        };

        env.storage().instance().set(&DataKey::Payment(payment_id), &payment);
        count += 1;
        env.storage().instance().set(&DataKey::PaymentCount, &count);

        // Track for sender
        let sender_count: u32 = env.storage().instance()
            .get(&DataKey::UserPaymentCount(sender.clone())).unwrap_or(0);
        env.storage().instance().set(&DataKey::UserPayment(sender.clone(), sender_count), &payment_id);
        env.storage().instance().set(&DataKey::UserPaymentCount(sender), &(sender_count + 1));

        // Track for recipient
        let recip_count: u32 = env.storage().instance()
            .get(&DataKey::UserPaymentCount(recipient.clone())).unwrap_or(0);
        env.storage().instance().set(&DataKey::UserPayment(recipient.clone(), recip_count), &payment_id);
        env.storage().instance().set(&DataKey::UserPaymentCount(recipient), &(recip_count + 1));
    }

    pub fn get_payment_count(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::PaymentCount).unwrap_or(0)
    }

    pub fn get_payment(env: Env, id: u32) -> Payment {
        env.storage().instance().get(&DataKey::Payment(id)).expect("payment not found")
    }

    pub fn get_payments_by_user(env: Env, user: Address) -> Vec<Payment> {
        let count: u32 = env.storage().instance()
            .get(&DataKey::UserPaymentCount(user.clone())).unwrap_or(0);
        let mut payments: Vec<Payment> = Vec::new(&env);
        for i in 0..count {
            let pid: u32 = env.storage().instance()
                .get(&DataKey::UserPayment(user.clone(), i)).unwrap();
            if let Some(p) = env.storage().instance().get::<_, Payment>(&DataKey::Payment(pid)) {
                payments.push_back(p);
            }
        }
        payments
    }

    pub fn update_payment_status(env: Env, admin: Address, payment_id: u32, new_status: u32) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert_eq!(admin, stored_admin, "unauthorized");
        assert!(new_status <= 3, "invalid status");

        let mut payment: Payment = env.storage().instance().get(&DataKey::Payment(payment_id))
            .expect("payment not found");
        assert!(new_status > payment.status, "status must advance");

        let ts = env.ledger().timestamp();
        let entry = StatusEntry { status: new_status, timestamp: ts };
        payment.status_history.push_back(entry);
        payment.status = new_status;
        env.storage().instance().set(&DataKey::Payment(payment_id), &payment);
    }
}

mod test;
