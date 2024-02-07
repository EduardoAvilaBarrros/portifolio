import React from "react";
import './ChatIntro.css'

import SpeakerNotesOffIcon from '@mui/icons-material/SpeakerNotesOff';

export default () => {
    return (
        <div className="chatIntro">
            <SpeakerNotesOffIcon className="icon"></SpeakerNotesOffIcon>
            <h1>Nenhum chat ativo</h1>
            <h2> Seu chat ativo aparecera aqui</h2>
        </div>
    )
}