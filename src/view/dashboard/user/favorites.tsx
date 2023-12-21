import React, { useState, useEffect } from "react";
import chatIcon from "../../../assets/images/chatIcon.png";
import homePhoneCall from "../../../assets/images/homePhoneCall.svg";
import voiceCall2 from "../../../assets/images/voiceCall2.png";
import videoCalls from "../../../assets/images/videoCalls.png";
import VideoChat from "../../../assets/images/VideoChat.png";
import likedImage from "../../../assets/images/solidHeart.png";
import unLikedImage from "../../../assets/images/regularHeart.png";
import { connect } from "react-redux";
import Header from "../commons/header";
import Footer from "../../../component/footer";
import RctPageLoader from "../../../component/RctPageLoader";
import { getAllFavorites, getUserCategories, getuserData } from "../../../services/homeService";
import { useNavigate } from "react-router-dom";
import defultUser from "../../../assets/images/defultUser.png";
import "react-toastify/dist/ReactToastify.css";

const Favorites: React.FC<any> = (props: any) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [clientsDetails, setClientsDetails] = useState<any>([]);
  const [categories, setcategories] = useState<any>([]);
  const [selectCat, setSelectCat] = useState<any>("cat");
  const [filterBody, setFilterBody] = useState<any>({
    sort: [{ selector: "created", desc: true }],
    requireTotalCount: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const { dispatch } = props;
    setLoading(true);
    dispatch(getAllFavorites())
      .then((res: any) => {
        setClientsDetails(res.data.data);
        setLoading(false);
      })
      .catch((err: any) => {
        setLoading(false);
      });
    getCategoriesList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const onRedirectProfile = (data: any) => {
    navigate(`/user/profileDetails/${data.id}`);
  };

  const getFavoriteFriendDetails = () => {
    setLoading(true);
    const { dispatch } = props;
    dispatch(getAllFavorites(filterBody))
      .then((res: any) => {
        setLoading(false);
        setClientsDetails(res.data.data);
      })
      .catch((err: any) => {
        setLoading(false);
      });
  };

  const ongoTocategory = (cat: any) => {
    const tempFilterBody = filterBody;
    tempFilterBody["filter"] = [["categories", "contains", `#${cat?.name}`]];
    setFilterBody(tempFilterBody);
    getFavoriteFriendDetails();
    setSelectCat(cat?.name);
  };

  const ongoTocategoryAll = () => {
    const tempFilterBody = filterBody;
    tempFilterBody["filter"] = [];
    setFilterBody(tempFilterBody);
    getFavoriteFriendDetails();
    setSelectCat("cat");
  };

  return (
    <>
      {loading && <RctPageLoader />}
      <div className="bg-[#F8F3FD] min-h-screen">
        <Header />
        <div className="body-section">
          <div className={`min-h-screen`}>
            <div className="md:block antialiased min-h-screen text-gray-900 md:px-6 py-6 max-h-[60%] overflow-y-auto">
              <div className="">
                <div className="text-primary test-[30px] font-bold mb-6">
                  My Favorites
                </div>
                <div className="flex max-w-full overflow-auto gap-2 items-center">
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
                {clientsDetails.length === 0 ? (
                  <div className="px-4 mt-2 font-[Montserrat]">
                    {/* No client found. Enter username to connect. */}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-x-4 gap-y-8 2xl:gap-x-4 2xl:gap-y-8 mt-4">
                    <>
                      {clientsDetails.map((client: any) => {
                        return (
                          <div className="w-full">
                            <div
                              className="w-full max-w-[300px] h-[405px] mx-auto rounded-md shadow-lg bg-white"
                              onClick={() => onRedirectProfile(client)}
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
                                <div className="relative h-[280px] overflow-hidden">
                                  <img
                                    className="w-full min-h-[280px] rounded-t-md"
                                    src={client.profileImageUrl}
                                    alt="clien profile"
                                  />
                                  <div className="absolute right-3 top-3">
                                    {client.isFavorite ? (
                                      <img
                                        className="w-11/12"
                                        src={likedImage}
                                        alt="liked"
                                      />
                                    ) : (
                                      <img
                                        className="w-11/12"
                                        src={unLikedImage}
                                        alt="unliked"
                                      />
                                    )}
                                  </div>
                                </div>
                              )}
                              <div className="px-4 py-2">
                                <p className="text-base font-[Montserrat] font-semibold flex items-center">
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
                                        src={homePhoneCall}
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

                                  {
                                    client?.enableAudioCall &&
                                    <div className="flex items-center">
                                      <img
                                        src={voiceCall2}
                                        className="w-[18px] h-[18px]"
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
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default connect()(Favorites);
