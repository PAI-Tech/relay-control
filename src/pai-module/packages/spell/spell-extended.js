
/**
 * Spell EXTENDED
 * @description write your own Spell objects and methods
 * @author Tamir Fridman <tamirf@pai-tech.org>
 * @since  03/09/2020
 * @copyright PAI-TECH 2020, all right reserved
 */

class SpellExtended {

    static init() {
        Spell.om.register_objects({
                "youtube":SpellYoutubeVideo,
                "pai-entity-view":PAIEntityView
            })
    }
}



class SpellYoutubeVideo extends SpellObject {
    constructor(data) {
        data["_type"] = "youtube";
        super(data);
        this._html_tag = "iframe";
    }
}


class PAIEntityView extends SpellObject {
    /*
    (xdata)"pai-entity-view": {
        
      "name": "hello-world-entity",
      "fields": [
        {"name": "field-1","type": "string", "required": true,"xdata":"pk"}
      ]
    }*/

    
    constructor(data) {
        data["_ignore"] = "xdata";
        if(!data.spells) {data.spells = []}
        if(data["xdata"]) {
            data.spells.push({
                _type : "view",
                _id: data["xdata"].name  + "-title",
                text:data["xdata"].name,
                "animation":"fade",
                class:"h4 speak",
                style: "text-align:center;border-bottom:solid 1px var(--text-color)"
            });
            data["xdata"].fields.forEach(field => {
                data.spells.push({
                    _type : "view",
                    _id: field.name ,
                    text:field.name,
                    "animation":"flip delay-2",
                    class:"xyz-in speak",
                    style: ""
                });
            });
            let v_action = {
                _type:"view",
                _id: data["xdata"].name  + "-action",
                style:"display:block;text-align:right;padding-right:10px",
                spells: [
                    {
                        _type:"link",
                        _id:data["xdata"].name  + "-edit",
                        text:"edit",
                        class:"pai-link",
                        style:"width:100px;",
                        onclick:"PAIEntityView.edit_entity('" + JSON.stringify(data["xdata"]) + "')",
                    },
                ]
            }
            data.spells.push(v_action);
        }
        super(data);
    }

    /**
     * @override
     */
    init() {
        //console.log("init pai-entity")
    }
    
    static edit_entity(entity) {
        let ent = JSON.parse(entity);
        const v_guid = SpellUtils.guid();
        const vn = "pai-entity-form" + v_guid;
        let mview = {
            _type : "view",
            name: vn,
            _id: vn,
            class:"",
            style: "",
            spells:[ 
                {
                    _type : "view",
                    _id: "pai-entity-editor-" + v_guid,
                    text:"Edit Entity: " + ent.name,
                    "animation":"fade",
                    class:"h4",
                    style: "text-align:center;border-bottom:solid 1px var(--text-color)",
                    
                },
                {
                    _type:"label",
                    _id:"en-label-" + v_guid,
                    class:"form-label",
                    text:"Entity Name"
                },
                {
                    _type:"text",
                    "input-type":"text",
                    _id:"en-text-"+v_guid,
                    class:"form-control",
                    value:ent.name
                },
                {
                    _type:"label",
                    _id:"en-label-flds-" + v_guid,
                    class:"form-label",
                    text:"Fields:"
                },
                {
                    _type:"table",
                    _id:"en-table-"+v_guid,
                    class:"pai-table",
                    _header : {
                        _fields : ["Name","Data Type","Required"]
                    },
                    _data:ent.fields
                }

            ]
        };
        let sdialog = {
            _id:"pai-entity-editor",
            _header: {
                title:"Entity Editor"
            },
            _body: mview,
            _footer:{
                _buttons:[
                    {
                        _id:"dialog-close-button",
                        text:"Close",
                        class:"btn btn-secondary",
                        "data-dismiss":"modal"
                    },
                    {
                        _id:"dialog-save-button",
                        text:"Save",
                        class:"btn btn-primary",
                        onclick:"PAIEntityView.save_entity('" + ent.name +  "')",
                    }
                ]
            }
        }
        let  dialog = new SpellDialog(sdialog);
        dialog.show()
    }

    static save_entity(entity) {
        //alert("savint entity" + entity)
        Spell.vm.hide_dialog()
    }
}

class PAIWebPage extends SpellObject {
    constructor(data) {
        super();
    }


