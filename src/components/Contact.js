'use client';
import { useState } from 'react';

export default function Contact() {
  const [ok, setOk] = useState('');

  function enviar(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    let lista = [];
    try {
      lista = JSON.parse(localStorage.getItem('classicbit-feedback') || '[]');
    } catch {}
    lista.push({
      nombre: d.get('nombre'),
      tipo: d.get('tipo'),
      mensaje: d.get('mensaje'),
      fecha: new Date().toISOString(),
    });
    try {
      localStorage.setItem('classicbit-feedback', JSON.stringify(lista));
    } catch {}
    setOk('¡Gracias! Tu mensaje fue guardado.');
    form.reset();
  }

  return (
    <section id="contacto" className="contact wrap">
      <h2>Contacto</h2>
      <p className="lead">¿Encontraste un error o tienes una idea para un nuevo juego? Cuéntanos.</p>
      <form className="fb" onSubmit={enviar}>
        <label>Tu nombre (opcional)
          <input type="text" name="nombre" maxLength={40} autoComplete="name" />
        </label>
        <label>Tipo de mensaje
          <select name="tipo">
            <option>Comentario</option>
            <option>Sugerencia</option>
            <option>Reportar un error</option>
          </select>
        </label>
        <label>Mensaje
          <textarea name="mensaje" maxLength={500} required></textarea>
        </label>
        <button className="btn" type="submit">Enviar</button>
        <p className="ok" role="status">{ok}</p>
      </form>
    </section>
  );
}
