import React, { useEffect, useState } from 'react'
import downArrow from "../../../assets/images/downArrow.svg";

const SelectDropDown: React.FC<any> = ({
  onClickSelect, options, selectedValue
}) => {
  const [dropDown, setDropdown] = useState(false)

  return (
    // <div>
    //   <select
    //     className="lg:ml-5 my-3 w-44 bg-white border border-2 border-primary
    //                ease-in-out focus:bg-white focus:outline-none font-semibold form-control m-0 px-3 py-4 rounded-full text-[14px] text-primary transition w-full"
    //     onChange={(e: any) => onClickSelect(e)}
    //   >
    //       {options &&
    //         options.map((item: any) => (
    //           <option value={item.id} className='bg-black'>{item.name}</option>
    //         ))}
    //       <option value={""}>Create New Profile</option>
    //   </select>
    // </div>

    <div className="flex">
      <div
        className="relative flex"
        onClick={() => setDropdown(!dropDown)}
      >
        <div className='flex border bg-white border-primary rounded-[40px] p-4'>
          <div className="text-primary font-[Montserrat] cursor-pointer text-sm font-semibold">
            {selectedValue}
          </div>

          <button className="text-primary ml-12">
            <img src={downArrow} />
          </button>
        </div>

        <div
          className={`absolute w-full sm:right-0 top-14 mt-2 bg-white shadow-x border border-primary rounded-[19px] border-b-0 text-md text-primary font-semibold font-[Montserrat] ${dropDown ? "block" : "hidden"}`}
        >
          {options && options.map((option: any) => {
            return (
              <>
                <div
                  className="text-center py-2 text-sm cursor-pointer border-b border-b-primary first:rounded-[19px] first:rounded-b-none rounded-b-none hover:bg-[#37085B33]"
                  onClick={() => onClickSelect(option, option.name)}
                  key={option.id}
                >
                  {option.name}
                </div>
              </>
            )
          })}

          <div
            className="text-center py-2 text-sm cursor-pointer border-b border-b-primary rounded-[19px] rounded-t-none hover:bg-[#37085B33] font-[Montserrat]"
            onClick={() => onClickSelect("", "create new")}
          >
            Create New Profile
          </div>

        </div>
      </div>
    </div>
  )
}

export default SelectDropDown;
