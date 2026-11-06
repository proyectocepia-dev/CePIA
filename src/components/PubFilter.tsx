'use client';
// Filtro por proyecto de Publicaciones y conferencias.
import { useState } from 'react';
import PubList from './PubList';
import type { Publicacion } from '@/lib/content';

export default function PubFilter({ items, nombres }: { items: Publicacion[]; nombres: Record<string, string> }) {
  const [f, setF] = useState('');
  const conProyecto = [...new Set(items.map((p) => p.proyecto).filter((x): x is string => !!x))];
  return (
    <>
      <div className="filters" role="group" aria-label="Filtrar por proyecto">
        <button type="button" aria-pressed={f === ''} onClick={() => setF('')}>Todas</button>
        {conProyecto.map((id) => <button key={id} type="button" aria-pressed={f === id} onClick={() => setF(id)}>{nombres[id]}</button>)}
      </div>
      <PubList items={f ? items.filter((p) => p.proyecto === f) : items} nombres={nombres} />
    </>
  );
}
