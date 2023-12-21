import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import heroImage from "../../../assets/images/heroImage.png";

import chatIcon from "../../../assets/images/chatIcon.png";
import menuPhoneCall from "../../../assets/images/menuPhoneCall.svg";
import navSearch from "../../../assets/images/navSearch.svg";
import voiceCall2 from "../../../assets/images/voiceCall2.png";
import videoCalls from "../../../assets/images/videoCalls.png";
import likedImage from "../../../assets/images/solidHeart.png";
import unLikedImage from "../../../assets/images/regularHeart.png";
import { useDispatch, useSelector } from "react-redux";
import { getProfileData } from "../../../services/authService";
import { connect } from "react-redux";
import GiftSent from "./giftSent";
import Header from "../commons/header";
import SendGift from "./sendGift";
import Footer from "../../../component/footer";
import {
  set_profile,
  auth_details,
  set_Chat_Count,
  set_Total_Credit,
} from "../../../reducer/auth";
import RctPageLoader from "../../../component/RctPageLoader";
import {
  getuserData,
  getUnReadAlldata,
  SendGiftData,
  getSPProfileList,
  putFavorites,
  postSelectUser,
  getUserCategories,
  getTotalCredit,
  updateClientStatus,
} from "../../../services/homeService";
import { useNavigate } from "react-router-dom";
import defultUser from "../../../assets/images/defultUser.png";
import TopUpModal from "./topUpModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LOCALSTORE } from "../../../constant/default";
import VideoChat from "../../../assets/images/VideoChat.png";
import { reset_home_scroll_position, homePageData, set_home_scroll_position, set_user_home_persist_page_no, set_user_home_persist_page_data } from "../../../reducer/homePageSlice";
import InfiniteScroll from "react-infinite-scroller";
import { CircularProgress } from "@mui/material";
import { UserList } from "../../auth/userJson";
import { debounce, result } from "lodash";

