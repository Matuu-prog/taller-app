import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

export default function HomePage() {
  const [presupuestos, setPresupuestos] = useState([]);
  const [filter, setFilter] = useState('presupuesto'); 
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchPresupuestos() {
      const { data } = await supabase.from('presupuestos').select('*').order('created_at', { ascending: false });
      if (data) setPresupuestos(data);
    }
    fetchPresupuestos();
  }, []);

  const filteredItems = presupuestos
  .filter(p => p.status === filter)
  .filter(p => p.cliente.toLowerCase().includes(search.toLowerCase()));

// 1. GANANCIA REAL COBRADA (Verde)
// Solo cuenta el dinero que entró y que ya sobra después de cubrir los materiales
const gananciaRealCobrada = presupuestos.reduce((acc, p) => {
  const costoMaterial = p.items.reduce((sum, item) => sum + (parseFloat(item.precio) || 0), 0);
  // Si el anticipo es mayor al material, el sobrante es ganancia real en mano
  const sobraParaManoObra = Math.max(0, (p.anticipo || 0) - costoMaterial);
  return acc + sobraParaManoObra;
}, 0);

// 2. SALDO A COBRAR (Rojo)
// Lo que le deben de los trabajos en curso (Mano de obra + Material restante)
const saldoACobrar = presupuestos
  .filter(p => p.status === 'trabajo')
  .reduce((acc, p) => acc + (p.saldo || 0), 0);

// 3. DINERO PARA MATERIAL RECIBIDO (Azul)
// Dinero que entró pero que está destinado a pagar los caños/electrodos
const dineroMaterialRecibido = presupuestos.reduce((acc, p) => {
  const costoMaterial = p.items.reduce((sum, item) => sum + (parseFloat(item.precio) || 0), 0);
  // El material se considera pago solo hasta cubrir su costo total
  const pagadoParaMaterial = Math.min(p.anticipo || 0, costoMaterial);
  return acc + pagadoParaMaterial;
}, 0);



  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-24">
      {/* Header negro sólido */}
      <header className="bg-slate-900 text-white p-6 shadow-xl text-center">
        <h1 className="text-2xl font-black uppercase italic tracking-tighter">Taller App</h1>
        <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">Salta - Gestión de Herrería</p>
      </header>

<div className="px-4 py-6 space-y-4">
  {/* Card Principal: GANANCIA (Verde) */}
<div className="bg-emerald-600 p-6 rounded-[2.5rem] shadow-xl border-b-8 border-emerald-800">
  <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-1 italic">Ganancia en Mano</p>
  <p className="text-3xl font-black text-white">${gananciaRealCobrada.toLocaleString()}</p>
  <p className="text-[9px] font-bold text-emerald-200 mt-2 uppercase">Dinero tuyo ya cobrado</p>
</div>

  <div className="grid grid-cols-2 gap-4">
    {/* Card: Saldo a Cobrar (Rojo) */}
    <div className="bg-white p-5 rounded-[2rem] shadow-md border-l-4 border-red-500">
      <p className="text-[9px] font-black text-gray-400 uppercase mb-1 italic">Saldo a Cobrar</p>
      <p className="text-lg font-black text-red-600">${saldoACobrar.toLocaleString()}</p>
    </div>
    
    {/* Card: Material Pago (Azul) */}
    <div className="bg-white p-5 rounded-[2rem] shadow-md border-l-4 border-blue-500">
      <p className="text-[9px] font-black text-gray-400 uppercase mb-1 italic">Material Pago</p>
      <p className="text-lg font-black text-blue-600">${dineroMaterialRecibido.toLocaleString()}</p>
    </div>
  </div>
</div>

      <div className="p-4">
           <div className="px-4 mb-4">
            <input 
              type="text" 
              placeholder="🔍 Buscar cliente..." 
              className="w-full p-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        {/* Selector de pestañas */}
        <div className="flex bg-slate-300 p-1 rounded-2xl mb-6">
          <button onClick={() => setFilter('presupuesto')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase transition-all ${filter === 'presupuesto' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500'}`}>📋 Presupuestos</button>
          <button onClick={() => setFilter('trabajo')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase transition-all ${filter === 'trabajo' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>🛠️ Trabajos</button>
        </div>

        {/* Lista de tarjetas */}
        <div className="space-y-3">
          {filteredItems.map((p) => (
            <div key={p.id} onClick={() => navigate(`/presupuesto/${p.id}`)} className="bg-white p-5 rounded-3xl shadow-sm border-b-4 border-slate-200 flex justify-between items-center active:scale-95">
              <div>
                <h3 className="font-black text-slate-800 uppercase text-lg">{p.cliente}</h3>
                <p className="text-slate-400 text-[10px] font-bold">{new Date(p.created_at).toLocaleDateString()}</p>
              </div>
              <p className="text-xl font-black text-slate-900">${p.total_final?.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Botón flotante (+) */}
      <button onClick={() => navigate('/new')} className="fixed bottom-6 right-6 bg-slate-900 text-white w-16 h-16 rounded-full shadow-2xl text-4xl font-bold flex items-center justify-center border-4 border-white active:scale-90">+</button>
    </div>
  );
}