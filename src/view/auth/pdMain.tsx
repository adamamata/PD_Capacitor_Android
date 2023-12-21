import React, { useEffect, useState, useRef } from "react";
import VideoChat from "../../assets/images/VideoChat.png";
import voiceCall2 from "../../assets/images/voiceCall2.png";
import videoCalls from "../../assets/images/videoCalls.png";
import defultUser from "../../assets/images/defultUser.png";
import chatIcon from "../../assets/images/chatIcon.png";
import menuPhoneCall from "../../assets/images/menuPhoneCall.svg";
import { useNavigate } from "react-router-dom";
import HeaderHome from "../dashboard/commons/headerHome";
import Footer from "../../component/footer";
import heroImage from "../../assets/images/heroImage.png";
import likedImage from "../../assets/images/solidHeart.png";
import unLikedImage from "../../assets/images/regularHeart.png";
import ConformationModal from "./adultConformationModal";
import { GetToken, LOCALSTORE, getRole, siteKey } from "../../constant/default";
import { connect, useDispatch, useSelector } from "react-redux";
import { getPublicHomPageSpData } from "../../services/homeService";
import { toast } from "react-toastify";
import InfiniteScroll from "react-infinite-scroller";
import RctPageLoader from "../../component/RctPageLoader";
import { publicData, reset_public_scroll_position, set_public_page_scroll_position, set_public_persist_page_no, set_public_sp_data } from "../../reducer/publicDataSlice";
import { CircularProgress } from "@mui/material";
import phoneDarlingsWebBanner from "../../assets/images/phoneDarlingsWebBanner.gif";
import { useQuery } from "../../utils/useQueryHoook";
import ReCAPTCHA from "react-google-recaptcha";
import { affiliatesVisits } from "../../services/authService";
import WelcomePopup from "./welcomePopup"; 
import { debounce } from "lodash";
import navSearch from "../../assets/images/navSearch.svg";

