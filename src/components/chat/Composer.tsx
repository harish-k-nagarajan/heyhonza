"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { VoiceReplyButton } from "@/components/chat/VoiceReplyButton";

type ComposerProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export function Composer({ onSend, disabled }: ComposerProps) {
  const [value, setValue] = useState("");

  const submit = useCallback(() => {
    const t = value.trim();
    if (!t || disabled) return;
    setValue("");
    onSend(t);
  }, [disabled, onSend, value]);

  return (
    <div className="flex items-end gap-2">
      <VoiceReplyButton
        className="shrink-0"
        onTranscript={(text) => {
          setValue(text);
          onSend(text);
        }}
      />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Reply in Czech…"
        disabled={disabled}
        className="min-h-11 flex-1"
      />
      <Button type="button" disabled={disabled} onClick={submit} className="shrink-0">
        Send
      </Button>
    </div>
  );
}
