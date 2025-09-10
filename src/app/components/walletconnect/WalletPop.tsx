import Image from "next/image";
import React from "react";
import { IoClose } from "react-icons/io5";
type WalletPopProps = {
  setPopup: React.Dispatch<React.SetStateAction<boolean>>;
};
function WalletPop({ setPopup }: WalletPopProps) {
  return (
    <div className="swap_popup">
      <div className="swap_popup_content">
        <div className="popup_close" onClick={() => setPopup(false)}>
          <IoClose />
        </div>
        <div className="wallet_popup">
          <p className="wallet_popup_title">Connect Your Wallet</p>
          <div className="wallet_options">
            <button className="wallet_option_btn matamask">
              <Image
                src="/images/metamask.png"
                alt="Metamask"
                width={26}
                height={24}
                className="wallet_option_img"
              />
              Metamask
            </button>

            <button className="wallet_option_btn rabby">
              <Image
                src="/images/rabby.png"
                alt="Rabby Wallet"
                width={24}
                height={24}
                className="wallet_option_img"
              />
              Rabby Wallet
            </button>
            <button className="wallet_option_btn wallet">
              <Image
                src="/images/wallet.png"
                alt="WalletConnect"
                width={24}
                height={24}
                className="wallet_option_img"
              />
              WalletConnect
            </button>
          </div>
          <div className="wallet_help_links">
            <p className="wallet_help_link">What is a Web3 Wallet?</p>
            <p className="wallet_help_link">Having trouble connecting?</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletPop;
