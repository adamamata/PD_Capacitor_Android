import { UserRoleEnum } from "../enums/enum";
import { CallConnectingModel, CommunicationModel } from "./communication-model";

export class UserPublicProfileModel {
    id: string | undefined;
    role: UserRoleEnum | undefined;
    created: Date | undefined;
    username: string | undefined;
    name: string | undefined;
    profileImageUrl: string | undefined;
    description: string | undefined;
    age: number | undefined;
    credit: number | undefined;
    enableVoiceAndVideo: boolean | undefined;
    isBusy: boolean | undefined;
    doNotDisturb : boolean | undefined;
    communication: CommunicationModel | undefined;
    fee: number | undefined;

    constructor(init?: Partial<UserPublicProfileModel>) {
        if (init)
        Object.assign(this, init);
    }
}