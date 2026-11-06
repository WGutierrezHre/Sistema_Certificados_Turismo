'use client';
import { useState, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Mail,
  Lock,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  Award,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
interface AuthModalProps {
  onLogin?: () => void;
  triggerText?: string;
}
export function AuthModal({
  onLogin,
  triggerText,
}: AuthModalProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] =
    useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] =
    useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    organisation: '',
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    organisation?: string;
  }>({});
  const {
    login,
    signup,
    isLoading,
  } = useAuth();
  const handleInputChange = (
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };
  const handleOpenChange = (
    isOpen: boolean
  ) => {
    setOpen(isOpen);
    setErrors({});
    if (!isOpen) {
      setFormData({
        email: '',
        password: '',
        organisation: '',
      });
      setShowPassword(false);
    }
  };
  /* ================================
     INICIAR SESIÓN
  ================================= */
  const handleLogin = async () => {
    const error: {
      email?: string;
      password?: string;
    } = {};
    if (!formData.email.trim()) {
      error.email =
        'El correo electrónico es obligatorio';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      error.email =
        'Ingrese un correo electrónico válido';
    }
    if (!formData.password) {
      error.password =
        'La contraseña es obligatoria';
    }
    if (Object.keys(error).length > 0) {
      setErrors(error);
      return;
    }
    const success = await login({
      email: formData.email.trim(),
      password: formData.password,
    });
    if (success) {
      setOpen(false);
      setFormData({
        email: '',
        password: '',
        organisation: '',
      });
      setErrors({});
      onLogin?.();
    }
  };
  const handleSignup = async () => {
    const error: {
      email?: string;
      password?: string;
      organisation?: string;
    } = {};
    if (!formData.organisation.trim()) {
      error.organisation =
        'El nombre de la institución es obligatorio';
    }
    if (!formData.email.trim()) {
      error.email =
        'El correo electrónico es obligatorio';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      error.email =
        'Ingrese un correo electrónico válido';
    }
    if (!formData.password) {
      error.password =
        'La contraseña es obligatoria';
    } else if (
      formData.password.length < 6
    ) {
      error.password =
        'La contraseña debe tener al menos 6 caracteres';
    }
    if (Object.keys(error).length > 0) {
      setErrors(error);
      return;
    }
    const success = await signup({
      email: formData.email.trim(),
      password: formData.password,
      organisation:
        formData.organisation.trim(),
    });
    if (success) {
      setOpen(false);
      setFormData({
        email: '',
        password: '',
        organisation: '',
      });
      setErrors({});
      onLogin?.();
    }
  };
  /* ================================
     ENTER
  ================================= */
  const handleLoginKeyDown = (
    e: KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };
  const handleSignupKeyDown = (
    e: KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      handleSignup();
    }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>
        {triggerText ? (
          <Button
            size="lg"
            className="
              bg-[#003874]
              hover:bg-[#002b59]
              text-white
              font-semibold
              px-8
              h-12
              rounded-xl
              shadow-lg
              shadow-blue-900/20
              transition-all
              duration-300
              hover:-translate-y-0.5
            "
            onClick={() => {
              setActiveTab('signin');
              setOpen(true);
            }}
          >
            <Lock className="mr-2 h-4 w-4" />
            {triggerText}
          </Button>
        ) : (
          <div className="
            flex
            items-center
            gap-3
          ">
            <Button
              variant="outline"
              className="
                border-2
                border-[#003874]
                text-[#003874]
                bg-white
                hover:bg-[#eef5ff]
                hover:text-[#003874]
                rounded-xl
                font-semibold
                px-5
              "
              onClick={() => {
                setActiveTab('signin');
                setOpen(true);
              }}
            >
              Ingresar
            </Button>
            <Button
              className="
                bg-[#003874]
                hover:bg-[#002b59]
                text-white
                rounded-xl
                font-semibold
                px-5
                shadow-lg
                shadow-blue-900/20
              "
              onClick={() => {
                setActiveTab('signup');
                setOpen(true);
              }}
            >
              Registrarse
            </Button>
          </div>
        )}
      </DialogTrigger>
      <DialogContent
        className="
          sm:max-w-md
          p-0
          overflow-hidden
          bg-white
          border
          border-gray-100
          rounded-3xl
          shadow-2xl
        "
      >
        {/* CABECERA */}
        <div
          className="
            bg-gradient-to-br
            from-[#003874]
            to-[#00539c]
            px-6
            pt-8
            pb-7
            text-center
          "
        >
          <div
            className="
              mx-auto
              mb-4
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-[#ffde32]
              shadow-lg
            "
          >
            <Award
              className="
                h-7
                w-7
                text-[#003874]
              "
            />
          </div>
          <DialogHeader>
            <DialogTitle
              className="
                text-2xl
                font-bold
                text-center
                text-white
              "
            >
              Sistema de Certificados
            </DialogTitle>
          </DialogHeader>
          <p
            className="
              mt-2
              text-sm
              text-blue-100
            "
          >
            Carrera de Turismo UMSA
          </p>
        </div>
        {/* FORMULARIOS */}
        <div className="px-6 pb-7">
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              if (
                value === 'signin' ||
                value === 'signup'
              ) {
                setActiveTab(value);
                setErrors({});
              }
            }}
            className="w-full"
          >
            {/* TABS */}
            <TabsList
              className="
                grid
                w-full
                grid-cols-2
                mt-6
                mb-6
                p-1
                bg-[#eef5ff]
                rounded-xl
              "
            >
              <TabsTrigger
                value="signin"
                className="
                  rounded-lg
                  font-semibold
                  text-[#003874]
                  data-[state=active]:bg-[#003874]
                  data-[state=active]:text-white
                  data-[state=active]:shadow-md
                "
              >
                Ingresar
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="
                  rounded-lg
                  font-semibold
                  text-[#003874]
                  data-[state=active]:bg-[#ffde32]
                  data-[state=active]:text-[#003874]
                  data-[state=active]:shadow-md
                "
              >
                Registrarse
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="signin"
              className="space-y-4"
            >
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="space-y-5"
              >
                <div>
                  <h3
                    className="
                      text-lg
                      font-bold
                      text-[#003874]
                    "
                  >
                    Iniciar sesión
                  </h3>
                  <p
                    className="
                      mt-1
                      text-sm
                      text-gray-500
                    "
                  >
                    Ingrese sus credenciales para acceder al sistema.
                  </p>
                </div>
                {/* CORREO */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="
                      text-gray-700
                      font-medium
                    "
                  >
                    Correo electrónico
                  </Label>
                  <div className="relative">
                    <Mail
                      className={`
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        h-4
                        w-4
                        ${errors.email
                          ? 'text-red-400'
                          : 'text-[#003874]'
                        }
                      `}
                    />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Ingrese su correo electrónico"
                      className={`
                        pl-10
                        h-11
                        rounded-xl
                        focus-visible:ring-[#003874]
                        ${errors.email
                          ? 'border-red-500'
                          : 'border-gray-200'
                        }
                      `}
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange(
                          'email',
                          e.target.value
                        )
                      }
                    />
                  </div>
                  {errors.email && (
                    <div
                      className="
                        flex
                        items-center
                        text-xs
                        text-red-600
                        mt-1
                      "
                    >
                      <AlertCircle
                        className="
                          h-3.5
                          w-3.5
                          mr-1
                          flex-shrink-0
                        "
                      />
                      <span>
                        {errors.email}
                      </span>
                    </div>
                  )}
                </div>
                {/* CONTRASEÑA */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="
                      text-gray-700
                      font-medium
                    "
                  >
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock
                      className={`
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        h-4
                        w-4
                        ${errors.password
                          ? 'text-red-400'
                          : 'text-[#003874]'
                        }
                      `}
                    />
                    <Input
                      id="password"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      placeholder="Ingrese su contraseña"
                      className={`
                        pl-10
                        pr-10
                        h-11
                        rounded-xl
                        focus-visible:ring-[#003874]
                        ${errors.password
                          ? 'border-red-500'
                          : 'border-gray-200'
                        }
                      `}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange(
                          'password',
                          e.target.value
                        )
                      }
                      onKeyDown={
                        handleLoginKeyDown
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        text-gray-400
                        hover:text-[#003874]
                      "
                      disabled={isLoading}
                      aria-label={
                        showPassword
                          ? 'Ocultar contraseña'
                          : 'Mostrar contraseña'
                      }
                    >
                      {showPassword ? (
                        <EyeOff
                          className="
                            h-4
                            w-4
                          "
                        />
                      ) : (
                        <Eye
                          className="
                            h-4
                            w-4
                          "
                        />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <div
                      className="
                        flex
                        items-center
                        text-xs
                        text-red-600
                        mt-1
                      "
                    >
                      <AlertCircle
                        className="
                          h-3.5
                          w-3.5
                          mr-1
                          flex-shrink-0
                        "
                      />
                      <span>
                        {errors.password}
                      </span>
                    </div>
                  )}
                </div>
                {/* BOTÓN */}
                <Button
                  onClick={handleLogin}
                  className="
                    w-full
                    h-12
                    bg-[#003874]
                    hover:bg-[#002b59]
                    text-white
                    rounded-xl
                    font-semibold
                    shadow-md
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                  "
                  disabled={isLoading}
                >
                  {isLoading
                    ? 'Ingresando...'
                    : 'Ingresar al sistema'
                  }
                </Button>
                <p
                  className="
                    text-center
                    text-xs
                    text-gray-400
                  "
                >
                  Acceso al Sistema de Certificados
                  de la Carrera de Turismo UMSA.
                </p>
              </motion.div>
            </TabsContent>
            <TabsContent
              value="signup"
              className="space-y-4"
            >
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="space-y-5"
              >
                <div>
                  <h3
                    className="
                      text-lg
                      font-bold
                      text-[#003874]
                    "
                  >
                    Crear una cuenta
                  </h3>
                  <p
                    className="
                      mt-1
                      text-sm
                      text-gray-500
                    "
                  >
                    Complete los datos para registrarse
                    en el sistema.
                  </p>
                </div>
                {/* INSTITUCIÓN */}
                <div className="space-y-2">
                  <Label
                    htmlFor="organisation-name"
                    className="
                      text-gray-700
                      font-medium
                    "
                  >
                    Institución
                  </Label>
                  <div className="relative">
                    <User
                      className={`
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        h-4
                        w-4
                        ${errors.organisation
                          ? 'text-red-400'
                          : 'text-[#003874]'
                        }
                      `}
                    />
                    <Input
                      id="organisation-name"
                      placeholder="Ingrese el nombre de la institución"
                      className={`
                        pl-10
                        h-11
                        rounded-xl
                        focus-visible:ring-[#003874]
                        ${errors.organisation
                          ? 'border-red-500'
                          : 'border-gray-200'
                        }
                      `}
                      value={
                        formData.organisation
                      }
                      onChange={(e) =>
                        handleInputChange(
                          'organisation',
                          e.target.value
                        )
                      }
                    />
                  </div>
                  {errors.organisation && (
                    <div
                      className="
                        flex
                        items-center
                        text-xs
                        text-red-600
                        mt-1
                      "
                    >
                      <AlertCircle
                        className="
                          h-3.5
                          w-3.5
                          mr-1
                          flex-shrink-0
                        "
                      />
                      <span>
                        {errors.organisation}
                      </span>
                    </div>
                  )}
                </div>
                {/* CORREO */}
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-email"
                    className="
                      text-gray-700
                      font-medium
                    "
                  >
                    Correo electrónico
                  </Label>
                  <div className="relative">
                    <Mail
                      className={`
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        h-4
                        w-4
                        ${errors.email
                          ? 'text-red-400'
                          : 'text-[#003874]'
                        }
                      `}
                    />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Ingrese su correo electrónico"
                      className={`
                        pl-10
                        h-11
                        rounded-xl
                        focus-visible:ring-[#003874]
                        ${errors.email
                          ? 'border-red-500'
                          : 'border-gray-200'
                        }
                      `}
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange(
                          'email',
                          e.target.value
                        )
                      }
                    />
                  </div>
                  {errors.email && (
                    <div
                      className="
                        flex
                        items-center
                        text-xs
                        text-red-600
                        mt-1
                      "
                    >
                      <AlertCircle
                        className="
                          h-3.5
                          w-3.5
                          mr-1
                          flex-shrink-0
                        "
                      />
                      <span>
                        {errors.email}
                      </span>
                    </div>
                  )}
                </div>
                {/* CONTRASEÑA */}
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-password"
                    className="
                      text-gray-700
                      font-medium
                    "
                  >
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock
                      className={`
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        h-4
                        w-4
                        ${errors.password
                          ? 'text-red-400'
                          : 'text-[#003874]'
                        }
                      `}
                    />
                    <Input
                      id="signup-password"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      placeholder="Cree una contraseña"
                      className={`
                        pl-10
                        pr-10
                        h-11
                        rounded-xl
                        focus-visible:ring-[#003874]
                        ${errors.password
                          ? 'border-red-500'
                          : 'border-gray-200'
                        }
                      `}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange(
                          'password',
                          e.target.value
                        )
                      }
                      onKeyDown={
                        handleSignupKeyDown
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        text-gray-400
                        hover:text-[#003874]
                      "
                      disabled={isLoading}
                      aria-label={
                        showPassword
                          ? 'Ocultar contraseña'
                          : 'Mostrar contraseña'
                      }
                    >
                      {showPassword ? (
                        <EyeOff
                          className="
                            h-4
                            w-4
                          "
                        />
                      ) : (
                        <Eye
                          className="
                            h-4
                            w-4
                          "
                        />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <div
                      className="
                        flex
                        items-center
                        text-xs
                        text-red-600
                        mt-1
                      "
                    >
                      <AlertCircle
                        className="
                          h-3.5
                          w-3.5
                          mr-1
                          flex-shrink-0
                        "
                      />
                      <span>
                        {errors.password}
                      </span>
                    </div>
                  )}
                </div>
                {/* BOTÓN REGISTRO */}
                <Button
                  onClick={handleSignup}
                  className="
                    w-full
                    h-12
                    bg-[#ffde32]
                    hover:bg-[#f5d000]
                    text-[#003874]
                    rounded-xl
                    font-bold
                    shadow-md
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                  "
                  disabled={isLoading}
                >
                  {isLoading
                    ? 'Creando cuenta...'
                    : 'Crear cuenta'
                  }
                </Button>
                <p
                  className="
                    text-center
                    text-xs
                    text-gray-400
                  "
                >
                  Sistema institucional de certificados
                  académicos.
                </p>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}