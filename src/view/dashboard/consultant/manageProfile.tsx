import React, { useState, useEffect, useRef } from "react";
import { connect, useSelector } from "react-redux";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import uploadImagePlusIcon from "../../../assets/images/uploadImage.svg";
import uploadImagePlusIconWhite from "../../../assets/images/uploadImage.png";
import cancle from "../../../assets/images/cancle.png";
import {
  uploadImage64BaseAccount,
  addMultiUserData,
  uploadImageAddProfile,
  createmultipleAccounts,
  editProfile,
} from "../../../services/authService";
import {
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RctPageLoader from "../../../component/RctPageLoader";
import { LOCALSTORE, siteKey } from "../../../constant/default";
import * as Yup from "yup";
import { authLogin } from "../../../services/authService";
import { auth_details, auth_login } from "../../../reducer/auth";
import { getUserCategories, uploadCkEditorImage } from "../../../services/homeService";
import ReCAPTCHA from "react-google-recaptcha";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import DecoupledcEditor from "@ckeditor/ckeditor5-build-decoupled-document";
import { callSettingList, menuSettingList, serviceType } from "../../../component/common/staticValues";
import Checkbox from "../../../component/common/ui/Checkbox";
import Header from "../commons/header";
import ProfilePreviewModal from "./profilePreview";
import PreviewConformationModal from "./previewConformationModal";
import phoneDarlingsLogo from "../../../assets/images/phoneDarlingsLogo.svg";
import { setInterval } from "timers/promises";
import ImageCrop from "../../auth/imageCrop";

interface ErrorName {
  shortMessageUnitPrice: string;
  phoneCallUnitPrice: string;
  audioCallUnitPrice: string;
  videoCallTwoWayUnitPrice: string;
  videoCallOneWayUnitPrice: string;
}

const ManageProfile = (props: any) => {
  const { registrationFlow } = props
  console.log("!registrationFlow", registrationFlow)
  const { dispatch } = props;
  const [uploadedImage, setUploadedImage] = useState("");
  const [fileType, setFileType] = useState(null);
  const captchaRef = useRef(null);
  const params = useParams();
  const imageTypes = ["png", "jpg", "jpeg"];
  const [imagevalid, setImageValid] = useState<boolean>(false);
  const [isLoading, setLoading] = useState(false);
  const [enablePhoneCall, setEnablePhoneCall] = useState(false);
  const [enableAudioCall, setEnableAudioCall] = useState(false);
  const [enableOneWayVideoCall, setEnableOneWayVideoCall] = useState(false);
  const [enableTwoWayVideoCall, setEnableTwoWayVideoCall] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setcategories] = useState<any>([]);
  const [selectCat, setSelectCat] = useState<any>([]);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([
    "chat",
  ]);
  const [navbar, setNavbar] = useState<boolean>(false);
  const [profileDisable, setProfileDisable] = useState(false);
  const prevReviewTextRef = useRef<null | HTMLDivElement>(null);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  const [conformationModal, setConformationModal] = useState(false)
  const [previewModal, setPreviewModal] = useState(false)
  const [updatedProfileDetails, setUpdatedProfileDetails] = useState<any>(null)
  const [showCrop, setShowCrop] = useState(false);

  console.log("selectedProfile", selectedProfile)

  const hiddenCatList = ["Men", "Women", "Trans"]

  const details = useSelector(auth_details);
  let user_details = details?.user_profile;

  useEffect(() => {
    if (location.state) {
      if (location.state.selectedProfile) {
        setSelectedProfile(location.state.selectedProfile)
      }
    }
  }, [location.state])

  useEffect(() => {
    getCategoriesList();
  }, []);

  useEffect(() => {
    if (selectedProfile) {
      const selectedCallSetting = []
      setUploadedImage(selectedProfile.profileImageUrl)
      setSelectCat([...selectedProfile.categories])
      if (selectedProfile.enableAudioCall) {
        setEnableAudioCall(selectedProfile.enableAudioCall)
        selectedCallSetting.push('audio')
      }
      if (selectedProfile.enablePhoneCall) {
        setEnablePhoneCall(selectedProfile.enablePhoneCall)
        selectedCallSetting.push('phone')
      }
      if (selectedProfile.enableOneWayVideoCall) {
        setEnableOneWayVideoCall(selectedProfile.enableOneWayVideoCall)
        selectedCallSetting.push('oneWayVideo')
      }
      if (selectedProfile.enableTwoWayVideoCall) {
        setEnableTwoWayVideoCall(selectedProfile.enableTwoWayVideoCall)
        selectedCallSetting.push('twoWayVideo')
      }
      if (selectedCallSetting) {
        setSelectedCheckboxes([...selectedCheckboxes, ...selectedCallSetting])
      }
    }
  }, [selectedProfile])

  const handleChange = async (e: any) => {
    setImageValid(false);
    const type = e.target.files[0].type;
    let imageType = type.substring(6);
    setFileType(imageType);
    const base64: any = await convertBase64(e.target.files[0]);
    if (base64 instanceof Error) {
      return;
    }
    setUploadedImage(base64);
    setShowCrop(true);
    return { base64, file: e.target.files[0] };
  };

  const getCategoriesList = () => {
    dispatch(getUserCategories())
      .then((res: any) => {
        setcategories(res?.data);
      })
      .catch((err: any) => {
        console.log("dfsdgh", err);
      });
  };

  const handleCheckChat = (name: any) => {
    if (selectCat.includes(name)) {
      setSelectCat(selectCat.filter((catName: any) => catName !== name))
    } else {
      setSelectCat([...selectCat, name])
    }
  }

  const convertBase64 = (file: any) => {
    return new Promise((resolve, reject) => {
      if (file) {
        const fileReader = new FileReader();
        fileReader?.readAsDataURL(file);
        fileReader.onload = () => {
          resolve(fileReader.result);
        };
        fileReader.onerror = () => {
          reject(Error);
        };
      }
    });
  };

  const validationImage = (type: any) => {
    const promise = new Promise((resolve, reject) => {
      if (imageTypes.includes(type)) {
        setImageValid(false);
        resolve(null)
      } else {
        setImageValid(true);
        reject(null)
      }
    })

    return promise
  };

  const communicationSchema = Yup.object().shape({
    shortMessageUnitPrice: Yup.number()
      .typeError("Invalid number")
      .min(0.25, "Short message price must be greater than 0.25")
      .max(5, "Short message price must be less than 5")
      .required("Required"),
    audioCallUnitPrice: Yup.number()
      .typeError("Invalid number")
      .min(selectedCheckboxes.includes(serviceType.audio) ? 0.25 : 0, "Audio call price must be greater than 0.25")
      .max(50, "Audio call price must be less than 50")
      .required("Required"),
    videoCallTwoWayUnitPrice: Yup.number()
      .typeError("Invalid number")
      .min(selectedCheckboxes.includes(serviceType.twoWayVideo) ? 0.35 : 0, "Video call two way price must be greater than 0.35")
      .max(50, "Video call two way price must be less than 50")
      .required("Required"),
    videoCallOneWayUnitPrice: Yup.number()
      .typeError("Invalid number")
      .min(selectedCheckboxes.includes(serviceType.oneWayVideo) ? 0.30 : 0, "Video call one way price must be greater than 0.30")
      .max(50, "Video call one way price must be less than 50")
      .required("Required"),
  });

  const validationSchema = Yup.object().shape({
    profileName: Yup.string().required("Profile Name is required"),
    communication: communicationSchema,
    isMan: Yup.bool().when(['isWomen', 'isTrans'], {
      is: (isWomen: any, isTrans: any) => !isWomen || !isTrans,
      then: Yup.bool().oneOf([true], "At least one needs to be checked")
    }),
    showMeAs: Yup.string().required("Please select one option")
  });

  const updateProfile = async (value: any, communication: any) => {
    const payload = {
      fileExtension: fileType,
      base64: uploadedImage,
    };

    // const updateSelectedCat = () => {
    //   const updatedCat = selectCat.filter((el: any) => !hiddenCatList.includes(el));
    //   return [value.showMeAs, ...updatedCat].toString()
    // }

    const body = [
      { op: "replace", path: "/username", value: value.username },
      { op: "replace", path: "/description", value: value.description },
      { op: "replace", path: "/profileInfo", value: value.profileInfo },
      { op: "replace", path: "/communication/shortMessageUnitPrice", value: communication.shortMessageUnitPrice },
      { op: "replace", path: "/communication/phoneCallUnitPrice", value: communication.phoneCallUnitPrice },
      { op: "replace", path: "/communication/audioCallUnitPrice", value: communication.audioCallUnitPrice },
      { op: "replace", path: "/communication/videoCallOneWayUnitPrice", value: communication.videoCallOneWayUnitPrice },
      { op: "replace", path: "/communication/videoCallTwoWayUnitPrice", value: communication.videoCallTwoWayUnitPrice },
      { op: "replace", path: "/categories", value: value.categories.toString() },
      { op: "replace", path: "/enableAudioCall", "value": selectedCheckboxes.includes('audio') ? true : false },
      { op: "replace", path: "/enablePhoneCall", "value": selectedCheckboxes.includes('phone') ? true : false },
      { op: "replace", path: "/enableOneWayVideoCall", "value": selectedCheckboxes.includes('oneWayVideo') ? true : false },
      { op: "replace", path: "/enableTwoWayVideoCall", "value": selectedCheckboxes.includes('twoWayVideo') ? true : false },
      { op: "replace", path: "/isPublicUser", value: value.isPublicUser }
    ]

    if (fileType) {
      await validationImage(fileType).then(() => {
        dispatch(uploadImageAddProfile(payload)).then((res: any) => {
          if (res.data.isSuccess) {
            body.push({ op: "replace", path: "/profileImageUrl", value: res.data.data })
            dispatch(editProfile(selectedProfile.id, body)).then((res: any) => {
              setLoading(false)
              toast.success("Profile Updated Successfully!", {
                theme: "colored",
                autoClose: 5000,
              });
              navigate("/consultant/profile")
              // getSPProfileData()
              // closeModal(false);
            }).catch((err: any) => {
              setLoading(false)
              const massage = err.response.data.message;
              toast.error(massage, {
                theme: "colored",
                autoClose: 5000,
              });
              // closeModal(false);
            })
          }
        }).catch((err: any) => {
          setLoading(false)
          setProfileDisable(false)
          const massage = err.response.data.message;
          toast.error(massage, {
            theme: "colored",
            autoClose: 5000,
          });
          // closeModal(false);
        })
      }).catch(() => {
        toast.error("please enter valid image type valid image type .png, .jpg, .jpeg")
      })
    } else {
      dispatch(editProfile(selectedProfile.id, body)).then((res: any) => {
        setLoading(false)
        // getSPProfileData()
        // closeModal(false);
        toast.success("Profile Updated Successfully!", {
          theme: "colored",
          autoClose: 5000,
        });
        navigate("/consultant/profile")

      }).catch((err: any) => {
        setLoading(false)
        setProfileDisable(false)
        // closeModal(false)
        const massage = err.message;
        toast.error(massage, {
          theme: "colored",
          autoClose: 5000,
        });
      })
    }
  }

  const onSubmit = (value: any) => {
    setLoading(true)
    setProfileDisable(true)

    const communication = {
      audioCallUnitPrice: enableAudioCall
        ? parseFloat(value.communication.audioCallUnitPrice)
        : 0,
      phoneCallUnitPrice: enablePhoneCall
        ? parseFloat(value.communication.phoneCallUnitPrice)
        : 0,
      shortMessageUnitPrice: parseFloat(value.communication.shortMessageUnitPrice),
      videoCallOneWayUnitPrice: enableOneWayVideoCall
        ? parseFloat(value.communication.videoCallOneWayUnitPrice)
        : 0,
      videoCallTwoWayUnitPrice: enableTwoWayVideoCall
        ? parseFloat(value.communication.videoCallTwoWayUnitPrice)
        : 0,
    };

    const payload = {
      fileExtension: fileType,
      base64: uploadedImage,
    };

    if (!selectedProfile) {
      if (fileType) {
        validationImage(fileType).then(() => {
          if (params.id !== undefined) {
            dispatch(uploadImage64BaseAccount(params.id, payload))
              .then((res: any) => {
                if (res.data.isSuccess) {
                  const body = {
                    username: value.username,
                    profileImageUrl: res.data.data,
                    description: value.description,
                    profileInfo: value.profileInfo,
                    enablePhoneCall: enablePhoneCall,
                    enableAudioCall: enableAudioCall,
                    enableOneWayVideoCall: enableOneWayVideoCall,
                    enableTwoWayVideoCall: enableTwoWayVideoCall,
                    communication: communication,
                    email: localStorage.getItem(LOCALSTORE.email) ?? location.state.email,
                    categories: value.categories,
                    isPublicUser: value.isPublicUser
                  };

                  dispatch(addMultiUserData(params.id, body))
                    .then((ress: any) => {
                      toast.success("Profile Add Successfull!", {
                        theme: "colored",
                        autoClose: 5000,
                      });
                      const loginReqBody = {
                        email: localStorage.getItem(LOCALSTORE.email) ?? location.state.email,
                        password: location.state.password,
                        rememberMe: false,
                      };
                      let token: any = captchaRef?.current;
                      let tokendata = token?.executeAsync();
                      tokendata.then((res: any) => {
                        dispatch(authLogin(loginReqBody, res))
                          .then((res: any) => {
                            if (res !== undefined) {
                              // setPasswordError(false);
                              dispatch(auth_login(res.data));
                              localStorage.setItem(LOCALSTORE.id, res.data.id);
                              localStorage.setItem(
                                LOCALSTORE.token,
                                res.data.jwtToken
                              );
                              localStorage.setItem(
                                LOCALSTORE.refreshToken,
                                res.data.refreshToken
                              );
                              localStorage.setItem(LOCALSTORE.role, res.data.role);
                              localStorage.setItem(
                                LOCALSTORE.communicationIdentifier.token,
                                res.data.communicationIdentifier.token
                              );
                              localStorage.setItem(
                                LOCALSTORE.communicationIdentifier.expiredOn,
                                res.data.communicationIdentifier.expires_on
                              );
                              localStorage.setItem(
                                LOCALSTORE.communicationIdentifier.userId,
                                res.data.communicationIdentifier.user_id
                              );
                              setProfileDisable(false)
                              navigate(`/thankyouconsultant`);
                              setLoading(false);
                            }
                            // setLoading(false);
                          })
                          .catch((err: any) => {
                            setProfileDisable(false)
                            setLoading(false);
                          });
                      })
                        .catch((err: any) => {
                          console.log("err");
                          setProfileDisable(false)
                          setLoading(false);
                        });
                    }).catch(() => {
                      setProfileDisable(false)
                      setLoading(false)
                    }
                    )
                }
              })
              .catch((err: any) => {
                const massage = err.message;
                toast.error(massage, {
                  theme: "colored",
                  autoClose: 5000,
                });
                setLoading(false);
                setProfileDisable(false)
              });
          } else {
            dispatch(uploadImageAddProfile(payload))
              .then((res: any) => {
                if (res.data.isSuccess) {
                  const body = {
                    username: value.username,
                    profileImageUrl: res.data.data,
                    description: value.description,
                    profileInfo: value.profileInfo,
                    enablePhoneCall: enablePhoneCall,
                    enableAudioCall: enableAudioCall,
                    enableOneWayVideoCall: enableOneWayVideoCall,
                    enableTwoWayVideoCall: enableTwoWayVideoCall,
                    communication: communication,
                    email: user_details.email,
                    categories: value.categories,
                    isPublicUser: value.isPublicUser
                  };

                  dispatch(createmultipleAccounts(body))
                    .then((ress: any) => {
                      toast.success("Profile Add Successfull!", {
                        theme: "colored",
                        autoClose: 5000,
                      });
                      navigate("/consultant/profile")
                    })
                    .catch((err: any) => {
                      const massage = err.message;
                      toast.error(massage, {
                        theme: "colored",
                        autoClose: 5000,
                      });
                      setProfileDisable(false)
                      setLoading(false);
                    });
                }
              })
              .catch((err: any) => {
                const massage = err.message;
                toast.error(massage, {
                  theme: "colored",
                  autoClose: 5000,
                });
                setProfileDisable(false)
                setLoading(false);
                // closeModal(false);
              });
          }
        }).catch(() => {
          setLoading(false)
          setProfileDisable(false)
          toast.error("please enter valid image type valid image type .png, .jpg, .jpeg")
        })
      } else {
        setLoading(false)
        setProfileDisable(false)
        setImageValid(true)
        toast.info("please select image for profile")
      }
    }


    if (selectedProfile) {
      updateProfile(value, communication)
    }
    // onGtoNext();
  };

  const handleCallSettingList = (event: any, setting: string) => {
    const isChecked = event.target.checked;
    setSelectedCheckboxes((prevSelected) => {
      if (isChecked) {
        if (setting === "phone") {
          setEnablePhoneCall(true);
        } else if (setting === "audio") {
          setEnableAudioCall(true);
        } else if (setting === "oneWayVideo") {
          setEnableOneWayVideoCall(true);
        } else if (setting === "twoWayVideo") {
          setEnableTwoWayVideoCall(true);
        }
        return [...prevSelected, setting];
      } else {
        if (setting === "phone") {
          setEnablePhoneCall(false);
        } else if (setting === "audio") {
          setEnableAudioCall(false);
        } else if (setting === "oneWayVideo") {
          setEnableOneWayVideoCall(false);
        } else if (setting === "twoWayVideo") {
          setEnableTwoWayVideoCall(false);
        }
        return prevSelected.filter((selected) => selected !== setting);
      }
    });
  };

  function uploadAdapter(loader: any) {
    return {
      upload: () => {
        return new Promise((resolve, reject) => {
          const body = new FormData();
          loader.file.then((file: any) => {
            body.append("files", file);
            dispatch(uploadCkEditorImage(body)).then((res: any) => {
              resolve({
                default: res.data.data
              });
            }).catch((error: any) => {
              toast.error("Image Upload Failed....!!", {
                theme: "colored",
                autoClose: 5000,
              });

            })
          });
        });
      }
    };
  }

  function uploadPlugin(editor: { plugins: { get: (arg0: string) => { (): any; new(): any; createUploadAdapter: (loader: any) => { upload: () => Promise<unknown>; }; }; }; }) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
      return uploadAdapter(loader);
    };
  }

  const ckEditorHandleChange = (e: any, editor: any, setFieldValue: any) => {
    var content = editor.getData();
    var tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    setFieldValue("profileInfo", content)
    // setReviewText(content);
    // setTextLength(tempDiv.textContent.length);
    // setIsTextChanged(content !== prevReviewTextRef.current);
    if (prevReviewTextRef.current) {
      prevReviewTextRef.current.innerHTML = content;
    }
  };

  const cloesCrop = () => {
    setShowCrop(false);
  };

  const onChangeFile = async (e: any) => {
    const base64 = await getBase64FromUrl(e);
    return { base64 };
  };

  const getBase64FromUrl = async (url: any) => {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        resolve(base64data);
      };
    });
  };

  const onChange64Base = async (file: any) => {
    onChangeFile(file).then((data: any) => {
      const cropImg = data.base64.split(",");

      setUploadedImage(data?.base64)

    });
  };

  const onSubmitFile = (file: any) => {
    onChange64Base(file);
  };

  const setDefaultShowMeAs = () => {
    for (const value of selectedProfile?.categories) {
      if (hiddenCatList.includes(value)) {
        return value;
      } else {
        return ""
      }
    }
  }

  return (
    <div className={`${registrationFlow ? "bg-[#36007a] " : "bg-[#F8F3FD]"}`}>
      {isLoading && <RctPageLoader />}

      {!registrationFlow ?
        <Header chatType="consultant" />
        :
        <div className="w-full p-6 rounded-b-full rounded-t-full">
          <div className="flex bg-[#FFFFFF] justify-center font-bold text-gray-800 py-5 rounded-full">
            <img
              src={phoneDarlingsLogo}
              alt="logo"
              className="mx-auto w-[183px] h-[26px]"
            />
          </div>
        </div>
      }

      <Formik
        initialValues={{
          profileName: selectedProfile?.username ?? "",
          profileDescription: selectedProfile?.description ?? "",
          communication: {
            shortMessageUnitPrice: selectedProfile?.communication?.shortMessageUnitPrice ?? 0.0,
            phoneCallUnitPrice: selectedProfile?.communication?.phoneCallUnitPrice ?? 0.0,
            audioCallUnitPrice: selectedProfile?.communication?.audioCallUnitPrice ?? 0.0,
            videoCallOneWayUnitPrice: selectedProfile?.communication?.videoCallOneWayUnitPrice ?? 0.0,
            videoCallTwoWayUnitPrice: selectedProfile?.communication?.videoCallTwoWayUnitPrice ?? 0.0,
          },
          profileInfo: selectedProfile?.profileInfo ?? "",
          isPublicUser: selectedProfile?.isPublicUser ?? false,
          showMeAs: selectedProfile?.categories ? setDefaultShowMeAs() : ""
        }}
        enableReinitialize
        validationSchema={validationSchema}
        validateOnChange
        onSubmit={(value: any) => {
          const communication = {
            audioCallUnitPrice: enableAudioCall
              ? parseFloat(value.communication.audioCallUnitPrice)
              : 0,
            phoneCallUnitPrice: enablePhoneCall
              ? parseFloat(value.communication.phoneCallUnitPrice)
              : 0,
            shortMessageUnitPrice: parseFloat(value.communication.shortMessageUnitPrice),
            videoCallOneWayUnitPrice: enableOneWayVideoCall
              ? parseFloat(value.communication.videoCallOneWayUnitPrice)
              : 0,
            videoCallTwoWayUnitPrice: enableTwoWayVideoCall
              ? parseFloat(value.communication.videoCallTwoWayUnitPrice)
              : 0,
          };

          const updateSelectedCat = () => {
            const updatedCat = selectCat.filter((el: any) => !hiddenCatList.includes(el));
            return [value.showMeAs, ...updatedCat]
          }

          const body = {
            username: value.profileName,
            description: value.profileDescription,
            profileInfo: value.profileInfo,
            enablePhoneCall: enablePhoneCall,
            enableAudioCall: enableAudioCall,
            enableOneWayVideoCall: enableOneWayVideoCall,
            enableTwoWayVideoCall: enableTwoWayVideoCall,
            communication: communication,
            categories: updateSelectedCat(),
            isPublicUser: value.isPublicUser
          };


          setUpdatedProfileDetails(body)


          setConformationModal(true)
        }}
      >
        {({ errors, touched, values, setFieldValue, onChange }: any) => (
          <Form className="px-4 md:px-6 pb-6">
            <div className={``}>
              <div
                className={`${!registrationFlow ? " bg-[#FFFFFF]" : "bg-[#2b0062] "
                  } px-6 md:px-8 py-6  rounded-2xl`}
              >
                <div className="md:max-w-none md:w-full mb-6">
                  {registrationFlow && (
                    <>
                      <div className="text-[#fff] text-center text-[35px] font-semibold ">
                        Thanks! Now let’s create your first public profile.
                      </div>

                      <p className="mx-auto text-[#fff] text-base text-center font-normal mb-4">
                        This profile will be shown publicly to all customers on
                        our platform.
                      </p>
                    </>
                  )}

                  {!registrationFlow && (
                    <>
                      <div className="w-full text-center mb-3 font-bold text-[#37085B]">
                        My Profile
                      </div>

                      <div className="w-full text-start mb-3 font-bold text-[#37085B]">
                        Public Profile Information
                      </div>

                    </>
                  )}

                  <div>
                    {/* <div className="flex font-semibold items-center mb-6 place-content-center text-[#37085B] text-center">
                      {type === "modal" && (
                        <>
                          <p className="mx-auto">My Profile</p>
                          <button
                            className="text-"
                            onClick={() => closeModal(false)}
                          >
                            <img src={cancle} alt="" />
                          </button>
                        </>
                      )}
                    </div> */}

                    <div className="md:flex w-full">
                      <div
                        className="mb-4 md:mb-0 max-h-[232px] max-w-[232px]"
                        style={{ aspectRatio: "1" }}
                      >
                        <label
                          htmlFor="exampleFormControlInpu3"
                          className={`form-label font-['Montserrat'] leading-none inline-block text-base font-normal ${!registrationFlow ? "text-[#37085B]" : "text-[#FFFFFF]"}`}
                        >
                          Profile Photo
                        </label>

                        <label className="cursor-pointer">
                          <div
                            style={{ aspectRatio: "1" }}
                            className={`border ${!registrationFlow ? "border-[#37085B] bg-[#37085b33] " : "border-[#FFF] bg-[#ffffff33] "}  flex items-center justify-center h-[232px] w-[232px] mx-auto rounded`}
                          >
                            {uploadedImage ? (
                              <img
                                src={uploadedImage}
                                alt="add"
                                className="w-full h-full"
                              />
                            ) : (
                              <img src={!registrationFlow ? uploadImagePlusIcon : uploadImagePlusIconWhite} alt="add" className="" />
                            )}
                          </div>
                          <Field
                            type="file"
                            accept="image/png, image/gif, image/jpeg"
                            name="spimage"
                            className="hidden"
                            onChange={handleChange}
                          />
                        </label>
                        {imagevalid && (
                          <div className="justify-center flex text-[#E85626]">
                            please enter valid image type valid image type .png
                            , .jpg, .jpeg
                          </div>
                        )}
                      </div>

                      <div className="md:ml-6 h-[232px] flex flex-col justify-between">
                        <div className="">
                          <div className="w-full md:w-72 xl:w-96">
                            <label
                              htmlFor="exampleFormControlInpu3"
                              className={`form-label font-['Montserrat'] leading-none inline-block text-base font-normal ${!registrationFlow ? "text-[#37085B]" : "text-[#FFFFFF]"}`}
                            >
                              Profile Name
                            </label>
                            <Field
                              type="text"
                              name="profileName"
                              autocomplete="off"
                              placeholder="Profile Name"
                              className={`form-control block w-full px-3 py-1.5 text-base font-normal  ${!registrationFlow ? "bg-white border-[#37085B] text-gray-700" : "bg-[#2b0062] border-[#FFF] text-[#FFFFFF]"} bg-clip-padding border border-solid  rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white 
                    focus:outline-none border-1 ${errors.profileName &&
                                touched.profileName &&
                                "border-[#E85626]"
                                }`}
                            />
                            {errors.profileName && touched.profileName && (
                              <div className="text-[#E85626]">
                                {errors.profileName}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="">
                          <div className="w-full md:w-72 xl:w-96">
                            <label
                              htmlFor="exampleFormControlInpu3"
                              className={`form-label font-['Montserrat'] leading-none inline-block text-base font-normal ${!registrationFlow ? "text-[#37085B]" : "text-[#FFFFFF]"}`}
                            >
                              Profile Description
                            </label>

                            <Field
                              rows={6}
                              as="textarea"
                              name="profileDescription"
                              autocomplete="off"
                              placeholder="Profile Description"
                              className={`max-h-[130px] form-control block w-full px-3 py-1.5 text-base font-normal  ${!registrationFlow ? "bg-white border-[#37085B] text-gray-700" : "bg-[#2b0062] border-[#FFF] text-[#FFFFFF]"} bg-clip-padding border border-solid rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white 
                    focus:outline-none border-1 ${errors.profileDescription &&
                                touched.profileDescription &&
                                "border-[#E85626]"
                                }`}
                            />
                            {errors.profileDescription &&
                              touched.profileDescription && (
                                <div className="text-[#E85626]">
                                  {errors.profileDescription}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>


                    <div className="mt-6">
                      <div className={`${!registrationFlow ? "text-[#37085B]" : "text-[#FFFFFF]"} font-bold`}>
                        Account Settings
                      </div>

                      <div className="flex flex-wrap">
                        <div className="md:mr-60">
                          <div className={`${!registrationFlow ? "text-[#37085B]" : "text-[#FFFFFF]"} font-semibold mt-4 mb-6 leading-none`}>
                            Privacy Settings
                          </div>

                          <div className="flex items-center">
                            <Field
                              type="checkbox"
                              name={"isPublicUser"}
                              placeholder="Profile Description"
                              id={"isPublicUser"}
                              className={`border-[#37085B] h-5 w-5 rounded-lg border bg-white checked:bg-[#37085B] checked:border-[#37085B] focus:outline-none transition duration-200 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer ${errors.callSettings && touched.callSettings && "border-[#E85626]"}`}
                            // onChange={(event: any) => handleCheckBox(event, data.value)}
                            // checked={isChecked}
                            />
                            <label
                              className={`text-sm font-semibold inline-block ${!registrationFlow ? "text-[#37085B]" : "text-[#FFFFFF]"}`}
                              htmlFor={"isPublicUser"}
                              style={{ fontFamily: "Montserrat" }}
                            >
                              Allow my profile to be seen by the public.
                            </label>
                          </div>
                        </div>

                        <div className="">
                          <div className={`${!registrationFlow ? "text-[#37085B]" : "text-[#FFFFFF]"} font-semibold mt-4 mb-6 leading-none`}>
                            Show me as
                          </div>

                          <div className="flex items-center font-['Montserrat']">
                            <div className="flex items-center mr-10">
                              <Field
                                type="radio"
                                className="accent-primary w-[17px] h-[17px]"
                                name="showMeAs"
                                value="Women"
                                id="Women"
                              />
                              <label
                                className={`ml-2 text-sm font-semibold inline-block ${!registrationFlow ? "text-[#37085B]" : "text-[#FFFFFF]"}`}
                                htmlFor="Women"
                              >
                                Women
                              </label>
                            </div>

                            <div className="flex items-center mr-10">
                              <Field
                                type="radio"
                                className="accent-primary w-[17px] h-[17px]"
                                name="showMeAs"
                                value="Trans"
                                id="Trans"

                              />
                              <label
                                className={`ml-2 text-sm font-semibold inline-block ${!registrationFlow ? "text-[#37085B]" : "text-[#FFFFFF]"}`}
                                htmlFor="Trans"
                              >
                                Trans
                              </label>
                            </div>

                            <div className="flex items-center mr-10">
                              <Field
                                type="radio"
                                className="accent-primary w-[17px] h-[17px]"
                                name="showMeAs"
                                value="Men"
                                id="Men"
                              />
                              <label
                                className={`ml-2 text-sm font-semibold inline-block ${!registrationFlow ? "text-[#37085B]" : "text-[#FFFFFF]"}`}
                                htmlFor="Men"
                              >
                                Men
                              </label>
                            </div>
                          </div>

                          {errors.showMeAs && touched.showMeAs && (
                            <div className="text-[#E85626] mt-2">
                              {errors.showMeAs}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap mt-6">
                        <div className="md:mr-24">
                          <div>
                            <div className={`text-sm ${!registrationFlow ? "text-[#37085B]" : "text-[#FFFFFF]"} font-semibold mb-6`}>
                              Call Settings
                            </div>
                            <div className="">
                              {callSettingList.map((list) => (
                                <div
                                  key={list?.value}
                                  className="flex mb-8 text-[#37085B]"
                                >
                                  <Checkbox
                                    name={`${list?.name}`}
                                    data={list}
                                    touched={touched}
                                    errors={errors}
                                    labelClassName={registrationFlow ? "text-[#FFFFFF]" : ""}
                                    handleCheckBox={handleCallSettingList}
                                    isChecked={selectedCheckboxes.includes(
                                      list?.value!
                                    )}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>


                        </div>

                        <div className="md:mr-24">
                          <div className={`text-sm ${!registrationFlow ? "text-[#37085B]" : "text-[#FFFFFF]"}  font-semibold mb-6`}>
                            Menu Settings
                          </div>
                          <FieldArray
                            name="communication"
                            render={() => (
                              <div className="">
                                {menuSettingList.map((list, index) => (
                                  <div className="grid grid-cols-2 gap-6 mb-4 ">
                                    <p className={`text-sm ${!registrationFlow ? "text-[#37085B]" : "text-[#FFFFFF]"}  font-semibold`}>
                                      {list.lable}
                                    </p>
                                    <div className="w-full sm:w-[159px] mb-3">
                                      <Field
                                        type="text"
                                        disabled={
                                          !selectedCheckboxes.includes(
                                            list.value
                                          )
                                        }
                                        name={`communication[${list.name}]`}
                                        autocomplete="off"
                                        placeholder={list.lable}
                                        className={`form-control block w-full px-3 py-1.5 text-sm text-[#37085B] font-normal text-gray-700 bg-clip-padding border border-[#37085B] rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white 
                                        focus:outline-none border-1 
                                        ${!selectedCheckboxes.includes(
                                          list.value
                                        )
                                            ? "bg-[#EAEAEA]"
                                            : ""
                                          }`}
                                      />

                                      {errors &&
                                        errors.communication &&
                                        errors.communication[
                                        list.name as keyof ErrorName
                                        ] &&
                                        selectedCheckboxes.includes(
                                          list.value
                                        ) &&
                                        errors.communication[
                                        list.name as keyof ErrorName
                                        ] &&
                                        touched &&
                                        touched.communication &&
                                        touched.communication[
                                        list.name as keyof ErrorName
                                        ] && (
                                          <>
                                            <div className="text-[#E85626]">
                                              {
                                                errors.communication[
                                                list.name as keyof ErrorName
                                                ]
                                              }
                                            </div>
                                          </>
                                        )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          />
                        </div>

                        <div>
                          <div className={`text-sm ${!registrationFlow ? "text-[#37085B]" : "text-[#FFFFFF]"} font-semibold mb-6`}>
                            Categories
                          </div>
                          <div className="">
                            <div className="grid grid-cols-2 gap-4">
                              {categories.map((cat: any, index: any) => {
                                if (!hiddenCatList.includes(cat?.name)) {
                                  return (
                                    <div
                                      key={cat?.sequence}
                                      className=" mb-1 text-[#37085B]"
                                    >
                                      <Field
                                        type="checkbox"
                                        name={cat?.name}
                                        placeholder="Profile Description"
                                        id={cat?.name + index}
                                        onChange={(event: any) => handleCheckChat(cat?.name)}
                                        checked={selectCat.includes(cat?.name)}
                                        className={`border-[#37085B] h-5 w-5 rounded-lg border bg-white checked:bg-[#37085B] checked:border-[#37085B] focus:outline-none transition duration-200 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                                    }`}
                                      />
                                      <label
                                        className={`text-sm font-semibold inline-block ${!registrationFlow ? "text-[#37085B]" : "text-[#FFFFFF]"}`}
                                        htmlFor={cat?.name + index}
                                        style={{ fontFamily: "Montserrat" }}
                                      >
                                        {cat?.name}
                                      </label>
                                    </div>
                                  )
                                }
                              })}
                            </div>
                          </div>
                        </div>

                      </div>

                      <div className="mt-4">

                        <label
                          htmlFor="exampleFormControlInpu3"
                          className={`form-label font-['Montserrat'] leading-none inline-block text-base font-normal ${!registrationFlow ? "text-[#37085B]" : "text-[#FFFFFF]"}`}
                        >
                          Members Public Information
                        </label>

                        <CKEditor
                          editor={DecoupledcEditor}
                          config={{
                            extraPlugins: [uploadPlugin],
                            toolbar: {
                              items: [
                                'fontfamily',
                                'fontsize',
                                'fontColor',
                                'fontBackgroundColor',
                                "|",
                                "bold",
                                "italic",
                                "|",
                                "link",
                                "bulletedList",
                                "numberedList",
                                "|",
                                "indent",
                                "outdent",
                                "|",
                                "insertTable",
                                "uploadImage",
                                // "mediaEmbed",
                                "undo",
                                "redo",
                              ],
                            },
                          }}
                          className="ck"
                          name="ProfileInfo"
                          data={values.profileInfo || ""}
                          onReady={(editor: any) => {
                            editor.ui
                              .getEditableElement()
                              .parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
                          }}
                          onChange={(e: any, editor: any) => ckEditorHandleChange(e, editor, setFieldValue)}
                        // onBlur={() => formik.setFieldTouched("description", true)}
                        />

                        {/* <div ref={prevReviewTextRef} className="mt-4 ck ck-content break-words ck-editor__editable ck-rounded-corners ck-editor__editable_inline ck-blurred"></div>  */}
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-6">
                    <button type="submit" disabled={profileDisable} className={`border  ${!registrationFlow ? "border-[#37085B] text-[#37085B] px-14" : "border-[#673AB7] text-[#673AB7] bg-[#FFFFFF] px-20"} py-2 rounded-lg font-medium  ${profileDisable && "opacity-25"}`}>
                      {!registrationFlow ? "Save Profile" : "Register"}
                    </button>
                  </div>

                  <ReCAPTCHA
                    sitekey={siteKey}
                    ref={captchaRef}
                    size="invisible"
                  />
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>

      {conformationModal && (
        <PreviewConformationModal
          setConformationModal={setConformationModal}
          setPreviewModal={setPreviewModal}
          onSubmit={onSubmit}
          updatedProfileDetails={updatedProfileDetails}
        />
      )}

      {previewModal && (
        <ProfilePreviewModal
          updatedProfileDetails={updatedProfileDetails}
          setPreviewModal={setPreviewModal}
          onSubmit={onSubmit}
          uploadedImage={uploadedImage}
        />
      )}

      {showCrop && (
        <ImageCrop
          cloesCrop={cloesCrop}
          file={uploadedImage}
          onSubmitFile={onSubmitFile}
          cropShape={"rect"}
        />
      )}
    </div>
  )
}

export default connect()(ManageProfile);
