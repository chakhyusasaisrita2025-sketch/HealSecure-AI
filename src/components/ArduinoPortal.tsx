import React, { useState, useEffect, useRef } from 'react';
import {
  Cable,
  Tv,
  Cpu,
  Play,
  Pause,
  RefreshCw,
  Copy,
  Check,
  Download,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Terminal,
  Send,
  ExternalLink,
  Volume2,
  VolumeX,
  Layers,
  Sparkles,
  HelpCircle,
  Activity,
  Zap,
  X,
  MonitorPlay,
  Globe,
  Radio,
} from 'lucide-react';
import {
  getTelemetry,
  updateTelemetry,
  subscribeTelemetry,
  format16x2Lines,
  format20x4Lines,
  formatCsvPacket,
  formatJsonPacket,
  TelemetryData,
  LcdDisplayMode,
} from '../services/telemetryStream';
import {
  arduinoSerial,
  SerialConnectionStatus,
  SerialStats,
} from '../services/arduinoSerial';
import {
  downloadStandaloneTerminalHtml,
  downloadPythonBridgeScript,
} from '../services/standaloneExporter';
import { ARDUINO_SKETCHES, ArduinoSketchDef } from '../data/arduinoSketches';
import { CLINICAL_SCENARIOS } from '../data/clinicalData';

