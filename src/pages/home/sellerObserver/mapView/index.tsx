/**
 * @optimization-note
 * Posible mejora a futuro: Optimizar el renderizado de ClientTooltip eliminando `renderToString`
 * y migrando hacia React Portals montados bajo demanda cuando el tooltip se abre físicamente en el DOM (Opción A).
 */
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
import { getClientIcon, getIcon, getSellerIcon, getStartPointIcon, timeStampIcon } from '../../../../utils/helpers/orderIconPicker';
import TimeStampModal from '../../components/timeStampModal';
import { BASE_URL } from '../../../../utils/constants/url.constants';
import type { IOrder, ISSERoute, TNestedRoutes } from '../../../../utils/types/sellerObserver/sellers.types';
import type { IConnectionStatus } from '../../../../utils/types/sellerObserver/locations.types';
import moment, { type Moment } from 'moment';
import { addRoutePoint, changeFocus, isFocussed, setIsAnimating, setOnlineStatus } from '../../../../store/slices/sellerObserver/sellersSlice';
import { getLastPositionByPhone } from '../../../../services/locations.service';
import OrderModal from '../../components/orderModal';
import { useMapSellerObserverContext, useMenuRef, useModalRef, useModeRef, useRenderRef } from '../../../../utils/hooks/map/useContextRef';
import { lastPositionToRoute, MqttToRoute } from '../../../../utils/helpers/routeParser';
import useClientActions from '../../../../utils/hooks/map/useClientActions';
import ClientTooltip from '../../components/clientTooltip';
import { renderToString } from 'react-dom/server';
import { getClientType } from '../../../../utils/helpers/clientStatus';
import { formatMinutes } from '../../../../utils/helpers/formatters';
import { flattenIds, getIntersection, getVisibilityState } from '../../../../utils/helpers/visibility';
import GeoZoneMenu from '../../components/geozoneMenu';
import CustomMenu from '../../../../components/menu';
import TimeLine from '../../../../components/layouts/sellerObserverLayout/sidebar/components/sellers/components/timeLine';
import { useContextbarContext } from '../../../../utils/contexts/contextbar.context';
import type { IClient } from '../../../../utils/types/sellerObserver/clients.types';
import SellerModal from '../../components/sellerModal';
import { routeThreshold } from '../../../../utils/constants/config.constants';

