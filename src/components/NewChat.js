import React, {useState, useEffect} from "react";
import './NewChat.css';

import Api from "../Api";

import { doc } from 'firebase/firestore';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default ({user, chatlist, show, setShow, db, user2}) => {
    const [list, setList] = useState([]);

    useEffect(() => {
        const getList = async () => {
            if (user !== null) {
                try {
                    let result = await Api.getContactList(user.id);
                    console.log('user:', user);
                    console.log('API Result:', result);
                    setList(result);
                } catch (error) {
                    console.error('Error getting contact list:', error);
                }  
            }
        };
        getList();
    }, [user]);

    const handleAddNewChat = async (user, user2) => {
        try {
            // Verifica se user e user2 são objetos válidos com a propriedade 'id'
            if (user && user.id && user2 && user2.id) {
                // Verifica se já existe uma conversa entre os usuários
                const existingChat = await Api.getChatByUsers(user, user2);
    
                if (existingChat) {
                    // Se a conversa existir, redirecione o usuário para a conversa existente
                    console.log('Conversa existente:', existingChat);
                    // Implemente a lógica de redirecionamento para a conversa existente
                } else {
                    // Se não existir, crie uma nova conversa
                    await Api.addNewChat(user, user2);
                    handleClose();
                }
            } else {
                console.error('Usuário ou user2 é indefinido ou não tem a propriedade "id"');
            }
        } catch (error) {
            console.error('Erro ao adicionar nova conversa:', error);
        }
    };
    

    const handleClose = () => {
        setShow(false);
    };

    return (
        <div className="newChat" style={{ left: show ? 0 : -415 }}>
            <div className="newChat--header">
                <div onClick={handleClose} className="newChat--backbutton">
                    <ArrowBackIcon style={{ color: '#FFFFFF' }} />
                </div>
                <div className="newChat--headtitle">
                    Nova Conversa
                </div>
            </div>

            <div className="newChat--list">
                {list.map((item, key) => (
                    <div onClick={()=> handleAddNewChat(user, item)} className="newChat--Item" key={key}>
                        <img className="newChat--itemavatar" src={item.avatar} alt="" />
                        <div className="newChat--itemname">{item.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};