export const ArduinoPortal: React.FC = () => {
  // Telemetry state
  const [telemetry, setTelemetry] = useState<TelemetryData>(getTelemetry());
  const [isAutoStreaming, setIsAutoStreaming] = useState<boolean>(true);
  const [streamIntervalMs, setStreamIntervalMs] = useState<number>(1000);

  // LCD Display Mode & Formatting
  const [displayMode, setDisplayMode] = useState<LcdDisplayMode>('vitals_biomarkers');
  const [lcdTheme, setLcdTheme] = useState<'blue' | 'yellow' | 'oled'>('blue');
  const [lcdSize, setLcdSize] = useState<'16x2' | '20x4'>('16x2');
  const [cyclePage, setCyclePage] = useState<number>(0);
  const [customL1, setCustomL1] = useState<string>('HR:{hr}  O2:{spo2}%');
  const [customL2, setCustomL2] = useState<string>('pH:{ph} dT:+{dT}C');
  const [contrast, setContrast] = useState<number>(90);
  const [backlightOn, setBacklightOn] = useState<boolean>(true);

  // Serial Connection state
  const [serialStatus, setSerialStatus] = useState<SerialConnectionStatus>(arduinoSerial.getStatus());
  const [serialError, setSerialError] = useState<string>(arduinoSerial.getLastError());
  const [baudRate, setBaudRate] = useState<number>(9600);
  const [stats, setStats] = useState<SerialStats>(arduinoSerial.getStats());
  const [txActivity, setTxActivity] = useState<boolean>(false);
  const [rxActivity, setRxActivity] = useState<boolean>(false);

  // Logs & Console
  const [terminalLogs, setTerminalLogs] = useState<
    { id: string; time: string; type: 'TX' | 'RX' | 'SYS'; text: string }[]
  >([]);
  const [manualInput, setManualInput] = useState<string>('');
  const [isTerminalPaused, setIsTerminalPaused] = useState<boolean>(false);

  // Sound Alarm
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // Hardware Connection Mode & Iframe Handling
  const [showIframeModal, setShowIframeModal] = useState<boolean>(false);
  const [wsUrl, setWsUrl] = useState<string>('ws://localhost:8546');
  const [connectionTab, setConnectionTab] = useState<'usb' | 'bridge' | 'virtual'>('usb');
  const [copiedBridgeCmd, setCopiedBridgeCmd] = useState<boolean>(false);

  // Firmware Sketches Tab
  const [selectedSketch, setSelectedSketch] = useState<ArduinoSketchDef>(ARDUINO_SKETCHES[0]);
  const [copiedSketch, setCopiedSketch] = useState<boolean>(false);

  // Reference for auto-stream interval
  const streamTimerRef = useRef<any>(null);
  const cycleTimerRef = useRef<any>(null);
  const txFlashTimeoutRef = useRef<any>(null);
  const rxFlashTimeoutRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Subscribe to telemetry state
  useEffect(() => {
    const unsub = subscribeTelemetry((newData) => {
      setTelemetry(newData);
    });
    return () => unsub();
  }, []);

  // Listen to Arduino Serial status and RX events
  useEffect(() => {
    const unsubStatus = arduinoSerial.onStatusChange((status, error) => {
      setSerialStatus(status);
      setSerialError(error || '');
      setStats(arduinoSerial.getStats());

      addLog('SYS', `Serial status changed to: ${status.toUpperCase()}${error ? ` (${error})` : ''}`);
    });

    const unsubRx = arduinoSerial.onRx((data) => {
      setRxActivity(true);
      if (rxFlashTimeoutRef.current) clearTimeout(rxFlashTimeoutRef.current);
      rxFlashTimeoutRef.current = setTimeout(() => setRxActivity(false), 150);

      setStats(arduinoSerial.getStats());
      addLog('RX', data.trim());
    });

    return () => {
      unsubStatus();
      unsubRx();
    };
  }, []);

  // Auto-cycle pages when in auto_cycle mode
  useEffect(() => {
    if (displayMode === 'auto_cycle') {
      cycleTimerRef.current = setInterval(() => {
        setCyclePage((prev) => (prev + 1) % 3);
      }, 3000);
    } else {
      if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);
    }
    return () => {
      if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);
    };
  }, [displayMode]);

  // Telemetry Auto-Streamer Loop
  useEffect(() => {
    if (!isAutoStreaming) {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
      return;
    }

    streamTimerRef.current = setInterval(() => {
      transmitCurrentTelemetry();
    }, streamIntervalMs);

    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, [isAutoStreaming, streamIntervalMs, displayMode, cyclePage, customL1, customL2, telemetry]);

  // Audio alert chime when critical alarm triggers
  useEffect(() => {
    if (telemetry.isAlarm && soundEnabled) {
      playAlarmChime();
    }
  }, [telemetry.isAlarm, soundEnabled]);

  const addLog = (type: 'TX' | 'RX' | 'SYS', text: string) => {
    if (isTerminalPaused) return;
    const now = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [
      ...prev.slice(-99),
      { id: Math.random().toString(36).substring(2, 9), time: now, type, text },
    ]);
  };

  const playAlarmChime = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.08); // D6
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch {
      // Audio fallback
    }
  };

  // Transmit current telemetry to physical or virtual Arduino
  const transmitCurrentTelemetry = async () => {
    const { line1, line2 } = format16x2Lines(telemetry, displayMode, cyclePage, customL1, customL2);
    const csvPacket = formatCsvPacket(telemetry);

    // Send formatted lines to Arduino
    // We send line 1 and line 2, and also CSV packet for full telemetry compatibility
    const payload = `L1:${line1}\nL2:${line2}\n${csvPacket}`;

    setTxActivity(true);
    if (txFlashTimeoutRef.current) clearTimeout(txFlashTimeoutRef.current);
    txFlashTimeoutRef.current = setTimeout(() => setTxActivity(false), 120);

    const success = await arduinoSerial.write(payload);
    setStats(arduinoSerial.getStats());

    if (success) {
      addLog('TX', `L1:"${line1}" | L2:"${line2}"`);
    }
  };

  // Connect to physical USB Serial port
  const handleConnect = async () => {
    // If inside an iframe, native Web Serial device chooser is blocked by browser permissions policy
    if (arduinoSerial.isInIframe()) {
      setShowIframeModal(true);
      return;
    }
    const success = await arduinoSerial.connect(baudRate);
    if (success) {
      addLog('SYS', `Successfully connected to Arduino USB at ${baudRate} baud.`);
    }
  };

  // Connect via Localhost WebSocket Bridge (ws://localhost:8546)
  const handleConnectWebSocket = async () => {
    addLog('SYS', `Attempting local WebSocket bridge connection to ${wsUrl}...`);
    const success = await arduinoSerial.connectWebSocket(wsUrl);
    if (success) {
      addLog('SYS', `Connected to local bridge at ${wsUrl}! Live serial link online.`);
      setShowIframeModal(false);
    }
  };

  // Launch application in dedicated top-level tab (Unlocks Web Serial)
  const handleLaunchTopLevelWindow = () => {
    window.open(window.location.href, '_blank');
  };

  // Disconnect from USB port
  const handleDisconnect = async () => {
    await arduinoSerial.disconnect();
    addLog('SYS', 'Serial connection terminated.');
  };

  // Toggle virtual loopback testing
  const handleToggleLoopback = () => {
    const nextState = !arduinoSerial.isLoopback();
    arduinoSerial.setLoopback(nextState);
    if (nextState) {
      addLog('SYS', 'Virtual Loopback Mode enabled. Emulating Arduino echo and ACK in browser.');
    } else {
      addLog('SYS', 'Virtual Loopback Mode disabled.');
    }
  };

  // Send manual string
  const handleSendManual = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!manualInput.trim()) return;

    const payload = manualInput.endsWith('\n') ? manualInput : manualInput + '\n';
    await arduinoSerial.write(payload);
    addLog('TX', `MANUAL: ${manualInput}`);
    setManualInput('');
  };

  // Copy Arduino sketch
  const handleCopySketch = () => {
    navigator.clipboard.writeText(selectedSketch.sketchCode);
    setCopiedSketch(true);
    setTimeout(() => setCopiedSketch(false), 2000);
  };

  // Download .ino file
  const handleDownloadIno = () => {
    const blob = new Blob([selectedSketch.sketchCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedSketch.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Apply a preset clinical scenario
  const handleSelectScenario = (scenId: string) => {
    const s = CLINICAL_SCENARIOS.find((sc) => sc.id === scenId);
    if (!s) return;

    const deltaT = parseFloat((s.biomarkers.woundTemp - s.vitals.systemicTemp).toFixed(2));
    let ssi = 12;
    if (s.biomarkers.ph > 7.0) ssi += Math.min(45, (s.biomarkers.ph - 7.0) * 35);
    if (deltaT > 0.8) ssi += Math.min(35, (deltaT - 0.5) * 25);

    let adr = s.id.includes('adr') || s.id.includes('dual') ? 78 : 10;
    const fused = Math.min(100, Math.max(10, Math.round(0.55 * ssi + 0.45 * adr)));

    updateTelemetry({
      scenarioId: s.id,
      scenarioTitle: s.title,
      heartRate: s.vitals.heartRate,
      spo2: s.vitals.spo2,
      systemicTemp: s.vitals.systemicTemp,
      respiratoryRate: s.vitals.respiratoryRate,
      ph: s.biomarkers.ph,
      moisture: s.biomarkers.moisture,
      woundTemp: s.biomarkers.woundTemp,
      deltaT,
      ssiRisk: ssi,
      adrRisk: adr,
      fusedRisk: fused,
    });
  };

  // Calculate current formatted lines for LCD rendering
  const { line1: displayL1, line2: displayL2 } = format16x2Lines(
    telemetry,
    displayMode,
    cyclePage,
    customL1,
    customL2
  );
  const lines20x4 = format20x4Lines(telemetry);

  // Helper theme classes for authentic retro LCD styling
  const getLcdThemeStyles = () => {
    if (lcdTheme === 'blue') {
      return {
        bg: backlightOn ? 'bg-[#0038a8]' : 'bg-[#001850]',
        border: 'border-[#002060]',
        cellBg: backlightOn ? 'bg-[#003090]/80' : 'bg-[#001440]',
        text: backlightOn ? 'text-[#ffffff]' : 'text-[#ffffff]/20',
        glow: backlightOn ? 'shadow-[0_0_24px_rgba(0,100,255,0.45)]' : 'shadow-inner',
        inactiveCell: backlightOn ? 'text-[#ffffff]/10' : 'text-transparent',
      };
    } else if (lcdTheme === 'yellow') {
      return {
        bg: backlightOn ? 'bg-[#829910]' : 'bg-[#3b4703]',
        border: 'border-[#4e5c08]',
        cellBg: backlightOn ? 'bg-[#73880c]/80' : 'bg-[#2a3301]',
        text: backlightOn ? 'text-[#121802]' : 'text-[#121802]/25',
        glow: backlightOn ? 'shadow-[0_0_20px_rgba(130,160,20,0.45)]' : 'shadow-inner',
        inactiveCell: backlightOn ? 'text-[#121802]/15' : 'text-transparent',
      };
    } else {
      // Cyber Cyan OLED
      return {
        bg: 'bg-[#030914]',
        border: 'border-cyan-800/60',
        cellBg: 'bg-transparent',
        text: 'text-cyan-300',
        glow: 'shadow-[0_0_25px_rgba(6,182,212,0.3)]',
        inactiveCell: 'text-transparent',
      };
    }
  };

  const themeStyle = getLcdThemeStyles();

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Banner / Portal Context */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Cable className="w-3.5 h-3.5 animate-pulse" />
              Physical Hardware Bridge • Web Serial API
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Arduino &amp; LCD Hardware Portal
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Connect your physical <strong>Arduino Uno / Nano / Mega / ESP32</strong> with a{' '}
              <strong>16x2 LCD, 20x4 LCD, or OLED</strong> over USB. Stream real-time simulated neonatal
              biosensor telemetry (Heart Rate, SpO2, Wound pH, Hyperemia ΔT, and AI Readmission Risk) directly
              to your hardware display with sub-second latency.
            </p>
          </div>

          {/* Quick Hardware Connection Badge & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {serialStatus === 'connected' ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 shadow-md">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <div className="text-left">
                  <div className="text-xs font-bold uppercase tracking-wider">Hardware Online</div>
                  <div className="text-[11px] font-mono text-emerald-200">
                    {arduinoSerial.isLoopback() ? 'Virtual Loopback Active' : stats.portInfo}
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 transition cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleConnect}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
                  title="Connect physical Arduino via USB"
                >
                  <Cable className="w-4 h-4" />
                  Connect Arduino (USB)
                </button>

                <button
                  onClick={handleLaunchTopLevelWindow}
                  title="Open app in a top-level tab to enable full Web Serial permissions"
                  className="flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-xl bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 font-bold text-xs border border-cyan-500/50 shadow-md transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-cyan-400" />
                  <span>Launch Full Window</span>
                </button>

                <button
                  onClick={handleToggleLoopback}
                  title="Test virtual LCD and packet telemetry without physical Arduino plugged in"
                  className="flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-600 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">Virtual Test</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Informative Hardware Bridge Selector Bar */}
        <div className="mt-5 pt-4 border-t border-slate-700/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Option 1: Top-Level Tab Web Serial */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between gap-2">
            <div>
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                1. Dedicated Window (USB Serial)
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                Bypasses iframe permissions by launching the top-level tab. Chrome opens the COM port chooser directly.
              </p>
            </div>
            <button
              onClick={handleLaunchTopLevelWindow}
              className="mt-1 w-full py-1.5 px-2.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              Launch Full Window (Recommended)
            </button>
          </div>

          {/* Option 2: Localhost WebSocket Bridge */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between gap-2">
            <div>
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                2. Local WebSocket Bridge
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                Streams telemetry via <code>ws://localhost:8546</code> to Python. Zero iframe limits.
              </p>
            </div>
            <div className="flex gap-1.5 mt-1">
              <button
                onClick={handleConnectWebSocket}
                className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <Zap className="w-3 h-3" />
                Connect Bridge
              </button>
              <button
                onClick={downloadPythonBridgeScript}
                title="Download python bridge script (bridge.py)"
                className="py-1.5 px-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-semibold transition cursor-pointer"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Option 3: Standalone Zero-Install HTML */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between gap-2">
            <div>
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                3. Standalone Desktop HTML
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                Single zero-dependency file. Double-click to open locally in Chrome with 100% USB hardware access.
              </p>
            </div>
            <button
              onClick={downloadStandaloneTerminalHtml}
              className="mt-1 w-full py-1.5 px-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3 h-3" />
              Download Desktop Terminal (.html)
            </button>
          </div>
        </div>

        {/* Warning if running in an iframe with blocked serial */}
        {serialError && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Hardware Connection Diagnostic:</span> {serialError}
              <div className="mt-1 flex items-center gap-3">
                <button
                  onClick={handleLaunchTopLevelWindow}
                  className="underline font-bold text-white hover:text-cyan-300"
                >
                  Click to Open in Dedicated Window
                </button>
                <span>•</span>
                <button
                  onClick={handleToggleLoopback}
                  className="underline font-bold text-cyan-300 hover:text-white"
                >
                  Enable Virtual Hardware Test
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Iframe Permissions Assistant Modal */}
      {showIframeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-cyan-400">
                <Cable className="w-5 h-5" />
                <h3 className="text-lg font-bold text-white">USB Hardware Access in AI Studio</h3>
              </div>
              <button
                onClick={() => setShowIframeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                <strong>Why did this prompt appear?</strong>
                <br />
                Google Chrome and Microsoft Edge strictly disallow physical USB/Serial port selection dialogs
                inside embedded <code>&lt;iframe&gt;</code> previews to prevent unauthorized device access.
              </div>

              <p className="font-semibold text-white">
                Choose how you would like to connect your Arduino:
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    handleLaunchTopLevelWindow();
                    setShowIframeModal(false);
                  }}
                  className="w-full p-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-left flex items-center justify-between transition cursor-pointer shadow-lg shadow-cyan-600/30"
                >
                  <div>
                    <div className="text-sm font-bold flex items-center gap-1.5">
                      <ExternalLink className="w-4 h-4" />
                      Option 1: Launch in Dedicated Window (Recommended)
                    </div>
                    <div className="text-[11px] text-cyan-100 font-normal mt-0.5">
                      Opens HealSecure in a top-level browser tab where Chrome immediately grants USB serial permission.
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    handleConnectWebSocket();
                    setShowIframeModal(false);
                  }}
                  className="w-full p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left flex items-center justify-between transition cursor-pointer"
                >
                  <div>
                    <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                      <Radio className="w-4 h-4" />
                      Option 2: Connect Localhost Bridge (Stay in this View)
                    </div>
                    <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                      Connects over <code>ws://localhost:8546</code> to our lightweight 30-line Python bridge.
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    handleToggleLoopback();
                    setShowIframeModal(false);
                  }}
                  className="w-full p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-left flex items-center justify-between transition cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Option 3: Use In-Browser Virtual Hardware Simulator
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                      Emulates an active Arduino Uno with ACK packets and real LCD telemetry immediately.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowIframeModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Left Column (Virtual LCD & Transmitter) + Right Column (Hardware Controls & Presets) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* =========================================================================
            LEFT COLUMN: The Physical Virtual LCD Display + Live Telemetry Sliders
           ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* LCD Simulator Bezel Card */}
          <div className="bg-slate-900 border-2 border-slate-700/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            {/* Top Toolbar of LCD Simulator */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Tv className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-sm text-slate-200">
                  Interactive LCD Hardware Preview
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  {lcdSize} Character Display
                </span>
              </div>

              {/* LCD Customization Controls */}
              <div className="flex items-center gap-2 text-xs">
                {/* Theme Selector */}
                <div className="flex items-center rounded-lg bg-slate-800 p-1 border border-slate-700">
                  <button
                    onClick={() => setLcdTheme('blue')}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                      lcdTheme === 'blue'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Blue
                  </button>
                  <button
                    onClick={() => setLcdTheme('yellow')}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                      lcdTheme === 'yellow'
                        ? 'bg-lime-700 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Yellow-Green
                  </button>
                  <button
                    onClick={() => setLcdTheme('oled')}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                      lcdTheme === 'oled'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    OLED
                  </button>
                </div>

                {/* Backlight Toggle */}
                <button
                  onClick={() => setBacklightOn(!backlightOn)}
                  className={`p-1.5 rounded-lg border text-xs font-mono transition ${
                    backlightOn
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                  title="Toggle LCD Backlight"
                >
                  <Zap className="w-4 h-4" />
                </button>

                {/* Sound Chime Toggle */}
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-1.5 rounded-lg border text-xs font-mono transition ${
                    soundEnabled
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                  title={soundEnabled ? 'Alarm Buzzer Sound: ON' : 'Alarm Buzzer Sound: MUTED'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Physical Circuit PCB Frame containing the LCD Module */}
            <div className="mt-5 p-5 sm:p-7 rounded-xl bg-gradient-to-b from-slate-950 to-slate-900 border-4 border-slate-800 shadow-inner relative">
              {/* Corner mounting screw aesthetics */}
              <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-slate-700 border border-slate-500 shadow-sm flex items-center justify-center">
                <span className="w-2 h-0.5 bg-slate-900" />
              </div>
              <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-slate-700 border border-slate-500 shadow-sm flex items-center justify-center">
                <span className="w-2 h-0.5 bg-slate-900" />
              </div>
              <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-slate-700 border border-slate-500 shadow-sm flex items-center justify-center">
                <span className="w-2 h-0.5 bg-slate-900" />
              </div>
              <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-slate-700 border border-slate-500 shadow-sm flex items-center justify-center">
                <span className="w-2 h-0.5 bg-slate-900" />
              </div>

              {/* Pin Header Header Label */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-3 px-1">
                <span>HD44780 / PCF8574T I2C (ADDR: 0x27)</span>
                <span>BAUD: {baudRate} • 8-N-1</span>
              </div>

              {/* THE LCD SCREEN GLASS */}
              <div
                className={`rounded-lg p-4 sm:p-6 transition-all duration-300 border-4 ${themeStyle.bg} ${themeStyle.border} ${themeStyle.glow}`}
                style={{
                  opacity: contrast / 100,
                }}
              >
                {lcdSize === '16x2' ? (
                  <div className="space-y-3 font-mono tracking-wider select-all">
                    {/* Line 1 */}
                    <div className="flex items-center justify-between overflow-x-auto no-scrollbar">
                      <div className="flex gap-1">
                        {displayL1.split('').map((char, i) => (
                          <span
                            key={`l1-${i}`}
                            className={`w-4 sm:w-5 h-7 sm:h-8 flex items-center justify-center text-base sm:text-lg font-bold rounded-xs ${themeStyle.cellBg} ${
                              char === ' ' ? themeStyle.inactiveCell : themeStyle.text
                            } shadow-xs`}
                          >
                            {char === ' ' ? '·' : char}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Line 2 */}
                    <div className="flex items-center justify-between overflow-x-auto no-scrollbar">
                      <div className="flex gap-1">
                        {displayL2.split('').map((char, i) => (
                          <span
                            key={`l2-${i}`}
                            className={`w-4 sm:w-5 h-7 sm:h-8 flex items-center justify-center text-base sm:text-lg font-bold rounded-xs ${themeStyle.cellBg} ${
                              char === ' ' ? themeStyle.inactiveCell : themeStyle.text
                            } shadow-xs`}
                          >
                            {char === ' ' ? '·' : char}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 20x4 Display */
                  <div className="space-y-2 font-mono tracking-wider select-all text-sm sm:text-base">
                    {lines20x4.map((line, idx) => (
                      <div key={`20x4-${idx}`} className="flex gap-0.5 overflow-x-auto no-scrollbar">
                        {line.split('').map((char, i) => (
                          <span
                            key={`row${idx}-${i}`}
                            className={`w-3.5 sm:w-4 h-6 sm:h-7 flex items-center justify-center font-bold text-xs sm:text-sm rounded-xs ${themeStyle.cellBg} ${
                              char === ' ' ? themeStyle.inactiveCell : themeStyle.text
                            }`}
                          >
                            {char === ' ' ? '·' : char}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status LED Indicators on the Circuit Board */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-4">
                  {/* PWR LED */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="text-slate-400">PWR</span>
                  </div>

                  {/* TX LED */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        txActivity
                          ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,1)] scale-125'
                          : 'bg-slate-700'
                      }`}
                    />
                    <span className={txActivity ? 'text-amber-300 font-bold' : 'text-slate-500'}>
                      TX
                    </span>
                  </div>

                  {/* RX LED */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        rxActivity
                          ? 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,1)] scale-125'
                          : 'bg-slate-700'
                      }`}
                    />
                    <span className={rxActivity ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
                      RX
                    </span>
                  </div>

                  {/* ALARM LED */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        telemetry.isAlarm
                          ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,1)] animate-ping'
                          : 'bg-slate-700'
                      }`}
                    />
                    <span
                      className={
                        telemetry.isAlarm ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-500'
                      }
                    >
                      ALARM
                    </span>
                  </div>
                </div>

                {/* Packet Transmit Rate indicator */}
                <div className="text-slate-400 hidden sm:block">
                  Tx Rate:{' '}
                  <strong className="text-cyan-300 font-bold">
                    {(1000 / streamIntervalMs).toFixed(1)} Hz
                  </strong>{' '}
                  ({stats.packetsSent} pkts)
                </div>
              </div>
            </div>

            {/* Display Mode Selector Tabs */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  LCD Display Content Mode
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {displayMode === 'auto_cycle' && `Rotating Page ${cyclePage + 1} of 3`}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setDisplayMode('vitals_biomarkers')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition text-left cursor-pointer ${
                    displayMode === 'vitals_biomarkers'
                      ? 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/20'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  <div className="font-bold">1. Vitals &amp; Wound</div>
                  <div className="text-[10px] opacity-80 truncate">HR, SpO2, pH, ΔT</div>
                </button>

                <button
                  onClick={() => setDisplayMode('risk_alarm')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition text-left cursor-pointer ${
                    displayMode === 'risk_alarm'
                      ? 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/20'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  <div className="font-bold">2. AI Risk &amp; Alert</div>
                  <div className="text-[10px] opacity-80 truncate">Readm %, Status</div>
                </button>

                <button
                  onClick={() => setDisplayMode('auto_cycle')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition text-left cursor-pointer ${
                    displayMode === 'auto_cycle'
                      ? 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/20'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  <div className="font-bold">3. Auto-Cycle (3s)</div>
                  <div className="text-[10px] opacity-80 truncate">Cycles 3 screens</div>
                </button>

                <button
                  onClick={() => setDisplayMode('custom')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition text-left cursor-pointer ${
                    displayMode === 'custom'
                      ? 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/20'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  <div className="font-bold">4. Custom Template</div>
                  <div className="text-[10px] opacity-80 truncate">Custom tags</div>
                </button>
              </div>

              {/* Custom Line Formatter inputs if custom mode selected */}
              {displayMode === 'custom' && (
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3 mt-2">
                  <div className="text-xs text-cyan-300 font-semibold flex items-center justify-between">
                    <span>Available Tags: &#123;hr&#125;, &#123;spo2&#125;, &#123;ph&#125;, &#123;temp&#125;, &#123;dT&#125;, &#123;risk&#125;, &#123;status&#125;</span>
                    <span className="text-[10px] text-slate-400">Max 16 chars per row</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 font-mono block mb-1">
                        Line 1 Template:
                      </label>
                      <input
                        type="text"
                        value={customL1}
                        onChange={(e) => setCustomL1(e.target.value)}
                        maxLength={16}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-mono focus:outline-hidden focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 font-mono block mb-1">
                        Line 2 Template:
                      </label>
                      <input
                        type="text"
                        value={customL2}
                        onChange={(e) => setCustomL2(e.target.value)}
                        maxLength={16}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-mono focus:outline-hidden focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Transmission Controls Bar */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAutoStreaming(!isAutoStreaming)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                    isAutoStreaming
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  {isAutoStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isAutoStreaming ? 'Streaming Telemetry' : 'Telemetry Paused'}
                </button>

                <button
                  onClick={transmitCurrentTelemetry}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold transition cursor-pointer"
                  title="Push single packet immediately"
                >
                  <Send className="w-3 h-3" />
                  Push 1 Packet
                </button>
              </div>

              {/* Stream Rate Dropdown */}
              <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                <span>Rate:</span>
                <select
                  value={streamIntervalMs}
                  onChange={(e) => setStreamIntervalMs(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500 cursor-pointer"
                >
                  <option value={250}>4 Hz (250 ms)</option>
                  <option value={500}>2 Hz (500 ms)</option>
                  <option value={1000}>1 Hz (1,000 ms - Recommended)</option>
                  <option value={2000}>0.5 Hz (2,000 ms)</option>
                  <option value={5000}>0.2 Hz (5,000 ms)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Real-time Interactive Sensor Sliders (Tweak & Watch Arduino LCD Change Instantly) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-600" />
                  Live Sensor Telemetry Modulators
                </h3>
                <p className="text-xs text-slate-500">
                  Slide any biomarker to immediately watch the physical and virtual LCD update.
                </p>
              </div>

              {/* Scenario Preset Pills */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
                  Presets:
                </span>
                <button
                  onClick={() => handleSelectScenario('scenario_baseline')}
                  className="px-2 py-1 rounded text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  title="Scenario 1: Normal Recovery"
                >
                  Normal
                </button>
                <button
                  onClick={() => handleSelectScenario('scenario_ssi_acute')}
                  className="px-2 py-1 rounded text-[11px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                  title="Scenario 2: Acute Early Surgical Site Infection"
                >
                  SSI Alert
                </button>
                <button
                  onClick={() => handleSelectScenario('scenario_gentamicin_adr')}
                  className="px-2 py-1 rounded text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition"
                  title="Scenario 3: Gentamicin ADR"
                >
                  ADR Alert
                </button>
              </div>
            </div>

            {/* Modulators Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Heart Rate */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-600">Heart Rate (HR):</span>
                  <span className="font-mono text-cyan-700 font-bold">
                    {Math.round(telemetry.heartRate)} bpm
                  </span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={200}
                  value={telemetry.heartRate}
                  onChange={(e) => updateTelemetry({ heartRate: Number(e.target.value) })}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>60 bpm (Bradycardia)</span>
                  <span>140 (Normal)</span>
                  <span>200 (Tachy)</span>
                </div>
              </div>

              {/* SpO2 */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-600">Oxygen Saturation (SpO2):</span>
                  <span
                    className={`font-mono font-bold ${
                      telemetry.spo2 < 90 ? 'text-rose-600 animate-pulse' : 'text-cyan-700'
                    }`}
                  >
                    {Math.round(telemetry.spo2)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={75}
                  max={100}
                  value={telemetry.spo2}
                  onChange={(e) => updateTelemetry({ spo2: Number(e.target.value) })}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>75% (Desat)</span>
                  <span>92%</span>
                  <span>100% (Healthy)</span>
                </div>
              </div>

              {/* Wound pH */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-600">Wound pH (Infection Indicator):</span>
                  <span
                    className={`font-mono font-bold ${
                      telemetry.ph > 7.3 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    pH {telemetry.ph.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={5.5}
                  max={8.5}
                  step={0.05}
                  value={telemetry.ph}
                  onChange={(e) => updateTelemetry({ ph: Number(e.target.value) })}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>5.5 (Acidic/Healing)</span>
                  <span>6.8</span>
                  <span>8.5 (Alkaline/SSI)</span>
                </div>
              </div>

              {/* Hyperemia Delta T */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-600">Hyperemia Gradient (ΔT):</span>
                  <span
                    className={`font-mono font-bold ${
                      telemetry.deltaT > 1.2 ? 'text-rose-600' : 'text-amber-600'
                    }`}
                  >
                    +{telemetry.deltaT.toFixed(1)}°C
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={2.5}
                  step={0.1}
                  value={telemetry.deltaT}
                  onChange={(e) => updateTelemetry({ deltaT: Number(e.target.value) })}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>+0.2°C (Normal)</span>
                  <span>+1.0°C</span>
                  <span>+2.5°C (Severe SSI)</span>
                </div>
              </div>
            </div>

            {/* Readmission Risk Gauge Bar */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-800">
                  AI Readmission Risk Sentinel: {Math.round(telemetry.fusedRisk)}%
                </div>
                <div className="text-[11px] text-slate-500">
                  {telemetry.fusedRisk >= 70
                    ? '🚨 High Risk: Dispatches buzzer pulse and red LED alert to Arduino Pin 8 & 13.'
                    : '✅ Nominal Risk: Arduino LCD shows standard stable telemetry.'}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-60">
                <input
                  type="range"
                  min={5}
                  max={100}
                  value={telemetry.fusedRisk}
                  onChange={(e) => updateTelemetry({ fusedRisk: Number(e.target.value) })}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    telemetry.fusedRisk >= 70
                      ? 'bg-rose-100 text-rose-700 border border-rose-300'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  }`}
                >
                  {Math.round(telemetry.fusedRisk)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: Arduino Code Generator, Wiring Diagram & Serial Monitor
           ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* Hardware Code & Sketch Flasher Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-600" />
                  Ready-to-Flash Arduino Firmware
                </h3>
                <p className="text-xs text-slate-500">
                  Select your physical LCD hardware setup to generate matching Arduino code.
                </p>
              </div>
            </div>

            {/* Hardware Select Tabs */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Target Hardware Architecture:
              </label>
              <select
                value={selectedSketch.id}
                onChange={(e) => {
                  const s = ARDUINO_SKETCHES.find((sk) => sk.id === e.target.value);
                  if (s) setSelectedSketch(s);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:outline-hidden focus:border-cyan-500 cursor-pointer"
              >
                {ARDUINO_SKETCHES.map((sketch) => (
                  <option key={sketch.id} value={sketch.id}>
                    {sketch.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Hardware Details & Wiring Table */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Wiring Guide ({selectedSketch.hardware}):</span>
                <span className="text-[11px] font-mono text-cyan-700">Baud: {selectedSketch.baudRate}</span>
              </div>

              {/* Pinout Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400">
                      <th className="pb-1 font-semibold">LCD / Device Pin</th>
                      <th className="pb-1 font-semibold">Arduino Pin</th>
                      <th className="pb-1 font-semibold">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedSketch.wiringTable.map((wire, idx) => (
                      <tr key={idx}>
                        <td className="py-1 font-mono font-bold text-slate-700">{wire.pinName}</td>
                        <td className="py-1 font-mono text-cyan-700 font-bold">{wire.arduinoPin}</td>
                        <td className="py-1 text-slate-500">{wire.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Required Libraries Note */}
              <div className="pt-2 border-t border-slate-200/80 text-[10px] text-slate-500">
                <strong>Required Libraries:</strong> {selectedSketch.libraries.join(' • ')}
              </div>
            </div>

            {/* Arduino IDE Code Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500 font-semibold">
                  {selectedSketch.filename}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySketch}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    {copiedSketch ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSketch ? 'Copied!' : 'Copy Code'}
                  </button>

                  <button
                    onClick={handleDownloadIno}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .ino
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] h-64 overflow-y-auto leading-relaxed border border-slate-700 no-scrollbar selection:bg-cyan-500">
                  <code>{selectedSketch.sketchCode}</code>
                </pre>
              </div>
            </div>

            {/* Quick 3-Step Setup Instructions */}
            <div className="p-3 rounded-xl bg-cyan-50/70 border border-cyan-200/70 text-[11px] text-cyan-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                How to Upload to Your Arduino:
              </div>
              <ol className="list-decimal list-inside space-y-0.5 text-cyan-800 text-[10.5px]">
                <li>Copy the code above and paste it into the <strong>Arduino IDE</strong>.</li>
                <li>Go to <em>Sketch &gt; Include Library &gt; Manage Libraries</em> and install <code>LiquidCrystal_I2C</code>.</li>
                <li>Connect your Arduino via USB, click <strong>Upload (Ctrl+U)</strong>, then click <strong>"Connect Arduino (USB)"</strong> above!</li>
              </ol>
            </div>

            {/* Iframe & USB Permission Bridge Toolkit */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="font-bold flex items-center gap-1.5 text-cyan-400">
                  <Cable className="w-3.5 h-3.5" />
                  <span>Can't access USB in preview iframe?</span>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  Hardware Bridges
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-normal">
                Embedded browser iframes block Chrome's COM port selector. Use any of these 3 instant solutions:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* Method 1: New Tab */}
                <button
                  onClick={handleLaunchTopLevelWindow}
                  className="py-2 px-2.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-left flex items-center gap-2 transition cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 shrink-0 text-cyan-400" />
                  <div>
                    <div className="text-[11px] font-bold">1. Open Dedicated Tab</div>
                    <div className="text-[10px] text-cyan-200/70">Unlocks native Web Serial</div>
                  </div>
                </button>

                {/* Method 2: Python Bridge */}
                <button
                  onClick={downloadPythonBridgeScript}
                  className="py-2 px-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-left flex items-center gap-2 transition cursor-pointer"
                >
                  <Download className="w-4 h-4 shrink-0 text-emerald-400" />
                  <div>
                    <div className="text-[11px] font-bold">2. Download bridge.py</div>
                    <div className="text-[10px] text-emerald-200/70">WebSocket to COM port</div>
                  </div>
                </button>
              </div>

              {/* Method 3: Standalone Desktop HTML */}
              <div className="pt-1 flex items-center justify-between gap-2">
                <button
                  onClick={downloadStandaloneTerminalHtml}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>3. Download Standalone Desktop HTML (Zero Dependencies)</span>
                </button>
              </div>

              <div className="p-2 rounded-lg bg-slate-950 font-mono text-[10px] text-slate-400 flex items-center justify-between">
                <span>$ pip install pyserial websockets &amp;&amp; python bridge.py</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('pip install pyserial websockets && python bridge.py');
                    setCopiedBridgeCmd(true);
                    setTimeout(() => setCopiedBridgeCmd(false), 2000);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 ml-2 shrink-0 cursor-pointer"
                  title="Copy command"
                >
                  {copiedBridgeCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Live Serial Terminal & Diagnostic Packet Monitor */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-200">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold font-mono">Serial Packet Monitor &amp; Console</h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTerminalPaused(!isTerminalPaused)}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  {isTerminalPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={() => setTerminalLogs([])}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-400 transition cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Log Stream Window */}
            <div className="h-44 overflow-y-auto bg-slate-950 rounded-xl p-3 font-mono text-[11px] space-y-1.5 border border-slate-800/80 no-scrollbar">
              {terminalLogs.length === 0 ? (
                <div className="text-slate-500 italic text-center py-8">
                  Waiting for serial packets... Click "Push 1 Packet" or enable Auto-Stream to transmit.
                </div>
              ) : (
                terminalLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 leading-tight break-all">
                    <span className="text-slate-500 text-[10px] shrink-0">{log.time}</span>
                    <span
                      className={`px-1 rounded text-[9px] font-bold shrink-0 ${
                        log.type === 'TX'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : log.type === 'RX'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {log.type}
                    </span>
                    <span
                      className={
                        log.type === 'TX'
                          ? 'text-slate-300'
                          : log.type === 'RX'
                          ? 'text-cyan-300'
                          : 'text-purple-300'
                      }
                    >
                      {log.text}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Manual Command Dispatch Bar */}
            <form onSubmit={handleSendManual} className="flex items-center gap-2">
              <input
                type="text"
                placeholder='Type custom command e.g. "L1:PATIENT STABLE" or "CLS"...'
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono focus:outline-hidden focus:border-cyan-500 placeholder:text-slate-600"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Send className="w-3 h-3" />
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
