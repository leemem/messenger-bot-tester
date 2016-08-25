import * as express from 'express';
import * as Promise from 'bluebird';
import { ResponseTypes } from './checker';
import * as types from './webhook-types';
import * as sendTypes from './send-types';
export declare class Tester {
    protected expressApp: express.Application;
    protected host: string;
    protected port: number;
    private expressInstance;
    expressPromise: any;
    promise: any;
    private finalResolveFunction;
    private resolveFunction;
    private rejectFunction;
    private theScript;
    private stepArray;
    private messagesCallbackFunction;
    constructor(portToListenOn: number, addressToSendTo: string);
    private checkResponse(realResponse, parsedResponse, res);
    private runNextStep();
    private messageResponse(req, res);
    runScript(script: Script): Promise<void>;
}
export declare class Script {
    private seq;
    private sender;
    private recipient;
    script: Array<Message | Response>;
    constructor(sender: string, recipient: string);
    addTextMessage(text: string): this;
    addDelay(delayMs: number): this;
    addPostbackMessage(payload: string): this;
    addRawResponse(responseInstance: Response): this;
    addTextResponses(text: Array<string>): this;
    addQuickRepliesResponse(text?: Array<string>, buttonArray?: Array<sendTypes.Button>): this;
    addButtonTemplateResponse(text?: Array<string>, buttonArray?: Array<sendTypes.Button>): this;
}
export declare class Message {
    sender: string;
    recipient: string;
    seq: number;
    protected payload: types.TextMessage | types.Postback;
    constructor(sender: string, recipient: string, seq: number);
    send(host: string): Promise<void>;
    export(): types.pagePayload;
}
export declare class Response {
    check(payload: sendTypes.Payload): boolean;
    type: ResponseTypes;
}
export declare class TextResponse extends Response {
    protected allowedPhrases: Array<string>;
    constructor(allowedPhrases: Array<string>);
    type: ResponseTypes;
    check(payload: sendTypes.Payload): boolean;
}
export declare class QuickRepliesResponse extends TextResponse {
    protected buttons: Array<sendTypes.Button>;
    constructor(allowedPhraes?: Array<string>, buttonArray?: Array<sendTypes.Button>);
    type: ResponseTypes;
    check(payload: sendTypes.Payload): boolean;
}
export declare class ButtonTemplateResponse extends Response {
    protected allowedText: Array<string>;
    protected buttons: Array<sendTypes.Button>;
    constructor(allowedText?: Array<string>, buttonArray?: Array<sendTypes.Button>);
    type: ResponseTypes;
    check(payload: sendTypes.Payload): boolean;
}
export declare class GenericTemplateResponse extends Response {
    protected _elementCount: number;
    constructor();
    type: ResponseTypes;
    elementCount(equalTo: number): this;
    check(payload: sendTypes.Payload): boolean;
}
