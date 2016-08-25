import * as express from 'express';
import * as rp from 'request-promise';
import * as Promise from 'bluebird'
import * as bodyParser from 'body-parser';
import * as util from 'util';
import * as _ from 'lodash';

import { checkSendAPI, ResponseTypes, CheckResult } from './checker';

import * as types from './webhook-types';
import * as sendTypes from './send-types';

import { Server } from 'http';

export class Tester {
    protected expressApp: express.Application;
    protected host: string;
    protected port: number;
    private expressInstance: Server;
    public expressPromise;
    public promise;
    private finalResolveFunction;
    private resolveFunction;
    private rejectFunction;
    private theScript: Script;
    private stepArray: Array<Message | Response>;
    private messagesCallbackFunction = null;

    constructor(portToListenOn: number, addressToSendTo: string) {
        this.host = addressToSendTo;
        this.port = portToListenOn;
        this.expressApp = express();
        this.expressApp.use(bodyParser.json());
        this.expressApp.get('/v2.6/:id', (req: express.Request, res) => {
            console.log('requesting', (<any>req.params).id);
            const user: sendTypes.FacebookUser = {
                first_name: 'user',
                last_name: 'last',
                profile_pic: 'http://none',
                locale: 'en_us',
                timezone: 0,
                gender: 'male',
            };
            res.send(user);
        })
        this.expressApp.get('/v2.6/me/thread_settings', (req: express.Request, res) => {
            console.log('thread_settings');
            res.send({});
        })
        this.expressApp.post('/v2.6/me/messages', this.messageResponse.bind(this));

        this.expressPromise = new Promise((resolve, reject) => {
            this.expressInstance = this.expressApp.listen(this.port, () => {
                console.log(`listening on ${this.port}`);
                setTimeout(function() {
                    resolve();
                }, 1000);
                
            });
        });
        
        return this;
    }

    private checkResponse(realResponse: any, parsedResponse: CheckResult, res: express.Response): void {
        const currentStep = this.stepArray[0];
        if (currentStep instanceof Response) {
            const _savedThis = this;
            this.stepArray.shift();
            console.log('checking the response...');
            this.promise = this.promise.then(() => new Promise((resolve) => {
                console.log(`create expect promise for ${(<any>currentStep).constructor.name}`);
                _savedThis.resolveFunction = resolve;
                console.log('currentStep', currentStep);

                console.log('checking type..');
                if (currentStep.type !== parsedResponse.type) {
                    return _savedThis.rejectFunction(new Error(`Script does not match response type, got '${ResponseTypes[parsedResponse.type]}' but expected '${ResponseTypes[currentStep.type]}'`));
                }
                
                console.log('checking contents..');
                if (currentStep.check(realResponse)) {
                    console.log('PERFECT');
                    res.sendStatus(200);
                    return resolve();
                }

                res.sendStatus(500);
                return _savedThis.rejectFunction(new Error(`Script does not match response expected`));

            }))
                .then(() => {
                    console.log('running next step...');
                    return _savedThis.runNextStep()
                });
        } else {
            this.rejectFunction(new Error(`Script does not have a response, but received one`));
            res.sendStatus(500);
        }
    }

    private runNextStep(): Response {
        let _savedThis = this;
        let nextStep: Message | Response;
        do {
            nextStep = this.stepArray.shift();

            if (typeof nextStep === 'undefined') {
                console.log('end of array');
                this.promise = this.promise.then(() => {
                    console.log('clear');
                    _savedThis.messagesCallbackFunction = null;
                    _savedThis.finalResolveFunction();
                });
                return null;
            }
            console.log('working on:', (<any>nextStep).constructor.name);

            if (nextStep instanceof Response) {
                const localStep: Response = nextStep;
                console.log(`expecting a ${(<any>localStep).constructor.name}`);
                this.stepArray.unshift(nextStep);
                break;
            } else if (nextStep instanceof Message) {
                const localStep: Message = nextStep;
                this.promise = this.promise.then(() => {
                    console.log('localStep', localStep);
                    return localStep.send(this.host);
                });
            } else {
                console.log(nextStep);
                this.promise = this.promise.then(() => Promise.reject(new Error('corrupt script')));
            }
        } while (nextStep instanceof Message)

        if (nextStep instanceof Response) {
            return nextStep;
        }

        return null;
    }

    private messageResponse(req: express.Request, res: express.Response) {
        const body = (<any>req).body;
        console.log(util.inspect(body, {depth:null}))

        if (this.messagesCallbackFunction !== null) {
            this.messagesCallbackFunction(req, res);
        } else {
            res.sendStatus(200);
        }
    }

    public runScript(script: Script): Promise<void> {
        let _savedThis: this = this;
        this.theScript = script;
        this.stepArray = _.clone(script.script);

        this.messagesCallbackFunction = (req: express.Request, res: express.Response) => {
            //send api
            const token: string = req.query.access_token;
            if (typeof token !== 'string') {
                return _savedThis.rejectFunction(new Error('Token must be included on all requests'));
            }

            const body = (<any>req).body;
            const parsedResponse = checkSendAPI(body);
            // console.log('response:', parsedResponse);

            if (parsedResponse === null || parsedResponse.type === null) {
                res.sendStatus(400);
                return _savedThis.rejectFunction(new Error('Bad response structure'));
            }

            if (parsedResponse.type === ResponseTypes.sender_action) {
                res.sendStatus(200);
                return;
            }

            _savedThis.checkResponse(body, parsedResponse, res);
        };

        return this.expressPromise.then(() => new Promise((resolve, reject) => {
            _savedThis.promise = Promise.resolve()
                .catch((err) => {
                    console.log('err in script run', err);
                });
            _savedThis.finalResolveFunction = resolve;
            _savedThis.rejectFunction = reject;
            _savedThis.runNextStep();
        }));
        // promise.finally(() => {
        //     console.log('stopped listening');
        //     this.expressInstance.close();
        // })        
    }
}

