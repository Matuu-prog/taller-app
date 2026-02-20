import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ArrowLeftIcon, ShareIcon, DocumentArrowDownIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import logoTaller from '../assets/logo.png'; 

export default function PresupuestoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSeñaModal, setShowSeñaModal] = useState(false);
  const [nuevaSeña, setNuevaSeña] = useState('');
  const printRef = useRef();

 useEffect(() => {
    async function fetchP() {
      const { data } = await supabase.from('presupuestos').select('*').eq('id', id).single();
      if (data) setP(data);
      setLoading(false);
    }
    fetchP();
  }, [id]);

  // Esta es la única función para la seña que necesitás
  const handleUpdateSeña = async () => { 
    const nuevoPago = parseFloat(nuevaSeña) || 0;
    const anticipoActualizado = (p.anticipo || 0) + nuevoPago;
    const nuevoSaldo = p.total_final - anticipoActualizado;
    const nuevoEstado = anticipoActualizado > 0 ? 'trabajo' : 'presupuesto';

    const { error } = await supabase
      .from('presupuestos')
      .update({ 
        anticipo: anticipoActualizado, 
        saldo: nuevoSaldo, 
        status: nuevoEstado 
      })
      .eq('id', id);

    if (!error) {
      setP({ ...p, anticipo: anticipoActualizado, saldo: nuevoSaldo, status: nuevoEstado });
      setNuevaSeña('');
      setShowSeñaModal(false);
    }
  };

  const handlePdf = async () => {
  const element = printRef.current;
  // 1. Capturamos el diseño con alta calidad
  const canvas = await html2canvas(element, { 
    scale: 2,
    useCORS: true,
    logging: false
  });
  
  const imgData = canvas.toDataURL('image/jpeg', 0.7); // Compresión para WhatsApp
  
  // 2. CALCULAMOS LAS PROPORCIONES REALES
  const pdfWidth = 210; // Ancho A4 en mm
  const pageHeight = 297; // Alto A4 estándar
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width; // Mantiene la relación de aspecto

  // 3. CREAMOS EL PDF CON LA ALTURA DEL CONTENIDO
  // Si el contenido es más largo que una hoja A4, le damos más altura al PDF
  const pdf = new jsPDF('p', 'mm', [pdfWidth, Math.max(imgHeight, pageHeight)]);

  pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
  pdf.save(`Presupuesto-${p.cliente}.pdf`);
};

  if (loading) return <div className="p-10 text-center font-black text-gray-400 uppercase tracking-widest animate-pulse">Cargando...</div>;

  const totalMat = p.items ? p.items.reduce((acc, item) => acc + (parseFloat(item.precio) || 0), 0) : 0;
  
  const handleEliminar = async () => {
  const confirmar = window.confirm("¿Seguro que querés borrarlo? Mirá que no se puede recuperar.");
  
  if (confirmar) {
    const { error } = await supabase
      .from('presupuestos')
      .delete()
      .eq('id', id);

    if (!error) {
      navigate('/'); // Si todo sale bien, volvemos a la lista principal
    } else {
      alert("Hubo un error al intentar borrar.");
    }
  }
};
  
