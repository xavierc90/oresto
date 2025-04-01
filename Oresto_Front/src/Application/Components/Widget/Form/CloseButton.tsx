import React from 'react';
import { RxCross1 } from "react-icons/rx";

type CloseButtonProps = {
  onClick: () => void;
};

const CloseButton: React.FC<CloseButtonProps> = ({ onClick }) => {
  return (
    <button onClick={onClick}>
      <RxCross1 size={20} />
    </button>
  );
};

export default CloseButton;
