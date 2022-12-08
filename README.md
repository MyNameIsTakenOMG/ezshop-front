# Welcome to EZshop (front-end part)!

## Introduction

This is the  front-end part of the project **EZshop**.  

**EZshop** is a personal project under development that mimics some functionalities of the website **OpenSea**, from which users can create their own **NFT**s  as well as trade them by using the native token **EZ** tokens (EZT).

![ezshop-demo](https://github.com/MyNameIsTakenOMG/project-gifs/blob/main/ezshop.gif)
The link of the app : [Demo](https://fancy-wind-5811.on.fleek.co/)

## Features

EZshop is a nft market place where users can explore and manage nfts. And of course, users are able to trade their own nfts with others by using the native erc20 token (**EZ Token**). Here is a list of what users can do on EZshop:

- `Purchase EZ tokens` :  EZshop is using EZ token as its native token. Users can purchase EZ tokens using ETH.
- `Add/Subtract allowance` : EZshop can transfer EZ tokens on behalf of users when they try to sell or buy nfts. Allowance is the amount of EZ tokens users approve EZshop to manage. And users can choose to add or subtract allowance based on their situations.
- `Create nfts` : EZshop makes it easy for user to create their own nfts, simplying upload their nft assets and adding descriptions, then they are good to go.
- `Sell nfts` :  users can put any of their nfts up for sale. Later, they can update the price of their nfts or choose to cancel the sale.
- `Buy nfts` : users can purchase the nfts they would like to, just make sure having enough amount of EZ tokens in their wallet and having proper amount of allowance set up.

## Issues and challenges

- Taking quiet some time to finish transactions. Right now, the smart contracts are deployed on the Ethereum goerli testnet, and the average time for mining a block is 12 seconds, which influence users too much for basically every operation they make on EZshop. **Possible Solution** : thinking about using L2 solutions of Ethereum, like Polygon, which processes transactions much more faster and costs much less gas fees.
-  Implementing shopping cart functionality.  Currently, the smart contract `EZMarketplace.sol` can only support purchasing nfts one by one, which is not convenient. **Possible solution** : first, rewrite `buyItem` function in the smart contract `EZMarketplace.sol` to make it able to accept an array of nfts that the user would like to buy. Also, at the front end, add `delete` button and a checkbox or `select` button to each item in the shopping cart so that users can have more flexibility to manage their shopping cart, meanwhile, thinking about using decentralized database(e.g. GUN DB) to store shopping cart data. 
- Implementing pagination for listing nfts. By the time I am writing, `offset-based` pagination is what the documentation of `theGraph` recommends, `cursor-based` pagination may not be possible or may need extra overheads, not to mention `relay-style cursor` pagination.
- Adding filters for exploring nfts. With filters, searching will be more efficient. **Possible solution** : back in the `subgraph` project, connect to the `EZMarketplace.sol` contract and call the `tokenURI` function to fetch metadata of the nft, and store the metadata in `theGraph` .
- Categorizing nfts for the users.  Place nfts in different groups makes it more easier for users to manage their nfts. **Possible solution** :  adding an extra property `collection` to each nft metadata when creating nfts, then in `subgraph` project, fetch metadata of nfts and store them in `theGraph` . 
- Some UI issues.  Such as in the `create nft` page, after confirming creating nft,  the whole form is not reset, so considering using a custom `form` instead of the one from `web3uikit` package and so on.


# Technologies

 - Next.js
 - Pinata
 - Fleek
 - Wagmi
 - Ethers.js
 - Tailwind css
 - Web3uikit
 - Apollo graphql client
 - TheGraph
 - Typescript

## Get Started

This is the part showing how to get a local copy up and running. Please follow the steps:

**Prerequisites**

Please make sure **Node.js** has been downloaded and installed globally. The download link:  [Node.js](https://nodejs.org/en/download/)

Also, since the project is using **yarn** instead of **npm**, so please make sure yarn installed globally.
Using the command to install yarn :
```
npm install --global yarn 
```
lastly, make sure having `ezshop-contracts` and `ezshop-thegraph` setup properly, and with `metamask` wallet installed in your browser.

**Start the development server**

Run the command: `yarn dev` to test the site on `localhost:3000`


**Environment variables**

In the `env.example` file, there are four variables that need to be setup first:
- `Alchemy rpc url` : please go to [Alchemy](https://www.alchemy.com/) to grap your `rpc url` .
-  `TheGraph endpoint` : please go to [Subgraph Studio](https://thegraph.com/studio/) to grap your `subgraph endpoint` .
-  `pinata api key` & `pinata api secret` : please go to [pinata](https://www.pinata.cloud/) to grap your `api key` and `api secret` .



