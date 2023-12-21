import React, { useEffect, useLayoutEffect, useState } from "react";
import { connect, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import defultUser from "../../assets/images/defultUser.png";
import twoWayVideo from "../../assets/images/twoWayVideo.png";
import videoCalls from "../../assets/images/videoCalls.png";
import unLikedImage from "../../assets/images/regularHeartFill.png";
import chatIcon from "../../assets/images/chatIcon.png";
import voiceCall2 from "../../assets/images/voiceCall2.png";
import "react-toastify/dist/ReactToastify.css";
import HeaderHome from "../dashboard/commons/headerHome";
import { publicData } from "../../reducer/publicDataSlice";
import Footer from "../../component/footer";
import { getUserByUserName } from "../../services/homeService";
import { toast } from "react-toastify";
import RctPageLoader from "../../component/RctPageLoader";

const PublicViewProfile: React.FC<any> = (props: any) => {
  const navigate = useNavigate()
  const { publicSpData } = useSelector(publicData)
  const { id } = useParams()
  const [spDetails, setSpDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const params = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0);
    getUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUserData = () => {
    setIsLoading(true);
    const { dispatch } = props;
    dispatch(getUserByUserName(params?.uniqueUsername))
      .then((res: any) => {
        setIsLoading(false);
        setSpDetails(res?.data);
      })
      .catch((err: any) => {
        const massage = err.response.data.message;
        toast.error(massage, {
          theme: "colored",
          autoClose: 5000,
        });
        setIsLoading(false);
      });
  };

  return (
    <>
      {isLoading && <RctPageLoader />}

      <div className="bg-[#F8F3FD] min-h-screen pb-6">
        <HeaderHome />

        {spDetails ?
          <div
            className={`md:block mx-auto w-11/12 2xl:w-[1284px] 2xl:mt-12 bg-[#ffffffb5]  custombp:h-[594px]  rounded-lg py-6 px-4 md:px-10`}
          >
            <div className="w-full md:grid md:grid-cols-2">
              <div className="text-4xl text-primary text-center md:text-start">
                {spDetails?.username}
              </div>
              <div className="hidden md:block ml-auto">
                <div className="flex flex-wrap md:justify-between w-min md:w-auto mx-auto md:mx-0">
                  <button
                    className={`bg-white mx-auto xl:mx-[0px] xl:ml-2 mt-4 sm:mt-0 sm:mx-0 text-primary text-2xl hover:bg-primary hover:text-white w-[150px] h-[50px] rounded-full border-2 border-solid border-primary "
                          }`}
                    onClick={() => navigate("/user/learn-more")}
                  >
                    Send Gift
                  </button>
                  <span className="ml-2.5">
                    <button
                      className="bg-primary mx-auto mt-4 sm:mt-0 sm:mx-0 hover:bg-white hover:text-primary text-white text-2xl  w-[150px] h-[50px] rounded-full border-2 border-solid border-primary px-8"
                      onClick={() => navigate("/user/learn-more")}
                    >
                      Chat
                    </button>
                  </span>

                  <span>
                    <img
                      className="w-[40px] h-[35px] mt-1.5 ml-2 cursor-pointer"
                      src={unLikedImage}
                      onClick={() => navigate("/user/learn-more")}
                      alt="unliked"
                    />
                  </span>
                </div>
              </div>
            </div>

            <div className="md:flex justify-between gap-4 mt-2 md:mt-0">
              <div className="relative w-fit md:h-[388px] overflow-hidden rounded-2xl">
                <img
                  className="rounded-2xl w-[388px] md:min-h-[388px] md:shrink-0 relative"
                  src={spDetails?.profileImageUrl}
                  alt="product"
                />
              </div>
              <div className="block md:hidden ml-auto">
                <div className="flex mt-4 flex-wrap md:justify-between w-full">
                  <button
                    className="bg-primary  mx-auto mt-4 sm:mt-0 sm:mx-0 hover:bg-primary text-white text-2xl hover:text-white w-full h-[50px] border-2 border-solid border-primary px-8 rounded-full"
                    onClick={() => navigate("/user/learn-more")}
                  >
                    Chats
                  </button>
                </div>

                <div className="flex mt-4 flex-wrap md:justify-between w-full">
                  <button
                    className="bg-white mx-auto mt-4 sm:mt-0 sm:mx-0 hover:bg-primary text-primary text-2xl hover:text-white w-full h-[50px] border-2 border-solid border-primary px-8 hover:border-transparent rounded-full"
                    onClick={() => navigate("/user/learn-more")}
                  >
                    Send Gift
                  </button>
                </div>
              </div>
              <div className="w-full md:w-7/12 2xl:w-[769px] grid content-between">
                <div className="">
                  <div className="text-[#6E6E6E]">About</div>
                  <div className="font-['Montserrat'] text-[#444444]">
                    {spDetails?.description}
                  </div>
                </div>
                <div className="text-[#6E6E6E] text-base">Menu</div>
                <div className="grid grid-cols-4 gap-6 xl:grid-cols-4 w-fit mx-auto">
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
                      ${spDetails?.communication?.shortMessageUnitPrice}
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
                    ${user_details?.communication?.phoneCallUnitPrice}
                  </div>
                </div> */}
                  {spDetails?.enableAudioCall &&
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
                        ${spDetails?.communication?.audioCallUnitPrice}
                      </div>
                    </div>
                  }

                  {spDetails?.enableOneWayVideoCall &&
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
                        ${spDetails?.communication?.videoCallOneWayUnitPrice}
                      </div>
                    </div>
                  }

                  {spDetails?.enableTwoWayVideoCall &&
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
                        ${spDetails?.communication?.videoCallTwoWayUnitPrice}
                      </div>
                    </div>
                  }

                </div>
              </div>
            </div>

            {spDetails?.profileInfo &&
            <div dangerouslySetInnerHTML={{ __html: spDetails?.profileInfo }} className="mt-4 ck ck-content break-words ck-editor__editable ck-rounded-corners ck-blurred overflow-auto px-[0.6em] border border-[#37085B] ckPreview" />
          }
          </div>
          :
          null
        }

      </div>
      <Footer />
    </>
  );
};

export default connect()(PublicViewProfile);
