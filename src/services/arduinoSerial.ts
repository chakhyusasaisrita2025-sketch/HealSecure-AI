export type SerialConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'unsupported';

export type ConnectionMode = 'webserial' | 'websocket' | 'virtual';

export interface SerialStats {
  bytesSent: number;
  packetsSent: number;
  bytesReceived: number;
  packetsReceived: number;
  lastTxTime: number | null;
  lastRxTime: number | null;
  connectedAt: number | null;
  portInfo: string;
  mode: ConnectionMode;
}

export type RxDataCallback = (data: string) => void;
export type StatusChangeCallback = (status: SerialConnectionStatus, error?: string) => void;

class ArduinoSerialManager {
  private port: any = null;
  private writer: any = null;
  private reader: any = null;
  private ws: WebSocket | null = null;
  private keepReading: boolean = false;
  private status: SerialConnectionStatus = 'disconnected';
  private lastErrorMessage: string = '';
  private rxCallbacks: Set<RxDataCallback> = new Set();
  private statusCallbacks: Set<StatusChangeCallback> = new Set();
  private connectionMode: ConnectionMode = 'virtual';

  private stats: SerialStats = {
    bytesSent: 0,
    packetsSent: 0,
    bytesReceived: 0,
    packetsReceived: 0,
    lastTxTime: null,
    lastRxTime: null,
    connectedAt: null,
    portInfo: 'None',
    mode: 'virtual',
  };

