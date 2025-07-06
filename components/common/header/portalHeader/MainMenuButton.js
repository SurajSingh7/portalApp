import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import MainMenuModal from "./MainMenuModal";

const MainMenuButton = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible((prev) => !prev); // Toggle on/off
  };

  return (
    <>
      {/* 9-Dot Icon */}
      <TouchableOpacity
        onPress={toggleModal} // Toggle modal on press
        style={{ marginRight: -160 }}
      >
        <Feather name="grid" size={18} color="#fff" />
      </TouchableOpacity>

      {/* Modal */}
      <MainMenuModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)} // Close modal
      />
    </>
  );
};

export default MainMenuButton;
