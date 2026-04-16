import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DiagnosticEventPayload } from "openclaw/plugin-sdk/diagnostic-runtime";
import {
  onDiagnosticEvent,
  resetDiagnosticEventsForTest,
} from "openclaw/plugin-sdk/diagnostic-runtime";
import { createVoiceProfiler } from "./profiling.js";

describe("voice profiling", () => {
  let events: DiagnosticEventPayload[];
  let stopListening: () => void;

  beforeEach(() => {
    resetDiagnosticEventsForTest();
    events = [];
    stopListening = onDiagnosticEvent((evt) => events.push(evt));
  });

  afterEach(() => {
    stopListening();
    resetDiagnosticEventsForTest();
  });

  it("emits voice.join with duration", () => {
    const profiler = createVoiceProfiler({ guildId: "g1", channelId: "c1" });
    const start = profiler.startTimer();
    profiler.emitJoin({ startMs: start, outcome: "connected" });

    expect(events).toHaveLength(1);
    const evt = events[0];
    expect(evt.type).toBe("voice.join");
    if (evt.type === "voice.join") {
      expect(evt.channel).toBe("discord");
      expect(evt.guildId).toBe("g1");
      expect(evt.channelId).toBe("c1");
      expect(evt.outcome).toBe("connected");
      expect(evt.durationMs).toBeGreaterThanOrEqual(0);
    }
  });

  it("emits voice.join error with message", () => {
    const profiler = createVoiceProfiler({ guildId: "g1", channelId: "c1" });
    const start = profiler.startTimer();
    profiler.emitJoin({ startMs: start, outcome: "error", error: "timeout" });

    expect(events).toHaveLength(1);
    if (events[0].type === "voice.join") {
      expect(events[0].outcome).toBe("error");
      expect(events[0].error).toBe("timeout");
    }
  });

  it("emits voice.leave", () => {
    const profiler = createVoiceProfiler({ guildId: "g1", channelId: "c1" });
    profiler.emitLeave();

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("voice.leave");
  });

  it("emits voice.capture with audio duration", () => {
    const profiler = createVoiceProfiler({ guildId: "g1", channelId: "c1" });
    const start = profiler.startTimer();
    profiler.emitCapture({
      userId: "u1",
      startMs: start,
      audioDurationSeconds: 2.5,
      outcome: "ready",
    });

    expect(events).toHaveLength(1);
    if (events[0].type === "voice.capture") {
      expect(events[0].userId).toBe("u1");
      expect(events[0].audioDurationSeconds).toBe(2.5);
      expect(events[0].outcome).toBe("ready");
    }
  });

  it("emits voice.transcribe", () => {
    const profiler = createVoiceProfiler({ guildId: "g1", channelId: "c1" });
    const start = profiler.startTimer();
    profiler.emitTranscribe({ startMs: start, transcriptChars: 42, outcome: "ok" });

    expect(events).toHaveLength(1);
    if (events[0].type === "voice.transcribe") {
      expect(events[0].transcriptChars).toBe(42);
      expect(events[0].outcome).toBe("ok");
    }
  });

  it("emits voice.segment with full pipeline metadata", () => {
    const profiler = createVoiceProfiler({ guildId: "g1", channelId: "c1" });
    const start = profiler.startTimer();
    profiler.emitSegment({
      userId: "u1",
      startMs: start,
      audioDurationSeconds: 3.0,
      outcome: "replied",
      stage: "complete",
    });

    expect(events).toHaveLength(1);
    if (events[0].type === "voice.segment") {
      expect(events[0].outcome).toBe("replied");
      expect(events[0].stage).toBe("complete");
      expect(events[0].audioDurationSeconds).toBe(3.0);
    }
  });

  it("emits voice.tts", () => {
    const profiler = createVoiceProfiler({ guildId: "g1", channelId: "c1" });
    const start = profiler.startTimer();
    profiler.emitTts({ startMs: start, inputChars: 100, outcome: "ok" });

    expect(events).toHaveLength(1);
    if (events[0].type === "voice.tts") {
      expect(events[0].inputChars).toBe(100);
      expect(events[0].outcome).toBe("ok");
    }
  });

  it("emits voice.tts error with message", () => {
    const profiler = createVoiceProfiler({ guildId: "g1", channelId: "c1" });
    const start = profiler.startTimer();
    profiler.emitTts({ startMs: start, inputChars: 50, outcome: "error", error: "provider down" });

    if (events[0].type === "voice.tts") {
      expect(events[0].error).toBe("provider down");
    }
  });

  it("emits voice.playback", () => {
    const profiler = createVoiceProfiler({ guildId: "g1", channelId: "c1" });
    const start = profiler.startTimer();
    profiler.emitPlayback({ startMs: start });

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("voice.playback");
  });

  it("emits voice.error", () => {
    const profiler = createVoiceProfiler({ guildId: "g1", channelId: "c1" });
    profiler.emitError({
      errorKind: "decrypt",
      message: "DecryptionFailed(foo)",
      isRecoverable: true,
    });

    expect(events).toHaveLength(1);
    if (events[0].type === "voice.error") {
      expect(events[0].errorKind).toBe("decrypt");
      expect(events[0].isRecoverable).toBe(true);
    }
  });

  it("includes monotonic seq and ts on all events", () => {
    const profiler = createVoiceProfiler({ guildId: "g1", channelId: "c1" });
    profiler.emitLeave();
    profiler.emitLeave();

    expect(events).toHaveLength(2);
    expect(events[0].seq).toBe(1);
    expect(events[1].seq).toBe(2);
    expect(events[0].ts).toBeLessThanOrEqual(events[1].ts);
  });
});
