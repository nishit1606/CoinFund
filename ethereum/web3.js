import Web3 from "web3";
import { INFURA_RINKEBY } from "./config";

let web3;

if (typeof window !== "undefined" && window.web3 !== "undefined") {
  web3 = new Web3(window.web3.currentProvider);
} else {
  const provider = new Web3.providers.HttpProvider(INFURA_RINKEBY);
  web3 = new Web3(provider);
}

export default web3;
