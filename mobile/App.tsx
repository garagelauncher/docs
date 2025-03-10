import 'intl';
import 'intl/locale-data/jsonp/en';
import 'intl/locale-data/jsonp/pt-BR';
import 'react-native-gesture-handler';
import './src/services/notifications/config';

import { CarterOne_400Regular } from '@expo-google-fonts/carter-one';
import { Poppins_700Bold } from '@expo-google-fonts/poppins';
import { LinkingOptions, NavigationContainer } from '@react-navigation/native';
import * as Font from 'expo-font';
import * as Linking from 'expo-linking';
import { Subscription } from 'expo-modules-core';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { NativeBaseProvider, Text, View } from 'native-base';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { QueryClientProvider, focusManager } from 'react-query';

import { getPushNotificationToken } from './src/services/notifications';

import { Connectivitybar } from '@src/components/Connectivitybar';
import { AuthProvider } from '@src/providers/AuthProvider';
import { Routes } from '@src/routes';
import { StackForumNavigatorParamList } from '@src/routes/stacks/forumStack.routes';
import { RootBottomTabParamList } from '@src/routes/tabs';
import { queryClient } from '@src/services/queryClient';
import { customTheme } from '@src/styles/theme';

const prefix = Linking.createURL('/');

export default function App() {
  console.log(prefix);

  const linking: LinkingOptions<
    RootBottomTabParamList & StackForumNavigatorParamList
  > = {
    prefixes: [
      prefix,
      'https://www.diversagente.com.br',
      'https://www.diversagente.com',
      'https://dev-diversagente.herokuapp.com/mobile',
      'https://diversagente.herokuapp.com/mobile',
      'diversagente://app',
    ],
    config: {
      screens: {
        ForumStack: {
          screens: {
            Forum: 'home',
            FormCreatePost: 'create-post',
            PostDetails: 'posts/:postId',
            Comments: 'posts/:postId/comments',
            Likes: 'posts/:postId/likes',
            SelectComplaint: 'complaints/:resource/:resourceId/',
            ViewProfile: 'profile/:username',
          },
        },
        LocationsStack: {
          screens: {
            Locations: 'locations',
            LocationDetails: 'locations/:locationId',
            Reviews: 'locations/:locationId/reviews',
          },
        },
        ProfileStack: {
          screens: {
            Profile: 'profile',
            EditProfile: 'profile/edit',
          },
        },
      },
    },
  };

  const getNotificationListener = useRef<Subscription>();
  const responseNotificationListener = useRef<Subscription>();
  const [appIsReady, setAppIsReady] = useState(false);

  function onAppStateChange(status: AppStateStatus) {
    if (Platform.OS !== 'web') {
      focusManager.setFocused(status === 'active');
    }
  }

  const handleOpenURL = (event: Linking.EventType) => {
    console.log('handleOpenURL', event);
  };

  useEffect(() => {
    getPushNotificationToken().then(async (token) => {
      console.log('result of push token');
      console.log(token);
    });
  });

  useEffect(() => {
    getNotificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('@notification receive', notification);
      });

    responseNotificationListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('@response notification', response);
      });

    return () => {
      getNotificationListener.current?.remove();
      responseNotificationListener.current?.remove();
    };
  }, []);

  useEffect(() => {
    Linking.addEventListener('url', handleOpenURL);

    return () => {
      Linking.removeEventListener('url', handleOpenURL);
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange);

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    async function prepareApp() {
      try {
        await SplashScreen.preventAutoHideAsync();
        await Font.loadAsync({
          Poppins_700Bold,
          CarterOne_400Regular,
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepareApp();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <NativeBaseProvider theme={customTheme}>
      <QueryClientProvider client={queryClient}>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <NavigationContainer
            linking={linking}
            fallback={<Text>Loading...</Text>}
          >
            <AuthProvider>
              <Connectivitybar />
              <Routes />
            </AuthProvider>
          </NavigationContainer>
        </View>
      </QueryClientProvider>
    </NativeBaseProvider>
  );
}
