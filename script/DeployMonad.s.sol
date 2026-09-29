// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {DonationTracker} from "../contracts/DonationTracker.sol";

contract DeployMonad is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        DonationTracker tracker = new DonationTracker();
        
        vm.stopBroadcast();
        
        console2.log("DonationTracker deployed at:", address(tracker));
    }
}
