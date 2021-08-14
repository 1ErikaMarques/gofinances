import React, { useState, useEffect } from 'react';
import { Modal, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native'; //fecha o tc quando clica fora
import * as Yup from 'yup'; //criar o padrao dos inputs
import { yupResolver } from '@hookform/resolvers/yup';//forcar para que o submits dos inputs siga um padrao
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native'; //hook para fazer a navegacao

import AsyncStorage from '@react-native-async-storage/async-storage'; //guardar os dados do usuario no dispositivo
import uuid from 'react-native-uuid';//gerar id

import { InputForm } from '../../components/Form/InputForm';
import { Button } from '../../components/Form/Button';
import { TransactionTypeButton } from '../../components/Form/TransactionTypeButton';
import { CategorySelectButton } from '../../components/Form/CategorySelectButton';
import { CategorySelect } from '../CategorySelect';

import { Container, Header, Title, Form, Fields, TransactionsTypes } from './styles';

interface FormData {
  name: string;
  amount: string;
}

//o padrao que q os inputs ira seguir
const schema = Yup.object().shape({
  name: Yup
  .string()
  .required('Nome é obrigatório'),

  amount: Yup
  .number()
  .typeError('Informe um valor númerico')
  .positive('O valor não pode ser negativo')
  .required('O valor é obrigatório')
});

export function Register(){  
  const [transactionType, setTransactionType] = useState('');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);  

  const [category, setCategory] = useState({
    key: 'category',
    name: 'Category'    
  });

  const navigation = useNavigation();

  //valida o fomulario a partir do schema que foi passado // formState pega os erros
  const { control, handleSubmit, reset, formState: { errors }} = useForm({
    resolver: yupResolver(schema)
  });

  function handleTransactionsTypeSelect(type: 'positive' | 'negative'){
    setTransactionType(type);
  }

  function handleModalOpenSelectCategory(){
    setCategoryModalOpen(true);
  }

   function handleModalCloseSelectCategory(){
    setCategoryModalOpen(false);
  }

  async function handleRegister(form : FormData){
    if(!transactionType)
      return Alert.alert('Selecione o tipo da transacao');

    if(category.key === 'category')
     return Alert.alert('Selecione a categoria');

      const newTransaction = {
        id: String(uuid.v4()), //salvando como string o id
        name: form.name,
        amount: form.amount,
        type: transactionType,
        category: category.key,
        date: new Date() //pegando a data atual
      }
     try { //estrutura de tratativas de erros   //salvando no asyncStorage  
        const collectionKey = '@gofinances:transactions'; //chave // guardar dados   
        
        const data = await AsyncStorage.getItem(collectionKey);//recuperando todos os dados que estao no async-storage
        const currentData= data ? JSON.parse(data) : [];//se data tiver algum dado converte para json senao retorna um array vazio

        const dataFormatted = [//array de obj
          ...currentData,//todos os dados que estao salvo atualmente 
          newTransaction //+ o novo dado
        ];
        await AsyncStorage.setItem( collectionKey, JSON.stringify(dataFormatted));//convertendo o obj data para string
          reset();//reseta o formulario
          setTransactionType('');//resetando para o estado inicial
          setCategory({ //resetando o formulario  para o estado inicial
            key: 'category',
            name: 'Category'    
          });
          
          navigation.navigate('Listagem'); //vai redirecionar para tela de listagem, que colocamos nas rotas

     } catch (error) {
        console.log(error);
        Alert.alert("Nao foi possivel salvar");
     }
  }
  /*useEffect(() => { //recuperando no asyncStorage
      async function loadData() {
      const data = await AsyncStorage.getItem(collectionKey);
      console.log(JSON.parse(data!)); //convertendo para obj, ! forcando para para afirmar que smp vai ter ago no data, ele nunca sera null
    }

    loadData()

   /* async function removeAll(){//limpando a AsyncStorage
      AsyncStorage.removeItem(collectionKey);
    }
    removeAll();
  }, []);*/

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}> 
      <Container>
      
        <Header>
          <Title>Cadastro</Title>
        </Header>

        <Form>        
          <Fields>
            <InputForm 
              name="name" 
              control={control} 
              placeholder="Nome" 
              autoCapitalize="sentences"
              autoCorrect={false}
              error={errors.name && errors.name.message} //se existir o erro name exibir a msg de erro que criamos 
            />

            <InputForm 
              name="amount" 
              control={control} 
              placeholder="Preço"
              keyboardType="numeric"
              error={errors.amount && errors.amount.message}
              
            />

            <TransactionsTypes>
              <TransactionTypeButton  
                type="up" 
                title="Income" 
                onPress={() => handleTransactionsTypeSelect('positive')} 
                isActive={transactionType === 'positive'}
                />

              <TransactionTypeButton  
                type="down" 
                title="Outcome" 
                onPress={() => handleTransactionsTypeSelect('negative')}  
                isActive={transactionType === 'negative'}
                />

            </TransactionsTypes>  
            <CategorySelectButton title={category.name} onPress={handleModalOpenSelectCategory}/>
          </Fields>
          <Button title="Enviar" onPress={handleSubmit(handleRegister)}/>    
        </Form>
        
        <Modal visible={categoryModalOpen}>
          <CategorySelect 
            category={category}
            setCategory={setCategory} 
            closeSelectCategory={handleModalCloseSelectCategory}
          />
        </Modal>
      
      </Container>
    </TouchableWithoutFeedback>  
  );
}