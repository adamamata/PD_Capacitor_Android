import React from "react";
import close from "../../../assets/images/close.svg";
import gift from "../../../assets/images/gift.svg";

const GiftSent = (props: any) => {
  return (
    <>
      <div className="fixed flex items-center inset-0 z-50 outline-none focus:outline-none rounded-2xl">
        <div className="relative font-['Montserrat'] w-11/12 md:w-auto mx-auto max-w-3xl bg-white rounded px-8 py-6">
          <div
            className="flex justify-end text-xl font-bold text-black cursor-pointer"
            onClick={props.onMainClose}
          >
            <img src={close} alt="" />
          </div>
          {props.giftSentMassges === "request" ? (
            <div className="text-center text-2xl text-[#37085B] font-bold mt-1">
              Your gift request has been sent.
            </div>
          ) : (
            <div className="text-center text-2xl text-[#37085B] font-bold mt-1">
              Your gift has been sent.
            </div>
          )}
          <img src={gift} className="mx-auto mt-8" alt="" />
          <p className="text-sm text-[#37085B] font-medium mt-8">
            Thank you for sending a gift to{" "}
            {props?.chatUser?.participantDisplayName}.
          </p>

          <div className="flex justify-center mt-6">
            <button
              className="bg-[#37085B] mx-auto text-white text-sm xl:text-lg py-2 px-6 md:px-4 xl:px-14 rounded-full"
              onClick={props.onMainClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
      <div className="opacity-70 fixed inset-0 z-40 bg-black"></div>
    </>
  );
};

export default GiftSent;
