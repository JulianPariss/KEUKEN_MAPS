import { useCallback, useEffect, useRef } from 'react';
import CustomModal from '../../../../components/modal';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  useMapCore,
  useCreatePath,
  MapContainer,
  splitTrajectoryBatches,
  indexToColor,
  type IMarkerCreationProps,
} from '@repo/map-core';
import { routeThreshold } from '../../../../utils/constants/config.constants';
import moment from 'moment';
import { getStartPointIcon, timeStampIcon, getDeliveryClientIcon, getDriverIcon } from '../../../../utils/helpers/orderIconPicker';
import TimeStampModal from '../../components/timeStampModal';
import DriverModal from '../../components/driverModal';
import { useDriverRenderRef, useMapDriverObserverContext, useModalRef, useModeRef } from '../../../../utils/hooks/map/useContextRef';
import { flattenIds, getIntersection, getVisibilityState } from '../../../../utils/helpers/visibility';
import type { TNestedRoutes } from '../../../../utils/types/driverObserver/drivers.types';
import type { ISSERoute } from '../../../../utils/types/sellerObserver/sellers.types';
import type { IConnectionStatus } from '../../../../utils/types/sellerObserver/locations.types';
import { BASE_URL } from '../../../../utils/constants/url.constants';
import { addRoutePoint, changeFocus, isFocussed, setIsAnimating } from '../../../../store/slices/driverObserver/driversSlice';
import { renderToString } from 'react-dom/server';
import DeliveryClientTooltip from '../../components/deliveryClientTooltip';
import { getLastPositionByPhone } from '../../../../services/locations.service';
import useDeliveryClientActions from '../../../../utils/hooks/map/useDeliveryClientActions';
import { MqttToRoute } from '../../../../utils/helpers/routeParser';

