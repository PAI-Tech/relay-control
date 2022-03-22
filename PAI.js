
/**
 * This file loads the module for development & debug purposes (before publishing)
 * @name PAI
 * @module PAI
 * @author Ron Fridman
 * @since : 9/25/2019
 * @Copyright PAI-TECH 2019, all right reserved
 *      This program is free software; you can redistribute it and/or
 *		modify it under the terms of the GNU General Public License
 *		as published by the Free Software Foundation; either version
 *		3 of the License, or (at your option) any later version.
  */



const {PAILogger, PAICode } = require('@pai-tech/pai-code');
const { Module } = require('./index');


/***
 * @function start
 * @memberOf PAI
 * This is the entry point of the module test file, start your ctest code here
 * @return {Promise<void>}
 */
async function start(){

    // create new PAI Code Module instance
    let module = new Module();

    if(PAICode.modules["pai-bot"])
        await PAICode.modules["pai-bot"].applyBotDataSource(module);

    //register module
    await module.registerModule(); // register the module to PAICode

    let pai_code_module_name = require("./src/pai-module/pai-code-interface")["pai-module-name"];

    //pai-code version command
    let pai_code_command_version = pai_code_module_name + " version";

    //execute pai-code and log response
    let res = await PAICode.run(pai_code_command_version);
    PAILogger.info(pai_code_module_name + " version:" + res);

   
    //PAICode.start()

}


/***
 * Script activation command
 */

//require("../PAI-BOT-JS/PAI");

start().then().catch(e => {
    console.log("Error " + e);
});