export class Script {
    private seq = 0;
    private sender: string;
    private recipient: string;
    public script: Array<Message | Response> = [];

    constructor(sender: string, recipient: string) {
        this.sender = sender.toString();
        this.recipient = recipient.toString();
    }

    public addTextMessage(text: string): this {
        this.script.push(new TextMessage(this.sender, this.recipient, this.seq++).create(text));
        return this;
    }

    public addDelay(delayMs: number): this {
        this.script.push(new DelayMessage(this.sender, this.recipient, 0).create(delayMs));
        return this;
    }

    public addPostbackMessage(payload: string): this {
        this.script.push(new PostbackMessage(this.sender, this.recipient, this.seq++).create(payload));
        return this;
    }

    public addRawResponse(responseInstance: Response): this {
        this.script.push(responseInstance);
        return this;
    }

    public addTextResponses(text: Array<string>): this {
        return this.addRawResponse(new TextResponse(text));
    }

    public addQuickRepliesResponse(text: Array<string> = [], buttonArray: Array<sendTypes.Button> = []): this {
        return this.addRawResponse(new QuickRepliesResponse(text, buttonArray));
    }

    public addButtonTemplateResponse(text: Array<string> = [], buttonArray: Array<sendTypes.Button> = []): this {
        return this.addRawResponse(new ButtonTemplateResponse(text, buttonArray));
    }

}

export class Message {
    public sender: string;
    public recipient: string;
    public seq: number;
    protected payload: types.TextMessage | types.Postback ;

    constructor(sender: string, recipient: string, seq: number) {
        this.sender = sender;
        this.recipient = recipient;
        this.seq = seq;
    }

    public send(host:string): Promise<void> {
        const payload = {
            url: host,
            qs: { },
            method: 'POST',
            json: this.export(),
        };
        // console.log(util.inspect(payload, {depth: null}));
        return Promise.resolve(rp(payload));
    }

    public export():types.pagePayload {
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
    }
}


class TextMessage extends Message {
    protected payload: types.TextMessage;
    public create(text: string): this {
        this.payload = {
            sender: {
                id: this.sender,
            },
            recipient: {
                id: this.recipient,
            },
            timestamp: (new Date).getTime(),
            message: {
                mid: `mid.${0}`,
                seq: this.seq,
                text: text,
            },
        };
        return this; 
    }
}

class DelayMessage extends Message {
    protected delay: number = 0;
    public create(delayMs: number): this {
        this.delay = delayMs;
        return this;
    }
    public send() {
        console.log(`delaying ${this.delay} ms`);
        return Promise.delay(this.delay);
    }
}

class PostbackMessage extends Message {
    protected payload: types.Postback;
    public create(payload: string): this {
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
    }
}

export class Response {
    check(payload: sendTypes.Payload): boolean {
        return true;
    }
    public type: ResponseTypes = null;
}

export class TextResponse extends Response {
    protected allowedPhrases: Array<string>;
    constructor(allowedPhrases: Array<string>) {
        super();
        this.allowedPhrases = allowedPhrases;
    }
    public type: ResponseTypes = ResponseTypes.text;

    check(payload:sendTypes.Payload): boolean {
        return super.check(payload) && _.includes(this.allowedPhrases, payload.message.text);
    }
}

export class QuickRepliesResponse extends TextResponse {
    protected buttons: Array<sendTypes.Button>;
    constructor(allowedPhraes: Array<string> = [], buttonArray: Array<sendTypes.Button> = []) {
        super(allowedPhraes);
        this.buttons = buttonArray;
    }
    public type: ResponseTypes = ResponseTypes.quick_replies;

    check(payload:sendTypes.Payload): boolean {
        const buttonsMatch = _.intersectionWith(this.buttons, payload.message.quick_replies, _.isEqual).length >= this.buttons.length;
        return super.check(payload) && buttonsMatch;
    }
}

export class ButtonTemplateResponse extends Response {
    protected allowedText: Array<string>;
    protected buttons: Array<sendTypes.Button>;
    constructor(allowedText: Array<string> = [], buttonArray: Array<sendTypes.Button> = []) {
        super();
        this.allowedText = allowedText;
        this.buttons = buttonArray;
    }
    public type: ResponseTypes = ResponseTypes.button_template;

    check(payload:sendTypes.Payload): boolean {
        const attachment = payload.message.attachment.payload as sendTypes.ButtonPayload;
        const textMatches = _.includes(this.allowedText, attachment.text);
        const buttonsMatch = _.intersectionWith(this.buttons, attachment.buttons, _.isEqual).length >= this.buttons.length;
        return super.check(payload) && textMatches && buttonsMatch;
    }
}

export class GenericTemplateResponse extends Response {
    protected _elementCount: number = -1;
    constructor() {
        super();
    }
    public type: ResponseTypes = ResponseTypes.generic_template;

    elementCount(equalTo: number): this {
        this._elementCount = equalTo;
        return this;
    }

    check(payload:sendTypes.Payload): boolean {
        const attachment = payload.message.attachment.payload as sendTypes.GenericPayload;
        const elementCount = this._elementCount === -1 ? true : this._elementCount === attachment.elements.length;
        return super.check(payload) && elementCount;
    }
}