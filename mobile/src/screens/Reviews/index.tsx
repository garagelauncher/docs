import { Feather } from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
  RouteProp,
  NavigationProp,
} from '@react-navigation/native';
import {
  Box,
  Heading,
  Icon,
  IconButton,
  Select,
  Spinner,
  Text,
  VStack,
  FlatList,
  Flex,
} from 'native-base';
import React, { useMemo, useState } from 'react';

import { UserReview } from '@src/components/UserReview';

import { LoadingFallback } from '@src/components/LoadingFallback';
import { PER_PAGE_ITEMS } from '@src/configs';
import { RatePeriod } from '@src/contracts/Review';
import { useReviews } from '@src/hooks/queries/useReviews';
import { StackLocationNavigatorParamList } from '@src/routes/stacks/locationStack.routes';
import { subtractDate } from '@src/utils/time';

export type ReviewsScreenNavigationProps = NavigationProp<
  StackLocationNavigatorParamList,
  'Reviews'
>;

export const Reviews = () => {
  const [ratePeriod, setRatePeriod] = useState<RatePeriod>('week');

  const navigation = useNavigation<ReviewsScreenNavigationProps>();
  const route =
    useRoute<RouteProp<StackLocationNavigatorParamList, 'Reviews'>>();
  const { locationId } = route.params;

  const locationCreatedAt = useMemo(
    () => subtractDate(1, ratePeriod),
    [ratePeriod],
  );

  const {
    data,
    isFetchingNextPage,
    isRefetching,
    hasNextPage,
    refetch,
    fetchNextPage,
  } = useReviews({
    locationId,
    perPage: PER_PAGE_ITEMS,
    range: [0, PER_PAGE_ITEMS],
    sort: ['createdAt', 'DESC'],
    filter: {
      locationId,
      createdAt: {
        gt: locationCreatedAt,
      },
    },
  });

  const handleNavigateGoBack = () => {
    navigation.goBack();
  };

  const handlePullReviewListToRefresh = () => {
    refetch();
  };

  const handleLoadMoreReviews = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  return (
    <VStack space={2} px={4} pt={12} flex={1}>
      <IconButton
        colorScheme="gray"
        variant={'solid'}
        icon={<Icon as={<Feather name="arrow-left" />} />}
        onPress={handleNavigateGoBack}
        position="absolute"
        top={12}
        ml={4}
        mb={2}
        zIndex={1}
      />
      <Heading fontSize={30} alignSelf={'center'}>
        Avaliações
      </Heading>

      <Text
        fontSize={16}
        color={'gray.800'}
        fontWeight={'bold'}
        flex={1}
        py={2}
      >
        Escolha um período:
      </Text>
      <Select
        accessibilityLabel="Escolha um período para as avaliações"
        flex={1}
        selectedValue={ratePeriod}
        onValueChange={(value) => setRatePeriod(value as RatePeriod)}
        minH={50}
      >
        <Select.Item label="Dia" value="day" />
        <Select.Item label="Semana" value="week" />
        <Select.Item label="Mês" value="month" />
        <Select.Item label="Ano" value="year" />
      </Select>

      <FlatList
        width={'100%'}
        data={data?.pages.map((page) => page.results).flat()}
        renderItem={({ item }) => (
          <Box marginBottom={2}>
            <UserReview review={item} />
          </Box>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 350 }}
        onEndReached={handleLoadMoreReviews}
        onEndReachedThreshold={0.85}
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={handlePullReviewListToRefresh}
        ListFooterComponent={
          <LoadingFallback
            fallback={<Spinner color="orange.500" size="lg" />}
            isLoading={isFetchingNextPage}
          >
            <Flex width="100%" alignItems="center" justifyContent="center">
              <Text color="gray.500">Esses foram os reviews desse local.</Text>
            </Flex>
          </LoadingFallback>
        }
        ListEmptyComponent={
          <Flex width="100%" alignItems="center" justifyContent="center">
            <Text color="gray.500">Nenhum review encontrado.</Text>
          </Flex>
        }
      />
    </VStack>
  );
};
