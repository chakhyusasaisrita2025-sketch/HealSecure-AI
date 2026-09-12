/**
 * Generates and triggers download of standalone zero-dependency HTML / Python bridges
 * for 100% reliable hardware access without any browser iframe restrictions.
 */

export function downloadStandaloneTerminalHtml() {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HealSecure AI • Standalone USB & LCD Hardware Terminal</title>
  <style>
    :root {
      --bg: #0b1120;
      --card: #151f32;
      --border: #22324e;
      --text: #e2e8f0;
      --cyan: #06b6d4;
      --cyan-hover: #0891b2;
      --lcd-bg: #0038a8;
      --lcd-cell: #003090;
      --lcd-text: #ffffff;
      --lcd-inactive: rgba(255, 255, 255, 0.12);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; }
    body { background: var(--bg); color: var(--text); padding: 24px; min-height: 100vh; }
    .container { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
    .header { background: linear-gradient(135deg, #101c36, #082f49); padding: 20px 24px; border-radius: 16px; border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .title h1 { font-size: 20px; color: #fff; margin-bottom: 4px; }
    .title p { font-size: 13px; color: #94a3b8; }
    .btn { background: var(--cyan); color: #fff; font-weight: 700; font-size: 13px; padding: 10px 18px; border-radius: 10px; border: none; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 8px; }
    .btn:hover { background: var(--cyan-hover); }
    .btn-secondary { background: #1e293b; border: 1px solid #334155; color: #cbd5e1; }
    .btn-secondary:hover { background: #334155; }
    .btn-danger { background: #e11d48; }
    .status-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px; background: rgba(6,182,212,0.15); color: #38bdf8; border: 1px solid rgba(6,182,212,0.3); }
    .status-connected { background: rgba(16,185,129,0.15); color: #34d399; border-color: rgba(16,185,129,0.3); }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media (max-width: 800px) { .grid { grid-template-columns: 1fr; } }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 20px; }
    .card-title { font-size: 14px; font-weight: 700; color: #94a3b8; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; text-transform: uppercase; letter-spacing: 0.05em; }
    
    /* LCD Styling */
    .lcd-bezel { background: #020617; border: 4px solid #1e293b; border-radius: 14px; padding: 16px; box-shadow: inset 0 0 20px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.5); }
    .lcd-screen { background: var(--lcd-bg); border-radius: 6px; padding: 16px 14px; display: flex; flex-direction: column; gap: 8px; font-family: "Courier New", Courier, monospace; letter-spacing: 2px; }
    .lcd-line { display: flex; gap: 2px; overflow: hidden; }
    .lcd-cell { width: 18px; height: 26px; background: var(--lcd-cell); color: var(--lcd-text); font-weight: bold; font-size: 16px; display: flex; align-items: center; justify-content: center; border-radius: 2px; }
    .lcd-cell.inactive { color: var(--lcd-inactive); }
    
    /* Controls */
    .slider-group { margin-bottom: 14px; }
    .slider-label { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: #cbd5e1; }
    .slider-label span strong { color: var(--cyan); }
    input[type=range] { width: 100%; accent-color: var(--cyan); }
    .presets { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
    .presets button { flex: 1; min-width: 90px; padding: 6px 10px; font-size: 11px; font-weight: 600; border-radius: 8px; border: 1px solid #334155; background: #1e293b; color: #cbd5e1; cursor: pointer; }
    .presets button:hover { background: #334155; color: #fff; }
    
    /* Terminal Console */
    .terminal { background: #020617; border: 1px solid #1e293b; border-radius: 10px; height: 180px; overflow-y: auto; padding: 10px; font-family: monospace; font-size: 11px; display: flex; flex-direction: column; gap: 4px; }
    .log-entry { display: flex; gap: 8px; line-height: 1.4; }
    .log-tx { color: #f59e0b; }
    .log-rx { color: #38bdf8; }
    .log-sys { color: #a855f7; }
    .tx-bar { display: flex; gap: 8px; margin-top: 10px; }
    .tx-input { flex: 1; background: #020617; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; color: #38bdf8; font-family: monospace; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">
        <h1>⚡ HealSecure AI • Standalone USB &amp; LCD Terminal</h1>
        <p>Direct native Web Serial API bridge. Zero iframe restrictions. Zero installation.</p>
      </div>
      <div style="display:flex; gap:10px; align-items:center;">
        <select id="baudRate" class="btn btn-secondary" style="padding: 10px 12px;">
          <option value="9600" selected>9600 Baud</option>
          <option value="115200">115200 Baud</option>
          <option value="57600">57600 Baud</option>
        </select>
        <button id="connectBtn" class="btn">🔌 Connect Arduino (USB)</button>
        <button id="loopbackBtn" class="btn btn-secondary">Virtual Test</button>
      </div>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; background:#1e293b; padding:10px 16px; border-radius:10px; font-size:12px;">
      <div style="display:flex; gap:12px; align-items:center;">
        <span id="statusBadge" class="status-badge">Disconnected</span>
        <span id="portLabel" style="color:#94a3b8; font-family:monospace;">No port connected</span>
      </div>
      <div style="display:flex; gap:16px; color:#94a3b8; font-family:monospace; font-size:11px;">
        <span>TX: <strong id="txCount" style="color:#f59e0b;">0</strong></span>
        <span>RX: <strong id="rxCount" style="color:#38bdf8;">0</strong></span>
        <span>Rate: <strong style="color:#34d399;">1.0 Hz</strong></span>
      </div>
    </div>

    <div class="grid">
      <!-- Left: LCD Simulator & Presets -->
      <div class="card">
        <div class="card-title">
          <span>Physical 16x2 LCD Display</span>
          <span style="font-size:11px; color:#38bdf8; text-transform:none;">HD44780 / I2C</span>
        </div>

        <div class="lcd-bezel">
          <div class="lcd-screen">
            <div id="lcdRow1" class="lcd-line"></div>
            <div id="lcdRow2" class="lcd-line"></div>
          </div>
        </div>

        <div style="margin-top: 16px;">
          <div style="font-size:12px; color:#94a3b8; margin-bottom:8px; font-weight:600;">CLINICAL SCENARIO PRESETS:</div>
          <div class="presets">
            <button onclick="setScenario('normal')">Normal Recovery</button>
            <button onclick="setScenario('ssi')">Acute SSI Infection</button>
            <button onclick="setScenario('gentamicin')">Gentamicin ADR</button>
          </div>
        </div>
      </div>

      <!-- Right: Live Sensor Telemetry Sliders -->
      <div class="card">
        <div class="card-title">
          <span>Telemetry Modulators</span>
          <label style="font-size:11px; color:#38bdf8; display:flex; align-items:center; gap:6px; cursor:pointer;">
            <input type="checkbox" id="autoStream" checked /> Auto-Stream (1s)
          </label>
        </div>

        <div class="slider-group">
          <div class="slider-label"><span>Heart Rate</span><span><strong id="hrVal">138</strong> bpm</span></div>
          <input type="range" id="hr" min="80" max="220" value="138" oninput="updateValues()" />
        </div>

        <div class="slider-group">
          <div class="slider-label"><span>Oxygen Saturation (SpO2)</span><span><strong id="spo2Val">98</strong> %</span></div>
          <input type="range" id="spo2" min="70" max="100" value="98" oninput="updateValues()" />
        </div>

        <div class="slider-group">
          <div class="slider-label"><span>Wound Bed pH</span><span><strong id="phVal">7.40</strong> pH</span></div>
          <input type="range" id="ph" min="6.0" max="9.0" step="0.05" value="7.40" oninput="updateValues()" />
        </div>

        <div class="slider-group">
          <div class="slider-label"><span>Hyperemia Temp Gradient (ΔT)</span><span><strong id="dtVal">+1.2</strong> °C</span></div>
          <input type="range" id="dt" min="-1.0" max="4.0" step="0.1" value="1.2" oninput="updateValues()" />
        </div>

        <div class="slider-group">
          <div class="slider-label"><span>Fused Readmission Risk</span><span><strong id="riskVal">78</strong> %</span></div>
          <input type="range" id="risk" min="5" max="99" value="78" oninput="updateValues()" />
        </div>
      </div>
    </div>

    <!-- Packet Console -->
    <div class="card">
      <div class="card-title">
        <span>Serial Terminal Packet Stream</span>
        <button class="btn btn-secondary" style="padding:4px 10px; font-size:11px;" onclick="clearLogs()">Clear Console</button>
      </div>
      <div id="terminal" class="terminal"></div>
      <div class="tx-bar">
        <input type="text" id="manualInput" class="tx-input" placeholder='Type custom command e.g. "L1:SYSTEM OK" or "HELLO"...' />
        <button class="btn" onclick="sendManual()">Send</button>
      </div>
    </div>
  </div>

  <script>
    let port = null;
    let writer = null;
    let reader = null;
    let isLoopback = false;
    let txCount = 0;
    let rxCount = 0;

    const connectBtn = document.getElementById('connectBtn');
    const loopbackBtn = document.getElementById('loopbackBtn');
    const statusBadge = document.getElementById('statusBadge');
    const portLabel = document.getElementById('portLabel');
    const terminal = document.getElementById('terminal');

    function log(type, text) {
      const time = new Date().toLocaleTimeString();
      const div = document.createElement('div');
      div.className = 'log-entry';
      div.innerHTML = \`<span style="color:#64748b; font-size:10px;">\${time}</span><span class="log-\${type}">[\${type.toUpperCase()}]</span> <span>\${text}</span>\`;
      terminal.appendChild(div);
      terminal.scrollTop = terminal.scrollHeight;
    }

    function clearLogs() { terminal.innerHTML = ''; }

    function updateLcdDisplay(l1, l2) {
      const pad1 = (l1 + '                ').slice(0, 16);
      const pad2 = (l2 + '                ').slice(0, 16);

      const r1 = document.getElementById('lcdRow1');
      const r2 = document.getElementById('lcdRow2');
      r1.innerHTML = '';
      r2.innerHTML = '';

      for (let char of pad1) {
        const span = document.createElement('span');
        span.className = 'lcd-cell' + (char === ' ' ? ' inactive' : '');
        span.textContent = char === ' ' ? '·' : char;
        r1.appendChild(span);
      }
      for (let char of pad2) {
        const span = document.createElement('span');
        span.className = 'lcd-cell' + (char === ' ' ? ' inactive' : '');
        span.textContent = char === ' ' ? '·' : char;
        r2.appendChild(span);
      }
    }

    function getFormattedLines() {
      const hr = document.getElementById('hr').value;
      const spo2 = document.getElementById('spo2').value;
      const ph = parseFloat(document.getElementById('ph').value).toFixed(2);
      const dtNum = parseFloat(document.getElementById('dt').value);
      const dtStr = (dtNum >= 0 ? '+' : '') + dtNum.toFixed(1);
      const risk = document.getElementById('risk').value;

      const l1 = \`HR:\${hr.padStart(3)} SpO2:\${spo2}%\`.slice(0, 16);
      const l2 = risk >= 70 ? \`RISK:\${risk}% !ALARM!\`.slice(0, 16) : \`pH:\${ph} dT:\${dtStr}C\`.slice(0, 16);
      return { l1, l2, hr, spo2, ph, dtNum, risk };
    }

    function updateValues() {
      document.getElementById('hrVal').textContent = document.getElementById('hr').value;
      document.getElementById('spo2Val').textContent = document.getElementById('spo2').value;
      document.getElementById('phVal').textContent = parseFloat(document.getElementById('ph').value).toFixed(2);
      const dt = parseFloat(document.getElementById('dt').value);
      document.getElementById('dtVal').textContent = (dt >= 0 ? '+' : '') + dt.toFixed(1);
      document.getElementById('riskVal').textContent = document.getElementById('risk').value;

      const { l1, l2 } = getFormattedLines();
      updateLcdDisplay(l1, l2);
    }

    function setScenario(type) {
      if (type === 'normal') {
        document.getElementById('hr').value = 125;
        document.getElementById('spo2').value = 99;
        document.getElementById('ph').value = 7.35;
        document.getElementById('dt').value = 0.3;
        document.getElementById('risk').value = 14;
      } else if (type === 'ssi') {
        document.getElementById('hr').value = 168;
        document.getElementById('spo2').value = 93;
        document.getElementById('ph').value = 8.20;
        document.getElementById('dt').value = 2.4;
        document.getElementById('risk').value = 86;
      } else if (type === 'gentamicin') {
        document.getElementById('hr').value = 145;
        document.getElementById('spo2').value = 96;
        document.getElementById('ph').value = 7.42;
        document.getElementById('dt').value = 0.8;
        document.getElementById('risk').value = 65;
      }
      updateValues();
      sendPacket();
    }

    async function sendPacket() {
      const { l1, l2, hr, spo2, ph, dtNum, risk } = getFormattedLines();
      const isAlarm = risk >= 70 ? 1 : 0;
      const csv = \`$HS,\${hr},\${spo2},37.2,\${ph},65,\${dtNum},\${risk},\${isAlarm}\\n\`;
      const fullPayload = \`L1:\${l1}\\nL2:\${l2}\\n\${csv}\`;

      if (isLoopback) {
        txCount++;
        document.getElementById('txCount').textContent = txCount;
        log('tx', fullPayload.replace(/\\n/g, ' '));
        setTimeout(() => {
          rxCount++;
          document.getElementById('rxCount').textContent = rxCount;
          log('rx', \`[ARDUINO_ACK] OK\`);
        }, 50);
        return;
      }

      if (writer) {
        try {
          const encoder = new TextEncoder();
          await writer.write(encoder.encode(fullPayload));
          txCount++;
          document.getElementById('txCount').textContent = txCount;
          log('tx', fullPayload.replace(/\\n/g, ' '));
        } catch (e) {
          log('sys', 'Write error: ' + e.message);
        }
      }
    }

    async function connectSerial() {
      if (!('serial' in navigator)) {
        alert('Web Serial API is not supported in this browser. Please use Google Chrome or Edge.');
        return;
      }

      try {
        const baudRate = parseInt(document.getElementById('baudRate').value, 10);
        port = await navigator.serial.requestPort();
        await port.open({ baudRate });

        writer = port.writable.getWriter();
        isLoopback = false;

        statusBadge.textContent = 'Hardware Online';
        statusBadge.className = 'status-badge status-connected';
        portLabel.textContent = 'Arduino Connected (' + baudRate + ' baud)';
        connectBtn.textContent = 'Disconnect';
        connectBtn.className = 'btn btn-danger';
        connectBtn.onclick = disconnectSerial;
        log('sys', 'Connected to physical Arduino port successfully.');

        readSerialLoop();
      } catch (err) {
        log('sys', 'Connection canceled or failed: ' + err.message);
      }
    }

    async function disconnectSerial() {
      try {
        if (writer) { await writer.close(); writer = null; }
        if (reader) { await reader.cancel(); reader = null; }
        if (port) { await port.close(); port = null; }
      } catch (e) {}

      statusBadge.textContent = 'Disconnected';
      statusBadge.className = 'status-badge';
      portLabel.textContent = 'No port connected';
      connectBtn.textContent = '🔌 Connect Arduino (USB)';
      connectBtn.className = 'btn';
      connectBtn.onclick = connectSerial;
      isLoopback = false;
      log('sys', 'Disconnected from serial port.');
    }

    async function readSerialLoop() {
      while (port && port.readable) {
        try {
          const textDecoder = new TextDecoderStream();
          port.readable.pipeTo(textDecoder.writable).catch(() => {});
          reader = textDecoder.readable.getReader();
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              rxCount++;
              document.getElementById('rxCount').textContent = rxCount;
              log('rx', value.trim());
            }
          }
        } catch (e) {
          break;
        }
      }
    }

    loopbackBtn.onclick = () => {
      isLoopback = !isLoopback;
      if (isLoopback) {
        statusBadge.textContent = 'Virtual Loopback';
        statusBadge.className = 'status-badge status-connected';
        portLabel.textContent = 'In-Browser Emulated Arduino';
        loopbackBtn.textContent = 'Stop Virtual';
        log('sys', 'Virtual loopback mode active. Packets will receive instant emulated ACK.');
      } else {
        statusBadge.textContent = 'Disconnected';
        statusBadge.className = 'status-badge';
        portLabel.textContent = 'No port connected';
        loopbackBtn.textContent = 'Virtual Test';
        log('sys', 'Virtual loopback stopped.');
      }
    };

    connectBtn.onclick = connectSerial;

    function sendManual() {
      const input = document.getElementById('manualInput');
      const val = input.value.trim();
      if (!val) return;
      if (isLoopback) {
        log('tx', val);
        setTimeout(() => log('rx', '[ACK] ' + val), 40);
      } else if (writer) {
        writer.write(new TextEncoder().encode(val + '\\n'));
        log('tx', val);
      } else {
        alert('Please connect Arduino or enable Virtual Test first!');
      }
      input.value = '';
    }

    // Auto-stream interval (1 second)
    setInterval(() => {
      if (document.getElementById('autoStream').checked && (writer || isLoopback)) {
        sendPacket();
      }
    }, 1000);

    // Initial render
    updateValues();
    log('sys', 'Standalone terminal initialized. Ready to connect USB device.');
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'HealSecure_USB_LCD_Terminal.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadPythonBridgeScript() {
  const pythonContent = `#!/usr/bin/env python3
"""
HealSecure AI • Local Serial & WebSocket Hardware Bridge
Relays live telemetry from the HealSecure Web Portal to any physical Arduino USB COM port.
Bypasses all browser iframe security restrictions.

Requirements:
    pip install pyserial websockets asyncio

Usage:
    python bridge.py                 # auto-detects first Arduino COM port
    python bridge.py COM3            # Windows example
    python bridge.py /dev/ttyUSB0    # Linux example
    python bridge.py /dev/tty.usbmodem14101 # macOS example
"""

import sys
import glob
import asyncio
import json
try:
    import serial
    import serial.tools.list_ports
except ImportError:
    print("ERROR: pyserial is required. Please run: pip install pyserial websockets")
    sys.exit(1)

try:
    import websockets
except ImportError:
    print("ERROR: websockets is required. Please run: pip install websockets")
    sys.exit(1)

WS_PORT = 8546

def find_serial_port():
    ports = list(serial.tools.list_ports.comports())
    for p in ports:
        desc = (p.description or "").lower()
        if any(x in desc for x in ["arduino", "ch340", "cp210", "ftdi", "usb serial"]):
            return p.device
    if ports:
        return ports[0].device
    return None

def main():
    port_name = sys.argv[1] if len(sys.argv) > 1 else find_serial_port()
    if not port_name:
        print("[!] No USB serial port specified or detected.")
        print("    Usage: python bridge.py <PORT_NAME> (e.g. COM3 or /dev/ttyUSB0)")
        sys.exit(1)

    print(f"[*] Opening Serial Port: {port_name} @ 9600 baud...")
    try:
        ser = serial.Serial(port_name, 9600, timeout=0.1)
    except Exception as e:
        print(f"[!] Failed to open serial port {port_name}: {e}")
        sys.exit(1)

    print(f"[✓] Serial port {port_name} OPENED successfully.")
    print(f"[*] Starting WebSocket Bridge on ws://localhost:{WS_PORT}...")
    print(f"    In the HealSecure Portal, click 'Connect Local Bridge (ws://localhost:{WS_PORT})'!")

    connected_clients = set()

    async def serial_reader():
        while True:
            try:
                if ser.in_waiting > 0:
                    line = ser.readline().decode('utf-8', errors='ignore')
                    if line:
                        print(f"  [ARDUINO -> WEB] {line.strip()}")
                        for ws in list(connected_clients):
                            await ws.send(f"[RX] {line.strip()}\\n")
            except Exception as e:
                pass
            await asyncio.sleep(0.05)

    async def ws_handler(websocket):
        print(f"[+] HealSecure Web Portal connected via WebSocket!")
        connected_clients.add(websocket)
        try:
            async for message in websocket:
                print(f"  [WEB -> ARDUINO] {message.strip()}")
                ser.write(message.encode('utf-8'))
                ser.flush()
        except Exception as e:
            print(f"[-] Client disconnected: {e}")
        finally:
            connected_clients.remove(websocket)

    async def run_server():
        async with websockets.serve(ws_handler, "localhost", WS_PORT):
            await serial_reader()

    try:
        asyncio.run(run_server())
    except KeyboardInterrupt:
        print("\\n[*] Shutting down bridge.")
        ser.close()

if __name__ == "__main__":
    main()
`;

  const blob = new Blob([pythonContent], { type: 'text/x-python' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'healsecure_bridge.py';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
