import { useCallback, useEffect, useRef, useState } from "react";
import { CIPHER_LABEL, MAX_MESSAGE_LENGTH, decryptLine, encrypt } from "./crypto.js";

const BAUD_RATE = 115200;
const MAX_MESSAGES = 60;

const QUICK_MESSAGES = ["Hallo Apache", "SOS - hulp nodig", "Ik ben oke", "Locatie delen"];

const serialSupported =
  typeof navigator !== "undefined" && "serial" in navigator;

function now() {
  return new Date().toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function nonceHex(nonce) {
  return (nonce >>> 0).toString(16).padStart(8, "0");
}

function wireBytes(nonce, hex) {
  const groups = hex.match(/.{1,2}/g) ?? [];
  return `${nonceHex(nonce)} ${groups.join(" ")}`.trim();
}

function errorText(err) {
  if (!err) return "Onbekende fout.";
  if (err.name === "NetworkError") return "Het device is niet bereikbaar.";
  return err.message || String(err);
}

function isCipherLine(line) {
  return /^[0-9a-fA-F]+$/.test(line) && line.length >= 8 && line.length % 2 === 0;
}

export default function SecureChannel() {
  const [status, setStatus] = useState("idle"); // idle | connecting | online | error
  const [deviceReady, setDeviceReady] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const portRef = useRef(null);
  const readerRef = useRef(null);
  const keepReadingRef = useRef(false);
  const rxBufferRef = useRef("");
  const readyTimerRef = useRef(null);
  const transcriptRef = useRef(null);
  const consoleRef = useRef(null);
  const idRef = useRef(0);

  const pushMessage = useCallback((entry) => {
    idRef.current += 1;
    const item = { id: idRef.current, time: now(), ...entry };
    setMessages((prev) => [...prev, item].slice(-MAX_MESSAGES));
  }, []);

  const pushSystem = useCallback(
    (text) => pushMessage({ dir: "sys", text }),
    [pushMessage],
  );

  const handleLine = useCallback(
    (line) => {
      if (line.startsWith("#")) {
        if (line === "#READY") {
          window.clearTimeout(readyTimerRef.current);
          setDeviceReady(true);
          pushSystem("Device online. Kanaal beveiligd.");
        }
        return;
      }
      if (!isCipherLine(line)) return;
      const result = decryptLine(line);
      if (!result || result.text.length === 0) return;
      pushMessage({ dir: "in", text: result.text, hex: result.hex, nonce: result.nonce });
    },
    [pushMessage, pushSystem],
  );

  const drainBuffer = useCallback(() => {
    let buffer = rxBufferRef.current;
    let index = buffer.indexOf("\n");
    while (index >= 0) {
      const line = buffer.slice(0, index).replace(/\r$/, "").trim();
      buffer = buffer.slice(index + 1);
      if (line) handleLine(line);
      index = buffer.indexOf("\n");
    }
    rxBufferRef.current = buffer;
  }, [handleLine]);

  const readLoop = useCallback(
    async (port) => {
      const decoder = new TextDecoder();
      while (port.readable && keepReadingRef.current) {
        const reader = port.readable.getReader();
        readerRef.current = reader;
        try {
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              rxBufferRef.current += decoder.decode(value, { stream: true });
              drainBuffer();
            }
          }
        } catch (err) {
          if (keepReadingRef.current) {
            setError(`Verbinding onderbroken: ${errorText(err)}`);
          }
        } finally {
          reader.releaseLock();
          readerRef.current = null;
        }
      }
      try {
        await port.close();
      } catch {
        /* already closed */
      }
      if (portRef.current === port) portRef.current = null;
    },
    [drainBuffer],
  );

  const connect = useCallback(async () => {
    if (!serialSupported) return;
    setError("");
    setStatus("connecting");
    let port;
    try {
      port = await navigator.serial.requestPort();
      await port.open({ baudRate: BAUD_RATE });
    } catch (err) {
      // The user simply dismissed the port picker — back to a clean idle state.
      if (err && err.name === "NotFoundError") {
        setStatus("idle");
        return;
      }
      setStatus("error");
      setError(`Verbinden mislukt: ${errorText(err)}`);
      return;
    }

    portRef.current = port;
    rxBufferRef.current = "";
    keepReadingRef.current = true;
    setDeviceReady(false);
    setStatus("online");
    pushSystem("Seriele poort geopend. Wachten op het device...");
    // Opening the port resets the Uno; if no #READY arrives, enable sending anyway.
    readyTimerRef.current = window.setTimeout(() => setDeviceReady(true), 3500);
    readLoop(port);
  }, [pushSystem, readLoop]);

  const disconnect = useCallback(async () => {
    keepReadingRef.current = false;
    window.clearTimeout(readyTimerRef.current);
    setStatus("idle");
    setDeviceReady(false);
    const reader = readerRef.current;
    if (reader) {
      try {
        await reader.cancel();
      } catch {
        /* ignore */
      }
    }
  }, []);

  const send = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const port = portRef.current;
      if (!port || !port.writable) {
        setError("Geen verbinding. Verbind eerst met het device.");
        return;
      }
      const message = trimmed.slice(0, MAX_MESSAGE_LENGTH);
      const { line, hex, nonce } = encrypt(message);
      const writer = port.writable.getWriter();
      try {
        await writer.write(new TextEncoder().encode(`${line}\n`));
        pushMessage({ dir: "out", text: message, hex, nonce });
        setDraft("");
      } catch (err) {
        setError(`Versturen mislukt: ${errorText(err)}`);
      } finally {
        writer.releaseLock();
      }
    },
    [pushMessage],
  );

  // Blow the console up to fill the screen — built for the booth. Uses the
  // native Fullscreen API; falls back to a fixed overlay where it is blocked.
  const toggleFullscreen = useCallback(() => {
    const el = consoleRef.current;
    if (!el) return;
    const active = document.fullscreenElement || document.webkitFullscreenElement;
    if (active) {
      (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
      return;
    }
    const request = el.requestFullscreen || el.webkitRequestFullscreen;
    if (request) {
      Promise.resolve(request.call(el)).catch(() => setIsFullscreen((v) => !v));
    } else {
      setIsFullscreen((v) => !v); // no API: fixed-overlay fallback via CSS class
    }
  }, []);

  useEffect(() => {
    const onChange = () => {
      const active = document.fullscreenElement || document.webkitFullscreenElement;
      if (active) setIsFullscreen(active === consoleRef.current);
      else if (!document.fullscreenEnabled) {
        /* fallback mode: leave state as toggled */
      } else setIsFullscreen(false);
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  // Close the port if the component ever unmounts.
  useEffect(() => {
    return () => {
      keepReadingRef.current = false;
      window.clearTimeout(readyTimerRef.current);
      const reader = readerRef.current;
      if (reader) reader.cancel().catch(() => {});
    };
  }, []);

  // Reset state if the device is physically unplugged.
  useEffect(() => {
    if (!serialSupported) return undefined;
    const onDisconnect = (event) => {
      if (event.target === portRef.current) {
        keepReadingRef.current = false;
        setStatus("idle");
        setDeviceReady(false);
        setError("Device losgekoppeld.");
      }
    };
    navigator.serial.addEventListener("disconnect", onDisconnect);
    return () => navigator.serial.removeEventListener("disconnect", onDisconnect);
  }, []);

  // Keep the newest message in view.
  useEffect(() => {
    const node = transcriptRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages]);

  const online = status === "online";
  const canSend = online && deviceReady;

  const statusLabel = !serialSupported
    ? "Niet ondersteund"
    : status === "connecting"
      ? "Verbinden..."
      : status === "error"
        ? "Verbinding mislukt"
        : online
          ? deviceReady
            ? "Online - kanaal beveiligd"
            : "Device starten..."
          : "Niet verbonden";

  const dotState = !serialSupported
    ? "idle"
    : status === "error"
      ? "error"
      : status === "connecting" || (online && !deviceReady)
        ? "wait"
        : online
          ? "live"
          : "idle";

  const handleSubmit = (event) => {
    event.preventDefault();
    send(draft);
  };

  return (
    <div
      className={`channel-console ${isFullscreen ? "is-fullscreen" : ""}`}
      ref={consoleRef}
      aria-label="Beveiligd kanaal naar het Apache-device"
    >
      <div className="channel-bar">
        <div className="channel-id">
          <span className={`channel-dot is-${dotState}`} aria-hidden="true" />
          <span className="channel-state">{statusLabel}</span>
          <span className="channel-cipher" aria-label="Versleuteling">
            {CIPHER_LABEL}
          </span>
        </div>
        <div className="channel-actions">
          <button
            type="button"
            className="channel-fs-button"
            onClick={toggleFullscreen}
            aria-pressed={isFullscreen}
            aria-label={isFullscreen ? "Sluit volledig scherm" : "Toon op volledig scherm"}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {isFullscreen ? (
                <path d="M6 2.5v3.5H2.5M10 2.5v3.5h3.5M6 13.5V10H2.5M10 13.5V10h3.5" />
              ) : (
                <path d="M2.5 6V2.5H6M13.5 6V2.5H10M2.5 10v3.5H6M13.5 10v3.5H10" />
              )}
            </svg>
            <span>{isFullscreen ? "Sluiten" : "Volledig scherm"}</span>
          </button>
          <button
            type="button"
            className="button channel-action"
            onClick={online || status === "connecting" ? disconnect : connect}
            disabled={!serialSupported || status === "connecting"}
          >
            {online ? "Verbreken" : status === "connecting" ? "Verbinden..." : "Verbind met device"}
          </button>
        </div>
      </div>

      <div className="channel-transcript" ref={transcriptRef} aria-live="polite">
        {messages.length === 0 ? (
          <div className="channel-empty">
            <p>
              {serialSupported
                ? "Verbind met het device en stuur je eerste versleutelde bericht."
                : "Open deze pagina in Chrome of Edge op een desktop om te verbinden."}
            </p>
          </div>
        ) : (
          messages.map((message) =>
            message.dir === "sys" ? (
              <p className="channel-note-line" key={message.id}>
                {message.text}
              </p>
            ) : (
              <article className={`channel-msg is-${message.dir}`} key={message.id}>
                <header className="msg-head">
                  <span className="msg-who">{message.dir === "out" ? "Jij" : "Device"}</span>
                  <span className="msg-time">{message.time}</span>
                </header>
                <p className="msg-text">{message.text}</p>
                <code className="msg-cipher" title="De versleutelde bytes die over de kabel gaan">
                  {wireBytes(message.nonce, message.hex)}
                </code>
              </article>
            ),
          )
        )}
      </div>

      <form className="channel-composer" onSubmit={handleSubmit}>
        <div className="quick-replies" role="group" aria-label="Snelle berichten">
          {QUICK_MESSAGES.map((message) => (
            <button
              type="button"
              key={message}
              className="quick-reply"
              onClick={() => send(message)}
              disabled={!canSend}
            >
              {message}
            </button>
          ))}
        </div>
        <div className="composer-row">
          <label className="visually-hidden" htmlFor="channel-input">
            Bericht
          </label>
          <input
            id="channel-input"
            type="text"
            className="channel-input"
            value={draft}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder={canSend ? "Typ een bericht..." : "Verbind eerst met het device"}
            onChange={(event) => setDraft(event.target.value)}
            disabled={!canSend}
            autoComplete="off"
          />
          <button type="submit" className="button primary" disabled={!canSend || !draft.trim()}>
            Versturen
          </button>
        </div>
      </form>

      {!serialSupported && (
        <p className="channel-note">
          Het beveiligde kanaal gebruikt de Web Serial API. Open deze pagina in Google Chrome
          of Microsoft Edge op een desktop om met het device te verbinden.
        </p>
      )}
      {error && (
        <p className="channel-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
