import React from 'react'
import whiteClose from "../../assets/images/whiteClose.svg";
import welcomePopup from "../../assets/images/welcomePopup.gif";
import { useNavigate } from 'react-router-dom';

const WelcomePopup = ({ onClickOnCancel }: any) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="fixed flex items-center inset-0 z-50 outline-none focus:outline-none rounded-2xl">
        <div className="relative flex justify-center font-['Montserrat'] w-11/12 md:w-auto mx-auto max-w-3xl bg-black rounded  h-[90%] smallScroll overflow-auto">
          <div
            className="flex absolute top-[7px] right-[7px] justify-end text-xl font-bold text-black cursor-pointer"
            onClick={onClickOnCancel}
          >
            <img src={whiteClose} alt="" />
          </div>

          <img src={welcomePopup} onClick={() => navigate("/user/registration")} />

        </div>
      </div>
      <div className="opacity-70 fixed inset-0 z-40 bg-black"></div>
    </>
  )
}

export default WelcomePopup
