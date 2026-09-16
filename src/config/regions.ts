import { CountryCode } from "../types/domain";

export interface LocationRegion {
  name: string;
  cities: string[];
  publicRegion?: string;
}
export interface CountryLocationConfig {
  name: string;
  currency: string;
  symbol: string;
  regionLabel: string;
  cityLabel: string;
  regions: LocationRegion[];
}
const r = (
  name: string,
  cities: string[],
  publicRegion?: string,
): LocationRegion => ({ name, cities, publicRegion });

const ireland = [
  r("Waterford", ["Waterford City", "Dungarvan", "Tramore"]),
  r("Dublin", ["Dublin", "Swords", "Tallaght"]),
  r("Cork", ["Cork City", "Cobh", "Mallow"]),
  r("Galway", ["Galway City", "Tuam", "Ballinasloe"]),
  r("Wexford", ["Wexford Town", "Gorey", "Enniscorthy"]),
  r("Kilkenny", ["Kilkenny City", "Thomastown"]),
  r("Tipperary", ["Clonmel", "Nenagh", "Thurles"]),
  r("Limerick", ["Limerick City", "Newcastle West"]),
  r("Kerry", ["Tralee", "Killarney"]),
  r("Clare", ["Ennis", "Shannon"]),
  r("Mayo", ["Castlebar", "Ballina"]),
  r("Donegal", ["Letterkenny", "Donegal Town"]),
  r("Meath", ["Navan", "Ashbourne"]),
  r("Kildare", ["Naas", "Newbridge"]),
  r("Wicklow", ["Bray", "Wicklow Town"]),
  r("Louth", ["Drogheda", "Dundalk"]),
  r("Westmeath", ["Athlone", "Mullingar"]),
  r("Laois", ["Portlaoise"]),
  r("Offaly", ["Tullamore"]),
  r("Carlow", ["Carlow Town"]),
  r("Cavan", ["Cavan Town"]),
  r("Monaghan", ["Monaghan Town"]),
  r("Longford", ["Longford Town"]),
  r("Leitrim", ["Carrick-on-Shannon"]),
  r("Roscommon", ["Roscommon Town"]),
  r("Sligo", ["Sligo Town"]),
];
const uk = [
  r("Greater London", ["London"], "England"),
  r("West Midlands", ["Birmingham", "Coventry", "Wolverhampton"], "England"),
  r("Greater Manchester", ["Manchester", "Bolton", "Salford"], "England"),
  r("Merseyside", ["Liverpool", "Birkenhead"], "England"),
  r("West Yorkshire", ["Leeds", "Bradford", "Wakefield"], "England"),
  r("South Yorkshire", ["Sheffield", "Doncaster"], "England"),
  r("Tyne and Wear", ["Newcastle upon Tyne", "Sunderland"], "England"),
  r("South West England", ["Bristol", "Plymouth", "Exeter"], "England"),
  r(
    "South East England",
    ["Brighton", "Southampton", "Oxford", "Reading"],
    "England",
  ),
  r("East Midlands", ["Nottingham", "Leicester", "Derby"], "England"),
  r("East of England", ["Cambridge", "Norwich", "Luton"], "England"),
  r("Scotland", ["Glasgow", "Edinburgh", "Aberdeen", "Dundee"]),
  r("Wales", ["Cardiff", "Swansea", "Newport"]),
  r("Northern Ireland", ["Belfast", "Derry / Londonderry", "Lisburn"]),
];
const southAfrica = [
  r("Eastern Cape", ["Gqeberha", "East London", "Mthatha"]),
  r("Free State", ["Bloemfontein", "Welkom"]),
  r("Gauteng", ["Johannesburg", "Pretoria", "Soweto", "Centurion"]),
  r("KwaZulu-Natal", ["Durban", "Pietermaritzburg", "Richards Bay"]),
  r("Limpopo", ["Polokwane", "Tzaneen"]),
  r("Mpumalanga", ["Mbombela", "Emalahleni"]),
  r("Northern Cape", ["Kimberley", "Upington"]),
  r("North West", ["Mahikeng", "Rustenburg", "Klerksdorp"]),
  r("Western Cape", ["Cape Town", "Stellenbosch", "George", "Paarl"]),
];
const us = [
  r("Alabama", ["Birmingham", "Montgomery", "Mobile"]),
  r("Alaska", ["Anchorage", "Fairbanks"]),
  r("Arizona", ["Phoenix", "Tucson", "Mesa"]),
  r("Arkansas", ["Little Rock", "Fayetteville"]),
  r("California", ["Los Angeles", "San Diego", "San Francisco", "Sacramento"]),
  r("Colorado", ["Denver", "Colorado Springs", "Boulder"]),
  r("Connecticut", ["Bridgeport", "New Haven", "Hartford"]),
  r("Delaware", ["Wilmington", "Dover"]),
  r("Florida", ["Miami", "Orlando", "Tampa", "Jacksonville"]),
  r("Georgia", ["Atlanta", "Savannah", "Augusta"]),
  r("Hawaii", ["Honolulu", "Hilo"]),
  r("Idaho", ["Boise", "Idaho Falls"]),
  r("Illinois", ["Chicago", "Springfield", "Peoria"]),
  r("Indiana", ["Indianapolis", "Fort Wayne"]),
  r("Iowa", ["Des Moines", "Cedar Rapids"]),
  r("Kansas", ["Wichita", "Topeka"]),
  r("Kentucky", ["Louisville", "Lexington"]),
  r("Louisiana", ["New Orleans", "Baton Rouge", "Shreveport"]),
  r("Maine", ["Portland", "Bangor"]),
  r("Maryland", ["Baltimore", "Annapolis", "Frederick"]),
  r("Massachusetts", ["Boston", "Worcester", "Springfield"]),
  r("Michigan", ["Detroit", "Grand Rapids", "Ann Arbor"]),
  r("Minnesota", ["Minneapolis", "Saint Paul", "Duluth"]),
  r("Mississippi", ["Jackson", "Gulfport"]),
  r("Missouri", ["Kansas City", "St. Louis", "Springfield"]),
  r("Montana", ["Billings", "Missoula"]),
  r("Nebraska", ["Omaha", "Lincoln"]),
  r("Nevada", ["Las Vegas", "Reno"]),
  r("New Hampshire", ["Manchester", "Concord"]),
  r("New Jersey", ["Newark", "Jersey City", "Trenton"]),
  r("New Mexico", ["Albuquerque", "Santa Fe"]),
  r("New York", ["New York City", "Buffalo", "Rochester", "Albany"]),
  r("North Carolina", ["Charlotte", "Raleigh", "Greensboro"]),
  r("North Dakota", ["Fargo", "Bismarck"]),
  r("Ohio", ["Columbus", "Cleveland", "Cincinnati"]),
  r("Oklahoma", ["Oklahoma City", "Tulsa"]),
  r("Oregon", ["Portland", "Eugene", "Salem"]),
  r("Pennsylvania", ["Philadelphia", "Pittsburgh", "Harrisburg"]),
  r("Rhode Island", ["Providence", "Warwick"]),
  r("South Carolina", ["Charleston", "Columbia", "Greenville"]),
  r("South Dakota", ["Sioux Falls", "Rapid City"]),
  r("Tennessee", ["Nashville", "Memphis", "Knoxville"]),
  r("Texas", ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth"]),
  r("Utah", ["Salt Lake City", "Provo"]),
  r("Vermont", ["Burlington", "Montpelier"]),
  r("Virginia", ["Virginia Beach", "Richmond", "Arlington"]),
  r("Washington", ["Seattle", "Spokane", "Tacoma"]),
  r("West Virginia", ["Charleston", "Morgantown"]),
  r("Wisconsin", ["Milwaukee", "Madison", "Green Bay"]),
  r("Wyoming", ["Cheyenne", "Casper"]),
  r("Washington, D.C.", ["Washington, D.C."]),
];
const australia = [
  r("Australian Capital Territory", ["Canberra"]),
  r("New South Wales", ["Sydney", "Newcastle", "Wollongong"]),
  r("Northern Territory", ["Darwin", "Alice Springs"]),
  r("Queensland", ["Brisbane", "Gold Coast", "Cairns", "Townsville"]),
  r("South Australia", ["Adelaide", "Mount Gambier"]),
  r("Tasmania", ["Hobart", "Launceston"]),
  r("Victoria", ["Melbourne", "Geelong", "Ballarat"]),
  r("Western Australia", ["Perth", "Fremantle", "Bunbury"]),
];

export const LOCATION_CONFIG: Record<CountryCode, CountryLocationConfig> = {
  IE: {
    name: "Ireland",
    currency: "EUR",
    symbol: "€",
    regionLabel: "County",
    cityLabel: "Town / City",
    regions: ireland,
  },
  GB: {
    name: "United Kingdom",
    currency: "GBP",
    symbol: "£",
    regionLabel: "Country subdivision / Region",
    cityLabel: "Town / City",
    regions: uk,
  },
  ZA: {
    name: "South Africa",
    currency: "ZAR",
    symbol: "R",
    regionLabel: "Province",
    cityLabel: "Town / City",
    regions: southAfrica,
  },
  US: {
    name: "United States",
    currency: "USD",
    symbol: "$",
    regionLabel: "State",
    cityLabel: "Town / City",
    regions: us,
  },
  AU: {
    name: "Australia",
    currency: "AUD",
    symbol: "$",
    regionLabel: "State / Territory",
    cityLabel: "Town / City",
    regions: australia,
  },
};
export const REGIONS = LOCATION_CONFIG;
export const COUNTRIES = (Object.keys(LOCATION_CONFIG) as CountryCode[]).map(
  (code) => ({ code, name: LOCATION_CONFIG[code].name }),
);
export const getDefaultLocation = (country: CountryCode) => ({
  region: LOCATION_CONFIG[country].regions[0].name,
  town: LOCATION_CONFIG[country].regions[0].cities[0],
});
export const getCities = (country: CountryCode, region: string) =>
  LOCATION_CONFIG[country].regions.find((r) => r.name === region)?.cities ?? [];
export const formatApproximateLocation = (
  country: CountryCode,
  region: string,
  town: string,
) => {
  const configured = LOCATION_CONFIG[country].regions.find(
    (r) => r.name === region,
  );
  return [town, configured?.publicRegion ?? region].filter(Boolean).join(", ");
};
export const isApproximateLocationInRegion = (
  country: CountryCode,
  region: string,
  approximateLocation: string,
) =>
  getCities(country, region).some(
    (city) =>
      formatApproximateLocation(country, region, city) === approximateLocation,
  );
export const CATEGORIES = [
  "Home",
  "Kids",
  "Fashion",
  "Electronics",
  "Garden",
  "Sports",
  "Other",
];
