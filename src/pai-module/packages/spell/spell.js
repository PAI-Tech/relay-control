/**
 * Spell.JS
 * @description Universal User Interface (UI) Engine for Javascript supporting devices & browsers
 * @author Tamir Fridman <tamirf@pai-tech.org>
 * @since  03/09/2020
 * @copyright PAI-TECH 2020, all right reserved
 *
 *      This program is free software; you can redistribute it and/or
 *		modify it under the terms of the GNU General Public License
 *		as published by the Free Software Foundation; either version
 *		3 of the License, or (at your option) any later version.
 */



const spell_object_html_fields_mapping = {"_id": "id",  "css-class": "class","animation":"xyz","input-type":"type"};

const reserved_words = {"spells" :"child spells"}
const spell_element = "#spell-player"; //temporary until SpellPlayer will be ready


let _view_manager = null;
let _object_manager = null ;
let _speech_manager = null;

class SpellObjectManager {
    constructor() {
        this.object_classes = {};
        this.spell_objects = {};
    }


    /**
     *
     * @param spell_objects - key value list -> {"view":SpellView,...}
     */
    register_objects(spell_objects) {
        let names = Object.keys(spell_objects)
        names.forEach(name => this.register_object(name,spell_objects[name]))
    }

    register_object(name,spell_object) {
        this.object_classes[name] = spell_object;
    }

    has_object_class(name) {
        return this.object_classes.hasOwnProperty(name);
    }

    get_object_class(name) {
        return this.object_classes[name];
    }

    get_all_classes() {
        return this.object_classes;
    }

    add_object(spell_object) {
        if(spell_object && spell_object._id) {
            //console.log("adding " + spell_object._type + " as " + spell_object._id)
            this.spell_objects[spell_object._id] = spell_object
        }
        else {
            console.log("unable to add object ")
        }
    }

    // TO-DO - remove object
    remove_object(spell_object_id) {
        this.spell_objects[spell_object_id] = null;
    }

    get_object(spell_object_id) {
        return this.spell_objects[spell_object_id]
    }
}
/**
 * Spell
 * @description Spell engine entry point
 */
class Spell {

    /**
     * @static getter for SPELL_VIEW_MANAGER active instance
     * @return {SpellViewManager}
     */
    static get view_manager() {
        if(!_view_manager) {
            _view_manager = new SpellViewManager();
        }
        return _view_manager;
    }

    /**
     * aliast to view_manager getter
     */
    static get vm() {
        return Spell.view_manager;
    }

    static get object_manager() {
        if(!_object_manager) {
            _object_manager = new SpellObjectManager();
        }
        return _object_manager;
    }
    static get om() {
        return Spell.object_manager
    }

    static async  init() {
        await SpellUtils.load_script("packages/spell/spell-objects.js")
        await SpellUtils.load_script("packages/spell/spell-extended.js")        
    }

    static load_app(spell_app){
        Spell.vm.add_raw_views(spell_app.views);
        const v = (spell_app.defaults && spell_app.defaults.view) ? spell_app.defaults.view : Spell.vm.raw_views[0].name
        Spell.vm.load_page(v);
    }

    static open_url(url, target = null)
    {
        if(!target)
        {
            document.location = url;
        }
        else
        {
            window.open(url);
        }
    }

    /**
     * create new SPELL_OBJECT
     * @static
     * @param data - The data of the new object (JSON)
     * @return {SpellObject|*}
     */
    static create(data) {

        let ro;
        if(data.hasOwnProperty("_type")) {
            if(Spell.om.has_object_class(data["_type"])) {

                let spell_object_class = Spell.om.get_object_class(data["_type"]);
                if(spell_object_class.hasOwnProperty("defaults")) {
                    SpellUtils.merge_defaults_with_data(data,spell_object_class.defaults);
                }
                ro = new spell_object_class(data);
            }
            else {
                throw "Spell object '" + data["_type"] + "' not found";
            }
        }
        else {
            ro = new SpellObject(data);
        }

        ro.init();
        Spell.om.add_object(ro)
        if(data.hasOwnProperty("spells"))
        {

            data.spells.forEach(spell => {
                //console.log("adding spell - " + JSON.stringify(spell));
                let new_spell = Spell.create(spell);
                ro.append(new_spell)
            });
        }


        return ro;
    }

