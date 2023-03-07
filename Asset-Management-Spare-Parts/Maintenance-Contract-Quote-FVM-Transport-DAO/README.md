**A FVM compatible Data DAO Quotation Portal for Maintenance and Transport Infrastructure Management**


### Clone the repo


### Install the node modules

```sh
npm install
```

### The Data DAO Quotation Portal

The folder structure of the is as below

    .
    ├── base                        # Base Contracts
    │   ├── DataDAOConstants.sol    # Constants
    │   └── DataDAOCore.sol         # Core functions integrated with filecoin.sol
    ├── interfaces                  # Interfaces
    │   ├── IDataDAO.sol            # Interface for Data DAO contract
    ├── DataDAO.sol                 # The Base Data DAO contract
    └── DataDAOBounty.sol          # DataDAOBounty Contract

## Core Idea

The DataDAO contract is build for a platform where storage providers could quote on proposals for storing maintenance and infrastructure data.

## Functionality and possible customization

The deal is tracked by the following deal states

    - Proposed
    - Passed  
    - Active        
    - Expired
    - Rejected (in the case of dispute)

> Add a user

This function assigns the role to the user that is being added to the DAO, the members have special rights like funding the deals and voting in the times of disputes.
  
> Create a new deal proposal

This function is used to create a new deal, they are created by the clients.


> Activate the deal

The function seeks verification from the contract on the storage provider's claim that the deal was created on Filecoin Network and the data is being stored. 

> Reward

This function can be found inside the DataDAOCore.sol file, and is responsible to send $FIL to the storage provider.

## Data DAO Contract Functionalities 
The users with the Data DAO membership NFT can join the Data DAO as a member and would be able to fund the deals.

Once the deal proposal is created by a member and $FIL are locked inside the contract, the admins would either approve or reject the proposal. If the deal proposal is rejected, the member gets back the locked $FIL else the deal is taken forward to storage provider. 

The storage provider would bid on the client proposals.

The storage provider would store the data generate the proof and provide the deal ID to the DataDAO. The DataDAO contract will check with the Filecoin storage market to confirm whether the supplied deal ID is activated and stores the claimed data. Once the deal is expired, the Data DAO will pay the storage provider.


