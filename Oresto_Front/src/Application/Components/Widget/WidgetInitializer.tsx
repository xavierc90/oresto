import React, { useState } from "react";
import { Widget } from "./Widget";

type WidgetInitializerProps = {
  onClose: () => void;
  restaurantId: string;
};

export const WidgetInitializer: React.FC<WidgetInitializerProps> = ({
  onClose,
  restaurantId,
}) => {
  const [showWidget, setShowWidget] = useState(true);
  const [isContentVisible, setIsContentVisible] = useState(true);

  const handleClose = () => {
    setShowWidget(false);
    onClose();
  };

  if (!showWidget) {
    return null;
  }

  return (
    <Widget
      setShowWidget={handleClose}
      isContentVisible={isContentVisible}
      setIsContentVisible={setIsContentVisible}
      restaurantId={restaurantId}
    />
  );
};
