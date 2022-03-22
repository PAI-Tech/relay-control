/**
 * The main class of the module (the entry point of module).
 * This class initialized and loads the module components like setting, `pai-ddb`, `pai-web-server` and more.
 * @class PCM_MAIN
 * @since : 9/25/2019
 * @author captain-crypto
 * @Copyright PAI-TECH 2018, all right reserved
 * @license
 *      This program is free software; you can redistribute it and/or
 *		modify it under the terms of the GNU General Public License
 *		as published by the Free Software Foundation; either version
 *		3 of the License, or (at your option) any later version.
 */


const { PAICodeCommand, PAIUtils, PAICodeCommandContext, PAICodeModule, PAICode, PAIModuleConfigParam, PAIModuleConfig, PAILogger, PAIModuleCommandSchema, PAIModuleCommandParamSchema, PAIEntity } = require('@pai-tech/pai-code');
const path = require('path');
const fs = require('fs');
const pai_module_settings = require("@pai-tech/pai-code").PAIModuleSettings.get_instance;
const pai_code_interface = require("./pai-code-interface");
const pai_web_router = require("./web-pages/pai-web-router");
const pai_ddb = require("@pai-tech/pai-ddb").get_db(pai_code_interface["pai-module-name"]);
const pai_web_server = require("./web-pages/pai-web-server");
const pai_entity_manager = require("@pai-tech/pai-code").PAIEntityManager.get_instance;
const gpio = require('onoff').Gpio; //include onoff to interact with the GPIO

class PCM_MAIN extends PAICodeModule {

    constructor() {

        // Module description that will be shown on info command [your-module-name info]
        let infoText = pai_code_interface["pai-module-desc"];

        super(infoText);
        this.bot_folder = null;

        this.config.schema = [
            //PAIModuleConfigParam(label, description, paramName, defaultValue)
            // TODO: add configuration parameters
        ];
        //this.web_static_folders = {};
        //this.web_services = {};
        this.pai_web_router = new pai_web_router();
        this.pai_web_server = null;
        this.ws_clients = {}; //websocket clients
        this.local_es = {}; //local event subscribers
    }


    /**
     * This method runs when the module is being loaded by the bot.
     * The method loads basic module commands from super class and load all the functions for this module
     * @memberOf PCM_MAIN
     *
     */
    async load() {
        await super.load();
        await super.load_pai_code_interface(pai_code_interface);
        try {
            this.bot_folder = await PAICode.run("pai-bot get-bot-folder");
        } catch (exp) {
            this.bot_folder ="./"; //just for backup
        }

        /**
         * init pai-ddb
         */


        if (pai_code_interface.hasOwnProperty("pai-ddb")) {

            let pai_ddb_folder = this.bot_folder + "data" + path.sep + this.get_module_name() + path.sep;
            if (pai_code_interface["pai-ddb"].hasOwnProperty("data-security")) {
                pai_ddb.ddb_data["data-security"] = pai_code_interface["pai-ddb"]["data-security"];
            }
            pai_ddb.init(pai_ddb_folder);
        }

        /**
         * init pai-web-server
         */

        if (pai_code_interface.hasOwnProperty("pai-web-server")) {

            this.pai_web_server = new pai_web_server(pai_code_interface["pai-web-server"].config);
            this.pai_web_server.start();
        }


        /**
         * Setup the pai-entity-manager
         */

        //await pai_entity_manager.set_backup_folder(this.bot_folder + "data" + path.sep + this.get_module_name() + path.sep);

        //pai_entity_manager.load_from_disk();
        await pai_entity_manager.load(this.pai_code_interface);
        PAILogger.info("pai-entities: " + JSON.stringify(pai_entity_manager.pai_entities));



        /**
         * add any load processes you want
         */

         

    }


    /**
     * Get the module name from pai-code-interface file
     * @override
     * @return {string} module name
     */
    get_module_name() {
        return pai_code_interface["pai-module-name"];
    }


    /**
     * Returns version number of your module (from package.json)
     * @param {PAICodeCommand} cmd PAI-Code_Command
     * @return {string} module version
     */
    version(cmd) {
        return require("./../../package").version;
    }


    /**
     * Returns the module release-note file content
     * @param {PAICodeCommand} cmd PAI-Code_Command
     * @return {string} module version
     */
    get_release_notes(cmd) {
        let pai_release_notes = fs.readFileSync(path.resolve(__dirname, "release-notes.txt"), 'utf8');
        return this.get_module_name() + ":\n--------------\n" + pai_release_notes;
    }


    /**
     * This method installs all the required modules as defined in pai-code-interface file
     * @param {PAICodeCommand} cmd PAI-Code_Command
     * @return {string} result
     */
     async install_required_modules(cmd) {
        let context = cmd.context;
        let required_modules = pai_code_interface["required-modules"];
        try {
            await Promise.all(required_modules.map(async (module) => {
                await PAICode.executeString(`pai-bot learn module:"${module}"`, context);
            }));
            return 'All Modules Installed successfully';
        } catch (e) {
            console.log(e);
            return e;
        }
    }

