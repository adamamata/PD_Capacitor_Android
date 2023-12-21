import { CallTypeEnum } from "../enums/enum";
import { ChatThreadModel } from "./chat-model";

export class CommunicationModel {
    id?: string;
    shortMessageUnitPrice?: number;
    audioCallUnitPrice?: number;
    videoCallUnitPrice?: number;
    videoCallOneWayUnitPrice?: number;
    callConnecting: CallConnectingModel | undefined;
}

export class CallConnectingModel {
    callType?: string;
    calleeUserId?: string;
}

export class CallConnectedResponseModel
{
    constructor(init?: Partial<CallConnectedResponseModel>) {
        if (init) {
            Object.assign(this, init);
        }
    }
    
    ascPhoneNumber?: string;
    callConnectedUser?: CallConnectedUserModel;
    chatThread?: ChatThreadModel
}

export class CallConnectedUserModel
{
    callerUserId?: string;
    callerDisplayName?: string;
    callerImageUrl?: string;
    callerCommunicationUserId?: string;
    callerPhoneNumber?: string;

    calleeCommunicationUserId?: string;
    calleeDisplayName?: string;
    calleeImageUrl?: string;
    calleeUserId?: string;
    calleePhoneNumber?: string;
}

export class AcceptIncomingCallModel extends CallConnectedResponseModel
{
    constructor(init?: Partial<AcceptIncomingCallModel>) {
        super(init);
    }
}