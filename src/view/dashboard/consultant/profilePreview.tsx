import React from 'react'
import close from "../../../assets/images/close.svg";
import chatIcon from "../../../assets/images/chatIcon.png";
import voiceCall2 from "../../../assets/images/voiceCall2.png";
import videoCalls from "../../../assets/images/videoCalls.png";
import twoWayVideo from "../../../assets/images/twoWayVideo.png";
import { values } from 'lodash';


const ProfilePreviewModal = ({ updatedProfileDetails, setPreviewModal, onSubmit, uploadedImage, hideSaveButton }: any) => {
  const onSaveProfileClick = () => {
    onSubmit(updatedProfileDetails)
    setPreviewModal(false)
  }

  console.log("updatedProfileDetails", updatedProfileDetails)
  return (
    <>
      <div
        style={{ backdropFilter: 'blur(6.5px)' }}
        className="justify-center items-center flex fixed inset-0 z-50 outline-none focus:outline-none"
      >
        <div className="bg-white rounded-[25px] overflow-x-hidden overflow-y-auto h-[calc(100vh_-_60px)] no-scrollbar w-[90%] py-4">
          <div
            className="flex justify-end text-xl font-bold text-black cursor-pointer px-6 pt-4"
            onClick={() => setPreviewModal(false)}
          >
            <img src={close} alt="" />
          </div>

          <div className='px-6 mt-4'>

            <div className="w-full md:grid md:grid-cols-2">
              <div className="text-4xl text-primary text-center md:text-start">
                {updatedProfileDetails?.username}
              </div>

              {/* <div className="hidden md:block ml-auto">
                <div className="flex flex-wrap md:justify-between w-min md:w-auto mx-auto md:mx-0">
                  <button
                    className={`bg-white mx-auto xl:mx-[0px] xl:ml-2 mt-4 sm:mt-0 sm:mx-0 text-primary text-2xl hover:bg-primary hover:text-white w-[150px] h-[50px] rounded-full border-2 border-solid border-primary "
                          }`}
                  onClick={() => sendGiftSp(user_details)}
                  >
                    Send Gift
                  </button>
                  <span className="ml-2.5">
                    <button
                      className="bg-primary mx-auto mt-4 sm:mt-0 sm:mx-0 hover:bg-white hover:text-primary text-white text-2xl  w-[150px] h-[50px] rounded-full border-2 border-solid border-primary px-8"
                    onClick={() => onGotoChat(user_details)}
                    disabled={chatDisable}
                    >
                      Chat
                    </button>
                  </span>
                  {user_details?.isFavorite ? (
                  <span onClick={() => onGotoFavorite(user_details, false)}>
                    {" "}
                    <img
                      className="w-[40px] h-[35px] mt-1.5 ml-2"
                      src={fillHeart}
                      alt="unliked"
                    />
                  </span>
                ) : (
                  <span onClick={() => onGotoFavorite(user_details, true)}>
                    {" "}
                    <img
                      className="w-[40px] h-[35px] mt-1.5 ml-2"
                      src={unLikedImage}
                      alt="unliked"
                    />
                  </span>
                )}
                </div>
              </div> */}
            </div>

            <div className="md:flex justify-between gap-4 mt-2 md:mt-0">
              <div className="relative min-w-fit max-h-[232px] max-w-[232px]" style={{ aspectRatio: "1" }}>
                <img
                  className="rounded-2xl w-full h-full   md:shrink-0 relative"
                  src={uploadedImage}
                  alt="user"
                />
                {/* <img
                className="w-[40px] h-[35px] mt-1.5 ml-2 absolute top-0 right-0 md:hidden"
                src={unLikedImage}
                alt="unliked"
              /> */}
              </div>

              {/* <div className="block md:hidden ml-auto">
                <div className="flex mt-4 flex-wrap md:justify-between w-full">
                  <button
                    className="bg-primary  mx-auto mt-4 sm:mt-0 sm:mx-0 hover:bg-primary text-white text-2xl hover:text-white w-full h-[50px] border-2 border-solid border-primary px-8 rounded-full"
                  // onClick={() => onGotoChat(user_details)}
                  // disabled={chatDisable}
                  >
                    Chats
                  </button>
                </div>

                <div className="flex mt-4 flex-wrap md:justify-between w-full">
                  <button
                    className="bg-white mx-auto mt-4 sm:mt-0 sm:mx-0 hover:bg-primary text-primary text-2xl hover:text-white w-full h-[50px] border-2 border-solid border-primary px-8 hover:border-transparent rounded-full"
                  // onClick={() => sendGiftSp(user_details)}
                  // disabled={chatDisable}
                  >
                    Send Gift
                  </button>
                </div>
              </div> */}

              <div className="w-full grid content-between mt-4 md:mt-0 md:ml-4">
                <div className="">
                  <div className="text-[#6E6E6E] font-bold text-lg">About</div>
                  <div className="font-['Montserrat'] text-[#444444]">
                    { updatedProfileDetails?.profileDescription || updatedProfileDetails?.description }
                  </div>
                </div>

                <div className="text-[#6E6E6E] font-bold text-lg mt-4">Menu</div>
                <div className="grid grid-cols-4 gap-6 xl:grid-cols-4 w-fit">
                  <div className="w-[120px] h-[160px] px-2 bg-white mt-0 md:mt-4">
                    <img
                      src={chatIcon}
                      className="mx-auto mt-8 w-[30px] h-[30px]"
                      alt="image1"
                    />
                    <div className="text-center w-full font-['Montserrat'] pt-4 font-bold text-[16px] text-[#3E3E3E]">
                      Chat
                    </div>

                    <div className="text-center w-full mt-2 text-[#37085B] font-bold text-[16px] ">
                      ${updatedProfileDetails?.communication?.shortMessageUnitPrice}
                    </div>
                  </div>

                  {/* <div className="w-[120px] h-[160px] px-2 bg-white mt-0 md:mt-4">
                    <img
                      src={Call}
                      className="mx-auto mt-8 w-[30px] h-[30px]"
                      alt="image1"
                    />
                    <div className="text-center w-full font-['Montserrat'] pt-4 font-bold text-[16px] text-[#3E3E3E]">
                      Phone
                    </div>

                    <div className="text-center w-full mt-2 text-[#37085B] font-bold text-[16px] ">
                      ${updatedProfileDetails?.communication?.phoneCallUnitPrice}
                    </div>
                  </div> */}

                  {updatedProfileDetails?.communication?.audioCallUnitPrice &&
                    <div className="w-[120px] h-[160px] px-2 bg-white mt-0 md:mt-4">
                      <img
                        src={voiceCall2}
                        className="mx-auto mt-8 w-[30px] h-[30px]"
                        alt="image1"
                      />
                      <div className="text-center w-full font-['Montserrat'] pt-4 font-bold text-[16px] text-[#3E3E3E]">
                        Audio
                      </div>

                      <div className="text-center w-full mt-2 text-[#37085B] font-bold text-[16px] ">
                        ${updatedProfileDetails?.communication?.audioCallUnitPrice}
                      </div>
                    </div>
                  }

                  {updatedProfileDetails?.communication?.enableOneWayVideoCall || updatedProfileDetails?.enableOneWayVideoCall  &&
                    <div className="w-[120px] h-[160px] px-2 bg-white mt-0 md:mt-4">
                      <img
                        src={videoCalls}
                        className="mx-auto mt-8 w-[30px] h-[30px]"
                        alt="image1"
                      />
                      <div className="text-center w-full font-['Montserrat'] pt-4 font-bold text-[16px] text-[#3E3E3E]">
                        1 Way
                      </div>

                      <div className="text-center w-full mt-2 text-[#37085B] font-bold text-[16px] ">
                        ${updatedProfileDetails?.communication?.videoCallOneWayUnitPrice}
                      </div>
                    </div>
                  }

                  {updatedProfileDetails?.communication?.enableTwoWayVideoCall || updatedProfileDetails?.enableTwoWayVideoCall &&
                    <div className="w-[120px] h-[160px] px-2 bg-white mt-0 md:mt-4">
                      <img
                        src={twoWayVideo}
                        className="mx-auto mt-8 w-[30px] h-[30px]"
                        alt="image1"
                      />
                      <div className="text-center w-full font-['Montserrat'] pt-4 font-bold text-[16px] text-[#3E3E3E]">
                        2 Way
                      </div>

                      <div className="text-center w-full mt-2 text-[#37085B] font-bold text-[16px] ">
                        ${updatedProfileDetails?.communication?.videoCallTwoWayUnitPrice}
                      </div>
                    </div>
                  }

                </div>
              </div>
            </div>

            {updatedProfileDetails?.profileInfo &&
              <div dangerouslySetInnerHTML={{ __html: updatedProfileDetails?.profileInfo }} className="mt-4 ck ck-content break-words ck-editor__editable ck-rounded-corners ck-blurred overflow-auto px-[0.6em] border border-[#37085B] ckPreview" />
            }

            {!hideSaveButton ?
              <div className="text-center my-6">
                <button className={`border border-[#37085B] text-[#37085B] px-14 py-2 rounded-lg font-medium`} onClick={() => onSaveProfileClick()}>
                  Save Profile
                </button>
              </div>
              : null}
          </div>

        </div>

      </div>
      <div className="opacity-50 fixed inset-0 z-40 bg-black"></div>
    </>

  )
}

export default ProfilePreviewModal
