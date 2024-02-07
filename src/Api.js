import { initializeApp } from 'firebase/app';
import { getAuth, FacebookAuthProvider, signInWithPopup, GoogleAuthProvider, user } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
  getDocs,
  onSnapshot,
  setDoc,
  getDoc,
  query,
  where
} from 'firebase/firestore';
import firebaseConfig from './firebaseConfig';

// Inicialize o app Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Obtenha a instância de autenticação

// Obtenha a instância do Firestore
const db = getFirestore(firebaseApp);

export const auth = getAuth(firebaseApp);
export const provider = new GoogleAuthProvider();

export default {
  fbPopup: async () => {
    const facebookProvider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      return result;
    } catch (error) {
      console.error('Erro ao autenticar com o Facebook:', error);
      return null;
    }
  },
  addUser: async (user) => {
    const userRef = doc(db, 'users', user.id);
    console.log('Adding user to Firestore:', user);
  
    // Verificar se o usuário já existe no Firestore
    const userDoc = await getDoc(userRef);
    console.log('Chegou nessa parte');
    if (userDoc.exists()) {
      // Se o usuário já existe, você pode optar por atualizar informações ou não fazer nada
      console.log('Usuário já existe no Firestore:', userDoc.data());
    } else {
      // Se o usuário não existe, crie um novo documento no Firestore
      await setDoc(userRef, {
        name: user.displayName || user.name,  // Use displayName se disponível (Google)
        avatar: user.photoURL || user.avatar,  // Use photoURL se disponível (Google)
        // Adicione outros campos que você deseja armazenar
      });
  
      console.log('Novo usuário criado no Firestore');
    }
  },

  getContactList: async (userId) => {
    try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const list = querySnapshot.docs
            .filter((doc) => doc.id !== userId)
            .map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        console.log('Contact List:', list);
        return list;
    } catch (error) {
        console.error('Error getting contact list:', error);
        return [];
    }
  },

  addNewChat: async (user, user2) => {
    try {
      const newChatRef = await addDoc(collection(db, 'chats'), {
        messages: [],
        users: [user.id, user2.id],
      });
      console.log('user:', user);
      console.log('user2:', user2);

      const userRef1 = doc(db, 'users', user?.id ?? '');
      const userRef2 = doc(db, 'users', user2?.id ?? '');

      await updateDoc(userRef1, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          title: user2.name,
          image: user2.avatar,
          with: user2.id,
        }),
      });

      await updateDoc(userRef2, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          title: user.name,
          image: user.avatar,
          with: user.id,
        }),
      });
    } catch (error) {
      console.error('Erro ao adicionar nova conversa:', error);
      console.error('Erro ao adicionar nova conversa:', error, 'user:', user, 'user2:', user2);
    }
  },

  getChatByUsers: async (user, user2) => {
    try {
        console.log('Iniciando getChatByUsers');

        // Crie referências aos documentos dos usuários
        const userRef1 = doc(db, 'users', user.id);
        const userRef2 = doc(db, 'users', user2.id);

        console.log('Referências dos usuários criadas:', userRef1.id, userRef2.id);

        // Consulta para encontrar uma conversa que contenha ambos os usuários
        const chatQuery = query(
            collection(db, 'chats'),
            where('users', 'array-contains', [userRef1, userRef2])
        );

        const chatSnapshot = await getDocs(chatQuery);

        console.log('Número de conversas encontradas:', chatSnapshot.size);

        if (chatSnapshot.docs.length > 0) {
            // Retorna os dados da primeira conversa encontrada
            const chatDoc = chatSnapshot.docs[0];
            console.log('Conversa encontrada:', chatDoc.id, chatDoc.data());
            return {
                id: chatDoc.id,
                ...chatDoc.data()
            };
        } else {
            console.log('Nenhuma conversa encontrada');
            // Retorna nulo se nenhuma conversa for encontrada
            return null;
        }
    } catch (error) {
        console.error('Erro ao obter conversa por usuários:', error);
        throw error;
    }
},


  onChatList: (userId, setChatList) => {
    const userDocRef = doc(db, 'users', userId);

    return onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.chats) {
          let chats = [...data.chats];

          chats.sort((a, b)=> {
            if (a.lastMessageDate === undefined) {
              return -1;
            }
            if (a.lastMessageDate.seconds < b.lastMessageDate.seconds) {
              return 1;
            } else {
              return -1;
            }
          });

          setChatList(data.chats);
        }
      }
    });
  },

  onChatContent: (chatId, setList, setUsers) => {
    const chatDocRef = doc(db, 'chats', chatId);
  
    return onSnapshot(chatDocRef, 
      (doc) => {
        if (doc.exists) {
          const data = doc.data();
          setList(data.messages);
          setUsers(data.users);

          console.log('Data Users:', data.messages);
          console.log('Data Users:', data.users);
          console.log('Conteúdo do chat obtido com sucesso');
        }
      },
      (error) => {
        console.error('Erro ao obter conteúdo do chat:', error);
        // Aqui você pode adicionar lógica adicional para lidar com o erro, se necessário
      }
    );
  },

  sendMessage: async (chatData, userId, type, body, users) => {
    try {
      let now = new Date();
  
      // Atualizar a coleção 'chats' com a nova mensagem
      await updateDoc(doc(db, 'chats', chatData.chatId), {
        messages: arrayUnion({
          type,
          author: userId,
          body,
          date: now,
        }),
      });
  
      // Atualizar a última mensagem nos chats dos usuários envolvidos
      for (let i in users) {
        let uDocRef = doc(db, 'users', users[i]);
        let uDoc = await getDoc(uDocRef);
  
        if (uDoc.exists()) {
          let uData = uDoc.data();
          if (uData.chats) {
            let chats = [...uData.chats];
  
            for (let e in chats) {
              if (chats[e].chatId === chatData.chatId) {
                chats[e].lastMessage = body;
                chats[e].lastMessageDate = now;
              }
            }
  
            // Atualizar a coleção 'users' com os novos dados do chat
            await updateDoc(uDocRef, { chats });
          }
        }
      }
  
      console.log('Mensagem enviada com sucesso');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  },
  
};