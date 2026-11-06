import PageHero from '@/components/PageHero';
import Pending from '@/components/Pending';
import ContactForm from '@/components/ContactForm';

export const metadata = { title: 'Contacto' };

export default function Contacto() {
  return (
    <>
      <PageHero title="Contacto" lead="Escríbenos y tu mensaje llegará a la persona que corresponde." crumbs={[{ label: 'Contacto' }]} />
      <main id="contenido">
        <section className="s-light">
          <div className="u-container contact">
            <div className="prose">
              <span className="c-rule c-meta">Dónde estamos</span>
              <p>Av. Esteban Iturra s/n, Barrio Universitario<br />Universidad de Concepción, Concepción, Chile</p>
              <p><a href="https://www.instagram.com/cepiaudec" target="_blank" rel="noopener">Instagram @cepiaudec</a></p>
              <Pending text="Correo, teléfono y horario: por confirmar" />
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
    </>
  );
}
