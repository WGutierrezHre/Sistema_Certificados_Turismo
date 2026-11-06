'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ShieldX,
  Award,
  Building2,
  Calendar,
  User,
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import QRCode from 'qrcode';
import Link from 'next/link';
import { certificateService } from '@/services/certificate';
interface FieldPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  color?: string;
}
interface VerificationData {
  uuid: string;
  organisation: string;
  issuerName: string;
  eventName: string;
  eventDate: string;
  certificateGeneratedDate: string;
  verifiedAt: string;
  certificateConfig: {
    imagePath: string;
    validFields: {
      recipientName?: FieldPosition;
      organisationName?: FieldPosition;
      certificateLink?: FieldPosition;
      certificateQR?: FieldPosition;
    };
  };
}
interface VerificationStep {
  id: number;
  label: string;
  description: string;
  completedText: string;
  progress: number;
  isCompleted: boolean;
  hasError: boolean;
}
const SAMPLE_NAME = 'María Pérez';
export default function VerifyPage() {
  const params = useParams();
  const uuid = params.uuid as string;
  const [status, setStatus] = useState<
    'loading' | 'success' | 'error'
  >('loading');
  const [
    verificationData,
    setVerificationData,
  ] = useState<VerificationData | null>(null);
  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');
  const [
    certificateDataUrl,
    setCertificateDataUrl,
  ] = useState<string | null>(null);
  const [steps, setSteps] = useState<VerificationStep[]>([
    {
      id: 1,
      label: 'Búsqueda del certificado',
      description: 'Buscando el identificador de verificación...',
      completedText: 'Identificador encontrado en el sistema',
      progress: 0,
      isCompleted: false,
      hasError: false,
    },
    {
      id: 2,
      label: 'Validación del certificado',
      description: 'Consultando la información del certificado...',
      completedText: 'Certificado validado correctamente',
      progress: 0,
      isCompleted: false,
      hasError: false,
    },
    {
      id: 3,
      label: 'Verificación del emisor',
      description: 'Comprobando la información del emisor...',
      completedText: 'Emisor e institución verificados',
      progress: 0,
      isCompleted: false,
      hasError: false,
    },
  ]);
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };
  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const animateProgress = useCallback(
    (stepIndex: number): Promise<void> => {
      return new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 8;
          setSteps((prev) =>
            prev.map((step, index) =>
              index === stepIndex
                ? {
                    ...step,
                    progress: Math.min(progress, 100),
                  }
                : step
            )
          );
          if (progress >= 100) {
            clearInterval(interval);
            setSteps((prev) =>
              prev.map((step, index) =>
                index === stepIndex
                  ? {
                      ...step,
                      isCompleted: true,
                      progress: 100,
                    }
                  : step
              )
            );
            setTimeout(resolve, 200);
          }
        }, 25);
      });
    },
    []
  );
  const renderCertificateToDataUrl = useCallback(
    async (data: VerificationData): Promise<string> => {
      const {
        certificateConfig,
      } = data;
      const response = await fetch(
        certificateConfig.imagePath
      );
      if (!response.ok) {
        throw new Error(
          'No se pudo cargar la plantilla del certificado'
        );
      }
      const blob = await response.blob();
      const objectUrl =
        URL.createObjectURL(blob);
      return new Promise<string>((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = async () => {
          try {
            const canvas =
              document.createElement('canvas');
            const ctx =
              canvas.getContext('2d');
            if (!ctx) {
              reject(
                new Error(
                  'No se pudo inicializar el lienzo'
                )
              );
              return;
            }
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(
              img,
              0,
              0
            );
            const applyRuleBasedStyling = (
              fieldType: string,
              basePosition: FieldPosition
            ) => {
              const position = {
                ...basePosition,
              };
              switch (fieldType) {
                case 'recipientName':
                  if (!position.fontWeight) {
                    position.fontWeight =
                      'bold';
                  }
                  if (!position.fontFamily) {
                    position.fontFamily =
                      'Montserrat';
                  }
                  break;
                case 'organisationName':
                  if (!position.fontFamily) {
                    position.fontFamily =
                      'Inter';
                  }
                  if (!position.fontWeight) {
                    position.fontWeight =
                      'normal';
                  }
                  break;
                case 'certificateLink':
                  if (!position.fontFamily) {
                    position.fontFamily =
                      'Open Sans';
                  }
                  if (!position.textDecoration) {
                    position.textDecoration =
                      'underline';
                  }
                  break;
                case 'certificateQR':
                  if (!position.fontFamily) {
                    position.fontFamily =
                      'Inter';
                  }
                  if (!position.fontWeight) {
                    position.fontWeight =
                      'bold';
                  }
                  break;
              }
              if (!position.color) {
                position.color =
                  '#000000';
              }
              return position;
            };
            const drawCenteredText = (
              text: string,
              position: FieldPosition,
              maxFontSize = 72,
              fieldType?: string
            ) => {
              const styledPosition =
                fieldType
                  ? applyRuleBasedStyling(
                      fieldType,
                      position
                    )
                  : position;
              const fontFamily =
                styledPosition.fontFamily ||
                'Inter';
              const fontWeight =
                styledPosition.fontWeight ||
                'normal';
              const fontStyle =
                styledPosition.fontStyle ||
                'normal';
              const textDecoration =
                styledPosition.textDecoration ||
                'none';
              const color =
                styledPosition.color ||
                '#000000';
              const avgCharWidth =
                0.6;
              let fontSize = Math.min(
                styledPosition.width /
                  (
                    Math.max(
                      text.length,
                      1
                    ) *
                    avgCharWidth
                  ),
                styledPosition.height *
                  0.8,
                maxFontSize
              );
              fontSize =
                Math.max(
                  fontSize,
                  8
                );
              ctx.font =
                `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
              let metrics =
                ctx.measureText(text);
              const maxWidth =
                styledPosition.width *
                0.9;
              const maxHeight =
                styledPosition.height *
                0.8;
              if (
                metrics.width > maxWidth ||
                fontSize > maxHeight
              ) {
                const widthRatio =
                  maxWidth /
                  metrics.width;
                const heightRatio =
                  maxHeight /
                  fontSize;
                fontSize *=
                  Math.min(
                    widthRatio,
                    heightRatio
                  );
                ctx.font =
                  `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
                metrics =
                  ctx.measureText(text);
              }
              const textX =
                styledPosition.x +
                (
                  styledPosition.width -
                  metrics.width
                ) /
                  2;
              const ascent =
                metrics.actualBoundingBoxAscent ||
                fontSize * 0.7;
              const textY =
                styledPosition.y +
                (
                  styledPosition.height +
                  ascent
                ) /
                  2;
              ctx.fillStyle =
                color;
              ctx.fillText(
                text,
                textX,
                textY
              );
              if (
                textDecoration ===
                'underline'
              ) {
                const underlineY =
                  textY + 2;
                ctx.strokeStyle =
                  color;
                ctx.beginPath();
                ctx.moveTo(
                  textX,
                  underlineY
                );
                ctx.lineTo(
                  textX +
                    metrics.width,
                  underlineY
                );
                ctx.lineWidth =
                  Math.max(
                    1,
                    fontSize / 20
                  );
                ctx.stroke();
              }
            };
            const drawQRCode = async (
              dataQR: string,
              position: FieldPosition
            ) => {
              try {
                const qrDataUrl =
                  await QRCode.toDataURL(
                    dataQR,
                    {
                      width:
                        Math.min(
                          position.width,
                          position.height
                        ),
                      margin: 1,
                      color: {
                        dark:
                          '#000000',
                        light:
                          '#FFFFFF',
                      },
                    }
                  );
                const qrImg =
                  new window.Image();
                qrImg.crossOrigin =
                  'anonymous';
                await new Promise<void>(
                  (
                    resolveQR,
                    rejectQR
                  ) => {
                    qrImg.onload =
                      () =>
                        resolveQR();
                    qrImg.onerror =
                      rejectQR;
                    qrImg.src =
                      qrDataUrl;
                  }
                );
                const qrSize =
                  Math.min(
                    position.width,
                    position.height
                  ) *
                  0.8;
                const qrX =
                  position.x +
                  (
                    position.width -
                    qrSize
                  ) /
                    2;
                const qrY =
                  position.y +
                  (
                    position.height -
                    qrSize
                  ) /
                    2;
                ctx.drawImage(
                  qrImg,
                  qrX,
                  qrY,
                  qrSize,
                  qrSize
                );
              } catch (error) {
                console.error(
                  'Error al generar el código QR:',
                  error
                );
                drawCenteredText(
                  `[QR: ${dataQR}]`,
                  position,
                  16,
                  'certificateQR'
                );
              }
            };
            /* =================================================
               INSERTAR CAMPOS
            ================================================= */
            const {
              validFields,
            } = certificateConfig;
            if (
              validFields.recipientName
            ) {
              drawCenteredText(
                SAMPLE_NAME,
                validFields.recipientName,
                100,
                'recipientName'
              );
            }
            if (
              validFields.organisationName
            ) {
              drawCenteredText(
                data.organisation,
                validFields.organisationName,
                72,
                'organisationName'
              );
            }
            if (
              validFields.certificateLink
            ) {
              const verifyUrl =
                typeof window !==
                'undefined'
                  ? `${window.location.origin}/verify/${data.uuid}`
                  : data.uuid;
              drawCenteredText(
                verifyUrl,
                validFields.certificateLink,
                24,
                'certificateLink'
              );
            }
            if (
              validFields.certificateQR
            ) {
              const verifyUrl =
                typeof window !==
                'undefined'
                  ? `${window.location.origin}/verify/${data.uuid}`
                  : data.uuid;
              await drawQRCode(
                verifyUrl,
                validFields.certificateQR
              );
            }
            const dataUrl =
              canvas.toDataURL(
                'image/png'
              );
            URL.revokeObjectURL(
              objectUrl
            );
            resolve(dataUrl);
          } catch (error) {
            URL.revokeObjectURL(
              objectUrl
            );
            reject(error);
          }
        };
        img.onerror = () => {
          URL.revokeObjectURL(
            objectUrl
          );
          reject(
            new Error(
              'No se pudo cargar la imagen del certificado'
            )
          );
        };
        img.src =
          objectUrl;
      });
    },
    []
  );
  /* =========================================================
     VERIFICAR CERTIFICADO
  ========================================================= */
  useEffect(() => {
    if (!uuid) {
      return;
    }
    const verify =
      async () => {
        try {
          /* PASO 1 */
          await animateProgress(0);
          const result =
            await certificateService
              .verifyCertificateFull(
                uuid
              );
          if (
            !result.success ||
            !result.verified ||
            !result.data
          ) {
            setSteps((prev) =>
              prev.map(
                (
                  step,
                  index
                ) =>
                  index === 0
                    ? {
                        ...step,
                        hasError: true,
                        progress: 100,
                        isCompleted: false,
                      }
                    : step
              )
            );
            setErrorMessage(
              result.message ||
                'No se pudo verificar el certificado'
            );
            setStatus(
              'error'
            );
            return;
          }
          /* INFORMACIÓN DE LOS SIGUIENTES PASOS */
          setSteps((prev) =>
            prev.map(
              (
                step,
                index
              ) => {
                if (
                  index === 1
                ) {
                  return {
                    ...step,
                    completedText:
                      `Certificado generado el ${new Date(
                        result.data!
                          .certificateGeneratedDate
                      ).toLocaleDateString(
                        'es-BO'
                      )}`,
                  };
                }
                if (
                  index === 2
                ) {
                  return {
                    ...step,
                    completedText:
                      `${result.data!.issuerName} • ${result.data!.organisation}`,
                  };
                }
                return step;
              }
            )
          );
          /* PASO 2 */
          await animateProgress(1);
          /* PASO 3 */
          await animateProgress(2);
          setVerificationData(
            result.data
          );
          setStatus(
            'success'
          );
          /* GENERAR VISTA DEL CERTIFICADO */
          try {
            const dataUrl =
              await renderCertificateToDataUrl(
                result.data
              );
            setCertificateDataUrl(
              dataUrl
            );
          } catch (renderError) {
            console.error(
              'Error al renderizar el certificado:',
              renderError
            );
          }
        } catch (error) {
          console.error(
            'Error durante la verificación:',
            error
          );
          setErrorMessage(
            'No fue posible conectarse con el sistema de verificación. Compruebe su conexión e inténtelo nuevamente.'
          );
          setStatus(
            'error'
          );
        }
      };
    verify();
  }, [
    uuid,
    animateProgress,
    renderCertificateToDataUrl,
  ]);
  /* =========================================================
     DESCARGAR CERTIFICADO
  ========================================================= */
  const handleDownload = () => {
    if (
      !certificateDataUrl
    ) {
      return;
    }
    const link =
      document.createElement(
        'a'
      );
    link.download =
      `certificado-${uuid.slice(0, 8)}.png`;
    link.href =
      certificateDataUrl;
    link.click();
  };
  /* =========================================================
     INTERFAZ
  ========================================================= */
  return (
    <div
      className="
        min-h-screen
        bg-[#f5f8fc]
        lg:h-screen
        lg:overflow-hidden
      "
    >
      <div
        className="
          flex
          min-h-screen
          w-full
          flex-col
          lg:h-full
          lg:min-h-0
          lg:flex-row
        "
      >
        {/* =================================================
            PANEL IZQUIERDO
        ================================================= */}
        <section
          className="
            flex
            w-full
            flex-col
            border-b
            border-[#003874]/10
            bg-white
            lg:w-[44%]
            lg:border-b-0
            lg:border-r
          "
        >
          {/* =================================================
              ENCABEZADO
          ================================================= */}
          <div
            className="
              relative
              overflow-hidden
              border-b
              border-[#003874]/10
              bg-gradient-to-r
              from-[#003874]
              via-[#004b91]
              to-[#00539c]
              px-5
              py-4
              sm:px-7
            "
          >
            <div
              className="
                absolute
                -right-12
                -top-16
                h-36
                w-36
                rounded-full
                bg-[#ffde32]/15
              "
            />
            <Link
              href="/"
              className="
                relative
                z-10
                inline-flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#ffde32]
                  shadow-md
                  shadow-blue-950/20
                "
              >
                <Award
                  className="
                    h-6
                    w-6
                    text-[#003874]
                  "
                />
              </div>
              <div>
                <p
                  className="
                    text-lg
                    font-bold
                    tracking-tight
                    text-white
                  "
                >
                  CERTIFICADOS
                </p>
                <p
                  className="
                    text-xs
                    text-blue-100
                  "
                >
                  Carrera de Turismo UMSA
                </p>
              </div>
            </Link>
          </div>
          {/* =================================================
              CONTENIDO
          ================================================= */}
          <div
            className="
              flex-1
              space-y-6
              overflow-y-auto
              px-5
              py-5
              sm:px-7
              lg:px-8
            "
          >
            {/* =================================================
                ID DE VERIFICACIÓN
            ================================================= */}
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="
                rounded-2xl
                border
                border-[#003874]/10
                bg-[#f8fbff]
                p-4
              "
            >
              <div
                className="
                  mb-2
                  flex
                  items-center
                  gap-2
                "
              >
                <ShieldCheck
                  className="
                    h-4
                    w-4
                    text-[#003874]
                  "
                />
                <p
                  className="
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-[#003874]
                  "
                >
                  ID de verificación
                </p>
              </div>
              <code
                className="
                  block
                  break-all
                  rounded-lg
                  border
                  border-gray-100
                  bg-white
                  px-3
                  py-2
                  font-mono
                  text-xs
                  text-gray-600
                "
              >
                {uuid}
              </code>
            </motion.div>
            {/* =================================================
                PROGRESO
            ================================================= */}
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.05,
              }}
              className="
                space-y-4
              "
            >
              <h3
                className="
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-bold
                  text-[#003874]
                "
              >
                <ShieldCheck
                  className="
                    h-4
                    w-4
                  "
                />
                Proceso de verificación
              </h3>
              <div
                className="
                  space-y-3
                "
              >
                {steps.map(
                  (
                    step,
                    index
                  ) => (
                    <motion.div
                      key={
                        step.id
                      }
                      initial={{
                        opacity: 0,
                        x: -8,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay:
                          index *
                          0.1,
                      }}
                      className={`
                        flex
                        items-center
                        gap-4
                        rounded-xl
                        border
                        p-3
                        transition-colors
                        ${
                          step.hasError
                            ? `
                              border-red-100
                              bg-red-50
                            `
                            : step.isCompleted
                              ? `
                                border-[#003874]/10
                                bg-[#f8fbff]
                              `
                              : `
                                border-gray-100
                                bg-white
                              `
                        }
                      `}
                    >
                      {/* CÍRCULO */}
                      <div
                        className="
                          relative
                          h-11
                          w-11
                          shrink-0
                        "
                      >
                        <svg
                          viewBox="0 0 40 40"
                          className="
                            h-full
                            w-full
                            -rotate-90
                          "
                        >
                          <circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="2.5"
                            pathLength="100"
                          />
                          <circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="none"
                            stroke={
                              step.hasError
                                ? '#ef4444'
                                : step.isCompleted
                                  ? '#003874'
                                  : '#ffde32'
                            }
                            strokeWidth="3"
                            pathLength="100"
                            strokeDasharray={`${step.progress} ${100 - step.progress}`}
                            strokeLinecap="round"
                            className="
                              transition-all
                              duration-300
                            "
                          />
                        </svg>
                        <div
                          className="
                            absolute
                            inset-0
                            flex
                            items-center
                            justify-center
                          "
                        >
                          {step.hasError ? (
                            <XCircle
                              className="
                                h-4
                                w-4
                                text-red-500
                              "
                            />
                          ) : step.isCompleted ? (
                            <CheckCircle
                              className="
                                h-4
                                w-4
                                text-[#003874]
                              "
                            />
                          ) : (
                            <span
                              className="
                                text-[10px]
                                font-bold
                                text-[#003874]
                              "
                            >
                              {
                                Math.round(
                                  step.progress
                                )
                              }
                              %
                            </span>
                          )}
                        </div>
                      </div>
                      {/* TEXTO */}
                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >
                        <p
                          className={`
                            text-sm
                            font-semibold
                            ${
                              step.hasError
                                ? 'text-red-700'
                                : 'text-[#003874]'
                            }
                          `}
                        >
                          {
                            step.label
                          }
                        </p>
                        <p
                          className={`
                            mt-1
                            text-xs
                            leading-relaxed
                            ${
                              step.hasError
                                ? 'text-red-500'
                                : step.isCompleted
                                  ? 'text-gray-500'
                                  : 'text-gray-400'
                            }
                          `}
                        >
                          {step.isCompleted
                            ? step.completedText
                            : step.description
                          }
                        </p>
                      </div>
                    </motion.div>
                  )
                )}
              </div>
            </motion.div>
            {/* =================================================
                ERROR
            ================================================= */}
            {status ===
              'error' && (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.96,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                className="
                  rounded-2xl
                  border
                  border-red-200
                  bg-red-50
                  p-5
                "
              >
                <div
                  className="
                    mx-auto
                    mb-3
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-red-100
                  "
                >
                  <ShieldX
                    className="
                      h-7
                      w-7
                      text-red-600
                    "
                  />
                </div>
                <h3
                  className="
                    text-center
                    text-lg
                    font-bold
                    text-red-800
                  "
                >
                  No se pudo verificar
                </h3>
                <p
                  className="
                    mx-auto
                    mt-2
                    max-w-sm
                    text-center
                    text-sm
                    leading-relaxed
                    text-red-600
                  "
                >
                  {
                    errorMessage
                  }
                </p>
                <Link
                  href="/"
                  className="
                    mt-5
                    inline-flex
                    h-11
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#003874]
                    px-4
                    text-sm
                    font-semibold
                    text-white
                    transition-colors
                    hover:bg-[#002b59]
                  "
                >
                  <ExternalLink
                    className="
                      h-4
                      w-4
                    "
                  />
                  Volver al inicio
                </Link>
              </motion.div>
            )}
            {/* =================================================
                CARGANDO
            ================================================= */}
            {status ===
              'loading' && (
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                className="
                  flex
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-[#003874]/10
                  bg-[#f8fbff]
                  px-4
                  py-4
                "
              >
                <Loader2
                  className="
                    h-5
                    w-5
                    animate-spin
                    text-[#003874]
                  "
                />
                <span
                  className="
                    ml-2
                    text-sm
                    font-medium
                    text-[#003874]
                  "
                >
                  Verificando certificado...
                </span>
              </motion.div>
            )}
            {/* =================================================
                VERIFICACIÓN CORRECTA
            ================================================= */}
            {status ===
              'success' &&
              verificationData && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="
                  space-y-5
                "
              >
                {/* ESTADO */}
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
                      items-center
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#ffde32]
                      "
                    >
                      <ShieldCheck
                        className="
                          h-6
                          w-6
                          text-[#003874]
                        "
                      />
                    </div>
                    <div>
                      <h3
                        className="
                          text-sm
                          font-bold
                          text-[#003874]
                        "
                      >
                        Certificado verificado
                      </h3>
                      <p
                        className="
                          mt-0.5
                          text-xs
                          text-gray-600
                        "
                      >
                        La información corresponde
                        a un certificado registrado
                        en el sistema.
                      </p>
                    </div>
                  </div>
                </div>
                {/* =================================================
                    DETALLES
                ================================================= */}
                <div
                  className="
                    grid
                    grid-cols-1
                    gap-3
                    sm:grid-cols-2
                  "
                >
                  {/* INSTITUCIÓN */}
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
                        mb-2
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <Building2
                        className="
                          h-4
                          w-4
                          text-[#003874]
                        "
                      />
                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-wider
                          text-gray-400
                        "
                      >
                        Institución
                      </p>
                    </div>
                    <p
                      className="
                        text-sm
                        font-semibold
                        leading-relaxed
                        text-[#003874]
                      "
                    >
                      {
                        verificationData
                          .organisation
                      }
                    </p>
                  </div>
                  {/* EMISOR */}
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
                        mb-2
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <User
                        className="
                          h-4
                          w-4
                          text-[#003874]
                        "
                      />
                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-wider
                          text-gray-400
                        "
                      >
                        Emitido por
                      </p>
                    </div>
                    <p
                      className="
                        text-sm
                        font-semibold
                        leading-relaxed
                        text-[#003874]
                      "
                    >
                      {
                        verificationData
                          .issuerName
                      }
                    </p>
                  </div>
                  {/* EVENTO */}
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
                        mb-2
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <Award
                        className="
                          h-4
                          w-4
                          text-[#003874]
                        "
                      />
                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-wider
                          text-gray-400
                        "
                      >
                        Evento
                      </p>
                    </div>
                    <p
                      className="
                        text-sm
                        font-semibold
                        leading-relaxed
                        text-[#003874]
                      "
                    >
                      {
                        verificationData
                          .eventName
                      }
                    </p>
                  </div>
                  {/* FECHA */}
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
                        mb-2
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <Calendar
                        className="
                          h-4
                          w-4
                          text-[#003874]
                        "
                      />
                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-wider
                          text-gray-400
                        "
                      >
                        Fecha del evento
                      </p>
                    </div>
                    <p
                      className="
                        text-sm
                        font-semibold
                        capitalize
                        text-[#003874]
                      "
                    >
                      {
                        formatDate(
                          verificationData
                            .eventDate
                        )
                      }
                    </p>
                  </div>
                </div>
                {/* =================================================
                    METADATOS
                ================================================= */}
                <div
                  className="
                    border-t
                    border-gray-100
                    pt-4
                  "
                >
                  <p
                    className="
                      text-center
                      text-[10px]
                      leading-relaxed
                      text-gray-400
                    "
                  >
                    Generado:{' '}
                    {formatDate(
                      verificationData
                        .certificateGeneratedDate
                    )}
                    {' • '}
                    Verificado:{' '}
                    {formatDateTime(
                      verificationData
                        .verifiedAt
                    )}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </section>
        {/* =================================================
            PANEL DERECHO
        ================================================= */}
        <section
          className="
            flex
            min-h-[550px]
            w-full
            flex-col
            bg-[#eef2f6]
            lg:min-h-0
            lg:w-[56%]
          "
        >
          {/* =================================================
              CABECERA DE VISTA PREVIA
          ================================================= */}
          <div
            className="
              border-b
              border-[#003874]/10
              bg-white
              px-5
              py-4
              sm:px-7
            "
          >
            <div
              className="
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <h3
                  className="
                    text-base
                    font-bold
                    text-[#003874]
                  "
                >
                  Vista previa del certificado
                </h3>
                <p
                  className="
                    mt-1
                    text-xs
                    text-gray-500
                  "
                >
                  {status ===
                  'success'
                    ? `Nombre de ejemplo: ${SAMPLE_NAME}`
                    : 'El certificado se mostrará después de completar la verificación.'
                  }
                </p>
              </div>
              {status ===
                'success' &&
                certificateDataUrl && (
                <button
                  type="button"
                  onClick={
                    handleDownload
                  }
                  className="
                    inline-flex
                    h-10
                    shrink-0
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#003874]
                    px-4
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition-all
                    hover:-translate-y-0.5
                    hover:bg-[#002b59]
                  "
                >
                  <Download
                    className="
                      h-4
                      w-4
                    "
                  />
                  Descargar
                </button>
              )}
            </div>
          </div>
          {/* =================================================
              CERTIFICADO
          ================================================= */}
          <div
            className="
              flex
              flex-1
              items-center
              justify-center
              overflow-auto
              p-5
              sm:p-8
            "
          >
            {status ===
              'loading' ? (
              <div
                className="
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
                    bg-white
                    shadow-sm
                  "
                >
                  <Loader2
                    className="
                      h-8
                      w-8
                      animate-spin
                      text-[#003874]
                    "
                  />
                </div>
                <p
                  className="
                    text-sm
                    font-semibold
                    text-[#003874]
                  "
                >
                  Preparando certificado...
                </p>
                <p
                  className="
                    mt-1
                    text-xs
                    text-gray-400
                  "
                >
                  La vista previa aparecerá
                  después de la verificación.
                </p>
              </div>
            ) : status ===
              'error' ? (
              <div
                className="
                  max-w-sm
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
                    bg-red-50
                  "
                >
                  <ShieldX
                    className="
                      h-8
                      w-8
                      text-red-500
                    "
                  />
                </div>
                <p
                  className="
                    text-sm
                    font-semibold
                    text-red-700
                  "
                >
                  Vista previa no disponible
                </p>
                <p
                  className="
                    mt-1
                    text-xs
                    text-gray-400
                  "
                >
                  No fue posible verificar
                  este certificado.
                </p>
              </div>
            ) : certificateDataUrl ? (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.97,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.3,
                }}
                className="
                  flex
                  w-full
                  justify-center
                "
              >
                <div
                  className="
                    rounded-2xl
                    bg-white
                    p-3
                    shadow-2xl
                    shadow-[#003874]/15
                  "
                >
                  <img
                    src={
                      certificateDataUrl
                    }
                    alt="Certificado verificado"
                    className="
                      max-h-[calc(100vh-160px)]
                      w-full
                      rounded-xl
                      border
                      border-gray-100
                      object-contain
                    "
                  />
                </div>
              </motion.div>
            ) : (
              <div
                className="
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
                    bg-white
                    shadow-sm
                  "
                >
                  <Award
                    className="
                      h-8
                      w-8
                      text-[#003874]/30
                    "
                  />
                </div>
                <p
                  className="
                    text-sm
                    font-semibold
                    text-[#003874]
                  "
                >
                  El certificado aparecerá aquí
                </p>
                <p
                  className="
                    mt-1
                    text-xs
                    text-gray-400
                  "
                >
                  Complete el proceso de
                  verificación para visualizarlo.
                </p>
              </div>
            )}
          </div>
          {/* =================================================
              PIE
          ================================================= */}
          {status ===
            'success' &&
            certificateDataUrl && (
            <div
              className="
                border-t
                border-[#003874]/10
                bg-white
                px-5
                py-3
                text-center
              "
            >
              <p
                className="
                  text-[10px]
                  text-gray-400
                "
              >
                Documento verificado • ID:{' '}
                <span
                  className="
                    font-mono
                  "
                >
                  {uuid}
                </span>
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}