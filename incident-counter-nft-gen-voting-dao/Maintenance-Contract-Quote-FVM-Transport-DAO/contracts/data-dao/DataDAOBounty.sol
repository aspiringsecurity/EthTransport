// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./DataDAO.sol";
import "../openzeppelin/contracts/token/ERC721/IERC721.sol";


// PUSH Comm Contract Interface
interface IPUSHCommInterface {
    function sendNotification(address _channel, address _recipient, bytes calldata _identity) external;
}

contract DataDAOBounty is DataDAO {

    // EPNS COMM ADDRESS ON ETHEREUM Gorelli, CHECK THIS: https://docs.epns.io/developers/developer-tooling/epns-smart-contracts/epns-contract-addresses
    address public EPNS_COMM_ADDRESS = 0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa;

    IERC721 public membershipNFT;

    mapping(bytes => mapping(address => uint256)) public fundings;
    mapping(bytes => uint256) public dealStorageFees;
    mapping(bytes => uint64) public dealClient;

    struct Bid {
        address provider;
        uint256 price;
    }

    mapping (bytes => Bid[]) public bids;

    function bid(bytes memory _cidraw, address _provider, uint256 _price) internal {
        bids[_cidraw].push(Bid({
            provider: _provider,
            price: _price
        }));
    }

    constructor(address[] memory admins, address _membershipNFT) DataDAO(admins) {
        membershipNFT = IERC721(_membershipNFT);
    }

    /// @dev Function to allow members with membership NFT to join the DAO
    function joinDAO() public {
        require(membershipNFT.balanceOf(msg.sender) > 0, "You are not the holder of DataDAO NFT");
        addUser(msg.sender, MEMBER_ROLE);
    }

    /// @dev Creates a new deal proposal. 
    /// @param _cidraw: cid for which the deal proposal is to be created.
    /// @param _size: size of cid
    /// @param _dealDurationInDays: deal duration in Days
    function createDataSetDealProposal(bytes memory _cidraw, uint _size, uint256 _dealDurationInDays, uint256 _dealStorageFees) public payable {
        
        createDealProposal(_cidraw, _size, _dealDurationInDays);
        dealStorageFees[_cidraw] = _dealStorageFees;
    }

    /// @dev Approves or Rejects the proposal - This would enable to govern the data that is stored by the DAO
    /// @param _cidraw: Id of the cred.
    /// @param _choice: decision of the DAO on the proposal
    function approveOrRejectDataSet(bytes memory _cidraw, DealState _choice) public {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not a admin");
        approveOrRejectDealProposal(_cidraw, _choice);
    }

    /// @dev Activates the deal
    /// @param _networkDealID: Deal ID generated after the deal is created on Filecoin Network 
    function activateDataSetDealBySP(uint64 _networkDealID) public {
        uint64 client = activateDeal(_networkDealID);
        MarketTypes.GetDealDataCommitmentReturn memory commitmentRet = MarketAPI.getDealDataCommitment(MarketTypes.GetDealDataCommitmentParams({id: _networkDealID}));
        dealClient[commitmentRet.data] = client;
    }

    /// @dev Once the deal is expired the SP can withdraw the rewards
    /// @param _cidraw: Id of the cred.
    function withdrawReward(bytes memory _cidraw) public {
        require(getDealState(_cidraw) == DealState.Expired);
        reward(dealClient[_cidraw], dealStorageFees[_cidraw]);
    }

    // @dev Function to fund the deal
    // @param _cidraw: Id of the cred.(msg.sender)
    function fundDeal(bytes memory _cidraw) public payable {
        fundings[_cidraw][msg.sender] += msg.value;
    }

    // @dev Function to withdraw the funds
    // @param _cidraw: Id of the cred.
    function withdrawFunds(bytes memory _cidraw) public {
        uint256 amount = fundings[_cidraw][msg.sender];
        fundings[_cidraw][msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    // @dev Function to let the providers bid for the deal
    // @param _cidraw: Id of the cred.
    // @param _provider: address of the provider
    // @param _price: price of the deal
    function bidForDeal(bytes memory _cidraw, address _provider, uint256 _price) public {
        require(getDealState(_cidraw) == DealState.Proposed);
        require(fundings[_cidraw][_provider] >= _price);
        fundings[_cidraw][_provider] -= _price;
        bid(_cidraw, _provider, _price);

        //"0+3+Hooray! ", msg.sender, " sent ", token amount, " PUSH to you!"
        IPUSHCommInterface(EPNS_COMM_ADDRESS).sendNotification(
            0x69B97e0dC6b0A47656E75e55cD997579C9752C30, // from channel - recommended to set channel via dApp and put it's value -> then once contract is deployed, go back and add the contract address as delegate for your channel
            msg.sender, // client address. For Targetted put the address to which you want to send
            bytes(
                string(
                    // We are passing identity here: https://docs.epns.io/developers/developer-guides/sending-notifications/advanced/notification-payload-types/identity/payload-identity-implementations
                    abi.encodePacked(
                        "0", // this is notification identity: https://docs.epns.io/developers/developer-guides/sending-notifications/advanced/notification-payload-types/identity/payload-identity-implementations
                        "+", // segregator
                        "3", // this is payload type: https://docs.epns.io/developers/developer-guides/sending-notifications/advanced/notification-payload-types/payload (1, 3 or 4) = (Broadcast, targetted or subset)
                        "+", // segregator
                        "Bid Placed Alert", // this is notificaiton title
                        "+", // segregator
                        "Someone has placed a bid for your proposal!" // notification body
                    )
                )
            )
        );
    }


 



}

