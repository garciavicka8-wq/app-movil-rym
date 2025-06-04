import {StyleSheet, View} from 'react-native';
import {Button, IconButton} from 'react-native-paper';

export default function Toolbar({collapsedTotalHook}) {
  return (
    <View style={styles.collapsedActions}>
      <Button
        buttonColor="transparent"
        textColor="#fff"
        uppercase
        contentStyle={{flexDirection: 'row-reverse'}}
        labelStyle={{fontWeight: 'bold'}}
        icon={
          collapsedTotalHook.showList
            ? 'chevron-down-circle'
            : 'chevron-up-circle'
        }
        onPress={() => collapsedTotalHook.toggleList()}>
        Total {collapsedTotalHook.total} pts
      </Button>
      <View style={styles.collapsedIcons}>
        <IconButton
          iconColor="#fff"
          icon="delete"
          size={20}
          onPress={collapsedTotalHook.handleClear}
        />
        <IconButton
          iconColor="#fff"
          icon="printer"
          size={20}
          onPress={collapsedTotalHook.handlePrint}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  collapsedActions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collapsedIcons: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
