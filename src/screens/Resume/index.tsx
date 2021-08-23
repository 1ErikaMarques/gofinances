import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { VictoryPie } from 'victory-native';//grafico
import { RFValue } from 'react-native-responsive-fontsize';
import { addMonths, subMonths, format } from 'date-fns'; //lida com data
import { ptBR } from 'date-fns/locale'; //traducao do mes
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';//pegar a altura do menu
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from 'styled-components';
import { useAuth } from '../../hooks/auth';

import { HistoryCard } from '../../components/HistoryCard';

import { 
  Container, 
  Header, 
  Title, 
  Content, 
  ChartContainer, 
  MonthSelect,
  MonthSelectButton, 
  MonthSelectIcon, 
  Month,
  LoadContainer, 
} from './styles';

import { categories } from '../../utils/categories';




interface TransactionData {  
  type: 'positive' | 'negative';
  name: string;
  amount: string;
  category: string;
  date: string;
}

interface CategoryData {
  key: string;
  name: string;
  total: number;//para usar no grafico
  totalFormatted: string; //para usar nos valores dos cartoes
  color: string;
  percent: string;
}

export function Resume(){
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>([]);//o tipo e um [] de CategoryData

  const theme = useTheme();//cores do tema
  const { user } = useAuth();

  function handleDateChange(action: 'next' | 'previous'){
    if(action === 'next'){
      const newDate =  addMonths(selectedDate, 1) //pegando a data e acrescentando mais 1
      setSelectedDate(newDate);//atualizando o estado
      
    }else{
       const newDate =  subMonths(selectedDate, 1) //pegando a data e subtraindo mais 1
      setSelectedDate(newDate);//atualizando o estado
    }
  }

  async function loadData(){
    setIsLoading(true);//animacao de carregamento

    const collectionKey = `@gofinances:transactions_user:${user.id}`; //chave // pegar as transacoes   //vinculando a conta ao usuario       
    const response = await AsyncStorage.getItem(collectionKey);//recuperando todos os dados que estao no async-storage
    const responseFormatted = response ? JSON.parse(response) : [];//se data tiver algum dado converte para json senao retorna um array vazio
    
    const expensives = responseFormatted.  //filtrando as transacoes de saida
    filter((expensive: TransactionData) => //expensive e do tipo TransactionData
    expensive.type === 'negative' && //comparado o tipo do gasto e negativo e 
    new Date(expensive.date).getMonth() === selectedDate.getMonth() &&//convertendo para data com o new date,pegando o mes
    new Date(expensive.date).getFullYear() === selectedDate.getFullYear() 
    ); 

    //calculo para usar no grafico 
    const expensivesTotal = expensives 
    .reduce((acumullator: number , expensive: TransactionData) => { //reduce pega colecao e soma os elementos, no acumullator fica armazenado a somatoria, o expensive e cada item da colecao
      return acumullator + Number(expensive.amount);
    }, 0); //valor inicial do acumullator


    const totalByCategory: CategoryData[] = []; //o tipo e CategoryData,array que vai receber o obj com o total

    categories.forEach(category => {  //percorrendo cada categoria
      let categorySoma = 0;

      expensives.forEach((expensive: TransactionData) => { //percorre todos os gastos
        if(expensive.category === category.key){
          categorySoma += Number(expensive.amount);
        }
      });

      if (categorySoma > 0){
      const totalFormatted = categorySoma //convertendo para moeda
      .toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL'
      }); 

      //descobrir a porcentagem de cada categoria 
      const percent = `${(categorySoma / expensivesTotal * 100).toFixed(0)}%`

      totalByCategory.push({ //vai add um novo obj no array do totalByCategory
        key: category.key,
        name: category.name,
        color: category.color,
        total: categorySoma,/* : categorySoma */
        totalFormatted,
        percent
        }); 
      }

    });
    setTotalByCategories(totalByCategory);
    setIsLoading(false);
  }

   useFocusEffect(useCallback(() => { //atualiza os valores,real time
    loadData().then();
  }, [selectedDate]));

  return(
    <Container>        
        <Header>
          <Title>Resumo por categoria</Title>
        </Header>

        {
          isLoading ?
            <LoadContainer> 
              <ActivityIndicator color={theme.colors.primary} size="large"/>
            </LoadContainer> :
  
        <Content 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: useBottomTabBarHeight(), //altura do menu 
          }}
        
        >        
          <MonthSelect>
            <MonthSelectButton onPress={() => handleDateChange('previous')}>
              <MonthSelectIcon name="chevron-left"/>
            </MonthSelectButton>

            <Month> { format (selectedDate, 'MMMM, yyy', {locale: ptBR})} </Month>

            <MonthSelectButton onPress={() => handleDateChange('next')}>
              <MonthSelectIcon name="chevron-right"/>
            </MonthSelectButton>
          </MonthSelect>

          <ChartContainer>
            <VictoryPie 
            data={totalByCategories} 
            colorScale={totalByCategories.map(category => category.color)}//pegando somente as cores da categoria
            style={{
              labels: {fontSize: RFValue(18),
              fontWeight: 'bold',
              fill: theme.colors.shape
              }
            }}
            labelRadius={50} //levando as porcentagens para dentro do grafico
            x="percent" 
            y="total"/>
          </ChartContainer>
          
          { 
            totalByCategories.map(item => ( //criando a lista de categorias do resumo
            <HistoryCard key={item.key} title={item.name} amount={item.totalFormatted} color={item.color}/>
          ))       
          }
        </Content>    
      }
    </Container>
  )
}