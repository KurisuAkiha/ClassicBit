
'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Contact() {
  const [ok, setOk] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();

    const form = e.currentTarget;
    const d = new FormData(form);

    const nombre = d.get('nombre')?.trim() || null;
    const tipo = d.get('tipo');
    const mensaje = d.get('mensaje')?.trim();

    if (!mensaje) {
      setOk('Escribe un mensaje antes de enviar.');
      return;
    }

    setEnviando(true);
    setOk('');

    try {
      const { error } = await supabase
        .from('feedback')
        .insert([
          {
            nombre,
            tipo,
            mensaje,
          },
        ]);

      if (error) throw error;

      setOk('¡Gracias! Tu mensaje fue enviado correctamente.');
      form.reset();

    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setOk('No se pudo enviar el mensaje. Inténtalo nuevamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section id="contacto" className="contact wrap">
      <h2>Contacto</h2>

      <p className="lead">
        ¿Encontraste un error o tienes una idea para un nuevo juego? Cuéntanos.
      </p>

      <form className="fb" onSubmit={enviar}>
        <label>
          Tu nombre (opcional)
          <input
            type="text"
            name="nombre"
            maxLength={40}
            autoComplete="name"
          />
        </label>

        <label>
          Tipo de mensaje
          <select name="tipo">
            <option>Comentario</option>
            <option>Sugerencia</option>
            <option>Reportar un error</option>
          </select>
        </label>

        <label>
          Mensaje
          <textarea
            name="mensaje"
            maxLength={500}
            required
          ></textarea>
        </label>

        <button className="btn" type="submit" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Enviar'}
        </button>

        <p className="ok" role="status">{ok}</p>
      </form>
    </section>
  );
}
