import React from 'react';
import { RectButtonProps } from 'react-native-gesture-handler';

import { Container, Title } from './styles';

interface Props extends RectButtonProps {
  title: string;
  onPress: () => void; //resolvendo o conflito/erro de tipagem no register do rectButton com o react-hook-form
}

export function Button({title, onPress,...rest}: Props){
  return(
    <Container onPress={onPress} {...rest}>
      <Title>
        {title}
      </Title>
    </Container>
  );
}