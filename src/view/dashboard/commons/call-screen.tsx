import React, { useEffect, useState } from "react";
import { useSelector, connect } from "react-redux";
import {
  FluentThemeProvider,
  CameraButton,
  ControlBar,
  EndCallButton,
  MicrophoneButton,
  OnRenderAvatarCallback,
  CustomAvatarOptions,
  ScreenShareButton,
  VideoGallery,
  VideoGalleryLocalParticipant,
  VideoGalleryRemoteParticipant,
  OptionsDevice,
} from "@azure/communication-react";
import { Persona, PersonaSize, Stack } from "@fluentui/react";
import { AcceptCallOptions, Call, CallAgent, CallClient, CallState, DeviceManager, IncomingCall, LocalVideoStream, RemoteParticipant, RemoteVideoStream, StartCallOptions, VideoDeviceInfo, VideoOptions, VideoStreamRenderer, VideoStreamRendererView } from "@azure/communication-calling";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { CallVideoIcon, CallVideoOffIcon, MicOffIcon, 
  MicIcon, CallEndIcon, CallControlPresentNewIcon, 
  CallControlStopPresentingNewIcon, GroupVideoCallGridIcon, 
  FluidIcon, FilesTxtIcon, FilesEmptyIcon, SwitchCameraIcon } from '@fluentui/react-northstar';
import { isMobile, isTablet } from 'react-device-detect';

import { CallConnectedResponseModel, CallConnectedUserModel } from "../../../models/communication-model";
import { auth_details, reset_Call_State, set_Call, set_chat_data, set_Show_Chat, set_Total_Credit } from "../../../reducer/auth";
import { callConnecting, endCall, endCallImmediately, getTotalCredit, missedCall, missedCallImmediately, updateCallConnected, validateInsufficientCredit } from "../../../services/homeService";
import { createLocalVideoStream, displayLocalVideoStream, outgoingRing, removeLocalVideoStream, stopOutgoingRing } from "../../../functions/call-functions";
import TopUpModal from "../user/topUpModal";
import { UserPublicProfileModel } from "../../../models/user-public-profile";
import { getValue, playRingTone } from "../../../functions/utilities";
import { CallTypeEnum, RingtoneEnum, UserRoleEnum } from "../../../enums/enum";
import StickyNotes from "./sticky-notes";
import { ChatThreadModel } from "../../../models/chat-model";
import { isDesktop, isSafari } from "react-device-detect";
import { LOCALSTORE } from "../../../constant/default";

