import type { Session, User } from "@supabase/supabase-js";
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { formatApproximateLocation } from "../config/regions";
import { isDemoMode, supabase } from "../lib/supabase";
import { CountryCode, SellerProfile, UserPreferences } from "../types/domain";

type AuthResult = { error?: string; needsEmailConfirmation?: boolean };
interface AuthValue {
  ready: boolean;
  demoMode: boolean;
  session: Session | null;
  user: User | null;
  profile: SellerProfile | null;
  preferences: UserPreferences | null;
  signUp(email: string, password: string, displayName: string): Promise<AuthResult>;
  signIn(email: string, password: string): Promise<AuthResult>;
  resetPassword(email: string): Promise<AuthResult>;
  completeProfile(input: { displayName: string; countryCode: CountryCode; region: string; town: string }): Promise<AuthResult>;
  refreshProfile(): Promise<void>;
  signOut(): Promise<void>;
}
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(isDemoMode);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  const loadProfile = async (userId?: string) => {
    if (!supabase || !userId) {
      setProfile(null);
      setPreferences(null);
      return;
    }
    const [{ data: p, error: pError }, { data: prefs, error: prefsError }] = await Promise.all([
      supabase.from("profiles").select("id,display_name,avatar_path,member_since,country_code,region,town,approximate_location").eq("id", userId).maybeSingle(),
      supabase.from("user_preferences").select("country_code,region,town,onboarding_completed").eq("user_id", userId).maybeSingle(),
    ]);
    if (pError) throw pError;
    if (prefsError) throw prefsError;
    setProfile(p ? {
      id: p.id,
      displayName: p.display_name || "OfferMe member",
      avatarUrl: p.avatar_path || undefined,
      approximateLocation: p.approximate_location || "Area not set",
      memberSince: p.member_since,
    } : null);
    setPreferences(prefs ? {
      onboarded: prefs.onboarding_completed,
      countryCode: prefs.country_code as CountryCode,
      region: prefs.region || "",
      town: prefs.town || "",
    } : null);
  };

  useEffect(() => {
    if (!supabase || isDemoMode) return;
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      try { await loadProfile(data.session?.user.id); } finally { setReady(true); }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setTimeout(() => loadProfile(next?.user.id).catch(() => undefined), 0);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthValue>(() => ({
    ready,
    demoMode: isDemoMode,
    session,
    user: session?.user ?? null,
    profile,
    preferences,
    signUp: async (email, password, displayName) => {
      if (!supabase) return { error: "Supabase is not configured." };
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { display_name: displayName.trim() } } });
      return error ? { error: error.message } : { needsEmailConfirmation: !data.session };
    },
    signIn: async (email, password) => {
      if (!supabase) return { error: "Supabase is not configured." };
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      return error ? { error: error.message } : {};
    },
    resetPassword: async (email) => {
      if (!supabase) return { error: "Supabase is not configured." };
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      return error ? { error: error.message } : {};
    },
    completeProfile: async ({ displayName, countryCode, region, town }) => {
      if (!supabase || !session?.user) return { error: "Sign in first." };
      const approximateLocation = formatApproximateLocation(countryCode, region, town);
      const [{ error: pError }, { error: prefsError }] = await Promise.all([
        supabase.from("profiles").update({ display_name: displayName.trim(), country_code: countryCode, region, town, approximate_location: approximateLocation }).eq("id", session.user.id),
        supabase.from("user_preferences").upsert({ user_id: session.user.id, country_code: countryCode, region, town, onboarding_completed: true, updated_at: new Date().toISOString() }),
      ]);
      const error = pError ?? prefsError;
      if (error) return { error: error.message };
      await loadProfile(session.user.id);
      return {};
    },
    refreshProfile: () => loadProfile(session?.user.id),
    signOut: async () => {
      if (supabase) await supabase.auth.signOut();
      setSession(null); setProfile(null); setPreferences(null);
    },
  }), [ready, session, profile, preferences]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AuthProvider missing");
  return value;
}
