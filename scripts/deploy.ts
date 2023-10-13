import { ethers, run, network } from "hardhat";
import "@nomicfoundation/hardhat-verify";

async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
  console.log("Deploying contract...");
  const simpleStorage = await SimpleStorageFactory.deploy();
  await simpleStorage.waitForDeployment();
  console.log(`Deployed contract to: ${await simpleStorage.getAddress()}`);
  if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    await simpleStorage.deploymentTransaction()?.wait(6);
    const address = await simpleStorage.getAddress();
    await verify(address, []);
  }

  const currentValue = await simpleStorage.retrieve();
  console.log(`Current value stored in contract: ${currentValue.toString()}`);

  const transactionREsponse = await simpleStorage.store(23);
  await transactionREsponse.wait(1);
  const updatedValue = await simpleStorage.retrieve();
  console.log(`Updated value stored in contract: ${updatedValue.toString()}`);
}

async function verify(contractAddress: any, args: any) {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error) {
    const e = error as Error;
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!");
    } else {
      console.log(e);
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
