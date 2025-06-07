import mapboxgl from 'mapbox-gl';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import API from "@/utils/API";
import * as turf from '@turf/turf';


class Mappa {
    private static maptoken: string = import.meta.env.VITE_MAPBOX_TOKEN;
    private static maps = new Map(); // Mappa per gestire più mappe se necessario
    private static locationStatus: boolean = false;
    static positionMarker: Map<string, mapboxgl.Marker> = new Map(); // Marker blu dell'utente
    private static watchId: string | null = null;
    static selectedMarker: Map<string, mapboxgl.Marker> = new Map(); // Marker rosso selezionato
    static puntiDiInteresse: any[] = []; // Array per i punti di interesse
    static puntiDiInteresseMarkers: Map<string, mapboxgl.Marker[]> = new Map(); // Array per i marker dei punti di interesse


    static async create(mapId: string, mapElement: string, center: [number, number] = [12.5451, 41.8988]) {
        if (!document.getElementById(mapElement)) {
            console.error('Errore: Container con ID "mappa" non trovato.');
            return;
        }

        mapboxgl.accessToken = Mappa.maptoken;
        setTimeout(() => {
            Mappa.maps.set(mapId, new mapboxgl.Map({
                container: mapElement,
                style: 'mapbox://styles/mapbox/streets-v12',
                center, // Usa il centro definito come parametro o il centro preimpostato
                zoom: 1 // Zoom iniziale
            }));
        });
        Mappa.puntiDiInteresse = await API.getPuntiDiInteresse()
        console.log('Punti di interesse caricati:', Mappa.puntiDiInteresse);
    }

    static getMap(mapId: string): mapboxgl.Map {
        return Mappa.maps.get(mapId);
    }

    static async checkGeolocationPermission(): Promise<boolean> {
        const platform = Capacitor.getPlatform();
        if (platform === 'android' || platform === 'ios') { // Check se la piattaforma è Android o iOS
            try {
                const permStatus = await Geolocation.checkPermissions();
                Mappa.locationStatus = permStatus.location === 'granted' || permStatus.coarseLocation === 'granted'
                return Mappa.locationStatus;
            } catch (error) {
                console.warn('Errore controllo permessi (Capacitor):', error);
                return false;
            }
        } else { // PWA
            if (!navigator.permissions) {
                console.warn('Permissions API non supportata.');
                return false;
            }
            const permission = await navigator.permissions.query({name: 'geolocation'});
            if (permission.state === 'prompt') {
                // Forza la richiesta del permesso
                return new Promise((resolve) => {
                    navigator.geolocation.getCurrentPosition(
                        () => resolve(true),
                        () => resolve(false)
                    );
                });
            }

            Mappa.locationStatus = permission.state === 'granted';
            return Mappa.locationStatus;
        }
    }

