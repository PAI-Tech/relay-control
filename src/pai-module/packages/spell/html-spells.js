/**
 * spell - universal user interface (UI) framework
 * spells repository - holds all the registered spell objects
 * Author       : Tamir Fridman
 * Date Created : 03/09/2020
 * Copyright PAI-TECH 2020, all right reserved
 */





class HTML_SPELLS
{
    constructor()
    {
        this.html_spells_repo = {"view" : "div"}
    }

    static get instance()
    {
        return html_spells_instance;
    }

    add_html_spell(spell_name,html_tag)
    {
        this.html_spells_repo[spell_name] = html_tag;
    }

    get_html_spell(spell_name)
    {
        if(this.html_spells_repo.hasOwnProperty(spell_name))
        {
            return this.html_spells_repo[spell_name];
        }
        else throw new Error("Invalid Spell " + spell_name);
    }


}

let html_spells_instance = new HTML_SPELLS();

