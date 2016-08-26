export const sender_action = {
  "recipient":{
    "id":"USER_ID"
  },
  "sender_action":"typing_on"
};

export const text = {
  "recipient":{
    "id":"USER_ID"
  },
  "message":{
    "text":"hello, world!"
  }
};

export const image = {
  "recipient":{
    "id":"USER_ID"
  },
  "message":{
    "attachment":{
      "type":"image",
      "payload":{
        "url":"https://petersapparel.com/img/shirt.png"
      }
    }
  }
};

export const audio = {
  "recipient":{
    "id":"USER_ID"
  },
  "message":{
    "attachment":{
      "type":"audio",
      "payload":{
        "url":"https://petersapparel.com/bin/clip.mp3"
      }
    }
  }
};

export const video = {
  "recipient":{
    "id":"USER_ID"
  },
  "message":{
    "attachment":{
      "type":"video",
      "payload":{
        "url":"https://petersapparel.com/bin/clip.mp4"
      }
    }
  }
};

export const file = {
  "recipient":{
    "id":"USER_ID"
  },
  "message":{
    "attachment":{
      "type":"file",
      "payload":{
        "url":"https://petersapparel.com/bin/receipt.pdf"
      }
    }
  }
};

export const generic = {
  "recipient":{
    "id":"USER_ID"
  },
  "message":{
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
          {
            "title":"Welcome to Peter\'s Hats",
            "image_url":"http://petersapparel.parseapp.com/img/item100-thumb.png",
            "subtitle":"We\'ve got the right hat for everyone.",
            "buttons":[
              {
                "type":"web_url",
                "url":"https://petersapparel.parseapp.com/view_item?item_id=100",
                "title":"View Website"
              },
              {
                "type":"postback",
                "title":"Start Chatting",
                "payload":"USER_DEFINED_PAYLOAD"
              }              
            ]
          }
        ]
      }
    }
  }
};

export const button = {
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
            "title":"Show Website"
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

export const receipt = {
  "recipient":{
    "id":"USER_ID"
  },
  "message":{
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"receipt",
        "recipient_name":"Stephane Crozatier",
        "order_number":"12345678902",
        "currency":"USD",
        "payment_method":"Visa 2345",        
        "order_url":"http://petersapparel.parseapp.com/order?order_id=123456",
        "timestamp":"1428444852", 
        "elements":[
          {
            "title":"Classic White T-Shirt",
            "subtitle":"100% Soft and Luxurious Cotton",
            "quantity":2,
            "price":50,
            "currency":"USD",
            "image_url":"http://petersapparel.parseapp.com/img/whiteshirt.png"
          },
          {
            "title":"Classic Gray T-Shirt",
            "subtitle":"100% Soft and Luxurious Cotton",
            "quantity":1,
            "price":25,
            "currency":"USD",
            "image_url":"http://petersapparel.parseapp.com/img/grayshirt.png"
          }
        ],
        "address":{
          "street_1":"1 Hacker Way",
          "street_2":"",
          "city":"Menlo Park",
          "postal_code":"94025",
          "state":"CA",
          "country":"US"
        },
        "summary":{
          "subtotal":75.00,
          "shipping_cost":4.95,
          "total_tax":6.19,
          "total_cost":56.14
        },
        "adjustments":[
          {
            "name":"New Customer Discount",
            "amount":20
          },
          {
            "name":"$10 Off Coupon",
            "amount":10
          }
        ]
      }
    }
  }
};

export const quickreplies = {
  "recipient":{
    "id":"USER_ID"
  },
  "message":{
    "text":"Pick a color:",
    "quick_replies":[
      {
        "content_type":"text",
        "title":"Red",
        "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED"
      },
      {
        "content_type":"text",
        "title":"Green",
        "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
      }
    ]
  }
};