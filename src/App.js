import React, {useState, useEffect} from "react";
import './App.css'

import Api from "./Api";

import ChatListItem from "./components/ChatListItem";
import ChatIntro from "./components/ChatIntro";
import ChatWindow from "./components/ChatWindow";
import NewChat from "./components/NewChat";
import Login from "./components/Login";

import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import ChatIcon from '@mui/icons-material/Chat';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import MenuIcon from '@mui/icons-material/Menu';
import { colors } from "@mui/material";



export default () => {

  const [chatlist, setChatList] = useState([]);
  const [activeChat, setActiveChat] = useState({});
  const [user, setUser] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(()=>{
    if (user !== null) {
      let unsub = Api.onChatList(user.id, setChatList);
      return unsub;
    }
  }, [user])

  const handleNewChat = () =>{
    setShowNewChat(true);
  }

  const handleLoginData = async (u) => {
    if (u) {
      console.log('All user data:', u);
  
      let newUser = {
        id: u.uid,
        name: u.displayName || u.name,
        avatar: u.photoURL || 'https://cdn1.iconfinder.com/data/icons/avatars-1-5/136/60-512.png'
      };
  
      console.log('User data received:', newUser);
      await Api.addUser(newUser);
      setUser(newUser);
    } else {
      console.error("Usuário não definido ao processar dados de login", u);
    }
  };
  

  if (user === null) {
    return (<Login onReceive={handleLoginData} />);
  }

  let btnMenu = document.getElementById('btn-menu');
  let menu = document.getElementById('sidebar-mobile');

  const handleMenuClick = () => {
    // Lógica para abrir o menu
    // Exemplo: menu.classList.add('abrir-menu');
    menu.classList.add('abrir-menu');
  }
  const handleCloseMenuClick = () => {
    menu.classList.remove('abrir-menu');
  }
  
  return (
    <div className="app-window">
      <div className="sidebar">

        <NewChat
          chatlist={chatlist}
          user={user}
          show={showNewChat}
          setShow={setShowNewChat}
        />

        <header className="header">
            {user.avatar && <img className="header--avatar" src={user.avatar} alt=""></img>}
            <div className="header--buttons">
                <div className="header--btn">
                  <DonutLargeIcon style={{color: '#919191'}}></DonutLargeIcon>
                </div>
                <div onClick={handleNewChat} className="header--btn">
                  <ChatIcon style={{color: '#919191'}}></ChatIcon>
                </div>
                <div className="header--btn">
                  <MoreVertIcon style={{color: '#919191'}}></MoreVertIcon>
                </div>
            </div>        
        </header>

        <div className="search">
          <div className="search--input">
              <SearchIcon fontSize="small" style={{color: '#919191'}}></SearchIcon>
              <input type="search" placeholder="Procurar ou começar uma nova conversa"></input>
          </div>
        </div>

        <div className="chatlist">
            {chatlist.map((item, key) =>(
              <ChatListItem
                key={key}
                data={item}
                active={activeChat.chatId === chatlist[key].chatId}
                onClick={() => setActiveChat(chatlist[key])}
              ></ChatListItem>
            ))}
        </div>
      </div>

      <div className="btn-abrir-menu" id="btn-menu" onClick={handleMenuClick}>
        <MenuIcon/>
      </div>

      <div className="sidebar-mobile" id="sidebar-mobile" onClick={handleCloseMenuClick}>
        <div >
        <NewChat
          chatlist={chatlist}
          user={user}
          show={showNewChat}
          setShow={setShowNewChat}
        />

        <header className="header--mobile">
            {user.avatar && <img className="header--avatar" src={user.avatar} alt=""></img>}
            <div className="header--buttons">
                <div className="btn-fechar">
                  <ClearIcon style={{color: '#919191'}}/>
                </div>
                <div className="header--btn">
                  <DonutLargeIcon style={{color: '#919191'}}></DonutLargeIcon>
                </div>
                <div onClick={handleNewChat} className="header--btn">
                  <ChatIcon style={{color: '#919191'}}></ChatIcon>
                </div>
                <div className="header--btn">
                  <MoreVertIcon style={{color: '#919191'}}></MoreVertIcon>
                </div>
                
            </div>        
        </header>

        <div className="search">
          <div className="search--input">
              <SearchIcon fontSize="small" style={{color: '#919191'}}></SearchIcon>
              <input type="search" placeholder="Procurar ou começar uma nova conversa"></input>
          </div>
        </div>

        <div className="chatlist">
            {chatlist.map((item, key) =>(
              <ChatListItem
                key={key}
                data={item}
                active={activeChat.chatId === chatlist[key].chatId}
                onClick={() => setActiveChat(chatlist[key])}
              ></ChatListItem>
            ))}
        </div>
      </div>
      </div> {/*sidebar mobile*/}

      <div className="overlay-menu" onClick={handleCloseMenuClick}></div>

      <div className="contentarea">
          {activeChat.chatId !== undefined &&
                <ChatWindow 
                  user={user}
                  data={activeChat}
                />
          }
          {activeChat.chatId === undefined &&
                <ChatIntro />
          }
      </div>
    </div>
  )
}