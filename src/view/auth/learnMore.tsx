import React, { useEffect } from 'react'
import HeaderHome from '../dashboard/commons/headerHome'
import heroImage from "../../assets/images/heroImage.png";
import Footer from '../../component/footer';
import twemojiBitingLip from "../../assets/images/twemojiBitingLip.svg"
import fluentCrown from "../../assets/images/fluentCrown.svg"
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import phoneDarlingsLogo from "../../assets/images/phoneDarlingsLogo.svg"
import whiteBackButton from "../../assets/images/whiteBackButton.svg"
import purpleBackButton from "../../assets/images/purpleBackButton.svg"

const LearnMore = () => {
  const navigate = useNavigate();
  const location = useLocation()
  const { type } = useParams()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const onClickNavigate = () => {
    if(type !== "user") {
      navigate("/consultant/registration", {state: {refCode: location?.state?.refCode}});
    } else {
      navigate("/user/registration", {state: {refCode: location?.state?.refCode}})
    }
  };

  return (
    <>
      <div className={`${type !== "user" ? "bg-[#36007a]" : "bg-[#F8F3FD]"} p-2 lg:p-6 h-[100dvh]`}>
        <div className="w-full bg-[#FFFFFF] h-[80px] rounded-b-full rounded-t-full">
          <div className="flex justify-center pt-[30px] font-bold flex-shrink-0 text-gray-800">
            <img
              src={phoneDarlingsLogo}
              alt="logo"
              className="mx-auto w-[183px] h-[26px]"
            />
          </div>
        </div>

        <div className="mt-4 lg:my-8 w-full flex">
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
                    <p className={`w-full text-center pr-10 font-jaldi ${type === "user" ? "text-black" : "text-[#fff]"}  text-[32px] font-semibold`}>
                      Darlings, Welcome.
                    </p>
                  </>
                  :
                  <>
                    <p className="w-full font-jaldi text-center text-[32px] font-semibold">Welcome to Phone Darlings! The <span className='italic'>darlings await.</span></p>
                    {/* <p className="w-full text-center text-base font-normal">Not a customer? Darlings, click the back button to sign up.</p> */}
                  </>
                }

              </div>
            </div>


            <div className="pt-2 text-center font-['manrope'] text-[20px] font-extrabold mt-4 h-[calc(100dvh_-_276px)] overflow-y-auto smallScroll px-8">
              <div className={`font-bold mb-2 w-full text-center ${type === "user" ? "text-[#6e37be]" : "text-[#C1AEE2]"}`}>GET STARTED </div>

              {type !== "user" ?
                <>
                  <p className={`${type === "user" ? "text-black" : "text-[#fff]"}`}>
                    After hearing the complaints of many service providers about current platforms – where connection problems with their VoIP services often cost them precious time and money – we have developed the newest platform to answer these complaints. We had the service provider in mind when designing this new platform. Welcome to Phone Darlings, where we've revolutionized the way PSO’s / Cam Models (Darlings) connect with clients.
                  </p>

                  <p className={`${type === "user" ? "text-black" : "text-[#fff]"} mt-4`}>
                    Say goodbye to outdated platforms and hello to a world of innovation. With crystal clear audio, integrated One-way or Two-way video calls, and no connection or advertising fees, we're setting a new standard in user experience. Join us now and enjoy lower fees (25%), simplified management, and the utmost respect for your privacy. Plus, our mobile-friendly design ensures you can connect seamlessly on your mobile device and stay tuned – we'll soon be available for download on your favorite app stores. It's time to upgrade your service game – start with Phone Darlings today.
                  </p>

                  <div className="font-bold w-full text-center text-[#C1AEE2] my-12">ENJOY</div>

                  <div className='text-left'>
                    <span className='text-[#C1AEE2]'>Crystal Clear Direct Audio</span>
                    <span className={`${type === "user" ? "text-black" : "text-[#fff]"}`}>: Experience glitch-free, direct audio connections, akin to WhatsApp and Skype, ensuring your conversations are always smooth and frustration-free.
                    </span>
                  </div>

                  <div className='text-left mt-3'>
                    <span className='text-[#C1AEE2]'>Integrated Video Calls</span>
                    <span className={`${type === "user" ? "text-black" : "text-[#fff]"}`}>: Say goodbye to juggling multiple platforms for video calls. Our service provides hassle-free one-way and two-way video connections right within the platform.
                    </span>
                  </div>

                  <div className='text-left mt-3'>
                    <span className='text-[#C1AEE2]'>Zero Connection Fees</span>
                    <span className={`${type === "user" ? "text-black" : "text-[#fff]"}`}>: Unlike other services, we don't charge connection fees. Join us and save on costs, making it easier to connect with clients.
                    </span>
                  </div>

                  <div className='text-left mt-3'>
                    <span className='text-[#C1AEE2]'>Priority Placement for Early Birds</span>
                    <span className={`${type === "user" ? "text-black" : "text-[#fff]"}`}>: Be among the first 50 sign-ups, and you'll enjoy priority placement until we introduce our rotating front page. This means your profile will be prominently featured, giving you an edge in connecting with potential clients. We believe in rewarding early adopters, so sign up now for this exclusive advantage!
                    </span>
                  </div>

                  <div className='text-left mt-3'>
                    <span className='text-[#C1AEE2]'>Lower Fees</span>
                    <span className={`${type === "user" ? "text-black" : "text-[#fff]"}`}>: Enjoy a low 25% service fee, far less than the 30% ++ - 65% charged by other platforms. Keep more of your earnings while benefiting from our features.
                    </span>
                  </div>

                  <div className='text-left mt-3'>
                    <span className='text-[#C1AEE2]'>Lower Fees</span>
                    <span className={`${type === "user" ? "text-black" : "text-[#fff]"}`}>: Enjoy a low 25% service fee, far less than the 30% ++ - 65% charged by other platforms. Keep more of your earnings while benefiting from our features.
                    </span>
                  </div>

                  <div className='text-left mt-3'>
                    <span className='text-[#C1AEE2]'>Simplified Management</span>
                    <span className={`${type === "user" ? "text-black" : "text-[#fff]"}`}>: Manage multiple profiles from a single main account and monitor all your chats and customers from one screen. We've made it easier than ever to stay organized.
                    </span>
                  </div>

                  <div className='text-left mt-3'>
                    <span className='text-[#C1AEE2]'>Respect for Privacy</span>
                    <span className={`${type === "user" ? "text-black" : "text-[#fff]"}`}>: Your calls and text chats are entirely private - no monitoring. We're committed to respecting your privacy, so you can communicate with confidence.
                    </span>
                  </div>

                  <div className='text-left mt-3'>
                    <span className={`${type === "user" ? "text-black" : "text-[#fff]"}`}>Don't miss out on these incredible benefits. Join us today for a superior experience in connecting with clients and managing your services.
                    </span>
                  </div>
                </>
                :
                <>
                  <p className={`${type === "user" ? "text-black" : "text-[#fff]"}`}>
                    Are you tired of struggling with outdated communication platforms? Say goodbye to connection issues, hidden fees, and complicated interfaces. Introducing Phone Darlings, your new gateway to seamless and private connections with your favorite PSO's and Cam Models.
                  </p>

                  <p className={`${type === "user" ? "text-black" : "text-[#fff]"}`}>
                    At Phone Darlings, we've prioritized your satisfaction. Experience the future of client connections with these exciting features:
                  </p>

                  <div className='text-left mt-4'>
                    <span className='text-[#6e37be]'>Crystal Clear Direct Audio</span>
                    <span className={`${type === "user" ? "text-black" : "text-[#fff]"}`}>: Enjoy smooth and uninterrupted conversations, just like using WhatsApp or Skype, ensuring every interaction is frustration-free.
                    </span>
                  </div>

                  <div className='text-left mt-4'>
                    <span className='text-[#6e37be]'>Integrated Video Calls</span>
                    <span className={`${type === "user" ? "text-black" : "text-[#fff]"}`}>: No more hopping between platforms for video calls. With Phone Darlings, you can effortlessly engage in one-way and two-way video chats right within the platform.
                    </span>
                  </div>

                  <div className='text-left mt-4'>
                    <span className='text-[#6e37be]'>Zero Connection Fees</span>
                    <span className={`${type === "user" ? "text-black" : "text-[#fff]"}`}>: Unlike other services, we won't burden you with connection fees. Join us and save on costs, making it easier than ever to connect with your desired Darlings.
                    </span>
                  </div>

                  <div className='text-left mt-4'>
                    <span className='text-[#6e37be]'>Respect for Privacy</span>
                    <span className={`${type === "user" ? "text-black" : "text-[#fff]"}`}>: Rest assured that your calls and text chats are entirely private with no monitoring. Your privacy is our priority, allowing you to communicate freely with confidence.
                    </span>
                  </div>

                  <div className='text-left mt-4'>
                    <span className='text-[#6e37be]'>Join</span>
                    <span className={`${type === "user" ? "text-black" : "text-[#fff]"}`}>: The ever-growing Phone Darlings family today and experience the reasons why top providers from other platforms are flocking to our service. They've embraced our platform for its lightning-fast connections and user-friendly chat system, and many have even lowered their rates, thanks to our lower fees that provide you with more value for your money.
                    </span>
                  </div>

                  <div className='text-left mt-4'>
                    <span className='text-[#6e37be]'>Sign up and log in</span>
                    <span className={`${type === "user" ? "text-black" : "text-[#fff]"}`}>: to explore our platform and discover your favorite provider. If you don't find them here, be sure to spread the word and let them know about us. It's a win-win for both you and them - a chance to enjoy the best in the industry while reaping the benefits of Phone Darlings. Join us today and be part of something truly exceptional!
                    </span>
                  </div>

                  <div className='text-left'>
                    <span className={`${type === "user" ? "text-black" : "text-[#fff]"}`}>Don't miss out on this opportunity to connect with the best in the industry while enjoying all the benefits Phone Darlings has to offer. Join us today!
                    </span>
                  </div>


                </>
              }


              <div className={`font-bold w-full text-center ${type === "user" ? "text-[#6e37be]" : "text-[#C1AEE2]"} my-8`}>JOIN US</div>

              <div className='w-full flex justify-center mb-3'>
                <button
                  className={`mt-4 px-4 md:px-12 p-2.5 ${type === "user" ? "bg-[#F0E3FF] text-[#36007A]" : "bg-[#36007A] text-[#FFF]"}  border-[#969696] border rounded h-15 items-center text-left  text-xl font-normal`}
                  onClick={() => onClickNavigate()}
                  autoFocus={false}
                >
                  {type !== "user" ? 
                  <>
                    <p className="flex items-center justify-center pr-6">
                      <span className="mr-[15px]">
                        <img src={twemojiBitingLip} alt="twemojiBitingLip" />
                      </span>
                      Darlings Sign Up
                    </p>
                  </>
                  :
                  <>
                  <p className="flex items-center justify-center">
                    <span className="mr-[15px]">
                      <img src={fluentCrown} alt="Crown" />
                    </span>
                    Customers Sign Up
                  </p>
                  </>
                  }

                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  )
}

export default LearnMore
