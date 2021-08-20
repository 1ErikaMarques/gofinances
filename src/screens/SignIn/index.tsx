import React, { useContext } from "react";
import { Alert } from 'react-native';
import { RFValue } from "react-native-responsive-fontsize";

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
   const { user, signInWithGoogle, signInWithApple } = useAuth();

   async function handleSignInWithGoogle() {
    try {
      await signInWithGoogle();//funcao esta vindo do auth.tsx

    } catch (error) {
      console.log(error);
      Alert.alert('Não foi possivel conectar a conta Google');
    }
   }
   async function handleSignInWithApple() {
    try {
      await signInWithApple();//funcao esta vindo do auth.tsx

    } catch (error) {
      console.log(error);
      Alert.alert('Não foi possivel conectar a conta Apple');
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
          <SignInSocialButton title="Entrar com Apple" svg={AppleSvg}onPress={handleSignInWithApple}/>
        </FooterWrapper>
      </Footer>
    </Container>
  ) 
}