import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Camera, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RecordNowPage() {
  const [, navigate] = useLocation();
  const [camera, setCamera] = useState('frontal');
  const [mic, setMic] = useState('interno');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-rose-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Button>

        <div className="bg-white rounded-2xl border p-6 space-y-5">
          <h1 className="text-2xl font-bold text-gray-900">Grabar Ahora</h1>
          <p className="text-sm text-gray-600">Selecciona cámara y micrófono. Luego usa el material en tu proyecto.</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="rounded-xl border p-3">
              <span className="text-xs text-gray-500 flex items-center gap-1 mb-1"><Camera className="w-3 h-3" /> Cámara</span>
              <select className="w-full border rounded-md h-9 px-2" value={camera} onChange={(e) => setCamera(e.target.value)}>
                <option value="frontal">Frontal</option>
                <option value="trasera">Trasera</option>
                <option value="virtual">Virtual</option>
              </select>
            </label>

            <label className="rounded-xl border p-3">
              <span className="text-xs text-gray-500 flex items-center gap-1 mb-1"><Mic className="w-3 h-3" /> Micrófono</span>
              <select className="w-full border rounded-md h-9 px-2" value={mic} onChange={(e) => setMic(e.target.value)}>
                <option value="interno">Interno</option>
                <option value="externo">Externo</option>
                <option value="bluetooth">Bluetooth</option>
              </select>
            </label>
          </div>

          <Button className="w-full btn-boom-b1" onClick={() => navigate('/editor?type=video')}>
            Usar en proyecto
          </Button>
        </div>
      </div>
    </div>
  );
}
