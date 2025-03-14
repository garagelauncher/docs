// eslint-disable-next-line import/no-unresolved
import { VStack, Text } from 'native-base';
// eslint-disable-next-line import/default
import React from 'react';

import { theme } from '@src/styles/theme';

export const Categories = () => {
  return (
    <>
      {[
        'Brincadeiras',
        'Música',
        'Livros e artigos',
        'Paternidade e maternidade',
      ].map((size) => (
        <VStack
          key={size}
          space={3}
          h="73"
          w="303"
          bg={theme.colors.warmGray200}
          rounded="md"
          marginTop={4}
          marginLeft={2}
          justifyContent="center"
        >
          <Text
            key={size}
            fontSize="xl"
            justifyContent="center"
            py={5}
            px={5}
            bold
          >
            {size}
          </Text>
        </VStack>
      ))}
    </>
  );
};
