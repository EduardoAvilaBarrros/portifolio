import React, { useState, useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import './ChatWindow.css'
import MessageItem from "./MessageItem";
import SearchIcon from '@mui/icons-material/Search';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';

import Api from "../Api";

export default ({ user, data }) => {
    const body = useRef();
    const [emojiOpen, setEmojiOpen] = useState(false);
    const [text, setText] = useState('');
    const [list, setList] = useState([]);
    const [users, setUsers] = useState([]);
    const [listening, setListening] = useState(false);

    useEffect(() => {
        setList([]);
        let unsub = Api.onChatContent(data.chatId, setList, setUsers);
        return unsub;
    }, [data.chatId])

    useEffect(() => {
        if (body.current.scrollHeight > body.current.offsetHeight) {
            body.current.scrollTop = body.current.scrollHeight - body.current.offsetHeight;
        }
    }, [list]);

    const handleEmojiClick = (emojiObject, e) => {
        const emoji = emojiObject?.emoji || (e && e.currentTarget && e.currentTarget.innerText);
        if (emoji) {
            setText(text + emoji);
            console.log('Emoji:', emoji);
        }
    }

    const handleOpenEmoji = () => {
        setEmojiOpen(true);
    }

    const handleCloseEmoji = () => {
        setEmojiOpen(false);
    }

    const handleMicClick = () => {
        if (window.SpeechRecognition) {
            if (listening) {
                stopListening();
            } else {
                startListening();
            }
        } else {
            console.error("O navegador não suporta a API de Reconhecimento de Fala.");
        }
    }

    const handleInputKeyUp = (e) => {
        if (e.keyCode === 13) {
            handleSendClick();
        }
    }

    const handleSendClick = () => {
        if (text !== '') {
            Api.sendMessage(data, user.id, 'text', text, users);
            setText('');
            setEmojiOpen(false);
        }
    }

    // Função para iniciar o reconhecimento de fala
    const startListening = () => {
        const recognition = new window.SpeechRecognition();
        recognition.onstart = () => {
            setListening(true);
        };
        recognition.onend = () => {
            setListening(false);
        };
        recognition.onresult = (e) => {
            setText(e.results[0][0].transcript);
        };

        recognition.start();
    };

    // Função para parar o reconhecimento de fala
    const stopListening = () => {
        setListening(false);
    };



    return (
        <div className="chatWindow">
            <div className="chatWindow--header">
                <div className="chatWindow--headerinfo">
                    <img className="chatWindow--avatar" src={data.image} alt=""></img>
                    <div className="chatWindow--name">{data.title}</div>
                </div>

                <div className="chatWindow--headerbuttons">
                    <div className="chatWindow--btn">
                        <SearchIcon style={{color: '#919191'}}/>
                    </div>
                    <div className="chatWindow--btn">
                        <AttachFileIcon style={{color: '#919191'}}></AttachFileIcon>
                    </div>
                    <div className="chatWindow--btn">
                        <MoreVertIcon style={{color: '#919191'}}></MoreVertIcon>
                    </div>
                </div>
            </div>


            <div ref={body} className="chatWindow--body">
                {list.map((item, key)=>(
                    <MessageItem
                        key={key}
                        data={item}
                        user={user}
                    />
                ))}
            </div>

            <div className="chatWindow--emojiarea" 
            style={{height: emojiOpen ? '200px' : '0px'}}>
                <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    searchDisabled 
                    skinTonesDisabled
                />
            </div>

            <div className="chatWindow--footer">
                
                <div className="chatWindow--pre">
                    <div className="chatWindow--btn"
                         onClick={handleCloseEmoji}
                         style={{width: emojiOpen?40:0}}
                    >
                        <CloseIcon style={{color: '#919191'}}/>
                    </div>

                    <div className="chatWindow--btn"
                         onClick={handleOpenEmoji}
                    >
                        <EmojiEmotionsIcon style={{color: emojiOpen?'#009688':'#919191'}}/>
                    </div>    
                        
                </div>

                <div className="chatWindow--inputarea">
                    <input 
                        className="chatWindow--input" 
                        type="text"
                        placeholder="Digite uma mensagem"
                        value={text}
                        onChange={e=>setText(e.target.value)}
                        onKeyUp={handleInputKeyUp}
                    />
                </div>

                <div className="chatWindow--pos">

                    {text === '' &&
                        <div onClick={handleMicClick} className="chatWindow--btn">
                            <MicIcon style={{color: listening ? '#126ECE' : '#919191'}}/>
                        </div>
                    }

                    {text !== '' &&
                        <div onClick={handleSendClick} className="chatWindow--btn">
                            <SendIcon style={{color: '#919191'}}/>
                        </div>
                    }
                        
                </div>

            </div>
        </div>
    );
}