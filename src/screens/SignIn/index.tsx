import React, { useContext } from "react";
import { useState } from "react";
import { ActivityIndicator, Alert, Platform } from 'react-native';
import { RFValue } from "react-native-responsive-fontsize";
import { useTheme } from 'styled-components'

import AppleSvg from '../../assets/apple.svg';
import GoogleSvg from '../../assets/google.svg';
import LogoSvg from '../../assets/logo.svg';

import { SignInSocialButton } from "../../components/SignInSocialButton";
import { useAuth } from "../../hooks/auth";

import { 
  Container,
  Header,
  TitleWrapper,
  Title,
  SignInTitle,
  Footer,
  FooterWrapper
} from "./styles";


export function SignIn() {  
 /*  const data = useContext(AuthContext);//passando qual contexto eu quero acessar
  console.log(data) */
   const [isLoading, setIsLoading] = useState(false);
   const { signInWithGoogle, signInWithApple } = useAuth();
   const theme = useTheme();

   async function handleSignInWithGoogle() {
    try {
      setIsLoading(true) //no momento que o usuario tentar conectar com a conta google/ativando a animacao  loading
      return await signInWithGoogle();//funcao esta vindo do auth.tsx//se deu certo return

    } catch (error) {
      console.log(error);
      Alert.alert('Não foi possivel conectar a conta Google');
      setIsLoading(false);
    }   
   }
   async function handleSignInWithApple() {
    try {
      setIsLoading(true)//efeito de carregamento
      return await signInWithApple();//funcao esta vindo do auth.tsx

    } catch (error) {
      console.log(error);
      Alert.alert('Não foi possivel conectar a conta Apple');
      setIsLoading(false);//desabilita a animacao do  loading se der algum erro
    } 
   }
  

  return (
    <Container>
      <Header>
        <TitleWrapper>
          <LogoSvg width={RFValue(120)} height={RFValue(68)}/>
          <Title>
            Controle suas {'\n'}finanças de forma {'\n'}muito simples
          </Title>
        </TitleWrapper>

        <SignInTitle>
          Faça seu login com {'\n'}uma das contas abaixo
        </SignInTitle>
      </Header>

      <Footer>
        <FooterWrapper>      

          <SignInSocialButton title="Entrar com o Google" svg={GoogleSvg}onPress={handleSignInWithGoogle}/>
        
        { 
          Platform.OS === 'ios' &&
          <SignInSocialButton title="Entrar com Apple" svg={AppleSvg}onPress={handleSignInWithApple}/>
        }     

        </FooterWrapper>
        { isLoading && <ActivityIndicator color ={theme.colors.shape} style={{ marginTop: 18 }} />}{/* se isLoading e vdd */}
      </Footer>
    </Container>
  ) 
}