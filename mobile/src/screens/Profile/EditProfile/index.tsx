/* eslint-disable @typescript-eslint/no-explicit-any */
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import {
  ScrollView,
  Button,
  Text,
  FormControl,
  Avatar,
  Icon,
  Box,
  Flex,
  IconButton,
  Heading,
  Collapse,
  useToast,
  WarningOutlineIcon,
  TextArea,
  Input,
  Spinner,
} from 'native-base';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import MultiSelect from 'react-native-multiple-select';
import { useMutation } from 'react-query';
import * as yup from 'yup';

import { AppBar } from '@src/components/AppBar';
import { ConditionallyRender } from '@src/components/ConditionallyRender';
import { LoadingFallback } from '@src/components/LoadingFallback';
import { ModalConfirmAction } from '@src/components/ModalConfirmAction';
import { UserEditProps } from '@src/contracts/User';
import { useCategories } from '@src/hooks/queries/useCategories';
import { useAuth } from '@src/hooks/useAuth';
import { StackProfileNavigatorParamList } from '@src/routes/stacks/profileStack.routes';
import { diversaGenteServices } from '@src/services/diversaGente';
import { queryClient } from '@src/services/queryClient';

type ProfileScreenNavigationProps = NavigationProp<
  StackProfileNavigatorParamList,
  'Profile'
>;

