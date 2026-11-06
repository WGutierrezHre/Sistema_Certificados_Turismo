'use client';
import type React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
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
  Award,
  Building,
  AlertCircle,
} from 'lucide-react';
interface CreateCertificateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    eventName: string,
    issuerName: string
  ) => void;
}
export function CreateCertificateModal({
  open,
  onClose,
  onSubmit,
}: CreateCertificateModalProps) {
  const [eventName, setEventName] =
    useState('');
  const [issuerName, setIssuerName] =
    useState('');
  const [errors, setErrors] = useState<{
    eventName?: string;
    issuerName?: string;
  }>({});
  /* ==========================================
     CERRAR MODAL
  ========================================== */
  const handleClose = () => {
    setEventName('');
    setIssuerName('');
    setErrors({});
    onClose();
  };
  /* ==========================================
     CREAR CERTIFICADO
  ========================================== */
  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    const error: {
      eventName?: string;
      issuerName?: string;
    } = {};
    if (!eventName.trim()) {
      error.eventName =
        'El nombre del evento es obligatorio';
    }
    if (!issuerName.trim()) {
      error.issuerName =
        'El nombre del emisor es obligatorio';
    }
    if (
      Object.keys(error).length > 0
    ) {
      setErrors(error);
      return;
    }
    onSubmit(
      eventName.trim(),
      issuerName.trim()
    );
    setEventName('');
    setIssuerName('');
    setErrors({});
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
          border
          border-gray-100
          bg-white
          p-0
          shadow-2xl
          sm:max-w-md
          rounded-3xl
        "
      >
        {/* =====================================
            CABECERA
        ====================================== */}
        <div
          className="
            bg-gradient-to-br
            from-[#003874]
            via-[#004b91]
            to-[#00539c]
            px-6
            pb-7
            pt-8
            text-center
          "
        >
          <div
            className="
              mx-auto
              mb-4
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-[#ffde32]
              shadow-lg
              shadow-blue-950/20
            "
          >
            <Award
              className="
                h-8
                w-8
                text-[#003874]
              "
            />
          </div>
          <DialogHeader>
            <DialogTitle
              className="
                text-center
                text-2xl
                font-bold
                text-white
              "
            >
              Crear nuevo certificado
            </DialogTitle>
          </DialogHeader>
          <p
            className="
              mx-auto
              mt-2
              max-w-sm
              text-sm
              leading-relaxed
              text-blue-100
            "
          >
            Complete los datos principales del evento
            para comenzar a configurar el certificado.
          </p>
        </div>
        {/* =====================================
            FORMULARIO
        ====================================== */}
        <motion.form
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
          }}
          onSubmit={handleSubmit}
          className="
            space-y-5
            px-6
            pb-7
            pt-6
          "
        >
          {/* ===================================
              NOMBRE DEL EVENTO
          ==================================== */}
          <div
            className="
              space-y-2
            "
          >
            <Label
              htmlFor="eventName"
              className="
                text-sm
                font-semibold
                text-[#003874]
              "
            >
              Nombre del evento
              <span
                className="
                  ml-1
                  text-red-500
                "
              >
                *
              </span>
            </Label>
            <div
              className="
                relative
              "
            >
              <Award
                className={`
                  absolute
                  left-3
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  ${
                    errors.eventName
                      ? 'text-red-400'
                      : 'text-[#003874]'
                  }
                `}
              />
              <Input
                id="eventName"
                value={eventName}
                onChange={(e) => {
                  setEventName(
                    e.target.value
                  );
                  setErrors((prev) => ({
                    ...prev,
                    eventName:
                      undefined,
                  }));
                }}
                placeholder="Ej.: Seminario de Turismo 2026"
                className={`
                  h-11
                  rounded-xl
                  pl-10
                  text-gray-700
                  placeholder:text-gray-400
                  focus-visible:ring-[#003874]
                  ${
                    errors.eventName
                      ? `
                        border-red-500
                        focus-visible:ring-red-500
                      `
                      : `
                        border-gray-200
                      `
                  }
                `}
              />
            </div>
            {errors.eventName && (
              <div
                className="
                  mt-1
                  flex
                  items-center
                  text-xs
                  text-red-600
                "
              >
                <AlertCircle
                  className="
                    mr-1
                    h-3.5
                    w-3.5
                    flex-shrink-0
                  "
                />
                <span>
                  {errors.eventName}
                </span>
              </div>
            )}
          </div>
          {/* ===================================
              NOMBRE DEL EMISOR
          ==================================== */}
          <div
            className="
              space-y-2
            "
          >
            <Label
              htmlFor="issuerName"
              className="
                text-sm
                font-semibold
                text-[#003874]
              "
            >
              Nombre del emisor
              <span
                className="
                  ml-1
                  text-red-500
                "
              >
                *
              </span>
            </Label>
            <div
              className="
                relative
              "
            >
              <Building
                className={`
                  absolute
                  left-3
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  ${
                    errors.issuerName
                      ? 'text-red-400'
                      : 'text-[#003874]'
                  }
                `}
              />
              <Input
                id="issuerName"
                value={issuerName}
                onChange={(e) => {
                  setIssuerName(
                    e.target.value
                  );
                  setErrors((prev) => ({
                    ...prev,
                    issuerName:
                      undefined,
                  }));
                }}
                placeholder="Ej.: Carrera de Turismo UMSA"
                className={`
                  h-11
                  rounded-xl
                  pl-10
                  text-gray-700
                  placeholder:text-gray-400
                  focus-visible:ring-[#003874]
                  ${
                    errors.issuerName
                      ? `
                        border-red-500
                        focus-visible:ring-red-500
                      `
                      : `
                        border-gray-200
                      `
                  }
                `}
              />
            </div>
            {errors.issuerName && (
              <div
                className="
                  mt-1
                  flex
                  items-center
                  text-xs
                  text-red-600
                "
              >
                <AlertCircle
                  className="
                    mr-1
                    h-3.5
                    w-3.5
                    flex-shrink-0
                  "
                />
                <span>
                  {errors.issuerName}
                </span>
              </div>
            )}
          </div>
          {/* ===================================
              INFORMACIÓN
          ==================================== */}
          <div
            className="
              rounded-xl
              border
              border-[#003874]/10
              bg-[#f8fbff]
              px-4
              py-3
            "
          >
            <p
              className="
                text-xs
                leading-relaxed
                text-gray-500
              "
            >
              Estos datos identificarán el evento
              y podrán utilizarse posteriormente
              durante la configuración del
              certificado.
            </p>
          </div>
          {/* ===================================
              BOTONES
          ==================================== */}
          <div
            className="
              flex
              gap-3
              pt-2
            "
          >
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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
              "
            >
              Cancelar
            </Button>
            <Button
              type="submit"
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
              "
            >
              Continuar
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}