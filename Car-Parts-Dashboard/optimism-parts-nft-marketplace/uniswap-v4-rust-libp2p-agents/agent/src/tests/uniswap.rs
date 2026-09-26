use alloy::primitives::{address, Signed, Uint};

use crate::uniswap::{SwapClient, DYNAMIC_FEE_FLAG, HOOK, HOOK_V2, SWAP_ROUTER, TKNA, TKNB};

#[test]
fn contract_address_tkna() {
    assert_eq!(TKNA, address!("7546360e0011Bb0B52ce10E21eF0E9341453fE71"));
}

#[test]
fn contract_address_tknb() {
    assert_eq!(TKNB, address!("F6d91478e66CE8161e15Da103003F3BA6d2bab80"));
}

#[test]
fn contract_address_swap_router() {
    assert_eq!(
        SWAP_ROUTER,
        address!("f13D190e9117920c703d79B5F33732e10049b115")
    );
}

#[test]
fn contract_address_hook() {
    assert_eq!(HOOK, address!("5D4505AA950a73379B8E9f1116976783Ba8340C0"));
}

#[test]
fn swap_client_new_does_not_panic() {
    let _client = SwapClient::new("http://localhost:8545".into(), "0xdead".into());
}

#[test]
fn pool_key_fee() {
    let key = SwapClient::pool_key();
    assert_eq!(key.fee, Uint::<24, 1>::from(3000u16));
}

#[test]
fn pool_key_tick_spacing() {
    let key = SwapClient::pool_key();
    assert_eq!(key.tickSpacing, Signed::<24, 1>::try_from(60).unwrap());
}

#[test]
fn pool_key_token_ordering() {
    let key = SwapClient::pool_key();
    assert!(
        key.currency0 < key.currency1,
        "currency0 must be < currency1"
    );
    assert_eq!(key.currency0, TKNA);
    assert_eq!(key.currency1, TKNB);
}

#[test]
fn pool_key_hook_address() {
    let key = SwapClient::pool_key();
    assert_eq!(key.hooks, HOOK);
}

// --- V2 pool key tests ---

#[test]
fn pool_key_v2_dynamic_fee() {
    let key = SwapClient::pool_key_v2();
    assert_eq!(key.fee, Uint::<24, 1>::from(DYNAMIC_FEE_FLAG));
}

#[test]
fn pool_key_v2_tick_spacing() {
    let key = SwapClient::pool_key_v2();
    assert_eq!(key.tickSpacing, Signed::<24, 1>::try_from(60).unwrap());
}

#[test]
fn pool_key_v2_hook_address() {
    let key = SwapClient::pool_key_v2();
    assert_eq!(key.hooks, HOOK_V2);
}

#[test]
fn pool_key_v2_same_tokens() {
    let v1 = SwapClient::pool_key();
    let v2 = SwapClient::pool_key_v2();
    assert_eq!(v1.currency0, v2.currency0);
    assert_eq!(v1.currency1, v2.currency1);
}

#[test]
fn hook_v2_address() {
    assert_eq!(
        HOOK_V2,
        address!("A8760B755c67c5C75A8A60ED7E3713eA2448D0C0")
    );
}
