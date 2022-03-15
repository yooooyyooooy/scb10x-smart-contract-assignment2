// import { expect } from "chai";
// import { ethers } from "hardhat";
// import KOVAN_NETWORK_CONSTANT from "../constants/kovan";
// describe("Greeter", function () {
//       it("Should return the new greeting once it's changed", async function () {
//             const { CETH_ADDRESS } = KOVAN_NETWORK_CONSTANT;
//             console.log(CETH_ADDRESS);
//             const Greeter = await ethers.getContractFactory("Greeter");
//             const greeter = await Greeter.deploy("Hello, world!");
//             await greeter.deployed();

//             expect(await greeter.greet()).to.equal("Hello, world!");

//             const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

//             // wait until the transaction is mined
//             await setGreetingTx.wait();

//             expect(await greeter.greet()).to.equal("Hola, mundo!");
//       });
// });