const Home: React.FC<any> = (props: any) => {
  const navigate = useNavigate();
  const persistDispatch = useDispatch();
  const [userProfile, setUserprofile] = useState<any>(null);
  const login = useSelector(auth_details);
  const { homePageScrollPosition, userHomePersistPageNo, userHomePagePersistData } = useSelector(homePageData);
  const [loading, setLoading] = useState<boolean>(false);
  const [clientsDetails, setClientsDetails] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [giftShow, setGiftShow] = useState<boolean>(false);
  const [topUp, setTopUP] = useState(false);
  const [giftSent, setGiftSent] = useState(false);
  const [chatData, setChatData] = useState<any>();
  const loginId = localStorage.getItem(LOCALSTORE.id);
  const [optiosUser, setOptionUser] = useState<any>();
  const [insufficientCredits, setInsufficientCredits] =
    useState<boolean>(false);
  const [categories, setcategories] = useState<any>([]);
  const [selectCat, setSelectCat] = useState<any>("cat");
  const [filterBody, setFilterBody] = useState<any>({
    // sort: [{ selector: "created", desc: true }],
    requireTotalCount: true,
  });
  const [page, setPage] = useState<number>(1);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const restorationRef = React.useRef<null | HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>();
  const [cardLoading, setCardLoading] = useState(false);

  const [searchText, setSearchText] = useState<string | null>(null)

  useEffect(() => {
    const onBeforeUnload = (ev: any) => {
      window.scrollTo(0, 0)
      persistDispatch(set_user_home_persist_page_no(null))
      persistDispatch(set_user_home_persist_page_data(null))
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const handleUpdateClientStatus = () => {
    const { dispatch } = props;

    const includeIds = clientsDetails.map((user: any) => {
      return user.id
    })

    const body = {
      ids: includeIds
    }

    dispatch(updateClientStatus(body)).then((res: any) => {
      console.log("res", res)
      Object.freeze(clientsDetails)
      const copyClientDetails = [...clientsDetails]

      const arr = copyClientDetails.map((client) => {
        Object.freeze(client);
        const obj = { ...client }
        res.data.map((result: any) => {
          if (result?.userId === client?.id) {
            obj.status = result.status
          }
        })

        return obj
      })

      setClientsDetails(arr)
    })
  }

  useEffect(() => {
    let interval = setInterval(() => {
      handleUpdateClientStatus()
    }, 180000);
    return () => {
      clearInterval(interval);
    };
  }, [clientsDetails]);

  useEffect(() => {
    window.addEventListener("popstate", () => {
      navigate("/user/home");
    });

    return (() => window.removeEventListener("popstate", () => { navigate("/user/home"); }))
  }, []);

  useEffect(() => {
    if (clientsDetails.length) {
      persistDispatch(set_user_home_persist_page_data(clientsDetails))
    }

    if (page > 1) {
      persistDispatch(set_user_home_persist_page_no(page))
    }
  }, [page])

  useEffect(() => {
    if (homePageScrollPosition && restorationRef && restorationRef?.current && clientsDetails?.length) {
      restorationRef?.current?.scrollIntoView({ behavior: 'instant' as any, block: 'center', inline: 'start' })
      persistDispatch(reset_home_scroll_position())
    }
  }, [homePageScrollPosition, restorationRef, clientsDetails]);

  const myPromise = new Promise((resolve, reject) => {
    if (userHomePersistPageNo && userHomePagePersistData) {
      resolve({ userData: userHomePagePersistData, pageNo: userHomePersistPageNo })
    } else {
      reject("")
    }
  });

  useEffect(() => {
    myPromise.then((res: any) => {
      setClientsDetails(res.userData)
      setPage(res?.pageNo)
    }).catch(() => {
      getFriendDetails();
    })
  }, [])

  useEffect(() => {
    if(searchText !== null) {
      setClientsDetails([])
      setNoMoreData(false)
      getFriendDetails(true)
    }
  }, [searchText])

  useEffect(() => {
    getAllUser();
    getUserProfileDetails();
    getCategoriesList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [login?.login?.id, props]);

  const getAllUser = () => {
    const { dispatch } = props;
    setLoading(true);
    dispatch(getProfileData(loginId))
      .then((res: any) => {
        setUserprofile(res.data);
        dispatch(set_profile(res.data));
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
  };

  const getCategoriesList = () => {
    const { dispatch } = props;
    dispatch(getUserCategories())
      .then((res: any) => {
        setcategories(res?.data);
      })
      .catch((err: any) => {
        console.log("dfsdgh", err);
      });
  };

  const getFriendDetails = (resetClientsDetails?: boolean) => {
    if (abortControllerRef.current) {
      return;
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setCardLoading(true);
    const { dispatch } = props;

    const excludeIds = clientsDetails.map((user: any) => {
      return user.id
    })

    const body = {
      ...filterBody,

      pageNo: resetClientsDetails ? 1 : page ? page : 1,
      pageSize: 20,
      searchText: searchText ? searchText : ''
    }

    if(!resetClientsDetails) {
      body.excludeIds = excludeIds
    }

    dispatch(getuserData(body))
      .then((res: any) => {
        setCardLoading(false);
        setLoading(false);
        if (res.data.data.length === 0 && !resetClientsDetails) {
          setNoMoreData(true);
        } else if (resetClientsDetails && res.data.data.length === 0) {
          setClientsDetails([]);
          setPage(1);
        } else if (resetClientsDetails && res.data.data.length !== 0) {
          setClientsDetails(res.data.data);
          setPage(2);
        } else {
          setClientsDetails((oldArray: any) => [...oldArray, ...res.data.data]);
          setPage(page + 1);
        }
      })
      .catch((err: any) => {
        setCardLoading(false);
        setLoading(false);
      }).finally(() => {
        abortControllerRef.current = null;
      })
  };

  const onRedirectProfile = (data: any) => {
    persistDispatch(set_home_scroll_position(data?.id))
    navigate(`/user/profileDetails/${data?.uniqueUsername}`);
  };

  const onCloseGiftSent = () => {
    setGiftSent(false);
  };

  const onTopUpCancel = () => {
    setTopUP(false);
  };

  const onTopCredit = () => {
    setInsufficientCredits(false);
    setGiftShow(true);
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
  useEffect(() => {
    getunreadCount();
  }, []);

  const giftClose = () => {
    setGiftShow(false);
  };

  const onInsufficientCredits = () => {
    setInsufficientCredits(true);
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
    dispatch(SendGiftData(body))
      .then((res: any) => {
        dispatch(getTotalCredit(login?.totalCredit?.accountId)).then((credit: any) => {
          setLoading(false);
          dispatch(set_Total_Credit(credit?.data))
        }).catch(() => {
          setLoading(false)
        });
        setGiftShow(false);
        setGiftSent(true);
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

  const getUserProfileDetails = () => {
    const { dispatch } = props;
    setLoading(true);
    dispatch(getSPProfileList())
      .then((res: any) => {
        const userList: any = [];
        res.data.map((item: any) => {
          const obj: any = {
            name: item.username,
            id: item.id,
          };
          userList.push(obj);
        });
        setOptionUser(userList);
        dispatch(postSelectUser(userList[0].id))
          .then((res: any) => {
            if (res?.data?.data) setClientsDetails(res?.data?.data);
            setLoading(false);
          })
          .catch((err: any) => {
            console.log("err");
          });
      })
      .catch((err: any) => {
        console.log("dfdsfds", err);
      });
  };

  const onGotoFavorite = (data: any, value: any) => {
    const { dispatch } = props;
    setLoading(true);
    dispatch(putFavorites(data?.id, value))
      .then((res: any) => {
        if (res.data.isSuccess) {
          toast.success("Profile Favorites Successfull!", {
            theme: "colored",
            autoClose: 5000,
          });
          getFriendDetails();
          setLoading(false);
        }
      })
      .catch((err: any) => {
        setLoading(false);
      });
  };

  const ongoTocategory = (cat: any) => {
    const tempFilterBody = filterBody;
    tempFilterBody["filter"] = [["categories", "contains", `#${cat?.name}`]];
    setFilterBody(tempFilterBody);
    getFriendDetails(true);
    setSelectCat(cat?.name);
  };

  const ongoTocategoryAll = () => {
    const tempFilterBody = filterBody;
    tempFilterBody["filter"] = [];
    setFilterBody(tempFilterBody);
    getFriendDetails(true);
    setSelectCat("cat");
  };

  const onChange = (e: any) => {
    setSearchText(e.target.value)
  };

  const debouncedOnChange = debounce(onChange, 1000);

  return (
    <>
      {loading && <RctPageLoader />}
      <div className={`bg-[#F8F3FD] min-h-screen`}>
        <Header />
        <div className={`lg:mt-[-70px]`}>
          <img src={heroImage} width="100%" />
        </div>
        <div className="body-section">
          <div className={`min-h-screen`}>
            <div className="mt-6 w-full px-3 md:px-6">

              <div className="flex px-6 py-2 rounded-full border-2 border-primary w-full bg-[#F8F3FD]">
                <input
                  className="grow placeholder-primary placeholder-opacity-70 bg-[#F8F3FD] outline-none bottom-0 focus:outline-none text-lg font-semibold text-primary"
                  placeholder="Search here..."
                  onChange={debouncedOnChange}
                />
                <img src={navSearch} alt="search" className="pl-2" />
              </div>
            </div>

            {searchQuery === "" && (
              <div className="md:block antialiased min-h-screen text-gray-900 px-3 md:px-6 py-6 max-h-[60%] ">
                <div className="">
                  <div className="flex max-w-full overflow-auto gap-2 items-center smallScroll pb-2">
                    <div
                      className={`border cursor-pointer min-w-fit px-6 border-2 border-primary flex font-semibold place-content-center py-4 rounded-full text-[14px] w-44
                    ${selectCat !== "cat"
                          ? "text-primary bg-white"
                          : "bg-primary text-white"
                        }
                    `}
                      onClick={() => ongoTocategoryAll()}
                    >
                      All Categories
                    </div>

                    {/* <div className="flex flex-wrap cursor-pointer"> */}
                    {categories.map((category: any) => (
                      <div
                        className={`text-center cursor-pointer min-w-fit px-6 font-semibold text-primary text-sm text-primary border border-2 border-primary place-content-center py-4 rounded-full ${selectCat === category.name
                          ? "bg-primary text-white border border-2 border-primary"
                          : ""
                          }`}
                        onClick={() => ongoTocategory(category)}
                      >
                        {category?.name}
                      </div>
                    ))}
                    {/* </div> */}
                  </div>
                  {(clientsDetails.length === 0 && !loading && !cardLoading) ? (
                    <div className="text-primary flex justify-center px-4 font-bold text-2xl mt-8 font-[Montserrat]">
                      No client found.
                    </div>
                  ) : (
                    <InfiniteScroll
                      pageStart={1}
                      initialLoad={false}
                      loadMore={() => { !noMoreData && getFriendDetails() }}
                      hasMore={!noMoreData}
                      isReverse={false}
                      threshold={1500}
                      loader={
                        <>
                          {cardLoading ?
                            <div className="w-full flex justify-center">
                              <CircularProgress style={{ color: "#37085B" }} thickness={7} />
                            </div>
                            : null
                          }
                        </>
                      }
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-x-4 gap-y-8 2xl:gap-x-4 2xl:gap-y-8 mt-4">
                        <>
                          {clientsDetails.map((client: any) => {
                            return (
                              <div className="w-full "
                                style={{ scrollMarginTop: "30px" }}
                                onClick={() => onRedirectProfile(client)}
                                ref={homePageScrollPosition === client?.id ? restorationRef : null}
                              >
                                <div className="w-full max-w-[300px] h-[405px] mx-auto rounded-md shadow-lg bg-white cursor-pointer">
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
                                    <div className="relative h-[280px] overflow-hidden">
                                      <img
                                        className="w-full min-h-[280px] rounded-t-md"
                                        src={client.profileImageUrl}
                                        alt="clien profile"
                                      />
                                      <div className="absolute cursor-pointer right-3 top-3">
                                        {client.isFavorite ? (
                                          <img
                                            className="w-11/12"
                                            src={likedImage}
                                            alt="liked"
                                            onClick={() =>
                                              onGotoFavorite(client, false)
                                            }
                                          />
                                        ) : (
                                          <img
                                            className="w-11/12"
                                            src={unLikedImage}
                                            alt="unliked"
                                            onClick={() =>
                                              onGotoFavorite(client, true)
                                            }
                                          />
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  <div
                                    className="px-4 py-2"
                                  // onClick={() => onRedirectProfile(client)}
                                  >
                                    <div className="text-base font-[Montserrat] font-semibold flex items-center">
                                      <span
                                        className={`w-[12px] h-[12px] rounded-full ${client.status === "Available"
                                          ? "bg-[#20B514]"
                                          : client.status === "Busy" ||
                                            client.status === "DoNotDisturb"
                                            ? "bg-[#E99312]"
                                            : "bg-[#EBEBEB]"
                                          } mr-2`}
                                      ></span>
                                      <p className="max-w-[90%] line-clamp-1 break-all">{client.username}</p>
                                    </div>
                                    <p
                                      className="text-[#000000] font-[Montserrat] text-[14px] overflow-hidden min-h-[45px]"
                                      style={{
                                        display: "-webkit-box",
                                        WebkitLineClamp: "2",
                                        WebkitBoxOrient: "vertical",
                                      }}
                                    >
                                      {client.description}
                                    </p>
                                    <div>Services</div>
                                    <div className="grid grid-cols-5 gap-2">
                                      <div className="flex items-center">
                                        <img
                                          src={chatIcon}
                                          className="w-[18px] h-[18px]"
                                        />
                                        <p className="ml-1 text-[#2F2F2F] font-bold text-[12px]">
                                          $
                                          {
                                            client?.communication?.shortMessageUnitPrice ?? 0
                                          }
                                        </p>
                                      </div>
                                      {client?.enablePhoneCall &&
                                        <div className="flex items-center">
                                          <img
                                            src={menuPhoneCall}
                                            className="w-[18px] h-[18px]"
                                          />
                                          <p className="ml-1 text-[#2F2F2F] font-bold text-[12px]">
                                            $
                                            {
                                              client?.communication?.phoneCallUnitPrice ?? 0
                                            }
                                          </p>
                                        </div>
                                      }

                                      {client?.enableAudioCall &&
                                        <div className="flex items-center">
                                          <img
                                            src={voiceCall2}
                                            className="w-[18px] h-[18px]"
                                            alt="voicecall"
                                          />
                                          <p className="ml-1 text-[#2F2F2F] font-bold text-[12px]">
                                            $
                                            {
                                              client?.communication?.audioCallUnitPrice ?? 0
                                            }
                                          </p>
                                        </div>
                                      }


                                      {client?.enableOneWayVideoCall &&
                                        <div className="flex items-center">
                                          <img
                                            src={videoCalls}
                                            className="w-[18px] h-[18px]"
                                            alt="videocall"
                                          />
                                          <p className="ml-1 text-[#2F2F2F] font-bold text-[12px]">
                                            $
                                            {
                                              client?.communication?.videoCallOneWayUnitPrice ?? 0
                                            }
                                          </p>
                                        </div>
                                      }

                                      {client?.enableTwoWayVideoCall &&
                                        <div className="flex items-center">
                                          <img
                                            src={VideoChat}
                                            className="w-[18px] h-[18px]"
                                            alt="videochat"
                                          />
                                          <p className="ml-1 text-[#2F2F2F] font-bold text-[12px]">
                                            $
                                            {
                                              client?.communication?.videoCallTwoWayUnitPrice ?? 0
                                            }
                                          </p>
                                        </div>
                                      }

                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      </div>
                    </InfiniteScroll>
                  )}
                  {/* {clientsDetails.length !== 0 && (
                    <div className="mt-16 mb-6 w-100 flex justify-center">
                      <button className="border border-2 border-primary rounded-full py-2 px-4 text-primary" onClickCapture={() => {onClickLoadMore()}}>
                        Load more
                      </button>
                    </div>
                  )} */}
                </div>
              </div>
            )}
          </div>
          {giftSent && (
            <GiftSent onMainClose={onCloseGiftSent} chatUser={chatData} />
          )}
          {giftShow && (
            <SendGift
              close={giftClose}
              chatUser={chatData}
              onSubmitGift={onSubmitGift}
              onInsufficientCredits={onInsufficientCredits}
              lable="Send Gift"
            />
          )}
          {insufficientCredits && (
            <TopUpModal
              onCancel={onTopCredit}
              onSuccess={onTopCredit}
              amount=""
              insufficientCredits={true}
            />
          )}
          {topUp ? (
            <TopUpModal
              onCancel={onTopUpCancel}
              onSuccess={onTopUpCancel}
              amount=""
              insufficientCredits={false}
            />
          ) : (
            ""
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default connect()(Home);
