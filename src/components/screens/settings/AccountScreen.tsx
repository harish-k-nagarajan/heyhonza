"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  HmatSettingsCard,
  HmatSettingsField,
  HmatSettingsHint,
  HmatSettingsMicroLabel,
  HmatSettingsPrimaryButton,
  HmatSettingsSection,
} from "@/components/screens/settings/HmatSettingsUi";
import { HmatSettingsHeader } from "@/components/screens/hmat/HmatUi";
import { persistProfile } from "@/lib/client/context-actions";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { useMoodExpression } from "@/hooks/useMoodExpression";
import { useScreenReady } from "@/hooks/useScreenReady";
import { useLocale } from "@/lib/i18n/useLocale";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useSettingsStore } from "@/stores/useSettingsStore";

const MIN_PASSWORD = 6;

export function AccountScreen() {
  const router = useRouter();
  const ready = useScreenReady();
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);
  const expression = useMoodExpression();
  const { t } = useLocale();
  const s = t.settings;
  const learnerName = useSettingsStore((s) => s.learnerName);
  const setLearnerName = useSettingsStore((s) => s.setLearnerName);

  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const name = nameDraft ?? learnerName;
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && !onboardingComplete) router.replace(ROUTES.onboarding);
  }, [ready, onboardingComplete, router]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
    });
  }, []);

  if (!ready || !onboardingComplete) {
    return (
      <div className={cn("flex flex-1 items-center justify-center", TYPE.meta)}>
        {s.loading}
      </div>
    );
  }

  const configured = isSupabaseConfigured();

  const saveName = () => {
    const clean = name.trim();
    setLearnerName(clean);
    persistProfile({ name: clean || null });
    if (configured) {
      const supabase = createSupabaseBrowserClient();
      void supabase.auth.updateUser({
        data: { full_name: clean, display_name: clean },
      });
    }
    setNote(s.accountSaved);
    setError(null);
  };

  const saveEmail = async () => {
    if (!configured) return;
    setBusy(true);
    setError(null);
    setNote(null);
    const supabase = createSupabaseBrowserClient();
    const { error: err } = await supabase.auth.updateUser({ email: email.trim().toLowerCase() });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setNote(s.accountEmailConfirm);
  };

  const savePassword = async () => {
    if (!configured) return;
    if (newPassword.length < MIN_PASSWORD) {
      setError(t.signin.passwordTooShort);
      return;
    }
    setBusy(true);
    setError(null);
    setNote(null);
    const supabase = createSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    const currentEmail = userData.user?.email;
    if (currentEmail && currentPassword) {
      const { error: reauth } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password: currentPassword,
      });
      if (reauth) {
        setBusy(false);
        setError(reauth.message);
        return;
      }
    }
    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setNote(s.accountSaved);
  };

  return (
    <div className="hmat-scroll flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-2">
      <HmatSettingsHeader
        orbState={expression.mood}
        kicker={s.accountPageKicker}
        title={s.accountPageTitle}
      />
      <Link
        href={ROUTES.settings}
        className="font-sans text-[13px] font-semibold text-accent"
      >
        ← {s.accountBack}
      </Link>

      {!configured ? <HmatSettingsHint>{s.accountNeedAuth}</HmatSettingsHint> : null}

      <HmatSettingsSection label={s.accountNameLabel}>
        <HmatSettingsCard className="space-y-3 p-4">
          <HmatSettingsField
            value={name}
            onChange={(e) => setNameDraft(e.target.value)}
            aria-label={s.accountNameLabel}
          />
          <HmatSettingsPrimaryButton onClick={saveName}>{s.accountSaveName}</HmatSettingsPrimaryButton>
        </HmatSettingsCard>
      </HmatSettingsSection>

      <HmatSettingsSection label={s.accountEmailLabel}>
        <HmatSettingsCard className="space-y-3 p-4">
          <HmatSettingsField
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!configured}
            aria-label={s.accountEmailLabel}
          />
          <HmatSettingsPrimaryButton
            disabled={!configured || busy || !email.trim()}
            onClick={() => void saveEmail()}
          >
            {s.accountSaveEmail}
          </HmatSettingsPrimaryButton>
        </HmatSettingsCard>
      </HmatSettingsSection>

      <HmatSettingsSection label={s.accountSavePassword}>
        <HmatSettingsCard className="space-y-3 p-4">
          <HmatSettingsMicroLabel>{s.accountCurrentPassword}</HmatSettingsMicroLabel>
          <HmatSettingsField
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={!configured}
            autoComplete="current-password"
          />
          <HmatSettingsMicroLabel>{s.accountNewPassword}</HmatSettingsMicroLabel>
          <HmatSettingsField
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={!configured}
            autoComplete="new-password"
          />
          <HmatSettingsPrimaryButton
            disabled={!configured || busy || !newPassword}
            onClick={() => void savePassword()}
          >
            {s.accountSavePassword}
          </HmatSettingsPrimaryButton>
        </HmatSettingsCard>
      </HmatSettingsSection>

      {note ? <p className={cn(TYPE.helper, "text-[#2F8F4E]")}>{note}</p> : null}
      {error ? <p className={cn(TYPE.helper, "text-accent")}>{error}</p> : null}
    </div>
  );
}
