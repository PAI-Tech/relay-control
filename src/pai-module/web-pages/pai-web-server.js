/**
 * PAI Web Server - PWS
 * @description  PWS is a web server for PAI platform based on Express.JS
 * @class PAI_WEB_SERVER
 * @author captain-crypto
 * @since 28/11/2018
 * @Copyright PAI-TECH 2018, all right reserved
  */




const { PAICodeCommand, PAICodeCommandContext, PAICodeModule, PAICode, PAIModuleConfigParam, PAIModuleConfig, PAILogger, PAIModuleCommandSchema, PAIModuleCommandParamSchema } = require('@pai-tech/pai-code');

const pai_os = require('@pai-tech/pai-os').PAI_OS;


const path = require('path');
const fs = require('fs');
const pai_utils = require('@pai-tech/pai-code').PAIUtils;
const express = require('express');
const bodyParser = require('body-parser')
const PAIWebRouter = require('./pai-web-router');

const pai_module_settings = require("@pai-tech/pai-code").PAIModuleSettings.get_instance;
const https = require('https');
const http = require('http');


class PAI_WEB_SERVER {


    constructor(config) {
        this.port = config.http.port;
        this.baseFolder = "/var/PAI/tmp/";
        this.publicFolder = this.baseFolder + "public";

        this.ws = null;
        this.sws = null;
        this.exp = express();


        this.exp.use( bodyParser.json() );       // to support JSON-encoded bodies
        this.exp.use(bodyParser.urlencoded({     // to support URL-encoded bodies
            extended: true
        }));

        this.exp.use(function(req, res, next) {

            res.header('Access-Control-Allow-Origin','*');

            res.header('Access-Control-Allow-Headers',"Access-Control-Allow-Headers, Origin,Accept,Authorization, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

            res.header('Access-Control-Expose-Headers','PAI_SERVER_TIME');

            res.header('PAI_SERVER_TIME',(new Date()).getTime()); /** Gets the time value in milliseconds. */

            if(req.method === 'OPTIONS') {
                res.header('Access-Control-Allow-Methods','GET, POST, PUT, PATCH, DELETE');
                return res.status(200).json({});
            }
            next();
        });
    }


    /**
     * Start PAI Web Server
     */
    start() {
        let target = path.join(__dirname, '../public');
        this.exp.use('/public', express.static(target));
        this.exp.use('/packages', express.static(path.join(__dirname, '../packages')));

        this.exp.get("/",(req, res) => this.get_home_page(req,res,"/"));



        //The 404 Route (ALWAYS Keep this as the last route)
        this.exp.get('*', function(req, res){
            res.status(404).send('what???');
        });

        this.ws  = http.createServer(this.exp).listen(this.port, () => {
            PAILogger.log("info","pai-web-server is listening on port " + this.port);
        })






        let ssl_port = null;
        let dsite_domain = null;

        if(ssl_port && dsite_domain)
        {

            const privateKey = fs.readFileSync(`/var/PAI/Bot/ssl/${dsite_domain}/privkey.pem`, 'utf8');
            const certificate = fs.readFileSync(`/var/PAI/Bot/ssl/${dsite_domain}/cert.pem`, 'utf8');
            const ca = fs.readFileSync(`/var/PAI/Bot/ssl/${dsite_domain}/chain.pem`, 'utf8');

            const credentials = {
                key: privateKey,
                cert: certificate,
                ca: ca
            };

            this.sws = https.createServer(credentials, this.exp)
                .listen(ssl_port, function () {
                    PAILogger.log("info","pai-web-server is listening with ssl on port " + ssl_port);
                })
        }


        //return resolve(`File service web interface started on port ${port}!`);

    }


    /**
     * Stops PAI Web Server
     */
    stop() {

        if(this.ws) {
            this.ws.close();
        }
        if(this.sws)
            this.sws.close();

    }


    /**
     * Get homepage
     * @param req - Http Request
     * @param res - Http Response
     * @param route - Route (params)
     */
    get_home_page(req,res,route)
    {
        let pai_web_router = new PAIWebRouter();
        return pai_web_router.get_home(req,res,route);
    }



}

module.exports = PAI_WEB_SERVER;