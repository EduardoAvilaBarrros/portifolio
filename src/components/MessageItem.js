import React, { useState, useEffect } from "react";
import './MessageItem.css';

export default ({data, user}) => {

    const [time, setTime] = useState('');

    useEffect(() => {
        if (data.date && data.date.seconds > 0) {
            const d = new Date(data.date.seconds * 1000);
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            setTime(`${hours}:${minutes}`);
        }
    }, [data]);

    return (
        <div 
            className="messageLine"
            style={{
                justifyContent: user.id === data.author ? 'flex-end' : 'flex-start'
            }}
        >
            <div 
                className="messageItem"
                style={{
                    backgroundColor: user.id === data.author ? '#DCF8C6' : '#FFF'
                }}
            >
                <div className="messageText">{data.body}</div>
                <div className="messageDate">{time}</div>
            </div>
        </div>
    )
}