"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var express = require('express');
var rp = require('request-promise');
var Promise = require('bluebird');
var bodyParser = require('body-parser');
var util = require('util');
var _ = require('lodash');
var checker_1 = require('./checker');
var Tester = (function () {
    function Tester(portToListenOn, addressToSendTo) {
        var _this = this;
        this.messagesCallbackFunction = null;
        this.host = addressToSendTo;
        this.port = portToListenOn;
        this.expressApp = express();
        this.expressApp.use(bodyParser.json());
        this.expressApp.get('/v2.6/:id', function (req, res) {
            console.log('requesting', req.params.id);
            var user = {
                first_name: 'user',
                last_name: 'last',
                profile_pic: 'http://none',
                locale: 'en_us',
                timezone: 0,
                gender: 'male',
            };
            res.send(user);
        });
        this.expressApp.get('/v2.6/me/thread_settings', function (req, res) {
            console.log('thread_settings');
            res.send({});
        });
        this.expressApp.post('/v2.6/me/messages', this.messageResponse.bind(this));
        this.expressPromise = new Promise(function (resolve, reject) {
            _this.expressInstance = _this.expressApp.listen(_this.port, function () {
                console.log("listening on " + _this.port);
                setTimeout(function () {
                    resolve();
                }, 1000);
            });
        });
        return this;
    }
    Tester.prototype.checkResponse = function (realResponse, parsedResponse, res) {
        var currentStep = this.stepArray[0];
        if (currentStep instanceof Response) {
            var _savedThis_1 = this;
            this.stepArray.shift();
            console.log('checking the response...');
            this.promise = this.promise.then(function () { return new Promise(function (resolve) {
                console.log("create expect promise for " + currentStep.constructor.name);
                _savedThis_1.resolveFunction = resolve;
                console.log('currentStep', currentStep);
                console.log('checking type..');
                if (currentStep.type !== parsedResponse.type) {
                    return _savedThis_1.rejectFunction(new Error("Script does not match response type, got '" + checker_1.ResponseTypes[parsedResponse.type] + "' but expected '" + checker_1.ResponseTypes[currentStep.type] + "'"));
                }
                console.log('checking contents..');
                if (currentStep.check(realResponse)) {
                    console.log('PERFECT');
                    res.sendStatus(200);
                    return resolve();
                }
                res.sendStatus(500);
                return _savedThis_1.rejectFunction(new Error("Script does not match response expected"));
            }); })
                .then(function () {
                console.log('running next step...');
                return _savedThis_1.runNextStep();
            });
        }
        else {
            this.rejectFunction(new Error("Script does not have a response, but received one"));
            res.sendStatus(500);
        }
    };
    Tester.prototype.runNextStep = function () {
        var _this = this;
        var _savedThis = this;
        var nextStep;
        var _loop_1 = function() {
            nextStep = this_1.stepArray.shift();
            if (typeof nextStep === 'undefined') {
                console.log('end of array');
                this_1.promise = this_1.promise.then(function () {
                    console.log('clear');
                    _savedThis.messagesCallbackFunction = null;
                    _savedThis.finalResolveFunction();
                });
                return { value: null };
            }
            console.log('working on:', nextStep.constructor.name);
            if (nextStep instanceof Response) {
                var localStep = nextStep;
                console.log("expecting a " + localStep.constructor.name);
                this_1.stepArray.unshift(nextStep);
                return "break";
            }
            else if (nextStep instanceof Message) {
                var localStep_1 = nextStep;
                this_1.promise = this_1.promise.then(function () {
                    console.log('localStep', localStep_1);
                    return localStep_1.send(_this.host);
                });
            }
            else {
                console.log(nextStep);
                this_1.promise = this_1.promise.then(function () { return Promise.reject(new Error('corrupt script')); });
            }
        };
        var this_1 = this;
        do {
            var state_1 = _loop_1();
            if (typeof state_1 === "object") return state_1.value;
            if (state_1 === "break") break;
        } while (nextStep instanceof Message);
        if (nextStep instanceof Response) {
            return nextStep;
        }
        return null;
    };
    Tester.prototype.messageResponse = function (req, res) {
        var body = req.body;
        console.log(util.inspect(body, { depth: null }));
        if (this.messagesCallbackFunction !== null) {
            this.messagesCallbackFunction(req, res);
        }
        else {
            res.sendStatus(200);
        }
    };
    Tester.prototype.runScript = function (script) {
        var _savedThis = this;
        this.theScript = script;
        this.stepArray = _.clone(script.script);
        this.messagesCallbackFunction = function (req, res) {
            //send api
            var token = req.query.access_token;
            if (typeof token !== 'string') {
                return _savedThis.rejectFunction(new Error('Token must be included on all requests'));
            }
            var body = req.body;
            var parsedResponse = checker_1.checkSendAPI(body);
            // console.log('response:', parsedResponse);
            if (parsedResponse === null || parsedResponse.type === null) {
                res.sendStatus(400);
                return _savedThis.rejectFunction(new Error('Bad response structure'));
            }
            if (parsedResponse.type === checker_1.ResponseTypes.sender_action) {
                res.sendStatus(200);
                return;
            }
            _savedThis.checkResponse(body, parsedResponse, res);
        };
        return this.expressPromise.then(function () { return new Promise(function (resolve, reject) {
            _savedThis.promise = Promise.resolve()
                .catch(function (err) {
                console.log('err in script run', err);
            });
            _savedThis.finalResolveFunction = resolve;
            _savedThis.rejectFunction = reject;
            _savedThis.runNextStep();
        }); });
        // promise.finally(() => {
        //     console.log('stopped listening');
        //     this.expressInstance.close();
        // })        
    };
    return Tester;
}());
exports.Tester = Tester;
var Script = (function () {
    function Script(sender, recipient) {
        this.seq = 0;
        this.script = [];
        this.sender = sender.toString();
        this.recipient = recipient.toString();
    }
    Script.prototype.addTextMessage = function (text) {
        this.script.push(new TextMessage(this.sender, this.recipient, this.seq++).create(text));
        return this;
    };
    Script.prototype.addDelay = function (delayMs) {
        this.script.push(new DelayMessage(this.sender, this.recipient, 0).create(delayMs));
        return this;
    };
    Script.prototype.addPostbackMessage = function (payload) {
        this.script.push(new PostbackMessage(this.sender, this.recipient, this.seq++).create(payload));
        return this;
    };
    Script.prototype.addRawResponse = function (responseInstance) {
        this.script.push(responseInstance);
        return this;
    };
    Script.prototype.addTextResponses = function (text) {
        return this.addRawResponse(new TextResponse(text));
    };
    Script.prototype.addQuickRepliesResponse = function (text, buttonArray) {
        if (text === void 0) { text = []; }
        if (buttonArray === void 0) { buttonArray = []; }
        return this.addRawResponse(new QuickRepliesResponse(text, buttonArray));
    };
    Script.prototype.addButtonTemplateResponse = function (text, buttonArray) {
        if (text === void 0) { text = []; }
        if (buttonArray === void 0) { buttonArray = []; }
        return this.addRawResponse(new ButtonTemplateResponse(text, buttonArray));
    };
    return Script;
}());
exports.Script = Script;
var Message = (function () {
    function Message(sender, recipient, seq) {
        this.sender = sender;
        this.recipient = recipient;
        this.seq = seq;
    }
    Message.prototype.send = function (host) {
        var payload = {
            url: host,
            qs: {},
            method: 'POST',
            json: this.export(),
        };
        // console.log(util.inspect(payload, {depth: null}));
        return Promise.resolve(rp(payload));
    };
    Message.prototype.export = function () {
        return {
            object: "page",
            entry: [
                {
                    id: this.recipient,
                    time: (new Date).getTime(),
                    messaging: [
                        this.payload,
                    ],
                },
            ],
        };
    };
    return Message;
}());
exports.Message = Message;
var TextMessage = (function (_super) {
    __extends(TextMessage, _super);
    function TextMessage() {
        _super.apply(this, arguments);
    }
    TextMessage.prototype.create = function (text) {
        this.payload = {
            sender: {
                id: this.sender,
            },
            recipient: {
                id: this.recipient,
            },
            timestamp: (new Date).getTime(),
            message: {
                mid: "mid." + 0,
                seq: this.seq,
                text: text,
            },
        };
        return this;
    };
    return TextMessage;
}(Message));
var DelayMessage = (function (_super) {
    __extends(DelayMessage, _super);
    function DelayMessage() {
        _super.apply(this, arguments);
        this.delay = 0;
    }
    DelayMessage.prototype.create = function (delayMs) {
        this.delay = delayMs;
        return this;
    };
    DelayMessage.prototype.send = function () {
        console.log("delaying " + this.delay + " ms");
        return Promise.delay(this.delay);
    };
    return DelayMessage;
}(Message));
var PostbackMessage = (function (_super) {
    __extends(PostbackMessage, _super);
    function PostbackMessage() {
        _super.apply(this, arguments);
    }
    PostbackMessage.prototype.create = function (payload) {
        this.payload = {
            sender: {
                id: this.sender,
            },
            recipient: {
                id: this.sender,
            },
            timestamp: (new Date).getTime(),
            postback: {
                payload: payload,
            },
        };
        return this;
    };
    return PostbackMessage;
}(Message));
var Response = (function () {
    function Response() {
        this.type = null;
    }
    Response.prototype.check = function (payload) {
        return true;
    };
    return Response;
}());
exports.Response = Response;
var TextResponse = (function (_super) {
    __extends(TextResponse, _super);
    function TextResponse(allowedPhrases) {
        _super.call(this);
        this.type = checker_1.ResponseTypes.text;
        this.allowedPhrases = allowedPhrases;
    }
    TextResponse.prototype.check = function (payload) {
        return _super.prototype.check.call(this, payload) && _.includes(this.allowedPhrases, payload.message.text);
    };
    return TextResponse;
}(Response));
exports.TextResponse = TextResponse;
var QuickRepliesResponse = (function (_super) {
    __extends(QuickRepliesResponse, _super);
    function QuickRepliesResponse(allowedPhraes, buttonArray) {
        if (allowedPhraes === void 0) { allowedPhraes = []; }
        if (buttonArray === void 0) { buttonArray = []; }
        _super.call(this, allowedPhraes);
        this.type = checker_1.ResponseTypes.quick_replies;
        this.buttons = buttonArray;
    }
    QuickRepliesResponse.prototype.check = function (payload) {
        var buttonsMatch = _.intersectionWith(this.buttons, payload.message.quick_replies, _.isEqual).length >= this.buttons.length;
        return _super.prototype.check.call(this, payload) && buttonsMatch;
    };
    return QuickRepliesResponse;
}(TextResponse));
exports.QuickRepliesResponse = QuickRepliesResponse;
var ButtonTemplateResponse = (function (_super) {
    __extends(ButtonTemplateResponse, _super);
    function ButtonTemplateResponse(allowedText, buttonArray) {
        if (allowedText === void 0) { allowedText = []; }
        if (buttonArray === void 0) { buttonArray = []; }
        _super.call(this);
        this.type = checker_1.ResponseTypes.button_template;
        this.allowedText = allowedText;
        this.buttons = buttonArray;
    }
    ButtonTemplateResponse.prototype.check = function (payload) {
        var attachment = payload.message.attachment.payload;
        var textMatches = _.includes(this.allowedText, attachment.text);
        var buttonsMatch = _.intersectionWith(this.buttons, attachment.buttons, _.isEqual).length >= this.buttons.length;
        return _super.prototype.check.call(this, payload) && textMatches && buttonsMatch;
    };
    return ButtonTemplateResponse;
}(Response));
exports.ButtonTemplateResponse = ButtonTemplateResponse;
var GenericTemplateResponse = (function (_super) {
    __extends(GenericTemplateResponse, _super);
    function GenericTemplateResponse() {
        _super.call(this);
        this._elementCount = -1;
        this.type = checker_1.ResponseTypes.generic_template;
    }
    GenericTemplateResponse.prototype.elementCount = function (equalTo) {
        this._elementCount = equalTo;
        return this;
    };
    GenericTemplateResponse.prototype.check = function (payload) {
        var attachment = payload.message.attachment.payload;
        var elementCount = this._elementCount === -1 ? true : this._elementCount === attachment.elements.length;
        return _super.prototype.check.call(this, payload) && elementCount;
    };
    return GenericTemplateResponse;
}(Response));
exports.GenericTemplateResponse = GenericTemplateResponse;
