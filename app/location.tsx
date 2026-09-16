import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, View } from "react-native";
import { Button, Header, Pill, Screen, styles } from "../src/components/ui";
import { LocationSelector } from "../src/components/LocationSelector";
import {
  COUNTRIES,
  formatApproximateLocation,
  getDefaultLocation,
} from "../src/config/regions";
import { useAppStore } from "../src/store/AppStore";
import { CountryCode } from "../src/types/domain";
import { colors } from "../src/theme";
import { useSafeBack } from "../src/components/navigation";

export default function LocationSettings() {
  const { preferences, updateLocation } = useAppStore();
  const goBack = useSafeBack("/(tabs)/profile");
  const [country, setCountry] = useState<CountryCode>(preferences.countryCode);
  const [region, setRegion] = useState(preferences.region);
  const [town, setTown] = useState(preferences.town);
  return (
    <Screen>
      <Header
        title="Selling location"
        subtitle="Choose a broad area for discovery. OfferMe never asks for your street address or precise GPS."
      />
      <View style={styles.wrap}>
        {COUNTRIES.map((c) => (
          <Pill
            key={c.code}
            label={c.name}
            active={country === c.code}
            onPress={() => {
              const next = getDefaultLocation(c.code);
              setCountry(c.code);
              setRegion(next.region);
              setTown(next.town);
            }}
          />
        ))}
      </View>
      <LocationSelector
        country={country}
        region={region}
        town={town}
        onRegionChange={setRegion}
        onTownChange={setTown}
      />
      <View
        style={[
          styles.row,
          { padding: 12, backgroundColor: colors.greenSoft, borderRadius: 14 },
        ]}
      >
        <Ionicons name="location-outline" size={20} color={colors.greenDark} />
        <Text style={[styles.body, { flex: 1 }]}>
          Listings will show {formatApproximateLocation(country, region, town)}.
        </Text>
      </View>
      <Button
        label="Save location"
        disabled={!region || !town}
        onPress={() => {
          updateLocation(country, region, town);
          goBack();
        }}
      />
      <Text style={styles.small}>
        “Near you” means this configured broad area until a privacy-reviewed
        location search service is implemented.
      </Text>
    </Screen>
  );
}
