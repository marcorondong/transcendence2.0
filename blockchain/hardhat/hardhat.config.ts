import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { NetworkUserConfig } from "hardhat/types";
import * as dotenv from "dotenv";

dotenv.config({path: "./.sensitive_env"});

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: [process.env.PRIVATE_KEY! ? `0x${process.env.PRIVATE_KEY}` : '']
    } as NetworkUserConfig, // This type annotation ensures it's treated correctly
  },
};

export default config;
