import mapboxgl from 'mapbox-gl';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

class Map {
    private static maptoken: string = import.meta.env.VITE_MAPBOX_TOKEN;
    private static map: mapboxgl.Map;
    private static locationStatus: boolean = false;

    private constructor() {}

    static async create() {
        mapboxgl.accessToken = Map.maptoken;
        setTimeout(() => {
            Map.map = new mapboxgl.Map({
                container: 'mappa',
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [12.5451, 41.8988],
                zoom: 1
            });
        });
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
            const permission = await navigator.permissions.query({ name: 'geolocation' });
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
                        const { latitude, longitude } = position.coords;
                        resolve([longitude, latitude]);
                    },
                    (error) => {
                        console.error('Errore geolocalizzazione (PWA):', error);
                        resolve(null);
                    },
                    { enableHighAccuracy: true, timeout: 5000 }
                );
            });
        }
    }

    static async moveToUserLocation() {
        const userLocation = await Map.getUserLocation();
        if (userLocation) {
            Map.map.flyTo({
                center: userLocation,
                zoom: 10,
                essential: true // Questo assicura che l'animazione sia sempre eseguita
            });

            // CUSTOM MARKER
            const MarkerUtente = document.createElement('div');
            MarkerUtente.style.width = '24px';
            MarkerUtente.style.height = '24px';
            MarkerUtente.style.background = '#2196f3';
            MarkerUtente.style.borderRadius = '50%';
            MarkerUtente.style.border = '2px solid white';
            MarkerUtente.style.boxShadow = '0 0 4px rgba(0,0,0,0.3)';
            new mapboxgl.Marker({ element: MarkerUtente })
                .setLngLat(userLocation)
                .addTo(Map.map);
            console.log(Map.locationStatus);

        } else {
            console.warn('Impossibile ottenere la posizione dell\'utente.');
        }

    }
}

export default Map;