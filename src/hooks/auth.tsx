 import React,  { createContext, ReactNode, useContext, useState, useEffect } from "react";//funcao para conseguir criar o contexto

 const { CLIENT_ID } = process.env;//buscando de um arquivo de embiente
 const { REDIRECT_URI } = process.env;
 

 import * as AuthSession from 'expo-auth-session';
 import * as AppleAuthentication from 'expo-apple-authentication';

import { User } from "../screens/Dashboard/styles";
import AsyncStorage from "@react-native-async-storage/async-storage";


 interface AuthProviderProps {
   children: ReactNode;//e a tipagem para um elemento filho,e tem que ser importado do react
 }
interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

 interface AuthContextData { //tipagem do esta sendo exportado
  user: User;//tipagem valor 
  signInWithGoogle(): Promise<void>;
  signInWithApple(): Promise<void>;
 }

 interface AuthorizationResponse {
   params: {
     access_token: string;
   };
   type: string;
 }

  const AuthContext = createContext({} as AuthContextData);//valor inicial do contexto 

  function AuthProvider({ children }: AuthProviderProps ) {//os filhos do AuthProvider poderao acessa-lo
    const [user, setUser] = useState<User>({} as User);//o estado vai armazernar esse tipo user
    const [userStorageLoading, setUserStorageLoading] = useState(true);

    const userStorageKey = '@gofinances:user';

    async function signInWithGoogle() {      
      try { //variaveis de config,precisam ser fornecidas para a url de autentificacao
        /* dados sensiveis
        const CLIENT_ID = '';//do google cloud platform
        const REDIRECT_URI = '';//local que o user sera redirecionado */
        const RESPONSE_TYPE = 'token';//o que queremos obter das informacoes de redirecionamento
        const SCOPE = encodeURI('profile email');//o que queremos acessar do user // encondeUri substitui o espaco para caracteres que a url possa entender

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;//passando os parametros a partir da interrogacao
       
        const {type, params,} = await AuthSession.startAsync({ authUrl }) as AuthorizationResponse;//extraindo da tipagem do AuthorizationResponse o type e params

        if(type === 'success'){//conseguir o token
          const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token }`)//para fazer requisicao http //retorno em formato json,e pegar o acesso token q esta dentro de params
          const userInfo = await response.json();

          const userLoggedGoogle = {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.given_name,//somente o primeiro nome
            photo: userInfo.picture,
          }
          
          setUser(userLoggedGoogle); 
          await AsyncStorage.setItem(userStorageKey, JSON.stringify(userLoggedGoogle));  
              
        }  

      } catch(error) { //caso de erro e n consiga o token        
          throw new Error(error);//ira para funcao SignIn que esta no index
      }
    }
    
    async function signInWithApple() {
      try {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL, 
          ]
        });
        
        if(credential){
          const userLoggedApple = {
            id: String(credential.user),
            email: credential.email!,//! garantindo que smp ira ter 
            name: credential.fullName!.givenName!,
            photo: undefined,
          };
        setUser(userLoggedApple);
        await AsyncStorage.setItem(userStorageKey, JSON.stringify(userLoggedApple));
        } 
        

      }catch (error) {
        throw new Error(error);
      }
    }

    useEffect(() => {//quando atualizar n sair das telas que estao autenticadas
      async function loadUserStorageDate() {
        const userStoraged = await AsyncStorage.getItem(userStorageKey);//usuario logado
        
        if(userStoraged){
          const userLogged = JSON.parse(userStoraged) as User;
          setUser(userLogged);
        }

        setUserStorageLoading(false);
      }

      loadUserStorageDate();
    },[]);

    return(
       <AuthContext.Provider value={{ user, signInWithGoogle, signInWithApple }}>{/* valor atual do contexto */}
        { children }
      </AuthContext.Provider>
    )
  }

  function useAuth() {//transformando o contexto criado em hook
    const context = useContext(AuthContext);

    return context;
  }

  export { AuthProvider, useAuth }
 