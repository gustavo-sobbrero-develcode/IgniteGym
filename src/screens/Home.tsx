import React, { useCallback, useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Heading, HStack, Text, VStack, useToast } from "native-base";

import { Group } from "@components/Group";
import { HomeHeader } from "@components/HomeHeader";
import { ExerciseCard } from "@components/ExerciseCard";
import { AppNavigatorRoutesProps } from "@routes/app.routes";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import { ExerciseDTO } from "@dtos/ExerciseDTO";
import { Loading } from "@components/Loading";

export function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<string[]>([]);
  const [exercises, setExercises] = useState<ExerciseDTO[]>([]);
  const [groupSelected, setGroupSelected] = useState("costas");

  const toast = useToast();
  const navigation = useNavigation<AppNavigatorRoutesProps>();

  function handleOpenExerciseDetails(exerciseId: string) {
    navigation.navigate("exercise", { exerciseId });
  }

  async function fetchGroups() {
    try {
      const response = await api.get("/groups");
      setGroups(response.data);
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : "Não foi possível carregar os grupos musculares.";
      toast.show({
        title,
        placement: "top",
        bgColor: "red.500",
      });
    }
  }

  async function fetchExcercisesByGroup() {
    try {
      setIsLoading(true);
      const response = await api.get(`/exercises/bygroup/${groupSelected}`);
      setExercises(response.data);
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : "Não foi possível carregar os exercícios.";
      toast.show({
        title,
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchGroups();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchExcercisesByGroup();
    }, [groupSelected])
  );

  return (
    <>
      <View>
        <HomeHeader />
        <FlatList
          data={groups}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Group
              name={item}
              isActive={
                groupSelected.toLocaleUpperCase() === item.toLocaleUpperCase()
              }
              onPress={() => setGroupSelected(item)}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 8,
            paddingVertical: 15,
            paddingBottom: 20,
          }}
        />
        <HStack justifyContent="space-between" mb={2} px={7}>
          <Heading color="gray.200" fontSize="md" fontFamily="heading">
            Exercícios
          </Heading>

          <Text color="gray.200" fontSize="sm">
            {exercises.length}
          </Text>
        </HStack>
      </View>
      {isLoading ? (
        <Loading />
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExerciseCard
              onPress={() => handleOpenExerciseDetails(item.id)}
              data={item}
            />
          )}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => <View />}
          ListFooterComponentStyle={{ paddingBottom: 80 }}
        />
      )}
    </>
  );
}