    /*
        "pai-web-page": {
            "id":"page-id",
            "title":"page title",
            "image":"/image-url",
            "subtitle":"page subtitle",
            "texts": [
                "text paragraph 1,
                "text paragraph 2,
            ]
            "buttons": [
                {
                    "title" : "button-1-title",
                    "onclick" : "js func"
                },
                {
                    "title" : "button-1-title",
                    "onclick" : "js func"
                }
            ]
        }
     */
    static parse(pai_web_page) {
        if(pai_web_page["main-image-url"]) {
            pai_web_page.image = pai_web_page["main-image-url"];
        }
        if(pai_web_page["page-id"]) {
            pai_web_page.id = pai_web_page["page-id"];
        }
        let pai_base_view =  {
            _type : "view",
            _id: pai_web_page.id ,
            name:pai_web_page.id ,
            style: "width:100%;margin: 0;padding:0;display:none",
            "css-class":"container-fluid xyz-in",
            animation:"fade",
            spells: [
                    {
                    _id: pai_web_page.id  + "_grid" ,
                    _type:"grid",
                    rows: [
                        { cols: [{ spells: [{
                                    _type : "label",
                                    _id: pai_web_page.id  + "_title",
                                    text:pai_web_page.title,
                                    "animation":"fade flip-right duration-5 ease-out-back",
                                    class:"h2 pai-grid-row xyz-in speak",
                                    style: "width:100%;text-align:center"
                                }]}]},
                        { cols: [{ spells: [{
                                    _type : "image",
                                    _id: pai_web_page.id  + "_image",
                                    src: pai_web_page.image,
                                    class:" img-fluid mx-auto d-block xyz-in",
                                    "animation":"fade flip-right delay-1",
                                    style:"max-height:315px"
                                }]}]},
                        { cols: [{ spells: [{
                                    _type : "view",
                                    _id: pai_web_page.id  + "_subtitle",
                                    text: pai_web_page.subtitle,
                                    style: "width:90%;margin-left:5%;display:block;text-align:center",
                                    "class":"xyz-in h5 speak",
                                    animation:"fade "
                                }]}]}]
            },
                {
                    id: pai_web_page.id + "-bot",
                    _type: "image",
                    src: "/public/images/icons/player_unmute.png",
                    class:" xyz-in",
                    "animation":"fade flip-right delay-10",
                    style:"position:fixed;right:20px;bottom:20px;width:30px;cursor:pointer;border-radius:50%",
                    onclick:"bot_speak('" + pai_web_page.id + "')"
                },
            ]};

        for (let idx=0;idx<pai_web_page.texts.length;idx++) {
            let spl = { cols: [{ spells: [{
                        _type : "view",
                        text: pai_web_page.texts[idx],
                        style: "margin-top:20px;width:90%;margin-left:5%;display:block",
                        "class":"speak xyz-in",
                        animation:"fade ease-out-back"
                    }]}]}
            pai_base_view.spells[0].rows.push(spl);
        }

        let btn_grid = { cols: []};
        for (let idx=0;idx<pai_web_page.buttons.length;idx++) {
            let col = { "class":"col-sm-3 col-4 ",spells: [{
                        _type : "button",
                        text: pai_web_page.buttons[idx].title,
                        style:"margin-top:50px",
                        class:"xyz-in pai-panel-button",
                        animation:"fade flip-left delay-1",
                        onclick:pai_web_page.buttons[idx].onclick
                    }]};
            btn_grid.cols.push(col);

        }
        pai_base_view.spells[0].rows.push(btn_grid);

        return pai_base_view;
    }


    static html_to_spell(html_node_id) {


        let spell = {
            type:"pai-web-page",
            "page-id":html_node_id ,
            "title": $("#" + html_node_id + "-title").text(),
            "main-image-url": $("#" + html_node_id + "-image").attr('src'),
            "subtitle": $("#" + html_node_id + "-subtitle").text(),
            "texts": [],
            "buttons": []
        }

        //iterate texts
        $("#" + html_node_id + "-texts").children().each( (index,element) => spell.texts.push($(element).text()));

        //iterate buttons
        $("#" + html_node_id + "-buttons").children().each( (index,element) => {
            let btn = $(element);
            let btn_obj = {"title": btn.text(),"onclick":btn.attr("onclick")};
            spell.buttons.push(btn_obj);
        });

        //change orig id to prevent duplication
        $("#" + html_node_id).attr("id",html_node_id +"-orig");
        //console.log(JSON.stringify(spell));
        return PAIWebPage.parse(spell);
    }


}





