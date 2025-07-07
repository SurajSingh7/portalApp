import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { User, Trash2, Edit3, ChevronDown, ChevronUp, Info, HelpCircle } from "lucide-react-native";
import { API_BASE_URL } from "../../../../config/api";
import { getToken, clearToken } from "../../../../utils/storage";
import { useRouter } from "expo-router";

const AccordionItem = ({ title, children, icon: Icon, isOpen, onToggle }) => {
  return (
    <View className="border border-gray-200 rounded-lg overflow-hidden">
      <TouchableOpacity
        onPress={onToggle}
        className="flex flex-row items-center justify-between bg-gray-50 px-4 py-3"
      >
        <View className="flex flex-row items-center space-x-2">
          <Icon size={20} color="#2563eb" />
          <Text className="text-lg font-semibold text-gray-800">{title}</Text>
        </View>
        {isOpen ? (
          <ChevronUp size={20} color="#6b7280" />
        ) : (
          <ChevronDown size={20} color="#6b7280" />
        )}
      </TouchableOpacity>
      {isOpen && (
        <View className="bg-white px-4 py-3">{children}</View>
      )}
    </View>
  );
};

const UserNameAlias = () => {
  const [alias, setAlias] = useState("");
  const [currentAlias, setCurrentAlias] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [whyAccordionOpen, setWhyAccordionOpen] = useState(false);
  const [howAccordionOpen, setHowAccordionOpen] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const router = useRouter();

  const fetchCurrentAlias = async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.replace("/");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/hrms/username-alias`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "reactnative",
        },
      });

      if (res.status === 401) {
        await clearToken();
        router.replace("/");
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setCurrentAlias(data.data.usernameAlias || "");
      } else {
        console.error("Fetch failed:", data.message);
      }
    } catch (err) {
      console.error("Error fetching alias:", err);
    }
  };

  const handleAliasChange = (value) => {
    const trimmed = value.slice(0, 30);
    setAlias(trimmed);
    setCharacterCount(trimmed.length);
  };

  const handleSubmit = async () => {
    if (!alias.trim()) return;

    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/hrms/username-alias`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "reactnative",
        },
        body: JSON.stringify({ usernameAlias: alias }),
      });

      const data = await res.json();
      if (res.ok) {
        setCurrentAlias(alias);
        setAlias("");
        setCharacterCount(0);
      } else {
        console.error("Failed to update alias:", data.message);
      }
    } catch (err) {
      console.error("Error updating alias:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/hrms/username-alias`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "reactnative",
        },
      });

      if (res.ok) {
        setCurrentAlias("");
      } else {
        const data = await res.json();
        console.error("Failed to delete alias:", data.message);
      }
    } catch (err) {
      console.error("Error deleting alias:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentAlias();
  }, []);

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4 py-6">
      {/* Header */}
      <View className="items-center mb-6">
        <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-3">
          <User size={32} color="#2563eb" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 mb-1">Username Alias</Text>
        <Text className="text-gray-600">Create an easy-to-remember alias for your account</Text>
      </View>

      {/* Current Alias */}
      {currentAlias ? (
        <View className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center space-x-3">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
                <User size={20} color="#16a34a" />
              </View>
              <View>
                <Text className="text-sm font-medium text-gray-500 uppercase">Current Alias</Text>
                <Text className="text-lg font-bold text-gray-900">{currentAlias}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleDelete}
              disabled={isLoading}
              className="flex-row items-center bg-red-500 px-4 py-2 rounded-lg"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Trash2 size={16} color="#fff" />
                  <Text className="ml-2 text-white font-medium">Delete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* Alias Form */}
      <View className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <View className="flex-row items-center space-x-2 mb-4">
          <Edit3 size={20} color="#2563eb" />
          <Text className="text-xl font-bold text-gray-900">
            {currentAlias ? "Update Username Alias" : "Create Username Alias"}
          </Text>
        </View>

        <TextInput
          value={alias}
          onChangeText={handleAliasChange}
          placeholder="Enter your alias"
          maxLength={30}
          editable={!isLoading}
          className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
        />
        <Text className="text-right text-gray-500 text-xs mb-2">{characterCount}/30</Text>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isLoading || !alias.trim()}
          className="flex-row justify-center items-center bg-blue-600 px-4 py-3 rounded-lg"
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Edit3 size={16} color="#fff" />
              <Text className="ml-2 text-white font-semibold">
                {currentAlias ? "Update Alias" : "Create Alias"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Accordions */}
      <AccordionItem
        title="Why set a username alias?"
        icon={Info}
        isOpen={whyAccordionOpen}
        onToggle={() => setWhyAccordionOpen(!whyAccordionOpen)}
      >
        <Text className="text-gray-700">You can use your alias to log in instead of your username.</Text>
      </AccordionItem>

      <AccordionItem
        title="How to use your username alias?"
        icon={HelpCircle}
        isOpen={howAccordionOpen}
        onToggle={() => setHowAccordionOpen(!howAccordionOpen)}
      >
        <Text className="text-gray-700">At login, enter your alias instead of your username.</Text>
      </AccordionItem>
    </ScrollView>
  );
};

export default UserNameAlias;