    /**
     * plays  Spell program
     * @param spell_program - program to be loaded
     */
    static play(spell_program) {
        let cmd = SpellCLIParser.parse_spell(spell_program);
        //console.log(JSON.stringify(cmd));
    }


}

class SpellObject {

    constructor(data,defaults) {     
        if(defaults) {
            SpellUtils.merge_defaults_with_data(data,defaults)
        }  
        this._id = (data._id) ? data._id : "so-" + SpellUtils.guid();
        this._html_tag = "div";
        this._dom_object = null;
        this._type = "view";
        this._jq_obj = null;
        this._html = "";
        this._spells =[];
        this.animation = true;
        this._ignore = reserved_words;

        if(data) {
            if(data.hasOwnProperty("_ignore")) {
                this._ignore = SpellUtils.create_ignore_list(data["_ignore"])
            }
            this.parse(data,this._ignore);
            //this._dom_object = this.get_dom_object();
        }
    }


    /**
     * occurs on Spell.init
     * @override 
     */
    init() {
        //console.log("init " + this._type ) //DEBUG
    }


    parse(data,ignore = reserved_words) {
        let cdata = Object.keys(data);
        cdata.forEach(field => {
            if (!ignore.hasOwnProperty(field) && data.hasOwnProperty(field)) {
                this[field] = data[field];
            }
        });
    }

    log() {
        let keys = Object.keys(this);
        keys.forEach(key => {
            if(this[key])
            {
                console.log(key + ":" + this[key]);
            }
        });
        console.log(this.get_html());
    }

    get_dom_object()
    {
        if(!this._dom_object) {
            //console.log("creating " + this._html_tag);
            let dom_object = document.createElement(this._html_tag);
            let fields = Object.keys(this);

            fields.forEach(field => {
                if (this[field] && this.hasOwnProperty(field)) {
                    let f_out = field;
                    if (spell_object_html_fields_mapping.hasOwnProperty(field)) {
                        f_out = spell_object_html_fields_mapping[field];
                    }
                    if (!f_out.startsWith("_") && f_out !== "text") {
                        dom_object.setAttribute(f_out, this[field]);
                    }
                }
            });

            if (this["text"] && this["text"].length > 0) {
                dom_object.innerText = this["text"];
            } else if (this._spells.length > 0) {
                //console.log(JSON.stringify(this._spells));
                this._spells.forEach(child => {
                    dom_object.appendChild(child.get_dom_object());
                })
            }
            this._dom_object = dom_object;
        }
        return this._dom_object;
    }

    get_html() {
        console.log("html for " + this._id)
        this._html = this.get_dom_object().outerHTML;
        return this._html;
    }

    /**
     * @deprecated
     * @return {string}
     * @private
     */
    _get_html_vanilla() {
        this._html = `<${this._html_tag} `;
        let fields = Object.keys(this);

        fields.forEach(field => {
            if (this[field] && this.hasOwnProperty(field)) {
                let f_out = field;
                if(spell_object_html_fields_mapping.hasOwnProperty(field)) {
                    f_out = spell_object_html_fields_mapping[field];
                }
                if(!f_out.startsWith("_") && f_out !== "text") {
                    this._html += ` ${f_out}="${this[field]}"`;
                }
            }
        });


        if( (!this["text"] || this["text"].length == 0) && this._spells.length == 0) {
            this._html += " />";
        }
        else {
            this._html += ">";
            if(this["text"] && this["text"].length > 0) {
                this._html += this["text"];
            }
            if(this._spells.length>0) {
                this._spells.forEach(child => {
                    this._html += child.get_html();
                })
            }
            this._html += `</${this._html_tag}>`;
        }
        return this._html;
    }

