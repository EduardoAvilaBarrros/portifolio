import React from "react";
import './login.css';

import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from "../Api";

import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';

export default ({ onReceive }) => {
  const handleFacebookLogin = async () => {
    try {
      let result = await auth.fbPopup();
      if (result) {
        onReceive(result.user);
      } else {
        alert("Erro!");
      }
    } catch (error) {
      console.error("Erro ao realizar login com o Facebook:", error);
      alert("Erro ao realizar login com o Facebook. Por favor, tente novamente.");
    }
  };

  function handleGoogleLogin() {
    console.log("Antes da chamada signInWithPopup");

    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("Depois da chamada signInWithPopup");
        const user = result.user;

        console.log("Login bem-sucedido:", user);
        // Chame handleLoginData para processar os dados do usuário
        onReceive(result.user).then(() => {
          console.log('Login bem-sucedido:', result.user);
        }).catch((error) => {
          console.error('Erro ao processar dados de login:', error);
        });
      })
      .catch((error) => {
        console.error("Erro ao fazer login com o Google:", error);
      });
  }

  return (
    <div className="login">
      <button onClick={handleFacebookLogin}> <FacebookIcon className="facebook"></FacebookIcon>Logar com o Facebook</button>
      <button className="googlebutton" onClick={handleGoogleLogin}> <GoogleIcon className="google"></GoogleIcon>Logar com o Google</button>
    </div>
  );
}
