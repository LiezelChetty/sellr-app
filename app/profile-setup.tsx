import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { Button, Field, Header, Logo, Pill, Screen, styles } from "../src/components/ui";
import { COUNTRIES, getDefaultLocation } from "../src/config/regions";
import { LocationSelector } from "../src/components/LocationSelector";
import { useAuth } from "../src/store/AuthStore";
import { CountryCode } from "../src/types/domain";
export default function ProfileSetup() {
  const { user, completeProfile } = useAuth(); const initial = getDefaultLocation("IE");
  const [name, setName] = useState(String(user?.user_metadata?.display_name ?? "")); const [country, setCountry] = useState<CountryCode>("IE"); const [region, setRegion] = useState(initial.region); const [town, setTown] = useState(initial.town); const [busy, setBusy] = useState(false);
  const submit = async () => { setBusy(true); const result = await completeProfile({ displayName: name, countryCode: country, region, town }); setBusy(false); if (result.error) Alert.alert("Could not save profile", result.error); };
  return <Screen><Logo /><Header title="Set up your local marketplace" subtitle="Choose only your broad area. Never enter a street address or precise location." /><Field label="Display name" value={name} onChangeText={setName} /><Text style={styles.h3}>Country</Text><View style={styles.wrap}>{COUNTRIES.map((c) => <Pill key={c.code} label={c.name} active={country === c.code} onPress={() => { const next = getDefaultLocation(c.code); setCountry(c.code); setRegion(next.region); setTown(next.town); }} />)}</View><LocationSelector country={country} region={region} town={town} onRegionChange={setRegion} onTownChange={setTown} /><Button label={busy ? "Saving…" : "Enter OfferMe"} disabled={busy || !name.trim() || !region || !town} onPress={submit} /></Screen>;
}