    //alias
    get jqo() {
        return this.jquery_object
    }

    get jquery_object() {
        if(!this._jq_obj) {
            this._jq_obj =$("#" + this._id);
        }
        return this._jq_obj;
    }

    get dom_element() {
        return document.getElementById(this._id);
    }

    append(spell_object) {
        this._spells.push(spell_object);
        if(this._dom_object ) {
            let jqo = this.jquery_object;
            jqo.append (spell_object.get_html())
            //this._dom_object.append();
        }
    }

    set_style(attr,val) {
        this.jquery_object.css(attr,val);
    }

    show() {
        let jqo = this.jquery_object;
        if(this.animation && jqo.hasClass("xyz-out")){
            jqo.toggleClass("xyz-out xyz-in");
        }
        jqo.show();
    }

    hide() {
        let jqo = this.jquery_object;
        if(this.animation && jqo.hasClass("xyz-in")){
            jqo.toggleClass("xyz-in xyz-out");
        }
        //console.log("hiding " + this._id);
        jqo.hide();
    }
}

class SpellUtils {
    /**
     * create ignore list for parser to ignore spells words
     * @param list - list of reserved words (comma separated)
     */
    static create_ignore_list(list){
        let words = list.split(",");
        let out_list = reserved_words;
        words.forEach(word => out_list[word] = "");
        return out_list;
    }
    

    static guid() {
        let chars = '0123456789abcdef'.split('');
        let uuid = [], rnd = Math.random, r;
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4'; // version 4
        for (let i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | rnd() * 16;
                uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r & 0xf];
            }
        }
        //console.log('spell-guid')
        return uuid.join('');
    }

    static merge_defaults_with_data(data,defaults) {
        if(data){
            if(!data._id && !data.id) {
                defaults["_id"] = SpellUtils.guid();
            }
            //selective assign
            let dkey = Object.keys(defaults);
            dkey.forEach(key => {
                if (!data.hasOwnProperty(key)) {
                    data[key] = defaults[key];
                }
            })
        }
        else {
            data = defaults
        }
    }

    static async  load_script(url) {
            return new Promise(function(resolve, reject) {
              jQuery.getScript(url).done(function (script) {
                resolve(script);
              });
            });
    }


    static check_overlaping_rects (rect1, rect2,inside = false) {
        if(!inside) {
            return !(rect1.top > rect2.bottom || rect1.right < rect2.left || rect1.bottom < rect2.top || rect1.left > rect2.right);
        }
        else {
            return (
                ((rect2.top <= rect1.top) && (rect1.top <= rect2.bottom)) &&
                ((rect2.top <= rect1.bottom) && (rect1.bottom <= rect2.bottom)) &&
                ((rect2.left <= rect1.left) && (rect1.left <= rect2.right)) &&
                ((rect2.left <= rect1.right) && (rect1.right <= rect2.right))
            );
        }
    }
}

/**
 * @class SpellViewManager
 * @description manage views activities
 * */
class SpellViewManager {

    /**
     * Spell View Manager constructor
     * @member raw_views This object contains the textual JSON representation of views (these are not SpellView objects, uses for caching views before loading)
     * @member views SpellView objects that are ready to use (show, hide...)
     */
    constructor() {
        this.raw_views = {};
        this.views = {};
        this.active_view = null;
        this.active_modal = null;
        this.init();
    }

    init() {
        //handle back functionality for browser
        window.addEventListener('hashchange', this.hashchange)
    }

    /**
     * Creates new SpellView 
     * @description turns view-data (JSON) to a spell object 
     * @param view_data
     * @param auto_add - if true and the view data {view_data} contains a "name" string the new view will be added automatically to the view manager
     * @return {SpellView}
     */
     create_view(view_data,auto_add = true) {
        
        let new_view = Spell.create(view_data);
        if(auto_add && view_data.hasOwnProperty("name")) {
            $(spell_element).append(new_view.get_html());
            this.add_view(new_view,view_data.name)
        }
        return new_view;
    }


