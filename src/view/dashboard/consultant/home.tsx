import React, { useState, useEffect } from "react";
import homeChatIcon from "../../../assets/images/homeChatIcon.png";
import homeCallIcon from "../../../assets/images/homeCallIcon.png";
import homeVideoIcon from "../../../assets/images/homeVideoIcon.png";
import VideoChat from "../../../assets/images/VideoChat.png";
import AddProfilePhoto from "../../auth/registration-image";
import { useDispatch, useSelector } from "react-redux";
import { getAccountsData, getProfileData } from "../../../services/authService";
import { connect } from "react-redux";
import SendGift from "../user/sendGift";
import heroImage from "../../../assets/images/heroImage.png";
import {
  set_profile,
  auth_details,
  set_chat_data,
  set_Show_Chat,
  set_Inbox_Data,
  set_Chat_Count,
  reset_States,
  set_Account_Data,
  set_Total_Credit,
} from "../../../reducer/auth";
import {
  getFriendList,
  openChatThread,
  getUnReadAlldata,
  requestGift,
  getSPProfileList,
  postSelectUser,
  getTotalCredit,
  indexSwitchUser,
} from "../../../services/homeService";
import RctPageLoader from "../../../component/RctPageLoader";
import search from "../../../assets/images/search.svg";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import defultUser from "../../../assets/images/defultUser.png";
import defultUserRound from "../../../assets/images/defaultRound.svg";
import { LOCALSTORE } from "../../../constant/default";
import Header from "../commons/header";
import Footer from "../../../component/footer";
import onlineCircle from "../../../assets/images/onlineCircle.svg";
import SelectDropDown from "../../../component/common/ui/SelectDropDown";
import ProfileModal from "../commons/profileModal";
import { reset_sp_home_scroll_position, homePageData, set_sp_home_page_scroll_position } from "../../../reducer/homePageSlice";

