import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { connect, useDispatch, useSelector } from "react-redux";
import { CallClient, CallAgent, IncomingCall, DeviceManager, Call } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential, CommunicationUserIdentifier, CommunicationUserKind } from "@azure/communication-common";

import { auth_details, 
  reset_Call_State, 
  reset_States, 
  set_Call_Agent, 
  set_call_connected, 
  set_Chat_Count, 
  set_chat_data, 
  set_Connection, 
  set_endpoint, 
  set_Incoming_Call, 
  set_Incoming_User, 
  set_Thread_Id, 
  set_toggle_video_call,
  set_Token_Credential, 
  set_Total_Credit, 
  set_User_Identifier 
} from "../../reducer/auth";
import { acceptIncomingCall, detectIncomingCall, getConnection, getEndpoint, getSPProfileList, getTotalCredit, getUnReadAlldata } from "../../services/homeService";
import { LOCALSTORE } from "../../constant/default";
import IncomingAudioCall from "../../component/call/incoming-audio-call";
import IncomingVideoCall from "../call/incoming-video-call";
import { UserPublicProfileModel } from "../../models/user-public-profile";
import { BroadcastTargetEnum, CallTypeEnum, RingtoneEnum, UserRoleEnum } from "../../enums/enum";
import { toast, ToastContainer } from "react-toastify";
import { AcceptIncomingCallModel } from "../../models/communication-model";
import { fromFlatCommunicationIdentifier } from "@azure/communication-react";
import { ChatClient } from "@azure/communication-chat";
import { ChatMessageReceivedEvent } from "@azure/communication-signaling";
import { playRingTone, stopRingTone, updateNewMessageToChatList } from "../../functions/utilities";
import { reset_azure_communication_data } from "../../reducer/chatDataSlice";
import { HubConnection } from "@microsoft/signalr";
import { CallEventSignalRModel } from "../../models/signalR.model";

