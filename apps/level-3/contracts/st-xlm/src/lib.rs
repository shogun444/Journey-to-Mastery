#![no_std]
use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, Address, Env, String,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum TokenError {
    InsufficientBalance = 1,
    InsufficientAllowance = 2,
    Unauthorized = 3,
    InvalidAmount = 4,
}

#[contracttype]
#[derive(Clone)]
pub struct AllowanceValue {
    pub amount: i128,
    pub expiration_ledger: u32,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Name,
    Symbol,
    Decimals,
    Balance(Address),
    Supply,
    Allowance(Address, Address),
    Minter,
}

#[contractevent(topics = ["transfer"])]
pub struct TransferEvent {
    pub from: Address,
    pub to: Address,
    pub amount: i128,
}

#[contractevent(topics = ["approval"])]
pub struct ApprovalEvent {
    pub owner: Address,
    pub spender: Address,
    pub amount: i128,
}

#[contractevent(topics = ["mint"])]
pub struct MintEvent {
    pub to: Address,
    pub amount: i128,
}

#[contractevent(topics = ["burn"])]
pub struct BurnEvent {
    pub from: Address,
    pub amount: i128,
}

#[contract]
pub struct StXlmToken;

#[contractimpl]
impl StXlmToken {
    pub fn __constructor(env: Env, admin: Address, name: String, symbol: String, decimals: u32) {
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Minter, &admin);
        env.storage().instance().set(&DataKey::Name, &name);
        env.storage().instance().set(&DataKey::Symbol, &symbol);
        env.storage().instance().set(&DataKey::Decimals, &decimals);
        env.storage().instance().set(&DataKey::Supply, &0i128);
    }

    pub fn name(env: Env) -> String {
        env.storage().instance().get(&DataKey::Name).unwrap()
    }

    pub fn symbol(env: Env) -> String {
        env.storage().instance().get(&DataKey::Symbol).unwrap()
    }

    pub fn decimals(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::Decimals).unwrap()
    }

    pub fn balance(env: Env, id: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Balance(id))
            .unwrap_or(0)
    }

    pub fn total_supply(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::Supply).unwrap_or(0)
    }

    pub fn allowance(env: Env, owner: Address, spender: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Allowance(owner.clone(), spender.clone()))
            .map(|v: AllowanceValue| {
                if v.expiration_ledger < env.ledger().sequence() {
                    0
                } else {
                    v.amount
                }
            })
            .unwrap_or(0)
    }

    pub fn inc_allow(env: Env, owner: Address, spender: Address, amount: i128) {
        owner.require_auth();
        if amount <= 0 {
            panic!("amount must be positive");
        }
        let current = Self::allowance(env.clone(), owner.clone(), spender.clone());
        let new_allowance = current.checked_add(amount).expect("allowance overflow");
        let expiration = env.ledger().sequence() + 200000;
        env.storage().persistent().set(
            &DataKey::Allowance(owner.clone(), spender.clone()),
            &AllowanceValue {
                amount: new_allowance,
                expiration_ledger: expiration,
            },
        );
        env.storage().persistent().extend_ttl(
            &DataKey::Allowance(owner.clone(), spender.clone()),
            17280,
            518400,
        );
    }

    pub fn dec_allow(env: Env, owner: Address, spender: Address, amount: i128) {
        owner.require_auth();
        if amount <= 0 {
            panic!("amount must be positive");
        }
        let current = Self::allowance(env.clone(), owner.clone(), spender.clone());
        let new_allowance = current.checked_sub(amount).expect("allowance underflow");
        let expiration = env.ledger().sequence() + 200000;
        env.storage().persistent().set(
            &DataKey::Allowance(owner.clone(), spender.clone()),
            &AllowanceValue {
                amount: new_allowance,
                expiration_ledger: expiration,
            },
        );
        env.storage().persistent().extend_ttl(
            &DataKey::Allowance(owner.clone(), spender.clone()),
            17280,
            518400,
        );
    }

    pub fn approve(
        env: Env,
        owner: Address,
        spender: Address,
        amount: i128,
        expiration_ledger: u32,
    ) {
        owner.require_auth();
        if amount < 0 {
            panic!("amount must be non-negative");
        }
        env.storage().persistent().set(
            &DataKey::Allowance(owner.clone(), spender.clone()),
            &AllowanceValue {
                amount,
                expiration_ledger,
            },
        );
        env.storage().persistent().extend_ttl(
            &DataKey::Allowance(owner.clone(), spender.clone()),
            17280,
            518400,
        );
        ApprovalEvent {
            owner,
            spender,
            amount,
        }
        .publish(&env);
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        if amount <= 0 {
            panic!("amount must be positive");
        }
        let from_balance = Self::balance(env.clone(), from.clone());
        if from_balance < amount {
            panic!("insufficient balance");
        }
        let to_balance = Self::balance(env.clone(), to.clone());
        env.storage()
            .persistent()
            .set(&DataKey::Balance(from.clone()), &(from_balance - amount));
        env.storage()
            .persistent()
            .set(&DataKey::Balance(to.clone()), &(to_balance + amount));
        Self::extend_balances(&env, &from, &to);
        TransferEvent { from, to, amount }.publish(&env);
    }

    pub fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) {
        spender.require_auth();
        if amount <= 0 {
            panic!("amount must be positive");
        }
        let allowance = Self::allowance(env.clone(), from.clone(), spender.clone());
        if allowance < amount {
            panic!("insufficient allowance");
        }
        let from_balance = Self::balance(env.clone(), from.clone());
        if from_balance < amount {
            panic!("insufficient balance");
        }
        let to_balance = Self::balance(env.clone(), to.clone());
        let new_allowance = allowance - amount;
        let expiration = env.ledger().sequence() + 200000;
        env.storage().persistent().set(
            &DataKey::Allowance(from.clone(), spender.clone()),
            &AllowanceValue {
                amount: new_allowance,
                expiration_ledger: expiration,
            },
        );
        env.storage()
            .persistent()
            .set(&DataKey::Balance(from.clone()), &(from_balance - amount));
        env.storage()
            .persistent()
            .set(&DataKey::Balance(to.clone()), &(to_balance + amount));
        Self::extend_balances(&env, &from, &to);
        TransferEvent { from, to, amount }.publish(&env);
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let minter: Address = env.storage().instance().get(&DataKey::Minter).unwrap();
        minter.require_auth();
        if amount <= 0 {
            panic!("amount must be positive");
        }
        let supply: i128 = env.storage().instance().get(&DataKey::Supply).unwrap();
        let new_supply = supply.checked_add(amount).expect("supply overflow");
        let balance = Self::balance(env.clone(), to.clone());
        env.storage().instance().set(&DataKey::Supply, &new_supply);
        env.storage()
            .persistent()
            .set(&DataKey::Balance(to.clone()), &(balance + amount));
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Balance(to.clone()), 17280, 518400);
        MintEvent {
            to: to.clone(),
            amount,
        }
        .publish(&env);
        TransferEvent {
            from: env.current_contract_address(),
            to,
            amount,
        }
        .publish(&env);
    }

    pub fn burn(env: Env, from: Address, amount: i128) {
        let minter: Address = env.storage().instance().get(&DataKey::Minter).unwrap();
        minter.require_auth();
        if amount <= 0 {
            panic!("amount must be positive");
        }
        let balance = Self::balance(env.clone(), from.clone());
        if balance < amount {
            panic!("insufficient balance");
        }
        let supply: i128 = env.storage().instance().get(&DataKey::Supply).unwrap();
        env.storage()
            .instance()
            .set(&DataKey::Supply, &(supply - amount));
        env.storage()
            .persistent()
            .set(&DataKey::Balance(from.clone()), &(balance - amount));
        BurnEvent {
            from: from.clone(),
            amount,
        }
        .publish(&env);
        TransferEvent {
            from,
            to: env.current_contract_address(),
            amount,
        }
        .publish(&env);
    }

    pub fn burn_from(env: Env, spender: Address, from: Address, amount: i128) {
        spender.require_auth();
        if amount <= 0 {
            panic!("amount must be positive");
        }
        let allowance = Self::allowance(env.clone(), from.clone(), spender.clone());
        if allowance < amount {
            panic!("insufficient allowance");
        }
        let balance = Self::balance(env.clone(), from.clone());
        if balance < amount {
            panic!("insufficient balance");
        }
        let minter: Address = env.storage().instance().get(&DataKey::Minter).unwrap();
        minter.require_auth();
        let supply: i128 = env.storage().instance().get(&DataKey::Supply).unwrap();
        let new_allowance = allowance - amount;
        let expiration = env.ledger().sequence() + 200000;
        env.storage().persistent().set(
            &DataKey::Allowance(from.clone(), spender.clone()),
            &AllowanceValue {
                amount: new_allowance,
                expiration_ledger: expiration,
            },
        );
        env.storage()
            .instance()
            .set(&DataKey::Supply, &(supply - amount));
        env.storage()
            .persistent()
            .set(&DataKey::Balance(from.clone()), &(balance - amount));
        BurnEvent {
            from: from.clone(),
            amount,
        }
        .publish(&env);
        TransferEvent {
            from,
            to: env.current_contract_address(),
            amount,
        }
        .publish(&env);
    }

    pub fn set_minter(env: Env, new_minter: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.storage().instance().set(&DataKey::Minter, &new_minter);
    }

    fn extend_balances(env: &Env, from: &Address, to: &Address) {
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Balance(from.clone()), 17280, 518400);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Balance(to.clone()), 17280, 518400);
    }
}

#[cfg(test)]
mod test;
