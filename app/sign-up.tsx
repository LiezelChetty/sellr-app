import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { Button, Field, Header, Logo, Screen } from "../src/components/ui";
import { useAuth } from "../src/store/AuthStore";

export default function SignUp() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!name.trim() || !email.trim() || password.length < 8) return Alert.alert("Check your details", "Enter your name, email and a password of at least 8 characters.");
    setBusy(true); const result = await signUp(email, password, name); setBusy(false);
    if (result.error) return Alert.alert("Could not create account", result.error);
    if (result.needsEmailConfirmation) { Alert.alert("Check your email", "Confirm your email, then log in to finish your profile."); router.replace("/login"); }
  };
  return <Screen><Logo /><Header title="Create your OfferMe account" subtitle="Your email stays private. Only your display name and broad area appear publicly." /><Field label="Display name" value={name} onChangeText={setName} autoCapitalize="words" /><Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" /><Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" /><Button label={busy ? "Creating account…" : "Create account"} disabled={busy} onPress={submit} /></Screen>;
}
