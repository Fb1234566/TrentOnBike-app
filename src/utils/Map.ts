import mapboxgl from 'mapbox-gl';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import API from "@/utils/API";
import * as turf from '@turf/turf';


class Map {
    private static maptoken: string = import.meta.env.VITE_MAPBOX_TOKEN;
    private static map: mapboxgl.Map;
    private static locationStatus: boolean = false;
    private static positionMarker: mapboxgl.Marker; // Marker blu dell'utente
    private static watchId: string | null = null;
    static selectedMarker: mapboxgl.Marker | null = null; // Marker rosso selezionato
    static puntiDiInteresse: any[] = []; // Array per i punti di interesse
    static puntiDiInteresseMarkers: mapboxgl.Marker[] = []; // Array per i marker dei punti di interesse


    static async create(center: [number, number] = [12.5451, 41.8988]) {
        if (!document.getElementById('mappa')) {
            console.error('Errore: Container con ID "mappa" non trovato.');
            return;
        }

        mapboxgl.accessToken = Map.maptoken;
        setTimeout(() => {
            Map.map = new mapboxgl.Map({
                container: 'mappa',
                style: 'mapbox://styles/mapbox/streets-v12',
                center, // Usa il centro definito come parametro o il centro preimpostato
                zoom: 1 // Zoom iniziale
            });
        });
        Map.puntiDiInteresse = await API.getPuntiDiInteresse()
        console.log('Punti di interesse caricati:', Map.puntiDiInteresse);
    }

    static getMap(): mapboxgl.Map {
        return Map.map;
    }

    static async checkGeolocationPermission(): Promise<boolean> {
        const platform = Capacitor.getPlatform();
        if (platform === 'android' || platform === 'ios') { // Check se la piattaforma è Android o iOS
            try {
                const permStatus = await Geolocation.checkPermissions();
                Map.locationStatus = permStatus.location === 'granted' || permStatus.coarseLocation === 'granted'
                return Map.locationStatus;
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

            Map.locationStatus = permission.state === 'granted';
            return Map.locationStatus;
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

    static async addUserLocationMarker(position: [number, number]) {
        if (!Map.map) return;

        if (Map.positionMarker) {
            Map.positionMarker.setLngLat(position); // Sposta il marker blu
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
                Map.positionMarker = new mapboxgl.Marker({element: MarkerUtente})
                    .setLngLat(position)
                    .addTo(Map.map);
            }
        }
    }

    static async addSelectedMarker(position: [number, number]) {
        // Rimuove l'ultimo marker selezionato
        if (Map.selectedMarker) {
            Map.selectedMarker.remove();
        }
        // Crea un marker rosso (per la posizione selezionata cliccando sulla mappa)
        const MarkerSelezionato = document.createElement('div');
        MarkerSelezionato.style.width = '24px';
        MarkerSelezionato.style.height = '24px';
        MarkerSelezionato.style.background = '#ff0000'; // Marker rosso
        MarkerSelezionato.style.borderRadius = '50%';
        MarkerSelezionato.style.border = '2px solid white';
        Map.selectedMarker = new mapboxgl.Marker({element: MarkerSelezionato})
            .setLngLat(position)
            .addTo(Map.map);
    }

    static async updateUserLocationMarker(userLocation: [number, number] | null) {
        if (userLocation) {
            Map.positionMarker.setLngLat(userLocation);
        } else {
            console.warn('Impossibile ottenere la posizione dell\'utente.');
        }
    }

    static async startWatchingUserLocation() {
        const platform = Capacitor.getPlatform();
        if (platform === 'android' || platform === 'ios') { // Check se la piattaforma è Android o iOS
            try {
                if (Map.locationStatus) {
                    Map.watchId = await Geolocation.watchPosition({}, (position, err) => {
                        if (err) {
                            console.error('Errore durante il controllo della posizione (Capacitor):', err);
                            return;
                        }
                        if (!position || !position.coords) {
                            console.warn('Posizione non disponibile (Capacitor)');
                            return;
                        }
                        const userLocation: [number, number] = [position.coords.longitude, position.coords.latitude];
                        Map.updateUserLocationMarker(userLocation);
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
                        Map.updateUserLocationMarker(userLocation);
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

    static async moveToUserLocation() {
        const userLocation = await Map.getUserLocation();
        if (userLocation) {
            this.map.flyTo({
                center: userLocation,
                zoom: 10,
                essential: true // Questo assicura che l'animazione sia sempre eseguita
            });
            await Map.addUserLocationMarker(userLocation);
        } else {
            console.warn('Impossibile ottenere la posizione dell\'utente.');
        }

    }

    static async insertPuntiDiInteresse(onMarkerClick?: (punto: any) => void) {
        Map.puntiDiInteresse.forEach(punto => {
            const marker = new mapboxgl.Marker()
                .setLngLat([punto.posizione[0], punto.posizione[1]])
                .addTo(Map.map);
            Map.puntiDiInteresseMarkers.push(marker);
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
}

export default Map;