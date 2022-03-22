/**
 * Spell - universal user interface (UI) framework
 * Spell-SERVER - NodeJS server page for Spell platform
 Author       : Tamir Fridman
 Date Created : 03/09/2020
 Copyright PAI-TECH 2020, all right reserved
 */


const pai_utils = require('@pai-tech/pai-code').PAIUtils;
const path = require('path');
const fs = require('fs');



class SPELL_SERVER  {



    static get_spell_html_page(html_file_name="spell-page.html",data_to_client = null)
    {
        const vrs = {
            pwp : "$spell_data_from_server"
        }
        let  spell_html_page = fs.readFileSync(path.resolve(__dirname,html_file_name), 'utf8');
        let pwp_start = spell_html_page.indexOf(vrs.pwp);
        let out = spell_html_page;
        if(data_to_client && pwp_start>-1 ) {
            out = spell_html_page.substring(0,pwp_start -1) + JSON.stringify(data_to_client) + spell_html_page.substring(pwp_start + vrs.pwp.length + 1);
        }
        return out;
    }
}


module.exports = SPELL_SERVER;
