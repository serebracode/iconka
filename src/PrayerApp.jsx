import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const items = [
  { id: 1, title: 'Пресвятая Богородица', image: 'https://picsum.photos/seed/saint1/400' },
  { id: 2, title: 'Иоанн Креститель', image: 'https://picsum.photos/seed/saint2/400' },
  { id: 3, title: 'Апостол Пётр', image: 'https://picsum.photos/seed/saint3/400' },
  { id: 4, title: 'Апостол Павел', image: 'https://picsum.photos/seed/saint4/400' },
  { id: 5, title: 'Апостол Андрей Первозванный', image: 'https://picsum.photos/seed/saint5/400' },
  { id: 6, title: 'Иоанн Богослов', image: 'https://picsum.photos/seed/saint6/400' },
  { id: 7, title: 'Святитель Николай Чудотворец', image: 'https://picsum.photos/seed/saint7/400' },
  { id: 8, title: 'Василий Великий', image: 'https://picsum.photos/seed/saint8/400' },
  { id: 9, title: 'Григорий Богослов', image: 'https://picsum.photos/seed/saint9/400' },
  { id: 10, title: 'Иоанн Златоуст', image: 'https://picsum.photos/seed/saint10/400' },
  { id: 11, title: 'Георгий Победоносец', image: 'https://picsum.photos/seed/saint11/400' },
  { id: 12, title: 'Димитрий Солунский', image: 'https://picsum.photos/seed/saint12/400' },
  { id: 13, title: 'Пантелеимон Целитель', image: 'https://picsum.photos/seed/saint13/400' },
  { id: 14, title: 'Великомученица Варвара', image: 'https://picsum.photos/seed/saint14/400' },
  { id: 15, title: 'Великомученица Екатерина', image: 'https://picsum.photos/seed/saint15/400' },
  { id: 16, title: 'Вера, Надежда, Любовь и София', image: 'https://picsum.photos/seed/saint16/400' },
  { id: 17, title: 'Князь Владимир Креститель', image: 'https://picsum.photos/seed/saint17/400' },
  { id: 18, title: 'Княгиня Ольга', image: 'https://picsum.photos/seed/saint18/400' },
  { id: 19, title: 'Кирилл и Мефодий', image: 'https://picsum.photos/seed/saint19/400' },
  { id: 20, title: 'Борис и Глеб', image: 'https://picsum.photos/seed/saint20/400' },
  { id: 21, title: 'Александр Невский', image: 'https://picsum.photos/seed/saint21/400' },
  { id: 22, title: 'Дмитрий Донской', image: 'https://picsum.photos/seed/saint22/400' },
  { id: 23, title: 'Пётр и Феврония Муромские', image: 'https://picsum.photos/seed/saint23/400' },
  { id: 24, title: 'Сергий Радонежский', image: 'https://picsum.photos/seed/saint24/400' },
  { id: 25, title: 'Серафим Саровский', image: 'https://picsum.photos/seed/saint25/400' },
  { id: 26, title: 'Антоний Печерский', image: 'https://picsum.photos/seed/saint26/400' },
  { id: 27, title: 'Феодосий Печерский', image: 'https://picsum.photos/seed/saint27/400' },
  { id: 28, title: 'Нил Сорский', image: 'https://picsum.photos/seed/saint28/400' },
  { id: 29, title: 'Амвросий Оптинский', image: 'https://picsum.photos/seed/saint29/400' },
  { id: 30, title: 'Василий Блаженный', image: 'https://picsum.photos/seed/saint30/400' },
  { id: 31, title: 'Ксения Петербургская', image: 'https://picsum.photos/seed/saint31/400' },
  { id: 32, title: 'Матрона Московская', image: 'https://picsum.photos/seed/saint32/400' },
  { id: 33, title: 'Иоанн Кронштадтский', image: 'https://picsum.photos/seed/saint33/400' },
  { id: 34, title: 'Царственные страстотерпцы', image: 'https://picsum.photos/seed/saint34/400' },
];

const MIN_CANDLE_HEIGHT = 50;
const MAX_CANDLE_HEIGHT = 330;

