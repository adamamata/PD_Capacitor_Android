import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  auth_details,
  set_Account_Data,
  set_Total_Credit,
  set_profile,
} from "../../../reducer/auth";
import ChangePassword from "../../auth/changePassword";
import { useNavigate } from "react-router-dom";
import {
  changeStatusvideoCall,
  getUserDetails,
  getCardData,
  myTransctions,
  changeBusyStatus,
  getSPProfileList,
  getTotalCredit,
  getSharableUrl,
} from "../../../services/homeService";
import { connect } from "react-redux";
import RctPageLoader from "../../../component/RctPageLoader";
import defultUser from "../../../assets/images/defaultRound.svg";
import WithDrawModal from "./withDrawModal";
import AddNewBank from "./addNewBank";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import Header from "../commons/header";
import MyProfileCard from "../commons/myProfileCard";
import ProfileModal from "../commons/profileModal";
import EditMyMenuItems from "./editMyMenuItems";
import { deleteProfile, getAccountsData } from "../../../services/authService";
import InfiniteScroll from "react-infinite-scroller";
import { LOCALSTORE } from "../../../constant/default";
import ProfilePreviewModal from "./profilePreview";
import DeleteProfileModal from "./deleteProfileModal";
import UrlShareModal from "./urlShareModal";

const UserProfile = (props: any) => {
  const navigate = useNavigate();
  const details = useSelector(auth_details);
  let user_details = details?.user_profile;
  const accountData = details?.accountData;

  const [changePassword, seChangePassword] = useState(false);
  const [busy, setBusy] = useState(true);
  const [videoCall, setvideoCall] = useState("");
  const [isEditMyMenu, setIsEditMyMenu] = useState<boolean>(false);
  const [isLoading, setisLoading] = useState(false);
  const [withdraw, setWithdraw] = useState(false);
  const [navbar, setNavbar] = useState<boolean>(false);
  const [showAddNewCard, setShowAddNewCard] = useState(false);
  const [cards, setCards] = useState<any>([]);
  const [activity, setActivity] = useState<any>([]);
  const [limit, setLimit] = useState<any>(10);
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [withdrawAddCard, setWithdrawAddCard] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [profileData, setProfileData] = useState<any>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [page, setPage] = useState<number>(1);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [previewModal, setPreviewModal] = useState<boolean>(false);
  const [deleteProfileModal, setDeleteProfileModal] = useState<boolean>(false);
  const [selectedProfileForDelete, setSelectedProfileForDelete] = useState(null);
  const [urlShareModal, setUrlShareModal] = useState<boolean>(false);
  const [profileUrl, setProfileUrl] = useState("")

  const onCancleModal = () => {
    seChangePassword(false);
  };

  const onchangePassword = () => {
    seChangePassword(true);
  };

  const editProfile = () => {
    navigate("/consultant/editProfile");
  };

  const updateCredit = () => {
    setisLoading(true)
    const { dispatch } = props;
    dispatch(getTotalCredit(details?.totalCredit?.accountId || accountData?.id)).then((credit: any) => {
      dispatch(set_Total_Credit(credit?.data))
      setisLoading(false);
    }).catch(() => {
      setisLoading(false);
    })
  };

  useEffect(() => {
    updateCredit();
    getUserData();
    getCardDetails();
    getTransctionDetails();
    getSPProfileData();
    getAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!openForm) {
      setSelectedProfile(null);
    }
  }, [openForm]);

  const getSPProfileData = () => {
    const { dispatch } = props;
    dispatch(getSPProfileList())
      .then((res: any) => {
        setProfileData(res.data);
      })
      .catch((err: any) => { });
  };

  const onChangeRadio = (e: any) => {
    const { dispatch } = props;
    setvideoCall(e.target.value);
    let status = true;
    if (e.target.value === "videoCall") {
      status = true;
    } else {
      status = false;
    }
    setisLoading(true);
    dispatch(changeStatusvideoCall(user_details?.id, status))
      .then((res: any) => {
        if (res.data.isSuccess) {
          toast.success("Update status Successfull!", {
            theme: "colored",
            autoClose: 5000,
          });

          getUserData();
          setisLoading(false);
        }
      })
      .catch((err: any) => {
        const massage = err.response.data.message;
        toast.error(massage, {
          theme: "colored",
          autoClose: 5000,
        });
        setisLoading(false);
      });
  };

  const getCardDetails = () => {
    setisLoading(true);
    const { dispatch } = props
    dispatch(getCardData(localStorage.getItem(LOCALSTORE.id)))
      .then((res: any) => {
        setCards(res?.data);
        setisLoading(false);
      })
      .catch((err: any) => {
        console.log("err", err);
        setisLoading(false);
      });
  };

  const getTransctionDetails = () => {
    const { dispatch } = props;
    dispatch(myTransctions(page))
      .then((res: any) => {
        setActivity(res.data);
        setPage(page + 1);
        if (res.data.length === 0) {
          setNoMoreData(true);
        }
      })
      .catch((err: any) => {
        const massage = err.response.data.message;
        toast.error(massage, {
          theme: "colored",
          autoClose: 5000,
        });
      });
  };

  const getMoreTransctionDetails = () => {
    const { dispatch } = props;
    dispatch(myTransctions(page))
      .then((res: any) => {
        setActivity((prev: any) => [...prev, ...res.data]);
        setPage(page + 1);
        if (res.data.length === 0) {
          setNoMoreData(true);
        }
      })
      .catch((err: any) => {
        const massage = err.response.data.message;
        toast.error(massage, {
          theme: "colored",
          autoClose: 5000,
        });
      });
  };

  const getUserData = () => {
    setisLoading(true);
    const { dispatch } = props;
    dispatch(getUserDetails(accountData?.id))
      .then((res: any) => {
        setisLoading(false);
        if (res.data.enableVoiceAndVideo) {
          setvideoCall("videoCall");
        } else {
          setvideoCall("voiceCall");
        }
        setBusy(res.data.isBusy);
        setDoNotDisturb(res.data.doNotDisturb);
        dispatch(set_profile(res.data));
      })
      .catch((err: any) => {
        console.log("err", err);
        setisLoading(false);
      });
  };

  const onEditCancle = () => {
    setIsEditMyMenu(false);
  };

  const onWithdrawCancel = () => {
    setWithdraw(false);
  };

  const navbarClick = () => {
    setNavbar(!navbar);
  };

  const onCancleAddNewCardModal = () => {
    if (withdrawAddCard) {
      setWithdrawAddCard(false);
      setWithdraw(true);
    } else {
      setShowAddNewCard(false);
    }
  };

  const setMoreActivity = () => {
    setLimit(limit + 10);
  };

  const onBusySwitchChange = (e: any) => {
    setBusy(!e.target.checked);

    const { dispatch } = props;
    dispatch(changeBusyStatus(user_details?.id, busy))
      .then((res: any) => {
        if (res.data.isSuccess) {
          toast.success("Update busy status Successfull!", {
            theme: "colored",
            autoClose: 5000,
          });

          getUserData();
          setisLoading(false);
        }
      })
      .catch((err: any) => {
        const massage = err.response.data.message;
        toast.error(massage, {
          theme: "colored",
          autoClose: 5000,
        });
        setisLoading(false);
      });
  };

  const onWithdrawAddCard = () => {
    setWithdrawAddCard(true);
    setWithdraw(false);
  };

  const getAccount = () => {
    setisLoading(true);
    const { dispatch } = props;
    dispatch(getAccountsData())
      .then((res: any) => {

        setisLoading(false);
        dispatch(set_Account_Data(res.data));
      })
      .catch((err: any) => {
        setisLoading(false);
        console.log("error", err);
      });
  };

  const onEditClick = (selectedProfile: any) => {
    setSelectedProfile(selectedProfile);
    // setOpenForm(true);
    navigate(`/consultant/profile/manage`, { state: { selectedProfile: selectedProfile } })
  };

  const onDeleteClick = (id: any) => {
    setDeleteProfileModal(true)
    setSelectedProfileForDelete(id)
  }

  const onDeleteConfirm = () => {
    const { dispatch } = props;
    setisLoading(true);
    dispatch(deleteProfile(selectedProfileForDelete))
      .then(() => {
        setisLoading(false);
        getSPProfileData();
        toast.success("Profile Deleted Successfully!", {
          theme: "colored",
          autoClose: 5000,
        });
        deleteConformationClose()
      })
      .catch((err: any) => {
        setisLoading(false);
        setSelectedProfileForDelete(null)
        toast.error(err.response.data.message, {
          theme: "colored",
          autoClose: 5000,
        });
      });
  };

  const onPreviewClick = (profile: any) => {
    setSelectedProfile(profile);
    setPreviewModal(true)
  }

  const deleteConformationClose = () => {
    setSelectedProfileForDelete(null)
    setDeleteProfileModal(false)
  }

  const onCLickShareButton = (id: string) => {
    const { dispatch } = props;
    setisLoading(true)

    dispatch(getSharableUrl(id)).then((res: any) => {
      setisLoading(false)
      setProfileUrl(res.data.data)
      setUrlShareModal(true)
    }).catch((err: any) => {
      setisLoading(false)
      toast.error(err.response.data.message, {
        theme: "colored",
        autoClose: 5000,
      });
    })
    setUrlShareModal(true)
  }

  const closeUrlShareModal = () => {
    setUrlShareModal(false)
    setProfileUrl("")
  }

  return (
    <>
      <div className="bg-[#F8F3FD] min-h-screen">
        {isLoading && <RctPageLoader />}
        <Header chatType="consultant" />
        <div
          className={`pb-8 lg:mt-0 md:px-4 xl:px-6 w-11/12 mx-auto sm:mx-0 sm:w-full justify-between`}
        >
          <div className="text-center md:text-start font-['Montserrat'] font-bold text-[36px] text-white px-1">
            Welcome back, {accountData?.firstName}.
          </div>
          <div className="mt-3 px-1 flex justify-center md:justify-between flex-wrap">
            <div className="h-full md:w-[33%]">
              <div className="bg-[#FDFCFE] rounded-lg py-6 px-6">
                <p className="text-[22px] text-center text-primary font-semibold font-['Montserrat']">
                  My Account Overview
                </p>
                {!accountData?.accountImageUrl ||
                  accountData?.accountImageUrl === null ||
                  accountData?.accountImageUrl === "" ? (
                  <img
                    src={defultUser}
                    className="w-[147px] h-[147px] mx-auto rounded-full mt-4"
                    alt="buttonPlussing"
                  />
                ) : (
                  <img
                    src={accountData?.accountImageUrl}
                    className="w-[147px] h-[147px] mx-auto rounded-full mt-4"
                    alt="buttonPlussing"
                  />
                )}
                <p className="text-2xl mt-4 text-center text-primary font-semibold font-['Montserrat']">
                  {accountData?.firstName}
                </p>

                <p className="text-xs mt-4 text-start text-primary font-[500] font-['Montserrat']">
                  First Name:
                  <p className="text-base mt-1.5">{accountData?.firstName}</p>
                </p>

                <p className="text-xs mt-4 text-start text-primary font-[500] font-['Montserrat']">
                  Last Name:
                  <p className="text-base mt-1.5">{accountData?.lastName}</p>
                </p>

                <p className="text-xs mt-4 text-start text-primary font-[500] font-['Montserrat']">
                  Email:
                  <p className="text-base mt-1.5">{accountData?.email}</p>
                </p>

                <p className="text-xs mt-4 text-start text-primary font-[500] font-['Montserrat']">
                  Phone Number:
                  <p className="text-base mt-1.5">{accountData?.dialCode} {accountData?.phoneNumber}</p>
                </p>

                <div className="flex justify-center mt-6">
                  <button
                    className="bg-primary mt-4 mr-6 hover:bg-[white] text-[white] text-base hover:text-primary py-2 border-2 border-solid border-primary px-4 rounded-full font-['Montserrat']"
                    onClick={editProfile}
                  >
                    Edit Account
                  </button>
                  <button
                    className="bg-tranparent mt-4 hover:bg-primary text-primary text-base hover:text-white py-2 border-2 border-solid border-primary px-4 hover:border-transparent rounded-full font-['Montserrat']"
                    onClick={onchangePassword}
                  >
                    Change Password
                  </button>
                </div>
              </div>

              <div className="bg-[#FDFCFE] text-primary text rounded-lg py-6 px-6 mt-4 font-['Montserrat']">
                <p className="mb-5 text-primary font-semibold">
                  Transaction Activity
                </p>

                <div className="mt-2 h-[calc(100vh_-_245px)] overflow-y-auto">
                  <InfiniteScroll
                    pageStart={1}
                    initialLoad={false}
                    loadMore={getMoreTransctionDetails}
                    hasMore={!noMoreData}
                    useWindow={false}
                  >
                    {activity.map((res: any) => {
                      let amount;
                      if (res?.total.toString().includes("-")) {
                        amount = true;
                      } else {
                        amount = false;
                      }
                      const showTitle = res?.title.split("-");
                      return (
                        <div className="mb-4 flex justify-between items-center px-4 bg-[#F0F0F0] h-[64px] rounded-lg">
                          <div className="">
                            <p className="text-[11px]">
                              {moment(res?.createdDate).format(
                                "MM/DD/YYYY [at] HH:mm"
                              )}
                            </p>
                            <p className="text-[14px]">
                              <span className="font-bold">
                                {res?.withUsername}
                              </span>{" "}
                              {showTitle[1]} to {res?.username}
                            </p>
                          </div>

                          <div
                            className={`${amount ? "text-[#E83D26]" : "text-[#47B514]"
                              } text-2xl font-semibold`}
                          >
                            {amount ? <span></span> : <span>+</span>}
                            {res?.total.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </InfiniteScroll>
                </div>

                {activity.length === 0 && (
                  <div className="w-full mt-4">
                    <p className="text-sm text-center cursor-pointer text-primary font-semibold font-['Montserrat']">
                      No Transaction Activity
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="h-full md:mt-0 md:w-[65%] mt-4">
              <div className="bg-[#FDFCFE] rounded-lg py-6 px-6">
                <p className="text-[22px] text-center text-primary font-semibold font-['Montserrat']">
                  My Account
                </p>

                <div>
                  <div className="mt-4">
                    <div className="w-full flex flex-wrap  justify-between items-center">
                      <div>
                        <p className="text-base text-primary font-['Montserrat'] font-bold">
                          My Total Credits
                        </p>
                        <p className="text-[40px] font-bold text-primary font-['Montserrat']">
                          $
                          {details &&
                            details?.totalCredit &&
                            details?.totalCredit?.balance !== undefined
                            ? details?.totalCredit?.balance.toFixed(2)
                            : ""}
                        </p>
                      </div>

                      <div>
                        {" "}
                        <button
                          className="hover:bg-primary text-primary text-base hover:text-white py-2 border-2 border-primary border-primary px-6 hover:border-transparent rounded-full font-['Montserrat']"
                          onClick={() => setWithdraw(true)}
                        >
                          Withdraw Funds
                        </button>
                      </div>
                    </div>

                    <p className="text-base text-primary font-['Montserrat'] font-bold my-4">
                      We pay twice a month on the 1st and 16th. Please add your pay out method below and use the "Withdraw" button to request your payout.
                    </p>
                  </div>
                </div>

                <p className="mt-8 text-base text-primary font-['Montserrat'] font-semibold">
                  My Bank Accounts
                </p>

                {cards.map((card: any) => {
                  if (card?.cardType === "BANK") {
                    const number = card?.cardNo.substr(card?.cardNo.length - 4);
                    return (
                      <p className="bg-primary bg-opacity-[85%] mt-3 w-full text-white font-['Montserrat'] text-base md:w-[47%] rounded text-left px-4 py-2 focus:outline-none">
                        {card?.bankName} * {number}
                      </p>
                    );
                  }

                  if (card?.cardType === "PayPal") {
                    return (
                      <p className="bg-primary bg-opacity-[85%] mt-3 w-full text-white font-['Montserrat'] text-base md:w-[47%] rounded text-left px-4 py-2 focus:outline-none">
                        PAYPAL {card?.paypalUsername}
                      </p>
                    );
                  }

                  if(card?.cardType === "WISE") {
                    return (
                      <p className="bg-primary bg-opacity-[85%] mt-3 w-full text-white font-['Montserrat'] text-base md:w-[47%] rounded text-left px-4 py-2 focus:outline-none">
                        WISE {card?.firstName} {card?.lastName} 
                      </p>
                    );
                  }
                })}

                <button
                  className="bg-primary bg-opacity-[30%] mt-2 w-full text-white font-['Montserrat'] text-base md:w-[47%] rounded text-left px-4 py-2 focus:outline-none"
                  onClick={() => setShowAddNewCard(true)}
                >
                  Add New Account
                </button>
              </div>

              <div className="bg-[#FDFCFE] text-primary font-['Montserrat'] mt-4 rounded-lg py-6 px-6">
                <div className="flex justify-between">
                  <p className="text-primary font-['Montserrat'] font-semibold">
                    My Profiles
                  </p>
                  <button
                    className="hover:bg-primary text-primary text-base hover:text-white py-2 border-2 border-primary border-primary px-6 hover:border-transparent rounded-full font-['Montserrat']"
                    onClick={() => navigate(`/consultant/profile/manage`)}
                  >
                    Add Profile
                  </button>
                </div>
                <div className="mt-6">
                  <MyProfileCard
                    dispatch={props.dispatch}
                    onEditClick={onEditClick}
                    onDeleteClick={onDeleteClick}
                    profileData={profileData}
                    getSPProfileData={getSPProfileData}
                    onPreviewClick={onPreviewClick}
                    onShareButtonClick={onCLickShareButton}
                  />
                </div>
              </div>
            </div>
          </div>

          {openForm && (
            <ProfileModal
              setShowModal={setOpenForm}
              user_details={user_details}
              getSPProfileData={getSPProfileData}
              selectedProfile={selectedProfile}
            />
          )}

          {previewModal && (
            <ProfilePreviewModal
              updatedProfileDetails={selectedProfile}
              setPreviewModal={setPreviewModal}
              uploadedImage={selectedProfile?.profileImageUrl}
              hideSaveButton={true}
            />
          )}

          {changePassword && <ChangePassword cancel={onCancleModal} />}

          {isEditMyMenu ? <EditMyMenuItems cancel={onEditCancle} /> : ""}

          {withdraw ? (
            <WithDrawModal
              cancel={onWithdrawCancel}
              onWithdrawAddCard={onWithdrawAddCard}
              updateCredit={updateCredit}
            />
          ) : (
            ""
          )}

          {showAddNewCard || withdrawAddCard ? (
            <AddNewBank
              cancel={onCancleAddNewCardModal}
              getCardDetails={getCardDetails}
            />
          ) : (
            ""
          )}

          {deleteProfileModal &&
            <DeleteProfileModal
              onClose={deleteConformationClose}
              onDeleteConfirm={onDeleteConfirm}
            />
          }

          {urlShareModal && profileUrl &&
            <UrlShareModal 
              onClose={closeUrlShareModal}
              profileUrl={profileUrl}
            />
          }
        </div>
      </div>
    </>
  );
};

export default connect()(UserProfile);
