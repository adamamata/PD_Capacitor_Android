
export class CommunicationUsers {
    SPId?: string;
    UserId?: string;
}

export class CallEventSignalRModel {
    broadcastType?: string;
    data?: CommunicationUsers;
}