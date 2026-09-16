import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { Button, Field, Header, Logo, Screen } from "../src/components/ui";
import { useAuth } from "../src/store/AuthStore";

export default function Login() {
  const router = useRouter(); const { signIn } = useAuth();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async () => { setBusy(true); const result = await signIn(email, password); setBusy(false); if (result.error) Alert.alert("Could not log in", result.error); };
  return <Screen><Logo /><Header title="Welcome back" subtitle="Log in to your OfferMe marketplace." /><Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" /><Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" /><Button label={busy ? "Logging in…" : "Log in"} disabled={busy || !email || !password} onPress={submit} /><Button label="Forgot password?" variant="ghost" onPress={() => router.push("/forgot-password")} /></Screen>;
}
