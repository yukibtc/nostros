import React, { useContext, useEffect, useState } from 'react'
import { Clipboard, FlatList, ListRenderItem, StyleSheet, View } from 'react-native'
import { AppContext } from '../../Contexts/AppContext'
import { useTranslation } from 'react-i18next'
import { RelayPoolContext } from '../../Contexts/RelayPoolContext'
import { getRelays, Relay } from '../../Functions/DatabaseFunctions/Relays'
import { defaultRelays, REGEX_SOCKET_LINK } from '../../Constants/Relay'
import {
  Snackbar,
  List,
  Switch,
  AnimatedFAB,
  useTheme,
  Text,
  Button,
  TextInput,
  IconButton,
  Divider,
} from 'react-native-paper'
import RBSheet from 'react-native-raw-bottom-sheet'

export const RelaysPage: React.FC = () => {
  const defaultRelayInput = React.useMemo(() => 'wss://', [])
  const { database } = useContext(AppContext)
  const { relayPool, publicKey } = useContext(RelayPoolContext)
  const { t } = useTranslation('common')
  const theme = useTheme()
  const bottomSheetAddRef = React.useRef<RBSheet>(null)
  const bottomSheetEditRef = React.useRef<RBSheet>(null)
  const [relays, setRelays] = useState<Relay[]>([])
  const [selectedRelay, setSelectedRelay] = useState<Relay>()
  const [addRelayInput, setAddRelayInput] = useState<string>(defaultRelayInput)
  const [showNotification, setShowNotification] = useState<'remove' | 'add' | 'badFormat'>()

  const loadRelays: () => void = () => {
    if (database) {
      getRelays(database).then((results) => {
        if (results) {
          setRelays(results)
        }
      })
    }
  }

  useEffect(loadRelays, [])

  const addRelayItem: (relay: Relay) => void = async (relay) => {
    if (relayPool && database && publicKey) {
      setRelays((prev) => [...prev, relay])
      relayPool.add(relay.url, () => {
        setShowNotification('add')
        loadRelays()
      })
    }
  }

  const removeRelayItem: (relay: Relay) => void = async (relay) => {
    if (relayPool && database && publicKey) {
      setRelays((prev) => prev.filter((item) => item.url !== relay.url))
      relayPool.remove(relay.url, () => {
        setShowNotification('remove')
        loadRelays()
      })
    }
  }

  const onPressAddRelay: () => void = () => {
    if (REGEX_SOCKET_LINK.test(addRelayInput)) {
      bottomSheetAddRef.current?.close()
      addRelayItem({
        url: addRelayInput,
      })
      setAddRelayInput(defaultRelayInput)
    } else {
      bottomSheetAddRef.current?.close()
      setShowNotification('badFormat')
    }
  }

  const defaultList: () => Relay[] = () => {
    return defaultRelays
      .filter((url) => !relays?.find((item) => item.url === url))
      .map((url) => {
        return {
          url,
        }
      })
  }

  const relayToggle: (relay: Relay) => JSX.Element = (relay) => {
    const active = relays?.some((item) => item.url === relay.url)

    const onValueChange: () => void = () => {
      active ? removeRelayItem(relay) : addRelayItem(relay)
    }

    return <Switch value={active} onValueChange={onValueChange} />
  }

  const renderItem: ListRenderItem<Relay> = ({ index, item }) => (
    <List.Item
      key={index}
      title={item.url.split('wss://')[1]?.split('/')[0]}
      right={() => relayToggle(item)}
      onPress={() => {
        setSelectedRelay(item)
        bottomSheetEditRef.current?.open()
      }}
    />
  )

  return (
    <View style={styles.container}>
      <FlatList style={styles.list} data={[...relays, ...defaultList()]} renderItem={renderItem} />
      <AnimatedFAB
        style={styles.fab}
        icon={'plus'}
        label={'Label'}
        onPress={() => bottomSheetAddRef.current?.open()}
        animateFrom={'right'}
        iconMode={'static'}
        extended={false}
      />
      <Snackbar
        style={styles.snackbar}
        visible={showNotification !== undefined}
        duration={Snackbar.DURATION_SHORT}
        onIconPress={() => setShowNotification(undefined)}
        onDismiss={() => setShowNotification(undefined)}
      >
        {t(`relaysPage.${showNotification}`)}
      </Snackbar>
      <RBSheet
        ref={bottomSheetAddRef}
        closeOnDragDown={true}
        height={260}
        customStyles={{
          container: {
            ...styles.rbsheetContainer,
            backgroundColor: theme.colors.background,
          },
          draggableIcon: styles.rbsheetDraggableIcon,
        }}
      >
        <View>
          <TextInput
            mode='outlined'
            label={t('relaysPage.labelAdd') ?? ''}
            placeholder={t('relaysPage.placeholderAdd') ?? ''}
            onChangeText={setAddRelayInput}
            value={addRelayInput}
          />
          <Button mode='contained' onPress={onPressAddRelay}>
            {t('relaysPage.add')}
          </Button>
          <Button
            mode='outlined'
            onPress={() => {
              bottomSheetAddRef.current?.close()
              setAddRelayInput(defaultRelayInput)
            }}
          >
            {t('relaysPage.cancel')}
          </Button>
        </View>
      </RBSheet>
      <RBSheet
        ref={bottomSheetEditRef}
        closeOnDragDown={true}
        height={260}
        customStyles={{
          container: {
            ...styles.rbsheetContainer,
            backgroundColor: theme.colors.background,
          },
          draggableIcon: styles.rbsheetDraggableIcon,
        }}
      >
        <View>
          <View style={styles.relayActions}>
            <View style={styles.actionButton}>
              <IconButton
                icon='trash-can-outline'
                size={28}
                onPress={() => {
                  if (selectedRelay) removeRelayItem(selectedRelay)
                  bottomSheetEditRef.current?.close()
                }}
              />
              <Text>{t('relaysPage.removeRelay')}</Text>
            </View>
            <View style={styles.actionButton}>
              <IconButton
                icon='content-copy'
                size={28}
                onPress={() => {
                  if (selectedRelay) Clipboard.setString(selectedRelay.url)
                }}
              />
              <Text>{t('relaysPage.copyRelay')}</Text>
            </View>
          </View>
          <Divider style={styles.divider}/>
          <Text variant='titleLarge'>{selectedRelay?.url.split('wss://')[1]?.split('/')[0]}</Text>
        </View>
      </RBSheet>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  list: {
    padding: 0,
  },
  snackbar: {
    margin: 16,
    bottom: 70,
  },
  fab: {
    bottom: 16,
    right: 16,
    position: 'absolute',
  },
  rbsheetDraggableIcon: {
    backgroundColor: '#000',
  },
  rbsheetContainer: {
    padding: 16,
    borderTopRightRadius: 28,
    borderTopLeftRadius: 28,
  },
  relayActions: {
    flexDirection: 'row',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80
  },
  divider: {
    marginBottom: 26,
    marginTop: 26
  }
})

export default RelaysPage
