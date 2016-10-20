const checker = require('../lib/checker');

import { CheckResult, ResponseTypes } from '../lib/checker';
import { sender_action, text, image, audio, video, file, generic, button, receipt, quickreplies } from './sendapi';

import { expect } from 'chai';

describe('shapes', function(){
  it('sender_action', function() {
    const result:CheckResult = checker.checkSendAPI(sender_action);
    expect(result.type).to.equal(ResponseTypes.sender_action);
  });

  it('text', function(){
    const result:CheckResult = checker.checkSendAPI(text);
    expect(result.type).to.equal(ResponseTypes.text);
  });

  it('image', function(){
    const result:CheckResult = checker.checkSendAPI(image);
    expect(result.type).to.equal(ResponseTypes.image_attachment);
  });

  it('audio', function(){
    const result:CheckResult = checker.checkSendAPI(audio);
    expect(result.type).to.equal(ResponseTypes.audio_attachment);
  });

  it('video', function() {
    const result:CheckResult = checker.checkSendAPI(video);
    expect(result.type).to.equal(ResponseTypes.video_attachment);
  });

  it('file', function() {
    const result:CheckResult = checker.checkSendAPI(file);
    expect(result.type).to.equal(ResponseTypes.file_attachment);
  });

  it('generic template', function() {
    const result:CheckResult = checker.checkSendAPI(generic);
    expect(result.type).to.equal(ResponseTypes.generic_template);
  });

  it('button template', function() {
    const result:CheckResult = checker.checkSendAPI(button);
    expect(result.type).to.equal(ResponseTypes.button_template);
  });

  it('receipt template', function() {
    const result:CheckResult = checker.checkSendAPI(receipt);
    expect(result.type).to.equal(ResponseTypes.receipt_template);
  });

  it('quick replies', function() {
    const result:CheckResult = checker.checkSendAPI(quickreplies);
    expect(result.type).to.equal(ResponseTypes.quick_replies);
  });
});

describe('bad-shapes', function() {
  it('no button title', function() {
    const badButton = {
      "recipient":{
        "id":"USER_ID"
      },
      "message":{
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text":"What do you want to do next?",
            "buttons":[
              {
                "type":"web_url",
                "url":"https://petersapparel.parseapp.com",
                "title":""
              },
              {
                "type":"postback",
                "title":"Start Chatting",
                "payload":"USER_DEFINED_PAYLOAD"
              }
            ]
          }
        }
      }
    };
    const result:CheckResult = checker.checkSendAPI(badButton);
    expect(result).to.equal(null);
  });

  it('no template title', function() {
    const badButton = {
      "recipient":{
        "id":"USER_ID"
      },
      "message":{
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text":"",
            "buttons":[
              {
                "type":"web_url",
                "url":"https://petersapparel.parseapp.com",
                "title":"button"
              },
              {
                "type":"postback",
                "title":"Start Chatting",
                "payload":"USER_DEFINED_PAYLOAD"
              }
            ]
          }
        }
      }
    };
    const result:CheckResult = checker.checkSendAPI(badButton);
    expect(result).to.equal(null);
  });

  it('no buttons', function() {
    const badButton = {
      "recipient":{
        "id":"USER_ID"
      },
      "message":{
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text":"title",
            "buttons":[]
          }
        }
      }
    };
    const result:CheckResult = checker.checkSendAPI(badButton);
    expect(result).to.equal(null);
  });
});