class PAICard extends SpellObject {
    constructor(data) {
        super();
    }


    /*
        "pai-card": {
            "card-id":"card-id",
            "title":"page title",
            "main-image-image":"/image-url",
            "subtitle":"page subtitle",
            "texts": [
                "text paragraph 1,
                "text paragraph 2,
            ]
            "buttons": [
                {
                    "title" : "button-1-title",
                    "onclick" : "js func"
                },
                {
                    "title" : "button-1-title",
                    "onclick" : "js func"
                }
            ]
        }
     */
    static parse(pai_card) {
        //console.log(JSON.stringify(pai_card));
        let pai_card_view =  {
            _type : "view",
            _id: pai_card.id ,
            name:pai_card.id ,
            style: "width:80%;margin: 0;padding:0;border: 1px #ffffff07 solid;",
            "css-class":"card",
            animation:"fade",
            spells: [
                {
                    _type : "image",
                    _id: pai_card.id  + "_image",
                    src: pai_card["main-image-url"],
                    class:"card-image-top",
                    "animation":"fade flip-right delay-1",
                    style:"max-height:315px"
                },

                {
                    _type: "view",
                    _id: pai_card.id + "-card-body",
                    style: "width:100%;margin: 0;padding:0",
                    "css-class": "card-body xyz-in",
                    animation: "fade",
                    spells: [
                        {
                            _type : "label",
                            _id: pai_card.id  + "_title",
                            text:pai_card.title,
                            "animation":"fade ",
                            class:"h5 card-title xyz-in",
                            style: "width:100%;text-align:center"
                        },
                        {
                            _type : "view",
                            _id: pai_card.id  + "-subtitle",
                            text:pai_card["subtitle"],
                            "animation":"fade flip-right",
                            class:"card-text xyz-in",
                            style: "width:100%;text-align:center"
                        },
                    ]
                }

            ]};

        // for (let idx=0;idx<pai_web_page.texts.length;idx++) {
        //     let spl = { cols: [{ spells: [{
        //                 _type : "view",
        //                 text: pai_web_page.texts[idx],
        //                 style: "margin-top:20px;width:90%;margin-left:5%;display:block",
        //                 "class":"speak xyz-in",
        //                 animation:"fade ease-out-back"
        //             }]}]}
        //     pai_base_view.spells[0].rows.push(spl);
        // }
        //
        // let btn_grid = { cols: []};
        // for (let idx=0;idx<pai_web_page.buttons.length;idx++) {
        //     let col = { "class":"col-sm-3 col-4 ",spells: [{
        //             _type : "button",
        //             text: pai_web_page.buttons[idx].title,
        //             style:"margin-top:50px",
        //             class:"xyz-in pai-panel-button",
        //             animation:"fade flip-left delay-1",
        //             onclick:pai_web_page.buttons[idx].onclick
        //         }]};
        //     btn_grid.cols.push(col);
        //
        // }
        // pai_base_view.spells[0].rows.push(btn_grid);

        return pai_card_view;
    }


    static html_to_spell(html_node_id) {


        let spell = {
            type:"pai-web-page",
            "page-id":html_node_id ,
            "title": $("#" + html_node_id + "-title").text(),
            "main-image-url": $("#" + html_node_id + "-image").attr('src'),
            "subtitle": $("#" + html_node_id + "-subtitle").text(),
            "texts": [],
            "buttons": []
        }

        //iterate texts
        $("#" + html_node_id + "-texts").children().each( (index,element) => spell.texts.push($(element).text()));

        //iterate buttons
        $("#" + html_node_id + "-buttons").children().each( (index,element) => {
            let btn = $(element);
            let btn_obj = {"title": btn.text(),"onclick":btn.attr("onclick")};
            spell.buttons.push(btn_obj);
        });

        //change orig id to prevent duplication
        $("#" + html_node_id).attr("id",html_node_id +"-orig");
        //console.log(JSON.stringify(spell));
        return PAIWebPage.parse(spell);
    }


}


SpellExtended.init();