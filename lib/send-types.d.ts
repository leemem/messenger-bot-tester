export interface QuickReply {
    content_type: string;
    title: string;
    payload: string;
}
export interface Button {
    type: string;
    title: string;
    payload?: string;
    url?: string;
}
export interface Item {
    title: string;
    subtitle?: string;
    image_url?: string;
    buttons?: Array<Button>;
}
export interface TextMessage {
    text: string;
}
export interface GenericPayload {
    template_type: string;
    elements: Array<Item>;
}
export interface ButtonPayload {
    template_type: string;
    text: string;
    buttons: Array<Button>;
}
export interface Attachement {
    type: string;
    payload: GenericPayload | ButtonPayload;
}
export interface Message {
    attachment?: Attachement;
    text?: string;
    quick_replies?: Array<QuickReply>;
    metadata?: string;
}
export interface Payload {
    recipient: {
        id?: string;
        phone_number?: string;
    };
    message?: Message;
    sender_action?: string;
    notification_type?: string;
}
export interface Response {
    recipient_id: string;
    message_id: string;
}
export interface Error {
    error: {
        message: string;
        type: string;
        code: Number;
        fbtrace_id: string;
    };
}
export interface FacebookUser {
    first_name: string;
    last_name: string;
    profile_pic: string;
    locale: string;
    timezone: number;
    gender: string;
}