const AzureCallAgent: React.FC<any> = (props: any) => {
  const navigate = useNavigate();
  const persistDispatch = useDispatch();
  const userDetail = useSelector(auth_details);
  const accountData = userDetail.accountData;
  const userProfile = userDetail.user_profile;
  const incomingCall: IncomingCall = userDetail.incomingCall;
  const incomingCallUser: UserPublicProfileModel = userDetail.incomingCallUser;
    
  const [callType, setCallType] = useState(CallTypeEnum.AudioCall);
  const [isIncomingCall, setIncomingCallDialog] = useState(false);
  const [currentSPProfile, setCurrentSPProfile] = useState<any>();
  const [hubConnection, setHubConnection] = useState<HubConnection>();
  const [call, setCall] = useState<Call>();
  const [isTabActive, setIsTabActive] = useState<boolean>();

  const spProfiles: string[] = [];

  // Init SignalR connection
  
  useEffect(() => {
    try {
      if (!userDetail?.login?.isSuccess) {
        if (!!hubConnection) {
          hubConnection.off(BroadcastTargetEnum.CallDisconnected, handleCallDisconnected);
          hubConnection.off(BroadcastTargetEnum.CallDisconnecting, handleCallDisconnecting);
          hubConnection.off(BroadcastTargetEnum.PhoneCallInsufficientCredit, handlePhoneCallInsufficientCredit);
        }
        return;
      }
      
      initSignalRConnection();
      initNotification();
      getunreadCount();

      const userRole = localStorage.getItem(LOCALSTORE.role) as any;
      if (userRole == UserRoleEnum.ServiceProvider) {
        getProfiles();
      } else {
        const communicationToken = localStorage.getItem(LOCALSTORE.communicationIdentifier.token) as any;
        const communicationUserId = localStorage.getItem(LOCALSTORE.communicationIdentifier.userId) as any;
        const expiredOn = localStorage.getItem(LOCALSTORE.communicationIdentifier.expiredOn);

        validate(communicationToken, communicationUserId, expiredOn);
        userInit(communicationToken, communicationUserId);
      }
    } catch (err) {
      // toast.error("Create call agent failed, please refresh the page.", { theme: "colored", autoClose: 3000 });
      console.log(err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDetail?.login?.isSuccess]);

  useEffect(() => {
    setCall(userDetail.call);
  }, [userDetail.call])

  useEffect(() => {
    window.onfocus = function () { 
      setIsTabActive(true);
   }; 
   
   window.onblur = function () { 
     setIsTabActive(false);
   }; 

    const onBeforeUnload = (ev: any) => {
      hangUpOrRejectCall();
    }

    window.addEventListener("beforeunload", onBeforeUnload);

    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const hangUpOrRejectCall = () => { 
    if (userDetail.call && typeof userDetail.call.hangUp === 'function') {
      userDetail.call.hangUp({forEveryone : true}).then();
    } else {
      if (userDetail.incomingCall && typeof userDetail.incomingCall.reject === 'function') {
        userDetail.incomingCall.reject().then();
      }
    }
  }

  const getunreadCount = () => {
    const { dispatch } = props;
    dispatch(getUnReadAlldata())
      .then((res: any) => {
        // setCount(res?.data?.data);
        dispatch(set_Chat_Count(res?.data?.data));
      })
      .catch((err: any) => {});
  };


  async function dropTheCall(message: CallEventSignalRModel) {
    const userRole = localStorage.getItem(LOCALSTORE.role) as any;
    
    if (message.data 
      && (userRole == UserRoleEnum.ServiceProvider && message.data.SPId && spProfiles.indexOf(message.data.SPId) >= 0
      || userRole == UserRoleEnum.User && message.data.UserId == userProfile.id)) {
        hangUpOrRejectCall();
        if (window.location.pathname.indexOf('/outgoing-call') >= 0) {
          navigate(-1);
        }
      }
  }

  // Force drop the call if has issue after 3s
  const handleCallDisconnected = async (message: CallEventSignalRModel) => {
    setTimeout(() => {
      dropTheCall(message);
    }, 3000);
  }

  const handleCallDisconnecting = async (message: CallEventSignalRModel) => {
    dropTheCall(message);
  }

  const handlePhoneCallInsufficientCredit = async (message: CallEventSignalRModel) => {
    const userRole = localStorage.getItem(LOCALSTORE.role) as any;
    
    if (message.data && (userRole == UserRoleEnum.User && message.data?.UserId == userProfile.id)) {
        toast.error("Your call has been disconnected since you do not have the minimum amount of credits needed. Please top up to continue.", {
          theme: "colored",
          autoClose: 3000,
        });
      }
  }

  const initNotification = () => {
    if (("Notification" in window)) {
      try {
        if (Notification.permission !== "granted") {
          Notification.requestPermission().then((permission) => {
            console.log(permission);
          }, (err) => {
            console.log(err);
          });
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      // Check if the browser supports notifications
      console.log("This browser does not support notification");
    }    
  }

  const initSignalRConnection = () => {
    const { dispatch } = props;
    const connection = getConnection();
    dispatch(set_Connection(connection));
    setHubConnection(connection);
    connection.on(BroadcastTargetEnum.CallDisconnected, handleCallDisconnected);
    connection.on(BroadcastTargetEnum.CallDisconnecting, handleCallDisconnecting);
    connection.on(BroadcastTargetEnum.PhoneCallInsufficientCredit, handlePhoneCallInsufficientCredit);
    connection.start().then(() => {
      console.log('Hub connection started');
    }, (err) => {
      console.log(err);
    });
  }

  const initCall = (profile: any, communicationToken: string, communicationUserId: string) => {
    const { dispatch } = props;
    const tokenCredential = new AzureCommunicationTokenCredential(communicationToken);
    const userIdentifier = fromFlatCommunicationIdentifier(communicationUserId) as CommunicationUserIdentifier;
    const threadId = localStorage.getItem(LOCALSTORE.communicationIdentifier.threadId);

    dispatch(set_Token_Credential(tokenCredential));
    dispatch(set_User_Identifier(userIdentifier));
    dispatch(set_Thread_Id(threadId));

    const callClient = new CallClient();
    callClient.createCallAgent(tokenCredential).then((callAgent: CallAgent) => {
      subscribeIncomingCall(profile, callAgent, callClient);
    });

    subscribeIncomingMessage(tokenCredential, communicationUserId, profile);
  }

  const userInit = (communicationToken: string, communicationUserId: string) => {
    const { dispatch } = props;

    const tokenCredential = new AzureCommunicationTokenCredential(communicationToken);
    const userIdentifier = fromFlatCommunicationIdentifier(communicationUserId) as CommunicationUserIdentifier;
    const threadId = localStorage.getItem(LOCALSTORE.communicationIdentifier.threadId);

    dispatch(set_Token_Credential(tokenCredential));
    dispatch(set_User_Identifier(userIdentifier));
    dispatch(set_Thread_Id(threadId))

    const callClient = new CallClient();
    callClient.createCallAgent(tokenCredential).then((callAgent: CallAgent) => {
      dispatch(set_Call_Agent(callAgent));
    });
    subscribeIncomingMessage(tokenCredential, communicationUserId, null);
  }

  const getProfiles = () => {
    const { dispatch } = props;
    dispatch(getSPProfileList()).then((result: any) => {      
      result.data.forEach((p: any) => {
        spProfiles.push(p.id);
        initCall(p, p.communicationIdentifier.token, p.communicationIdentifier.user_id);
      });
    })
  }
  
  const updateCredit = () => {
    const { dispatch } = props;
    const userRole = localStorage.getItem(LOCALSTORE.role) as any;
    let userId;

    if (userRole == UserRoleEnum.ServiceProvider) 
      userId = accountData.id
    else   
      userId = userProfile.id

    if(userId || userDetail?.totalCredit?.accountId) {
      dispatch(getTotalCredit(userId ? userId : userDetail?.totalCredit?.accountId)).then((credit: any) => {
        dispatch(set_Total_Credit(credit?.data))
      })
    }
  };

  const logoutData = () => {
    const userRole = localStorage.getItem(LOCALSTORE.role) as any;
    const {dispatch} = props;
    window.localStorage.clear();
    dispatch(reset_States(null));
    persistDispatch(reset_azure_communication_data())
    
    if (userRole == UserRoleEnum.ServiceProvider) {
      window.location.href = "/login";
    } else {
      window.location.href = "/login";
    }    
  };

  const validate = (communicationToken: string, communicationUserId: string, expiredOn: string | null) => {
    if (communicationToken == null || communicationUserId == null) {
      toast.error("Communication Id not found, please contact to admin for supporting", { theme: "colored", autoClose: 3000 });
      logoutData();
      return;
    }

    if (!expiredOn) {
      logoutData();
    } else {
      const expiredDate = new Date(expiredOn);
      const now = new Date();
      if (expiredDate.getTime() - now.getTime() <= 0) {
        logoutData();
      }
    }
  }

  const subscribeIncomingMessage = (tokenCredential: AzureCommunicationTokenCredential, communicationUserId: string, profile: any) => {
    const { dispatch } = props;
    dispatch(getEndpoint())
    .then( async (res: any) => {
      dispatch(set_endpoint(res.data.data));
      const endpoint = res.data.data;
      const chat = new ChatClient(endpoint, tokenCredential);
      await chat.startRealtimeNotifications();

      chat.on("chatMessageReceived", (event) => handleChatMessageReceived(event, communicationUserId, profile));
      chat.on("chatMessageEdited", handleChatMessageUpdated);
    });
  }
  
  function handleChatMessageReceived(event: ChatMessageReceivedEvent, communicationUserId: string, profile: any) {
    // updateNewMessageToChatList(event, props, userDetail.chatThreads, userDetail.chatData);
    const userRole = localStorage.getItem(LOCALSTORE.role) as any;
    const sender = event.sender as CommunicationUserKind;

    if (sender.communicationUserId == communicationUserId) {
      // Update Credit to SPs when they finish a round of chat
      if (userRole == UserRoleEnum.ServiceProvider) {
        updateCredit();
      }
      return;
    }
    
    playRingTone(RingtoneEnum.MessageIncoming).then();
    
    // Update Credit to SPs when they get message with metadata (GIFT | MEDIA)
    // OR Update Credit to Users when they finish a round of chat 
    if (userRole == UserRoleEnum.ServiceProvider && Object.getOwnPropertyNames(event.metadata).length > 0
    || userRole == UserRoleEnum.User) {
      updateCredit();
    }
    
    getunreadCount();
    
    if (profile) {
      notifyMe(`${event.senderDisplayName} to ${profile.username}: ${event.message}`);
    } else {
      notifyMe(`${event.senderDisplayName}: ${event.message}`);
    }

  }
  
  function notifyMe(message: string) {
    if (!("Notification" in window)) {
      console.log("This browser does not support notification");
    } else if (Notification.permission === "granted") {
      new Notification("PhoneDarling", {
        icon: `${process.env.PUBLIC_URL}/phoneDarlingsFavIcon.svg`,
        body: message,
      });   
    }
  }

  function handleChatMessageUpdated(event: ChatMessageReceivedEvent) {
    // updateNewMessageToChatList(event, props, userDetail.chatThreads, userDetail.chatData);
    const userRole = localStorage.getItem(LOCALSTORE.role) as any;
    
    // Update Credit to SPs when they get message with metadata
    if (userRole == UserRoleEnum.ServiceProvider && Object.getOwnPropertyNames(event.metadata).length > 0) {
      updateCredit();
    }
  }

  const handleEndCall = () => {
    stopRingTone(RingtoneEnum.Incoming);
  }

  const incomingCallListener = async (profile: any, incomingC: IncomingCall, agent: CallAgent) => {
    const { dispatch } = props;
    try {
      const identifier =  incomingC.callerInfo.identifier as CommunicationUserKind
      const body = {
        incomingCommunicationUserId: identifier.communicationUserId,
      };
      
      incomingC.on("callEnded", handleEndCall);

      dispatch(detectIncomingCall(body, profile.id))
        .then(async (res: any) => {
          if (!res.data.isSuccess) {
            resetData();
            await incomingC.reject();
            incomingC.off("callEnded", handleEndCall);
            toast.error(res.data.message, {
                theme: "colored",
                autoClose: 3000,
            });
            return;
          }
          
          dispatch(set_Call_Agent(agent));
          dispatch(set_Incoming_User(res.data.data));
          dispatch(set_Incoming_Call(incomingC));          
          const ct = CallTypeEnum[res.data.data.communication.callConnecting.callType as keyof typeof CallTypeEnum];
          setCallType(ct);
          setCurrentSPProfile(profile);
          setIncomingCallDialog(true);
          
          notifyMe(
`${res.data.data.username} is calling to ${profile.username}
via ${ct == CallTypeEnum.VideoCallOneWay ? "One Way Video Call" : (ct == CallTypeEnum.VideoCallTwoWay ? "Video Call" : "Voice Call")}`);
        })
        .catch(async (err: any) => {
          resetData();
          await incomingC.reject();
          incomingC.off("callEnded", handleEndCall);
          toast.error(err.response.data.message, {
              theme: "colored",
              autoClose: 3000,
          });
        });
      
    } catch (error: any) {
      resetData();
      toast.error(error, { theme: "colored", autoClose: 3000 });
      await incomingC.reject();
      incomingC.off("callEnded", handleEndCall);
    }
  }

  function callEndListener() {
    resetData();
  }

  const subscribeIncomingCall = (profile: any, agent: CallAgent, callClient: CallClient) => {
    // Listen for an incoming call to accept.
    agent.on("incomingCall", (args) => {
      incomingCallListener(profile, args.incomingCall, agent);
      args.incomingCall.on("callEnded", callEndListener);
    });
  };

  const onAcceptCall = (profile: any, isVideoToggle?: boolean) => {
    const { dispatch } = props;
    setIncomingCallDialog(false);
    stopRingTone(RingtoneEnum.Incoming);
    dispatch(acceptIncomingCall(incomingCallUser?.id, profile.id))
      .then(async (res: any) => {
        if (res?.data?.isSuccess) {
          const acceptIncomingCall : AcceptIncomingCallModel = res?.data.data;
          dispatch(set_toggle_video_call(isVideoToggle));
          dispatch(set_chat_data(acceptIncomingCall.chatThread));
          dispatch(set_call_connected(acceptIncomingCall.callConnectedUser));
          let callType = '';
          if (incomingCallUser?.communication?.callConnecting?.callType) {
            const callTypeEnum = CallTypeEnum[(incomingCallUser.communication.callConnecting.callType) as keyof typeof CallTypeEnum];
            if (callTypeEnum == CallTypeEnum.VideoCallTwoWay) {
              callType = 'video';
            } else if (callTypeEnum == CallTypeEnum.VideoCallOneWay) {
              callType = 'video-one-way';
            } else if (callTypeEnum == CallTypeEnum.AudioCall) {
              callType = 'voice';
            } 
          }

          incomingCall.off("callEnded", callEndListener);

          let role = 'user';
          if (incomingCallUser.role == UserRoleEnum.User) {
            role = 'consultant';
          }

          navigate(`/${role}/incoming-call/${callType}/${acceptIncomingCall.callConnectedUser?.callerUserId}`);
        }
      })
      .catch((err: any) => {
        toast.error(err.response.data.message, { theme: "colored", autoClose: 3000 });
        incomingCall.reject();
        resetData();
      });
  };

  const onRejectCall = async () => {
    stopRingTone(RingtoneEnum.Incoming);
    
    if (!incomingCallUser) {
      toast.error("Cannot detect caller user", { theme: "colored", autoClose: 3000 });
      resetData();

      return;
    }

    
    await incomingCall.reject();
    incomingCall.off("callEnded", handleEndCall);
    resetData();
  };

  const resetData = () => {
    const { dispatch } = props;
    dispatch(reset_Call_State(null));
    dispatch(set_Call_Agent(null));
    setIncomingCallDialog(false);
  }

  return (
    <div className=" w-full bg-center">
      <ToastContainer />
      <audio id="message-tone" hidden>
        <source type="audio/mpeg"></source>
      </audio>
      <audio id="writing-a-text-message-tone" hidden>
        <source type="audio/mpeg"></source>
      </audio>
      <audio id="top-up-alert" hidden>
        <source type="audio/mpeg"></source>
      </audio>
      <audio id="outgoing-tone" hidden>
        <source type="audio/mpeg"></source>
      </audio>
      <audio hidden={true} id="incoming-tone">
        <source type="audio/mpeg"></source>
      </audio>
      {isIncomingCall && callType != CallTypeEnum.VideoCallTwoWay && (
        <IncomingAudioCall
          callerName={incomingCallUser?.username}
          calleeName={currentSPProfile?.username}
          avatar={incomingCallUser?.profileImageUrl}
          currentSPProfile={currentSPProfile}
          alertText={callType == CallTypeEnum.VideoCallOneWay ? "Incoming One Way Video Call" : "Incoming Voice Call"}
          onClickAccept={onAcceptCall}
          onClickReject={onRejectCall}
        />
      )}
      {isIncomingCall && callType == CallTypeEnum.VideoCallTwoWay && (
        <IncomingVideoCall
          callerName={incomingCallUser.username}
          calleeName={currentSPProfile?.username}
          avatar={incomingCallUser.profileImageUrl}
          currentSPProfile={currentSPProfile}
          alertText={"Incoming Video Call"}
          onClickAccept={onAcceptCall}
          onClickReject={onRejectCall}
        />
      )}
      </div>
  );
};

export default connect()(AzureCallAgent);
