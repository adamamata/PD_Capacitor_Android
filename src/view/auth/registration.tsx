import React, { useState, useEffect, useRef } from "react"
import phoneDarlingsLogo from "../../assets/images/phoneDarlingsLogo.svg"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import RctPageLoader from "../../component/RctPageLoader"
import { useLocation, useNavigate } from "react-router-dom"
import signInImage from "../../assets/images/signInImage.png"
import BackgroundUser from "../../assets/images/background.png"
import { useParams } from "react-router-dom"
import {
  createConsult,
  createUser,
  authLogin
} from "../../services/authService"
import { connect } from "react-redux"
import { useSelector } from "react-redux"
import { auth_details, auth_login } from "../../reducer/auth"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { LOCALSTORE, siteKey } from "../../constant/default"
import ReCAPTCHA from "react-google-recaptcha"
import downArray from "../../assets/images/downArrow.svg"
import whiteBackButton from "../../assets/images/whiteBackButton.svg"
import purpleBackButton from "../../assets/images/purpleBackButton.svg"
import { getallcontryList } from "../../services/homeService"
import Select, { components } from "react-select";
import { selectStyle } from "../../utils/selcetStyle"
import VerificationMailSentModal from "./verificationMailSentModal"
import { phoneRegex } from "../../utils/phoneRegex"

interface Values {
  lalstName: string
  firstName: string
  email: string
  password: string
  reEnterPassword: string
  phoneNumber: string
  userName: string
  dialCode: string
}

