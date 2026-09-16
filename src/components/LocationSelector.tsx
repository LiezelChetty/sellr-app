import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { CountryCode } from "../types/domain";
import { locationProvider } from "../services/location";
import { Field, Pill, styles } from "./ui";

export function LocationSelector({
  country,
  region,
  town,
  onRegionChange,
  onTownChange,
}: {
  country: CountryCode;
  region: string;
  town: string;
  onRegionChange(value: string): void;
  onTownChange(value: string): void;
}) {
  const [regionQuery, setRegionQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const config = locationProvider.getCountry(country);
  useEffect(() => {
    setRegionQuery("");
    setCityQuery("");
  }, [country]);
  const matchingRegions = useMemo(() => {
    const all = config.regions.filter((x) =>
      x.name.toLowerCase().includes(regionQuery.trim().toLowerCase()),
    );
    if (regionQuery.trim()) return all;
    const initial = all.slice(0, 12);
    const selected = all.find((x) => x.name === region);
    return selected && !initial.includes(selected)
      ? [selected, ...initial]
      : initial;
  }, [config, regionQuery, region]);
  const cities = locationProvider.getCities(country, region);
  const matchingCities = cities.filter((x) =>
    x.toLowerCase().includes(cityQuery.trim().toLowerCase()),
  );
  return (
    <View style={{ gap: 12 }}>
      <Field
        label={`Search ${config.regionLabel.toLowerCase()}`}
        value={regionQuery}
        onChangeText={setRegionQuery}
        placeholder={`Choose ${config.regionLabel.toLowerCase()}`}
      />
      <View style={styles.wrap}>
        {matchingRegions.map((x) => (
          <Pill
            key={x.name}
            label={x.name}
            active={region === x.name}
            onPress={() => {
              onRegionChange(x.name);
              onTownChange(x.cities[0]);
              setCityQuery("");
            }}
          />
        ))}
      </View>
      {!regionQuery && config.regions.length > 12 ? (
        <Text style={styles.small}>
          Showing common options. Search to find all {config.regions.length}.
        </Text>
      ) : null}
      <Field
        label={`Search ${config.cityLabel.toLowerCase()}`}
        value={cityQuery}
        onChangeText={setCityQuery}
        placeholder={`Choose ${config.cityLabel.toLowerCase()}`}
      />
      <View style={styles.wrap}>
        {matchingCities.map((city) => (
          <Pill
            key={city}
            label={city}
            active={town === city}
            onPress={() => onTownChange(city)}
          />
        ))}
      </View>
      {!cities.length ? (
        <Text style={styles.small}>
          Choose a {config.regionLabel.toLowerCase()} to see available{" "}
          {config.cityLabel.toLowerCase()} options.
        </Text>
      ) : null}
    </View>
  );
}