const CallScreen: React.FC<any> = (props: any) => {
  const { direction, type, participantUserId } = useParams();
  const navigate = useNavigate();

  const authDetails = useSelector(auth_details);
  const userProfile = authDetails.user_profile;
  const accountData = authDetails.accountData;
  const callType: CallTypeEnum = 
    type == 'video' ? CallTypeEnum.VideoCallTwoWay 
    : (type == 'video-one-way' ? CallTypeEnum.VideoCallOneWay 
    : CallTypeEnum.AudioCall);

  const callAgent: CallAgent = authDetails?.callAgent;
  const incomingCallUser: UserPublicProfileModel = authDetails?.incomingCallUser;
  const incomingCall: IncomingCall = authDetails?.incomingCall;

  const [outgoingCall, setOutgoingCall] = useState<Call>();

  const [wakeLock, setWakeLock] = useState<any>();
  const [callState, setCallState] = useState<CallState>("None");
  const [cameraToggle, setCameraToggle] = useState<boolean>((type == 'video' || type == 'video-one-way') && authDetails?.toggleVideoCall);
  const [shareScreenToggle, setShareScreenToggle] = useState<boolean>(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [selectedCamera, setSelectedCamera] = useState<VideoDeviceInfo>();
  const [isShowNote, setIsShowNote] = useState<boolean>(false);
  const [chatThread, setChatThread] = useState<ChatThreadModel>();
  const [layoutToggle, setLayoutToggle] = useState<boolean>(true);
  const [microphoneToggle, setMicrophoneToggle] = useState<boolean | undefined>(true);
  const [callConnected, setCallConnected] = useState<CallConnectedUserModel>();
  const [deviceManager, setDeviceManager] = useState<DeviceManager>();
  const [localVideoContainer, setLocalVideoContainer] = useState<HTMLDivElement>();
  const [remoteVideoContainer, setRemoteVideoContainer] = useState<HTMLDivElement>();
  const [screenSharingContainer, setScreenSharingContainer] = useState<HTMLDivElement>();
  
  const [speakerOptions, setSpeakerOptions] = useState<OptionsDevice[]>();
  const [microphoneOptions, setMicrophoneOptions] = useState<OptionsDevice[]>();
  const [selectedMic, setSelectedMic] = useState<OptionsDevice>();
  const [selectedSpk, setSelectedSpk] = useState<OptionsDevice>();

  const [localVideoStream, setLocalVideoStream] = useState<LocalVideoStream | undefined>();
  const [localVideoStreamRenderer, setLocalVideoStreamRenderer] = useState<VideoStreamRenderer>();
  const [videoGalleryLocalParticipant, setVideoGalleryLocalParticipant] = useState<VideoGalleryLocalParticipant>();
  const [videoGalleryRemoteParticipants, setVideoGalleryRemoteParticipants] = useState<VideoGalleryRemoteParticipant[]>();

  const [startCallDateTime, setStartCallDateTime] = useState<Date | undefined>();
  const [hours, setHours] = useState<number | undefined>(undefined);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [insufficientCreditsOnCall, setInsufficientCreditsOnCall] = useState<boolean>(false);

  const customStyles = {
    root: {
      backgroundColor: "lightgray",
      border: "solid black",
      borderRadius: "0.3rem",
      maxWidth: "fit-content",
    },
  };

  useEffect(() => {
    initDeviceManager().then();

    
  }, []);

  useEffect(() => {
    try {
      const anyNav: any = navigator
      if ("wakeLock" in navigator) {
        anyNav.wakeLock.request("screen").then((wl: any) => {
          setWakeLock(wl);
          console.log("Wake Lock is active");
        });  
      }
    } catch (err: any) {
      // The Wake Lock request has failed - usually system related, such as battery.
      console.log(`${err.name}, ${err.message}`);
    }
  }, []);
  
  useEffect(() => {
    setChatThread(authDetails?.chatData);
  }, [authDetails?.chatData]);
  
  const updateCredit = () => {
    const { dispatch } = props;
    const userRole = localStorage.getItem(LOCALSTORE.role) as any;
    let userId;

    if (userRole == UserRoleEnum.ServiceProvider) 
      userId = accountData.id
    else   
      userId = userProfile.id

    if(userId || authDetails?.totalCredit?.accountId) {
      dispatch(getTotalCredit(userId ? userId : authDetails?.totalCredit?.accountId)).then((credit: any) => {
        dispatch(set_Total_Credit(credit?.data))
      })
    }
  };

  const initDeviceManager = async () => {
    const callClient = new CallClient();
    const dm = await callClient.getDeviceManager();
    setDeviceManager(dm);

    dm.on("audioDevicesUpdated", (sender) => {
      if (sender.added.length > 0) {
        let micDevice = sender.added.filter((d) => d.deviceType == "Microphone");
        if (micDevice.length > 0) {
          dm.selectMicrophone(micDevice[0]);
        }
      }
    });

    dm.on("selectedMicrophoneChanged", () => {
      if (!!outgoingCall && !!dm.selectedMicrophone) {
        let laStream = outgoingCall.localAudioStreams.find((stream) => stream.mediaStreamType === 'Audio' && stream.source.deviceType == "Microphone");
        if (laStream && laStream.source.id != dm.selectedMicrophone.id) {
          laStream.switchSource(dm.selectedMicrophone);
        }
      }
    });
    
    if (callType == CallTypeEnum.VideoCallTwoWay || callType == CallTypeEnum.VideoCallOneWay) {
      dm.on("videoDevicesUpdated", async (sender) => {
        const c = await dm.getCameras();
        setHasMultipleCameras(c && c.length > 1);
      });  
    }

    if (!isSafari) {
      try {
        if (dm.isSpeakerSelectionAvailable) {
          const speakers = await dm.getSpeakers();
          setSpeakerOptions(speakers.map(s => {
            return {
              id: s.id,
              name: s.name
            }
          }));
    
          if (dm.selectedSpeaker) {
            setSelectedSpk({
              id: dm.selectedSpeaker.id,
              name: dm.selectedSpeaker.name,
            })
          }
        }
        
        const microphones = await dm.getMicrophones();
        setMicrophoneOptions(microphones.map(s => {
          return {
            id: s.id,
            name: s.name
          }
        }));
    
        if (dm.selectedMicrophone) {
          setSelectedMic({
            id: dm.selectedMicrophone.id,
            name: dm.selectedMicrophone.name,
          })
        }  
      } catch(err) {
        console.log(err);
      }
    }
    
    if (direction == 'incoming-call') {
      if (authDetails.callConnected) {
        await acceptIncomingCall(dm, authDetails.callConnected);
      }
    } else {
      await startCall(dm, callType);
    }
  }

  const getStreamElement = (id: string) => {
    const ele = document.createElement("div");
    ele.setAttribute("id", id);
    ele.setAttribute("style", "width: 100%; height: 100%");

    return ele;
  }

  const initVideoGalleryVideoCall = async (callConnectedUser: CallConnectedUserModel, deviceMng: DeviceManager, isIncomingCall: boolean): Promise<VideoOptions | undefined> => {
    const streamLocalElement = getStreamElement("local-video-stream");
    const streamRemoteElement = getStreamElement("remote-video-stream");
    const screenSharingContainer = getStreamElement("screen-sharing-stream")

    setLocalVideoContainer(streamLocalElement);
    setRemoteVideoContainer(streamRemoteElement);
    setScreenSharingContainer(screenSharingContainer);
    
    let videoOptions: VideoOptions | undefined;
    const cameras = await deviceMng.getCameras();
    setHasMultipleCameras(cameras && cameras.length > 1);
    if (cameras && cameras.length > 0 && cameraToggle) {
      setSelectedCamera(cameras[0]);
      const localVideoStream = await createLocalVideoStream(deviceMng, cameras[0]);
      setLocalVideoStream(localVideoStream);
      
      if (localVideoStream) {
        videoOptions = { localVideoStreams: [localVideoStream] };
        const lvsRenderer = await displayLocalVideoStream(localVideoStream, streamLocalElement);
        setLocalVideoStreamRenderer(lvsRenderer);
      }
    }

    setVideoGalleryLocalParticipant({
      userId: (isIncomingCall ? callConnectedUser.calleeCommunicationUserId : callConnectedUser.callerCommunicationUserId) as string,
      displayName: isIncomingCall ? callConnectedUser.calleeDisplayName : callConnectedUser.callerDisplayName,
      isMuted: false,
      videoStream: {
        isAvailable: true,
        isMirrored: true,
        renderElement: streamLocalElement,
      }
    });
    
    setVideoGalleryRemoteParticipants([{
      userId: (isIncomingCall ? callConnectedUser.callerCommunicationUserId : callConnectedUser.calleeCommunicationUserId) as string,
      displayName: isIncomingCall? callConnectedUser.callerDisplayName: callConnectedUser.calleeDisplayName,
      isMuted: false,
      videoStream: {
        isAvailable: true,
        isMirrored: false,
        renderElement: streamRemoteElement,
      },
      screenShareStream: {
        renderElement: screenSharingContainer
      }
    }]);

    return videoOptions;
  }

  const initVideoGalleryAudioCall = (callConnectedUser: CallConnectedUserModel, isIncomingCall = false) => {
    const screenSharingContainer = getStreamElement("screen-sharing-stream");
    const streamRemoteElement = getStreamElement("remote-video-stream");

    setScreenSharingContainer(screenSharingContainer);
    setRemoteVideoContainer(streamRemoteElement);

    setVideoGalleryLocalParticipant({
      userId: (isIncomingCall ? callConnectedUser.calleeCommunicationUserId : callConnectedUser.callerCommunicationUserId) as string,
      displayName: (isIncomingCall ? callConnectedUser.calleeDisplayName : callConnectedUser.callerDisplayName),
      isMuted: false,
    });
    
    setVideoGalleryRemoteParticipants([{
      userId: (isIncomingCall ? callConnectedUser.callerCommunicationUserId : callConnectedUser.calleeCommunicationUserId) as string,
      displayName: (isIncomingCall ? callConnectedUser.callerDisplayName : callConnectedUser.calleeDisplayName),
      isMuted: false,
      videoStream: {
        isAvailable: false,
        isMirrored: false,
        renderElement: streamRemoteElement,
      },
      screenShareStream: {
        renderElement: screenSharingContainer
      }
    }]);
  }

  const acceptIncomingCall = async (deviceMng: DeviceManager, callConnectedUser: CallConnectedUserModel) => {
    if (incomingCall && typeof incomingCall.accept == "function") {
      setCallConnected(callConnectedUser);
      setMicrophoneToggle(!!deviceMng.selectedMicrophone);

      let callOptions: AcceptCallOptions | undefined;
      if (callType == CallTypeEnum.VideoCallTwoWay) {
        // For screen sharing and video streaming
        const videoOptions = await initVideoGalleryVideoCall(callConnectedUser, deviceMng, true);
        callOptions = { videoOptions };
      } else {
        // For screen sharing
        initVideoGalleryAudioCall(callConnectedUser, true);
      }

      incomingCall.accept(callOptions).then((call) => {
        subscribeToCall(call, callConnectedUser, undefined, true);
      });
    } 
  };

  const startCall = async (deviceMng: DeviceManager, callingType: CallTypeEnum) => {
    const { dispatch } = props;
    
    setCallState("Connecting");
    dispatch(callConnecting(participantUserId, callingType))
      .then(async (res: any) => {
        if (!res.data.isSuccess) {
          await resetCall();
          return;
        }

        const callConnectedData = new CallConnectedResponseModel(res?.data.data);
        
        if (!callConnectedData.callConnectedUser || !callConnectedData.callConnectedUser.calleeCommunicationUserId) {
          await resetCall();
          return;
        }

        setCallConnected(callConnectedData.callConnectedUser);
        dispatch(set_chat_data(callConnectedData.chatThread));

        let startCallOptions: StartCallOptions | undefined;
        // initVideoGalleryVideoCall: For screen sharing and video streaming
        if (callingType == CallTypeEnum.VideoCallTwoWay
          || callingType == CallTypeEnum.VideoCallOneWay) {
          const videoOptions = await initVideoGalleryVideoCall(callConnectedData.callConnectedUser, deviceMng, false);
          startCallOptions = { videoOptions };
        } else {
          // For screen sharing
          initVideoGalleryAudioCall(callConnectedData.callConnectedUser);
        }

        const call = callAgent.startCall([{ communicationUserId: callConnectedData.callConnectedUser.calleeCommunicationUserId }], startCallOptions);

        // Subscribe to the call's properties and events.
        subscribeToCall(call, callConnectedData.callConnectedUser, callConnectedData.chatThread?.id as string, false);
      })
      .catch(async (err: any) => {
        if (err.response?.data.name == "InsufficientCredit") {
          setInsufficientCreditsOnCall(true);
        } else {
          toast.error(err.response?.data.message || err.message, {
            theme: "colored",
            autoClose: 3000,
          });
          await resetCall();
        }
      });
  }
  
  const subscribeToCall = (call: Call, callConnectedUser: CallConnectedUserModel, roomId: string | undefined, isIncomingCall: boolean) => {
    try {
      handleCallState(call, callConnectedUser, roomId);
      handleLocalStream(call);
      handleRemoteStream(call, callConnectedUser, isIncomingCall);
      handleScreenSharing(call);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCallState = (call: Call, callConnectedUser: CallConnectedUserModel, roomId: string | undefined) => {
    const { dispatch } = props;
    let timer: any;
    let validateInterval: any;
    let ringingInterval: any;
      
    dispatch(set_Call(call));
    setOutgoingCall(call);
    setStartCallDateTime(new Date());
    // Subscribe to call's 'stateChanged' event for value changes.
    call.on("stateChanged", async () => {
      setCallState(call.state);
      
      switch (call.state) {
        case "Ringing": 
          if (call.direction == "Outgoing") {
            ringingInterval = await outgoingRing();
          }
        break;
        case "Connected":
          setStartCallDateTime(new Date());
          timer = setTiming();
          stopOutgoingRing(ringingInterval);

          if (call.direction == "Outgoing") {
            dispatch(updateCallConnected(roomId, call.id));
            validateInterval = validateSufficientPerMinute(call, callConnectedUser);
          }
          break;
        case "Disconnecting":
          stopUsingCamera(call);
          break;
        case "Disconnected":
          stopUsingCamera(call);
          stopOutgoingRing(ringingInterval);
          clearInterval(timer);
          clearInterval(validateInterval);

          if (call.direction == "Outgoing") {
            if (call.callEndReason?.code === 0) {
              await triggerEndCall(call.id, callConnectedUser);
            } else {
              await triggerMissedCall(call.id, callConnectedUser);
            }
          } else {
            await resetCall();
          }
        break;
      }
    });
  }

  const stopUsingCamera = (call: Call) => {
    call.localVideoStreams.forEach(async (lvs) => {
      if (lvs.mediaStreamType === 'Video') {
        await call.stopVideo(lvs);
      } else if (lvs.mediaStreamType === 'ScreenSharing') {
        await call.stopScreenSharing();
      }

      setLocalVideoStream(undefined);
      removeLocalVideoStream(localVideoStreamRenderer, localVideoContainer);
    });
  }

  const setTiming = () => {
    setSeconds(0);
    setMinutes(0);

    const timer = setInterval(() => {
      let s = getValue(setSeconds);
      
      if (s == 59) {
        setSeconds(p => p = 0);
        let m = getValue(setMinutes);
        if(m == 59) {
          setMinutes(p => p = 0);
          let h = getValue(setMinutes);
          if (h) {
            setHours(p => p = 1);
          } else {
            setHours(p => p ? p + 1 : 0);
          }
        } else {
          setMinutes(p => p + 1);
        }
      } else {
        setSeconds(p => p + 1);
      }
    }, 1000);

    return timer;
  }

  const updateVideoStreamRemoteParticipant = (remoteVideoStream: RemoteVideoStream) => {
    setVideoGalleryRemoteParticipants(rps => { 
      if(rps && rps.length > 0) { 
        rps.forEach((participant) => {
          if (participant.screenShareStream && remoteVideoStream.mediaStreamType == "ScreenSharing") {
            participant.screenShareStream.isAvailable = remoteVideoStream.isAvailable; 
            if (!remoteVideoStream.isAvailable) {
              participant.screenShareStream.renderElement = undefined;
            }
          }
  
          if (participant.videoStream && remoteVideoStream.mediaStreamType == "Video") {
            participant.videoStream.isAvailable = remoteVideoStream.isAvailable; 
            if (!remoteVideoStream.isAvailable) {
              participant.videoStream.renderElement = undefined;
            }
          }
        });
      } 
      return rps;
    });
  }

  const updateVideoStreamLocalParticipant = (value: boolean, videoContainer: HTMLDivElement | undefined) => {
    setVideoGalleryLocalParticipant(lp => { 
      if(lp && lp.videoStream) {
        lp.videoStream.isAvailable = value; 
        lp.videoStream.renderElement = videoContainer;
      } 
      return lp;
    });
  }

  /**
 * Subscribe to a remote participant's remote video stream obj.
 * You have to subscribe to the 'isAvailableChanged' event to render the remoteVideoStream. If the 'isAvailable' property
 * changes to 'true', a remote participant is sending a stream. Whenever availability of a remote stream changes
 * you can choose to destroy the whole 'Renderer', a specific 'RendererView' or keep them, but this will result in displaying blank video frame.
 */
  const subscribeToRemoteVideoStream = async (remoteVideoStream: RemoteVideoStream, 
    streamRemoteElement: HTMLDivElement | undefined, 
    streamScreenSharingElement: HTMLDivElement | undefined, 
    callConnectedUser: CallConnectedUserModel,
    isIncomingCall: boolean) => {
    let renderer = new VideoStreamRenderer(remoteVideoStream);
    let remoteVideoContainer = getStreamElement('remote-video-container');
    let remoteShareScreenContainer = getStreamElement('remote-share-screen-container');
    // Create a renderer view for the remote video stream.
    let view: VideoStreamRendererView;
    
    let initially = true;

    const createView = async (initiallyParam: boolean) => {
      updateVideoStreamRemoteParticipant(remoteVideoStream);
      view = await renderer.createView({
        scalingMode: isMobile || isTablet ? "Fit": "Crop"
      });

      if (remoteVideoStream.mediaStreamType == "ScreenSharing") {
        remoteShareScreenContainer.appendChild(view.target);
        streamScreenSharingElement?.appendChild(remoteShareScreenContainer);
        
        setVideoGalleryRemoteParticipants(rs => {
          if (rs) {
            const r = rs[0];
            if (r.screenShareStream) {
              r.screenShareStream.renderElement = streamScreenSharingElement;
            }
          }

          return rs;
        });
      } else {
        // Attach the renderer view to the UI.
        remoteVideoContainer.appendChild(view.target);
        streamRemoteElement?.appendChild(remoteVideoContainer);

        if (initiallyParam) {
          setVideoGalleryRemoteParticipants([{
            userId: (isIncomingCall ? callConnectedUser.callerCommunicationUserId : callConnectedUser.calleeCommunicationUserId) as string,
            displayName: isIncomingCall ? callConnectedUser.callerDisplayName : callConnectedUser.calleeDisplayName,
            videoStream: {
              isAvailable: true,
              isMirrored: false,
              renderElement: streamRemoteElement,
            },
            screenShareStream: {
              renderElement: streamScreenSharingElement
            }
          }]);
        } else {
          setVideoGalleryRemoteParticipants(rs => {
            if (rs) {
              const rv = rs.filter(_ => !!_.videoStream && remoteVideoStream.mediaStreamType == "Video");
              if (rv && rv.length > 0) {
                const r = rv[0];
                if(r.videoStream) {
                  r.videoStream.renderElement = streamRemoteElement;
                }
              }
            }
  
            return rs;
          });
        
        }
      }
    }
  
    // Remote participant has switched video on/off
    remoteVideoStream.on('isAvailableChanged', async () => {
        try {  
            if (remoteVideoStream.isAvailable) {
                await createView(initially);
                initially = false;
            } else {
                view?.dispose();
                updateVideoStreamRemoteParticipant(remoteVideoStream);
                if (remoteVideoStream.mediaStreamType == "ScreenSharing") {
                  streamScreenSharingElement?.removeChild(remoteShareScreenContainer);
                } else {
                  streamRemoteElement?.removeChild(remoteVideoContainer);
                }
            }
        } catch (e) {
            console.error(e);
        }
    });
  
    // Remote participant has video on initially.
    if (remoteVideoStream.isAvailable) {
        try {
            await createView(initially);
            initially = false;
        } catch (e) {
            console.error(e);
        }
    }
  }
  
  /**
   * Subscribe to a remote participant obj.
   * Listen for property changes and collection update.
   */
  const subscribeToRemoteParticipant = (remoteParticipant: RemoteParticipant, 
    streamRemoteElement: HTMLDivElement | undefined, 
    streamScreenSharingElement: HTMLDivElement | undefined, 
    callConnectedUser: CallConnectedUserModel, 
    isIncomingCall: boolean) => {
    try {
        // Inspect the remoteParticipants's current videoStreams and subscribe to them.
        remoteParticipant.videoStreams.forEach(remoteVideoStream => {
            subscribeToRemoteVideoStream(remoteVideoStream, streamRemoteElement, streamScreenSharingElement, callConnectedUser, isIncomingCall);
        });
    
        // Subscribe to the remoteParticipant's 'videoStreamsUpdated' event to be
        // notified when the remoteParticipant adds new videoStreams and removes video streams.
        remoteParticipant.on('videoStreamsUpdated', e => {
            // Subscribe to new remote participant's video streams that were added.
            e.added.forEach(remoteVideoStream => {
                subscribeToRemoteVideoStream(remoteVideoStream, streamRemoteElement, streamScreenSharingElement, callConnectedUser, isIncomingCall);
            });
            // Unsubscribe from remote participant's video streams that were removed.
            e.removed.forEach(remoteVideoStream => {
                console.log('Remote participant video stream was removed.');
            })
        });
        
        remoteParticipant.on("isMutedChanged", () => {  
          setVideoGalleryRemoteParticipants(rps => { 
            if(rps) { rps[0].isMuted = remoteParticipant.isMuted; } return rps;});
        });
    } catch (error) {
        console.error(error);
    }
  }

  const handleScreenSharing = (call: Call) => {
    call.on('isScreenSharingOnChanged', () => {
      setVideoGalleryLocalParticipant(lp => { 
        if (lp) {
          lp.isScreenSharingOn = !lp.isScreenSharingOn; 
        } 
        return lp; 
      });
        
      setShareScreenToggle(value => {
        return !value;
      });
    });
  }

  const handleLocalStream = (call: Call) => {
    let lvc: HTMLDivElement | undefined;
    setLocalVideoContainer(value => {lvc = value; return value;});

    call.on("localVideoStreamsUpdated", (e) => {
      e.added.forEach(async (lvs) => {
        setLocalVideoStream(lvs);
        const lvsRenderer = await displayLocalVideoStream(lvs, lvc);
        setLocalVideoStreamRenderer(lvsRenderer);
        updateVideoStreamLocalParticipant(true, lvc);
      });
      e.removed.forEach((lvs) => {
        let lvsr: VideoStreamRenderer | undefined;
        setLocalVideoStreamRenderer(value => {lvsr = value; return value;});
        removeLocalVideoStream(lvsr, lvc);
        updateVideoStreamLocalParticipant(false, undefined);
      });
    });
  }

  const handleRemoteStream = (call: Call, callConnectedUser: CallConnectedUserModel, isIncomingCall: boolean) => {
    
    const streamRemoteContainer = getStreamElement("remote-video-stream");
    const screenSharingContainer = getStreamElement("screen-sharing-stream");

    setRemoteVideoContainer(streamRemoteContainer);
    setScreenSharingContainer(screenSharingContainer);
    
    // Inspect the call's current remote participants and subscribe to them.
    call.remoteParticipants.forEach(remoteParticipant => {
      subscribeToRemoteParticipant(remoteParticipant, streamRemoteContainer, screenSharingContainer, callConnectedUser, isIncomingCall);
    });

    // Subscribe to the call's 'remoteParticipantsUpdated' event to be
    // notified when new participants are added to the call or removed from the call.
    call.on('remoteParticipantsUpdated', e => {
        // Subscribe to new remote participants that are added to the call.
        e.added.forEach(remoteParticipant => {
          subscribeToRemoteParticipant(remoteParticipant, streamRemoteContainer, screenSharingContainer, callConnectedUser, isIncomingCall);
        });
        // Unsubscribe from participants that are removed from the call
        e.removed.forEach(remoteParticipant => {
            console.log('Remote participant removed from the call.');
        });
    });
  }

  const validateSufficientPerMinute = (call: Call, callConnectedUser: CallConnectedUserModel) => {
    const { dispatch } = props;
    const startCallFrom: Date | undefined = getValue(setStartCallDateTime);

    return setInterval(() => {
      if (call.state === "Connected") {
        const validateCallBody = {
          callConnectionId: call.id,
          callType,
          startTime: startCallFrom,
          endTime: new Date(),
          callerUserId: callConnectedUser.callerUserId,
          calleeUserId: callConnectedUser.calleeUserId,
        };
        dispatch(validateInsufficientCredit(validateCallBody))
          .then(async (r: any) => {
            updateCredit();
            if (r.data.isSuccess) {
              return;
            }

            if (r.data.message == "OutOfCredit") {
              setInsufficientCreditsOnCall(false);
              await call.hangUp({forEveryone : true});
              toast.error("Your call has been disconnected since you do not have the minimum amount of credits needed. Please top up to continue.", {
                theme: "colored",
                autoClose: 3000,
              });
              return;
            } 
            
            if (r.data.message == "NeedTopup") {
              setInsufficientCreditsOnCall(true);
              await playRingTone(RingtoneEnum.Topup);
              return;
            }
          }
        ).catch(async (err: any) => {
          setInsufficientCreditsOnCall(false);
          await call.hangUp({forEveryone : true});
          toast.error("Your call has been disconnected since server internal server error.", {
            theme: "colored",
            autoClose: 3000,
          });
        });;
      }
    }, 58000);
  };

  const onSelectSpeaker = async (sender: OptionsDevice) => {
    if (outgoingCall) {
      const spks = await deviceManager?.getSpeakers();
      const spk = spks?.find(_ => _.id == sender.id);
      if (spk) {
        deviceManager?.selectSpeaker(spk);
        setSelectedSpk({
          id: spk.id,
          name: spk.name,
        });
      }
    }
  }
  const onSelectMicrophone = async (sender: OptionsDevice) => {
    if (outgoingCall) {
      const mics = await deviceManager?.getMicrophones();
      const mic = mics?.find(_ => _.id == sender.id);
      if (mic) {
        setSelectedMic({
          id: mic.id,
          name: mic.name,
        });

        deviceManager?.selectMicrophone(mic);
      }
    }
  }

  const onMicrophoneToggle = async () => {
    if (!deviceManager) {
      toast.error("Can not detect your device inputs", { theme: "colored", autoClose: 3000 });
      return;
    }

    if (!!outgoingCall) {
      if (outgoingCall.isMuted) {
        await outgoingCall.unmute();
  
        if (!deviceManager.selectedMicrophone) {
          const microphones = await deviceManager.getMicrophones();
          deviceManager.selectMicrophone(microphones[0]);
        }
      } else {
        await outgoingCall.mute();
      }
  
      console.log(outgoingCall.isMuted);
      setVideoGalleryLocalParticipant(lps => { 
        if(lps) { 
          lps.isMuted = outgoingCall.isMuted; 
        } 
        return lps;
      });
      setMicrophoneToggle(!outgoingCall.isMuted);
    }
  }

  const onToggleScreenShare = async() => {
    if (shareScreenToggle) {
      await outgoingCall?.stopScreenSharing();
    }else {
      await outgoingCall?.startScreenSharing();
    }
  }

  const onToggleLayout = async() => {
    if (layoutToggle) {
      setLayoutToggle(false);
    }else {
      setLayoutToggle(true);
    }
  }

  const onToggleShowNotes = () => {
    if (isShowNote) {
      setIsShowNote(false);
    }else {
      setIsShowNote(true);
    }
  }

  const onClickVideoToggle = async () => {
    if (!deviceManager) {
      toast.error("Can not detect your device inputs", { theme: "colored", autoClose: 3000 });
      return;
    }
    
    if (!!outgoingCall) {
      if (cameraToggle) {
        outgoingCall.localVideoStreams.forEach(async (lvs) => {
          if (lvs.mediaStreamType === 'Video') {
            await outgoingCall.stopVideo(lvs);
            setLocalVideoStream(undefined);
            setVideoGalleryLocalParticipant(lp => { 
              if (lp && lp.videoStream) {
                lp.videoStream.isAvailable = false; 
              } 
              return lp; 
            });
            removeLocalVideoStream(localVideoStreamRenderer, localVideoContainer);
          }
        });
      } else {
        let camera: VideoDeviceInfo | undefined;
        setSelectedCamera(c => {camera = c; return c;});
        const localVideoStream = await createLocalVideoStream(deviceManager, camera);
        if (!localVideoStream) {
          return;
        }
        setLocalVideoStream(localVideoStream);
        setVideoGalleryLocalParticipant(lp => { 
          if (lp && lp.videoStream) {
            lp.videoStream.isAvailable = true; 
          } 
          return lp; 
        });
        await outgoingCall.startVideo(localVideoStream);
      }
    }
    
    setCameraToggle(value => {return !value;});
  }

  const onClickSwitchCamera = async () => {
    if (!deviceManager) {
      toast.error("Can not detect your device inputs", { theme: "colored", autoClose: 3000 });
      return;
    }

    if (!!outgoingCall) {
      let lvStream = outgoingCall.localVideoStreams?.find( (stream) => { return stream.mediaStreamType === 'Video'} );
      if (lvStream) {
        await outgoingCall.stopVideo(lvStream);

        let camera: VideoDeviceInfo | undefined;
        setSelectedCamera(c => {camera = c; return c;});
        const cameras = await deviceManager.getCameras();
        camera = cameras.filter(_ => _.id !== camera?.id)[0];
        setSelectedCamera(camera);
        lvStream = await createLocalVideoStream(deviceManager, camera);
        if (!lvStream) {
          return;
        }
        
        setLocalVideoStream(lvStream);    
        await outgoingCall.startVideo(lvStream);
      }
    }
  }

  const onClickSwitchMicrophone = async () => {
    if (!deviceManager) {
      toast.error("Can not detect your device inputs", { theme: "colored", autoClose: 3000 });
      return;
    }
    
    const call: Call | undefined = getValue(setOutgoingCall);
    if (call) {
      let laStream = call.localAudioStreams?.find(
        (stream) => { return stream.mediaStreamType === 'Audio' && stream.source.deviceType == "Microphone"}
      );
      if (laStream) {
        const microphones = await deviceManager.getMicrophones();
        let mic = microphones.filter(_ => _.id !== laStream?.source.id)[0];

        if (!!mic) {
          laStream.switchSource(mic);
        }
      }
    }
  }

  const resetCall = async () => {
    const { dispatch } = props;

    let wakeLock: any;
    setWakeLock((wl: any) => { wakeLock = wl; return wl; });
    await wakeLock?.release();

    setCallState("None");
    setLocalVideoContainer(undefined);
    setRemoteVideoContainer(undefined);
    dispatch(reset_Call_State(null));
    dispatch(set_Show_Chat(true));
    dispatch(set_Call(undefined));
    
    const userRole = localStorage.getItem(LOCALSTORE.role) as any;
    
    if (userRole == UserRoleEnum.ServiceProvider) {
      navigate(-1);
    } else {
      navigate("/user/chat");
    }
    
  };

  const triggerMissedCall = async (callId: string, callConnectedUser: CallConnectedUserModel) => {
    const { dispatch } = props;
    const missedCallBody = {
      callType,
      callerUserId: callConnectedUser?.callerUserId,
      calleeUserId: callConnectedUser?.calleeUserId,
      callConnectionId: callId,
    };
    // call API to /missed-call endpoint
    dispatch(missedCall(missedCallBody)).then();
    // Refresh the chat
    await resetCall();
  };

  const onEndCall = async (call: Call | undefined) => {
    // Call EndCall API if you are caller User
    if (!call) {
      setOutgoingCall((v: any) => {call = v; return v;});
    }
    if (call && !!call.hangUp) {
      await call.hangUp({forEveryone : true});
      updateCredit();
    } else {
      await resetCall();
    }
  };

  async function triggerEndCall(callId: string, callConnectedUser: CallConnectedUserModel) {
    const { dispatch } = props;
    const startCallFrom: Date | undefined = getValue(setStartCallDateTime);
    const endCallBody = {
      callType,
      startTime: startCallFrom,
      endTime: new Date(),
      callerUserId: callConnectedUser.callerUserId,
      calleeUserId: callConnectedUser.calleeUserId,
      callerComUserId: callConnectedUser.callerCommunicationUserId, 
      calleeComUserId: callConnectedUser.calleeCommunicationUserId,
      callConnectionId: callId,
    };
    await dispatch(endCall(endCallBody));
    await resetCall();
  };

  const onTopUpCallCancel = async () => {
    setInsufficientCreditsOnCall(false);
    const call: Call | undefined = getValue(setOutgoingCall);
    
    if (!!call) {
      if (call.hangUp !== undefined) {
        call.hangUp({forEveryone : true});
        return;
      }
    }

    if (callState == "Connecting") {
      await resetCall();
    }
  };
  
  const handleTopUpSuccess = () => {
    setInsufficientCreditsOnCall(false);
    if (deviceManager && callState == "Connecting") {
      startCall(deviceManager, callType);
    }
  }

  const handleAvatarTile: OnRenderAvatarCallback = 
    (userId?: string, options?: CustomAvatarOptions, defaultOnRender?: ((avatarOptions: CustomAvatarOptions) => JSX.Element) | undefined) => {
      
      let displayName: string = "";
      let imageUrl: string = "";
  
      if (userId == callConnected?.callerCommunicationUserId) {
        imageUrl = callConnected?.callerImageUrl || "";
        displayName = callConnected?.callerDisplayName || "";
      } else if (userId == callConnected?.calleeCommunicationUserId) {
        imageUrl = callConnected?.calleeImageUrl || "";
        displayName = callConnected?.calleeDisplayName || "";
      }

    return <>
      <div className="call-animation">
        <Stack>
          <Persona
            imageUrl={imageUrl}
            text={displayName}
            size={PersonaSize.size100}
            hidePersonaDetails={true}
          />
        </Stack>
      </div>
    </>
  }

  const onRenderAvatar: OnRenderAvatarCallback = (userId, options, defaultOnRender): JSX.Element => {
    switch (userId) {
      case callConnected?.callerCommunicationUserId:
        return (
          <Stack className="w-full h-full flex items-center justify-center">
            <Persona 
                imageUrl={ callConnected?.callerImageUrl}
                text={ callConnected?.callerDisplayName}
                hidePersonaDetails={true}
                size={callState == "Connected" ? PersonaSize.size56 : PersonaSize.size100} />
          </Stack>
        );
      case callConnected?.calleeCommunicationUserId:
        return (
          <Stack className={"w-full h-full flex items-center justify-center relative callee-tile"}>
            <Persona className={(callState == "Connecting" || callState == "Ringing") ? "call-animation" : ""}
              imageUrl={callConnected?.calleeImageUrl}
              text={callConnected?.calleeDisplayName}
              hidePersonaDetails={outgoingCall?.direction == "Incoming" 
                || (outgoingCall?.direction == "Outgoing" && (callState != "Connecting" && callState != "Ringing"))}
              secondaryText={callState }
              size={PersonaSize.size100} />
          </Stack>
        );
      default:
        return (options && defaultOnRender?.(options)) ?? <></>;
    }
  };

  return (
    <>
      {callState == "Connected" && chatThread && isShowNote && <StickyNotes roomId={chatThread.id} userId={chatThread.myUserId} onClosed={onToggleShowNotes}/>}
      {insufficientCreditsOnCall && (
          <TopUpModal
            onCancel={onTopUpCallCancel}
            onSuccess={handleTopUpSuccess}
            amount=""
            insufficientCredits={true}
          />
        )} 
      <FluentThemeProvider>
        <div className="absolute top-0 left-0 h-full w-full">
          <Stack className="bg-[#F8F3FD]-to-r from-[#061989]/90 to-[#7C688C]/90 h-full">
            <div className="h-full w-full bg-[#ffffff80]">
              <div className={ 'relative w-full h-full flex items-center video-gallery ' + outgoingCall?.direction.toLowerCase()}>
                {videoGalleryLocalParticipant && <VideoGallery
                layout={layoutToggle ? "floatingLocalVideo" : "default"}
                localParticipant={videoGalleryLocalParticipant} 
                remoteParticipants={videoGalleryRemoteParticipants}
                showMuteIndicator={true}
                onRenderAvatar={onRenderAvatar}
                />}
              </div>
            </div>
            <Stack horizontal className="h-[100px] bg-[#ffffff80] justify-between">
              <div className="flex w-[100px] mr-7 ml-7 items-center text-base md:text-lg lg:text-xl xl:text-2xl">
                {callState == "Connected" && !isMobile &&
                  (<div>
                    { hours !== undefined ? (<span><span>{ hours < 10 ? '0' + hours : hours }</span><span>:</span></span>) : ''}
                    <span>{ minutes < 10 ? '0' + minutes : minutes }</span>
                    <span>:</span>
                    <span>{ seconds < 10 ? '0' + seconds : seconds}</span>
                  </div>)
                }
              </div>

                {
                  callState != "Disconnected" && callState != "Disconnecting" ?
                  (
                    <div className="flex flex-col justify-center mb-[-5px]">
                        {callState == "Connected" && isMobile &&
                          (<div>
                            { hours !== undefined ? (<span><span>{ hours < 10 ? '0' + hours : hours }</span><span>:</span></span>) : ''}
                            <span>{ minutes < 10 ? '0' + minutes : minutes }</span>
                            <span>:</span>
                            <span>{ seconds < 10 ? '0' + seconds : seconds}</span>
                          </div>)
                        }
                      <ControlBar styles={customStyles} layout="floatingBottom">
                      {
                        callState == "Connected" && 
                        ( (!!speakerOptions && speakerOptions.length > 0 
                          || !!microphoneOptions && microphoneOptions.length > 0)
                          ? <MicrophoneButton className="microphone-button"
                            onClick={onMicrophoneToggle}
                            enableDeviceSelectionMenu={true}
                            speakers={speakerOptions}
                            selectedSpeaker={selectedSpk}
                            onSelectSpeaker={onSelectSpeaker}
                            microphones={microphoneOptions}
                            selectedMicrophone={selectedMic}
                            onSelectMicrophone={onSelectMicrophone}
                            styles={{
                              splitButtonContainer: {
                                border: '1px solid'
                              }
                            }}
                            checked={microphoneToggle}
                            onRenderOnIcon={() => <MicIcon size="medium" />}
                            onRenderOffIcon={() => <MicOffIcon size="medium" />} 
                          />
                          : <MicrophoneButton
                            onClick={onMicrophoneToggle}
                            checked={microphoneToggle}
                            onRenderOnIcon={() => <MicIcon size="medium" />}
                            onRenderOffIcon={() => <MicOffIcon size="medium" />} 
                        />)
                      }
                                          
                      {(callType == CallTypeEnum.VideoCallTwoWay || callType == CallTypeEnum.VideoCallOneWay && outgoingCall?.direction == "Outgoing") && callState == "Connected" &&
                        (<CameraButton 
                          onToggleCamera={onClickVideoToggle} 
                          checked={cameraToggle}
                          onRenderOnIcon={() => <CallVideoIcon size="medium" /> }
                          onRenderOffIcon={() => <CallVideoOffIcon size="medium"/>} />) 
                      }
                      {cameraToggle && hasMultipleCameras && (callType == CallTypeEnum.VideoCallTwoWay || callType == CallTypeEnum.VideoCallOneWay && outgoingCall?.direction == "Outgoing") && callState == "Connected" &&
                        (<ScreenShareButton onClick={onClickSwitchCamera}
                          strings={{
                            tooltipOffContent: 'Switch Camera',
                            tooltipOnContent: 'Switch Camera'
                          }}
                          onRenderIcon={() => <SwitchCameraIcon size="medium" /> } />) 
                      }
                      {callState == "Connected" && isDesktop &&
                        (<ScreenShareButton onToggleScreenShare={onToggleScreenShare} checked={shareScreenToggle}
                          onRenderOnIcon={() => <CallControlStopPresentingNewIcon size="medium" /> }
                          onRenderOffIcon={() => <CallControlPresentNewIcon size="medium"/>} />) 
                      }
                      
                      {callState == "Connected" &&
                        (<ScreenShareButton onClick={onToggleLayout} checked={layoutToggle}
                          strings={{
                            tooltipOffContent: 'Change layout',
                            tooltipOnContent: 'Change layout'
                          }}
                          onRenderOnIcon={() => <FluidIcon size="medium" /> }
                          onRenderOffIcon={() => <GroupVideoCallGridIcon size="medium"/>} />) 
                      }
                      
                      {callState == "Connected" && 
                        (<ScreenShareButton onClick={onToggleShowNotes} checked={isShowNote}
                          strings={{
                            tooltipOffContent: 'Show notes',
                            tooltipOnContent: 'Hide notes'
                          }}
                          onRenderOnIcon={() => <FilesTxtIcon size="medium" />}
                          onRenderOffIcon={() => <FilesEmptyIcon size="medium"/>} />) 
                      }

                      <EndCallButton className="bg-[#A42E43]" onClick={() => {onEndCall(outgoingCall)}} onRenderIcon={() => <CallEndIcon size="medium" />}/>

                      </ControlBar>
                    </div>
                  ) : (
                    <div></div>
                  )
                }
              
              <div className="w-[156px] items-center"></div>
            </Stack>
          </Stack>
        </div>
      </FluentThemeProvider>
    </>
  );
};

export default connect()(CallScreen);
