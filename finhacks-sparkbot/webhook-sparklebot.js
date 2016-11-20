var http = require('http');
var https = require('https');
var request = require('request');
var fy = require("yahoo-finance");

var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();

//object for GET message details **HTTPS REQUIRED**
var optionsMessageDetailsOriginal = {
    url: "",
    method: 'GET',
    json: true,
    headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': 'Bearer OWIyNDZmZjAtMTI5OS00ODk5LWExMWUtZDA3NTQ2MzIzM2RiYWRhY2UxNGYtZjMw'
    }
};

var googleFinanceAPI = {
    host: 'finance.google.com',
    path: '',
    url: '',
    method: 'GET',
    json: true,
    headers: {
        'Content-Type': 'application/json; charset=utf-8',
    }
};


var MarkItOnDemandAPI = {
    host: 'dev.markitondemand.com/Api',
    path: '',
    url: '',
    method: 'GET',
    json: true,
    headers: {
        'Content-Type': 'application/json; charset=utf-8',
    }
};

var jsonParser = (bodyParser.json());

app.post('/', jsonParser, function(req, res) {
    var inJSONBody = req.body;
console.log("inJSONBody = "+ JSON.stringify(inJSONBody));
if ( inJSONBody.data.personEmail != "sparquelles@sparkbot.io")
{    console.log("processing a message for "+inJSONBody.data.personEmail);
var messageId = inJSONBody['data']['id'];
    console.log('messageId: ' + messageId);
var     optionsMessageDetails = optionsMessageDetailsOriginal;
    optionsMessageDetails['url'] = 'https://api.ciscospark.com/v1/messages/'+messageId;
    request.get(optionsMessageDetails, function(error, response, body) {
console.log("before response.get call");
console.log("optionsMessageDetails = "+ JSON.stringify(optionsMessageDetails));
console.log("msg text ="+ JSON.stringify(response));
        if (response.toJSON()['body']['text'] != undefined) {
console.log("passing: "+response.toJSON()['body']['text'] );
            fy.snapshot({ symbol: response.toJSON()['body']['text'] }, function (err, snapshot) {// console.log("error is "+err);
//console.log("recieved a quote of "+snapshot['ask']);
//console.log("body = "+JSON.stringify(body));
//console.log("manually aborting 1");
//process.exit();
            post_message(snapshot['ask'], body['id'], body['personId']/*inJSONBody['personEmail']*/);});
        }
    });
}})


function get_lookup_stock(stock_name) {
    if (stock_name === '') {
        console.log('no applicable stock name')
        return [];
    };
    MarkItOnDemandAPI['path'] = '/v2/Lookup/json?input=' + stock_name;
    console.log(MarkItOnDemandAPI['url'] = 'http://' + MarkItOnDemandAPI['host'] + MarkItOnDemandAPI['path']);
    MarkItOnDemandAPI['url'] = 'http://' + MarkItOnDemandAPI['host'] + MarkItOnDemandAPI['path'];
    request.get(MarkItOnDemandAPI, function(error, response, body) {
        console.log(response);
        console.log(response.toJSON()[0]["Symbol"]);
        console.log(response.toJSON());
        return response.toJSON()[0]["Symbol"];
    });
};


function get_stock_price(stock_code) {
    console.log(stock_code);
    stock_code = get_lookup_stock(stock_code);
    console.log(stock_code);
    var stocks_dict = new Array();
    for (var i = 0; i < stock_code.length; i++) {
        googleFinanceAPI['path'] = '/finance/info?client=ig&q=' + stock_code[i];
        googleFinanceAPI['url'] = 'https://' + googleFinanceAPI['host'] + googleFinanceAPI['path'];
        request.get(googleFinanceAPI, function(error, response, body) {
            console.log('text: ' + response.toJSON()['body']['text']);
        stocks_dict[stocks_dict[i]] = response.toJSON()[i]['l_cur'];
        });
        return stocks_dict;
    };
};



function post_message(message_text, roomid, personId) {
        var myJSONObject = {
//          "roomId": roomid,
"toPersonId": personId,
          "text": JSON.stringify(message_text),
        };
        request({
            url: "https://api.ciscospark.com/v1/messages",
            method: "POST",
            json: true,   // <--Very important!!!
            body: myJSONObject,
            headers: {
                    'Content-Type': "application/json; charset=utf-8",
                    'Authorization': "Bearer OWIyNDZmZjAtMTI5OS00ODk5LWExMWUtZDA3NTQ2MzIzM2RiYWRhY2UxNGYtZjMw"
            }
        }, function (error, response, body){
//                console.log("myJSONObject = "+JSON.stringify(myJSONObject));
//                console.log("MSGText ="+message_text);
//                console.log("roomId="+roomid);
                console.log("response error msg="+JSON.stringify(response['body']['message']));
//                console.log("response="+JSON.stringify(response['b));
//process.exit();
        });
}


app.listen(80, function() {
    console.log('-----------------------------------');
    console.log(' Example app listening on port 80!');
    console.log('-----------------------------------');
})