export const EditProfile = () => {
  const { user, refetchUser, disableAccount, isLoadingDisablingAccount } =
    useAuth();

  const [isPersonalInfoOpen, setPersonalInfoOpen] = useState(false);
  const [isFavoriteCategoriesOpen, setIsFavoriteCategoriesOpen] =
    useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [
    isDisableAccountModalConfirmVisible,
    setIsDisableAccountModalConfirmVisible,
  ] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    user?.lovelyCategoriesIds ?? [],
  );
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useCategories({
      range: [0, 30],
      sort: ['createdAt', 'ASC'],
    });
  const categories =
    categoriesData?.pages.map((page) => page.results).flat() ?? [];

  const schema = yup.object({
    name: yup
      .string()
      .min(6, 'O nome deve conter no mínimo 6 caracteres.')
      .max(32, 'O nome deve conter no máximo 32 caracteres.')
      .required('Nome é obrigatório.'),
    biograph: yup
      .string()
      .max(100, 'A descrição deve conter no máximo 100 caracteres')
      .optional(),
    lovelyCategoriesIds: yup.array().of(yup.string()).optional(),
    language: yup.string().optional(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserEditProps>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: user?.name,
      biograph: String(user?.biograph ?? ''),
      preferences: {
        language: user?.preferences.language,
        canReceivedMessage: user?.preferences.canReceivedMessage ?? true,
      },
      lovelyCategoriesIds: selectedCategories,
    },
  });
  console.log('errors', errors);
  const toast = useToast();

  const updateUserAvatarMutation = useMutation(
    diversaGenteServices.updateUserAvatar,
    {
      onSuccess: async () => {
        toast.show({
          description: 'Foto atualizada!',
          bg: 'green.500',
        });
        setIsLoading(false);
        await refetchUser();
      },
      onError: () => {
        toast.show({
          description: 'Não foi possível atualizar a foto!',
          background: 'red.500',
        });
        setIsLoading(false);
      },
    },
  );

  const updateUserDataMutation = useMutation(
    diversaGenteServices.updateUserData,
    {
      onSuccess: async () => {
        toast.show({
          description: 'Informações atualizadas com sucesso!',
          bg: 'green.500',
        });
        setIsLoading(false);
        queryClient.invalidateQueries(['diversagente@categories']);
        await refetchUser();
      },
      onError: () => {
        toast.show({
          description: 'Não foi possível atualizar as informações!',
          background: 'red.500',
        });
        setIsLoading(false);
      },
    },
  );

  const handleUpdateUserPersonalInfo = async (data: UserEditProps) => {
    setIsLoading(true);
    console.log('handleUpdateUserPerfonalInfo', data);
    await updateUserDataMutation.mutateAsync({
      username: user?.username,
      biograph: data.biograph,
      name: data.name,
    });
  };

  const handleUpdateCategories = async () => {
    await updateUserDataMutation.mutateAsync({
      username: user?.username,
      lovelyCategoriesIds: selectedCategories,
    });
  };

  {
    /**

  const handleUpdateAppPreferences = async (data: Partial<UserEditProps>) => {
    console.log('handleUpdateUserPerfonalInfo', data.preferences);
    await updateUserDataMutation.mutateAsync({
      username: user?.username,
      preferences: {
        language: String(data.preferences?.language),
        canReceivedMessage: true,
      },
    });
  };


  const handleUpdateSecurityAndPrivacy = async (
    data: Partial<UserEditProps>,
  ) => {
    console.log('handleUpdateUserPerfonalInfo');
    await updateUserDataMutation.mutateAsync({
      username: user?.username,
      ...data,
    });
  };
   */
  }

  const navigation = useNavigation<ProfileScreenNavigationProps>();

  const handlePerfonalInfoClose = () => {
    setPersonalInfoOpen(!isPersonalInfoOpen);
  };

  const handleNavigateBackToProfile = () => {
    navigation.navigate('Profile', { userId: user?.id as string });
  };

  async function takeGalleryAndUploadPhotoAsync() {
    try {
      setIsLoading(true);

      const maxSize = 10 * 1024 * 1024; // 10MB
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        size: maxSize,
      });

      console.log('image data', pickerResult);

      if (pickerResult.cancelled) {
        return;
      }

      const localUri = pickerResult.uri;
      const filename = localUri.split('/').pop();

      if (!filename) {
        return;
      }

      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      const formData = new FormData();

      const blob: Blob = {
        uri: localUri,
        name: filename,
        type,
      } as any;
      console.log('blob', blob);
      formData.append('file', blob);

      await updateUserAvatarMutation.mutateAsync({
        username: String(user?.email),
        body: formData,
      });
    } catch (error) {
      console.log('error update profile image', error);
      Alert.alert('Erro', 'Não foi possível atualizar a foto de perfil.');
    } finally {
      setIsLoading(false);
    }
  }

  const onSelectedCategoriesChange = (newSelectedCategories: string[]) => {
    console.log('newSelectedCategories', newSelectedCategories);
    setSelectedCategories(newSelectedCategories);
  };

  return (
    <ScrollView>
      <AppBar position="absolute" left={0} right={0} top={0} />
      <Flex px={8} py={12} alignItems={'center'}>
        <Heading fontSize={20} fontWeight={'semibold'}>
          Edição do perfil
        </Heading>

        <Box position="absolute" pr={'96%'} pt={6}>
          <IconButton
            _pressed={{ opacity: '0.6' }}
            onPress={handleNavigateBackToProfile}
            variant="solid"
            marginTop={18}
            bgColor={'transparent'}
            icon={
              <Icon
                size={'2xl'}
                color={'black'}
                marginBottom={2}
                as={<Feather name="arrow-left" size={32} />}
              />
            }
          />
        </Box>

        <Flex w={'100%'}>
          <Flex alignItems={'center'} mt={8}>
            <Avatar
              bg="amber.500"
              source={{
                uri: user?.picture ?? '',
              }}
              size="2xl"
            >
              NB
            </Avatar>

            <Box mt={-8} ml={32} bgColor={'blue.600'} p={2} borderRadius={20}>
              <ConditionallyRender
                condition={isLoading || updateUserAvatarMutation.isLoading}
                trueComponent={<Spinner size={'lg'} color="orange.500" />}
                falseComponent={
                  <TouchableOpacity onPress={takeGalleryAndUploadPhotoAsync}>
                    <Feather name="edit" size={16} color="white" />
                  </TouchableOpacity>
                }
              />
            </Box>
          </Flex>

          <Box mt={6}>
            <TouchableOpacity onPress={handlePerfonalInfoClose}>
              <Flex flexDir="row" mt={5}>
                <Text fontSize={20} fontWeight={'semibold'}>
                  Informações pessoais
                </Text>
                <MaterialIcons
                  style={{
                    transform: [
                      { rotateX: isPersonalInfoOpen ? '180deg' : '0deg' },
                    ],
                  }}
                  name="expand-more"
                  size={24}
                  color="black"
                />
              </Flex>
            </TouchableOpacity>

            <Collapse isOpen={isPersonalInfoOpen} mt={2} w={'100%'}>
              <Box mb={6}>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, value } }) => (
                    <FormControl w="100%">
                      <FormControl.Label isRequired>Nome</FormControl.Label>

                      <Input
                        borderColor={[errors.name ? 'red.500' : 'blue.800']}
                        size="md"
                        variant={'underlined'}
                        placeholder={'Informe como quer ser chamado.'}
                        onChangeText={onChange}
                        value={value}
                      />

                      {errors.name?.message && (
                        <Flex flexDir={'row'} alignItems={'center'}>
                          <WarningOutlineIcon
                            mt={2}
                            color={'red.600'}
                            size="xs"
                          />
                          <Text ml={1} mt={2} color={'red.600'}>
                            {errors.name?.message}
                          </Text>
                        </Flex>
                      )}
                    </FormControl>
                  )}
                ></Controller>
              </Box>

              <Box mb={6}>
                <Controller
                  control={control}
                  name="biograph"
                  render={({ field: { onChange, value } }) => (
                    <FormControl w="100%">
                      <FormControl.Label mb={4}>Biografia</FormControl.Label>

                      <TextArea
                        h={180}
                        borderColor={[errors.biograph ? 'red.500' : 'blue.800']}
                        size="md"
                        py={4}
                        px={4}
                        placeholder={
                          'Adicione uma biografia para que as pessoas te conheçam melhor.'
                        }
                        autoCompleteType="off"
                        onChangeText={onChange}
                        value={value}
                      />
                    </FormControl>
                  )}
                ></Controller>
              </Box>

              <Button
                bgColor={'darkBlue.600'}
                isLoading={isLoading}
                onPress={handleSubmit(handleUpdateUserPersonalInfo)}
              >
                Salvar informações pessoais
              </Button>
            </Collapse>
          </Box>

          <Box mt={6}>
            <TouchableOpacity
              onPress={() =>
                setIsFavoriteCategoriesOpen((prevState) => !prevState)
              }
            >
              <Flex flexDir="row" mt={5}>
                <Text fontSize={20} fontWeight={'semibold'}>
                  Categorias favoritas
                </Text>
                <MaterialIcons
                  style={{
                    transform: [
                      { rotateX: isFavoriteCategoriesOpen ? '180deg' : '0deg' },
                    ],
                  }}
                  name="expand-more"
                  size={24}
                  color="black"
                />
              </Flex>
            </TouchableOpacity>

            <Collapse isOpen={isFavoriteCategoriesOpen} mt={2} w={'100%'}>
              <Box mb={6}>
                <LoadingFallback
                  fallback={<Spinner color="orange.500" size="lg" />}
                  isLoading={isLoadingCategories}
                >
                  <MultiSelect
                    hideTags
                    items={categories}
                    uniqueKey="id"
                    onSelectedItemsChange={onSelectedCategoriesChange}
                    selectedItems={selectedCategories}
                    selectText="Selecione categorias"
                    searchInputPlaceholderText="Procure categorias aqui..."
                    onChangeInput={(text) => console.log(text)}
                    tagRemoveIconColor="#CCC"
                    tagBorderColor="#CCC"
                    tagTextColor="#CCC"
                    selectedItemTextColor="#CCC"
                    selectedItemIconColor="#CCC"
                    itemTextColor="#000"
                    displayKey="title"
                    searchInputStyle={{ color: '#CCC' }}
                    submitButtonColor="#004282"
                    submitButtonText="Selecionar"
                    selectedText="selecionadas"
                    noItemsText="Nenhuma categoria com esse texto"
                  />
                </LoadingFallback>
              </Box>

              <Button
                bgColor={'darkBlue.600'}
                isLoading={updateUserDataMutation.isLoading}
                onPress={handleUpdateCategories}
              >
                Salvar categorias favoritas
              </Button>
            </Collapse>
          </Box>

          <Box mt={6}>
            <TouchableOpacity
              onPress={() => setIsDeleteAccountOpen((prevState) => !prevState)}
            >
              <Flex flexDir="row" mt={5}>
                <Text fontSize={20} fontWeight={'semibold'}>
                  Conta do app
                </Text>
                <MaterialIcons
                  style={{
                    transform: [
                      { rotateX: isDeleteAccountOpen ? '180deg' : '0deg' },
                    ],
                  }}
                  name="expand-more"
                  size={24}
                  color="black"
                />
              </Flex>
            </TouchableOpacity>

            <Collapse isOpen={isDeleteAccountOpen} mt={2} w={'100%'}>
              <Box mb={6}>
                <Button
                  colorScheme={'red'}
                  isLoading={isLoadingDisablingAccount}
                  onPress={() => setIsDisableAccountModalConfirmVisible(true)}
                >
                  Desativar a conta
                </Button>
              </Box>
            </Collapse>
          </Box>
          <ModalConfirmAction
            isOpen={isDisableAccountModalConfirmVisible}
            onClose={() => setIsDisableAccountModalConfirmVisible(false)}
            onConfirm={disableAccount}
            title="Desativar a conta"
            description="Ao desativar a sua conta, você não poderá mais recuperar os seus dados de antes de você desativar. Tem certeza que deseja desativar a sua conta e deixar de fazer parte da comunidade neurodiversa? Serão mantidos por alguns dias o nome do usuário, email e descrição do perfil para que possamos analisar a causa da desativação e para reativar você deverá entrar em contato com a equipe do app pelo e-mail garagelauncher@gmail.com."
            confirmText="Sim, tenho certeza"
            confirmColor="red"
          />
          {/*
          <Box>
            <TouchableOpacity onPress={handlePreferencesAtAppClose}>
              <Flex flexDir="row" mt={5}>
                <Text fontSize={20} fontWeight={'semibold'}>
                  Preferências no app
                </Text>
                <MaterialIcons
                  style={{
                    transform: [
                      { rotateX: isPreferencesAtAppOpen ? '180deg' : '0deg' },
                    ],
                  }}
                  name="expand-more"
                  size={24}
                  color="black"
                />
              </Flex>
            </TouchableOpacity>

            <Collapse isOpen={isPreferencesAtAppOpen} mt={2} w={'100%'}>
              <Controller
                control={control}
                name="preferences"
                render={({ field: { onChange, value } }) => (
                  <FormControl w="100%">
                    <FormControl.Label mb={4}>Idioma</FormControl.Label>

                    <Select
                      defaultValue={user?.preferences.language ?? 'pt-br'}
                      onValueChange={onChange}
                    >
                      <Select.Item label="Português" value="pt-br" />
                      <Select.Item label="Inglês" value="en-us" />
                    </Select>
                  </FormControl>
                )}
              ></Controller>

              <Button
                mt={6}
                bgColor={'darkBlue.600'}
                onPress={handleSubmit(handleUpdateAppPreferences)}
              >
                Salvar preferências no app
              </Button>
            </Collapse>
          </Box>

          <Box>
            <TouchableOpacity onPress={handleSecurityAndPrivacyClose}>
              <Flex flexDir="row" mt={5}>
                <Text fontSize={20} fontWeight={'semibold'}>
                  Segurança e Privacidade
                </Text>
                <MaterialIcons
                  style={{
                    transform: [
                      {
                        rotateX: isSecurityAndPrivacyOpen ? '180deg' : '0deg',
                      },
                    ],
                  }}
                  name="expand-more"
                  size={24}
                  color="black"
                />
              </Flex>
            </TouchableOpacity>

            <Collapse isOpen={isSecurityAndPrivacyOpen} mt={2} w={'100%'}>
              <TouchableOpacity activeOpacity={0.6}>
                <Button mt={2} mb={4} bgColor={'red.500'}>
                  <Text fontSize={16} color={'white'} fontWeight={'bold'}>
                    Deletar conta
                  </Text>
                </Button>
              </TouchableOpacity>
            </Collapse>
          </Box>
          */}
        </Flex>
      </Flex>
    </ScrollView>
  );
};