    static async getUserLocation(): Promise<[number, number] | null> {
        const platform = Capacitor.getPlatform();
        if (platform === 'android' || platform === 'ios') { // Check se la piattaforma è Android o iOS
            try {
                await Geolocation.requestPermissions();
                const position = await Geolocation.getCurrentPosition();
                return [position.coords.longitude, position.coords.latitude];
            } catch (error) {
                console.error('Errore geolocalizzazione (Capacitor):', error);
                return null;
            }
        } else {
            return new Promise((resolve) => { // PWA
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const {latitude, longitude} = position.coords;
                        resolve([longitude, latitude]);
                    },
                    (error) => {
                        console.error('Errore geolocalizzazione (PWA):', error);
                        resolve(null);
                    },
                    {enableHighAccuracy: true, timeout: 5000}
                );
            });
        }
    }

    static async addUserLocationMarker(mapId: string, position: [number, number]) {
        if (!Mappa.maps.get(mapId)) return;

        if (Mappa.positionMarker.get(mapId) !== undefined) {
            Mappa.positionMarker.get(mapId).setLngLat(position); // Sposta il marker blu
        } else {
            // CUSTOM MARKER
            const MarkerUtente = document.createElement('div');
            MarkerUtente.style.width = '24px';
            MarkerUtente.style.height = '24px';
            MarkerUtente.style.background = '#2196f3';
            MarkerUtente.style.borderRadius = '50%';
            MarkerUtente.style.border = '2px solid white';
            MarkerUtente.style.boxShadow = '0 0 4px rgba(0,0,0,0.3)';
            if (position) {
                Mappa.positionMarker.set(mapId, new mapboxgl.Marker({element: MarkerUtente})
                    .setLngLat(position)
                    .addTo(Mappa.maps.get(mapId)));
            }
        }
    }

    static async addSelectedMarker(mapId: string, position: [number, number]) {
        // Rimuove l'ultimo marker selezionato
        if (Mappa.selectedMarker.get(mapId) !== undefined) {
            Mappa.selectedMarker.get(mapId).remove();
        }
        // Crea un marker rosso (per la posizione selezionata cliccando sulla mappa)
        const MarkerSelezionato = document.createElement('div');
        MarkerSelezionato.style.width = '24px';
        MarkerSelezionato.style.height = '24px';
        MarkerSelezionato.style.background = '#ff0000'; // Marker rosso
        MarkerSelezionato.style.borderRadius = '50%';
        MarkerSelezionato.style.border = '2px solid white';
        Mappa.selectedMarker.set(mapId, new mapboxgl.Marker({element: MarkerSelezionato})
            .setLngLat(position)
            .addTo(Mappa.maps.get(mapId)));
    }

    static async updateUserLocationMarker(mapId: string, userLocation: [number, number] | null) {
        if (userLocation && Mappa.positionMarker.has(mapId)) {
            Mappa.positionMarker.get(mapId).setLngLat(userLocation);
        } else {
            console.warn('Impossibile ottenere la posizione dell\'utente.');
        }
    }

    static async startWatchingUserLocation(mapId: string) {
        const platform = Capacitor.getPlatform();
        if (platform === 'android' || platform === 'ios') { // Check se la piattaforma è Android o iOS
            try {
                if (Mappa.locationStatus) {
                    Mappa.watchId = await Geolocation.watchPosition({}, (position, err) => {
                        if (err) {
                            console.error('Errore durante il controllo della posizione (Capacitor):', err);
                            return;
                        }
                        if (!position || !position.coords) {
                            console.warn('Posizione non disponibile (Capacitor)');
                            return;
                        }
                        const userLocation: [number, number] = [position.coords.longitude, position.coords.latitude];
                        Mappa.updateUserLocationMarker(mapId, userLocation);
                    })
                }
            } catch (error) {
                console.error('Errore geolocalizzazione (Capacitor):', error);
                return null;
            }
        } else {
            return new Promise((resolve) => { // PWA
                navigator.geolocation.watchPosition(
                    (position) => {
                        const {latitude, longitude} = position.coords;
                        const userLocation: [number, number] = [longitude, latitude];
                        Mappa.updateUserLocationMarker(mapId, userLocation);
                    },
                    (error) => {
                        console.error('Errore geolocalizzazione (PWA):', error);
                        resolve(null);
                    },
                    {enableHighAccuracy: true, timeout: 5000}
                );
            });
        }
    }

    static async moveToUserLocation(mapId: string) {
        const userLocation = await Mappa.getUserLocation();
        if (userLocation) {
            this.maps.get(mapId).flyTo({
                center: userLocation,
                zoom: 10,
                essential: true // Questo assicura che l'animazione sia sempre eseguita
            });
            await Mappa.addUserLocationMarker(mapId, userLocation);
        } else {
            console.warn('Impossibile ottenere la posizione dell\'utente.');
        }

    }

    static async insertPuntiDiInteresse(mapId: string, onMarkerClick?: (punto: any) => void) {
        Mappa.puntiDiInteresse.forEach(punto => {
            const marker = new mapboxgl.Marker()
                .setLngLat([punto.posizione[0], punto.posizione[1]])
                .addTo(Mappa.maps.get(mapId));
            if ( !(Mappa.puntiDiInteresseMarkers.has(mapId) || Mappa.puntiDiInteresseMarkers.get(mapId) !== undefined)) {
                Mappa.puntiDiInteresseMarkers.set(mapId, []);
            }
            Mappa.puntiDiInteresseMarkers.get(mapId).push(marker);

            marker.getElement().addEventListener('click', () => {
                if (onMarkerClick) {
                    onMarkerClick(punto);
                }
            });
        })
    }

    static async returnDistanceBetweenUserAndMarker(position: [number, number]): Promise<string> {
        const userLocation = await this.getUserLocation();
        if (!userLocation) return "errore";

        // Crea punti turf (nota: turf usa [lng, lat] mentre le coordinate standard sono [lat, lng])
        const userPoint = turf.point([userLocation[1], userLocation[0]]);
        const markerPoint = turf.point([position[1], position[0]]);

        // Calcola la distanza in metri
        return `${turf.distance(userPoint, markerPoint, {units: 'kilometers'}).toFixed(2)} km`;
    }
    static addTappeMarkers(mapId: string, tappe: Array<{ posizione: [number, number], numero: number }>) {
        if (!Mappa.maps.get(mapId)) return;
        tappe.forEach((tappa, index) => {
            const markerDiv = document.createElement('div');
            markerDiv.style.width = '28px';
            markerDiv.style.height = '28px';
            markerDiv.style.background = '#4caf50';
            markerDiv.style.borderRadius = '50%';
            markerDiv.style.border = '2px solid white';
            markerDiv.style.display = 'flex';
            markerDiv.style.alignItems = 'center';
            markerDiv.style.justifyContent = 'center';
            markerDiv.style.fontWeight = 'bold';
            markerDiv.style.color = 'white';
            markerDiv.style.fontSize = '16px';
            markerDiv.innerText = index+1;

            new mapboxgl.Marker({ element: markerDiv })
                .setLngLat(tappa.posizione)
                .addTo(Mappa.maps.get(mapId));
        });
    }
}

export default Mappa;