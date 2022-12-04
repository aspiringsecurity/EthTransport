# EthTransport
Monitoring tools for road incident management and reducing traffic congestion. Crowdsourcing information sharing for better and safer roads.

Goal: Effective design, engineering and delivery of Ethereum blockchain technology aided solution for vehicles and citizens to make roads safer and better for everyone using predictive analytics and automation. 

Solution: Technical solution for citizens, police officers and drivers to report and manage incidents, detect and prevent accidents on web and mobile.

Landing Website: https://sites.google.com/view/aspiring-road-safety/home

Details: We have developed a road incident management system using Javascript, HTML5, SAP's UI5 on the front end using open source video streaming system, Covalent API end points, evmos and ZKP, Scrypt tools for a decentralized system. We are starting an express server and storing data on the Filecoin Network for enabling sharing of government assets like toll prepaid card, car details information for interstate travel, driving license management and quarterly pollution check and control. Our solution is powered by Ethercalc (SocialCalc), Zora, Polygon NFT.Storage, Tableland, XMTP, Chainlink, Fluence, Litprotocol for security and live peer for online video streaming at the road incident spot for better coordination and immediate action.

How it works:

1. Camera Management: Add/edit/delete cameras for snapshots of road incident.

2. Object Detection using open source computer vision.

3. Video analytics configuration using IPFS.

4. Live streaming with Object Detection Video Analytics saving IPFS for screenshots.

5. Alarm storage using Ethereum. Save/delete alarm metadata and image to/from IPFS. Store the hash returned from IPFS to Ethereum test network. Provide links to alarms and blockchain transaction details.

6. Alarm Viewer: Add alarms with a single touch. Open the Alarm Settings menu from the home page. Add an alarm, set the wallpaper or choose an alarm tone. You can also delete an existing alarm.

----


Moralis: We are using the Medium Clone example to develop a dashboard and newsletter structure for recording the weekly minutes of the meeting. Please visit the module link: https://github.com/aspiringsecurity/EthTransport/tree/main/Medium-Meeting-Reports

Deployment URL: https://3gtivnurtulj.usemoralis.com:2053/server (to be deployed to moralis)

Learning and Contributing in the Blockchain Eco-systems:

1. Polygon: We are utilizing ZoraModuleManager, and ZoraProtocolFeeSettings in our our dapp and deploying it on Polygon after registering the Zora market module. Please visit: https://github.com/aspiringsecurity/EthTransport/tree/main/alarmviewer

Please find the video at https://drive.google.com/drive/folders/1lxeHbPzLoF0DzDZkh9N7Z_5aTKjmdEza (screencapturewithoutsound.mov file)


2. NFT.Storage for Filecoin:
We are using NFT.Storage  for storing a variety of offchain data like incident snapshots, alarm metadata and object types at the time of incident. Please find the video at https://drive.google.com/drive/folders/1lxeHbPzLoF0DzDZkh9N7Z_5aTKjmdEza (screencapturewithoutsound.mov file). We are storing Alarm metadata using NFT.Storage. Also, Saving/deleting alarm metadata and image to/from Filecoin, IPFS using NFT.Storage. We are also storing the hash returned from IPFS to Ethereum test network using  NFT.Storage.
 Further we are using NFT.Storage for: Video analytics configuration using NFT.Storage; Camera Management: Add/edit/delete cameras with integration with Livepeer, NFT.Storage; Live streaming with Object Detection Video Analytics using Livepeer for streaming, and NFT.Storage for snapshots.
 
 Github link: https://github.com/aspiringsecurity/EthTransport/tree/main/incidentandalarmstorage
 
 3. Tableland: We are using Tableland for implementing incident notes maintained by transport administrators. Please visit Incident Notes powered by Tableland at https://github.com/aspiringsecurity/EthTransport/tree/main/incidentnotestableland/incidentnotes
 
 4. XMTP: We are implementing XMTP Chat for Transport administrators in a particular region with CyberConnect functions. Please visit the implementation link: https://github.com/aspiringsecurity/EthTransport/tree/main/XMTPChat-with-cyberconnect
 
 Please also visit XMTP integrations with the platform:
 
 a. https://github.com/aspiringsecurity/EthTransport/tree/main/xmtp-loc-chat
 
 b. https://github.com/aspiringsecurity/EthTransport/tree/main/xmtp-messaging


5. Fluence: We are using Fluence to develop a counter for road incidents reported by citizens and complains resolved by police authorities in a specific region which could be shared across citizens and government authorities. Our impact solution for citizens create a positive societal behavior and can be used for availing tax benefits, citizen rewards and ecommerce gift cards by Ministry of Road and Transportation.

Please visit: https://github.com/aspiringsecurity/EthTransport/tree/main/incident-counter-fluence/fluence-incident-count

6. Chainlink: We are extending and adapting the Chainlink project "Link My Ride" to develop a decentralized first aid and ambulance platform by using Chainlink External Adapter to connect a Tesla Vehicle API to a Chainlink oracle for a peer-to-peer vehicle rental app. We wish to use it for Maruti Vehicle API and Hyundai Vehicle API too. Please visit: https://github.com/aspiringsecurity/EthTransport/tree/main/decentralized-ambulance

We are utilizing Chainlink VRF as follows:

E-Challan (Transport Receipt) Bill Generation: We are utilizing Chainlink Mix to work with Chainlink smart contracts. The bill script will deploy a smart contract to goerli and get a Random number via Chainlink VRF, which can used to identify a unique transaction/order number for the receipt or bill. Link: https://github.com/aspiringsecurity/EthTransport/tree/main/roadincidentmanagement/IPFS-Chainlink-Monitor-main

Parametric Insurance Solution in public transportation especially for project finance. We are utilizing an existing example at chainlink github repo to develop an insurance solution for public transportation. Link: https://github.com/aspiringsecurity/EthTransport/tree/main/roadincidentmanagement


7. Covalent API end Points: We are using Covalent to see all NFTs for NFC tags of vehicles across different networks. Further, we have the following Covalent end-points APIs:

Get Log Events by Contract Address: to get log events like sold/listed nft for NFC tags/NFC Tags of vehicles on marketplace. 

Get Log Events by Incident Types: to get log data for specific incident event along with its metadata

Get NFT External Metadata: To get metadata for NFT like attribute and snapshot images.

Get Historical Token Prices: To get price of token for currency that accept NFT/item on marketplace.
