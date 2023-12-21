import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import moment from "moment";
import user3 from "../../../assets/images/user3.jpeg";
import replyIamge from "../../../assets/images/reply.svg";
import pin from "../../../assets/images/pin.png";
import {
  searchInbox,
  attachedFile,
  messageSend,
} from "../../../services/homeService";
import RctPageLoader from "../../../component/RctPageLoader";
import close from "../../../assets/images/purpleClose.svg";
import EmptyReply from "../../../assets/images/emptyReply.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Cprops {
  contact: any;
  dispatch: any;
  allContactdata:any
  getwholeListdata: any;
  selectedOption?: any
}

const uploadFileData: any = [];
const tempFile: any = [];

const InboxsContant: React.FC<any> = (props: Cprops | any) => {
  const { contact, dispatch, getwholeListdata ,allContactdata, showInbox, setShowInbox, selectedOption } = props;
  const [shownAll, setShowAll] = useState<Boolean>(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<any>([]);
  const hiddenFileInput = React.useRef<HTMLInputElement | null>(null);
  const [uploadFileRes, setUploadFileRes] = useState<any>([]);
  const [replyData, setReply] = useState<any>();
  const [replyShow, setShowReply] = useState<Boolean>(false);
  const [showString, setShowString] = useState<any>();
  const [showContact, setSHowContact] = useState<any>();

  useEffect(() => {
    setReply("test");
    setShowReply(false);
    setShowString("abc");
    setSHowContact(10000);
  }, [contact]);

  const download = (data: any) => {
    var element = document.createElement("a");
    var file = new Blob([data], { type: "image" });
    element.href = URL.createObjectURL(file);
    element.download = "image.jpg";
    element.click();
  };

  const onChange = (e: any) => {
    setLoading(true);
    let formData = new FormData();
    const { dispatch } = props;
    formData.append("thumbnailEn", e.target.files[0]);
    dispatch(attachedFile(formData))
      .then((res: any) => {
        if (res.data.isSuccess) {
          uploadFileData.push(res.data.data);
          tempFile.push(e.target.files[0]);
          setUploadFile(tempFile);
          setUploadFileRes(uploadFileData);
          setLoading(false);
          toast.success("Image upload Successfull!", {
            theme: "colored",
            autoClose: 5000,
          });
        }
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

  const handleRemoveFile = (postImage: string) => {
    const removePostImage = uploadFile.filter(
      (image: any) => image !== postImage
    );
    setUploadFile(removePostImage);
  };

  const goToReply = (data: any, name: any) => {
    setReply(data);
    setShowReply(true);
    setShowString(name);
  };

  const onSumitData = () => {
    const body = {
      receiverIds: [replyData?.senderId],
      receiverNames: [replyData?.senderName],
      subject: replyData?.subject,
      content: message,
      attached: uploadFileRes,
      replyTo: replyData?.id,
    };
    dispatch(messageSend(body, selectedOption?.value ?? selectedOption?.id))
      .then((res: any) => {
        setReply(false);
        setLoading(false);
        toast.success("Message Reply Send Successfull!", {
          theme: "colored",
          autoClose: 5000,
        });
        setShowReply(false);
        allContactdata(contact)
        getwholeListdata();
      })
      .catch((err: any) => {
        setLoading(false);
        setShowReply(false);
        getwholeListdata();
        const massage = err?.message;
        toast.error(massage, {
          theme: "colored",
          autoClose: 5000,
        });
      })
      .finally(() => setLoading(false))
  };

  const setShowAllContact = (name: any) => {
    setSHowContact(name);
  };

  return (
    <>
      {loading && <RctPageLoader />}
      <div
        className={`mx-auto
           "bg-white overflow-auto
         w-full 
        lg:block px-2 md:px-6 py-4 xxl:w-[68.7%] rounded-2xl smallScroll lg:h-[calc(100vh_-_140px)]`}
      >
        {" "}
        {contact ? (
          <>
            <div>
              <div className="font-medium flex justify-between">
                {" "}
                {moment(contact?.created).format("LL")}

                <img
                  src={close}
                  onClick={() => setShowInbox(false)}
                  className={`${showInbox ? "block" : "hidden"
                    } lg:hidden w-9`}
                  alt=""
                />
              </div>
              <div className="font-medium text-2xl mt-2">
                {contact?.subject}
              </div>
            </div>

            <hr className="mt-6"></hr>
            {contact?.related?.map((res: any, index: any) => (
              <>
                <div>
                  <div
                    className="mt-6 flex cursor-pointer"
                    onClick={() => setShowAllContact(index)}
                  >
                    {res?.senderImageUrl ? (
                         <div className="w-[40px] h-[40px] min-w-[40px] min-h-[40px]">
                         <img
                         src={res?.senderImageUrl}
                         className="w-full h-full rounded-full"
                         alt=""
                       />
                       </div>
                    ) : (

                      <div className="w-[40px] h-[40px] min-w-[40px] min-h-[40px]">
                        <img
                        src={EmptyReply}
                        className="w-full h-full rounded-full"
                        alt=""
                      />
                      </div>
                    )}
                    <div className="pl-4 font-bold">
                      {res?.senderName === res?.receiverName
                        ? "You"
                        : res?.senderName}
                    </div>
                    <div className="pl-4 ">
                      {Number(showContact) === index
                        ? ""
                        : res?.content?.substring(0, 70)}
                    </div>
                  </div>
                  <div className="flex justify-end lg:mt-[-30px]">
                    {moment(contact?.created).format("LL")}
                  </div>
                  {Number(showContact) === Number(index) && (
                    <>
                      <div className="p-4 lg:pl-14 flex w-full items-center justify-between">
                        <div className="flex flex-wrap w-full items-center">
                          {res?.attached.map((image: any) => (
                            <p
                              className="text-sm mt-2 mr-2 lg:mr-4 break-all cursor-pointer bg-[#673ab726] h-[35px] px-2 md:px-4 lg:px-6 py-4 w-fit pt-[6px]"
                              onClick={() => download(image)}
                            >
                              attachment.png
                            </p>
                          ))}
                        </div>

                        <div
                          className="flex w-fit min-w-fit justify-end cursor-pointer items-center"
                          onClick={() => goToReply(res, index)}
                        >
                          <div>
                            <img src={replyIamge} />
                          </div>
                          <div className="pl-[10px] text-[#474747] font-[600]">
                            Reply
                          </div>
                        </div>
                      </div>
                      <div className="pl-14 mt-10">{res?.content}</div>
                    </>
                  )}
                </div>
                {showString === index &&
                  replyShow &&
                  Number(showContact) === Number(index) && (
                    <>
                      <div className="mt-6">
                        <textarea
                          placeholder="Enter your message here"
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full bg-transparent text-sm mt-4 resize-none rounded-md min-h-[calc(100vh_-_341px)] p-2 md:min-h-[calc(100vh_-_400px)] xl:min-h-[calc(80vh_-_395px)] border border-gray-300 focus:border-primary focus:outline-none"
                        ></textarea>
                      </div>{" "}
                      <div className="flex">
                        <label className="custom-file-upload cursor-pointer flex">
                          <input
                            type="file"
                            className="hidden"
                            ref={hiddenFileInput}
                            multiple
                            onChange={(e) => {
                              onChange(e);
                            }}
                          />
                          <img src={pin} />
                          <div className="text-[#474747] ml-2">
                            Include Attachments
                          </div>
                        </label>
                      </div>{" "}
                      <div className="mt-2 flex-wrap gap-4">
                        {uploadFile.map((file: any) => (
                          <div className="flex mt-2">
                            <div>{file?.name}</div>
                            <img
                              src={close}
                              className="bg-white rounded-full w-[20px] p-1 cursor-pointer"
                              onClick={() => handleRemoveFile(file)}
                              alt="close"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end">
                        <button
                          className={`bg-primary text-xl text-white font-semibold py-2 px-8 rounded`}
                          onClick={onSumitData}
                        >
                          Send
                        </button>
                      </div>
                    </>
                  )}
                <hr className="mt-6"></hr>
              </>
            ))}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            Select an item to read.
          </div>
        )}
      </div>
    </>
  );
};

export default connect()(InboxsContant);
