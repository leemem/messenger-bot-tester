import * as sendTypes from './send-types';
import * as apiCheck from 'api-check';

export interface CheckResult {
  type: ResponseTypes;
  state: boolean;
  error?: any;
}

export enum ResponseTypes {
  text,
  sender_action,
  quick_replies,
  generic_template,
  button_template,
}

export function checkSendAPI(payload: any): CheckResult {
  const checks: Array<CheckResult> = [
    checkTextMessage(payload),
    checkSenderAction(payload),
    checkQuickReplies(payload),
    checkGenericTemplate(payload),
    checkButtonTemplate(payload),
  ];
  const validChecks = checks.filter((result: CheckResult) => result.state === true);
  if (validChecks.length === 1) {
    return validChecks[0];
  }

  console.log(checks);
  return null;
}

function checkTextMessage(payload: any): CheckResult {
  const checker = apiCheck.shape({
    recipient: apiCheck.shape({
      id: apiCheck.string,
    }).strict,
    message: apiCheck.shape({
      text: apiCheck.string,
    }).strict,
    notification_type: apiCheck.string.optional,
  }).strict;
  
  const result = checker(payload);
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

function checkSenderAction(payload: any): CheckResult {
   const checkeSA = apiCheck.shape({
    recipient: apiCheck.shape({
      id: apiCheck.string,
    }).strict,
    sender_action: apiCheck.string,
  }).strict;

  const result = checkeSA(payload);
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

function checkQuickReplies(payload: any): CheckResult {
 const checker = apiCheck.shape({
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

  const result = checker(payload);
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

const buttonArray = 
  apiCheck.arrayOf(apiCheck.oneOfType([
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

function checkGenericTemplate(payload: any): CheckResult {
 const checker = apiCheck.shape({
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

  const result = checker(payload);
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

function checkButtonTemplate(payload: any): CheckResult {
 const checker = apiCheck.shape({
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

  const result = checker(payload);
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
