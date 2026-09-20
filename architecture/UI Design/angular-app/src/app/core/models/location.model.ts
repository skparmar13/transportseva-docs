export interface GeoLocation {
  label: string;
  city: string;
  state?: string;
  country: string;
  postcode?: string;
  latitude: number;
  longitude: number;
  source: 'OpenStreetMap';
  osmId?: string;
}
