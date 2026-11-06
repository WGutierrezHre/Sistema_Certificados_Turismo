'use client';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
interface PasswordDialogProps {
  purpose: 'Encrypt' | 'Decrypt';
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  title: string;
  description?: string;
  isLoading?: boolean;
}
export function PasswordDialog({
  purpose,
  open,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
}: PasswordDialogProps) {
  const [
    password,
    setPassword,
  ] = useState('');
  const [
    showPassword,
    setShowPassword,
  ] = useState(false);
  const [
    error,
    setError,
  ] = useState('');
  /* =========================================================
     CONFIRMAR CONTRASEÑA
  ========================================================= */
  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    if (!password.trim()) {
      setError(
        'La contraseña es obligatoria'
      );
      return;
    }
    if (
      password.length < 6
    ) {
      setError(
        'La contraseña debe tener al menos 6 caracteres'
      );
      return;
    }
    setError('');
    onConfirm(password);
  };
  /* =========================================================
     CERRAR
  ========================================================= */
  const handleClose = () => {
    setPassword('');
    setError('');
    setShowPassword(false);
    onClose();
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent
        className="
          overflow-hidden
          rounded-3xl
          border
          border-gray-100
          bg-white
          p-0
          shadow-2xl
          sm:max-w-md
        "
      >
        {/* =================================================
            CABECERA
        ================================================= */}
        <div
          className="
            relative
            overflow-hidden
            bg-gradient-to-br
            from-[#003874]
            via-[#004b91]
            to-[#00539c]
            px-6
            pb-6
            pt-7
          "
        >
          {/* DECORACIÓN */}
          <div
            className="
              absolute
              -right-12
              -top-16
              h-40
              w-40
              rounded-full
              bg-[#ffde32]/15
            "
          />
          <div
            className="
              absolute
              -bottom-16
              -left-10
              h-32
              w-32
              rounded-full
              bg-white/5
            "
          />
          <DialogHeader
            className="
              relative
              z-10
              items-center
              text-center
            "
          >
            <div
              className="
                mb-3
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-[#ffde32]
                shadow-lg
                shadow-blue-950/20
              "
            >
              {purpose === 'Encrypt' ? (
                <ShieldCheck
                  className="
                    h-7
                    w-7
                    text-[#003874]
                  "
                />
              ) : (
                <Lock
                  className="
                    h-7
                    w-7
                    text-[#003874]
                  "
                />
              )}
            </div>
            <DialogTitle
              className="
                text-center
                text-xl
                font-bold
                text-white
              "
            >
              {title}
            </DialogTitle>
            {description && (
              <p
                className="
                  mt-2
                  max-w-sm
                  text-center
                  text-sm
                  leading-relaxed
                  text-blue-100
                "
              >
                {description}
              </p>
            )}
          </DialogHeader>
        </div>
        {/* =================================================
            FORMULARIO
        ================================================= */}
        <form
          onSubmit={
            handleSubmit
          }
          className="
            space-y-5
            px-6
            pb-6
            pt-5
          "
        >
          {/* =================================================
              CONTRASEÑA
          ================================================= */}
          <div
            className="
              space-y-2
            "
          >
            <Label
              htmlFor="password"
              className="
                text-sm
                font-semibold
                text-[#003874]
              "
            >
              Contraseña
            </Label>
            <div
              className="
                relative
              "
            >
              <Lock
                className={`
                  absolute
                  left-3
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  ${
                    error
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
                value={
                  password
                }
                onChange={(e) => {
                  setPassword(
                    e.target.value
                  );
                  setError('');
                }}
                placeholder="
                  Ingrese su contraseña
                "
                className={`
                  h-11
                  rounded-xl
                  pl-10
                  pr-11
                  text-gray-700
                  placeholder:text-gray-400
                  focus-visible:ring-[#003874]
                  ${
                    error
                      ? `
                        border-red-500
                        focus-visible:ring-red-500
                      `
                      : `
                        border-gray-200
                      `
                  }
                `}
                disabled={
                  isLoading
                }
                autoFocus
              />
              {/* MOSTRAR / OCULTAR */}
              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                disabled={
                  isLoading
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  rounded-md
                  p-1
                  text-gray-400
                  transition-colors
                  hover:bg-[#eef5ff]
                  hover:text-[#003874]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
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
            {/* ERROR */}
            {error && (
              <div
                className="
                  flex
                  items-center
                  gap-1.5
                  rounded-lg
                  bg-red-50
                  px-3
                  py-2
                  text-xs
                  font-medium
                  text-red-600
                "
              >
                <AlertCircle
                  className="
                    h-4
                    w-4
                    shrink-0
                  "
                />
                <span>
                  {error}
                </span>
              </div>
            )}
          </div>
          {/* =================================================
              MENSAJE DE SEGURIDAD
          ================================================= */}
          {purpose ===
            'Encrypt' && (
            <div
              className="
                rounded-xl
                border
                border-[#003874]/10
                bg-[#f8fbff]
                p-4
              "
            >
              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-[#ffde32]
                  "
                >
                  <ShieldCheck
                    className="
                      h-4
                      w-4
                      text-[#003874]
                    "
                  />
                </div>
                <div>
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-[#003874]
                    "
                  >
                    Protección de datos
                  </p>
                  <p
                    className="
                      mt-1
                      text-xs
                      leading-relaxed
                      text-gray-500
                    "
                  >
                    La información será protegida
                    antes de almacenarse de forma
                    segura en el sistema.
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* =================================================
              BOTONES
          ================================================= */}
          <div
            className="
              flex
              gap-3
              pt-1
            "
          >
            <Button
              type="button"
              variant="outline"
              onClick={
                handleClose
              }
              disabled={
                isLoading
              }
              className="
                h-11
                flex-1
                rounded-xl
                border
                border-[#003874]/20
                bg-white
                font-semibold
                text-[#003874]
                transition-all
                hover:border-[#003874]
                hover:bg-[#eef5ff]
                hover:text-[#003874]
                disabled:opacity-50
              "
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !password.trim()
              }
              className="
                h-11
                flex-1
                rounded-xl
                bg-[#003874]
                font-semibold
                text-white
                shadow-md
                shadow-blue-950/10
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-[#002b59]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {isLoading ? (
                <>
                  <Loader2
                    className="
                      mr-2
                      h-4
                      w-4
                      animate-spin
                    "
                  />
                  Procesando...
                </>
              ) : (
                <>
                  <Lock
                    className="
                      mr-2
                      h-4
                      w-4
                    "
                  />
                  Confirmar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}