import { AntDesign } from '@expo/vector-icons';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  Box,
  Flex,
  Button,
  FlatList,
  Skeleton,
  Text,
  Spinner,
  HStack,
  Icon,
  Input,
} from 'native-base';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useQuery } from 'react-query';

import { Header } from '@src/components/Header';
import { useSubcategoryDetails } from '@src/hooks/queries/details/useSubcategoryDetails';
import { useSubcategories } from '@src/hooks/queries/useSubcategories';
import { useAuth } from '@src/hooks/useAuth';
import { StackForumNavigatorParamList } from '@src/routes/stacks/forumStack.routes';
import { diversaGenteServices } from '@src/services/diversaGente';

type SubcategoriesNavigationProps = NavigationProp<
  StackForumNavigatorParamList,
  'Subcategory'
>;

export const Subcategory = () => {
  const route =
    useRoute<RouteProp<StackForumNavigatorParamList, 'Subcategory'>>();
  const { subcategoryId } = route.params;
  const { user } = useAuth();

  const { data, isLoading, isError } = useSubcategoryDetails(subcategoryId);

  console.log(data);

  const skeletonsPosts = new Array(2).fill(0);

  const navigation = useNavigation<SubcategoriesNavigationProps>();

  return (
    <>
      <Box bgColor={'darkBlue.700'} height={390} mb={10}>
        <Box marginBottom={4}>
          <Header
            avatar={user?.picture}
            screenName={`${data?.title}`}
            subtitle={`${data?.description}`}
          ></Header>
        </Box>
      </Box>
    </>
  );
};