    add_view(view,view_name) {
        this.views[view_name] = view;
    }

    get_view(view_name) {
        return this.views[view_name];
    }

    has_view(view_name) {
        return this.views.hasOwnProperty(view_name)
    }

    add_raw_views(vuz) {
        let rvuz = Object.keys(vuz);
        rvuz.forEach((vu) => this.raw_views[vu] = vuz[vu]); 
    }

    add_raw_view(view_name,view_data) {
        this.raw_views[view_name] = view_data
    }

    load_page(default_view_name) {
        let anc = $(location).attr('hash');
        if(anc && anc.length>1) {
            this.active_view = anc.substring(1);
        } else {
            this.active_view = default_view_name;
        }
        this.show_view(this.active_view)
    }

    
    /**
     * handle the hashchange browser event, used to support Back funcionality.
     */
    hashchange() {
        let anc = $(location).attr('hash');
        if(anc && anc.length>1) {
            let v_name = anc.substring(1);
            if(this.active_view != v_name) {
                Spell.vm.show_view(v_name)
            }
        }
    }

    
    

    show_view(view_name) {
        let vu = "",new_view;
        let oncreate = false;
        if(this.has_view(view_name)){
            new_view = this.get_view(view_name);
        }
        else {
            vu = this.raw_views[view_name];
            vu.name = view_name;
            new_view = this.create_view(vu) //create_view(vu);
            oncreate = true;
        }

        //get the active view
        let v_active = this.get_view(this.active_view);
        if(v_active){
            v_active.hide();
        }
        new_view.show();
        this.active_view = view_name;
    
        if(oncreate)
        {
            //temporary should be raplaced with pai-code
            eval(new_view.oncreate);
        }
        Spell.open_url("#" + this.active_view);
    }


    /**
     * Show spell modal dialog
     * @param {*} spell_dialog_data 
     */
    show_dialog(spell_dialog_data) {
        
        if(!spell_dialog_data._id && spell_dialog_data.id){
            spell_dialog_data._id = "spell-dialog-" + SpellUtils.guid();
        }
        let dialog = new SpellDialog(spell_dialog_data);
        dialog.show()
    }

    hide_dialog(dialog_id){
        if(!dialog_id){
            dialog_id = this.active_modal;
        }
        $("#"+dialog_id).modal('hide')
        this.active_modal = null;
    }

}


/** Spell Player **/

class SpellPlayerModule {
    constructor() {
        this.name = "simple-module"
    }

    load(){
        console.log("module " + this.name + " loaded")
    }

    execute(spell_command_str) {
        console.log("executing  " +  spell_command_str)
    }
}



const SpellPlayerState = {
    fresh:0,
    loading:1,
    loaded:2,
    ready:10
}

class SpellPlayer {

    constructor(data) {
        const defaults = {
            fps:1
        }

        this.frame = 0 //start frame
        this.state = SpellPlayerState.fresh
        this.modules = {}
    }

    import_module(spell_module) {
        if(this.modules.hasOwnProperty(spell_module.name)) {
            console.log("module " + spell_module.name + " already loaded")
        }
        else {
            this.modules[spell_module.name] = spell_module;
        }
    }

    load_modules() {
        this.import_module(new SpellPlayerModule())
        Object.keys(this.modules).forEach((sm) => this.modules[sm].load());
    }

    load(){
        this.load_modules();
        this.state = SpellPlayerState.loaded
    }

    
}

class SpellCommand {
    constructor() {
        this.id = SpellUtils.guid();
        this.module = null;
        this.op = null;
        this.execute_on_frame = 0;
        this.execute_on_event = null;
        this.date_created = (new Date()).getTime();
        this.params = {};
    }
}

