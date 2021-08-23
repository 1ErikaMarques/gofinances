/* import 'react-native-gesture-handler';  */
import 'intl';
import 'intl/locale-data/jsonp/pt-BR';
import React from 'react';
import { StatusBar } from 'react-native'; 
import AppLoading from 'expo-app-loading'

import { ThemeProvider } from 'styled-components';

import { Routes } from './src/routes';

import { 
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';

import theme from './src/global/styles/theme';
import { AppRoutes } from './src/routes/app.routes';
import { SignIn } from './src/screens/SignIn';
import { AuthProvider, useAuth } from './src/hooks/auth';//contexto


export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold
  });

  const { userStorageLoading } = useAuth();
  
  if(!fontsLoaded || userStorageLoading) {//usuario carregando
    return <AppLoading />
  }

  return (
  <ThemeProvider theme={theme}>{/* Provider pq ele sera usado por todas as interfaces que ele esta por volta */}
    
      <StatusBar barStyle="light-content"/>
      <AuthProvider>{/* valor atual do contexto */}
        <Routes />
      </AuthProvider>
    
  </ThemeProvider>
  )
}