const Home: React.FC<any> = (props: any) => {
  const navigate = useNavigate();
  const [showProfilePhotoModal, setShowProfilePhotoModal] =
    useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userProfile, setUserprofile] = useState<any>();
  const login = useSelector(auth_details);
  const { spHomePageScrollPosition } = useSelector(homePageData);
  const [loading, setLoading] = useState<boolean>(false);

  const [clientsDetails, setClientsDetails] = useState<any>([]);

  const [chatData, setChatData] = useState<any>();
  const [giftShow, setGiftShow] = useState<boolean>(false);
  const loginId = localStorage.getItem(LOCALSTORE.id);
  const data = useSelector(auth_details);
  let user_details = data?.user_profile;
  const [optiosUser, setOptionUser] = useState<any>();
  const [selectedViewingProfile, setSelectedViewingProfile] = useState<any>();
  const [openForm, setOpenForm] = useState(false);
  const persistDispatch = useDispatch();
  const restorationRef = React.useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0)
    }, 0);
  }, [])

  useEffect(() => {
    window.addEventListener("popstate", () => {
      navigate("/consultant/home");
    });

    return (() => window.removeEventListener("popstate", () => { navigate("/consultant/home"); }))
  }, [])

  useEffect(() => {
    if (spHomePageScrollPosition && restorationRef && restorationRef?.current && clientsDetails?.length) {
      restorationRef?.current?.scrollIntoView({ behavior: 'instant' as any, block: 'center', inline: 'start' })
      persistDispatch(reset_sp_home_scroll_position())
    }
  }, [spHomePageScrollPosition, restorationRef, clientsDetails])

  useEffect(() => {
    const { dispatch } = props;
    setLoading(true);

    dispatch(getAccountsData())
      .then((res: any) => {
        dispatch(set_Account_Data(res.data));
        dispatch(getTotalCredit(res.data.id)).then((credit: any) => {
          setLoading(false);
          dispatch(set_Total_Credit(credit?.data))
        }).catch(() => {
          setLoading(false)
        })
      })
      .catch((err: any) => {
        setLoading(false);
      });
    getUserProfileDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [login?.login?.id, props]);

  const getUserProfileDetails = () => {
    const { dispatch } = props;
    setLoading(true)
    dispatch(getSPProfileList())
      .then((res: any) => {
        const userList: any = [];
        res.data.map((item: any) => {
          const obj: any = {
            name: item.username,
            id: item.id,
            profileImageUrl: item?.profileImageUrl
          };
          userList.push(obj);
        });
        setOptionUser(userList);
        setSelectedViewingProfile(userList[0].name)
        dispatch(postSelectUser(userList[0].id))
          .then((res: any) => {

            setClientsDetails(res?.data?.data);
            setLoading(false)
          })
          .catch((err: any) => {
            console.log("err");
          });
      })
      .catch((err: any) => {
        console.log("dfdsfds", err);
      });
  };


  const getunreadCount = () => {
    const { dispatch } = props;
    dispatch(getUnReadAlldata())
      .then((res: any) => {
        // setCount(res?.data?.data);
        dispatch(set_Chat_Count(res?.data?.data));
      })
      .catch((err: any) => { });
  };

  const closeShowProfile = () => {
    setShowProfilePhotoModal(false);
  };

  const onRedirectProfile = (data: any) => {
    persistDispatch(set_sp_home_page_scroll_position(data?.id))
    navigate(`/consultant/viewClientProfile/${data.id}`);
  };

  const myProfile = () => {
    navigate(`/consultant/profile`);
  };

  useEffect(() => {
    getunreadCount();
  }, []);

  const sendGiftUser = (data: any) => {
    createOpenChatThread(data?.id);
  };

  const createOpenChatThread = (id: any) => {
    const { dispatch } = props;
    dispatch(openChatThread(id))
      .then((res: any) => {
        setChatData(res?.data);
        setGiftShow(true);
      })
      .catch((err: any) => {
        const massage = err.response.data.message;
        toast.error(massage, {
          theme: "colored",
          autoClose: 5000,
        });
      });
  };

  const giftClose = () => {
    setGiftShow(false);
  };

  const onSubmitGift = (data: any) => {
    setLoading(true);
    const { dispatch } = props;
    const body = {
      threadId: chatData.threadId,
      chatAccessToken: chatData.myAccessToken,
      message: "gift",
      type: "gift",
      price: data,
    };
    dispatch(requestGift(body))
      .then((res: any) => {
        setGiftShow(false);
        setLoading(false);
      })
      .catch((err: any) => {
        setLoading(false);
        const massage = err.response.data.message;
        toast.error(massage, {
          theme: "colored",
          autoClose: 5000,
        });
      });
  };

  const onChangeUserProfile = (data: any) => {
    localStorage.setItem("userIndex", JSON.stringify(data));

    indexSwitchUser(data.id)
      .then((res: any) => {
        localStorage.setItem("indexData", JSON.stringify(res.data));
        setLoading(false)
      })
      .catch((err: any) => {
        console.log("fdjsgfds", err);
        setLoading(false)
      });
  };

  useEffect(() => {

    if (optiosUser && optiosUser?.length) {
      onChangeUserProfile(optiosUser[0])
    }

  }, [optiosUser])

  const onClickSelect = (e: any, name: string) => {
    setLoading(true)

    const id = e?.id;
    const { dispatch } = props;
    dispatch(postSelectUser(id))
      .then((res: any) => {
        onChangeUserProfile(e)
        setClientsDetails(res?.data?.data);
        setSelectedViewingProfile(name)
      })
      .catch((err: any) => {
        console.log("err");
        setLoading(false)
      });

    if (name === "create new") {
      setOpenForm(true)
    }
  };


  return (
    <>
      {loading && <RctPageLoader />}
      <div className="bg-[#F8F3FD] min-h-screen">
        <Header />
        <div
          className={`lg:mt-[-70px]`}
        >
          <img src={heroImage} width="100%" />
        </div>
        <div className="body-section">
          <div className={`min-h-screen`}>
            {searchQuery === "" && (
              <div className="md:block antialiased min-h-screen text-gray-900 md:px-6 py-6 max-h-[60%] overflow-y-auto">
                <div className="w-11/12 mx-auto">
                  <div className="lg:ml-5 font-semibold text-[12px] mb-1 text-[#7A7A7A]">
                    Viewing Profile
                  </div>
                  <SelectDropDown onClickSelect={onClickSelect} options={optiosUser} selectedValue={selectedViewingProfile} />
                  {clientsDetails.length === 0 ? (
                    <div className="px-4 mt-2 font-[Montserrat]">
                      {/* No client found. Enter username to connect. */}
                    </div>
                  ) : (
                    <div className="flex flex-wrap">
                      <>
                        {clientsDetails.map((client: any) => {
                          return (
                            <div className="w-full py-4 md:px-4 sm:w-1/2 md:w-1/2 xl:w-1/4">
                              <div
                                className="w-[290px] h-[370px] mx-auto rounded-md shadow-lg bg-white"
                                onClick={() => onRedirectProfile(client)}
                                ref={spHomePageScrollPosition === client?.id ? restorationRef : null}
                              >
                                {client.profileImageUrl === null ||
                                  client.profileImageUrl === "" ? (
                                  <div className="w-[290px] h-[290px]">
                                    <img
                                      className="pt-[82px] pl-[70px]"
                                      src={defultUser}
                                      alt="product"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-full h-[280px] overflow-hidden">
                                    <img
                                      className="w-full min-h-[280px] rounded-md"
                                      src={client.profileImageUrl}
                                      alt="product"
                                    />
                                  </div>
                                )}
                                <div className="px-4 py-2">
                                  <p className="text-base font-[Montserrat] font-semibold flex items-center">
                                    <p className="max-w-[90%] line-clamp-1 break-all">{client.username}</p>
                                  </p>
                                  <p
                                    className="text-[#000000] font-[Montserrat] text-[10px] overflow-hidden min-h-[45px]"
                                    style={{
                                      display: "-webkit-box",
                                      WebkitLineClamp: "3",
                                      WebkitBoxOrient: "vertical",
                                    }}
                                  >
                                    {client.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    </div>
                  )}
                  {/* {clientsDetails.length !== 0 && (
                    <div className="mt-16 mb-6 w-100 flex justify-center">
                      <button className="border border-2 border-primary rounded-full py-2 px-4 text-primary">
                        Load more
                      </button>
                    </div>
                  )} */}
                </div>
              </div>
            )}
          </div>
          {giftShow && (
            <SendGift
              close={giftClose}
              chatUser={chatData}
              onSubmitGift={onSubmitGift}
              lable="Request Gift"
            />
          )}

          {(showProfilePhotoModal &&
            (userProfile?.profileImageUrl === null ||
              userProfile?.profileImageUrl === "")) ||
            userProfile?.description === "" ||
            (userProfile?.description === null && (
              <>
                {" "}
                <AddProfilePhoto cloes={closeShowProfile} />
              </>
            ))}

          {openForm && <ProfileModal setShowModal={setOpenForm} user_details={user_details} getSPProfileData={getUserProfileDetails} />}
        </div>

        <Footer />
      </div>
    </>
  );
};

export default connect()(Home);
