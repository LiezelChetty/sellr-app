import {
  COUNTRIES,
  formatApproximateLocation,
  getCities,
  LOCATION_CONFIG,
} from "../config/regions";
import { CountryCode } from "../types/domain";

export interface LocationProvider {
  getCountries(): typeof COUNTRIES;
  getCountry(country: CountryCode): (typeof LOCATION_CONFIG)[CountryCode];
  getCities(country: CountryCode, region: string): string[];
  format(country: CountryCode, region: string, town: string): string;
}

class ConfigLocationProvider implements LocationProvider {
  getCountries() {
    return COUNTRIES;
  }
  getCountry(country: CountryCode) {
    return LOCATION_CONFIG[country];
  }
  getCities(country: CountryCode, region: string) {
    return getCities(country, region);
  }
  format(country: CountryCode, region: string, town: string) {
    return formatApproximateLocation(country, region, town);
  }
}

export const locationProvider: LocationProvider = new ConfigLocationProvider();
