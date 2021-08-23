import React, { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; //guardar os dados do usuario no dispositivo
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';//indicador de loading//animacao carregando
import { useTheme} from 'styled-components';
import { useAuth } from '../../hooks/auth';

import { HighlightCard } from '../../components/HighlightCard';
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard';

import { 
  Container, 
  Header, 
  UserWrapper, 
  UserInfo, 
  Photo, 
  User, 
  UserGreeting, 
  UserName, 
  Icon, 
  HighlightCards, 
  Transactions, 
  Title,
  TransactionList,
  LogoutButton,
  LoadContainer
} from './styles';



export interface DataListProps extends TransactionCardProps {
  id: string;
}
interface HighlightProps {
  amount: string;
  lastTransaction: string;
}

interface HighlightData {  
  entries: HighlightProps;
  expensives: HighlightProps;
  total: HighlightProps;
}

export function Dashboard() {
  //dinamico
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighlightData>({} as HighlightData);

  const theme = useTheme();//pegando as cores do tema
  const { signOut, user } = useAuth();

  function getLastTansactionDate(
    collection: DataListProps[],
    type: 'positive' | 'negative') 
    {
    const collectionFilttered = collection.filter(trasaction => trasaction.type === type)  //tipo da transaction e DatalistProps,pego cada transacao positive
    if(collectionFilttered.length === 0)//se nao tiver nenhuma data//quando n tem nenhuma transacao
      return 0;
    
      //calculo ultima transacao
    const lastTransaction = new Date(
      Math.max.apply(Math, collectionFilttered //o math ira cuidar para descobrir o maior numero        
      .map(trasaction => new Date(trasaction.date).getTime())))//pegando somente as ultimas datas, e convertendo para datas
    
    return `${lastTransaction.getDate()} de ${lastTransaction.toLocaleString('pt-BR',{month: 'long'})}`;//pegando o dia e o mes
  }

  /*carregando as transacoes*/
  async function loadTransactions() {
    const collectionKey = `@gofinances:transactions_user:${user.id}`; //chave // guardar dados//vinculando dados ao usuario
    const response = await AsyncStorage.getItem(collectionKey); //pegando todos os itens e passando a chave
    const transactions = response ? JSON.parse(response) : []; //se tiver algum dado no response converte para json
    
    let entriesTotal = 0;
    let expensiveTotal = 0;

    const transactionsFormatted: DataListProps[] = transactions //formatando as transacoes //no final de tudo sera devolvido uma lista de DataListProps
    .map((item : DataListProps) => {  //tipando //cada item e um DataListProps,alem de percorrer cada item o map retorna um novo obj
      
      if(item.type === 'positive') {
        entriesTotal += Number(item.amount);//valor do entradaSoma + o que esta no amount 
      }else{
        expensiveTotal += Number(item.amount);//item.amount e o valor sem a formatacao
      }      
      
      const amount = Number(item.amount).toLocaleString('pt-BR',{ //formatando o amount
        style: 'currency', //estilo moeda
        currency: 'BRL' //formato da moeda
      });

      const date = Intl.DateTimeFormat('pt-BR', { //formatando a data
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      }).format(new Date(item.date));

      return { //vindo de transactionCard
        id: item.id,
        name: item.name,
        amount, //amount: amount
        type: item.type,
        category: item.category,
        date,
      }
    });

    setTransactions(transactionsFormatted); //ate aqui atualiza as transacoes

    const lastTransactionEntries = getLastTansactionDate(transactions, 'positive');
    const lastTransactionExpensives = getLastTansactionDate(transactions, 'negative');
    const totalInterval = lastTransactionExpensives === 0 ? 'Não há transações' : `01 a ${lastTransactionExpensives}`
   

    const total = entriesTotal - expensiveTotal;

    setHighlightData({      
      entries: {
        amount: entriesTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }),
        lastTransaction: lastTransactionEntries === 0 ? 'Não há transações' : `Ultima entrada dia ${lastTransactionEntries}`,
      },
      expensives: {
        amount: expensiveTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }),
        lastTransaction: lastTransactionExpensives === 0 ? 'Não há transações' : `Ultima saida dia ${lastTransactionExpensives}`,
      },
       total: {
        amount: total.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }),
        lastTransaction: totalInterval
      }
        });         
         setIsLoading(false);
  }

  useEffect(() => {
     loadTransactions().then(); 
    
    /* limpar a sessaor
     const collectionKey = '@gofinances:transactions'; //chave // guardar dados
     AsyncStorage.removeItem(collectionKey);   */
  }, []);

  useFocusEffect(useCallback(() => {
    loadTransactions().then();
  }, []));

  /*Fixo
   const data: DataListProps[] = [
    {   
      id: '1',
      type: 'positive',
      title:"Desenvolvimento de site", 
      amount:"R$ 12.000,00", 
      category:{ 
        name: 'Vendas', 
        icon: 'dollar-sign'           
      },
      date:"13/04/2020"
  },
  {   
      id: '2',
      type: 'negative',
      title:"Hamburgueria Pizzy", 
      amount:"R$ 59,00", 
      category:{ 
        name: 'Alimentação', 
        icon: 'coffee'           
      },
      date:"10/04/2020"
  },
  {   
      id: '3',
      type: 'negative',
      title:"Aluguel apartamento", 
      amount:"R$ 1.200,00", 
      category:{ 
        name: 'Casa', 
        icon: 'shopping-bag'           
      },
      date:"10/04/2020"
  }
]; */

  return (
    <Container>
     
      { 
        isLoading ?
         <LoadContainer> 
           <ActivityIndicator color={theme.colors.primary} size="large"/>
         </LoadContainer> : // se o isLoading for true entao mostra o  <ActivityIndicator /> caso o contrario mostra o restante
      <>
        <Header>
        <UserWrapper>
            <UserInfo>
              <Photo source={{ uri: user.photo }}/>
              <User>
                <UserGreeting>Ola,</UserGreeting>
                <UserName>{user.name}</UserName>
              </User>
            </UserInfo>

            <LogoutButton onPress={signOut}>
              <Icon name="power"/>
            </LogoutButton>
            
          </UserWrapper>         
        </ Header>

        <HighlightCards >
          <HighlightCard type="up" title="Entradas" amount={highlightData.entries.amount} lastTransaction={highlightData.entries.lastTransaction}/>
          <HighlightCard type="down" title="Saidas" amount={highlightData.expensives.amount} lastTransaction={highlightData.expensives.lastTransaction}/>
          <HighlightCard type="total" title="Total" amount={highlightData.total.amount} lastTransaction={highlightData.total.lastTransaction}/>

        </HighlightCards>

        <Transactions>
          <Title>Listagem</Title>
          <TransactionList 
            data={transactions}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <TransactionCard data={item} />}                   
          />

        </Transactions>
      </>
    }   
    </Container>
  
  );
}
