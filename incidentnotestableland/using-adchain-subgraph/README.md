# Use of Adchain subgraph

We are using Adchain subgraph to build a datasource from the websites for sentiment analysis, which are kept in the Adchain registry. A python crawler mine these websites and feed relevant information to the analytics and visualization tool.

AdChain subgraph manifest for The Graph

This is an example subgraph which demonstrates how to write
* A subgraph manifest
* A GraphQL schema
* A mapping script

This example uses the [AdChain](https://publisher.adchain.com/registry) that was recently deployed to mainnet. This registry keeps a list of websites that are deemed to not be committing ad fraud. Any AdChain token holder can submit an application to include a new website onto the list. Those applications can be challenged by other token holders. All of this data can be queried using The Graph.

The [Graph Node](https://github.com/graphprotocol/graph-node) contains instructions for running everything. Additionally see the [Getting Started Guide](https://github.com/graphprotocol/graph-node/blob/master/docs/getting-started.md) for a detailed walkthrough of how the pieces fit together.


Once you have built the subgraph and started a Graph Node you may open a GraphiQL browser at `127.0.0.1:8000` and get started with these example queries.
```
{
  challenges(first: 50, where: {outcome: "failed"}) {
    id
    challenger
    commitEndDate
    revealEndDate
    challenger
    outcome
    rewardPool   
    totalTokens
    application {
      id,
      whitelisted,
      deposit
    }
  }
}
```

```
{
  applications(first: 100,
    where: {
        deposit_gt: "10000000000",
        owner_in: ["0x7609e21921c7efcf73a588833bf7709889291781", "0x1a5cdcfba600e0c669795e0b65c344d5a37a4d5a"]
   }) {
    id
    whitelisted
    deposit
    owner
    challenges {
      id
      outcome
      rewardPool
    }
  }
}
```