# cln-pay

A simple web application that connects to C-lightning over rpc via a lightweight [lightning-client](https://github.com/BHBNETWORK/lightning-client-js) and allows us to pay invoices and see our balance

# Requirements

- You will need to have your own instance of [C-lightning](https://github.com/ElementsProject/lightning) running
- You may need to the command line interface of C-lightning to connect to nodes in the lightning network and create channels with them
- You will also require `nodejs` and `npm` installed

# Installation

1. `git clone https://github.com/agnjkafgh/cln-pay.git` on the same machine where c-lightning is running
2. `cd cln-pay`
3. `npm install`
4. Edit the config file in and add your appropriate lightning path. (The directory where c-lightning is installed on your system) 
5. `npm start`

# Setting up your own C-Lightning node

Use an ubuntu server and allow nodes to connect to PORT 9735. You will either need to connect your lightning Node to a remote bitcoind instance or run your own bitcoin node.
If you are connecting to your own node setup bitcoind

## Installing bitcoind

```
sudo add-apt-repository ppa:bitcoin/bitcoin
sudo apt-get update
sudo apt-get install -y bitcoind
bitcoind -testnet -daemon
```
While bitcoind is syncing we can install c-lightning

## Installing c-lightning

```
sudo apt-get update
sudo apt-get install -y \
  autoconf automake build-essential git libtool libgmp-dev \
  libsqlite3-dev python python3 net-tools zlib1g-dev libsodium-dev \
  libbase58-dev
sudo apt-get install software-properties-common
git clone https://github.com/ElementsProject/lightning.git
cd lightning
./configure
make
```

After bitcoind is fully synced, `cd lightning` and run `lightningd/lightningd` with arguments of your choice
If you are connecting to a remote bitcoind node, you can skip installing bitcoind.
Instead setup a config file: `vim ~/.lightning/config`

```
bitcoin-rpcconnect=<ip-address-of-remote>
bitcoin-rpcport=<port-where-bitcoind-is-running> [deafault mainnet = 8332, testnet = 18332]
bitcoin-rpcuser=<username-in-bitcoin.conf-of-remote>
bitcoin-rpcpassword=<password-in-bitcoin.conf-of-remote>
network=testnet
alias=<Name your node>
```

Test if bitcoind is synced `bitcoin-cli getblockchaininfo`. Check that headers = blocks.
Then run `lightningd/lightningd -daemon`
The lightning network sync takes a couple of minutes.
Test if lightning is working, `cd lightning` , `cli/lightning-cli getinfo`

You should have your lightning node setup by now. Additionally you can connect to [new nodes on
the lightning network](http://www.1ml.com/testnet) and fundchannels with them to get starting with routing
and spending bitcoin on lightning

Finally you can connect this app with your lightning node by just editing the file `config.js` and entering the path of your lightning node