const MapView = () => {
  const { fitCoordinates } = useMapCore();
  const bufferRef = useRef<(ISSERoute | IConnectionStatus)[]>([]);
  // SSE Buffer
  const BUFFER_INTERVAL_MS = 5000;
  const MAX_BATCH_SIZE = 55;

  const dispatch = useAppDispatch();
  const { driversUI, driverRoutes, watchList, filterList, animation } = useAppSelector((state) => state.drivers);
  const { deliveriesByDriverId, watchList: deliveryWatchList } = useAppSelector((state) => state.deliveries);
  const { clients, clientIdsByDeliveryId } = useAppSelector((state) => state.deliveryClients);
  const { TIMESTAMPS, ROUTES } = useDriverRenderRef();

  const requestedRef = useRef<Set<number>>(new Set());
  const prevWatchList = useRef<number[]>([]);
  const isMounted = useRef<boolean>(true);
  const animationRef = useRef(animation);
  animationRef.current = animation;

  const { enterprise } = useAppSelector((state) => state.user);
  const { date } = useAppSelector((state) => state.sidebar)

  const mapContext = useMapDriverObserverContext();
  const { createPolyLine, resetPathElements, handleMarkers, handleTooltips, handleActions, snakePolyLines } = useCreatePath({ mapRef: mapContext.mapRef });
  const snakePolyLinesRef = useRef(snakePolyLines);
  snakePolyLinesRef.current = snakePolyLines;

  const { onClick: onClientClick } = useDeliveryClientActions();

  const { mapInteractions } = useModeRef();
  const { OpenModal } = useModalRef();

  const {
    driverElements,
    clientElements,
  } = mapContext;

  const trackDriver = (route: ISSERoute) => {
    handleMarkers({
      id: route.userId,
      pointData: {
        id: route.deviceId,
        coordinates: [Number(route.lat), Number(route.lng)],
      },
      clickAction: () => {
        OpenModal({
          Component: DriverModal,
          props: { driverId: route.userId, userId: route.userId },
        });
      },
      leftClickAction: () => {},
      hoverAction: () => {},
      Icon: {
        size: 53,
        iconUrl: getDriverIcon(
          route.userId,
          driversUI[route.userId]?.color ?? indexToColor(route.userId)
        ),
        zIndexOffset: 10000,
      },
      operation: 'move',
      markerMapRef: 'driverTrackMarker',
      target: driverElements,
    });
  };

  // Map initialization, clean teardown, ResizeObserver, and GPS are handled by <MapContainer />


  const routesPolylines = useCallback((routes: TNestedRoutes) => {
    if (watchList.length <= 0) return;
    Object.entries(routes).forEach(([key, phones]) => {
      const keyNumber = Number(key);
      Object.entries(phones).forEach(([phoneId, value]) => {
        const shouldBeVisible = getVisibilityState(keyNumber, watchList, filterList).visibleInMap;

        const polylinesObj = driverElements.current?.[keyNumber]?.routePolyline;
        const existingBatchKeys = polylinesObj ? Object.keys(polylinesObj).filter(k => k.toString().startsWith(`${phoneId}_`)) : [];
        const exists = existingBatchKeys.length > 0;

        if (!shouldBeVisible && !exists) return;

        const opp = getVisibilityState(keyNumber, watchList, filterList).visibleInMap ? 'add' : 'remove';
        const isFocus = isFocussed(keyNumber, watchList);
        const baseColor = driversUI[keyNumber]?.color ?? indexToColor(keyNumber);

        if (opp === 'remove') {
          existingBatchKeys.forEach(batchKey => {
            createPolyLine({
              id: keyNumber,
              subId: batchKey,
              polylineMapRef: 'routePolyline',
              operation: 'remove',
              options: {},
              target: driverElements,
              points: [],
            });
          });
          handleMarkers({
            id: keyNumber,
            pointData: { id: phoneId, coordinates: [0, 0] as any },
            Icon: {},
            operation: 'remove',
            markerMapRef: 'routeStartingPoint',
            target: driverElements
          });
          return;
        }

        const batches = splitTrajectoryBatches(
          value,
          routeThreshold,
          value.some(r => r.orderType === -2) ? -2 : null
        );
        let firstFaithfulPoint: [number, number] | null = null;

        batches.forEach((batch, idx) => {
          const subId = `${phoneId}_${idx}`;

          if (!firstFaithfulPoint && batch.type === 'faithful' && batch.points.length > 0) {
            firstFaithfulPoint = batch.points[0];
          }

          createPolyLine({
            id: keyNumber,
            subId: subId,
            polylineMapRef: 'routePolyline',
            operation: 'add',
            options: {
              color: baseColor,
              weight: 4,
              dashArray: batch.type === 'unfaithful' ? '10, 15' : undefined,
              opacity: batch.type === 'unfaithful' ? 0.4 : 1
            },
            target: driverElements,
            points: batch.points,
            timestamp: batch.timestamps,
            arrows: true,
            hoverAction: ((isHover, e) => {
              handleTooltips({
                id: keyNumber,
                subId: phoneId,
                latlng: e.latlng,
                operation: isHover ? 'move' : 'remove',
                tooltipMapRef: 'routeTooltips',
                target: driverElements,
                content: `#${keyNumber}`,
              });
            }),
            clickAction: (() => {
              if (isFocus && animationRef.current.isAnimating && animationRef.current.driverAnimated === keyNumber) {
                snakePolyLinesRef.current({
                  id: keyNumber,
                  target: driverElements,
                  polylineMapRef: 'routePolyline',
                  operation: 'stop',
                });
                dispatch(setIsAnimating({ isAnimating: false, driverAnimated: null }));
              }
              dispatch(changeFocus(keyNumber));
              if (!isFocus) {
                const allPoints = batches.flatMap(b => b.points);
                if (allPoints.length > 0) {
                  fitCoordinates(allPoints);
                }
              }
            })
          });
        });

        if (firstFaithfulPoint) {
          handleMarkers({
            id: keyNumber,
            pointData: { id: phoneId, coordinates: firstFaithfulPoint },
            Icon: {
              size: isFocus ? 60 : 30,
              iconUrl: getStartPointIcon(baseColor),
            },
            operation: 'add',
            markerMapRef: 'routeStartingPoint',
            target: driverElements
          });
        }
      });
    });
  }, [
    watchList,
    filterList,
    driverElements,
    createPolyLine,
    handleMarkers,
    handleTooltips,
    fitCoordinates,
    dispatch,
    driversUI,
    getStartPointIcon,
  ]);

  const timeStamps = useCallback((routes: TNestedRoutes) => {
    Object.entries(routes).forEach(([key, phones]) => {
      Object.entries(phones).forEach(([_, phones]) => {
        const keyNumber = Number(key);
        phones.forEach((route, index) => {
          if (route.orderType !== -2) return;
          const parsedData: IMarkerCreationProps = {
            target: driverElements,
            id: keyNumber,
            pointData: {
              id: index,
              coordinates: [route.lat, route.lon]
            },
            clickAction: () => { OpenModal({ Component: TimeStampModal, props: { ...route } }) },
            Icon: {
              size: 16,
              iconUrl: timeStampIcon
            },
            operation: getVisibilityState(keyNumber, watchList, filterList).visibleInMap ? 'add' : 'remove',
            markerMapRef: 'timeStamps'
          }
          handleMarkers(parsedData)
        })
      })
    })
  }, [
    watchList,
    filterList,
    driverElements,
    OpenModal,
    handleMarkers,
    TimeStampModal,
    timeStampIcon,
  ]);


  /**
   * Renderizado de marcadores de clientes aplicando 2 capas de filtrado:
   * - Primera instancia (Capa 1): Chofer visible en el mapa según watchList y filterList (getVisibilityState, idéntico a sellerObserver).
   * - Segunda instancia (Capa 2): Reparto visible en deliveries.watchList.
   *
   * Un cliente se renderiza si está presente en AL MENOS 1 reparto activo.
   */
  const clientsMarkers = useCallback(() => {
    // 1. Filtrado de clientes visibles y mapeo de colores/repartos por chofer
    const visibleClientIds = new Set<number>();
    const clientDriverColorMap = new Map<number, string>();
    const clientDeliveryIdMap = new Map<number, number>();

    Object.entries(deliveriesByDriverId).forEach(([driverKey, driverDeliveries]) => {
      const driverId = Number(driverKey);
      const driverColor = driversUI[driverId]?.color ?? indexToColor(driverId);

      // PRIMERA INSTANCIA: Filtrar choferes visibles en mapa según watchList y filterList
      const isDriverVisibleInMap = getVisibilityState(driverId, watchList, filterList).visibleInMap;

      // SEGUNDA INSTANCIA: Filtrar repartos que estén en deliveryWatchList
      driverDeliveries.forEach((delivery) => {
        const isDeliveryWatched = deliveryWatchList.includes(delivery.id);
        const clientIds = clientIdsByDeliveryId[delivery.id] || [];

        clientIds.forEach((clientId) => {
          if (isDriverVisibleInMap && isDeliveryWatched) {
            visibleClientIds.add(clientId);
            clientDriverColorMap.set(clientId, driverColor);
            clientDeliveryIdMap.set(clientId, delivery.id);
          } else if (!clientDriverColorMap.has(clientId)) {
            clientDriverColorMap.set(clientId, driverColor);
            clientDeliveryIdMap.set(clientId, delivery.id);
          }
        });
      });
    });

    // 2. Renderizar marcadores de clientes únicos
    clients.forEach((client) => {
      const clientId = client.id;
      if (!client || !client.location) return;

      const lat = Number(client.location.latitude);
      const lng = Number(client.location.longitude);
      if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) return;

      const shouldBeVisible = visibleClientIds.has(clientId);
      const driverColor = clientDriverColorMap.get(clientId);
      const deliveryId = clientDeliveryIdMap.get(clientId);

      const parsedData: IMarkerCreationProps = {
        target: clientElements,
        id: 'deliveryClients',
        pointData: {
          id: clientId,
          coordinates: [lat, lng],
        },
        clickAction: () => onClientClick({ client, deliveryId }),
        leftClickAction: () => onClientClick({ client, deliveryId }),
        hoverAction: (isHover, e) => {
          const currentContent = isHover
            ? renderToString(<DeliveryClientTooltip client={client} />)
            : '';
          handleTooltips({
            id: 'deliveryClients',
            subId: clientId,
            latlng: e._latlng || e.latlng,
            operation: isHover ? 'move' : 'remove',
            tooltipMapRef: 'clientTooltips',
            target: clientElements,
            content: currentContent,
          });
        },
        Icon: {
          size: driverColor ? 22 : 20,
          iconUrl: getDeliveryClientIcon(driverColor, client.isProcessed),
        },
        operation: shouldBeVisible ? 'add' : 'remove',
        markerMapRef: 'clientMarkers',
      };

      handleMarkers(parsedData);
    });
  }, [
    deliveriesByDriverId,
    watchList,
    filterList,
    deliveryWatchList,
    clientIdsByDeliveryId,
    clients,
    clientElements,
    handleMarkers,
    handleTooltips,
    onClientClick,
    driversUI,
  ]);

  // Actions handlers 

  useEffect(() => {
    handleActions(driverElements);
    handleActions(clientElements);
  }, [mapInteractions]);

  // Sellers polylines and orders markers initialization.

  useEffect(() => {
    if (!enterprise.enterprise_id) return;
    if (animationRef.current.isAnimating && animationRef.current.driverAnimated) {
      snakePolyLinesRef.current({
        id: animationRef.current.driverAnimated,
        target: driverElements,
        polylineMapRef: 'routePolyline',
        operation: 'stop',
      });
      dispatch(setIsAnimating({ isAnimating: false, driverAnimated: null }));
    }
    requestedRef.current.clear();
    prevWatchList.current = [];
    resetPathElements(driverElements);
    resetPathElements(clientElements);
  }, [enterprise.enterprise_id, date]);


  useEffect(() => {
    isMounted.current = true; // Reinicia correctamente

    if (!enterprise.enterprise_id) return;

    if (animationRef.current.isAnimating && animationRef.current.driverAnimated) {
      const animatedId = animationRef.current.driverAnimated;
      const isVisible = getVisibilityState(animatedId, watchList, filterList).visibleInMap;
      const isFocus = isFocussed(animatedId, watchList);
      if (!isVisible || !isFocus) {
        snakePolyLinesRef.current({
          id: animatedId,
          target: driverElements,
          polylineMapRef: 'routePolyline',
          operation: 'stop',
        });
        dispatch(setIsAnimating({ isAnimating: false, driverAnimated: null }));
      }
    }

    resetPathElements(driverElements, getIntersection(watchList, filterList));

    if (ROUTES) {
      const routes = driverRoutes.routes;
      routesPolylines(routes);
    } else {
      if (animationRef.current.isAnimating && animationRef.current.driverAnimated) {
        snakePolyLinesRef.current({
          id: animationRef.current.driverAnimated,
          target: driverElements,
          polylineMapRef: 'routePolyline',
          operation: 'stop',
        });
        dispatch(setIsAnimating({ isAnimating: false, driverAnimated: null }));
      }
      resetPathElements(driverElements);
    }

    // TIMESTAMPS
    if (TIMESTAMPS) {
      const routes = driverRoutes.routes;
      timeStamps(routes);
    }

    const addedToWatch = getIntersection(watchList, filterList).filter(
      (id) => !prevWatchList.current.includes(id)
    );
    const removedFromWatch = prevWatchList.current.filter(
      (id) => !getIntersection(watchList, filterList).includes(id)
    );

    removedFromWatch.forEach((id) => requestedRef.current.delete(id));
    prevWatchList.current = flattenIds(watchList, filterList);

    const handleDriverTracking = async () => {
      flattenIds(watchList, filterList).map(async (driverId: number) => {
        const isVisible =
          getVisibilityState(driverId, watchList, filterList).visibleInMap &&
          moment(date).isSame(moment(), 'day');

        if (!isVisible) return;

        if (addedToWatch.includes(driverId)) {
          requestedRef.current.delete(driverId);
        }
        if (requestedRef.current.has(driverId)) return;
        requestedRef.current.add(driverId);

        const res = await getLastPositionByPhone(
          enterprise.enterprise_id,
          driverId
        );

        if (!isMounted.current || !res) return;

        Object.entries(res).forEach(([deviceId, lastPos]) => {
          trackDriver({
            enterprise: lastPos.enterprise_id,
            lng: lastPos.lon,
            lat: lastPos.lat,
            userId: lastPos.mobileUser_list.id,
            battery: lastPos.battery,
            deliveryId: lastPos.deliveryId,
            orderType: lastPos.orderType,
            provider: lastPos.provider,
            timestampUTC: lastPos.timestamp,
            deviceId,
          });
        });
      });
    };

    handleDriverTracking();

    return () => {
      isMounted.current = false;
    };
  }, [watchList, filterList, date, TIMESTAMPS, ROUTES, enterprise.enterprise_id]);

  // CLIENTS MARKERS: Renderizado reactivo con 2 capas de filtrado (drivers.watchList y deliveries.watchList)
  useEffect(() => {
    clientsMarkers();
  }, [clientsMarkers]);

  useEffect(() => {
    dispatch(setIsAnimating({ isAnimating: false, driverAnimated: null }));
    return () => {
      if (animationRef.current.isAnimating && animationRef.current.driverAnimated) {
        snakePolyLinesRef.current({
          id: animationRef.current.driverAnimated,
          target: driverElements,
          polylineMapRef: 'routePolyline',
          operation: 'stop',
        });
      }
      dispatch(setIsAnimating({ isAnimating: false, driverAnimated: null }));
    };
  }, []);

  useEffect(() => {
    const evtSource = new EventSource(`${BASE_URL}/notifications/deliveries/${enterprise.enterprise_id}`);
    setTimeout(() => {
      const onMessage = (event: MessageEvent) => {
        try {
          const data: ISSERoute | IConnectionStatus = JSON.parse(event.data);
          bufferRef.current.push(data);
        } catch {
          // Non-JSON SSE message ignored
        }
      };

      if (moment(date).isSame(moment(), 'day')) {
        evtSource.onmessage = onMessage;
      }
    }, 10000);

    return () => {
      evtSource.close();
      bufferRef.current = [];
    };

  }, [
    date,
    enterprise.enterprise_id,
  ]);

  // SSE BUFFER
  useEffect(() => {
    const interval = setInterval(() => {
      const buffer = bufferRef.current;

      if (buffer.length === 0 || animation.isAnimating) return;

      const batch = buffer.splice(0, MAX_BATCH_SIZE);

      batch.forEach((data) => {
        if ('status' in data && 'userId' in data) {
          // Connection status event ignored for drivers
        } else {
          const userId = Number(data.userId);
          const currentTimestamp = data.timestampUTC || (data as any).timestamp || moment().toISOString();
          const normalizedData = {
            ...data,
            userId,
            timestampUTC: currentTimestamp,
          };

          dispatch(addRoutePoint({
            id: userId,
            subId: data.deviceId,
            point: MqttToRoute(normalizedData),
          }));

          const isVisibleInMap = getVisibilityState(userId, watchList, filterList).visibleInMap;
          const isTrackPoint = data.orderType === -2 || data.orderType == null || data.orderType === undefined;

          if (isVisibleInMap && isTrackPoint) {
            trackDriver(normalizedData);

            const polylinesObj = driverElements.current?.[userId]?.routePolyline;
            let lastBatchKey: string | null = null;
            let lastBatchIdx = -1;
            let lastPolyline: any = null;

            if (polylinesObj) {
              const keys = Object.keys(polylinesObj).filter(k => k.toString().startsWith(`${data.deviceId}_`));
              const candidateKeys = keys.length > 0 ? keys : Object.keys(polylinesObj);

              if (candidateKeys.length > 0) {
                candidateKeys.forEach(k => {
                  const idxPart = k.toString().split('_').pop();
                  const idx = parseInt(idxPart || '-1', 10);
                  if (idx > lastBatchIdx) {
                    lastBatchIdx = idx;
                    lastBatchKey = k;
                    lastPolyline = polylinesObj[k];
                  }
                });
              }
            }

            if (lastPolyline && lastPolyline._timeStamps && lastPolyline._timeStamps.length > 0) {
              const lastTimestamp = lastPolyline._timeStamps[lastPolyline._timeStamps.length - 1];
              const diffMinutes = moment(currentTimestamp).diff(moment(lastTimestamp), 'minutes');

              if (diffMinutes > routeThreshold) {
                const lastLatLngs = lastPolyline.getLatLngs();
                const lastPoint = lastLatLngs[lastLatLngs.length - 1];
                const baseColor = driversUI[userId]?.color ?? indexToColor(userId);

                createPolyLine({
                  id: userId,
                  subId: `${data.deviceId}_${lastBatchIdx + 1}`,
                  timestamp: [lastTimestamp, currentTimestamp],
                  polylineMapRef: 'routePolyline',
                  operation: 'add',
                  points: [[lastPoint.lat, lastPoint.lng], [Number(data.lat), Number(data.lng)]],
                  target: driverElements,
                  options: {
                    color: baseColor,
                    weight: 4,
                    dashArray: '10, 15',
                    opacity: 0.4
                  }
                });

                createPolyLine({
                  id: userId,
                  subId: `${data.deviceId}_${lastBatchIdx + 2}`,
                  timestamp: [currentTimestamp],
                  polylineMapRef: 'routePolyline',
                  operation: 'add',
                  points: [[Number(data.lat), Number(data.lng)]],
                  target: driverElements,
                  options: {
                    color: baseColor,
                    weight: 4,
                  }
                });

              } else {
                createPolyLine({
                  id: userId,
                  subId: lastBatchKey!,
                  timestamp: [currentTimestamp],
                  polylineMapRef: 'routePolyline',
                  operation: 'extend',
                  points: [[Number(data.lat), Number(data.lng)]],
                  target: driverElements,
                  options: {}
                });
              }
            } else {
              createPolyLine({
                id: userId,
                subId: `${data.deviceId}_0`,
                timestamp: [currentTimestamp],
                polylineMapRef: 'routePolyline',
                operation: 'add',
                points: [[Number(data.lat), Number(data.lng)]],
                target: driverElements,
                options: {
                  color: driversUI[userId]?.color ?? indexToColor(userId),
                  weight: 4,
                }
              });
            }
          }
        }
      })

    }, BUFFER_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [
    watchList,
    filterList,
    animation.isAnimating,
    bufferRef,
    MAX_BATCH_SIZE,
    BUFFER_INTERVAL_MS,
    dispatch,
    trackDriver,
    createPolyLine,
    driverElements,
    MqttToRoute,
    addRoutePoint,
    driversUI,
    indexToColor,
  ]);

  return (
    <div className="w-full h-full">
      <CustomModal />
      <MapContainer context={mapContext} centerOnUserGps={true} autoResize={true} />
    </div>
  );
};

export default MapView;
