import React from 'react';
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

type ArrowButtonProps = {
  isContentVisible: boolean;
  onClick: () => void;
};

const ArrowButton: React.FC<ArrowButtonProps> = ({ isContentVisible, onClick }) => {
  return (
    <button onClick={onClick}>
      {isContentVisible ? <IoIosArrowDown size={20} /> : <IoIosArrowUp size={20} />}
    </button>
  );
};

export default ArrowButton;