const SignIn: React.FC<any> = (props: any) => {
  const navigate = useNavigate()
  const location = useLocation()
  const captchaRef = useRef(null)
  const [isLoading, setLoading] = useState(false)
  const { type } = useParams()
  const errorMassges = ["Email"]
  const [errorEmail, setErrorEmail] = useState(false)
  const [erroruserName, setErroruserName] = useState(false)
  const code = useSelector(auth_details)
  const [condition, setCondition] = useState({ pp: false, tos: false })
  const [condtionError, setConditionError] = useState({ pp: false, tos: false })
  const formRef = useRef(null)
  const [countryList, setCountryList] = useState<any>([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [emailSentModal, setEmailSentModal] = useState(false)

  const registerSchema = Yup.object().shape({
    email: Yup.string()
      .email("Incorrect email entered. Please try again. ")
      .required("Enter Email"),
    password: Yup.string()
      .required("Enter Password")
      .min(8, "Password must be at least 8 characters"),
    dialCode: Yup.string().required("Please select Country dial code"),
    firstName: Yup.string().required("Enter first name"),
    lalstName: Yup.string().required("Enter lastName Name"),
    phoneNumber: Yup.string().matches(phoneRegex, "Please enter valid phone number").required("Enter Phone Number"),
    userName: Yup.string().required("Enter UserName"),
    reEnterPassword: Yup.string()
      .required("Enter Re-enter Password")
      .oneOf([Yup.ref("password"), null], "Passwords must match"),
  })

  const spRegisterSchema = Yup.object().shape({
    email: Yup.string()
      .email("Incorrect email entered. Please try again. ")
      .required("Enter Email"),
    password: Yup.string()
      .required("Enter Password")
      .min(8, "Password must be at least 8 characters"),
    dialCode: Yup.string().required("Please select Country dial code"),
    firstName: Yup.string().required("Enter first name"),
    lalstName: Yup.string().required("Enter lastName Name"),
    phoneNumber: Yup.string().matches(phoneRegex, "Please enter valid phone number").required("Enter Phone Number"),
    reEnterPassword: Yup.string()
      .required("Enter Re-enter Password")
      .oneOf([Yup.ref("password"), null], "Passwords must match"),
  })

  useEffect(() => { }, [type])

  const OnSubmit = async (values: Values) => {
    setLoading(true)
    const { dispatch } = props
    let token: any = captchaRef?.current
    let tokendata = token?.executeAsync()
    tokendata.then((tokenCap: any) => {
      if (type === "user") {
        if (condition?.pp && condition?.tos) {
          const body: any = {
            email: values.email,
            firstName: values.firstName,
            password: values.password,
            passwordConfirmed: values.reEnterPassword,
            lastName: values.lalstName,
            phoneNumber: values.phoneNumber,
            userName: values.userName,
            dialCode: values.dialCode,
          }
          if (location?.state && location?.state?.refCode) {
            body["refcode"] = location?.state?.refCode
          }

          dispatch(createUser(body, tokenCap))
            .then((res: any) => {
              setLoading(false)
              if (res.status === 201) {
                setEmailSentModal(true)
              }
            })
            .catch((err: any) => {
              setLoading(false)
              const massage = err.message
              const name = err.name
              if (errorMassges.includes(name)) {
                setErrorEmail(true)
              } else {
                toast.error(massage, {
                  theme: "colored",
                  autoClose: 5000
                })
              }
            })
        } else {
          setLoading(false)
          setConditionError({ pp: condition?.pp ? false : true, tos: condition?.tos ? false : true })
        }
      } else {
        if (condition?.pp && condition?.tos) {
          const body: any = {
            email: values.email,
            firstName: values.firstName,
            password: values.password,
            passwordConfirmed: values.reEnterPassword,
            lastName: values.lalstName,
            phoneNumber: values.phoneNumber,
            dialCode: values.dialCode,
          }
          if (location?.state && location?.state?.refCode) {
            body["refcode"] = location?.state?.refCode
          }

          dispatch(createConsult(body, tokenCap))
            .then((res: any) => {
              if (res) {
                setConditionError({ pp: false, tos: false })
                setLoading(false)
               
                if (res.status === 201) {
                  setEmailSentModal(true)
                }
              }
            })
            .catch((err: any) => {
              const massage = err.message
              const name = err.name
              if (errorMassges.includes(name)) {
                setErrorEmail(true)
              } else {
                toast.error(massage, {
                  theme: "colored",
                  autoClose: 5000
                })
              }
              setLoading(false)
            })
        } else {
          setConditionError({ pp: condition?.pp ? false : true, tos: condition?.tos ? false : true })
          setLoading(false)
        }
      }
    })
  }

  const onClicklogin = () => {
    navigate("/login")
  }

  const onClickConsultant = () => {
    navigate("/consultant/registration")
  }

  const changeEmail = (name: any) => {
    if (name === "" && errorEmail) {
      setErrorEmail(true)
    } else {
      setErrorEmail(false)
    }
  }

  const onChangeCondition = (e: any) => {
    if (e.target.name === "pp") {
      if (e.target.checked) {
        setConditionError({ ...condtionError, pp: false })
        setCondition({ ...condition, pp: true })
      } else {
        setConditionError({ ...condtionError, pp: true })
        setCondition({ ...condition, pp: false })
      }
    }

    if (e.target.name === "tos") {
      if (e.target.checked) {
        setConditionError({ ...condtionError, tos: false })
        setCondition({ ...condition, tos: true })
      } else {
        setConditionError({ ...condtionError, tos: true })
        setCondition({ ...condition, tos: false })
      }
    }
  }

  const onClickPolicy = () => {
    navigate("/legal/PP")
  }

  const onClickCondtion = () => {
    navigate("/legal/TOS")
  }

  useEffect(() => {
    getCountryListData();
  }, []);

  const getCountryListData = () => {
    const { dispatch } = props;
    const optionArr: any[] = []
    dispatch(getallcontryList())
      .then((res: any) => {
        console.log("res", res)
        res.data.map((country: any) => {
          optionArr.push({
            label: `(${country.dialCode}) ${country.name}`,
            value: country.dialCode,
            key: country.dialCode,
            chipLabel: `${country.dialCode}`
          });
        })
        setCountryList(optionArr);
      })
      .catch((err: any) => {
        console.log("err", err);
      });
  };

  const SingleValue = (props: any) => (
    <components.SingleValue {...props}>
      {props.data.chipLabel}
    </components.SingleValue>
  );

  const onChangeDialCode = (setFieldValue: any, value: any) => {
    setFieldValue("dialCode", value)
    setSelectedOption(countryList.find((country: any) => country.value === value))
  }

  return (
    <>
      {isLoading && <RctPageLoader />}
      <div className={`${type !== "user" ? "bg-[#36007a]" : "bg-[#F8F3FD]"} p-2 lg:p-6 min-h-screen`}>
        <div className="w-full bg-[#FFFFFF] h-[80px] rounded-b-full rounded-t-full">
          <div className="flex justify-center pt-[30px] font-bold flex-shrink-0 text-gray-800">
            <img
              src={phoneDarlingsLogo}
              alt="logo"
              className="mx-auto w-[183px] h-[26px]"
            />
          </div>
        </div>

        <div className="mt-4 lg:mt-2 w-full flex">
          <div className="lg:p-2 sm:p-0  w-full">
            <Formik
              initialValues={{
                lalstName: "",
                firstName: "",
                email: "",
                password: "",
                reEnterPassword: "",
                userName: "",
                phoneNumber: "",
                dialCode: ""
              }}
              onSubmit={(values: Values) => {
                OnSubmit(values)
              }}
              innerRef={formRef}
              validationSchema={type !== "user" ? spRegisterSchema : registerSchema}
            >
              {({ errors, touched, values, setFieldValue, handleBlur }: any) => (
                <Form className="lg:p-2">
                  <div className={`py-6 place-content-center ${type !== "user" ? "bg-[#2b0062]" : "bg-[#FFFFFF]"} rounded-[25px] p-2 h-full  w-full mx-auto`}>
                    <div className="w-full flex items-center ">
                      <div
                        className="ml-6 mr-auto"
                        onClick={() => navigate(`/login`)}
                      >
                        {type !== "user" ?

                          <img src={whiteBackButton} alt="arrow" />
                          :
                          <img src={purpleBackButton} alt="arrow" />
                        }
                      </div>

                      <div className="mr-auto">
                        {type !== "user" ?
                          <>
                            <p className={`w-full text-center font-jaldi ${type === "user" ? "text-black" : "text-[#fff]"}  text-[32px] font-semibold`}>
                              Darlings, Welcome.
                            </p>
                            <p className={`w-full text-center text-base font-normal font-jaldi ${type === "user" ? "text-black" : "text-[#fff]"} `}>
                              Not a darling? Customers, click the back button to
                              sign up.{" "}
                            </p>
                          </>
                          :
                          <>
                            <p className="w-full font-jaldi text-center text-[32px] font-semibold">Welcome to Phone Darlings! The darlings await.</p>
                            <p className="w-full text-center text-base font-normal">Not a customer? Darlings, click the back button to sign up.</p>
                          </>
                        }

                      </div>
                    </div>

                    <div className="mt-6 mx-auto font-jaldi w-11/12 lg:w-[70%]">
                      <div className="">
                        <div className="grid grid-cols-1 gap-[20px] lg:grid-cols-2 ">
                          <div className="custombp:mt-4">
                            <label className={`form-label inline-block text-lg custombp:text-2xl font-normal ${type === "user" ? "text-black" : "text-[#fff]"}  ml-0.5`}>
                              First Name
                            </label>
                            <Field
                              type="text"
                              name="firstName"
                              value={values.firstName}
                              autoComplete="off"
                              // onKeyUp={(e: any) => {
                              //   setFieldValue("username", e.target.value);
                              // }}
                              className={`px-3 py-1.5 text-base custombp:py-1 custombp:text-2xl form-control 
                        block w-full  font-normal text-gray-700 bg-[#ffffff80]
                        bg-clip-padding border border-solid border-[#C9C9C9] rounded transition 
                        ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:outline-none 
                        ${errors.firstName &&
                                touched.firstName &&
                                "border-[#E85626]"
                                }`}
                            />
                            {errors.firstName && touched.firstName && (
                              <div className="text-[#E85626] leading-none">
                                {errors.firstName}
                              </div>
                            )}
                          </div>

                          <div className="custombp:mt-4">
                            <label
                              className={`form-label inline-block text-lg custombp:text-2xl font-normal ${type === "user" ? "text-black" : "text-[#fff]"} ml-0.5`}
                            >
                              Last Name
                            </label>
                            <Field
                              type="text"
                              value={values.lalstName}
                              name="lalstName"
                              autoComplete="off"
                              className={`px-3 py-1.5 custombp:py-1 custombp:text-2xl form-control block 
                        w-full text-base font-normal text-gray-700 bg-[#ffffff80] bg-clip-padding border
                         border-solid border-[#C9C9C9] rounded transition ease-in-out m-0 focus:text-gray-700
                          focus:bg-white focus:outline-none ${(errors.lalstName &&
                                  touched.lalstName &&
                                  "border-[#E85626]") ||
                                (erroruserName && "border-[#E85626]")
                                }`}
                            />
                            {errors.lalstName && touched.lalstName && (
                              <div className="text-[#E85626] leading-none">
                                {errors.lalstName}
                              </div>
                            )}
                          </div>

                          {type === "user" && (
                            <div className="custombp:mt-4">
                              <label className={`form-label inline-block text-lg custombp:text-2xl font-normal ${type === "user" ? "text-black" : "text-[#fff]"} ml-0.5`}>
                                User Name
                              </label>
                              <Field
                                type="text"
                                name="userName"
                                autoComplete="off"
                                value={values.userName}
                                className={`px-3 py-1.5 custombp:py-1 custombp:text-2xl form-control 
                        block w-full text-base font-normal text-gray-700 bg-[#ffffff80] 
                        bg-clip-padding border border-solid border-[#C9C9C9] rounded transition 
                        ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:outline-none 
                        ${errors.userName &&
                                  touched.userName &&
                                  "border-[#E85626]"
                                  }`}
                              />
                              {errors.userName && touched.userName && (
                                <div className="text-[#E85626] leading-none">
                                  {errors.userName}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="custombp:mt-4">
                            <label className={`form-label inline-block text-lg custombp:text-2xl font-normal ${type === "user" ? "text-black" : "text-[#fff]"}  ml-0.5`}>
                              Email
                            </label>
                            <Field
                              type="text"
                              name="email"
                              autoComplete="off"
                              onKeyUp={(e: any) => changeEmail(e.target.value)}
                              className={`px-3 py-1.5 text-base custombp:py-1 custombp:text-2xl form-control block w-full  font-normal text-gray-700 bg-[#ffffff80] bg-clip-padding border border-solid border-[#C9C9C9] rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:outline-none  ${(errors.email &&
                                touched.email &&
                                "border-[#E85626]") ||
                                (errorEmail && "border-[#E85626]")
                                }`}
                            />
                            {errors.email && touched.email && (
                              <div className="text-[#E85626] leading-none">
                                {errors.email}
                              </div>
                            )}
                            {errorEmail && (
                              <div className="text-[#E85626] leading-none">
                                This email has already been registered in the
                                system. Please log in to continue.
                              </div>
                            )}
                          </div>
                          <div className="custombp:mt-4">


                            <div className="flex items-center justify-between">
                              <div className="w-[35%] md:w-[20%] lg:w-[25%] ">
                                <label className={`form-label inline-block text-lg custombp:text-2xl font-normal ${type === "user" ? "text-black" : "text-[#fff]"}  ml-0.5`}>
                                  Select
                                </label>
                                <div className="bg-[#ffffff80] rounded">
                                  <Select
                                    components={{ SingleValue }}
                                    options={countryList}
                                    value={selectedOption}
                                    onChange={(e: any) => onChangeDialCode(setFieldValue, e.value)}
                                    onBlur={handleBlur}
                                    styles={selectStyle}
                                    classNames={{
                                      control: () => `border border-solid border-[#C9C9C9] ${errors.dialCode &&
                                        touched.dialCode &&
                                        "border-[#E85626]"
                                        }`,
                                    }}
                                    classNamePrefix="react-select"
                                    placeholder=""
                                    isSearchable={false}
                                    name="dialCode"
                                  />
                                </div>
                              </div>

                              <div className="w-[62%] md:w-[70%] lg:w-[73%]">
                                <label className={`form-label inline-block text-lg custombp:text-2xl font-normal ${type === "user" ? "text-black" : "text-[#fff]"}  ml-0.5`}>
                                  Area code and Phone, Digits Only
                                </label>
                                <Field
                                  type="text"
                                  name="phoneNumber"
                                  autoComplete="off"
                                  className={`px-3 py-1.5 text-base custombp:py-1 custombp:text-2xl form-control block w-full font-normal text-gray-700 bg-[#ffffff80] bg-clip-padding border border-solid border-[#C9C9C9] rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:outline-none ${errors.phoneNumber &&
                                    touched.phoneNumber &&
                                    "border-[#E85626]"
                                    }`}
                                />
                              </div>
                            </div>

                            {(errors.phoneNumber && touched.phoneNumber) || (errors.dialCode && touched.dialCode) ? (
                              <div className="text-[#E85626]">{errors.phoneNumber ? errors.phoneNumber as string : errors?.dialCode}</div>
                            ) : null}

                          </div>
                          <div className="custombp:mt-4">
                            <label className={`form-label inline-block text-lg custombp:text-2xl font-normal ${type === "user" ? "text-black" : "text-[#fff]"}  ml-0.5`}>
                              Password
                            </label>
                            <Field
                              type="password"
                              name="password"
                              autocomplete="new-password"
                              className={`px-3 py-1.5 text-base custombp:py-1 custombp:text-2xl form-control block w-full font-normal text-gray-700 bg-[#ffffff80] bg-clip-padding border border-solid border-[#C9C9C9] rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:outline-none ${errors.password &&
                                touched.password &&
                                "border-[#E85626]"
                                }`}
                            />
                            {errors.password && touched.password && (
                              <div className="text-[#E85626] leading-none">
                                {errors.password}
                              </div>
                            )}
                          </div>
                          <div className="custombp:mt-4">
                            <label className={`form-label inline-block text-lg custombp:text-2xl font-normal ${type === "user" ? "text-black" : "text-[#fff]"}  ml-0.5`}>
                              Re-enter Password
                            </label>
                            <Field
                              type="password"
                              name="reEnterPassword"
                              autocomplete="new-password"
                              className={`px-3 py-1.5 text-base custombp:py-1 custombp:text-2xl form-control block w-full font-normal text-gray-700 bg-[#ffffff80] bg-clip-padding border border-solid border-[#C9C9C9] rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:outline-none ${errors.reEnterPassword &&
                                touched.reEnterPassword &&
                                "border-[#E85626]"
                                }`}
                            />
                            {errors.reEnterPassword &&
                              touched.reEnterPassword && (
                                <div className="text-[#E85626] leading-none">
                                  {errors.reEnterPassword}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>

                      <div className="w-full text-left my-3 font-jaldi text-[#fff] ">
                        None of these fields will be shown on the platform.
                      </div>
                      <div className="mb-4 mt-4 flex flex-wrap justify-normal lg:justify-center">
                        <div className="custombp:mt-4 flex items-center text-left relative">
                          <input
                            className={`accent-white appearance-none cursor-pointer before:content-[''] before:absolute before:w-5 before:h-5 before:top-[0px] before:left-0 before:border before:${type !== 'user' ? "border-[#fff]" : "border-[#2b0062]"} before:rounded-sm before:${type !== 'user' ? "bg-[#2b0062]" : "bg-white"} ${condition?.pp ? "before:bg-[#2b0062] after:content-[''] after:block after:w-[5px] after:h-[10px] after:absolute after:rotate-45 after:border-white after:border-r-2 after:border-b-2 after:border-t-0 after:top-[4px] after:left-[7px]" : ""}`}
                            type="checkbox"
                            value=""
                            id="iAmAgree"
                            name="pp"
                            onChange={(e) => onChangeCondition(e)}
                            checked={condition?.pp}
                          />
                          <label
                            className={`text-[15px] ml-6 font-normal leading-none  ${type === "user" ? "text-black" : "text-[#fff]"} `}
                            htmlFor="iAmAgree"
                            style={{ fontFamily: "Montserrat" }}
                          >
                            I agree to the{" "}
                            <span
                              className="underline cursor-pointer"
                              onClick={onClickCondtion}
                            >
                              PrivacyPolicy
                            </span>{" "}
                          </label>
                        </div>
                        {condtionError?.pp && (
                          <div className="text-[#E85626] w-full mt-2 ml-6 lg:ml-0 lg:text-center">
                            select agree to the privacy policy
                          </div>
                        )}
                      </div>
                      <div className="mb-4 flex flex-wrap justify-normal lg:justify-center">
                        <div className="custombp:mt-4 flex items-center text-left relative">
                          <input
                            className={`accent-white appearance-none cursor-pointer before:content-[''] before:absolute before:w-5 before:h-5 before:top-[0px] before:left-0 before:border before:${type !== 'user' ? "border-[#fff]" : "border-[#2b0062]"} before:rounded-sm before:${type !== 'user' ? "bg-[#2b0062]" : "bg-white"} ${condition?.tos ? "before:bg-[#2b0062] after:content-[''] after:block after:w-[5px] after:h-[10px] after:absolute after:rotate-45 after:border-white after:border-r-2 after:border-b-2 after:border-t-0 after:top-[4px] after:left-[7px]" : ""}`}
                            type="checkbox"
                            value=""
                            id="iAmAgree"
                            name="tos"
                            onChange={(e) => onChangeCondition(e)}
                            checked={condition?.tos}
                          />
                          <label
                            className={`text-[15px] ml-6 font-normal leading-none ${type === "user" ? "text-black" : "text-[#fff]"} `}
                            htmlFor="iAmAgree"
                            style={{ fontFamily: "Montserrat" }}
                          >
                            I agree to the{" "}
                            <span
                              className="underline cursor-pointer"
                              onClick={onClickCondtion}
                            >
                              Terms & Conditions
                            </span>{" "}
                          </label>
                        </div>
                        {condtionError?.tos && (
                          <div className="text-[#E85626] w-full mt-2 ml-6 lg:ml-0 lg:text-center">
                            select agree to the terms and condition
                          </div>
                        )}
                      </div>
                      <div>
                        {" "}
                        <ReCAPTCHA
                          sitekey={siteKey}
                          ref={captchaRef}
                          size="invisible"
                        />
                      </div>
                      <div className="text-center w-full mt-5 custombp:mt-4 font-jaldi">
                        <button
                          className={`py-2 w-full md:w-1/2  ${type !== "user" ? "bg-[#fff]" : "bg-[#673AB7]"} rounded-lg text-xl ${type !== "user" ? "text-[#673AB7]" : "text-[#fff]"}`}
                          type="submit"
                        >
                          Sign Me Up
                        </button>
                      </div>
                      <div className='flex justify-center mt-12 bottom-0 gap-4'>
                        <div className={`w-[8.875rem] h-2.5 ${type !== "user" ? "bg-[#5E4084]" : "bg-[#F8F3FD]"} rounded-sm`}></div>
                        <div className={`w-[8.875rem] h-2.5 ${type !== "user" ? "bg-[#5E4084]" : "bg-[#F8F3FD]"} rounded-sm`}></div>
                        <div className={`w-[8.875rem] h-2.5 ${type !== "user" ? "bg-[#5E4084] block" : "bg-[#F8F3FD] hidden"} rounded-sm`}></div>
                      </div>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>

      {emailSentModal && (
        <VerificationMailSentModal />
      )}

    </>
  )
}

export default connect()(SignIn)
