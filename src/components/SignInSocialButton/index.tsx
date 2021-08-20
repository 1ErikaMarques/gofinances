import React from 'react';
import { RectButtonProps } from 'react-native-gesture-handler';
import { SvgProps } from 'react-native-svg';

import {
  Button,
  ImageContainer,
  Text,
 } from './styles';

interface Props extends RectButtonProps {
  title: string;
  svg: React.FC<SvgProps> //Fc pq estamos usando o svg como componente
}
 export function SignInSocialButton({title, svg: Svg, ...rest}: Props){ //converte o svg para Svg para usa-lo como componente
   
   return(
     <Button {...rest}>
       <ImageContainer>
         <Svg />
       </ImageContainer>

       <Text>{title}</Text>
     </Button>
   );
 }