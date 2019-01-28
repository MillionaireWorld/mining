const Config = require("config");
var request = require('request-promise');
const { Api, JsonRpc, RpcError, JsSignatureProvider } = require('eosjs');
const fetch = require('node-fetch');                            // node only; not needed in browsers
const { TextDecoder, TextEncoder } = require('text-encoding');  // node, IE11 and IE Edge Browsers
const createHash = require('create-hash');

//the two below required to be modified.
const defaultPrivateKey = "please input your private key of eos account";  // for from account privatekey
const fromaccount = "please input your bet account "; //for from account 

//the below is optional.
const minedays = "30"; //days to mine
const betamount = "1"; //bet amount
const referreraccount = "bobinggame14"; //reffer account
const first_level_account = "bobinggame14"; //first level account

const signatureProvider = new JsSignatureProvider([defaultPrivateKey]);
const rpc = new JsonRpc('http://eos.greymass.com', { fetch });
const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

function transfer(from, to, quantity, type, seed, clientSeed, expiration_timestamp, referrer, first_level, signature) {
  (async () => {
    const result = await api.transact({
      actions: [{
        account: 'eosio.token',
        name: 'transfer',
        authorization: [{
          actor: from,
          permission: 'active',
        }],
        data: {
          from: from,
          to: to,
          quantity: Number(quantity).toFixed(4) + ' ' + type,
          memo: seed + '-' + clientSeed + '-' + expiration_timestamp + '-' + referrer + '-' + first_level + '-' + signature
        },
      }]
    }, {
        blocksBehind: 1,
        expireSeconds: 60,
      })
      .then(res => {
        console.log("success:", res);
      })
      .catch(e => {
        console.log("error:", e);
      })
  })();

}

/**
 * create client seed
 */
function getClientSeed(from) {
  let randomNumber = Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));
  return createHash('sha1').update(from + Date.now() + randomNumber).digest('hex');
}

function doTransfer() {
  // console.log("config.server_url:", Config.server_url);
  if(!Config.server_url){
    console.error("请运行 ./run.sh development 来设置开发环境");
    return;
  }
  var options = {
    method: 'POST',
    url: Config.server_url + '/api/v1/bet',
    body: {
      "referrer": referreraccount,
      json: "true"
    },
    json: true
  };
  request(options).then(body => {
    console.log("post to sign, /v1/bet, return:", body);


    // test data
    let from = fromaccount,
      to = 'bobinggame11',
      quantity = betamount,
      type = "EOS",
      clientSeed = getClientSeed(from),
      seed = body.seed,
      expiration_timestamp = body.expiration_timestamp,
      referrer = referreraccount,
      first_level = first_level_account;
      signature = body.signature;

    // console.log("=== data for transfer ===");
    // console.log("from:", from);
    // console.log("to:", to);
    // console.log("quantity:", quantity);
    // console.log("type:", type);
    // console.log("seed:", seed);
    // console.log("clientSeed:", clientSeed);
    // console.log("expiration_timestamp:", expiration_timestamp);
    // console.log("referrer:", referrer);
    // console.log("signature:", signature);
    console.log("now:", new Date());
    transfer(from, to, quantity, type, seed, clientSeed, expiration_timestamp, referrer, first_level, signature);
  })
}

let testSpanInSeconds = minedays * 3600 * 24;
let now = new Date();
let expire_time = now.setSeconds(now.getSeconds() + testSpanInSeconds);
let concurrentNum = 1;
let count = 0;

recCall = function(){
   setTimeout(oneSecondCall, 1000);
}

function oneSecondCall(){
    console.log("one second start");
    for(let i = 0; i < concurrentNum; i++ ){
      count++;
      console.log("current count:", count);
      doTransfer()
    }
    let n = new Date();
    if(n > expire_time){
      console.log("total:", count);
      return;
    } else {
      recCall()
    }
}

recCall();