return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <header className="bg-white p-4 border-b flex justify-between items-center sticky top-0 z-10 shadow-sm">
        {/* Botón Volver */}
        <button onClick={() => navigate('/')} className="p-2 active:bg-gray-100 rounded-full transition-colors">
          <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
        </button>

        <div className="flex items-center gap-2">
          {/* Botón Pago Acumulativo */}
          <button 
            onClick={() => setShowSeñaModal(true)} 
            className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-2 rounded-xl font-black text-[10px] uppercase border border-emerald-100 active:scale-95 transition-all"
          >
            <PencilSquareIcon className="h-4 w-4" />
            Pago
          </button>

          {/* Botón Borrar */}
          <button 
            onClick={handleEliminar} 
            className="p-2 text-red-400 active:text-red-700 active:bg-red-50 rounded-full transition-all"
          >
            <TrashIcon className="h-5 w-5" />
          </button>

          {/* Etiqueta de Estado */}
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${p.status === 'trabajo' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>
            {p.status}
          </span>
        </div>
      </header>

      <div className="p-4 max-w-lg mx-auto">
        {/* BOTÓN ÚNICO DE DESCARGA */}
        <div className="mb-6">
          <button 
            onClick={handlePdf} 
            className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all uppercase tracking-widest text-sm border-b-4 border-gray-700"
          >
            <DocumentArrowDownIcon className="h-6 w-6" /> 
            Descargar Presupuesto
          </button>
          <p className="text-[9px] text-center text-gray-400 mt-2 font-bold uppercase tracking-tighter">
            Una vez descargado, podrás compartirlo por WhatsApp
          </p>
        </div>

        {/* VISTA INTERNA DE MATERIALES (Solo visible en la App) */}
        <div className="bg-white p-6 rounded-2xl mb-6 border border-gray-200">
            <h3 className="text-[10px] font-black text-gray-400 uppercase mb-3 italic">Detalle interno de materiales</h3>
            <ul className="space-y-2">
                {p.items.map((item, i) => (
                    <li key={i} className="flex justify-between text-sm font-bold border-b border-gray-50 pb-2 text-gray-600 italic">
                        <span>{item.nombre}</span>
                        <span>${item.precio.toLocaleString()}</span>
                    </li>
                ))}
            </ul>
        </div>

        {/* DOCUMENTO PDF (Captura de html2canvas) */}
        <div className="bg-white p-10 shadow-2xl border-t-8 border-gray-900" ref={printRef}>
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-3xl font-black italic uppercase text-gray-900 leading-tight tracking-tighter">DC Herrería<br/>Salta</h1>
              <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">3874-655095 | Salta, Arg.</p>
            </div>
            <img src={logoTaller} alt="Logo" className="h-24 w-24 object-contain" />
          </div>

          <div className="mb-10 border-l-4 border-gray-900 pl-4">
            <p className="text-[10px] font-black text-gray-400 uppercase">Cliente</p>
            <h2 className="text-2xl font-black text-gray-800 uppercase leading-none">{p.cliente}</h2>
          </div>

          <div className="space-y-4 mb-12 py-6 border-y border-gray-100">
            <div className="flex justify-between text-lg font-black text-gray-700 uppercase italic">
                <span>Total Materiales:</span>
                <span>${totalMat.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-blue-700 uppercase italic">
                <span>Total Mano de Obra:</span>
                <span>${p.mano_obra.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex justify-between w-full bg-gray-900 text-white p-5 rounded-2xl shadow-lg">
              <span className="font-black text-xs self-center uppercase tracking-widest italic text-gray-400">Total a pagar:</span>
              <span className="font-black text-2xl">${p.total_final.toLocaleString()}</span>
            </div>
            {p.anticipo > 0 && (
                <p className="text-[10px] font-black text-emerald-600 uppercase mt-2 italic text-right">A cuenta: ${p.anticipo.toLocaleString()} | Saldo: ${p.saldo.toLocaleString()}</p>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE PAGO */}
      {showSeñaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl">
                <h3 className="text-xl font-black text-gray-900 uppercase mb-2">Registrar Pago</h3>
                <p className="text-gray-500 text-xs font-bold mb-6 italic">
                  Ingresá el monto que te entregó el cliente hoy.
                </p>
                <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-dashed border-gray-200">
                   <p className="text-[10px] font-bold text-gray-400 uppercase">Recibido anteriormente:</p>
                   <p className="text-lg font-black text-gray-700">${p.anticipo.toLocaleString()}</p>
                </div>
                <input 
                    type="number" value={nuevaSeña} onChange={(e) => setNuevaSeña(e.target.value)}
                    className="w-full bg-gray-100 p-5 rounded-2xl text-2xl font-black mb-6 outline-none focus:ring-2 focus:ring-emerald-500" 
                    placeholder="$ 0"
                    autoFocus
                />
                <div className="flex gap-2">
                    <button onClick={() => setShowSeñaModal(false)} className="flex-1 py-4 font-bold text-gray-400 uppercase text-xs">Cancelar</button>
                    <button onClick={handleUpdateSeña} className="flex-1 py-4 bg-emerald-500 text-white font-black rounded-2xl uppercase text-xs shadow-lg shadow-emerald-100">Cargar Pago</button>
                </div>
            </div>
        </div>
      )}
    </div>
);
}