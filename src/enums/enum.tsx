export enum UserRoleEnum {
    Default = "Default",
    Admin = "Admin",
    ServiceProvider = "ServiceProvider",
    User = "User"
}

export enum CallTypeEnum {
    VideoCallTwoWay = 0,
    AudioCall = 1,
    VideoCallOneWay = 2,
    PhoneCall = 3,
}

export enum MediaStatusEnum {
    Default = 0,
    Sent = 1,
    Accepted = 2,
    Denied = 3
} 

export enum BroadcastTypeEnum
{
    NewInboxMessage = "NewInboxMessage",
    UserStatus = "UserStatus",
    FriendRequest = "FriendRequest",
    CommDisconnected = "CommDisconnected",
    PhoneCallConnecting = "PhoneCallConnecting",
    VideoCallTwoWayConnecting = "VideoCallTwoWayConnecting",
    VideoCallOneWayConnecting = "VideoCallOneWayConnecting",
    AudioCallConnecting = "AudioCallConnecting",
    CallDisconnecting = "CallDisconnecting",
}

export enum BroadcastTargetEnum
{
    Notification = "notification",
    CallConnected = "callConnected",
    CallDisconnecting = "callDisconnecting",
    CallDisconnected = "callDisconnected",
    PhoneCallInsufficientCredit = "phoneCallInsufficientCredit",
}

export enum RingtoneEnum {
    Incoming = "incoming-tone",
    MessageIncoming = "message-tone",
    MessageTyping = "writing-a-text-message-tone",
    Topup = "topup-tone"
}