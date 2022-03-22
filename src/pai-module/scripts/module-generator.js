/**
 * Module Generator Script
 * @description  Run this script to configure you PAI Bot Module
 * @example npm run module-generator
 * @module module-generator
 * @author captain-crypto
 * @since 01/07/2021
 * @Copyright PAI-TECH 2018, all right reserved
 */



const {PAILogger, PAIUtils} = require("@pai-tech/pai-code");
//BOTS 2.0

//const pai_bot_settings = require("../pai-bot/src/utils/pai-bot-settings").get_instance();
const os = require("os");
const fs = require("fs");
const inquirer = require('inquirer');

const __dms = ""; //dev mode separator ->  dev = "__" / prod = ""


run_bot_script().then((success) => {
    if (success) {
        PAILogger.info("PAI Module has been created, run config script to configure the PAI-BOT");
    } else
        PAILogger.error("Unable to create PAI Module");
}).catch(e => {
    console.log("Unable to create PAI Module " ); //in case no PAI-Logger
});


/**
 * Runs the bot wizard script
 * @function run_bot_script
 * @memberOf module-generator
 */
async function run_bot_script() {
    //wait for PAI-Code compiler to start
    await PAICode.on_ready();
    await ask_questions();
    return true;
}

/**
 * Wizard - ask the question script
 * @async
 * @function ask_questions
 * @memberOf module-generator
 */
async function ask_questions() {

    return new Promise((resolve, reject) => {

        const questions = [
            {
                type: "input",
                name: "pai-module-name",
                message: "How do you like to call the new PAI Bot Module?",
                default: "my-module",
            },
            {
                type: "input",
                name: "pai-module-desc",
                message: "Module description",
                default: "my new module",
            }
        ];
        inquirer
            .prompt(questions)
            .then(answers => {
                for (const key in answers) {
                    if (key.indexOf('_') === 0) {
                        delete answers[key];
                    }
                }

                if (answers.length === 0) {
                    PAILogger.info('Nothing to update');
                    reject(false);
                }
                else {
                    let pai_code_interface ={
                        "pai-code-version":"2.0",
                        "pai-module-name":answers["pai-module-name"],
                        "pai-module-desc":answers["pai-module-desc"],
                        "pai-module-settings":[
                            "module-name"
                        ],
                        "required-modules":[
                        ],
                        "pai-code-commands":[
                            {"command-name":"version", "js-function":"version"},
                            {"command-name":"release-notes", "js-function":"get_release_notes"},
                        ],
                        "pai-ddb" : {
                            "db-name" : "pai-module-db",
                            "data-security" : "plain-text"
                        },
                        "pai-bot-web-interface": {
                            "static-web-folders": ["public", "packages"],
                            "web-services":[
                                {"service-name":"home","js-function":"get_home",
                                    "method": "GET"
                                }
                            ]
                        }
                    };
                    PAILogger.info("Creating module " + pai_code_interface["pai-module-name"]);
                    create_pai_code_interface_file(pai_code_interface);
                    update_package_json_file(pai_code_interface);
                    resolve(true);
                }

            }).catch(err => {
            PAILogger.error('error:' + err.message, err);
            reject(false);
        });
    });

}


/**
 * Create the pai-code-interface.json file
 * @function create_pai_code_interface_file
 * @memberOf module-generator
 */
function create_pai_code_interface_file(pai_code_interface) {
    let pci_folder = "src/pai-module/"
    let pci_file_name = pci_folder + __dms + "pai-code-interface.json";
    fs.writeFileSync(pci_file_name,JSON.stringify(pai_code_interface),'utf8');
    PAILogger.info("pai-code-interface file created");
}

/**
 * Create the update package.json file
 * @function update_package_json_file
 * @memberOf module-generator
 */
function update_package_json_file(pai_code_interface) {
    let pkg_json_file_name =  "package.json";
    let data = JSON.parse(fs.readFileSync(pkg_json_file_name,'utf8'));
    data.name = pai_code_interface["pai-module-name"];
    data.description = pai_code_interface["pai-module-desc"];
    fs.writeFileSync(__dms + pkg_json_file_name,JSON.stringify(data),'utf8');
    PAILogger.info("package.json file updated " + data.name);

}