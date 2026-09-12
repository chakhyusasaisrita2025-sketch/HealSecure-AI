export interface ArduinoSketchDef {
  id: string;
  title: string;
  hardware: string;
  description: string;
  libraries: string[];
  baudRate: number;
  wiringTable: { pinName: string; arduinoPin: string; note: string }[];
  sketchCode: string;
  filename: string;
}

export const ARDUINO_SKETCHES: ArduinoSketchDef[] = [
  {
    id: 'i2c_1602',
    title: 'Arduino Uno / Nano + 16x2 I2C LCD (LiquidCrystal_I2C)',
    hardware: 'Arduino Uno / Nano / Mega + 1602 LCD with PCF8574 I2C Backpack',
    description:
      'The most popular and easiest setup (only 4 wires needed!). Automatically receives formatted line buffers and CSV telemetry packets from the HealSecure website, renders them on the 16x2 LCD, and triggers a buzzer/LED alarm if high readmission risk is detected.',
    libraries: ['Wire.h (Built-in)', 'LiquidCrystal_I2C.h (by Frank de Brabander)'],
    baudRate: 9600,
    filename: 'HealSecure_LCD_I2C.ino',
    wiringTable: [
      { pinName: 'VCC', arduinoPin: '5V', note: 'Power supply' },
      { pinName: 'GND', arduinoPin: 'GND', note: 'Common ground' },
      { pinName: 'SDA', arduinoPin: 'A4 (Uno/Nano) or Pin 20 (Mega)', note: 'I2C Data line' },
      { pinName: 'SCL', arduinoPin: 'A5 (Uno/Nano) or Pin 21 (Mega)', note: 'I2C Clock line' },
      { pinName: 'Alarm Buzzer (+)', arduinoPin: 'Digital Pin 8', note: 'Optional Piezo buzzer for clinical alarms' },
      { pinName: 'Sentinel LED (+)', arduinoPin: 'Digital Pin 13 / Built-in', note: 'Optional alert warning LED' },
    ],
    sketchCode: `/*
 * =====================================================================
 * HealSecure AI - Biosensing Telemetry LCD Display (I2C 16x2)
 * Hardware: Arduino Uno / Nano + PCF8574 I2C 1602 LCD Display
 * Libraries: LiquidCrystal_I2C (install via Arduino Library Manager)
 * Default I2C Address: 0x27 or 0x3F
 * =====================================================================
 */

#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Set the LCD address to 0x27 or 0x3F for a 16 chars and 2 line display
LiquidCrystal_I2C lcd(0x27, 16, 2);

const int BUZZER_PIN = 8;     // Active buzzer pin for clinical risk alerts
const int ALARM_LED_PIN = 13;  // Built-in LED for critical alarm indication

String inputBuffer = "";
bool stringComplete = false;

void setup() {
  Serial.begin(9600);
  inputBuffer.reserve(128);

  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(ALARM_LED_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(ALARM_LED_PIN, LOW);

  // Initialize LCD
  lcd.init();
  lcd.backlight();
  lcd.clear();

  // Startup splash banner
  lcd.setCursor(0, 0);
  lcd.print("HealSecure AI");
  lcd.setCursor(0, 1);
  lcd.print("Waiting Serial..");

  // Startup beep
  digitalWrite(BUZZER_PIN, HIGH);
  delay(100);
  digitalWrite(BUZZER_PIN, LOW);

  Serial.println("[ARDUINO] HealSecure 16x2 I2C Display Ready @ 9600 baud");
}

void loop() {
  // Check if a complete command line was received from browser
  if (stringComplete) {
    inputBuffer.trim();

    if (inputBuffer.startsWith("L1:")) {
      // Direct Line 1 string: "L1:HR:142 SpO2:98%"
      String line = inputBuffer.substring(3);
      padAndPrint(0, line);
    } 
    else if (inputBuffer.startsWith("L2:")) {
      // Direct Line 2 string: "L2:pH:7.40 dT:+1.2C"
      String line = inputBuffer.substring(3);
      padAndPrint(1, line);
    }
    else if (inputBuffer.startsWith("$HS,")) {
      // Compact CSV Telemetry Packet:
      // $HS,heartRate,spo2,sysTemp,ph,moist,deltaT,risk,alarm
      parseTelemetryPacket(inputBuffer);
    }
    else if (inputBuffer == "CLS" || inputBuffer == "CLEAR") {
      lcd.clear();
    }
    else if (inputBuffer.startsWith("MSG:")) {
      String msg = inputBuffer.substring(4);
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print(msg.substring(0, 16));
    }

    // Acknowledge receipt back to Web Serial
    Serial.print("[ACK] Processed: ");
    Serial.println(inputBuffer);

    inputBuffer = "";
    stringComplete = false;
  }
}

// Ensure row is cleanly written with 16 characters (overwriting previous contents)
void padAndPrint(int row, String text) {
  while (text.length() < 16) {
    text += " ";
  }
  if (text.length() > 16) {
    text = text.substring(0, 16);
  }
  lcd.setCursor(0, row);
  lcd.print(text);
}

// Parses $HS CSV packet from HealSecure website
void parseTelemetryPacket(String packet) {
  // Format: $HS,HR,SPO2,TEMP,PH,MOIST,DELTAT,RISK,ALARM
  int idx = 4; // skip "$HS,"
  
  String tokens[9];
  int tokenCount = 0;
  
  while (idx < packet.length() && tokenCount < 9) {
    int comma = packet.indexOf(',', idx);
    if (comma == -1) {
      tokens[tokenCount++] = packet.substring(idx);
      break;
    } else {
      tokens[tokenCount++] = packet.substring(idx, comma);
      idx = comma + 1;
    }
  }

  if (tokenCount >= 7) {
    String hr = tokens[0];
    String spo2 = tokens[1];
    String ph = tokens[3];
    String deltaT = tokens[5];
    String risk = tokens[6];
    int alarm = (tokenCount >= 8) ? tokens[7].toInt() : 0;

    // Line 1: HR & SpO2
    String l1 = "HR:" + hr + " O2:" + spo2 + "%";
    // Line 2: pH & Delta-T
    String l2 = "pH:" + ph + " dT:" + deltaT + "C";

    padAndPrint(0, l1);
    padAndPrint(1, l2);

    // Audio/visual alarm if risk >= 70 or alarm bit set
    if (alarm == 1 || risk.toInt() >= 70) {
      digitalWrite(ALARM_LED_PIN, HIGH);
      // Double chirp
      digitalWrite(BUZZER_PIN, HIGH);
      delay(40);
      digitalWrite(BUZZER_PIN, LOW);
      delay(40);
      digitalWrite(BUZZER_PIN, HIGH);
      delay(40);
      digitalWrite(BUZZER_PIN, LOW);
    } else {
      digitalWrite(ALARM_LED_PIN, LOW);
      digitalWrite(BUZZER_PIN, LOW);
    }
  }
}

// Serial Event interrupt handler
void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    if (inChar == '\\n' || inChar == '\\r') {
      if (inputBuffer.length() > 0) {
        stringComplete = true;
      }
    } else {
      inputBuffer += inChar;
    }
  }
}
`,
  },
  {
    id: 'parallel_1602',
    title: 'Arduino Uno + 16x2 Parallel LCD (No I2C backpack)',
    hardware: 'Arduino Uno + Standard 16-pin HD44780 LCD display + 10k potentiometer',
    description:
      'For classic 16x2 LCD modules wired directly to Arduino digital pins without an I2C piggyback. Uses the standard built-in LiquidCrystal library.',
    libraries: ['LiquidCrystal.h (Built-in Arduino)'],
    baudRate: 9600,
    filename: 'HealSecure_LCD_Parallel.ino',
    wiringTable: [
      { pinName: 'VSS (Pin 1)', arduinoPin: 'GND', note: 'Ground' },
      { pinName: 'VDD (Pin 2)', arduinoPin: '5V', note: 'Power supply' },
      { pinName: 'V0 (Pin 3)', arduinoPin: '10k Potentiometer wiper', note: 'Contrast control' },
      { pinName: 'RS (Pin 4)', arduinoPin: 'Digital Pin 12', note: 'Register Select' },
      { pinName: 'RW (Pin 5)', arduinoPin: 'GND', note: 'Read/Write (Ground for write)' },
      { pinName: 'Enable (Pin 6)', arduinoPin: 'Digital Pin 11', note: 'Clock Enable' },
      { pinName: 'D4 (Pin 11)', arduinoPin: 'Digital Pin 5', note: 'Data Bit 4' },
      { pinName: 'D5 (Pin 12)', arduinoPin: 'Digital Pin 4', note: 'Data Bit 5' },
      { pinName: 'D6 (Pin 13)', arduinoPin: 'Digital Pin 3', note: 'Data Bit 6' },
      { pinName: 'D7 (Pin 14)', arduinoPin: 'Digital Pin 2', note: 'Data Bit 7' },
      { pinName: 'A (Pin 15)', arduinoPin: '5V (via 220Ω resistor)', note: 'LED Backlight Anode' },
      { pinName: 'K (Pin 16)', arduinoPin: 'GND', note: 'LED Backlight Cathode' },
    ],
    sketchCode: `/*
 * =====================================================================
 * HealSecure AI - Biosensing Telemetry Parallel LCD Display (16x2)
 * Hardware: Arduino Uno + Standard HD44780 LCD (4-bit mode)
 * Pins: RS=12, E=11, D4=5, D5=4, D6=3, D7=2
 * =====================================================================
 */

#include <LiquidCrystal.h>

// Initialize library with interface pins
const int rs = 12, en = 11, d4 = 5, d5 = 4, d6 = 3, d7 = 2;
LiquidCrystal lcd(rs, en, d4, d5, d6, d7);

const int BUZZER_PIN = 8;
String inputBuffer = "";
bool stringComplete = false;

void setup() {
  Serial.begin(9600);
  inputBuffer.reserve(128);

  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  // Set up the LCD's number of columns and rows
  lcd.begin(16, 2);
  lcd.clear();
  lcd.print("HealSecure AI");
  lcd.setCursor(0, 1);
  lcd.print("Waiting WebSerial");

  Serial.println("[ARDUINO] HealSecure Parallel 16x2 Display Ready @ 9600 baud");
}

void loop() {
  if (stringComplete) {
    inputBuffer.trim();

    if (inputBuffer.startsWith("L1:")) {
      padAndPrint(0, inputBuffer.substring(3));
    } 
    else if (inputBuffer.startsWith("L2:")) {
      padAndPrint(1, inputBuffer.substring(3));
    }
    else if (inputBuffer.startsWith("$HS,")) {
      parseTelemetryPacket(inputBuffer);
    }
    else if (inputBuffer == "CLS") {
      lcd.clear();
    }

    Serial.print("[ACK] ");
    Serial.println(inputBuffer);

    inputBuffer = "";
    stringComplete = false;
  }
}

void padAndPrint(int row, String text) {
  while (text.length() < 16) text += " ";
  if (text.length() > 16) text = text.substring(0, 16);
  lcd.setCursor(0, row);
  lcd.print(text);
}

void parseTelemetryPacket(String packet) {
  int idx = 4;
  String tokens[9];
  int count = 0;
  while (idx < packet.length() && count < 9) {
    int comma = packet.indexOf(',', idx);
    if (comma == -1) {
      tokens[count++] = packet.substring(idx);
      break;
    } else {
      tokens[count++] = packet.substring(idx, comma);
      idx = comma + 1;
    }
  }

  if (count >= 7) {
    padAndPrint(0, "HR:" + tokens[0] + " O2:" + tokens[1] + "%");
    padAndPrint(1, "pH:" + tokens[3] + " dT:" + tokens[5] + "C");

    int alarm = (count >= 8) ? tokens[7].toInt() : 0;
    if (alarm == 1 || tokens[6].toInt() >= 70) {
      digitalWrite(BUZZER_PIN, HIGH);
      delay(30);
      digitalWrite(BUZZER_PIN, LOW);
    }
  }
}

void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    if (inChar == '\\n' || inChar == '\\r') {
      if (inputBuffer.length() > 0) stringComplete = true;
    } else {
      inputBuffer += inChar;
    }
  }
}
`,
  },
  {
    id: 'oled_ssd1306',
    title: 'Arduino + 0.96" I2C OLED Display (SSD1306 128x64)',
    hardware: 'Arduino Uno / Nano / ESP32 + 0.96 inch 128x64 I2C OLED',
    description:
      'High-resolution graphical dashboard with mini live pulse wave, heart rate, SpO2, wound pH, hyperemia ΔT, and AI readmission risk gauge bar.',
    libraries: ['Adafruit_GFX.h', 'Adafruit_SSD1306.h', 'Wire.h'],
    baudRate: 115200,
    filename: 'HealSecure_OLED_SSD1306.ino',
    wiringTable: [
      { pinName: 'VCC', arduinoPin: '5V or 3.3V', note: 'Power supply' },
      { pinName: 'GND', arduinoPin: 'GND', note: 'Ground' },
      { pinName: 'SDA', arduinoPin: 'A4 (Uno/Nano) or D21 (ESP32)', note: 'I2C Data' },
      { pinName: 'SCL', arduinoPin: 'A5 (Uno/Nano) or D22 (ESP32)', note: 'I2C Clock' },
    ],
    sketchCode: `/*
 * =====================================================================
 * HealSecure AI - OLED 128x64 Graphical Sentinel Dashboard
 * Hardware: Arduino Uno / Nano / ESP32 + SSD1306 0.96" I2C OLED
 * Libraries: Adafruit GFX + Adafruit SSD1306
 * =====================================================================
 */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

String inputBuffer = "";
bool stringComplete = false;

// Current values
int hr = 138, spo2 = 98, risk = 14, moist = 52, alarm = 0;
float ph = 6.45, deltaT = 0.40;

void setup() {
  Serial.begin(115200);
  inputBuffer.reserve(128);

  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("[ERR] SSD1306 allocation failed"));
    for(;;);
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 16);
  display.println(F("HEALSECURE AI"));
  display.setCursor(10, 32);
  display.println(F("Dual Sentinel"));
  display.setCursor(10, 48);
  display.println(F("Connecting..."));
  display.display();

  Serial.println("[ARDUINO] HealSecure OLED Ready @ 115200 baud");
}

void loop() {
  if (stringComplete) {
    inputBuffer.trim();
    if (inputBuffer.startsWith("$HS,")) {
      parseTelemetry(inputBuffer);
      renderDashboard();
    }
    inputBuffer = "";
    stringComplete = false;
  }
}

void renderDashboard() {
  display.clearDisplay();

  // Top Title Bar
  display.fillRect(0, 0, 128, 11, SSD1306_WHITE);
  display.setTextColor(SSD1306_BLACK);
  display.setCursor(2, 2);
  display.print(F("HEALSECURE"));
  display.setCursor(82, 2);
  if (alarm == 1 || risk >= 70) {
    display.print(F("!ALARM!"));
  } else {
    display.print(F("NORMAL"));
  }

  display.setTextColor(SSD1306_WHITE);

  // Vitals Column
  display.setCursor(2, 16);
  display.print(F("HR: "));
  display.print(hr);
  display.print(F(" bpm"));

  display.setCursor(2, 28);
  display.print(F("SpO2: "));
  display.print(spo2);
  display.print(F("%"));

  // Biomarkers Column
  display.setCursor(2, 40);
  display.print(F("pH: "));
  display.print(ph, 2);

  display.setCursor(64, 40);
  display.print(F("dT:+"));
  display.print(deltaT, 1);
  display.print(F("C"));

  // Risk Gauge Bar at bottom
  display.setCursor(2, 53);
  display.print(F("RISK:"));
  display.print(risk);
  display.print(F("%"));

  int barWidth = map(constrain(risk, 0, 100), 0, 100, 0, 60);
  display.drawRect(64, 52, 62, 9, SSD1306_WHITE);
  display.fillRect(65, 53, barWidth, 7, SSD1306_WHITE);

  display.display();
}

void parseTelemetry(String packet) {
  int idx = 4;
  String tokens[9];
  int count = 0;
  while (idx < packet.length() && count < 9) {
    int comma = packet.indexOf(',', idx);
    if (comma == -1) {
      tokens[count++] = packet.substring(idx);
      break;
    } else {
      tokens[count++] = packet.substring(idx, comma);
      idx = comma + 1;
    }
  }

  if (count >= 7) {
    hr = tokens[0].toInt();
    spo2 = tokens[1].toInt();
    ph = tokens[3].toFloat();
    moist = tokens[4].toInt();
    deltaT = tokens[5].toFloat();
    risk = tokens[6].toInt();
    alarm = (count >= 8) ? tokens[7].toInt() : 0;
  }
}

void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    if (inChar == '\\n' || inChar == '\\r') {
      if (inputBuffer.length() > 0) stringComplete = true;
    } else {
      inputBuffer += inChar;
    }
  }
}
`,
  },
  {
    id: 'serial_monitor_only',
    title: 'Zero-Hardware Serial Monitor (No LCD Required)',
    hardware: 'Any Arduino (Uno, Mega, Nano, Leonardo, Due, ESP32, Raspberry Pi Pico)',
    description:
      'Test immediately without any extra hardware! Just plug your Arduino in via USB, open Arduino IDE Serial Monitor at 9600 baud, and view simulated sensor readings in an ASCII LCD box.',
    libraries: ['None (Uses standard Serial)'],
    baudRate: 9600,
    filename: 'HealSecure_Serial_Monitor.ino',
    wiringTable: [
      { pinName: 'USB Cable', arduinoPin: 'USB Type-B / Type-C', note: 'Direct connection to PC' },
    ],
    sketchCode: `/*
 * =====================================================================
 * HealSecure AI - Virtual LCD Serial Monitor Inspector
 * Hardware: Any Arduino / Microcontroller (Zero extra hardware needed)
 * Baud Rate: 9600
 * =====================================================================
 */

String inputBuffer = "";
bool stringComplete = false;

void setup() {
  Serial.begin(9600);
  inputBuffer.reserve(128);

  Serial.println(F("========================================"));
  Serial.println(F("  HEALSECURE AI - SERIAL MONITOR LCD   "));
  Serial.println(F("  Ready to receive streaming telemetry  "));
  Serial.println(F("========================================"));
}

void loop() {
  if (stringComplete) {
    inputBuffer.trim();

    // Render an ASCII 16x2 LCD box in the serial monitor
    Serial.println(F("+------------------+"));
    
    if (inputBuffer.startsWith("L1:")) {
      Serial.print(F("| "));
      Serial.print(pad16(inputBuffer.substring(3)));
      Serial.println(F(" |"));
    } else if (inputBuffer.startsWith("$HS,")) {
      // Parse CSV
      printCsvAsLcd(inputBuffer);
    } else {
      Serial.print(F("| "));
      Serial.print(pad16(inputBuffer));
      Serial.println(F(" |"));
    }

    Serial.println(F("+------------------+"));
    Serial.println();

    inputBuffer = "";
    stringComplete = false;
  }
}

String pad16(String str) {
  while (str.length() < 16) str += " ";
  if (str.length() > 16) str = str.substring(0, 16);
  return str;
}

void printCsvAsLcd(String packet) {
  // Format: $HS,HR,SPO2,TEMP,PH,MOIST,DELTAT,RISK,ALARM
  int idx = 4;
  String tokens[9];
  int count = 0;
  while (idx < packet.length() && count < 9) {
    int comma = packet.indexOf(',', idx);
    if (comma == -1) {
      tokens[count++] = packet.substring(idx);
      break;
    } else {
      tokens[count++] = packet.substring(idx, comma);
      idx = comma + 1;
    }
  }

  if (count >= 7) {
    String l1 = "HR:" + tokens[0] + " O2:" + tokens[1] + "%";
    String l2 = "pH:" + tokens[3] + " dT:" + tokens[5] + "C";
    Serial.print(F("| ")); Serial.print(pad16(l1)); Serial.println(F(" |"));
    Serial.print(F("| ")); Serial.print(pad16(l2)); Serial.println(F(" |"));
  }
}

void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    if (inChar == '\\n' || inChar == '\\r') {
      if (inputBuffer.length() > 0) stringComplete = true;
    } else {
      inputBuffer += inChar;
    }
  }
}
`,
  },
  {
    id: 'python_bridge',
    title: 'Python Serial Bridge (pyserial CLI Relay)',
    hardware: 'PC / Laptop with Python 3 + pyserial',
    description:
      'A portable Python script that forwards sensor data directly to your Arduino COM port (e.g. COM3 or /dev/ttyUSB0). Useful if using a browser that blocks Web Serial in iframes.',
    libraries: ['pip install pyserial requests'],
    baudRate: 9600,
    filename: 'bridge.py',
    wiringTable: [
      { pinName: 'Serial Port', arduinoPin: 'USB Serial (e.g. COM3 or /dev/ttyUSB0)', note: 'Auto-detected or specified' },
    ],
    sketchCode: `#!/usr/bin/env python3
"""
HealSecure AI - Python Serial LCD Bridge
Requirements: pip install pyserial
Usage: python bridge.py [PORT] [BAUD]
Example: python bridge.py COM3 9600
"""

import sys
import time
import serial
import serial.tools.list_ports

def find_arduino_port():
    ports = serial.tools.list_ports.comports()
    for p in ports:
        if 'Arduino' in p.description or 'CH340' in p.description or 'USB' in p.description:
            return p.device
    return ports[0].device if ports else None

port_name = sys.argv[1] if len(sys.argv) > 1 else find_arduino_port()
baud = int(sys.argv[2]) if len(sys.argv) > 2 else 9600

if not port_name:
    print("[!] No serial port found. Please plug in your Arduino.")
    sys.exit(1)

print(f"[*] Connecting to {port_name} at {baud} baud...")
try:
    ser = serial.Serial(port_name, baud, timeout=1)
    time.sleep(2) # Wait for Arduino reset
    print(f"[+] Connected to {port_name}!")
    print("[*] Streaming simulated sensor packets to Arduino LCD...")

    # Demonstration loop: sends simulated HealSecure sensor packets
    hr, spo2, ph, delta_t, risk = 138, 98, 6.55, 0.4, 14
    while True:
        # Format 1: Direct LCD lines
        l1_cmd = f"L1:HR:{hr}  O2:{spo2}%\\n"
        l2_cmd = f"L2:pH:{ph:.2f} dT:+{delta_t:.1f}C\\n"
        ser.write(l1_cmd.encode('utf-8'))
        time.sleep(0.05)
        ser.write(l2_cmd.encode('utf-8'))

        print(f"[TX] Sent -> L1: HR:{hr} O2:{spo2}% | L2: pH:{ph:.2f} dT:+{delta_t:.1f}C")
        
        # Check for response from Arduino
        if ser.in_waiting:
            line = ser.readline().decode('utf-8', errors='ignore').strip()
            if line:
                print(f"[RX Arduino] {line}")

        time.sleep(1.0) # 1 Hz telemetry stream

except KeyboardInterrupt:
    print("\\n[*] Stopping bridge.")
    if 'ser' in locals() and ser.is_open:
        ser.close()
except Exception as e:
    print(f"[!] Error: {e}")
`,
  },
];
