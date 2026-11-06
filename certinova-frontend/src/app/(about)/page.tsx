'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Award,
  ShieldCheck,
  Lock,
  FileCheck,
  GraduationCap,
  ArrowRight
} from 'lucide-react';
import { AuthModal } from '@/components/auth-modal';
import { CertificateVerificationModal } from '@/components/certificate-verification-modal';
import { useAuth } from '@/context/AuthContext';
export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showVerificationModal, setShowVerificationModal] =
    useState(false);
  const authTriggerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [
    isAuthenticated,
    isLoading,
    router
  ]);
  if (isLoading) {
    return (
      <div className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-white
      ">
        <div className="text-center">
          <div className="
          w-12
          h-12
          rounded-full
          border-4
          border-[#003874]
          border-t-transparent
          animate-spin
          mx-auto
          mb-4
          "/>
          <p className="
          text-gray-500
          ">
            Cargando sistema...
          </p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <main
        className="
      min-h-screen
      bg-white
      text-gray-900
      "
      >
        {/* ================= NAVBAR ================= */}
        <nav
          className="
sticky
top-0
z-50
bg-white/90
backdrop-blur-xl
border-b
border-gray-100
shadow-sm
"
        >
          <div
            className="
container
mx-auto
px-6
py-4
"
          >
            <div
              className="
flex
items-center
justify-between
"
            >
              {/* LOGO Y NOMBRE */}
              <motion.div
                initial={{
                  opacity: 0,
                  x: -20
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                className="
flex
items-center
gap-4
"
              >
                <div
                  className="
w-14
h-14
rounded-2xl
bg-gradient-to-br
from-[#003874]
to-[#0055a5]
flex
items-center
justify-center
shadow-xl
shadow-blue-900/20
"
                >
                  <Award
                    className="
h-7
w-7
text-[#ffde32]
"
                  />
                </div>
                <div>
                  <h1
                    className="
text-xl
font-bold
tracking-tight
text-[#003874]
"
                  >
                    CERTIFICADOS
                  </h1>
                  <p
                    className="
text-sm
text-gray-600
"
                  >
                    Carrera de Turismo UMSA
                  </p>
                </div>
              </motion.div>
              {/* LOGIN */}
              <div
                ref={authTriggerRef}
              >
                <AuthModal />
              </div>
            </div>
          </div>
        </nav>
        {/* ================= HERO ================= */}
        <section
          className="
relative
overflow-hidden
py-28
"
        >
          <div
            className="
absolute
inset-0
bg-gradient-to-br
from-white
via-[#fffbea]
to-[#edf4ff]
"
          />
          <div
            className="
container
relative
z-10
mx-auto
px-6
"
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 30
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                duration: 0.8
              }}
              className="
max-w-4xl
mx-auto
text-center
"
            >
              <p
                className="
uppercase
tracking-[0.35em]
text-sm
font-semibold
text-[#003874]
mb-5
"
              >
                Universidad Mayor de San Andrés
              </p>
              <h1
                className="
text-5xl
md:text-7xl
font-bold
tracking-tight
text-[#003874]
leading-tight
"
              >
                Sistema de
                <br />
                <span
                  className="
text-[#003874]
"
                >
                  Certificados Académicos
                </span>
                <br />
                <span
                  className="
text-[#ffde32]
"
                >
                  Carrera de Turismo UMSA
                </span>
              </h1>
              <p
                className="
mt-8
max-w-2xl
mx-auto
text-lg
leading-relaxed
text-gray-600
"
              >
                Plataforma institucional para la
                gestión, emisión y validación de
                certificados académicos de la
                Carrera de Turismo.
              </p>
              <div
                className="
mt-10
flex
flex-col
sm:flex-row
justify-center
gap-4
"
              >
                <AuthModal
                  triggerText="Ingresar al sistema"
                />
                <button
                  onClick={() =>
                    setShowVerificationModal(true)
                  }
                  className="
inline-flex
items-center
justify-center
rounded-xl
border
border-[#003874]
px-6
py-3
font-semibold
text-[#003874]
transition
hover:bg-[#003874]
hover:text-white
"
                >
                  <ShieldCheck
                    className="
mr-2
h-5
w-5
"
                  />
                  Verificar certificado
                  <ArrowRight
                    className="
ml-2
h-4
w-4
"
                  />
                </button>
              </div>
            </motion.div>
          </div>
        </section>
        {/* ================= CARACTERISTICAS ================= */}
        <section
          className="
py-20
bg-white
"
        >
          <div
            className="
container
mx-auto
px-6
grid
md:grid-cols-3
gap-8
"
          >
            <CardInfo
              icon={<GraduationCap />}
              title="Gestión Académica"
              text="Administración digital de certificados institucionales."
            />
            <CardInfo
              icon={<FileCheck />}
              title="Emisión Digital"
              text="Generación de documentos académicos de manera eficiente."
            />
            <CardInfo
              icon={<Lock />}
              title="Validación Segura"
              text="Verificación confiable de certificados emitidos."
            />
          </div>
        </section>
        {/* ================= FOOTER ================= */}
        <footer
          className="
bg-[#003874]
py-10
text-center
text-white
"
        >
          <h2
            className="
text-xl
font-bold
"
          >
            CERTIFICADOS
          </h2>
          <p
            className="
mt-2
text-[#ffde32]
"
          >
            Carrera de Turismo UMSA
          </p>
          <p
            className="
mt-3
text-sm
text-gray-200
"
          >
            Universidad Mayor de San Andrés
          </p>
        </footer>
        <CertificateVerificationModal
          open={showVerificationModal}
          onClose={() =>
            setShowVerificationModal(false)
          }
        />
      </main>
    );
  }
  return null;
}
function CardInfo({
  icon,
  title,
  text
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div
      className="
rounded-3xl
border
border-gray-100
bg-white
p-8
text-center
shadow-[0_10px_40px_rgba(0,56,116,0.08)]
transition-all
duration-300
hover:-translate-y-2
"
    >
      <div
        className="
mx-auto
mb-5
flex
h-14
w-14
items-center
justify-center
rounded-2xl
bg-[#eef5ff]
text-[#003874]
"
      >
        {icon}
      </div>
      <h3
        className="
text-xl
font-bold
text-[#003874]
"
      >
        {title}
      </h3>
      <p
        className="
mt-3
text-gray-600
leading-relaxed
"
      >
        {text}
      </p>
    </div>
  );
}