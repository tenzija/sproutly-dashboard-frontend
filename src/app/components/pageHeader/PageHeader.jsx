import React from "react";
import "./PageHeader.css";
import { FaWallet } from "react-icons/fa";
import { TbWorld } from "react-icons/tb";
import { IoMdNotificationsOutline, IoMdSearch } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";

function PageHeader({
  title,
  showSearch = true,
  showButton = true,
  buttonText = "Connect wallet",
  buttonIcon = <FaWallet />,
}) {
  return (
    <div className="pageheader glass_card">
      <div className="elementName">
        <p>{title}</p>
      </div>

      {showSearch && (
        <div className="pageheader_searchicon">
          <input
            type="text"
            className="pageheader_input"
            placeholder="Search Box"
          />
          <IoMdSearch className="pageheader_icon" />
        </div>
      )}

      <div className="right_element">
        {showButton && (
          <button>
            {buttonIcon}
            {buttonText}
          </button>
        )}
        <div className="svgimg">
          <TbWorld />
        </div>
        <div className="svgimg">
          <IoMdNotificationsOutline />
        </div>
        <div className="svgimg">
          <IoSettingsOutline />
        </div>
      </div>
    </div>
  );
}

export default PageHeader;
