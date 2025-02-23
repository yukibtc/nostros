import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Linking, ListRenderItem, StyleSheet } from 'react-native'
import { Divider, List, useTheme } from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

interface ItemList {
  key: number
  title: string
  left?: () => JSX.Element
  onPress: () => void
}

export const AboutPage: React.FC = () => {
  const { t } = useTranslation('common')
  const theme = useTheme()

  const items = React.useMemo(
    () => [
      {
        key: 1,
        title: t('aboutPage.gitHub'),
        left: () => (
          <List.Icon
            icon={() => (
              <MaterialCommunityIcons
                name='file-tree-outline'
                size={25}
                color={theme.colors.onPrimaryContainer}
              />
            )}
          />
        ),
        onPress: async () => await Linking.openURL('https://github.com/KoalaSat/nostros'),
      },
      {
        key: 2,
        title: t('aboutPage.nostr'),
        left: () => (
          <List.Icon
            icon={() => (
              <MaterialCommunityIcons
                name='file-tree-outline'
                size={25}
                color={theme.colors.onPrimaryContainer}
              />
            )}
          />
        ),
        onPress: async () => await Linking.openURL('https://usenostr.org'),
      },
      {
        key: 3,
        title: t('aboutPage.nips'),
        left: () => (
          <List.Icon
            icon={() => (
              <MaterialCommunityIcons
                name='hammer-wrench'
                size={25}
                color={theme.colors.onPrimaryContainer}
              />
            )}
          />
        ),
        onPress: async () => await Linking.openURL('https://github.com/nostr-protocol/nips'),
      },
    ],
    [],
  )

  const renderItem: ListRenderItem<ItemList> = ({ item }) => {
    return <List.Item key={item.key} title={item.title} onPress={item.onPress} left={item.left} />
  }

  return (
    <FlatList
      style={styles.container}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={Divider}
      data={items}
      renderItem={renderItem}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
})

export default AboutPage
