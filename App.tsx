import React from 'react';
import { MenuProvider } from 'react-native-popup-menu';
import ChatScreen from './src/ChatScreen'; 

const App: React.FC = () => {
  return (
    <MenuProvider>  
      <ChatScreen />
    </MenuProvider>
  );
};

export default App;
