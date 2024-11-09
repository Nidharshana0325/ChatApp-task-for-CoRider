import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

interface Message {
  id: string;
  message: string;
  sender: {
    image: string;
    is_kyc_verified: boolean;
    self: boolean;
    user_id: string;
  };
  time: string;
}

interface TripDetails {
  name: string;
  from: string;
  to: string;
  status: string;
  tripNumber: string;
}

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAttachOptions, setShowAttachOptions] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await axios.get(`https://qa.corider.in/assignment/chat?page=${page}`);
      const { chats, name, from, to, status, tripNumber } = response.data;
      if (!tripDetails) {
        setTripDetails({ name, from, to, status, tripNumber });
      }
      setMessages((prevMessages) => [...chats, ...prevMessages]);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      Alert.alert("Error", "Failed to load messages. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.sender.self ? styles.myMessage : styles.otherMessage]}>
      {!item.sender.self && <Image source={{ uri: item.sender.image }} style={styles.profileImage} />}
      <View style={[styles.messageContent, item.sender.self && styles.myMessageContent]}>
        <Text style={[styles.messageText, item.sender.self ? styles.myMessageText : styles.otherMessageText]}>
          {item.message}
        </Text>
        <Text style={[styles.messageTime, item.sender.self ? styles.myMessageTime : styles.otherMessageTime]}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  const getFormattedDate = () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString('default', { month: 'short' });
    const year = today.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tripDetails?.name || "Loading..."}</Text>
        <Text style={styles.tripNumber}>{tripDetails?.tripNumber}</Text>
        <TouchableOpacity>
          <Icon name="edit-calendar" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {tripDetails && (
        <View style={styles.tripInfo}>
          <Image source={{ uri: 'https://placekitten.com/40/40' }} style={styles.carImage} />
          <View style={styles.tripDetails}>
            <Text style={styles.tripText}>From <Text style={styles.boldText}>{tripDetails.from}</Text></Text>
            <Text style={styles.tripText}>To <Text style={styles.boldText}>{tripDetails.to}</Text></Text>
            <Text style={styles.tripText}>Status: <Text style={styles.boldText}>{tripDetails.status}</Text></Text>
          </View>
          <Menu>
            <MenuTrigger style={styles.menuTrigger}>
              <Icon name="more-vert" size={24} color="#000" />
            </MenuTrigger>
            <MenuOptions customStyles={{ optionsContainer: styles.menuOptions }}>
              <MenuOption onSelect={() => Alert.alert("Members", "Members option selected")} style={styles.menuOption}>
                <Icon name="group" size={20} color="#000" />
                <Text style={styles.menuOptionText}>Members</Text>
              </MenuOption>
              <View style={styles.separator} />
              <MenuOption onSelect={() => Alert.alert("Share Number", "Share Number option selected")} style={styles.menuOption}>
                <Icon name="call" size={20} color="#000" />
                <Text style={styles.menuOptionText}>Share Number</Text>
              </MenuOption>
              <View style={styles.separator} />
              <MenuOption onSelect={() => Alert.alert("Report", "Report option selected")} style={styles.menuOption}>
                <Icon name="report" size={20} color="#000" />
                <Text style={styles.menuOptionText}>Report</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>
      )}

      {/* Date with lines */}
      <View style={styles.dateSeparator}>
        <View style={styles.line}></View>
        <Text style={styles.dateText}>{getFormattedDate()}</Text>
        <View style={styles.line}></View>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted
        onEndReached={fetchMessages}
        onEndReachedThreshold={0.1}
        contentContainerStyle={styles.messageList}
      />

      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Reply to @Rohit Yadav" />
        <TouchableOpacity style={styles.iconButton} onPress={() => setShowAttachOptions(!showAttachOptions)}>
          <Icon name="attach-file" size={24} color="#00A86B" />
        </TouchableOpacity>
        {showAttachOptions && (
          <View style={styles.attachOptionsContainer}>
            <View style={styles.attachOptions}>
              <TouchableOpacity onPress={() => Alert.alert("Camera", "Camera option selected")} style={styles.attachOptionButton}>
                <Icon name="camera-alt" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert("Video", "Video option selected")} style={styles.attachOptionButton}>
                <Icon name="videocam" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert("Download File", "File download selected")} style={styles.attachOptionButton}>
                <Icon name="file-download" size={20} color="#fff" /> 
              </TouchableOpacity>
            </View>
            <View style={styles.arrow} />
          </View>
        )}
        <TouchableOpacity style={styles.iconButton} onPress={() => Alert.alert("Send Message", "Message sent")}>
          <Icon name="send" size={24} color="#00A86B" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'left',
    marginLeft: 10,
  },
  tripNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  tripInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 1,
  },
  carImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  tripDetails: {
    flex: 1,
  },
  tripText: {
    fontSize: 14,
  },
  boldText: {
    fontWeight: 'bold',
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dateText: {
    color: '#888',
    fontSize: 12,
    marginHorizontal: 10,
  },
  messageList: {
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginBottom: 16,
    padding: 10,
    borderRadius: 8,
    maxWidth: '80%',
    flexDirection: 'row',
    position: 'relative',
    marginLeft: 45,
  },
  myMessage: {
    backgroundColor: '#007bff',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#f1f1f1',
    alignSelf: 'flex-start',
  },
  messageContent: {
    flex: 1,
    paddingLeft: 10,
  },
  myMessageContent: {
    paddingLeft: 0,
  },
  myMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: 'black',
  },
  messageText: {
    flexWrap: 'wrap',
    fontSize: 14,
    maxWidth: '100%',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  myMessageTime: {
    color: '#f1f1f1',
  },
  otherMessageTime: {
    color: '#333333',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: 'absolute',
    top: 0,
    left: -45,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
  },
  iconButton: {
    padding: 8,
  },
  attachOptionsContainer: {
    position: 'absolute',
    bottom: 60,
    left: 253,
    alignItems: 'center',
  },
  attachOptions: {
    flexDirection: 'row',
    backgroundColor: '#00A86B',
    padding: 8,
    borderRadius: 50,
  },
  attachOptionButton: {
    padding: 8,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#00A86B',
    marginTop: -1,
  },
  menuOptions: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 9,
    width: 160,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuOptionText: {
    marginLeft: 20,
    fontSize: 12,
    color: '#000',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  menuTrigger: {
    marginLeft: -45,
  },
});

export default ChatScreen;
