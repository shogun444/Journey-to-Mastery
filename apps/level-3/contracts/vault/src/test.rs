#![cfg(test)]
use super::*;
use soroban_sdk::{
    testutils::Address as _, token::StellarAssetClient as TokenAdminClient, Address, Env, String,
};

fn setup_env() -> (Env, Address, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let treasury = Address::generate(&env);

    // Deploy stXLM token
    let st_xlm = env.register(
        st_xlm_token::WASM,
        (
            admin.clone(),
            String::from_str(&env, "Staked XLM"),
            String::from_str(&env, "stXLM"),
            7u32,
        ),
    );
    let st_xlm_client = st_xlm_token::Client::new(&env, &st_xlm);

    // Deploy XLM token contract (classic asset contract)
    #[allow(deprecated)]
    let xlm_token = env.register_stellar_asset_contract(admin.clone());
    let xlm_admin = TokenAdminClient::new(&env, &xlm_token);

    // Deploy vault
    let vault = env.register(
        Vault,
        (admin.clone(), st_xlm.clone(), treasury.clone(), 0u32, 0u32),
    );

    // Set vault as minter on stXLM
    st_xlm_client.set_minter(&vault);

    // Fund user with XLM for deposits
    xlm_admin.mint(&user, &10_000_000i128);

    (env, vault, user, xlm_token)
}

#[test]
fn test_initial_state() {
    let (env, vault, _user, _xlm) = setup_env();
    let client = VaultClient::new(&env, &vault);
    assert_eq!(client.total_assets(), 0);
    assert_eq!(client.total_supply(), 0);
    assert_eq!(client.paused(), false);
    assert_eq!(client.deposit_fee_bps(), 0);
    assert_eq!(client.withdraw_fee_bps(), 0);
}

#[test]
fn test_deposit_with_zero_fee() {
    let (env, vault, user, _xlm) = setup_env();
    let client = VaultClient::new(&env, &vault);
    let shares = client.preview_deposit(&1000i128);
    assert_eq!(shares, 1000);
    let received = client.deposit(&user, &1000i128);
    assert_eq!(received, 1000);
    assert_eq!(client.total_supply(), 1000);
    assert_eq!(client.total_assets(), 1000);
    assert_eq!(client.get_user_balance(&user), 1000);
}

#[test]
fn test_preview_functions() {
    let (env, vault, _user, _xlm) = setup_env();
    let client = VaultClient::new(&env, &vault);
    assert_eq!(client.preview_deposit(&500i128), 500);
    assert_eq!(client.preview_withdraw(&500i128), 0);
    assert_eq!(client.convert_to_shares(&100i128), 100);
    assert_eq!(client.convert_to_assets(&100i128), 0);
}

#[test]
fn test_pause_and_unpause() {
    let (env, vault, _user, _xlm) = setup_env();
    let client = VaultClient::new(&env, &vault);
    assert_eq!(client.paused(), false);
    client.pause();
    assert_eq!(client.paused(), true);
    client.unpause();
    assert_eq!(client.paused(), false);
}

#[test]
fn test_set_fee() {
    let (env, vault, _user, _xlm) = setup_env();
    let client = VaultClient::new(&env, &vault);
    client.set_fee(&50u32, &50u32);
    assert_eq!(client.deposit_fee_bps(), 50);
    assert_eq!(client.withdraw_fee_bps(), 50);
}
