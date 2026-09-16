import { useState } from "react";
import { Alert } from "react-native";
import { Button, Field, Header, Logo, Screen } from "../src/components/ui";
import { useAuth } from "../src/store/AuthStore";
export default function ForgotPassword() {
  const { resetPassword } = useAuth(); const [email, setEmail] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async () => { setBusy(true); const result = await resetPassword(email); setBusy(false); Alert.alert(result.error ? "Could not send reset email" : "Check your email", result.error ?? "Use the secure link from Supabase to reset your password."); };
  return <Screen><Logo /><Header title="Reset your password" subtitle="We’ll send a secure reset link to your account email." /><Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" /><Button label={busy ? "Sending…" : "Send reset email"} disabled={busy || !email} onPress={submit} /></Screen>;
}