const SellerObserver = () => {
  const { fitCoordinates } = useMapCore();
  const bufferRef = useRef<(ISSERoute | IConnectionStatus)[]>([]);
  //SSE Buffer
  const BUFFER_INTERVAL_MS = 5000;
  const MAX_BATCH_SIZE = 55;

  const dispatch = useAppDispatch();
  const { sellersUI, sellerRoutes, watchList, filterList, sellerOrders, sellers, animation, sellerGps, sellerById } = useAppSelector((state) => state.sellers);
  const { TIMESTAMPS, ORDERS, CLIENTS, GEO_ZONES, ROUTES } = useRenderRef();

  const requestedRef = useRef<Set<number>>(new Set());
  const prevWatchList = useRef<number[]>([]);
  const isMounted = useRef<boolean>(true);
  const sellerRoutesRef = useRef(sellerRoutes);
  sellerRoutesRef.current = sellerRoutes;

  const { clientsBySeller, clientsOrders } = useAppSelector((state) => state.clients);
  const { geozones, watchList: geoWatchList, filterList: geoFilterList } = useAppSelector((state) => state.geo)
  const { enterprise } = useAppSelector((state) => state.user);
  const { profile } = useAppSelector((state) => state.user);
  const { date } = useAppSelector((state) => state.sidebar)
  const mapContext = useMapSellerObserverContext();
  const { createPolyLine, resetPathElements, handleMarkers, handleTooltips, focusOnPolyLine, createPolygon, handleActions } = useCreatePath({ mapRef: mapContext.mapRef });

  const { mapInteractions } = useModeRef();
  const { OpenMenu } = useMenuRef();
  const { OpenModal } = useModalRef();
  const {
    sellerElements,
    historyElements,
    geozoneElements,
  } = mapContext;

  const { open, isOpen } = useContextbarContext();

  const { onClick, onLeftClick } = useClientActions();

  const trackSeller = (route: ISSERoute) => {
    handleMarkers({
      id: route.userId,
      pointData: {
        id: route.deviceId,
        coordinates: [Number(route.lat), Number(route.lng)],
      },
      clickAction: () => { OpenModal({ Component: SellerModal, props: { userId: route.userId } }) },
      hoverAction: ((isHover, e) => {
        const sellerName = sellerById[route.userId]?.sellerName ?? 'Unknow';
        const points = sellerRoutesRef.current.routes[route.userId]?.[route.deviceId];
        const lastTimestamp = points?.[points.length - 1]?.timestamp;
        const lastTime = lastTimestamp
          ? moment(lastTimestamp).format('HH:mm:ss')
          : null;
        handleTooltips({
          id: route.userId,
          subId: route.deviceId,
          latlng: e._latlng,
          operation: isHover ? 'move' : 'remove',
          tooltipMapRef: 'sellersTooltips',
          target: sellerElements,
          content: lastTime
            ? `<div>${sellerName}</div><div style="opacity:.75;font-size:11px">${lastTime}</div>`
            : sellerName,
        })
      }),
      Icon: {
        size: 53,
        iconUrl: getSellerIcon(route.userId, sellersUI[route.userId].color ?? indexToColor(route.userId)),
        zIndexOffset: 10000,
      },
      operation: 'move',
      markerMapRef: 'sellerTrackMarker',
      target: sellerElements
    })
  }

  // Map initialization, clean teardown, ResizeObserver, and GPS are handled by <MapContainer />


  const routesPolylines = useCallback((routes: TNestedRoutes) => {
    if (watchList.length <= 0) return;
    Object.entries(routes).forEach(([key, phones]) => {
      const keyNumber = Number(key);
      Object.entries(phones).forEach(([phoneId, value]) => {
        const shouldBeVisible = getVisibilityState(keyNumber, watchList, filterList).visibleInMap;

        const polylinesObj = sellerElements.current?.[keyNumber]?.routePolyline;
        const existingBatchKeys = polylinesObj ? Object.keys(polylinesObj).filter(k => k.toString().startsWith(`${phoneId}_`)) : [];
        const exists = existingBatchKeys.length > 0;

        if (!shouldBeVisible && !exists) return;

        const opp = getVisibilityState(keyNumber, watchList, filterList).visibleInMap ? 'add' : 'remove';
        const isFocus = isFocussed(keyNumber, watchList);
        const baseColor = sellersUI[keyNumber]?.color ?? indexToColor(keyNumber);

        if (opp === 'remove') {
          existingBatchKeys.forEach(batchKey => {
            createPolyLine({
              id: keyNumber,
              subId: batchKey,
              polylineMapRef: 'routePolyline',
              operation: 'remove',
              options: {},
              target: sellerElements,
              points: [],
            });
          });
          handleMarkers({
            id: keyNumber,
            pointData: { id: phoneId, coordinates: [0, 0] as any },
            Icon: {},
            operation: 'remove',
            markerMapRef: 'routeStartingPoint',
            target: sellerElements
          });
          return;
        }

        const batches = splitTrajectoryBatches(value, routeThreshold, -2);
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
            target: sellerElements,
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
                target: sellerElements,
                content: `#${keyNumber}`,
              })
            }),
            clickAction: (() => {
              dispatch(changeFocus(keyNumber));

              if (!isFocus && isOpen) {
                open(
                  <TimeLine
                    orders={sellerOrders.orders[keyNumber] ?? []}
                    clients={clientsBySeller[keyNumber] ?? []}
                    seller={keyNumber}
                    gps={sellerGps.gps[keyNumber] ?? []}
                    clientsBySeller={clientsBySeller}
                  />,
                  <h2 className="text-white">{sellerById[keyNumber].sellerName}<span className="text-secondary-light before:content-['#'] ml-2">{keyNumber}</span></h2>,
                  `timeline-${keyNumber}`
                )
              }

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
            target: sellerElements
          });
        }
      })
    })
  }, [
    watchList,
    filterList,
    sellersUI,
    sellerElements,
    createPolyLine,
    handleTooltips,
    handleMarkers,
    dispatch,
    isOpen,
    open,
    sellerOrders,
    clientsBySeller,
    sellerGps,
    sellerById,
    focusOnPolyLine,
  ]);

  const timeStamps = useCallback((routes: TNestedRoutes) => {
    Object.entries(routes).forEach(([key, phones]) => {
      Object.entries(phones).forEach(([_, phones]) => {
        const keyNumber = Number(key);
        phones.forEach((route, index) => {
          if (route.orderType !== -2) return;
          const parsedData: IMarkerCreationProps = {
            target: sellerElements,
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
    sellerElements,
    OpenModal,
    handleMarkers,
  ]);

  const ordersMarkers = useCallback((orders: { [key: number]: IOrder[] }) => {
    Object.entries(orders).forEach(([key, value]) => {
      value.forEach((order) => {
        const keyNumber = Number(key);

        const orderClientRoute = [
          [Number(order.closed_lat), Number(order.closed_long)],
          [Number(order.clientData.location?.latitude), Number(order.clientData.location?.longitude)]
        ]

        const parsedData: IMarkerCreationProps = {
          target: sellerElements,
          id: keyNumber,
          pointData: {
            id: order.uuid,
            coordinates: [Number(order.closed_lat), Number(order.closed_long)]
          },
          clickAction: () => {
            OpenModal({ Component: OrderModal, props: { ...order } })
          },
          hoverAction: (operation: boolean) => {
            if (order.clientData.location) {
              createPolyLine({
                id: keyNumber,
                points: orderClientRoute as [number, number][],
                options: { color: '#de7d45', weight: 3, dashArray: '2, 5' },
                operation: operation ? 'add' : 'remove',
                target: sellerElements,
                polylineMapRef: 'orderToClientPolyline'
              })
            }
          },
          Icon: {
            iconUrl: getIcon(order.noSaleReasonId)
          },
          operation: getVisibilityState(keyNumber, watchList, filterList).visibleInMap ? 'add' : 'remove',
          markerMapRef: 'ordersMarkers'
        }
        handleMarkers(parsedData)
      })
    })
  }, [
    watchList,
    filterList,
    createPolyLine,
    getIcon,
    OpenModal,
    OrderModal,
    sellerElements,
    handleMarkers,
  ])


  const itsHappendOnVisitTime = ({
    orderCreation, orderClose, visitStart, visitEnd
  }: {
    orderCreation: Moment,
    orderClose: Moment,
    visitStart: Moment,
    visitEnd: Moment
  }) => {
    if (
      orderCreation.isBetween(visitStart, visitEnd, undefined, '(]') ||
      orderClose.isBetween(visitStart, visitEnd, undefined, '[]')
    ) return true
    else if (
      visitStart.isBetween(orderCreation, orderClose, undefined, '(]') ||
      visitEnd.isBetween(orderCreation, orderClose, undefined, '[]')
    ) return true
    else return false
  }

  const getOrderCoords = ({ client, order }: { client: IClient, order: IOrder }) => {
    if (client.visited) {

      const hasVisit = client.visits.some(({ start, end }) => itsHappendOnVisitTime(
        {
          orderCreation: moment(order.t_created).utc(),
          orderClose: moment(order.t_closed).utc(),
          visitStart: moment.utc(start).utc(),
          visitEnd: moment.utc(end).utc()
        }
      ))
      if (hasVisit) {
        return [Number(client.location.latitude), Number(client.location.longitude)];
      } else {
        return [Number(order.open_lat), Number(order.open_long)];
      }
    } else {
      return [Number(order.open_lat), Number(order.open_long)];
    }
  }

  const clientsMarkers = useCallback(() => {
    Object.entries(clientsBySeller).forEach(([key, value]) => {
      value.forEach((client) => {
        if (!client.location) return
        const keyNumber = Number(key);
        const sellerColor = sellersUI[keyNumber]?.color ?? indexToColor(keyNumber);
        const clientCode = Number(client.code);

        const clOrders = clientsOrders.orders?.[clientCode] ?? [];
        const clFirstOrder = clOrders?.[0];

        let polylines: any[] = [];

        if (clientsOrders.orders[clientCode]) {
          polylines = clientsOrders.orders[clientCode].map((order) => {
            const coords = getOrderCoords({ client, order });

            return ({
              route: [[Number(client.location.latitude), Number(client.location.longitude)], coords],
              id: order.uuid,
              order: order,
              orderPoint: coords,
              noSaleReason: order.noSaleReasonId,
            })
          })
        }
        const isFocus = isFocussed(keyNumber, watchList);

        const parsedData: IMarkerCreationProps = {
          target: sellerElements,
          id: keyNumber,
          pointData: {
            id: client.code,
            coordinates: [Number(client.location.latitude), Number(client.location.longitude)]
          },
          clickAction: () => onClick(getClientType(client), { polylines, keyNumber, client }),
          leftClickAction: () => onLeftClick(getClientType(client), { polylines, keyNumber, client }),
          hoverAction: ((isHover, e) => {
            const currentContent = isHover
              ? renderToString(
                <ClientTooltip
                  seller={sellers.find((sl) => sl.seller === keyNumber) ?? null}
                  client={client}
                  orders={clientsOrders.orders[Number(client.code)]}
                />
              )
              : '';
            handleTooltips({
              id: client.code,
              latlng: e._latlng,
              operation: isHover ? 'move' : 'remove',
              tooltipMapRef: 'sellPointTooltips',
              target: sellerElements,
              content: currentContent,
            })
          }),
          Icon: {
            size: isFocus ? 65 : 16,
            iconUrl: getClientIcon(
              getClientType(client),
              (clFirstOrder ? moment(clFirstOrder.t_created).format('HH:mm:ss') : '-:-:-'),
              formatMinutes(client.totalMinutes),
              isFocus,
              sellerColor
            ),
          },
          operation: getVisibilityState(keyNumber, watchList, filterList).visibleInMap ? (isFocus ? 'redraw' : 'add') : 'remove',
          markerMapRef: 'sellPointMarkers',
        }
        handleMarkers(parsedData)
      })
    })
  }, [
    clientsBySeller,
    clientsOrders,
    filterList,
    watchList,
    sellersUI,
    getClientIcon,
    handleMarkers,
    handleTooltips,
    onClick,
    onLeftClick,
    sellers,
    sellerElements,
  ]);


  const geozonesPolygons = useCallback(() => {
    geozones.forEach((geo) => createPolygon({
      id: geo.id,
      polygonMapRef: 'geozonePolygon',
      operation: getVisibilityState(geo.id, geoWatchList, geoFilterList).visibleInMap ? 'add' : 'remove',
      options: { color: geo.color, fillOpacity: 0.35 },
      points: geo.coordinates as [number, number][],
      target: geozoneElements,
      tooltipLabel: geo.name,
      leftClickAction: (e) => {
        OpenMenu({ Component: GeoZoneMenu, props: { x: e.originalEvent.x, y: e.originalEvent.y, geozone: geo } })
      },
      isDraggeable: true,
    }))

  }, [geoWatchList, geoFilterList, geozones, createPolygon, profile])

  // Actions handlers 

  useEffect(() => {
    handleActions(historyElements);
    handleActions(sellerElements);
    handleActions(geozoneElements);
  }, [mapInteractions]);

  // Geo zones

  useEffect(() => {
    resetPathElements(geozoneElements);
    if (GEO_ZONES) {
      geozonesPolygons();
    } else resetPathElements(geozoneElements);
  }, [geoWatchList, geoFilterList, geozones, GEO_ZONES, profile])

  // Sellers polylines and orders markers initialization.

  useEffect(() => {
    if (!enterprise.enterprise_id) return
    resetPathElements(sellerElements);
  }, [enterprise.enterprise_id, date]);


  useEffect(() => {
    isMounted.current = true; // Reinicia correctamente

    if (!enterprise.enterprise_id) return
    resetPathElements(sellerElements, getIntersection(watchList, filterList));

    if (ROUTES) {
      const routes = sellerRoutes.routes;
      routesPolylines(routes);
    } else {
      resetPathElements(sellerElements)
    }

    // TIMESTAMPS
    if (TIMESTAMPS) {
      const routes = sellerRoutes.routes;
      timeStamps(routes);
    }

    // ORDERS
    if (ORDERS) {
      const orders = sellerOrders.orders;
      ordersMarkers(orders);
    }

    // CLIENTS
    if (CLIENTS) {
      clientsMarkers();
    }

    const addedToWatch = getIntersection(watchList, filterList).filter(
      (id) => !prevWatchList.current.includes(id)
    );
    const removedFromWatch = prevWatchList.current.filter(
      (id) => !getIntersection(watchList, filterList).includes(id)
    );

    removedFromWatch.forEach((id) => requestedRef.current.delete(id));
    prevWatchList.current = flattenIds(watchList, filterList);

    const handleSellerTracking = async () => {
      flattenIds(watchList, filterList).map(async (sellerId: number) => {

        const isVisible =
          getVisibilityState(sellerId, watchList, filterList).visibleInMap &&
          moment(date).isSame(moment(), "day");

        if (!isVisible) return;

        if (addedToWatch.includes(sellerId)) {
          requestedRef.current.delete(sellerId);
        }
        if (requestedRef.current.has(sellerId)) return;
        requestedRef.current.add(sellerId);

        const res = await getLastPositionByPhone(
          enterprise.enterprise_id,
          sellerId
        );

        if (!isMounted.current || !res) return;

        Object.entries(res).forEach(([deviceId, lastPos]) => {
          const userId = lastPos.mobileUser_list.id;
          const existing = sellerRoutesRef.current.routes[userId]?.[deviceId];
          const lastExistingTs = existing?.[existing.length - 1]?.timestamp;

          if (!lastExistingTs || moment(lastPos.timestamp).isAfter(moment(lastExistingTs))) {
            dispatch(addRoutePoint({
              id: userId,
              subId: deviceId,
              point: lastPositionToRoute(lastPos, userId),
            }));
          }

          trackSeller({
            enterprise: lastPos.enterprise_id,
            lng: lastPos.lon,
            lat: lastPos.lat,
            userId,
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

    handleSellerTracking();

    return () => {
      isMounted.current = false;
    };
  }, [sellerOrders, clientsBySeller, watchList, filterList, date, TIMESTAMPS, ORDERS, CLIENTS, ROUTES]);

  useEffect(() => {
    dispatch(setIsAnimating({ isAnimating: false, sellerAnimated: null }))
  }, [])

  useEffect(() => {
    const evtSource = new EventSource(`${BASE_URL}/notifications/${enterprise.enterprise_id}`);
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
          dispatch(setOnlineStatus({ sellerId: data.userId, status: data.status }))
        } else {
          const timestampUTC =
            data.timestampUTC || (data as { timestamp?: string }).timestamp || moment().toISOString();
          const normalizedData = { ...data, timestampUTC };

          dispatch(addRoutePoint({
            id: data.userId,
            subId: data.deviceId,
            point: MqttToRoute(normalizedData),
          }));

          if (getVisibilityState(data.userId, watchList, filterList).visibleInMap && data.orderType === -2) {
            trackSeller(normalizedData);

            const polylinesObj = sellerElements.current?.[data.userId]?.routePolyline;
            let lastBatchKey: string | null = null;
            let lastBatchIdx = -1;
            let lastPolyline: any = null;

            if (polylinesObj) {
              const keys = Object.keys(polylinesObj).filter(k => k.toString().startsWith(`${data.deviceId}_`));
              if (keys.length > 0) {
                keys.forEach(k => {
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
              const diffMinutes = moment(timestampUTC).diff(moment(lastTimestamp), 'minutes');

              if (diffMinutes > routeThreshold) {
                const lastLatLngs = lastPolyline.getLatLngs();
                const lastPoint = lastLatLngs[lastLatLngs.length - 1];
                const baseColor = sellersUI[data.userId]?.color ?? indexToColor(data.userId);

                createPolyLine({
                  id: data.userId,
                  subId: `${data.deviceId}_${lastBatchIdx + 1}`,
                  timestamp: [lastTimestamp, timestampUTC],
                  polylineMapRef: 'routePolyline',
                  operation: 'add',
                  points: [[lastPoint.lat, lastPoint.lng], [Number(data.lat), Number(data.lng)]],
                  target: sellerElements,
                  options: {
                    color: baseColor,
                    weight: 4,
                    dashArray: '10, 15',
                    opacity: 0.4
                  }
                });

                createPolyLine({
                  id: data.userId,
                  subId: `${data.deviceId}_${lastBatchIdx + 2}`,
                  timestamp: [timestampUTC],
                  polylineMapRef: 'routePolyline',
                  operation: 'add',
                  points: [[Number(data.lat), Number(data.lng)]],
                  target: sellerElements,
                  options: {
                    color: baseColor,
                    weight: 4,
                  }
                });

              } else {
                createPolyLine({
                  id: data.userId,
                  subId: lastBatchKey!,
                  timestamp: [timestampUTC],
                  polylineMapRef: 'routePolyline',
                  operation: 'extend',
                  points: [[Number(data.lat), Number(data.lng)]],
                  target: sellerElements,
                  options: {}
                });
              }
            } else {
              createPolyLine({
                id: data.userId,
                subId: `${data.deviceId}_0`,
                timestamp: [timestampUTC],
                polylineMapRef: 'routePolyline',
                operation: 'add',
                points: [[Number(data.lat), Number(data.lng)]],
                target: sellerElements,
                options: {
                  color: sellersUI[data.userId]?.color ?? indexToColor(data.userId),
                  weight: 4,
                }
              });
            }
          };
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
    trackSeller,
    createPolyLine,
    sellerElements,
    MqttToRoute,
    setOnlineStatus,
    addRoutePoint,
    sellersUI,
    indexToColor,
  ]);

  return (
    <div className="w-full h-full">
      <CustomModal />
      <CustomMenu />
      <MapContainer context={mapContext} centerOnUserGps={true} autoResize={true} />
    </div>
  );
};

export default SellerObserver;