const SPELL_PARAMETER_TYPE = {
    Numeric: 1,
    Text: 2,
    Object: 3
};

class SpellCommandParameter {

    /**
     *
     * @param {String} param_name
     * @param {String} value
     * @param { SPELL_PARAMETER_TYPE } type
     */
    constructor( param_name, value, type) {
        this.name = param_name;
        this.value = value;
        this.type = type;
    }

}

class SpellCLIParser {

    static parse_spell(raw_spell) {
        let code = raw_spell.trim();

        let args = SpellCLIParser.parse_arguments(code);

        let cmd = new SpellCommand();
        cmd.module = args[0];
        cmd.op = args[1];
        cmd.params = {};


        // start params from index 2
        for (let i = 2; i < args.length; i++) {
            let paramStr = args[i];
            let delimiterIdx = paramStr.indexOf(':');
            let quotesIdx = paramStr.indexOf('"');
            let finalDelimiter = (quotesIdx < delimiterIdx) ? -1 : delimiterIdx;

            let paramName = (finalDelimiter === -1) ? i.toString() : paramStr.substring(0, delimiterIdx);
            let paramValue = SpellCLIParser.fix_argument_value(paramStr.substring(finalDelimiter + 1));

            if (paramName === "frame")
                cmd.execute_on_frame = paramValue;
            else if (paramName === "on")
                cmd.execute_on_event = paramValue;
            else
                cmd.params[paramName] = new SpellCommandParameter( paramName, paramValue, SPELL_PARAMETER_TYPE.Text);
        }


        return cmd;
    }


    static parse_arguments(code) {
        let args = [];

        while (code.length) {
            let argIndex = SpellCLIParser.get_next_argumentIndex(code);
            if (argIndex == -1) {
                // error
                PAILogger.error('error: ' + code);
                break;
            }
            else {
                args.push(code.substring(0, argIndex));

                let oldCode = code; // this variable is used to check if loop in endless
                code = code.substring(argIndex).trim();

                if (code.length == oldCode) {
                    // error - while loop is in endless
                    PAILogger.error('error: while loop is in endless - leftovers: ' + code);
                    break;
                }

            }
        }


        return args;
    }

    static fix_argument_value(arg) {
        let finalArg = "";
        let prevChar = "";
        for (var i = 0; i < arg.length; i++) {
            let char = arg.charAt(i);
            let addToFinal = true;

            if (char === '"' && prevChar !== "\\")
                addToFinal = false;

            if (addToFinal)
                finalArg += char;
            prevChar = char;
        }


        finalArg = finalArg.replace(/\\\"/g, '"');

        return finalArg;
    }


    /**
     * Get next argument from string
     * @param {String} str
     * @return {number} indexOf the end of the argument
     */
    static get_next_argumentIndex(str) {
        let idx = -1;
        let count = str.length;
        let zeroCount = count - 1;
        let inQuotes = false;
        let prevChar = "";
        for (let i = 0; i < count; i++) {
            let char = str.charAt(i);


            if (char === '"') {
                if (inQuotes) {
                    if (prevChar === '\\') {
                        // ignore
                    }
                    else {
                        // end of arguments
                        inQuotes = false;
                    }

                }
                else {
                    inQuotes = true;
                }
            }
            else if (char === ' ') {
                if (!inQuotes) {
                    // end of arguments
                    idx = i;
                    break;
                }
            }

            if (i === zeroCount) {
                idx = count;
                break;
            }


            prevChar = char;
            // argument is still processing
        }

        return idx;
    }
}

class SpellEvent extends CustomEvent {
    
    constructor(type_arg, options) {
        super( type_arg,options)
    }
}

class SpellEventManager {
    
    constructor() {

    }

    static fire(spell_event) {
        //console.log(spell_event)
        document.dispatchEvent(spell_event)
    }
}


 /* 
    //example for event fire
        const se = new SpellEvent('event-name', {detail:{x:100,y:100}})
        SpellEventManager.fire(se);
    }
    */