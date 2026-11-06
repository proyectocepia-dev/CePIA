'use client';
// Cada motivo llegará a un correo distinto (T2.3). En el boceto el formulario no envía.
import { useState, type FormEvent } from 'react';

const motivos = ['Colaboración en investigación', 'Servicios y transferencia tecnológica', 'Establecimientos educacionales y prácticas', 'GrTE · radiotelescopio de bajo costo', 'Prensa y comunicaciones'];

export default function ContactForm() {
  const [msg, setMsg] = useState('');
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(e.currentTarget.checkValidity() ? 'Boceto: el envío se activa en la etapa 2.' : 'Completa nombre, correo y mensaje.');
  };
  return (
    <form className="form" noValidate onSubmit={onSubmit}>
      <div className="c-field"><label htmlFor="f-nombre">Nombre</label><input className="c-input" id="f-nombre" name="nombre" autoComplete="name" required /></div>
      <div className="c-field"><label htmlFor="f-correo">Correo</label><input className="c-input" id="f-correo" name="correo" type="email" autoComplete="email" required /></div>
      <div className="c-field"><label htmlFor="f-tema">Motivo</label><select className="c-select" id="f-tema" name="tema">{motivos.map((m) => <option key={m}>{m}</option>)}</select></div>
      <div className="c-field"><label htmlFor="f-msg">Mensaje</label><textarea className="c-textarea" id="f-msg" name="mensaje" rows={5} required /></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'center' }}>
        <button className="c-btn c-btn--primary" type="submit">Enviar mensaje</button>
        <span className="form__msg" role="status">{msg}</span>
      </div>
    </form>
  );
}
