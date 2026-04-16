import { emitDiagnosticEvent } from "openclaw/plugin-sdk/diagnostic-runtime";

type VoiceProfileContext = {
  guildId: string;
  channelId: string;
};

export function createVoiceProfiler(ctx: VoiceProfileContext) {
  const startTimer = () => performance.now();

  const elapsed = (start: number) => Math.round(performance.now() - start);

  return {
    startTimer,

    emitJoin(params: {
      startMs: number;
      outcome: "connected" | "already_connected" | "error";
      error?: string;
    }) {
      emitDiagnosticEvent({
        type: "voice.join",
        channel: "discord",
        guildId: ctx.guildId,
        channelId: ctx.channelId,
        durationMs: elapsed(params.startMs),
        outcome: params.outcome,
        error: params.error,
      });
    },

    emitLeave() {
      emitDiagnosticEvent({
        type: "voice.leave",
        channel: "discord",
        guildId: ctx.guildId,
        channelId: ctx.channelId,
      });
    },

    emitCapture(params: {
      userId: string;
      startMs: number;
      audioDurationSeconds: number;
      outcome: "ready" | "empty" | "too_short";
    }) {
      emitDiagnosticEvent({
        type: "voice.capture",
        channel: "discord",
        guildId: ctx.guildId,
        channelId: ctx.channelId,
        userId: params.userId,
        durationMs: elapsed(params.startMs),
        audioDurationSeconds: params.audioDurationSeconds,
        outcome: params.outcome,
      });
    },

    emitTranscribe(params: {
      startMs: number;
      transcriptChars: number;
      outcome: "ok" | "empty";
    }) {
      emitDiagnosticEvent({
        type: "voice.transcribe",
        channel: "discord",
        guildId: ctx.guildId,
        channelId: ctx.channelId,
        durationMs: elapsed(params.startMs),
        transcriptChars: params.transcriptChars,
        outcome: params.outcome,
      });
    },

    emitSegment(params: {
      userId: string;
      startMs: number;
      audioDurationSeconds: number;
      outcome: "replied" | "empty_reply" | "unauthorized" | "transcription_empty";
      stage: "authorize" | "transcribe" | "agent" | "tts" | "complete";
    }) {
      emitDiagnosticEvent({
        type: "voice.segment",
        channel: "discord",
        guildId: ctx.guildId,
        channelId: ctx.channelId,
        userId: params.userId,
        durationMs: elapsed(params.startMs),
        audioDurationSeconds: params.audioDurationSeconds,
        outcome: params.outcome,
        stage: params.stage,
      });
    },

    emitTts(params: {
      startMs: number;
      inputChars: number;
      outcome: "ok" | "error" | "skipped";
      error?: string;
    }) {
      emitDiagnosticEvent({
        type: "voice.tts",
        channel: "discord",
        guildId: ctx.guildId,
        channelId: ctx.channelId,
        durationMs: elapsed(params.startMs),
        inputChars: params.inputChars,
        outcome: params.outcome,
        error: params.error,
      });
    },

    emitPlayback(params: { startMs: number }) {
      emitDiagnosticEvent({
        type: "voice.playback",
        channel: "discord",
        guildId: ctx.guildId,
        channelId: ctx.channelId,
        durationMs: elapsed(params.startMs),
      });
    },

    emitError(params: {
      errorKind: "receive" | "decrypt" | "playback" | "connection";
      message: string;
      isRecoverable: boolean;
    }) {
      emitDiagnosticEvent({
        type: "voice.error",
        channel: "discord",
        guildId: ctx.guildId,
        channelId: ctx.channelId,
        errorKind: params.errorKind,
        message: params.message,
        isRecoverable: params.isRecoverable,
      });
    },

    emitHardCut(params: {
      userId: string;
      maxDurationMs: number;
      pcmBytes: number;
    }) {
      emitDiagnosticEvent({
        type: "voice.hard_cut",
        channel: "discord",
        guildId: ctx.guildId,
        channelId: ctx.channelId,
        userId: params.userId,
        maxDurationMs: params.maxDurationMs,
        pcmBytes: params.pcmBytes,
      });
    },

    emitDecode(params: {
      userId: string;
      startMs: number;
      pcmBytes: number;
      opusFrames: number;
      outcome: "ok" | "empty" | "error";
    }) {
      emitDiagnosticEvent({
        type: "voice.decode",
        channel: "discord",
        guildId: ctx.guildId,
        channelId: ctx.channelId,
        userId: params.userId,
        durationMs: elapsed(params.startMs),
        pcmBytes: params.pcmBytes,
        opusFrames: params.opusFrames,
        outcome: params.outcome,
      });
    },

    emitWavWrite(params: {
      startMs: number;
      pcmBytes: number;
      outcome: "ok" | "skipped" | "error";
    }) {
      emitDiagnosticEvent({
        type: "voice.wav_write",
        channel: "discord",
        guildId: ctx.guildId,
        channelId: ctx.channelId,
        durationMs: elapsed(params.startMs),
        pcmBytes: params.pcmBytes,
        outcome: params.outcome,
      });
    },
  };
}

export type VoiceProfiler = ReturnType<typeof createVoiceProfiler>;
