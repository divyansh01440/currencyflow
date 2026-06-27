#![cfg(test)]

use super::*;
use soroban_sdk::{Env, String, Address};
use soroban_sdk::testutils::Address as _;

#[test]
fn test_initialize() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);

    client.init(&admin);

    let count = client.get_corridor_count();
    assert_eq!(count, 0);

    let pcount = client.get_payment_count();
    assert_eq!(pcount, 0);
}

#[test]
fn test_add_corridor() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.init(&admin);

    client.add_corridor(
        &admin,
        &String::from_str(&env, "US to Mexico"),
        &String::from_str(&env, "USD"),
        &String::from_str(&env, "MXN"),
        &200i64, // 2% fee in bps
    );

    assert_eq!(client.get_corridor_count(), 1);

    let corridor = client.get_corridor(&0u32);
    assert_eq!(corridor.name, String::from_str(&env, "US to Mexico"));
    assert_eq!(corridor.source_currency, String::from_str(&env, "USD"));
    assert_eq!(corridor.dest_currency, String::from_str(&env, "MXN"));
    assert_eq!(corridor.fee_bps, 200i64);
    assert_eq!(corridor.active, true);
}

#[test]
fn test_add_multiple_corridors() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.init(&admin);

    client.add_corridor(&admin, &String::from_str(&env, "US to Mexico"), &String::from_str(&env, "USD"), &String::from_str(&env, "MXN"), &200i64);
    client.add_corridor(&admin, &String::from_str(&env, "US to Philippines"), &String::from_str(&env, "USD"), &String::from_str(&env, "PHP"), &150i64);
    client.add_corridor(&admin, &String::from_str(&env, "EU to Nigeria"), &String::from_str(&env, "EUR"), &String::from_str(&env, "NGN"), &250i64);

    assert_eq!(client.get_corridor_count(), 3);

    let c2 = client.get_corridor(&1u32);
    assert_eq!(c2.name, String::from_str(&env, "US to Philippines"));
    assert_eq!(c2.fee_bps, 150i64);
}

#[test]
fn test_create_payment() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    client.init(&admin);
    client.add_corridor(&admin, &String::from_str(&env, "US to Mexico"), &String::from_str(&env, "USD"), &String::from_str(&env, "MXN"), &200i64);

    client.create_payment(
        &sender,
        &recipient,
        &0u32,
        &1_000_000i128,
        &String::from_str(&env, "USD"),
        &String::from_str(&env, "Send to family"),
    );

    assert_eq!(client.get_payment_count(), 1);

    let payment = client.get_payment(&0u32);
    assert_eq!(payment.sender, sender);
    assert_eq!(payment.recipient, recipient);
    assert_eq!(payment.corridor_id, 0u32);
    assert_eq!(payment.amount, 1_000_000i128);
    assert_eq!(payment.source_currency, String::from_str(&env, "USD"));
    assert_eq!(payment.memo, String::from_str(&env, "Send to family"));
    assert_eq!(payment.status, 0u32); // Created

    // Status sequence: verify amount in status history
    assert_eq!(payment.status_history.len(), 1);
    assert_eq!(payment.status_history.get(0).unwrap().status, 0u32);
}

#[test]
fn test_update_payment_status() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    client.init(&admin);
    client.add_corridor(&admin, &String::from_str(&env, "US to Mexico"), &String::from_str(&env, "USD"), &String::from_str(&env, "MXN"), &200i64);
    client.create_payment(&sender, &recipient, &0u32, &1_000_000i128, &String::from_str(&env, "USD"), &String::from_str(&env, "Rent"));

    // Move to SENT (1)
    client.update_payment_status(&admin, &0u32, &1u32);
    let payment = client.get_payment(&0u32);
    assert_eq!(payment.status, 1u32); // Sent
    assert_eq!(payment.status_history.len(), 2);

    // Move to COMPLETED (2)
    client.update_payment_status(&admin, &0u32, &2u32);
    let payment = client.get_payment(&0u32);
    assert_eq!(payment.status, 2u32); // Completed
    assert_eq!(payment.status_history.len(), 3);
}

#[test]
fn test_cancel_payment() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    client.init(&admin);
    client.add_corridor(&admin, &String::from_str(&env, "US to Mexico"), &String::from_str(&env, "USD"), &String::from_str(&env, "MXN"), &200i64);
    client.create_payment(&sender, &recipient, &0u32, &1_000_000i128, &String::from_str(&env, "USD"), &String::from_str(&env, "Gift"));

    client.update_payment_status(&admin, &0u32, &3u32); // Cancelled
    let payment = client.get_payment(&0u32);
    assert_eq!(payment.status, 3u32); // Cancelled
}

#[test]
fn test_get_user_payments() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    client.init(&admin);
    client.add_corridor(&admin, &String::from_str(&env, "US to Mexico"), &String::from_str(&env, "USD"), &String::from_str(&env, "MXN"), &200i64);

    client.create_payment(&sender, &recipient, &0u32, &100i128, &String::from_str(&env, "USD"), &String::from_str(&env, ""));
    client.create_payment(&sender, &recipient, &0u32, &200i128, &String::from_str(&env, "USD"), &String::from_str(&env, ""));
    client.create_payment(&recipient, &sender, &0u32, &300i128, &String::from_str(&env, "MXN"), &String::from_str(&env, ""));

    let user_payments = client.get_payments_by_user(&sender);
    assert_eq!(user_payments.len(), 3); // sender in 2, recipient in 1 = 3

    let user_payments2 = client.get_payments_by_user(&recipient);
    assert_eq!(user_payments2.len(), 3); // recipient in 2, sender in 1 = 3
}

#[test]
fn test_get_corridors() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.init(&admin);

    client.add_corridor(&admin, &String::from_str(&env, "US to Mexico"), &String::from_str(&env, "USD"), &String::from_str(&env, "MXN"), &200i64);
    client.add_corridor(&admin, &String::from_str(&env, "US to Philippines"), &String::from_str(&env, "USD"), &String::from_str(&env, "PHP"), &150i64);

    let corridors = client.get_all_corridors();
    assert_eq!(corridors.len(), 2);
    assert_eq!(corridors.get(0).unwrap().name, String::from_str(&env, "US to Mexico"));
    assert_eq!(corridors.get(1).unwrap().name, String::from_str(&env, "US to Philippines"));
}
