'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Award,
  Plus,
  Send,
  LogOut,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { ViewHistoryButton } from '@/components/view-history-button';
interface NavbarProps {
  variant?: 'dashboard' | 'certificate';
  onCreateNew?: () => void;
  onSendCertificates?: () => void;
}
export function Navbar({
  variant = 'dashboard',
  onCreateNew,
  onSendCertificates,
}: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  /* ==========================================
     INICIALES DEL USUARIO
  ========================================== */
  const getUserInitials = (
    name: string
  ) => {
    return name
      .split(' ')
      .filter(Boolean)
      .map((word) =>
        word
          .charAt(0)
          .toUpperCase()
      )
      .join('')
      .slice(0, 2);
  };
  /* ==========================================
     VOLVER AL DASHBOARD
  ========================================== */
  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };
  return (
    <motion.nav
      initial={{
        opacity: 0,
        y: -20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
      }}
      className="
        sticky
        top-0
        z-50
        border-b
        border-[#003874]/10
        bg-white/95
        shadow-sm
        backdrop-blur-xl
      "
    >
      <div
        className="
          container
          mx-auto
          px-4
          py-3
          sm:px-6
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-3
          "
        >
          {/* =====================================
              LOGO
          ====================================== */}
          <Link
            href="/dashboard"
            className="
              group
              flex
              shrink-0
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-[#003874]
                shadow-md
                shadow-blue-950/10
                transition-transform
                duration-300
                group-hover:scale-105
                sm:h-11
                sm:w-11
              "
            >
              <Award
                className="
                  h-5
                  w-5
                  text-[#ffde32]
                  sm:h-6
                  sm:w-6
                "
              />
            </div>
            <div
              className="
                hidden
                sm:block
              "
            >
              <h1
                className="
                  text-lg
                  font-bold
                  leading-tight
                  tracking-tight
                  text-[#003874]
                  lg:text-xl
                "
              >
                CERTIFICADOS
              </h1>
              <p
                className="
                  text-[11px]
                  font-medium
                  text-gray-500
                "
              >
                Carrera de Turismo UMSA
              </p>
            </div>
          </Link>
          {/* =====================================
              ACCIONES
          ====================================== */}
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            {variant === 'dashboard' ? (
              <>
                {/* ===============================
                    CREAR CERTIFICADO
                ================================ */}
                <Button
                  onClick={onCreateNew}
                  className="
                    h-10
                    rounded-xl
                    bg-[#003874]
                    px-3
                    font-semibold
                    text-white
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:bg-[#002b59]
                    sm:px-4
                  "
                >
                  <Plus
                    className="
                      h-4
                      w-4
                      sm:mr-2
                    "
                  />
                  <span
                    className="
                      hidden
                      sm:inline
                    "
                  >
                    Nuevo certificado
                  </span>
                </Button>
                {/* ===============================
                    ENVIAR CERTIFICADOS
                ================================ */}
                <Button
                  onClick={
                    onSendCertificates
                  }
                  variant="outline"
                  className="
                    hidden
                    h-10
                    rounded-xl
                    border
                    border-[#003874]/20
                    bg-white
                    px-4
                    font-semibold
                    text-[#003874]
                    transition-all
                    hover:border-[#003874]
                    hover:bg-[#eef5ff]
                    hover:text-[#003874]
                    md:inline-flex
                  "
                >
                  <Send
                    className="
                      mr-2
                      h-4
                      w-4
                    "
                  />
                  Enviar certificados
                </Button>
                {/* ===============================
                    HISTORIAL
                ================================ */}
                <div
                  className="
                    hidden
                    lg:block
                  "
                >
                  <ViewHistoryButton />
                </div>
              </>
            ) : (
              /* ===============================
                 VOLVER AL DASHBOARD
              ================================ */
              <Button
                onClick={
                  handleBackToDashboard
                }
                variant="outline"
                className="
                  h-10
                  rounded-xl
                  border
                  border-[#003874]/20
                  bg-white
                  px-3
                  font-semibold
                  text-[#003874]
                  hover:border-[#003874]
                  hover:bg-[#eef5ff]
                  hover:text-[#003874]
                  sm:px-4
                "
              >
                <ArrowLeft
                  className="
                    h-4
                    w-4
                    sm:mr-2
                  "
                />
                <span
                  className="
                    hidden
                    sm:inline
                  "
                >
                  Volver al panel
                </span>
              </Button>
            )}
            {/* =====================================
                USUARIO
            ====================================== */}
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
              >
                <Button
                  variant="ghost"
                  className="
                    flex
                    h-11
                    items-center
                    gap-2
                    rounded-xl
                    px-1.5
                    hover:bg-[#eef5ff]
                    sm:px-2
                  "
                  aria-label="Menú de usuario"
                >
                  <Avatar
                    className="
                      h-9
                      w-9
                      border-2
                      border-[#ffde32]
                    "
                  >
                    <AvatarFallback
                      className="
                        bg-[#003874]
                        text-sm
                        font-bold
                        text-white
                      "
                    >
                      {user
                        ? getUserInitials(
                            user.organisation
                          )
                        : 'U'
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className="
                      hidden
                      max-w-[160px]
                      text-left
                      lg:block
                    "
                  >
                    <p
                      className="
                        truncate
                        text-sm
                        font-semibold
                        text-[#003874]
                      "
                    >
                      {user?.organisation ||
                        'Usuario'}
                    </p>
                    <p
                      className="
                        truncate
                        text-[11px]
                        text-gray-400
                      "
                    >
                      {user?.email}
                    </p>
                  </div>
                  <ChevronDown
                    className="
                      hidden
                      h-4
                      w-4
                      text-gray-400
                      lg:block
                    "
                  />
                </Button>
              </DropdownMenuTrigger>
              {/* =================================
                  MENÚ DESPLEGABLE
              ================================== */}
              <DropdownMenuContent
                align="end"
                className="
                  w-64
                  rounded-2xl
                  border
                  border-gray-100
                  bg-white
                  p-2
                  shadow-xl
                "
              >
                {/* INFORMACIÓN */}
                <div
                  className="
                    px-3
                    py-3
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <Avatar
                      className="
                        h-11
                        w-11
                        border-2
                        border-[#ffde32]
                      "
                    >
                      <AvatarFallback
                        className="
                          bg-[#003874]
                          font-bold
                          text-white
                        "
                      >
                        {user
                          ? getUserInitials(
                              user.organisation
                            )
                          : 'U'
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >
                      <p
                        className="
                          truncate
                          text-sm
                          font-bold
                          text-[#003874]
                        "
                      >
                        {user?.organisation ||
                          'Usuario'}
                      </p>
                      <p
                        className="
                          mt-0.5
                          truncate
                          text-xs
                          text-gray-500
                        "
                      >
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator
                  className="
                    bg-gray-100
                  "
                />
                {/* OPCIONES MÓVILES */}
                {variant ===
                  'dashboard' && (
                  <div
                    className="
                      lg:hidden
                    "
                  >
                    <DropdownMenuItem
                      onClick={
                        onSendCertificates
                      }
                      className="
                        cursor-pointer
                        rounded-xl
                        px-3
                        py-2.5
                        font-medium
                        text-[#003874]
                        focus:bg-[#eef5ff]
                        focus:text-[#003874]
                        md:hidden
                      "
                    >
                      <Send
                        className="
                          mr-2
                          h-4
                          w-4
                        "
                      />
                      Enviar certificados
                    </DropdownMenuItem>
                    <div
                      className="
                        px-1
                        py-1
                      "
                    >
                      <div
                        className="
                          lg:hidden
                        "
                      >
                        <ViewHistoryButton />
                      </div>
                    </div>
                    <DropdownMenuSeparator
                      className="
                        bg-gray-100
                      "
                    />
                  </div>
                )}
                {/* CERRAR SESIÓN */}
                <DropdownMenuItem
                  onClick={logout}
                  className="
                    cursor-pointer
                    rounded-xl
                    px-3
                    py-2.5
                    font-semibold
                    text-red-600
                    focus:bg-red-50
                    focus:text-red-700
                  "
                >
                  <LogOut
                    className="
                      mr-2
                      h-4
                      w-4
                    "
                  />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}