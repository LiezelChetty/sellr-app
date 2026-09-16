import { useRouter } from "expo-router";
import { Button, Header, Logo, Screen } from "../src/components/ui";

export default function Welcome() {
  const router = useRouter();
  return (
    <Screen style={{ justifyContent: "center", minHeight: 650 }}>
      <Logo />
      <Header title="Buy and sell locally." subtitle="Create an account to list items, save favourites, make offers and message sellers in your broad area." />
      <Button label="Create account" onPress={() => router.push("/sign-up")} />
      <Button label="Log in" variant="secondary" onPress={() => router.push("/login")} />
    </Screen>
  );
}