function PdMain(props: any) {
  const persistDispatch = useDispatch()
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState<string>("yes");
  const [userList, setUserList] = useState<any>([])
  const [page, setPage] = useState<number>(1);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const restorationRef = React.useRef<null | HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>();
  const query = useQuery();
  const refCode = query.get('refcode');
  const captchaRef = useRef(null);

  const [welcomePopup, setWelComePopUp] = useState(true)

  const [searchText, setSearchText] = useState<string | null>(null)

  const { publicSpData, publicPageScrollPosition, publicPagePersistPageNo } = useSelector(publicData);

  useEffect(() => {
    const { dispatch } = props;

    if (refCode) {
      let token: any = captchaRef?.current;
      let tokendata = token?.executeAsync();
      tokendata.then((res: any) => {
        if (res) {
          dispatch(affiliatesVisits(refCode, res)).then(() => { }).catch(() => { })
        }
      })
    }
  }, [refCode])

  useEffect(() => {
    const onBeforeUnload = (ev: any) => {
      window.scrollTo(0, 0)
      persistDispatch(set_public_persist_page_no(null))
      persistDispatch(set_public_sp_data(null))
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  useEffect(() => {
    window.addEventListener("popstate", () => {
      navigate("/");
    });

    return (() => window.removeEventListener("popstate", () => { navigate("/"); }))
  }, []);

  const redirectRegister = () => {
    navigate(`/login`, { state: { refCode: refCode } });
  };

  const categories = [
    "Sexy Woman",
    "Sissies",
    "Domination (Dom)",
    "Submissive (Sub)",
    "GFE",
  ];

  const getSpData = (resetClientsDetails?: boolean) => {
    if (abortControllerRef.current) {
      return;
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const excludeIds = userList.map((user: any) => {
      return user.id
    })

    setIsLoading(true)
    const { dispatch } = props;
    const body: any = {
      requireTotalCount: true,
      pageNo: resetClientsDetails ? 1 : page ? page : 1,
      pageSize: 20,
      searchText: searchText ? searchText : ''
      // excludeIds: excludeIds
    }

     if(!resetClientsDetails) {
      body.excludeIds = excludeIds
    }

    dispatch(getPublicHomPageSpData(body)).then((res: any) => {
      if (res.data.data.length === 0 && !resetClientsDetails) {
        setNoMoreData(true);
      } else if (resetClientsDetails && res.data.data.length === 0) {
        setUserList([]);
        setPage(1);
      } else if (resetClientsDetails && res.data.data.length !== 0) {
        setUserList(res.data.data);
        setPage(2);
      } else {
        setUserList((oldArray: any) => [...oldArray, ...res.data.data]);
        setPage(page + 1);
      }
    }).catch((err: any) => {
      toast.error("Something Went Wrong...!!!")
    }).finally(() => {
      abortControllerRef.current = null;
      setIsLoading(false)
    })
  }

  // useEffect(() => {
  //   getSpData()
  //   const value: any = localStorage.getItem(LOCALSTORE.isOver18);
  //   if (value !== null) {
  //     setShowModal(value);
  //   } else {
  //     setShowModal("yes");
  //   }
  // }, []);

  useEffect(() => {
    if (userList.length) {
      persistDispatch(set_public_sp_data(userList))
    }

    if (page > 1) {
      persistDispatch(set_public_persist_page_no(page))
    }
  }, [page])

  const myPromise = new Promise((resolve, reject) => {

    if (publicPagePersistPageNo && publicSpData) {
      resolve({ userData: publicSpData, pageNo: publicPagePersistPageNo })
    } else {
      reject("")
    }
  });

  useEffect(() => {
    myPromise.then((res: any) => {
      setUserList(res.userData)
      setPage(res?.pageNo)
    }).catch(() => {
      getSpData();
    })
  }, [])

  useEffect(() => {
    if(searchText !== null) {
      setIsLoading(true)
      setUserList([])
      setPage(1)
      setNoMoreData(false)
      getSpData(true)
    }
  }, [searchText])  


  const onRedirectProfile = (data: any) => {
    persistDispatch(set_public_page_scroll_position(data?.id))
    navigate(`/user/profileDetails/${data?.uniqueUsername}`);
  };

  useEffect(() => {
    if (publicPageScrollPosition && restorationRef && restorationRef?.current && userList?.length) {
      restorationRef?.current?.scrollIntoView({ behavior: 'instant' as any, block: 'center', inline: 'start' })
      persistDispatch(reset_public_scroll_position())
    }
  }, [publicPageScrollPosition, restorationRef, userList]);

  const onLoadMore = () => {
    if (!noMoreData) {
      getSpData()
    }
  }

  const welcomePopupClose = () => {
    setWelComePopUp(false)
  }

  const onChange = (e: any) => {
    setSearchText(e.target.value)
  };

  const debouncedOnChange = debounce(onChange, 1000);

  return (
    <div className="bg-[#F8F3FD] min-h-screen">
      <HeaderHome />
      <div
        className={`lg:mt-[-70px]`}
      >
        <img src={phoneDarlingsWebBanner} width="100%" />
      </div>
      <div className="body-section">
        <div className={`min-h-screen`}>
          <div className="md:block antialiased min-h-screen text-gray-900 md:px-6 py-6 max-h-[60%]  pb-2">
            <div className="">
              <div className="flex max-w-full overflow-y-auto gap-2 items-center smallScroll pb-2">
                <div className={`border cursor-pointer min-w-fit px-6 border-2 border-primary flex font-semibold place-content-center py-4 rounded-full text-[14px] w-44 bg-primary text-white`}>
                  All Categories
                </div>

                {categories.map((category) => (
                  <div className={`text-center cursor-pointer min-w-fit px-6 font-semibold text-primary text-sm text-primary border border-2 border-primary place-content-center py-4 rounded-full`}
                    onClick={redirectRegister}
                  >
                    {category}
                  </div>
                ))}
              </div>

              <div className="mt-2 w-full px-3 md:px-0">
                <div className="flex px-6 py-2 rounded-full border-2 border-primary w-full bg-[#F8F3FD]">
                  <input
                    className="grow placeholder-primary placeholder-opacity-70 bg-[#F8F3FD] outline-none bottom-0 focus:outline-none text-lg font-semibold text-primary"
                    placeholder="Search here..."
                    onChange={debouncedOnChange}
                  />
                  <img src={navSearch} alt="search" className="pl-2" />
                </div>
              </div>
              
              {userList.length === 0 && !isLoading ? (
                <div className="text-primary flex justify-center px-4 font-bold text-2xl mt-8 font-[Montserrat]">
                  No client found.
                </div>
              ) : (
                <InfiniteScroll
                  pageStart={1}
                  initialLoad={false}
                  loadMore={() => { !noMoreData && onLoadMore() }}
                  hasMore={!noMoreData}
                  isReverse={false}
                  threshold={1500}
                  loader={
                    <>
                      {isLoading ?
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
                      {userList.map((client: any) => {
                        return (
                          <div className="w-full "
                            style={{ scrollMarginTop: "30px" }}
                            onClick={() => onRedirectProfile(client)}
                            ref={publicPageScrollPosition === client?.id ? restorationRef : null}
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
                                        onClick={() => { }
                                          // onGotoFavorite(client, false)
                                        }
                                      />
                                    ) : (
                                      <img
                                        className="w-11/12"
                                        src={unLikedImage}
                                        alt="unliked"
                                        onClick={() => { }
                                          // onGotoFavorite(client, true)
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
                                  <div className="max-w-[90%] line-clamp-1 break-all">
                                    {client.username}
                                  </div>
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
              {/* <div className="mt-16 mb-6 w-100 flex justify-center" onClick={redirectRegister}>
                <button className="border border-2 border-primary rounded-full py-2 px-4 text-primary">
                  Load more
                </button>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div>
          {" "}
          <ReCAPTCHA
            sitekey={siteKey}
            ref={captchaRef}
            size="invisible"
          />
        </div>
      </div>

      <Footer />
      {/* {showModal === "yes" && <ConformationModal />} */}

      {welcomePopup ?
        <WelcomePopup
          onClickOnCancel={welcomePopupClose}
        /> : null
      }

    </div>
  );
}

export default connect()(PdMain);
