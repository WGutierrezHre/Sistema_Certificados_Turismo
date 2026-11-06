'use client';
import { useState } from 'react';
import {
  AlertTriangle,
  Trash2,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
interface DeleteConfirmationModalProps {
  open: boolean;
  eventName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}
export function DeleteConfirmationModal({
  open,
  eventName,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);
  /* =========================================================
     CONFIRMAR ELIMINACIÓN
  ========================================================= */
  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error(
        'Error al eliminar el certificado:',
        error
      );
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (
          !isOpen &&
          !isDeleting
        ) {
          onClose();
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
              -top-14
              h-36
              w-36
              rounded-full
              bg-[#ffde32]/15
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
              <AlertTriangle
                className="
                  h-7
                  w-7
                  text-[#003874]
                "
              />
            </div>
            <DialogTitle
              className="
                text-center
                text-xl
                font-bold
                text-white
              "
            >
              Eliminar certificado
            </DialogTitle>
            <p
              className="
                mt-2
                text-center
                text-sm
                leading-relaxed
                text-blue-100
              "
            >
              Esta acción eliminará de forma
              permanente la información
              relacionada con este evento.
            </p>
          </DialogHeader>
        </div>
        {/* =================================================
            CONTENIDO
        ================================================= */}
        <div
          className="
            space-y-5
            px-6
            pb-6
            pt-5
          "
        >
          {/* CERTIFICADO */}
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
                font-medium
                uppercase
                tracking-wide
                text-gray-400
              "
            >
              Certificado seleccionado
            </p>
            <p
              className="
                mt-1
                break-words
                text-sm
                font-bold
                text-[#003874]
              "
            >
              {eventName}
            </p>
          </div>
          {/* ADVERTENCIA */}
          <div
            className="
              rounded-2xl
              border
              border-[#ffde32]
              bg-[#fffbed]
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
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#ffde32]
                "
              >
                <AlertTriangle
                  className="
                    h-5
                    w-5
                    text-[#003874]
                  "
                />
              </div>
              <div>
                <p
                  className="
                    text-sm
                    font-bold
                    text-[#003874]
                  "
                >
                  Información que será eliminada
                </p>
                <ul
                  className="
                    mt-2
                    space-y-1.5
                    text-sm
                    leading-relaxed
                    text-gray-600
                  "
                >
                  <li
                    className="
                      flex
                      gap-2
                    "
                  >
                    <span
                      className="
                        font-bold
                        text-[#003874]
                      "
                    >
                      •
                    </span>
                    La plantilla y configuración
                    del certificado.
                  </li>
                  <li
                    className="
                      flex
                      gap-2
                    "
                  >
                    <span
                      className="
                        font-bold
                        text-[#003874]
                      "
                    >
                      •
                    </span>
                    El historial de certificados
                    generados.
                  </li>
                  <li
                    className="
                      flex
                      gap-2
                    "
                  >
                    <span
                      className="
                        font-bold
                        text-[#003874]
                      "
                    >
                      •
                    </span>
                    Los datos de los destinatarios
                    asociados al evento.
                  </li>
                  <li
                    className="
                      flex
                      gap-2
                    "
                  >
                    <span
                      className="
                        font-bold
                        text-[#003874]
                      "
                    >
                      •
                    </span>
                    Los certificados eliminados
                    dejarán de estar disponibles
                    para su verificación.
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* AVISO FINAL */}
          <div
            className="
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-red-100
              bg-red-50
              px-4
              py-3
            "
          >
            <AlertTriangle
              className="
                h-4
                w-4
                shrink-0
                text-red-600
              "
            />
            <p
              className="
                text-sm
                font-semibold
                text-red-700
              "
            >
              Esta acción no se puede deshacer.
            </p>
          </div>
          {/* =================================================
              BOTONES
          ================================================= */}
          <DialogFooter
            className="
              flex
              flex-col-reverse
              gap-3
              pt-1
              sm:flex-row
            "
          >
            <Button
              type="button"
              variant="outline"
              onClick={
                onClose
              }
              disabled={
                isDeleting
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
              <X
                className="
                  mr-2
                  h-4
                  w-4
                "
              />
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={
                handleConfirm
              }
              disabled={
                isDeleting
              }
              className="
                h-11
                flex-1
                rounded-xl
                bg-red-600
                font-semibold
                text-white
                shadow-md
                shadow-red-950/10
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-red-700
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {isDeleting ? (
                <>
                  <Loader2
                    className="
                      mr-2
                      h-4
                      w-4
                      animate-spin
                    "
                  />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2
                    className="
                      mr-2
                      h-4
                      w-4
                    "
                  />
                  Eliminar definitivamente
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}