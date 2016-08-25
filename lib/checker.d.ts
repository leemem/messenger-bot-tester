export interface CheckResult {
    type: ResponseTypes;
    state: boolean;
    error?: any;
}
export declare enum ResponseTypes {
    text = 0,
    sender_action = 1,
    quick_replies = 2,
    generic_template = 3,
    button_template = 4,
}
export declare function checkSendAPI(payload: any): CheckResult;