    /**
     * process incoming http requests from bot web interface.
     * by default it being processed in the super class by the pai-code-interface configuration
     *
     * - change this function only if you want to override pai-code-interface settings
     * @override
     * @param cmd {PAICodeCommand}
     * @return {string} HTTP request status
     */
    http_request(cmd) {
        return this.process_http_request(cmd, this.pai_web_router);
    }


    async handle_event(cmd) {
        let pai_event = cmd.params["event"].value
        //console.log("event is being handled by module")
        if(this.local_es[pai_event.name]) {
            this.local_es[pai_event.name].forEach(wsid => {
                this.ws_clients[wsid].ws.send(JSON.stringify(pai_event))
            })

        }
        
    }


    check_ws_auth(cmd,wsid) {
        if(!this.ws_clients[wsid].sender && cmd.sender) {
            this.ws_clients[wsid].sender = cmd.sender
            this.ws_clients[wsid].identified = true;
        }
    }

    /**
     * TO-DO: 
     * 1. add handle pai-event function
     * 2. connect between ws and event
     * 3. populate events
     */

    subscribe_client(cmd){
        const event = cmd.params["event"].value
        const wsid = cmd.params["wsid"].value
        if(!this.local_es[event]) {
            this.local_es[event] = []
        }
        this.local_es[event].push(wsid)
        const pc = `pai-event subscribe event-name:"${event}" module:"${this.get_module_name()}"`
        //console.log(pc)
        PAICode.run(pc)

        console.log(wsid + " socket has been subscribed to event " + event )
    }

    async parse_ws_msg(msg,wsid) {
        try {
            let cmd = JSON.parse(msg)
            this.check_ws_auth(cmd,wsid)
            if(!cmd.module) {
                cmd.module = this.get_module_name()
            }
            cmd.params["wsid"] = wsid;
            
            //console.log("parsing command op " + cmd.op + " for module " + cmd.module )
            //console.dir(cmd.params)
            
            //console.dir(cmd)
            
            
            let command = new PAICodeCommand(new PAICodeCommandContext('host','pai-bot'),cmd);
            try {
                PAICode.execute(command);
            } catch (e){
                    const err_msg = "Error op " + cmd.op + " not found"
                    console.error(err_msg)
                    this.ws_clients[wsid].ws.send(err_msg )
            }
            
            //this[pc.func](cmd_out)
            
           
            //console.log(cmd)
            
        } catch(e) {console.log(e)}
    }

    async handle_ws_message(cmd){
        const ws = cmd.params.ws.value
        const msg = cmd.params.msg.value
        const ws_id = this.validate_wsid(ws)
        this.parse_ws_msg(msg,ws_id)
    }

    get_wsid(ws) {
        return ws._socket.remoteAddress + ":" + ws._socket.remotePort;
    }

    validate_wsid(ws){
        const wsid = this.get_wsid(ws)
        if(!this.ws_clients[wsid]) {
            this.add_ws_connection(ws,wsid)
        }
        return wsid;
    }

    add_ws_connection(ws,wsid) {
        if(!wsid) wsid = this.get_wsid(ws)
        let ws_con = {
            "connect-time":Date.now(),
            "identified":false,
            "sender":null,
            "status":"open",
            ws:ws
        }
        this.ws_clients[wsid] = ws_con;
        PAILogger.info("New websocket conection "+ wsid)
    }

    async handle_ws_open(cmd){
        const ws = cmd.params.ws.value
        this.add_ws_connection(ws)
    }

    async handle_ws_close(cmd){
        const wsid = cmd.params["wsid"].value
        
        //console.log("socket  " + wsid + " is closed")
        // const wsid = ws._socket.remoteAddress + ":" + ws._socket.remotePort
        if(this.ws_clients.hasOwnProperty(wsid)) {
            this.ws_clients[wsid].status = "closed"
           // this.ws_clients[wsid].ws = null
        }

    }

    async relay_on(cmd){
        let relay = new gpio(21, 'out'); //use GPIO pin 4, and specify that it is output
        //if (relay.readSync() === 0)
        { //check the pin state, if the state is 0 (or off)
            relay.writeSync(0); //set pin state to 1 (turn LED on)
        }
        //relay.unexport(); // Unexport GPIO to free resources
        return "lights on"
    }

    async relay_off(cmd){
        let relay = new gpio(21, 'out'); 
        //if (relay.readSync() === 1) 
        { //check the pin state, if the state is 0 (or off)
            relay.writeSync(1); //set pin state to 0 (turn LED off)
        }
        //relay.unexport(); // Unexport GPIO to free resources
        return "lights off"
    }


}


module.exports = PCM_MAIN;


