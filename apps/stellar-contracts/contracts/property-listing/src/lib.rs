#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, vec, Address, Env, Symbol, Vec, String,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum PropertyStatus {
    Available,
    Booked,
    Maintenance,
    Inactive,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PropertyListing {
    pub id: String,
    pub data_hash: String,
    pub owner: Address,
    pub status: PropertyStatus,
}

const LISTINGS: Symbol = symbol_short!("LISTINGS");
/// Key for the Vec<String> that tracks all listing IDs
const LISTING_IDS: Symbol = symbol_short!("LIST_IDS");

#[contract]
pub struct PropertyListingContract;

#[contractimpl]
impl PropertyListingContract {
    /// Create a new property listing
    pub fn create_listing(
        env: Env,
        id: String,
        data_hash: String,
        owner: Address,
    ) -> PropertyListing {
        owner.require_auth();

        let key = (LISTINGS.clone(), id.clone());

        if env.storage().persistent().has(&key) {
            panic!("Property listing already exists");
        }

        let listing = PropertyListing {
            id: id.clone(),
            data_hash,
            owner,
            status: PropertyStatus::Available,
        };

        env.storage().persistent().set(&key, &listing);

        // Append id to the global index
        let mut ids: Vec<String> = env
            .storage()
            .persistent()
            .get(&LISTING_IDS)
            .unwrap_or_else(|| vec![&env]);
        ids.push_back(id);
        env.storage().persistent().set(&LISTING_IDS, &ids);

        listing
    }

    /// Update an existing property listing
    pub fn update_listing(
        env: Env,
        id: String,
        data_hash: String,
        owner: Address,
    ) -> PropertyListing {
        owner.require_auth();

        let key = (LISTINGS.clone(), id.clone());

        let mut listing: PropertyListing = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or_else(|| panic!("Property listing not found"));

        if listing.owner != owner {
            panic!("Only the owner can update the listing");
        }

        listing.data_hash = data_hash;
        env.storage().persistent().set(&key, &listing);

        listing
    }

    /// Update property status
    pub fn update_status(
        env: Env,
        id: String,
        owner: Address,
        status: PropertyStatus,
    ) -> PropertyListing {
        owner.require_auth();

        let key = (LISTINGS.clone(), id.clone());

        let mut listing: PropertyListing = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or_else(|| panic!("Property listing not found"));

        if listing.owner != owner {
            panic!("Only the owner can update the status");
        }

        listing.status = status;
        env.storage().persistent().set(&key, &listing);

        listing
    }

    /// Get a property listing by ID
    pub fn get_listing(env: Env, id: String) -> Option<PropertyListing> {
        let key = (LISTINGS.clone(), id);
        env.storage().persistent().get(&key)
    }

    /// Get all listings via the stored ID index
    /// Returns up to `limit` listings starting at `offset` for pagination.
    /// Pass offset=0 and limit=50 to get the first page.
    pub fn get_all_listings(env: Env, offset: u32, limit: u32) -> Vec<PropertyListing> {
        let ids: Vec<String> = env
            .storage()
            .persistent()
            .get(&LISTING_IDS)
            .unwrap_or_else(|| vec![&env]);

        let total = ids.len();
        let start = offset.min(total);
        let end = (offset + limit).min(total);

        let mut result: Vec<PropertyListing> = vec![&env];
        let mut i = start;
        while i < end {
            let id = ids.get(i).unwrap();
            let key = (LISTINGS.clone(), id);
            if let Some(listing) = env.storage().persistent().get(&key) {
                result.push_back(listing);
            }
            i += 1;
        }
        result
    }

    /// Get the total number of listings (useful for pagination)
    pub fn get_listings_count(env: Env) -> u32 {
        let ids: Vec<String> = env
            .storage()
            .persistent()
            .get(&LISTING_IDS)
            .unwrap_or_else(|| vec![&env]);
        ids.len()
    }
}

#[cfg(test)]
mod test;
