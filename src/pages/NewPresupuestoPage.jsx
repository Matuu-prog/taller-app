import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';

const materialesSugeridos = [
  "Caño 20x20", "Caño 30x30", "Caño 40x40", "Caño 20x10", "Caño 40x20",
  "Caño redondo 1'", "Caño redondo 1 1/4", "Caño redondo 1 1/2",
  "Ángulo 1/2 x 1/8", "Ángulo 3/4 x 1/8", "Ángulo 1 x 1/8",
  "Planchuela 1/2 x 1/8", "Planchuela 3/4 x 1/8", "Planchuela 1 x 1/8",
  "Hierro liso 6mm", "Hierro liso 8mm", "Hierro del 10", "Hierro del 12",
  "Electrodo 2.5mm (paquete)", "Electrodo 3.25mm",
  "Disco de corte 4 1/2", "Disco de desbaste",
  "Pintura Convertidor Negro", "Antióxido Rojo", "Thinner 1L"
];

export default function NewPresupuestoPage() {
  const navigate = useNavigate();
  const [cliente, setCliente] = useState('');
  const [items, setItems] = useState([{ nombre: '', precio: '' }]);
  const [manoObra, setManoObra] = useState('');
  const [anticipo, setAnticipo] = useState('');
  const [loading, setLoading] = useState(false);

  // Función para sumar solo los materiales del formulario actual
  const calcularTotalMateriales = () => {
    return items.reduce((acc, item) => acc + (parseFloat(item.precio) || 0), 0);
  };

  // Función para aplicar porcentaje rápido sobre el material cargado
  const aplicarPorcentaje = (porcentaje) => {
    const totalMat = calcularTotalMateriales();
    const calculado = (totalMat * porcentaje) / 100;
    setManoObra(calculado.toFixed(0)); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const totalMat = calcularTotalMateriales();
    const manoObraNum = parseFloat(manoObra) || 0;
    const totalFin = totalMat + manoObraNum;
    const anticipoNum = parseFloat(anticipo) || 0;
    
    const { error } = await supabase.from('presupuestos').insert([{ 
      cliente, 
      items, 
      mano_obra: manoObraNum, 
      anticipo: anticipoNum, 
      total_final: totalFin,
      status: anticipoNum > 0 ? 'trabajo' : 'presupuesto',
      saldo: totalFin - anticipoNum
    }]);

    if (!error) {
      navigate('/');
    } else {
      alert("Error al guardar el presupuesto");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans">
      <header className="bg-white p-4 border-b flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 active:bg-gray-100 rounded-full">
          <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
        </button>
        <h1 className="font-black uppercase text-gray-800 tracking-tighter text-lg">Nuevo Presupuesto</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* 1. Cliente */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 italic">1. Cliente</label>
          <input 
            type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} 
            className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-lg font-bold shadow-sm outline-none focus:border-blue-500 transition-all uppercase"
            placeholder="Nombre del cliente" required 
          />
        </div>

        {/* 2. Materiales */}
        <div className="space-y-3">
          <div className="flex justify-between items-center ml-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">2. Materiales</label>
            <button 
              type="button" onClick={() => setItems([...items, { nombre: '', precio: '' }])}
              className="text-blue-600 font-black text-xs uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100 active:scale-95"
            >
              + Añadir Fila
            </button>
          </div>
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in duration-300">
              <input 
                type="text" 
                list="lista-materiales"
                placeholder="Material" 
                className="flex-[2] bg-transparent p-2 font-bold outline-none uppercase text-sm"
                value={item.nombre} onChange={(e) => {
                  const n = [...items]; n[index].nombre = e.target.value; setItems(n);
                }} required 
              />
              <input 
                type="number" placeholder="$" 
                className="flex-1 bg-gray-50 rounded-xl p-2 font-black text-right outline-none text-blue-600"
                value={item.precio} onChange={(e) => {
                  const n = [...items]; n[index].precio = e.target.value; setItems(n);
                }} required 
              />
              <button 
                type="button" onClick={() => setItems(items.filter((_, i) => i !== index))}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors" disabled={items.length === 1}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        {/* 3. Mano de Obra con Lógica de Porcentaje */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm space-y-4">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest text-center italic">3. Mano de Obra</label>
          
          <div className="flex gap-2">
            <button 
              type="button" onClick={() => aplicarPorcentaje(50)}
              className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-xl font-black text-[10px] uppercase border border-blue-100 active:scale-95 transition-all shadow-sm shadow-blue-100"
            >
              Calcular 50%
            </button>
            <button 
              type="button" onClick={() => aplicarPorcentaje(70)}
              className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-xl font-black text-[10px] uppercase border border-blue-100 active:scale-95 transition-all shadow-sm shadow-blue-100"
            >
              Calcular 70%
            </button>
          </div>

          <input 
            type="number" value={manoObra} onChange={(e) => setManoObra(e.target.value)}
            className="w-full text-center text-3xl font-black text-blue-700 bg-gray-50 rounded-2xl p-5 outline-none border-2 border-transparent focus:border-blue-500 transition-all placeholder:text-blue-200 shadow-inner"
            placeholder="$ 0" required 
          />
        </div>

        {/* 4. Seña */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-2 text-center block italic">4. Seña (Opcional)</label>
          <input 
            type="number" value={anticipo} onChange={(e) => setAnticipo(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl p-5 text-center text-2xl font-black text-emerald-600 shadow-sm outline-none focus:border-emerald-500 transition-all shadow-inner"
            placeholder="$ 0"
          />
        </div>

        <button 
          type="submit" disabled={loading}
          className="w-full bg-gray-900 text-white font-black py-6 rounded-3xl shadow-2xl shadow-gray-300 uppercase tracking-[0.2em] active:scale-95 transition-all text-sm mt-4 border-b-4 border-gray-700"
        >
          {loading ? 'Guardando...' : 'Confirmar Presupuesto'}
        </button>
      </form>

      <datalist id="lista-materiales">
        {materialesSugeridos.map((m, i) => (
          <option key={i} value={m} />
        ))}
      </datalist>
    </div>
  );
}