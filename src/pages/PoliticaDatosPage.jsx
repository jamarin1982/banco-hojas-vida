import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

export default function PoliticaDatosPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/acceso" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm mb-8">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Política de Tratamiento de Datos Personales</h1>
            <p className="text-sm text-slate-500 mt-1">Colba Empleos · Grupo Colba</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 text-sm text-slate-700 leading-relaxed">
          <p>
            En cumplimiento de la <strong>Ley 1581 de 2012</strong> y el <strong>Decreto 1377 de 2013</strong>, 
            Colba Empleos (en adelante, "la Empresa") adopta la presente política para el tratamiento de datos personales.
          </p>

          <h2 className="text-lg font-bold text-slate-900">1. Responsable del Tratamiento</h2>
          <p>
            Colba Empleos · Grupo Colba, identificado conforme a las leyes colombianas, es el responsable 
            del tratamiento de sus datos personales.
          </p>

          <h2 className="text-lg font-bold text-slate-900">2. Datos Recolectados</h2>
          <p>Podemos recolectar la siguiente información:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Datos de identificación: nombre completo, correo electrónico</li>
            <li>Datos laborales: experiencia profesional, cargo, certificaciones</li>
            <li>Datos académicos: estudios, títulos obtenidos</li>
            <li>Hoja de vida (CV) en formato PDF o DOCX</li>
            <li>Aspiraciones salariales y disponibilidad</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900">3. Finalidades del Tratamiento</h2>
          <p>Los datos personales serán utilizados para:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Gestionar procesos de selección y vinculación laboral</li>
            <li>Evaluar perfiles profesionales para vacantes disponibles</li>
            <li>Contactar a los candidatos respecto a oportunidades laborales</li>
            <li>Realizar análisis de compatibilidad entre perfiles y vacantes</li>
            <li>Dar cumplimiento a obligaciones legales</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900">4. Derechos del Titular</h2>
          <p>Como titular de los datos, usted tiene los siguientes derechos:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Conocer, actualizar y rectificar sus datos personales</li>
            <li>Solicitar prueba de la autorización otorgada</li>
            <li>Ser informado sobre el uso de sus datos</li>
            <li>Presentar quejas ante la Superintendencia de Industria y Comercio</li>
            <li>Solicitar la eliminación de sus datos cuando no sean necesarios</li>
            <li>Revocar la autorización en cualquier momento</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900">5. Vigencia</h2>
          <p>
            Los datos personales suministrados se mantendrán durante el tiempo necesario para cumplir 
            con las finalidades descritas, y durante los plazos legales aplicables.
          </p>

          <h2 className="text-lg font-bold text-slate-900">6. Seguridad</h2>
          <p>
            La Empresa adopta medidas técnicas, administrativas y humanas para proteger los datos 
            personales contra acceso no autorizado, pérdida o alteración.
          </p>

          <h2 className="text-lg font-bold text-slate-900">7. Contacto</h2>
          <p>
            Para ejercer sus derechos o resolver cualquier inquietud, puede contactarnos a través de 
            los canales dispuestos en la plataforma.
          </p>

          <div className="pt-4 border-t border-slate-200 text-xs text-slate-400 text-center">
            Última actualización: Mayo 2026 · Versión 1.0
          </div>
        </div>
      </div>
    </div>
  );
}
