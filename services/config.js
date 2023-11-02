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

// Use dotenv to read .env vars into Node
require("dotenv").config();

// Required environment variables
const ENV_VARS = [
  "PAGE_ID",
  "APP_ID",
  "PAGE_ACCESS_TOKEN",
  "APP_SECRET",
  "VERIFY_TOKEN"
];

module.exports = {
  // Messenger Platform API
  apiDomain: "https://graph.facebook.com",
  apiVersion: "v11.0",

  // Page and Application information
  pageId: process.env.PAGE_ID,
  appId: process.env.APP_ID,
  pageAccesToken: process.env.PAGE_ACCESS_TOKEN,
  appSecret: process.env.APP_SECRET,
  verifyToken: process.env.VERIFY_TOKEN,
  shopUrl: process.env.SHOP_URL || "https://www.originalcoastclothing.com",
  tokenUrl:process.env.TOKEN_URL,
  VF_DM_API: '',

  // URL of your app domain. Will be automatically updated.
  appUrl: process.env.APP_URL || "<App URL>",

  // Preferred port (default to 3000)
  port: process.env.PORT || 3000,

  // Optionally set a locale
  locale: process.env.LOCALE,
  // Base URL for Messenger Platform API calls
  get apiUrl() {
    return `${this.apiDomain}/${this.apiVersion}`;
  },

  // URL of webhook endpoint
  get webhookUrl() {
    return `${this.appUrl}/webhook`;
  },

  checkEnvVariables: function() {
    ENV_VARS.forEach(function(key) {
      if (!process.env[key]) {
        console.warn(`WARNING: Missing required environment variable ${key}`);
      }
    });
  },

  setPageToken: async function(recipient_id){
    let pageAcces = await fetch(`${this.tokenUrl}?object=ig_user&id=${recipient_id}`)
    let pageAccesToken = await pageAcces.json();
    console.log(pageAccesToken)
    this.pageAccesToken = pageAccesToken.data.token;
    this.VF_DM_API = pageAccesToken.data.vf_id;

  }
  
};