  constructor() {
    if (typeof window !== 'undefined' && 'serial' in navigator) {
      try {
        (navigator as any).serial.addEventListener('disconnect', (event: any) => {
          if (this.port && event.target === this.port) {
            this.disconnect();
          }
        });
      } catch (e) {
        // ignore
      }
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'serial' in navigator;
  }

  public isInIframe(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }

  public getStatus(): SerialConnectionStatus {
    return this.status;
  }

  public getMode(): ConnectionMode {
    return this.connectionMode;
  }

  public getLastError(): string {
    return this.lastErrorMessage;
  }

  public getStats(): SerialStats {
    return { ...this.stats };
  }

  public isLoopback(): boolean {
    return this.connectionMode === 'virtual' && this.status === 'connected';
  }

  public setLoopback(enable: boolean) {
    if (enable) {
      this.disconnect();
      this.connectionMode = 'virtual';
      this.status = 'connected';
      this.stats.connectedAt = Date.now();
      this.stats.portInfo = 'Virtual Hardware Emulator (Loopback)';
      this.stats.mode = 'virtual';
      this.notifyStatus('connected');
    } else if (this.connectionMode === 'virtual') {
      this.disconnect();
    }
  }

  public onRx(callback: RxDataCallback): () => void {
    this.rxCallbacks.add(callback);
    return () => this.rxCallbacks.delete(callback);
  }

  public onStatusChange(callback: StatusChangeCallback): () => void {
    this.statusCallbacks.add(callback);
    callback(this.status, this.lastErrorMessage);
    return () => this.statusCallbacks.delete(callback);
  }

  private notifyStatus(status: SerialConnectionStatus, error: string = '') {
    this.status = status;
    this.lastErrorMessage = error;
    this.statusCallbacks.forEach((cb) => cb(status, error));
  }

  private notifyRx(data: string) {
    this.rxCallbacks.forEach((cb) => cb(data));
  }

  /**
   * Connect via native browser Web Serial API (requires top-level window in Chrome/Edge)
   */
  public async connect(baudRate: number = 9600): Promise<boolean> {
    if (!this.isSupported()) {
      this.notifyStatus(
        'unsupported',
        'Web Serial API is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Opera on desktop.'
      );
      return false;
    }

    // Check if running in an iframe
    if (this.isInIframe()) {
      const msg =
        'Browser Security Policy: Web Serial device access is strictly disallowed inside embedded iframes. Click "Open in New Window" to launch the top-level applet where USB device permissions are unlocked.';
      this.notifyStatus('error', msg);
      return false;
    }

    try {
      this.notifyStatus('connecting');

      // Request port prompt
      const serial = (navigator as any).serial;
      this.port = await serial.requestPort();

      // Get info if available
      const info = this.port.getInfo ? this.port.getInfo() : {};
      const usbVendor = info.usbVendorId ? `0x${info.usbVendorId.toString(16).toUpperCase()}` : '';
      const usbProduct = info.usbProductId ? `0x${info.usbProductId.toString(16).toUpperCase()}` : '';
      const portDesc = usbVendor ? `USB Port (VID:${usbVendor} PID:${usbProduct})` : 'Arduino Serial Port';

      await this.port.open({
        baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        bufferSize: 255,
        flowControl: 'none',
      });

      this.connectionMode = 'webserial';
      this.stats.mode = 'webserial';
      this.stats.connectedAt = Date.now();
      this.stats.portInfo = `${portDesc} @ ${baudRate} baud`;

      // Start reader loop
      this.startReading();

      this.notifyStatus('connected');
      return true;
    } catch (err: any) {
      console.warn('Web Serial connect error:', err);
      let msg = err.message || 'Failed to open Serial port';

      if (err.name === 'SecurityError' || String(err).includes('permissions policy')) {
        msg =
          'Iframe security restriction: Web Serial requires top-level permission. Please click "Open in New Window" at the top of the portal to connect your physical Arduino via USB.';
      } else if (err.name === 'NotFoundError') {
        msg = 'No serial port selected.';
      }

      this.notifyStatus('error', msg);
      return false;
    }
  }

  /**
   * Connect via Localhost WebSocket Bridge (ws://localhost:8546)
   * This completely bypasses iframe restrictions! Works in ANY browser and iframe!
   */
  public async connectWebSocket(url: string = 'ws://localhost:8546'): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.notifyStatus('connecting');
        if (this.ws) {
          try {
            this.ws.close();
          } catch (e) {
            // ignore
          }
          this.ws = null;
        }

        const socket = new WebSocket(url);

        socket.onopen = () => {
          this.ws = socket;
          this.connectionMode = 'websocket';
          this.stats.mode = 'websocket';
          this.stats.connectedAt = Date.now();
          this.stats.portInfo = `Local WebSocket Bridge (${url})`;
          this.notifyStatus('connected');
          resolve(true);
        };

        socket.onmessage = (event) => {
          const data = typeof event.data === 'string' ? event.data : String(event.data);
          this.stats.bytesReceived += data.length;
          this.stats.packetsReceived += 1;
          this.stats.lastRxTime = Date.now();
          this.notifyRx(data);
        };

        socket.onerror = (err) => {
          console.warn('WebSocket Bridge error:', err);
          if (this.status === 'connecting') {
            this.notifyStatus(
              'error',
              `Could not connect to ${url}. Make sure your local Python or Node bridge is running (python bridge.py).`
            );
            resolve(false);
          }
        };

        socket.onclose = () => {
          if (this.connectionMode === 'websocket' && this.status === 'connected') {
            this.notifyStatus('disconnected', 'WebSocket bridge connection closed.');
          }
          this.ws = null;
        };

        // 3s timeout
        setTimeout(() => {
          if (this.status === 'connecting') {
            try {
              socket.close();
            } catch (e) {
              // ignore
            }
            this.notifyStatus(
              'error',
              `Timeout connecting to ${url}. Start the bridge script with: python bridge.py`
            );
            resolve(false);
          }
        }, 3000);
      } catch (err: any) {
        this.notifyStatus('error', err.message || 'Failed to initialize WebSocket bridge');
        resolve(false);
      }
    });
  }

  /**
   * Disconnect port or bridge cleanly
   */
  public async disconnect(): Promise<void> {
    this.keepReading = false;

    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
        // ignore
      }
      this.ws = null;
    }

    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch (e) {
        // ignore
      }
      this.reader = null;
    }

    if (this.writer) {
      try {
        await this.writer.close();
      } catch (e) {
        // ignore
      }
      this.writer = null;
    }

    if (this.port) {
      try {
        await this.port.close();
      } catch (e) {
        // ignore
      }
      this.port = null;
    }

    this.stats.portInfo = 'None';
    this.connectionMode = 'virtual';
    this.notifyStatus('disconnected');
  }

  /**
   * Send text line or payload to Arduino via Web Serial, WebSocket, or Virtual Loopback
   */
  public async write(text: string): Promise<boolean> {
    const bytes = new TextEncoder().encode(text);
    this.stats.bytesSent += bytes.length;
    this.stats.packetsSent += 1;
    this.stats.lastTxTime = Date.now();

    // 1. Virtual loopback mode: emulate response from Arduino firmware
    if (this.connectionMode === 'virtual') {
      setTimeout(() => {
        this.stats.bytesReceived += 4;
        this.stats.packetsReceived += 1;
        this.stats.lastRxTime = Date.now();
        this.notifyRx(`[ARDUINO_ACK] ${text.trim().slice(0, 20)} OK\r\n`);
      }, 40);
      return true;
    }

    // 2. WebSocket bridge mode
    if (this.connectionMode === 'websocket' && this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(text);
        return true;
      } catch (err: any) {
        console.error('WebSocket send error:', err);
        return false;
      }
    }

    // 3. Web Serial mode
    if (!this.port || !this.port.writable) {
      return false;
    }

    try {
      const writer = this.port.writable.getWriter();
      await writer.write(bytes);
      writer.releaseLock();
      return true;
    } catch (err: any) {
      console.error('Serial write error:', err);
      this.lastErrorMessage = err.message || 'Write failed';
      return false;
    }
  }

  /**
   * Background read loop for incoming serial data from Arduino
   */
  private async startReading() {
    this.keepReading = true;
    while (this.port && this.port.readable && this.keepReading) {
      try {
        const textDecoder = new TextDecoderStream();
        this.port.readable.pipeTo(textDecoder.writable).catch(() => {});
        this.reader = textDecoder.readable.getReader();

        while (true) {
          const { value, done } = await this.reader.read();
          if (done) break;
          if (value) {
            this.stats.bytesReceived += value.length;
            this.stats.packetsReceived += 1;
            this.stats.lastRxTime = Date.now();
            this.notifyRx(value);
          }
        }
      } catch (err: any) {
        if (this.keepReading) {
          console.warn('Serial read warning:', err);
        }
        break;
      }
    }
  }
}

export const arduinoSerial = new ArduinoSerialManager();
