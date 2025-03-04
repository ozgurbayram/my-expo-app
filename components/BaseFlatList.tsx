import React from 'react';
import { FlatList, FlatListProps, ListRenderItemInfo, View } from 'react-native';

interface BaseFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  className?: string;
}

const BaseFlatList = <T,>({ data, renderItem, className, ...props }: BaseFlatListProps<T>) => {
  const _renderItem = ({ item }: ListRenderItemInfo<T>) => {
    return <>{renderItem(item)}</>;
  };

  return (
    <View className={`bg-background ${className || ''}`}>
      <FlatList data={data} renderItem={_renderItem} {...props} />
    </View>
  );
};

export default BaseFlatList;
