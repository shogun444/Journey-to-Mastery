#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

fn setup_env() -> (Env, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let name = String::from_str(&env, "Staked XLM");
    let symbol = String::from_str(&env, "stXLM");
    let contract_id = env.register(StXlmToken, (admin.clone(), name, symbol, 7u32));
    (env, contract_id, user)
}

#[test]
fn test_initial_state() {
    let (env, contract_id, _user) = setup_env();
    let client = StXlmTokenClient::new(&env, &contract_id);
    assert_eq!(client.name(), String::from_str(&env, "Staked XLM"));
    assert_eq!(client.symbol(), String::from_str(&env, "stXLM"));
    assert_eq!(client.decimals(), 7);
    assert_eq!(client.total_supply(), 0);
}

#[test]
fn test_mint_and_balance() {
    let (env, contract_id, user) = setup_env();
    let client = StXlmTokenClient::new(&env, &contract_id);
    client.mint(&user, &1000i128);
    assert_eq!(client.balance(&user), 1000);
    assert_eq!(client.total_supply(), 1000);
}

#[test]
fn test_transfer() {
    let (env, contract_id, user) = setup_env();
    let recipient = Address::generate(&env);
    let client = StXlmTokenClient::new(&env, &contract_id);
    client.mint(&user, &5000i128);
    client.transfer(&user, &recipient, &2000i128);
    assert_eq!(client.balance(&user), 3000);
    assert_eq!(client.balance(&recipient), 2000);
    assert_eq!(client.total_supply(), 5000);
}

#[test]
fn test_burn() {
    let (env, contract_id, user) = setup_env();
    let client = StXlmTokenClient::new(&env, &contract_id);
    client.mint(&user, &5000i128);
    client.burn(&user, &2000i128);
    assert_eq!(client.balance(&user), 3000);
    assert_eq!(client.total_supply(), 3000);
}

#[test]
fn test_approve_and_transfer_from() {
    let (env, contract_id, user) = setup_env();
    let spender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let client = StXlmTokenClient::new(&env, &contract_id);
    client.mint(&user, &10000i128);
    client.approve(&user, &spender, &3000i128, &200000u32);
    assert_eq!(client.allowance(&user, &spender), 3000);
    client.transfer_from(&spender, &user, &recipient, &3000i128);
    assert_eq!(client.balance(&user), 7000);
    assert_eq!(client.balance(&recipient), 3000);
}
