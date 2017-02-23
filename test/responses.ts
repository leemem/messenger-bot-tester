const responses = require('../lib/responses');

import { sender_action, text, image, audio, video, file, generic, button, receipt, quickreplies } from './sendapi';
import { ResponseTypes } from '../lib/checker';
import { expect } from 'chai';

describe('responses', function(){
  it('text', function() {
    const response = (new responses.TextResponse([ text.message.text ]));
    expect(response.check(text)).to.equal(true);
    expect(response.type).to.equal(ResponseTypes.text);
  });

  it('image', function() {
    const response = (new responses.ImageResponse('https://petersapparel.com/img/shirt.png'));
    expect(response.check(image)).to.equal(true);
    expect(response.type).to.equal(ResponseTypes.image_attachment);
  });

  it('audio', function() {
    const response = (new responses.AudioResponse('https://petersapparel.com/bin/clip.mp3'));
    expect(response.check(audio)).to.equal(true);
    expect(response.type).to.equal(ResponseTypes.audio_attachment);
  });

  it('video', function() {
    const response = (new responses.VideoResponse('https://petersapparel.com/bin/clip.mp4'));
    expect(response.check(video)).to.equal(true);
    expect(response.type).to.equal(ResponseTypes.video_attachment);
  });

  it('file', function() {
    const response = (new responses.FileResponse('https://petersapparel.com/bin/receipt.pdf'));
    expect(response.check(file)).to.equal(true);
    expect(response.type).to.equal(ResponseTypes.file_attachment);
  });

  it('generic', function() {
    const response = (new responses.GenericTemplateResponse())
      .elementCount(generic.message.attachment.payload.elements.length);
    expect(response.check(generic)).to.equal(true);
    expect(response.type).to.equal(ResponseTypes.generic_template);
  });

  it('template', function() {
    const response = (new responses.GenericTemplateResponse())
        .elementCount(generic.message.attachment.payload.elements.length)
        .elements(generic.message.attachment.payload.elements);
    expect(response.check(generic)).to.equal(true);
    expect(response.type).to.equal(ResponseTypes.generic_template);
  });

  it('button', function() {
    const response = (new responses.ButtonTemplateResponse(
      [ button.message.attachment.payload.text ], 
      button.message.attachment.payload.buttons));
    expect(response.check(button)).to.equal(true);
    expect(response.type).to.equal(ResponseTypes.button_template);
  });

  it('receipt', function() {
    const response = (new responses.ReceiptTemplateResponse())
      .elementCount(receipt.message.attachment.payload.elements.length);
    expect(response.check(receipt)).to.equal(true);
    expect(response.type).to.equal(ResponseTypes.receipt_template);
  });

  it('quick replies', function() {
    const response = (new responses.QuickRepliesResponse(
      [ quickreplies.message.text ], 
      quickreplies.message.quick_replies));
    expect(response.check(quickreplies)).to.equal(true);
    expect(response.type).to.equal(ResponseTypes.quick_replies);
  });

});