const Candle = ({ remainingHeight, flameVisible }) => {
  const flameScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = Math.max(
    0,
    Math.min(1, (remainingHeight - MIN_CANDLE_HEIGHT) / (MAX_CANDLE_HEIGHT - MIN_CANDLE_HEIGHT)),
  );

  useEffect(() => {
    if (!flameVisible) {
      return undefined;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(flameScale, {
          toValue: 1.05,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(flameScale, {
          toValue: 0.95,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
      flameScale.setValue(1);
    };
  }, [flameScale, flameVisible]);

  return (
    <View style={styles.candleWrapper}>
      {flameVisible && (
        <Animated.View
          style={[
            styles.glow,
            {
              opacity: glowOpacity,
            },
          ]}
        />
      )}
      <View style={styles.candle}>
        {flameVisible && (
          <Animated.View
            style={[
              styles.flame,
              {
                opacity: glowOpacity,
                transform: [
                  { scaleX: flameScale },
                  { scaleY: flameScale },
                ],
              },
            ]}
          >
            <View style={styles.innerFlame} />
          </Animated.View>
        )}
        <View style={styles.wick} />
        <View style={styles.candleBody}>
          <View style={styles.candleHighlightLeft} />
          <View style={styles.candleHighlightRight} />
        </View>
      </View>
    </View>
  );
};

const PrayerApp = () => {
  const [currentScreen, setCurrentScreen] = useState('list');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [candleHeight, setCandleHeight] = useState(MAX_CANDLE_HEIGHT);
  const [showDialog, setShowDialog] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [flameVisible, setFlameVisible] = useState(true);

  const sectionListRef = useRef(null);

  useEffect(() => {
    if (currentScreen !== 'detail' || candleHeight <= MIN_CANDLE_HEIGHT) {
      return undefined;
    }

    const interval = setInterval(() => {
      setCandleHeight(prev => {
        const nextHeight = prev - 2;
        if (nextHeight <= MIN_CANDLE_HEIGHT) {
          setFlameVisible(false);
          setTimeout(() => setShowDialog(true), 800);
          return MIN_CANDLE_HEIGHT;
        }
        return nextHeight;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [candleHeight, currentScreen]);

  const groupedItems = useMemo(() => {
    const filtered = items.filter(item =>
      item.title.toLowerCase().includes(searchText.trim().toLowerCase()),
    );

    const grouped = filtered.reduce((acc, item) => {
      const firstLetter = item.title[0]?.toUpperCase() ?? '#';
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(item);
      return acc;
    }, {});

    return Object.keys(grouped)
      .sort()
      .map(letter => ({
        title: letter,
        data: grouped[letter].sort((a, b) => a.title.localeCompare(b.title)),
      }));
  }, [searchText]);

  const alphabet = useMemo(() => groupedItems.map(group => group.title), [groupedItems]);

  const scrollToSection = letter => {
    const sectionIndex = groupedItems.findIndex(section => section.title === letter);
    if (sectionIndex !== -1 && sectionListRef.current) {
      sectionListRef.current.scrollToLocation({ sectionIndex, itemIndex: 0, animated: true });
    }
  };

  const handleItemPress = item => {
    setSelectedItem(item);
    setCurrentScreen('detail');
    setCandleHeight(MAX_CANDLE_HEIGHT);
    setShowDialog(false);
    setShowInfo(false);
    setFlameVisible(true);
  };

  const handleDialogYes = () => {
    setShowDialog(false);
    setCandleHeight(MAX_CANDLE_HEIGHT);
    setFlameVisible(true);
  };

  const handleDialogNo = () => {
    setShowDialog(false);
    setCurrentScreen('list');
    setSelectedItem(null);
    setFlameVisible(true);
    setCandleHeight(MAX_CANDLE_HEIGHT);
  };

  const renderListScreen = () => (
    <SafeAreaView style={styles.listContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Святые</Text>
        <View style={styles.searchContainer}>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Поиск"
            placeholderTextColor="#8E8E93"
            style={styles.searchInput}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
              <Text style={styles.clearText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <SectionList
        ref={sectionListRef}
        sections={groupedItems}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.listItem} onPress={() => handleItemPress(item)}>
            <Image source={{ uri: item.image }} style={styles.listItemImage} />
            <Text style={styles.listItemText}>{item.title}</Text>
          </TouchableOpacity>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
          </View>
        )}
        stickySectionHeadersEnabled
        contentContainerStyle={styles.sectionListContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Ничего не найдено</Text>
            <Text style={styles.emptyStateSubtitle}>Попробуйте изменить запрос поиска</Text>
          </View>
        }
      />

      {alphabet.length > 0 && (
        <View style={styles.alphabetContainer}>
          {alphabet.map(letter => (
            <TouchableOpacity key={letter} onPress={() => scrollToSection(letter)}>
              <Text style={styles.alphabetLetter}>{letter}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
  );

  const renderDetailScreen = () => (
    <SafeAreaView style={styles.detailContainer}>
      <View style={styles.detailBackground}>
        <Image
          source={{ uri: selectedItem?.image }}
          resizeMode="contain"
          style={styles.detailImage}
        />
      </View>

      <View style={styles.detailHeader}>
        <TouchableOpacity style={styles.roundButton} onPress={() => setCurrentScreen('list')}>
          <Text style={styles.roundButtonText}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.roundButton} onPress={() => setShowInfo(true)}>
          <Text style={styles.roundButtonText}>i</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.candleArea}>
        <Candle remainingHeight={candleHeight} flameVisible={flameVisible} />
      </View>

      <Modal transparent visible={showDialog} animationType="fade" onRequestClose={() => setShowDialog(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>Свеча догорела</Text>
            <Text style={styles.dialogSubtitle}>Повторить молитву?</Text>
            <View style={styles.dialogActions}>
              <Pressable style={[styles.dialogButton, styles.dialogSecondary]} onPress={handleDialogNo}>
                <Text style={styles.dialogSecondaryText}>Нет</Text>
              </Pressable>
              <Pressable style={[styles.dialogButton, styles.dialogPrimary]} onPress={handleDialogYes}>
                <Text style={styles.dialogPrimaryText}>Да</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showInfo} animationType="slide" onRequestClose={() => setShowInfo(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowInfo(false)} />
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoTitle}>{selectedItem?.title}</Text>
              <TouchableOpacity onPress={() => setShowInfo(false)} style={styles.dismissButton}>
                <Text style={styles.dismissText}>×</Text>
              </TouchableOpacity>
            </View>
            <Image source={{ uri: selectedItem?.image }} style={styles.infoImage} />
            <View style={styles.infoSection}>
              <Text style={styles.infoSectionTitle}>О святом</Text>
              <Text style={styles.infoSectionBody}>
                Здесь будет информация о жизни и подвигах святого {selectedItem?.title}. История его жизни,
                чудеса, день памяти и молитвы.
              </Text>
            </View>
            <View style={styles.infoSection}>
              <Text style={styles.infoSectionTitle}>Авторские права</Text>
              <Text style={styles.infoCopyright}>
                Изображение иконы предоставлено для некоммерческого использования. Все права принадлежат
                соответствующим авторам и правообладателям.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );

  return currentScreen === 'list' ? renderListScreen() : renderDetailScreen();
};

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 16,
  },
  searchContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 10,
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#48484A',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  clearText: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 18,
  },
  sectionListContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingRight: 40,
  },
  sectionHeader: {
    paddingVertical: 8,
  },
  sectionHeaderText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  listItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#2C2C2E',
  },
  listItemText: {
    flex: 1,
    color: '#fff',
    fontSize: 17,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyStateTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
  },
  alphabetContainer: {
    position: 'absolute',
    top: 120,
    right: 8,
    alignItems: 'center',
  },
  alphabetLetter: {
    color: '#0A84FF',
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 2,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  detailBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailImage: {
    width: '80%',
    height: '80%',
  },
  detailHeader: {
    position: 'absolute',
    top: 24,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(28,28,30,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundButtonText: {
    color: '#0A84FF',
    fontSize: 20,
    fontWeight: '700',
  },
  candleArea: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: 'rgba(28,28,30,0.95)',
    borderRadius: 18,
    padding: 24,
  },
  dialogTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  dialogSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dialogButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  dialogSecondary: {
    marginRight: 12,
    backgroundColor: '#2C2C2E',
  },
  dialogPrimary: {
    backgroundColor: '#0A84FF',
  },
  dialogSecondaryText: {
    color: '#0A84FF',
    fontSize: 16,
    fontWeight: '600',
  },
  dialogPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  infoCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  dismissButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 20,
  },
  infoImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: '#2C2C2E',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoSectionTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoSectionBody: {
    color: '#8E8E93',
    fontSize: 15,
    lineHeight: 22,
  },
  infoCopyright: {
    color: '#8E8E93',
    fontSize: 13,
    lineHeight: 20,
  },
  candleWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  glow: {
    position: 'absolute',
    bottom: 150,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 180, 80, 0.25)',
  },
  candle: {
    alignItems: 'center',
  },
  flame: {
    width: 36,
    height: 68,
    borderRadius: 18,
    backgroundColor: '#FFB347',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -8,
  },
  innerFlame: {
    width: 16,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFE29F',
  },
  wick: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: '#1A1A1A',
    marginBottom: -4,
  },
  candleBody: {
    width: 54,
    height: 330,
    borderRadius: 6,
    backgroundColor: '#D6A96F',
    overflow: 'hidden',
    alignItems: 'center',
  },
  candleHighlightLeft: {
    position: 'absolute',
    top: 16,
    left: 8,
    width: 6,
    height: 120,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 237, 210, 0.6)',
  },
  candleHighlightRight: {
    position: 'absolute',
    top: 12,
    right: 10,
    width: 4,
    height: 90,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 237, 210, 0.4)',
  },
});

export default PrayerApp;
