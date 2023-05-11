import geoViewport from '@mapbox/geo-viewport';
import Mapbox, { Camera, MapView, offlineManager } from '@rnmapbox/maps';
import React, { useState } from 'react';
import { Button, Dimensions, TextInput } from 'react-native';

import Page from '../common/Page';
import { BaseExampleProps } from '../common/BaseExamplePropTypes';

const CENTER_COORD: [number, number] = [-81.635, 29.914];
const MAPBOX_VECTOR_TILE_SIZE = 512;

// Public test style -- with custom styles/tilesets
const STYLE_URL = "mapbox://styles/onwaterllc/clhcm7yjv00dl01rh4d0thgaz";

const OfflineExample = (props: BaseExampleProps) => {
  const [packName, setPackName] = useState('pack-1');
  const [showEditTitle, setShowEditTitle] = useState(false);

  return (
    <Page {...props}>
      <Button
        title={`Pack name: ${packName}`}
        onPress={() => {
          setShowEditTitle(!showEditTitle);
        }}
      />
      {showEditTitle && (
        <TextInput
          value={packName}
          autoFocus={true}
          onChangeText={(text) => setPackName(text)}
          onBlur={() => setShowEditTitle(false)}
        />
      )}
      <Button
        title="Get all packs"
        onPress={async () => {
          const packs = await offlineManager.getPacks();
          console.log('=> packs:', packs);
          packs.forEach((pack) => {
            console.log(
              'pack:',
              pack,
              'name:',
              pack.name,
              'bounds:',
              pack?.bounds,
              'metadata',
              pack?.metadata,
            );
          });
        }}
      />
      <Button
        title="Get pack"
        onPress={async () => {
          const pack = await offlineManager.getPack(packName);
          if (pack) {
            console.log(
              'pack:',
              pack,
              'name:',
              pack.name,
              'bounds:',
              pack?.bounds,
              'metadata',
              pack?.metadata,
            );

            console.log('=> status', await pack?.status());
          }
        }}
      />
      <Button
        title="Resume pack"
        onPress={async () => {
          const pack = await offlineManager.getPack(packName);
          if (pack) {
            await pack.resume();
          }
        }}
      />
      <Button
        title="Remove packs"
        onPress={async () => {
          const result = await offlineManager.resetDatabase();
          console.log('Reset DB done:', result);
        }}
      />
      <Button
        title="Create Pack"
        onPress={async () => {
          const { width, height } = Dimensions.get('window');
          const bounds: [number, number, number, number] = geoViewport.bounds(
            CENTER_COORD,
            12,
            [width, height],
            MAPBOX_VECTOR_TILE_SIZE,
          );

          const b: [[number, number], [number, number]] = [
            [bounds[0], bounds[1]],
            [bounds[2], bounds[3]],
          ]

          console.log('BOUNDS: ', JSON.stringify(b, null, 2));

          const options = {
            name: packName,
            styleURL: STYLE_URL,
            bounds: b,
            minZoom: 10,
            maxZoom: 20,
            metadata: {
              whatIsThat: 'foo',
            },
          };
          offlineManager.createPack(options, (region, status) =>
            console.log(
              '=> progress callback region:',
              props,
              'status: ',
              status,
            ),
          );
        }}
      />
      <MapView style={{ flex: 1 }} styleURL={STYLE_URL}>
        <Camera zoomLevel={8} centerCoordinate={CENTER_COORD} />
      </MapView>
    </Page>
  );
};

export default OfflineExample;
