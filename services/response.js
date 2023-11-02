/**
 * Copyright 2021-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Instagram For Original Coast Clothing
 *
 */

"use strict";

const { response } = require("express");
const i18n = require("../i18n.config");
const config = require("./config");

module.exports = class Response {
  static genQuickReply(text, quickReplies) {
    let response = {
      text: text,
      quick_replies: []
    };

    for (let quickReply of quickReplies) {
      response["quick_replies"].push({
        content_type: "text",
        title: quickReply["title"],
        payload: quickReply["payload"]
      });
    }

    return response;
  }

  static genImage(url) {
    let response = {
      attachment: {
        type: "image",
        payload: {
          url: url
        }
      }
    };

    return response;
  }

  static genText(text) {
    let response = {
      text: text
    };

    return response;
  }

  static genPostbackButton(title, payload) {
    let response = {
      type: "postback",
      title: title,
      payload: {
        elements: [
            {
              buttons: [
              {
                type:"web_url",
                url:"https://www.originalcoastclothing.com",
                title:"View Website"
              },{
                type:"postback",
                title:"Start Chatting",
                payload:"DEVELOPER_DEFINED_PAYLOAD"
              }              
              ]
            }
          ]      
        }
        
    };

    return response;
  }

  static genGenericTemplate(image_url, title, subtitle, buttons) {
    let response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: title,
              subtitle: subtitle,
              image_url: image_url,
              buttons: buttons
            }
          ]
        }
      }
    };

    return response;
  }

  static genGenericCarousel(cards) {
    let response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: cards
        }
      }
    };

    return response;
  }

  static genNuxMessage(user) {
    let welcome = this.genText(
      i18n.__("get_started.welcome", {
        userName: user.name
      })
    );

    let guide = this.genText(i18n.__("get_started.guidance"));

    let curation = this.genQuickReply(i18n.__("get_started.help"), [
      {
        title: i18n.__("menu.suggestion"),
        payload: "CURATION"
      },
      {
        title: i18n.__("menu.help"),
        payload: "CARE_HELP"
      }
    ]);

    return [welcome, guide, curation];
  }

  static getVFMessage(user, message){

    return new Promise(async (resolve, reject) => {
      try {
        var reply = [];
        const axios = require('axios');
        
        // const apiKey = 'VF.DM.64fa295bb73b580008d71482.TLynxecU2SVgJG9n';
        const apiKey = config.VF_DM_API;
console.log("API KEY=>",apiKey)
        const userID = user.vfid; // Unique ID used to track conversation state
        const userInput = message; // User's message to your Voiceflow assistant

        const DMconfig = {
          tts: false,
          stripSSML: true,
        }
        
        let response = {};
        const request = message;
        // // DM API
        axios({
          method: 'POST',
          baseURL: 'https://general-runtime.voiceflow.com',
          url: `/state/user/${userID}/interact`,
          headers: {
            Authorization: apiKey,
          },
          data: {
            action: request,
            // request: {type: "button-fokiilhh"},
            config: DMconfig,
          },
        })
        .then((resp)=>{
          resp.data = resp.data.filter((object) => !['debug', 'flow', 'block', 'path', 'end'].includes(object.type));
          console.log(resp.data)
          for (let i = 0; i < resp.data.length; i++) {
            response = resp.data[i]
            if(response.type=='text'){
              reply.push(this.genText(response.payload.message));
            }else if(response.type=='choice'){
              var buttons = [];
              for (let button of response.payload.buttons) {
                if ( button.request.type.includes('path-') ) {
                  buttons.push({
                    type: "postback",
                    title: button.request.payload.label,
                    payload: button.request.type
                  }) 
                } else {
                  buttons.push({
                    type: "postback",
                    title: button.request.payload.label,
                    payload: button.request.payload.intent
                  }) 
                }
              }
              reply.push(this.genQuickReply("Please select an option", buttons))
            }else if(response.type=='cardV2'){
              var buttons = [];
              for(let button of response.payload.buttons ){
                buttons.push({type: "postback",title:button.name,payload:button.request.type});
              }
              reply.push(this.genGenericTemplate(
                response.payload.imageUrl,
                response.payload.title,
                response.payload.description.text,
                buttons 
              ))
            }else if(response.type=='carousel'){
              var cards = [];
              for(let card of response.payload.cards ){
                var card_buttons = [];
                for(let button of card.buttons ){
                  card_buttons.push({type: "postback", title:button.name, payload:button.request.type});
                }
                cards.push({
                  title: card.title,
                  subtitle: card.description.text,
                  image_url: card.imageUrl,
                  buttons: card_buttons
                })
              }
              reply.push(this.genGenericCarousel(cards))
            }else if(response.type=='visual'){
              if(response.payload.visualType == "image"){
                reply.push(this.genImage(response.payload.image ))
              }
            }
            
          }
          
          // reply.push(this.genImage(user.profilePic)) // WORKING
          // reply.push(this.genGenericTemplate(user.profilePic, "Title", "SubTitle", [{type: "postback",title:"T",payload:"a"}]))
          if (reply.length==0)  reply.push(this.genText("..."));
              
          resolve(reply);
    
        }).catch((error)=>console.log(error.response.data))
        
        //KB API
        // axios({
        //   method: 'POST',
        //   baseURL: 'https://general-runtime.voiceflow.com',
        //   url: `/knowledge-base/query`,
        //   headers: {
        //     Authorization: apiKey,
        //   },
        //   data: {
        //     question: userInput
        //   },
        // }).then((resp)=>{
        //   resolve([this.genText(resp.data.output)]);
        // })
      } catch (error) {
        reject(error);
      }
    });

  }
};
