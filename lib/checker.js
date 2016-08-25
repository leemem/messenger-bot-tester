"use strict";
var apiCheck = require('api-check');
(function (ResponseTypes) {
    ResponseTypes[ResponseTypes["text"] = 0] = "text";
    ResponseTypes[ResponseTypes["sender_action"] = 1] = "sender_action";
    ResponseTypes[ResponseTypes["quick_replies"] = 2] = "quick_replies";
    ResponseTypes[ResponseTypes["generic_template"] = 3] = "generic_template";
    ResponseTypes[ResponseTypes["button_template"] = 4] = "button_template";
})(exports.ResponseTypes || (exports.ResponseTypes = {}));
var ResponseTypes = exports.ResponseTypes;
function checkSendAPI(payload) {
    var checks = [
        checkTextMessage(payload),
        checkSenderAction(payload),
        checkQuickReplies(payload),
        checkGenericTemplate(payload),
        checkButtonTemplate(payload),
    ];
    var validChecks = checks.filter(function (result) { return result.state === true; });
    if (validChecks.length === 1) {
        return validChecks[0];
    }
    console.log(checks);
    return null;
}
exports.checkSendAPI = checkSendAPI;
function checkTextMessage(payload) {
    var checker = apiCheck.shape({
        recipient: apiCheck.shape({
            id: apiCheck.string,
        }).strict,
        message: apiCheck.shape({
            text: apiCheck.string,
        }).strict,
        notification_type: apiCheck.string.optional,
    }).strict;
    var result = checker(payload);
    if (typeof result === 'undefined') {
        return {
            type: ResponseTypes.text,
            state: true,
        };
    }
    // console.log(result);
    return {
        type: ResponseTypes.text,
        state: false,
        error: result,
    };
}
function checkSenderAction(payload) {
    var checkeSA = apiCheck.shape({
        recipient: apiCheck.shape({
            id: apiCheck.string,
        }).strict,
        sender_action: apiCheck.string,
    }).strict;
    var result = checkeSA(payload);
    if (typeof result === 'undefined') {
        return {
            type: ResponseTypes.sender_action,
            state: true,
        };
    }
    // console.log(result);
    return {
        type: ResponseTypes.sender_action,
        state: false,
        error: result,
    };
}
function checkQuickReplies(payload) {
    var checker = apiCheck.shape({
        recipient: apiCheck.shape({
            id: apiCheck.string,
        }).strict,
        message: apiCheck.shape({
            text: apiCheck.string,
            quick_replies: apiCheck.arrayOf(apiCheck.shape({
                content_type: apiCheck.oneOf(['text']),
                title: apiCheck.string,
                payload: apiCheck.string,
            }).strict),
        }),
        notification_type: apiCheck.string.optional,
    }).strict;
    var result = checker(payload);
    if (typeof result === 'undefined') {
        return {
            type: ResponseTypes.quick_replies,
            state: true,
        };
    }
    // console.log(result);
    return {
        type: ResponseTypes.quick_replies,
        state: false,
        error: result,
    };
}
var buttonArray = apiCheck.arrayOf(apiCheck.oneOfType([
    apiCheck.shape({
        type: apiCheck.oneOf(['postback', 'phone_number']),
        title: apiCheck.string,
        payload: apiCheck.string,
    }).strict,
    apiCheck.shape({
        type: apiCheck.oneOf(['web_url']),
        title: apiCheck.string,
        url: apiCheck.string,
    }).strict,
]));
function checkGenericTemplate(payload) {
    var checker = apiCheck.shape({
        recipient: apiCheck.shape({
            id: apiCheck.string,
        }).strict,
        message: apiCheck.shape({
            attachment: apiCheck.shape({
                type: apiCheck.oneOf(['template']),
                payload: apiCheck.shape({
                    template_type: apiCheck.oneOf(['generic']),
                    elements: apiCheck.arrayOf(apiCheck.shape({
                        title: apiCheck.string,
                        item_url: apiCheck.string.optional,
                        image_url: apiCheck.string.optional,
                        subtitle: apiCheck.string.optional,
                        buttons: buttonArray,
                    }).strict),
                }).strict,
            }).strict,
        }).strict,
        notification_type: apiCheck.string.optional,
    }).strict;
    var result = checker(payload);
    if (typeof result === 'undefined') {
        return {
            type: ResponseTypes.generic_template,
            state: true,
        };
    }
    // console.log(result);
    return {
        type: ResponseTypes.generic_template,
        state: false,
        error: result,
    };
}
function checkButtonTemplate(payload) {
    var checker = apiCheck.shape({
        recipient: apiCheck.shape({
            id: apiCheck.string,
        }).strict,
        message: apiCheck.shape({
            attachment: apiCheck.shape({
                type: apiCheck.oneOf(['template']),
                payload: apiCheck.shape({
                    template_type: apiCheck.oneOf(['button']),
                    text: apiCheck.string,
                    buttons: buttonArray,
                }).strict,
            }).strict,
        }).strict,
        notification_type: apiCheck.string.optional,
    }).strict;
    var result = checker(payload);
    if (typeof result === 'undefined') {
        return {
            type: ResponseTypes.button_template,
            state: true,
        };
    }
    // console.log(result);
    return {
        type: ResponseTypes.button_template,
        state: false,
        error: result,
    };
}
