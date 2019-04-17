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
