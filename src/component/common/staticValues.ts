export enum serviceType {
    chat = "chat",
    audio = "audio",
    oneWayVideo = "oneWayVideo",
    twoWayVideo = "twoWayVideo",
    phone = "phone",
}

export const callSettingList = [
    { value: 'phone', lable: 'Phone Call', name: 'enablePhoneCall' },
    { value: 'audio', lable: 'Audio Call (Online calling)', name: 'enableAudioCall' },
    { value: 'oneWayVideo', lable: 'One-way Video Call (Block your video)', name: 'enableOneWayVideoCall' },
    { value: 'twoWayVideo', lable: 'Two-way Video Call (Show your video)', name: 'enableTwoWayVideoCall' }, ,
];

export const menuSettingList = [
    { value: serviceType.chat, lable: 'Chat', name: 'shortMessageUnitPrice' },
    { value: serviceType.phone, lable: 'Phone Call', name: 'phoneCallUnitPrice' },
    { value: serviceType.audio, lable: 'Audio Call', name: 'audioCallUnitPrice' },
    { value: serviceType.oneWayVideo, lable: 'One-way Video', name: 'videoCallOneWayUnitPrice' },
    { value: serviceType.twoWayVideo, lable: 'Two-way Video', name: 'videoCallTwoWayUnitPrice' },
]


