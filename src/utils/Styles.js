import {StyleSheet} from 'react-native';
import Colors from './Colors';

const styles = StyleSheet.create({
  content: {
    marginHorizontal: '2.5%',
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    color: 'gray',
    fontWeight: 'bold',
    marginVertical: 20,
  },
  navSectionTitle: {
    backgroundColor: Colors.blue,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 15,
    // marginBottom: 20,
  },
  navSectionTitleText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem50: {
    flexBasis: '50%',
  },
});

export default styles;
