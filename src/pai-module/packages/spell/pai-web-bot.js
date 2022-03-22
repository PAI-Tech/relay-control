/**
 * pai-web-bot.JS
 * @description PAI-BOT for browsers
 * @author Tamir Fridman <tamirf@pai-tech.org>
 * @since  29/03/2021
 * @copyright PAI-TECH 2021, all right reserved
 *
 *      This program is free software; you can redistribute it and/or
 *		modify it under the terms of the GNU General Public License
 *		as published by the Free Software Foundation; either version
 *		3 of the License, or (at your option) any later version.
 */



let _speech_instance = null;

class PAIWebVoice {

    constructor() {


        this.synth = null;
        this.voices = null;
        this.defaults_voice = null;
        this.defaults_voice_name = null;
        this.speach_rate = 1;
        this.speach_pitch = 1;
        this.pron = {};
    }

    static get_instance() {
        if(!_speech_instance) {
            _speech_instance = new PAIWebVoice();
        }
        return _speech_instance;
    }

    set_pron(pron_dict) {
        this.pron = pron_dict;
    }

    apply_voices() {
        this.voices = this.synth.getVoices();
        //console.log("total voices: " + this.voices.length);
        if(this.defaults_voice_name) {
            this.set_voice_by_name(this.defaults_voice_name);
            this.defaults_voice_name = null;
        }
    }

    load_voices(default_voice = null) {

        this.synth = window.speechSynthesis;
        this.defaults_voice_name = default_voice;
        //chrome event
        if (typeof this.synth !== 'undefined' && this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = function () {
                PAIWebVoice.get_instance().apply_voices();
            }
        }
        else {
            this.apply_voices();
        }

    }

    set_voice(index) {
        this.default_voice = index;
    }

    set_voice_by_name(voice_name) {
        if(this.voices) {
            for (let i = 0; i < this.voices.length; i++) {
                //console.log("bot voice " + this.voices[i].name + ' (' + this.voices[i].lang + ')')
                if (this.voices[i].name.toLowerCase() == voice_name.toLowerCase()) {
                    console.log("bot voice is set to " + this.voices[i].name + ' (' + this.voices[i].lang + ')')
                    this.set_voice(i)
                }
            }
        }
    }

    speak(text, on_speech_word = null,on_speech_end = null) {
        if(this.synth) {
            let utter = new SpeechSynthesisUtterance();
            if (this.default_voice) {
                utter.voice = this.voices[this.default_voice];
            }
            utter.pitch = this.speach_pitch;
            utter.rate = this.speach_rate;

            let l_txt = text.toLowerCase();
            let pkeys = Object.keys(this.pron);
            pkeys.forEach(word => {
                while (l_txt.indexOf(word) > -1) {
                    l_txt = l_txt.replace(word, this.pron[word]);
                }
            });
            utter.text = l_txt;

            utter.onboundary = on_speech_word;
            utter.onend = on_speech_end;

            this.synth.speak(utter);

            return new Promise(resolve => {
                const id = setInterval(() => {
                    if (PAIWebVoice.get_instance().synth.speaking === false) {
                        //console.log("stop speak");
                        clearInterval(id);
                        resolve();
                    }
                }, 100);
            });
        }
    }
}

class PAIWebBot {
    constructor() {
        this.speech = null;
        this.ws = null;
    }

    load_speech_abilities(default_voice_name = "Samantha") {
        this.speech =  PAIWebVoice.get_instance();

        this.speech.load_voices(default_voice_name);
        console.log("now I can speak :]");
    }

    /**
     * Opens a Wormhole to the PAI-BOT on the server (client-to-server wormhole)
     * @param {*} ws_url 
     */
    open_wormhole(ws_url){

        this.ws = new WebSocket(ws_url);
        const wss = this.ws;
        this.ws.onopen = function() {
                    
            // Web Socket is connected, send data using send()
            const pai_code_command = {
                "op":"subscribe-client",
                "params": {
                    "event":"air-pres"
                }
            }

            wss.send(JSON.stringify(pai_code_command));
            console.log("Message is sent...");
        };
        
        this.ws.onmessage = function (evt) { 
            try{
                const msg = JSON.parse(evt.data)
                if(msg.id && msg.id == "pai-event") {
                    let se = new SpellEvent(msg.name, {detail:msg.data})
                    //console.dir(se)
                    SpellEventManager.fire(se);
                }
            }catch(e){
                console.error(e);
            }
            
        };
        
        this.ws.onclose = function() { 
            // websocket is closed.
            console.log("Connection is closed..."); 
        };
    }
}




