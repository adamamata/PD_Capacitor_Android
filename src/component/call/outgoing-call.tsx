import { Persona, PersonaSize, Stack } from '@fluentui/react';
import { isMobile } from 'react-device-detect';
import { connect, useSelector } from "react-redux";
import {
  FluentThemeProvider,
  OnRenderAvatarCallback,
  VideoGallery,
} from "@azure/communication-react";
import close from "../../assets/images/close.svg";
import { useEffect, useState } from 'react';
import { HubConnection } from '@microsoft/signalr';
import { auth_details } from '../../reducer/auth';
import { BroadcastTargetEnum, BroadcastTypeEnum, UserRoleEnum } from '../../enums/enum';
import { CallEventSignalRModel } from '../../models/signalR.model';
import { LOCALSTORE } from '../../constant/default';
import { prop } from 'fannypack';

export type OutgoingCallProps = {
  callerUserId: string;
  calleeUserId: string;
  /** Callee's Name */
  calleeName?: string;
  /** Callee's Avatar/Profile Image */
  calleeImageUrl?: string;
  onClosed: (handleCallConnected: any, handleCallDisconnected: any) => void;
};

const OutgoingCall = (props: OutgoingCallProps): JSX.Element => {
  const profile = useSelector(auth_details);
  
  const { callerUserId, calleeUserId, calleeName, calleeImageUrl, onClosed } = props;
  const [hubConnection, setHubConnection] = useState<HubConnection>();

  useEffect(() => {
    const connection: HubConnection = profile.connection;

    if (connection) {
      connection.on(BroadcastTargetEnum.CallConnected, handleCallConnected);
      connection.on(BroadcastTargetEnum.CallDisconnected, handleCallDisconnected);
    }

    setTimeout(() => {
      props.onClosed(handleCallConnected, handleCallDisconnected);
    }, 60000);
  }, [])

  const closeIndicator = (message: CallEventSignalRModel) => {
    const userRole = localStorage.getItem(LOCALSTORE.role) as any;
    
    if (userRole == UserRoleEnum.User && 
      message.broadcastType == BroadcastTypeEnum.PhoneCallConnecting &&
      message.data && message.data.UserId == callerUserId && message.data.SPId == calleeUserId) {
      props.onClosed(handleCallConnected, handleCallDisconnected);
    } 
  }
  
  const handleCallDisconnected = async (message: CallEventSignalRModel) => {
    closeIndicator(message);
  }

  // Force drop the call if has issue after 10s
  const handleCallConnected = async (message: CallEventSignalRModel) => {
    closeIndicator(message);
  }

  const onRenderAvatar: OnRenderAvatarCallback = (userId, options, defaultOnRender): JSX.Element => {
    return (
      <Stack className={"w-full h-full flex items-center justify-center relative callee-tile"}>
        <Persona className={"call-animation"}
          imageUrl={calleeImageUrl}
          text={calleeName}
          hidePersonaDetails={false}          
          secondaryText={"Phone call connecting"}
          size={PersonaSize.size100} />
      </Stack>
    );
  };

  return (
    <>
      <div className={'fixed flex items-center inset-0 z-50 outline-none focus:outline-none rounded-2xl w-[300px] h-[300px] m-auto' + (isMobile ? ' bg-violet-500' : '')}>
        <div className="flex justify-end text-xl font-bold text-black cursor-pointer z-50 absolute top-3.5 right-3.5"
                onClick={() => {props.onClosed(handleCallConnected, handleCallDisconnected)}}>
                <img src={close} alt="" />
              </div>
        {isMobile && (
          <FluentThemeProvider>
          <div className="absolute top-0 left-0 h-full w-full">
            <Stack className="bg-[#F8F3FD]-to-r from-[#061989]/90 to-[#7C688C]/90 h-full">
              <div className="h-full w-full bg-[#ffffff80]">
                <div className={ 'relative w-full h-full flex items-center video-gallery '}>
                  {<VideoGallery
                  layout="floatingLocalVideo"
                  localParticipant={{
                    userId: (calleeUserId) as string,
                    displayName: calleeName,
                    isMuted: false,
                  }}
                  showMuteIndicator={true}
                  onRenderAvatar={onRenderAvatar}
                  />}
                </div>
              </div>
            </Stack>
          </div>
        </FluentThemeProvider>
        )}
        {!isMobile && (
          <FluentThemeProvider>
          <div className="absolute top-0 left-0 h-full w-full">
            <Stack className="bg-[#F8F3FD]-to-r from-[#061989]/90 to-[#7C688C]/90 h-full">
              <div className="h-full w-full bg-[#ffffff80]">
                <div className={ 'relative w-full h-full flex items-center video-gallery '}>
                  {<VideoGallery
                  layout="floatingLocalVideo"
                  localParticipant={{
                    userId: calleeUserId,
                    displayName: calleeName,
                    isMuted: false,
                  }}
                  showMuteIndicator={true}
                  onRenderAvatar={onRenderAvatar}
                  />}
                </div>
              </div>
            </Stack>
          </div>
        </FluentThemeProvider>
        )}
      </div>
       <div className={ isMobile ? "bg-[#F8F3FD]-to-r from-[#061989]/90 to-[#7C688C]/90 fixed inset-0 z-40" : "opacity-50 fixed inset-0 z-40 bg-black"}></div>
    </>
  );
};

export default connect()(OutgoingCall);
