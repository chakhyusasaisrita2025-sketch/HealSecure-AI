import React, { useState } from 'react';
import { BILL_OF_MATERIALS } from '../data/bomData';
import { BOMComponent } from '../types';
import {
  Download,
  Search,
  Filter,
  DollarSign,
  Cpu,
  Layers,
  CheckCircle2,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';

export const BOMViewer: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Sensors', 'Analog Front-End', 'MCU & Wireless', 'Power', 'Passives', 'Patch Substrate'];

  const filteredItems = BILL_OF_MATERIALS.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.mpn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Calculate totals
  const totalBOMCost = BILL_OF_MATERIALS.reduce((sum, item) => sum + item.unitCostUSD * item.quantity, 0);
  const totalComponentsCount = BILL_OF_MATERIALS.reduce((sum, item) => sum + item.quantity, 0);

  const exportCSV = () => {
    const headers = ['Item', 'Category', 'Component Name', 'Manufacturer Part Number (MPN)', 'Manufacturer', 'Description', 'Package / Footprint', 'Quantity', 'Unit Cost (USD)', 'Extended Cost (USD)', 'Critical Specification'];
    const rows = BILL_OF_MATERIALS.map((item) => [
      item.itemNumber,
      `"${item.category}"`,
      `"${item.name}"`,
      `"${item.mpn}"`,
      `"${item.manufacturer}"`,
      `"${item.description.replace(/"/g, '""')}"`,
      `"${item.packageFootprint}"`,
      item.quantity,
      item.unitCostUSD.toFixed(2),
      (item.unitCostUSD * item.quantity).toFixed(2),
      `"${item.criticalSpec.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'HealSecure_AI_Hardware_BOM.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Stats */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              Indicative Hardware Bill of Materials (BOM) &amp; Component List
            </h2>
            <p className="text-xs text-slate-500">
              Prototype-oriented component selection with indicative 1,000-unit manufacturing volume projections for the HealSecure AI dual-modal smart wearable patch.
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export BOM as CSV
          </button>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <div className="text-xs text-emerald-800 font-medium mb-1">Indicative Prototype BOM Target</div>
            <div className="text-2xl font-black font-mono text-emerald-900">${totalBOMCost.toFixed(2)}</div>
            <div className="text-[11px] text-emerald-700 font-bold mt-0.5">Indicative prototype BOM target: &lt;$50 (at 1k-unit pricing)</div>
          </div>

          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50">
            <div className="text-xs text-blue-800 font-medium mb-1">Unique Line Items</div>
            <div className="text-2xl font-black font-mono text-blue-900">{BILL_OF_MATERIALS.length} Items</div>
            <div className="text-[11px] text-blue-700 mt-0.5">{totalComponentsCount} total parts on board</div>
          </div>

          <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50">
            <div className="text-xs text-purple-800 font-medium mb-1">Form Factor &amp; Substrate</div>
            <div className="text-lg font-bold text-purple-900 mt-0.5">2-Layer Flexible FPC</div>
            <div className="text-[11px] text-purple-700 mt-0.5">Medical Polyurethane (50x32mm)</div>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50">
            <div className="text-xs text-amber-800 font-medium mb-1">Operating Life</div>
            <div className="text-xl font-black font-mono text-amber-900">Target: &ge;48 h</div>
            <div className="text-[10px] text-amber-700 mt-0.5 leading-tight">Estimated from duty-cycled operation; hardware runtime validation pending.</div>
          </div>
        </div>
      </div>

      {/* Primary Prototype vs Reference Analog Distinction Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-600" />
            Hardware Prototype Classification (Primary Prototype vs Reference Analog)
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            Independent Architectural Roles
          </span>
        </div>
        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          The MAX30102 path is the intended integrated PPG architecture. The OPA2388 discrete path is an alternative analog reference design and is not required simultaneously. (Note: The current dashboard is an interactive simulation demonstrating this architecture; the MAX30102 is not physically connected to the browser runtime.)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Primary Prototype */}
          <div className="p-4 rounded-xl border-2 border-cyan-200 bg-cyan-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-600" /> PRIMARY WEARABLE PROTOTYPE
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-600 text-white">Active Build</span>
            </div>
            <ul className="space-y-1.5 text-slate-700 text-[11px]">
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-600 font-bold">•</span>
                <span><strong>MAX30102:</strong> Integrated optical biosensor (dual LED + photodiode + I2C digital interface).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-600 font-bold">•</span>
                <span><strong>ESP32-PICO:</strong> Dual-core MCU with on-chip BLE 5.0 and edge feature extraction.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-600 font-bold">•</span>
                <span><strong>Wound Sensing Interfaces:</strong> Solid-state IrOx pH, Au IDE exudate impedance, dual NTC bridge.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-600 font-bold">•</span>
                <span><strong>Analog Conditioning &amp; ADC:</strong> LTC2050 (pH buffer), INA333 (ΔT instrumentation amp), ADS1115 (16-bit ADC).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-600 font-bold">•</span>
                <span><strong>Power &amp; Substrate:</strong> 250 mAh LiPo with MCP73831 charger, TPS73633 LDO, on 2-layer flexible FPC.</span>
              </li>
            </ul>
          </div>

          {/* Reference Analog Architecture */}
          <div className="p-4 rounded-xl border border-slate-300 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-slate-600" /> REFERENCE ANALOG ARCHITECTURE
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">SPICE / Bench Only</span>
            </div>
            <ul className="space-y-1.5 text-slate-600 text-[11px]">
              <li className="flex items-start gap-1.5">
                <span className="text-slate-500 font-bold">•</span>
                <span><strong>OPA2388:</strong> Dual precision zero-drift op-amp configured as transimpedance amplifier (TIA).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-500 font-bold">•</span>
                <span><strong>Discrete Si PIN Photodiode:</strong> Modeled in LTspice for component-level optical noise &amp; gain analysis.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-500 font-bold">•</span>
                <span><strong>Analog Filtering:</strong> 2nd-order Sallen-Key low-pass filter (fc = 10 Hz) for baseline noise rejection.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-500 font-bold">•</span>
                <span><strong>Purpose:</strong> Component-level simulation, Bode validation, and laboratory instrumentation reference.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. Hardware Architecture & Pinout Map */}
      <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 shadow-md text-slate-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-cyan-400" />
          Hardware Architecture &amp; Interconnect Pinout (ESP32-PICO Microcontroller)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Sensor interfaces, analog conditioning stages, and digital buses on the flexible printed circuit (FPC):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/80">
            <div className="text-cyan-400 font-bold mb-1">ADC1_CH0 (GPIO 36 / VP)</div>
            <div className="text-slate-300 font-semibold">pH Potentiometric AFE</div>
            <div className="text-slate-500 text-[11px] mt-1">LTC2050 buffer + 10Hz Sallen-Key low-pass filter (0.25V - 3.05V)</div>
          </div>

          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/80">
            <div className="text-orange-400 font-bold mb-1">ADC1_CH3 (GPIO 39 / VN)</div>
            <div className="text-slate-300 font-semibold">Hyperemia ΔT Bridge</div>
            <div className="text-slate-500 text-[11px] mt-1">INA333 instrumentation amplifier; gain and temperature-gradient sensitivity require calibration</div>
          </div>

          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/80">
            <div className="text-blue-400 font-bold mb-1">ADC1_CH6 (GPIO 34)</div>
            <div className="text-slate-300 font-semibold">Exudate Bio-Impedance</div>
            <div className="text-slate-500 text-[11px] mt-1">10kHz AC envelope detector (500Ω - 50kΩ dynamic range)</div>
          </div>

          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/80">
            <div className="text-emerald-400 font-bold mb-1">I2C (SDA: GPIO 21, SCL: GPIO 22)</div>
            <div className="text-slate-300 font-semibold">MAX30102 PPG &amp; ADS1115</div>
            <div className="text-slate-500 text-[11px] mt-1">400kHz Fast-mode I2C bus for 16-bit optical &amp; vital telemetry</div>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Part Name, MPN, Manufacturer, or Spec..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Complete Bill of Materials Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-3">Component Name</th>
                <th className="py-3 px-3">MPN</th>
                <th className="py-3 px-3">Manufacturer</th>
                <th className="py-3 px-3">Package / Footprint</th>
                <th className="py-3 px-3 text-center">Qty</th>
                <th className="py-3 px-3 text-right">Unit ($)</th>
                <th className="py-3 px-3 text-right">Total ($)</th>
                <th className="py-3 px-4">Critical Functional Specification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 text-center font-mono text-slate-400">{item.itemNumber}</td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{item.description}</div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-cyan-800 whitespace-nowrap">{item.mpn}</td>
                  <td className="py-3 px-3 text-slate-700 whitespace-nowrap">{item.manufacturer}</td>
                  <td className="py-3 px-3 font-mono text-slate-600 text-[11px] whitespace-nowrap">{item.packageFootprint}</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">{item.quantity}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700">${item.unitCostUSD.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    ${(item.unitCostUSD * item.quantity).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-[11px] leading-relaxed max-w-xs">{item.criticalSpec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
