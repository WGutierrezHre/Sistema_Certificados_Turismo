'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  Calendar,
  Plus,
  FileText,
  Download,
  LayoutGrid,
  TableOfContents,
  Trash2,
} from 'lucide-react';
import { CreateCertificateModal } from '@/components/create-certificate-modal';
import { CertificateEditor } from '@/components/certificate-editor';
import { SendCertificatesModal } from '@/components/send-certificates-modal';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { Navbar } from '@/components/navbar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ViewHistoryButton } from '@/components/view-history-button';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';
import { useCertificates } from '@/context/CertificateContext';
import { Event } from '@/types/event';
import { CertificateConfig } from '@/types/certificate';
import {
  StatsCardSkeleton,
  CertificateGridSkeleton,
  CertificateTableSkeleton,
} from '@/components/dashboard-skeleton';
export default function DashboardPage() {
  const { user } = useAuth();
  const {
    events,
    isFetchingEvents,
    createEvent,
    fetchEvents,
    deleteEvent,
  } = useEvents();
  const {
    createCertificateConfig,
    getCertificateConfig,
    updateCertificateConfig,
    convertValidFieldsToEditorFields,
    convertEditorFieldsToValidFields,
  } = useCertificates();
  const showInitialLoading =
    isFetchingEvents && events.length === 0;
  const [showCreateModal, setShowCreateModal] =
    useState(false);
  const [showEditor, setShowEditor] =
    useState(false);
  const [isEditing, setIsEditing] =
    useState(false);
  const [currentEvent, setCurrentEvent] =
    useState<Event | null>(null);
  const [
    currentCertificateConfig,
    setCurrentCertificateConfig,
  ] = useState<CertificateConfig | null>(null);
  const [showSendModal, setShowSendModal] =
    useState(false);
  const [showDeleteModal, setShowDeleteModal] =
    useState(false);
  const [eventToDelete, setEventToDelete] =
    useState<Event | null>(null);
  const [certificateImages, setCertificateImages] =
    useState<Record<string, string>>({});
  const [viewMode, setViewMode] =
    useState<'grid' | 'table'>('table');
  const [
    selectedEventForPreview,
    setSelectedEventForPreview,
  ] = useState<Event | null>(null);
  /* ==========================================
     CARGAR EVENTOS
  ========================================== */
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  /* ==========================================
     MAPEO DE IMÁGENES
  ========================================== */
  useEffect(() => {
    const images: Record<string, string> = {};
    events.forEach((event) => {
      if (event.certificateConfig?.imagePath) {
        images[event.id] =
          event.certificateConfig.imagePath;
      }
    });
    setCertificateImages(images);
  }, [events]);
  /* ==========================================
     FORMATO DE FECHA
  ========================================== */
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      'es-BO',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
    );
  };
  /* ==========================================
     CREAR CERTIFICADO
  ========================================== */
  const handleCreateCertificate = async (
    eventName: string,
    issuerName: string
  ) => {
    const newEvent = await createEvent({
      eventName,
      issuerName,
      date: new Date().toISOString(),
    });
    if (newEvent) {
      setCurrentEvent(newEvent);
      setCurrentCertificateConfig(null);
      setIsEditing(false);
      setShowEditor(true);
      setShowCreateModal(false);
    }
  };
  /* ==========================================
     GUARDAR CERTIFICADO
  ========================================== */
  const handleSaveCertificate = async (
    updatedCertificate: {
      fields: Record<
        string,
        {
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
      >;
      image?: string;
    }
  ) => {
    if (!currentEvent) return;
    const {
      fields: editorFields,
      image,
    } = updatedCertificate;
    const validFields =
      convertEditorFieldsToValidFields(
        editorFields
      );
    const requestPayload = {
      eventId: currentEvent.id,
      imagePath:
        image ||
        '/placeholder-certificate.jpg',
      validFields,
    };
    try {
      let config;
      if (
        isEditing &&
        currentCertificateConfig
      ) {
        config =
          await updateCertificateConfig(
            currentCertificateConfig.id,
            requestPayload
          );
      } else {
        config =
          await createCertificateConfig(
            requestPayload
          );
      }
      if (config && image) {
        setCertificateImages((prev) => ({
          ...prev,
          [currentEvent.id]: image,
        }));
      }
      setShowEditor(false);
      setCurrentEvent(null);
      setIsEditing(false);
      setCurrentCertificateConfig(null);
      await fetchEvents();
    } catch (error) {
      console.error(
        'Error al guardar el certificado:',
        error
      );
    }
  };
  /* ==========================================
     EDITAR CERTIFICADO
  ========================================== */
  const handleEditCertificate = async (
    event: Event
  ) => {
    setCurrentEvent(event);
    setIsEditing(true);
    if (event.certificateConfig) {
      const config: CertificateConfig = {
        id: event.certificateConfig.id,
        eventId: event.id,
        imagePath:
          event.certificateConfig.imagePath,
        validFields:
          event.certificateConfig.validFields,
        createdAt:
          event.certificateConfig.createdAt,
        updatedAt:
          event.certificateConfig.updatedAt,
      };
      setCurrentCertificateConfig(config);
    } else {
      const config =
        await getCertificateConfig(event.id);
      setCurrentCertificateConfig(config);
    }
    setShowEditor(true);
  };
  /* ==========================================
     ELIMINAR CERTIFICADO
  ========================================== */
  const handleDeleteCertificate = (
    event: Event
  ) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };
  const confirmDeleteCertificate =
    async () => {
      if (!eventToDelete) return;
      const success =
        await deleteEvent(
          eventToDelete.id
        );
      if (success) {
        setCertificateImages((prev) => {
          const updated = {
            ...prev,
          };
          delete updated[
            eventToDelete.id
          ];
          return updated;
        });
        setEventToDelete(null);
        setSelectedEventForPreview(
          (current) =>
            current?.id ===
            eventToDelete.id
              ? null
              : current
        );
      }
    };
  /* ==========================================
     DESCARGAR CERTIFICADO DE MUESTRA
  ========================================== */
  const handleDownloadSample =
    async (event: Event) => {
      if (!event.certificateConfig) {
        console.error(
          'No existe configuración para este certificado'
        );
        return;
      }
      try {
        const canvas =
          document.createElement(
            'canvas'
          );
        const ctx =
          canvas.getContext('2d');
        const imageUrl =
          certificateImages[event.id];
        if (!imageUrl) {
          console.error(
            'No existe una imagen para este certificado'
          );
          return;
        }
        const response =
          await fetch(imageUrl);
        const blob =
          await response.blob();
        const img =
          new window.Image();
        const objectUrl =
          URL.createObjectURL(blob);
        img.onload = () => {
          canvas.width =
            img.width;
          canvas.height =
            img.height;
          ctx?.drawImage(
            img,
            0,
            0
          );
          if (
            ctx &&
            event.certificateConfig
          ) {
            ctx.fillStyle =
              '#000000';
            const drawCenteredText = (
              text: string,
              position: {
                x: number;
                y: number;
                width: number;
                height: number;
                fontFamily?: string;
                fontWeight?: string;
                fontStyle?: string;
                textDecoration?: string;
                color?: string;
              },
              maxFontSize = 72
            ) => {
              ctx.fillStyle =
                position.color ||
                '#000000';
              const calculatedFontSize =
                Math.min(
                  (
                    position.width /
                    Math.max(
                      text.length,
                      1
                    )
                  ) * 1.5,
                  position.height *
                    0.8,
                  maxFontSize
                );
              const fontSize =
                Math.max(
                  calculatedFontSize,
                  8
                );
              const fontFamily =
                position.fontFamily ||
                'Inter';
              const fontWeight =
                position.fontWeight ||
                'normal';
              const fontStyle =
                position.fontStyle ||
                'normal';
              ctx.font =
                `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
              let textMetrics =
                ctx.measureText(text);
              let adjustedFontSize =
                fontSize;
              while (
                (
                  textMetrics.width >
                    position.width *
                      0.9 ||
                  adjustedFontSize >
                    position.height *
                      0.8
                ) &&
                adjustedFontSize > 8
              ) {
                adjustedFontSize -= 2;
                ctx.font =
                  `${fontStyle} ${fontWeight} ${adjustedFontSize}px ${fontFamily}`;
                textMetrics =
                  ctx.measureText(text);
              }
              const textX =
                position.x +
                (
                  position.width -
                  textMetrics.width
                ) /
                  2;
              const textY =
                position.y +
                (
                  position.height +
                  adjustedFontSize *
                    0.3
                ) /
                  2;
              ctx.fillText(
                text,
                textX,
                textY
              );
              if (
                position.textDecoration ===
                'underline'
              ) {
                ctx.strokeStyle =
                  position.color ||
                  '#000000';
                ctx.beginPath();
                ctx.moveTo(
                  textX,
                  textY + 2
                );
                ctx.lineTo(
                  textX +
                    textMetrics.width,
                  textY + 2
                );
                ctx.stroke();
              }
            };
            Object.entries(
              event
                .certificateConfig
                .validFields
            ).forEach(
              ([fieldType, position]) => {
                let sampleText = '';
                switch (fieldType) {
                  case 'recipientName':
                    sampleText =
                      'Juan Pérez';
                    break;
                  case 'organisationName':
                    sampleText =
                      event.issuerName ||
                      'Carrera de Turismo UMSA';
                    break;
                  case 'certificateLink':
                    sampleText =
                      'https://certificados.umsa.bo';
                    break;
                  case 'certificateQR':
                    sampleText =
                      '[Código QR]';
                    break;
                  case 'rank':
                    sampleText =
                      '1.er lugar';
                    break;
                }
                if (position) {
                  drawCenteredText(
                    sampleText,
                    position,
                    72
                  );
                }
              }
            );
          }
          try {
            const link =
              document.createElement(
                'a'
              );
            link.download =
              `${event.eventName}-certificado-muestra.png`;
            link.href =
              canvas.toDataURL();
            link.click();
          } catch (error) {
            console.error(
              'Error al generar el certificado:',
              error
            );
            alert(
              'No se pudo generar el certificado de muestra.'
            );
          }
          URL.revokeObjectURL(
            objectUrl
          );
        };
        img.onerror = () => {
          console.error(
            'No se pudo cargar la imagen del certificado'
          );
          alert(
            'No se pudo cargar la imagen del certificado.'
          );
          URL.revokeObjectURL(
            objectUrl
          );
        };
        img.src =
          objectUrl;
      } catch (error) {
        console.error(
          'Error al descargar el certificado:',
          error
        );
        alert(
          'Ocurrió un error al descargar el certificado.'
        );
      }
    };
  /* ==========================================
     INTERFAZ
  ========================================== */
  return (
    <ProtectedRoute>
      <div
        className="
          min-h-screen
          bg-[#f6f8fb]
          text-gray-900
        "
      >
        {/* NAVBAR */}
        <Navbar
          onCreateNew={() =>
            setShowCreateModal(true)
          }
          onSendCertificates={() =>
            setShowSendModal(true)
          }
        />
        <div
          className="
            container
            mx-auto
            px-4
            sm:px-6
            py-6
            sm:py-8
          "
        >
          {/* =====================================
              BIENVENIDA
          ====================================== */}
          <motion.section
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            className="
              relative
              overflow-hidden
              mb-8
              rounded-3xl
              bg-gradient-to-br
              from-[#003874]
              via-[#004b91]
              to-[#00539c]
              shadow-xl
              shadow-blue-950/10
            "
          >
            {/* DECORACIÓN */}
            <div
              className="
                absolute
                -right-20
                -top-20
                h-64
                w-64
                rounded-full
                bg-[#ffde32]/15
              "
            />
            <div
              className="
                absolute
                -bottom-24
                right-20
                h-52
                w-52
                rounded-full
                bg-white/5
              "
            />
            <div
              className="
                relative
                z-10
                px-6
                py-8
                sm:px-9
                sm:py-10
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-6
                  md:flex-row
                  md:items-center
                  md:justify-between
                "
              >
                <div>
                  <div
                    className="
                      mb-4
                      inline-flex
                      items-center
                      rounded-full
                      bg-[#ffde32]
                      px-4
                      py-1.5
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-[#003874]
                    "
                  >
                    Sistema de Certificados
                  </div>
                  <h1
                    className="
                      text-2xl
                      font-bold
                      text-white
                      sm:text-3xl
                      lg:text-4xl
                    "
                  >
                    Bienvenido,
                    {' '}
                    <span
                      className="
                        text-[#ffde32]
                      "
                    >
                      {user?.organisation ||
                        'Usuario'}
                    </span>
                  </h1>
                  <p
                    className="
                      mt-3
                      max-w-2xl
                      text-sm
                      leading-relaxed
                      text-blue-100
                      sm:text-base
                    "
                  >
                    Administra, diseña y gestiona
                    los certificados académicos
                    desde un solo lugar.
                  </p>
                </div>
                <Button
                  onClick={() =>
                    setShowCreateModal(
                      true
                    )
                  }
                  className="
                    h-12
                    shrink-0
                    rounded-xl
                    bg-[#ffde32]
                    px-6
                    font-bold
                    text-[#003874]
                    shadow-lg
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:bg-[#f5d000]
                    hover:text-[#003874]
                  "
                >
                  <Plus
                    className="
                      mr-2
                      h-5
                      w-5
                    "
                  />
                  Nuevo certificado
                </Button>
              </div>
            </div>
          </motion.section>
          {/* =====================================
              RESUMEN
              SIN TARJETAS PREMIUM
          ====================================== */}
          <section
            className="
              mb-8
            "
          >
            {showInitialLoading ? (
              <div
                className="
                  max-w-sm
                "
              >
                <StatsCardSkeleton />
              </div>
            ) : (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.1,
                }}
                className="
                  max-w-sm
                "
              >
                <Card
                  className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-[#003874]/10
                    bg-white
                    shadow-[0_8px_30px_rgba(0,56,116,0.08)]
                  "
                >
                  <CardContent
                    className="
                      p-0
                    "
                  >
                    <div
                      className="
                        h-1.5
                        w-full
                        bg-[#ffde32]
                      "
                    />
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        p-6
                      "
                    >
                      <div>
                        <p
                          className="
                            text-sm
                            font-medium
                            text-gray-500
                          "
                        >
                          Certificados registrados
                        </p>
                        <p
                          className="
                            mt-1
                            text-4xl
                            font-bold
                            text-[#003874]
                          "
                        >
                          {events.length}
                        </p>
                        <p
                          className="
                            mt-2
                            text-xs
                            text-gray-400
                          "
                        >
                          Total de eventos creados
                        </p>
                      </div>
                      <div
                        className="
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
                        <Award
                          className="
                            h-7
                            w-7
                          "
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </section>
          {/* =====================================
              CERTIFICADOS
          ====================================== */}
          <motion.section
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="
              mb-8
            "
          >
            {/* CABECERA */}
            <div
              className="
                mb-5
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <h2
                  className="
                    text-xl
                    font-bold
                    text-[#003874]
                    sm:text-2xl
                  "
                >
                  Mis certificados
                </h2>
                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-500
                  "
                >
                  Administra los certificados y
                  eventos registrados en el sistema.
                </p>
              </div>
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-3
                "
              >
                {/* CAMBIO DE VISTA */}
                <div
                  className="
                    flex
                    items-center
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    p-1
                    shadow-sm
                  "
                >
                  <button
                    onClick={() =>
                      setViewMode(
                        'table'
                      )
                    }
                    className={`
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-lg
                      transition-all
                      ${
                        viewMode ===
                        'table'
                          ? `
                            bg-[#003874]
                            text-white
                            shadow-sm
                          `
                          : `
                            text-gray-400
                            hover:bg-[#eef5ff]
                            hover:text-[#003874]
                          `
                      }
                    `}
                    title="Vista de tabla"
                    aria-label="Vista de tabla"
                  >
                    <TableOfContents
                      className="
                        h-4
                        w-4
                      "
                    />
                  </button>
                  <button
                    onClick={() =>
                      setViewMode(
                        'grid'
                      )
                    }
                    className={`
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-lg
                      transition-all
                      ${
                        viewMode ===
                        'grid'
                          ? `
                            bg-[#003874]
                            text-white
                            shadow-sm
                          `
                          : `
                            text-gray-400
                            hover:bg-[#eef5ff]
                            hover:text-[#003874]
                          `
                      }
                    `}
                    title="Vista de tarjetas"
                    aria-label="Vista de tarjetas"
                  >
                    <LayoutGrid
                      className="
                        h-4
                        w-4
                      "
                    />
                  </button>
                </div>
                <ViewHistoryButton />
              </div>
            </div>
            {/* =====================================
                CARGANDO
            ====================================== */}
            {showInitialLoading ? (
              viewMode === 'grid' ? (
                <CertificateGridSkeleton />
              ) : (
                <CertificateTableSkeleton />
              )
            ) : events.length === 0 ? (
              /* ===================================
                 SIN CERTIFICADOS
              ==================================== */
              <Card
                className="
                  overflow-hidden
                  rounded-3xl
                  border
                  border-gray-100
                  bg-white
                  shadow-[0_10px_40px_rgba(0,56,116,0.07)]
                "
              >
                <CardContent
                  className="
                    flex
                    flex-col
                    items-center
                    px-6
                    py-16
                    text-center
                  "
                >
                  <div
                    className="
                      mb-5
                      flex
                      h-20
                      w-20
                      items-center
                      justify-center
                      rounded-3xl
                      bg-[#eef5ff]
                    "
                  >
                    <Award
                      className="
                        h-10
                        w-10
                        text-[#003874]
                      "
                    />
                  </div>
                  <h3
                    className="
                      text-xl
                      font-bold
                      text-[#003874]
                    "
                  >
                    Aún no existen certificados
                  </h3>
                  <p
                    className="
                      mt-2
                      max-w-md
                      text-sm
                      leading-relaxed
                      text-gray-500
                    "
                  >
                    Cree su primer certificado para
                    comenzar a gestionar sus eventos
                    académicos.
                  </p>
                  <Button
                    onClick={() =>
                      setShowCreateModal(
                        true
                      )
                    }
                    className="
                      mt-6
                      h-11
                      rounded-xl
                      bg-[#003874]
                      px-6
                      font-semibold
                      text-white
                      hover:bg-[#002b59]
                    "
                  >
                    <Plus
                      className="
                        mr-2
                        h-4
                        w-4
                      "
                    />
                    Crear certificado
                  </Button>
                </CardContent>
              </Card>
            ) : viewMode === 'grid' ? (
              /* ===================================
                 VISTA TARJETAS
              ==================================== */
              <div
                className="
                  grid
                  grid-cols-1
                  gap-5
                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >
                {events.map(
                  (event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{
                        opacity: 0,
                        scale: 0.97,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      transition={{
                        delay:
                          index * 0.05,
                      }}
                    >
                      <Card
                        className="
                          group
                          flex
                          h-full
                          flex-col
                          overflow-hidden
                          rounded-2xl
                          border
                          border-gray-100
                          bg-white
                          shadow-[0_8px_30px_rgba(0,56,116,0.06)]
                          transition-all
                          duration-300
                          hover:-translate-y-1
                          hover:border-[#003874]/20
                          hover:shadow-[0_15px_40px_rgba(0,56,116,0.12)]
                        "
                      >
                        <div
                          className="
                            h-1
                            w-full
                            bg-[#ffde32]
                          "
                        />
                        <CardContent
                          className="
                            flex
                            h-full
                            flex-col
                            p-6
                          "
                        >
                          <div
                            className="
                              mb-4
                              flex
                              items-start
                              justify-between
                              gap-3
                            "
                          >
                            <div
                              className="
                                min-w-0
                              "
                            >
                              <h3
                                className="
                                  truncate
                                  text-base
                                  font-bold
                                  text-[#003874]
                                "
                              >
                                {event.eventName}
                              </h3>
                              <p
                                className="
                                  mt-1
                                  truncate
                                  text-sm
                                  text-gray-500
                                "
                              >
                                {event.issuerName}
                              </p>
                            </div>
                            <div
                              className="
                                flex
                                shrink-0
                                items-center
                                rounded-lg
                                bg-[#eef5ff]
                                px-2.5
                                py-1.5
                                text-xs
                                font-medium
                                text-[#003874]
                              "
                            >
                              <Calendar
                                className="
                                  mr-1.5
                                  h-3.5
                                  w-3.5
                                "
                              />
                              {formatDate(
                                event.date
                              )}
                            </div>
                          </div>
                          {/* IMAGEN */}
                          {certificateImages[
                            event.id
                          ] ? (
                            <div
                              className="
                                mb-5
                                overflow-hidden
                                rounded-xl
                                border
                                border-gray-100
                                bg-gray-50
                              "
                            >
                              <Image
                                src={
                                  certificateImages[
                                    event.id
                                  ]
                                }
                                alt={`Certificado de ${event.eventName}`}
                                width={400}
                                height={200}
                                className="
                                  h-48
                                  w-full
                                  object-cover
                                  object-center
                                  transition-transform
                                  duration-500
                                  group-hover:scale-[1.02]
                                "
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div
                              className="
                                mb-5
                                flex
                                h-48
                                items-center
                                justify-center
                                rounded-xl
                                border-2
                                border-dashed
                                border-gray-200
                                bg-gray-50
                              "
                            >
                              <div
                                className="
                                  text-center
                                "
                              >
                                <FileText
                                  className="
                                    mx-auto
                                    h-9
                                    w-9
                                    text-gray-300
                                  "
                                />
                                <p
                                  className="
                                    mt-2
                                    text-xs
                                    text-gray-400
                                  "
                                >
                                  Sin diseño configurado
                                </p>
                              </div>
                            </div>
                          )}
                          {/* ACCIONES */}
                          <div
                            className="
                              mt-auto
                              flex
                              gap-2
                            "
                          >
                            <Button
                              onClick={() =>
                                handleEditCertificate(
                                  event
                                )
                              }
                              size="sm"
                              className="
                                flex-1
                                rounded-xl
                                bg-[#003874]
                                font-semibold
                                text-white
                                hover:bg-[#002b59]
                              "
                            >
                              <FileText
                                className="
                                  mr-2
                                  h-4
                                  w-4
                                "
                              />
                              Editar
                            </Button>
                            {event.certificateConfig && (
                              <Button
                                onClick={() =>
                                  handleDownloadSample(
                                    event
                                  )
                                }
                                variant="outline"
                                size="sm"
                                className="
                                  rounded-xl
                                  border-[#003874]/20
                                  text-[#003874]
                                  hover:bg-[#eef5ff]
                                  hover:text-[#003874]
                                "
                                title="Descargar muestra"
                                aria-label="Descargar muestra"
                              >
                                <Download
                                  className="
                                    h-4
                                    w-4
                                  "
                                />
                              </Button>
                            )}
                            <Button
                              onClick={() =>
                                handleDeleteCertificate(
                                  event
                                )
                              }
                              variant="outline"
                              size="sm"
                              className="
                                rounded-xl
                                border-red-200
                                text-red-600
                                hover:bg-red-50
                                hover:text-red-700
                              "
                              title="Eliminar"
                              aria-label="Eliminar certificado"
                            >
                              <Trash2
                                className="
                                  h-4
                                  w-4
                                "
                              />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                )}
              </div>
            ) : (
              /* ===================================
                 VISTA TABLA
              ==================================== */
              <div
                className="
                  flex
                  flex-col
                  gap-5
                  lg:h-[610px]
                  lg:flex-row
                "
              >
                {/* TABLA */}
                <Card
                  className="
                    flex
                    h-full
                    flex-1
                    flex-col
                    overflow-hidden
                    rounded-2xl
                    border
                    border-gray-100
                    bg-white
                    shadow-[0_8px_30px_rgba(0,56,116,0.06)]
                  "
                >
                  <div
                    className="
                      w-full
                      flex-1
                      overflow-auto
                    "
                  >
                    <table
                      className="
                        w-full
                        text-left
                        text-sm
                      "
                    >
                      <thead
                        className="
                          sticky
                          top-0
                          z-10
                          border-b
                          border-[#003874]/10
                          bg-[#f1f6fb]
                          text-xs
                          uppercase
                          tracking-wide
                          text-[#003874]
                        "
                      >
                        <tr>
                          <th
                            className="
                              px-6
                              py-4
                              font-bold
                            "
                          >
                            Evento
                          </th>
                          <th
                            className="
                              px-6
                              py-4
                              font-bold
                            "
                          >
                            Emisor
                          </th>
                          <th
                            className="
                              w-36
                              px-6
                              py-4
                              font-bold
                            "
                          >
                            Fecha
                          </th>
                          <th
                            className="
                              w-36
                              px-6
                              py-4
                              text-right
                              font-bold
                            "
                          >
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody
                        className="
                          divide-y
                          divide-gray-100
                        "
                      >
                        {events.map(
                          (event) => (
                            <tr
                              key={event.id}
                              onClick={() =>
                                setSelectedEventForPreview(
                                  event
                                )
                              }
                              className={`
                                group
                                cursor-pointer
                                transition-all
                                ${
                                  selectedEventForPreview?.id ===
                                  event.id
                                    ? `
                                      bg-[#fff9d8]
                                    `
                                    : `
                                      bg-white
                                      hover:bg-[#f8fbff]
                                    `
                                }
                              `}
                            >
                              <td
                                className="
                                  px-6
                                  py-4
                                "
                              >
                                <div
                                  className="
                                    font-semibold
                                    text-[#003874]
                                  "
                                >
                                  {event.eventName}
                                </div>
                              </td>
                              <td
                                className="
                                  px-6
                                  py-4
                                  text-gray-600
                                "
                              >
                                {event.issuerName}
                              </td>
                              <td
                                className="
                                  whitespace-nowrap
                                  px-6
                                  py-4
                                  text-gray-500
                                "
                              >
                                <div
                                  className="
                                    flex
                                    items-center
                                  "
                                >
                                  <Calendar
                                    className="
                                      mr-1.5
                                      h-3.5
                                      w-3.5
                                      text-[#003874]
                                    "
                                  />
                                  {formatDate(
                                    event.date
                                  )}
                                </div>
                              </td>
                              <td
                                className="
                                  px-6
                                  py-4
                                  text-right
                                "
                              >
                                <div
                                  className="
                                    flex
                                    justify-end
                                    gap-1
                                  "
                                >
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditCertificate(
                                        event
                                      );
                                    }}
                                    variant="ghost"
                                    size="icon"
                                    className="
                                      h-9
                                      w-9
                                      rounded-lg
                                      text-gray-500
                                      hover:bg-[#eef5ff]
                                      hover:text-[#003874]
                                    "
                                    title="Editar certificado"
                                    aria-label="Editar certificado"
                                  >
                                    <FileText
                                      className="
                                        h-4
                                        w-4
                                      "
                                    />
                                  </Button>
                                  {event.certificateConfig && (
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadSample(
                                          event
                                        );
                                      }}
                                      variant="ghost"
                                      size="icon"
                                      className="
                                        h-9
                                        w-9
                                        rounded-lg
                                        text-gray-500
                                        hover:bg-[#fff9d8]
                                        hover:text-[#003874]
                                      "
                                      title="Descargar muestra"
                                      aria-label="Descargar muestra"
                                    >
                                      <Download
                                        className="
                                          h-4
                                          w-4
                                        "
                                      />
                                    </Button>
                                  )}
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCertificate(
                                        event
                                      );
                                    }}
                                    variant="ghost"
                                    size="icon"
                                    className="
                                      h-9
                                      w-9
                                      rounded-lg
                                      text-gray-500
                                      hover:bg-red-50
                                      hover:text-red-600
                                    "
                                    title="Eliminar certificado"
                                    aria-label="Eliminar certificado"
                                  >
                                    <Trash2
                                      className="
                                        h-4
                                        w-4
                                      "
                                    />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
                {/* =================================
                    PANEL DE VISTA PREVIA
                ================================== */}
                <div
                  className="
                    w-full
                    lg:h-full
                    lg:w-1/3
                    lg:min-w-[320px]
                    lg:max-w-[400px]
                    lg:flex-shrink-0
                  "
                >
                  {selectedEventForPreview ? (
                    <Card
                      className="
                        flex
                        h-full
                        flex-col
                        overflow-hidden
                        rounded-2xl
                        border
                        border-gray-100
                        bg-white
                        shadow-[0_8px_30px_rgba(0,56,116,0.07)]
                      "
                    >
                      {/* CABECERA PREVIEW */}
                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          border-b
                          border-[#003874]/10
                          bg-[#003874]
                          px-5
                          py-4
                        "
                      >
                        <h3
                          className="
                            flex
                            items-center
                            font-bold
                            text-white
                          "
                        >
                          <LayoutGrid
                            className="
                              mr-2
                              h-4
                              w-4
                              text-[#ffde32]
                            "
                          />
                          Vista previa
                        </h3>
                        {selectedEventForPreview
                          .certificateConfig && (
                          <Badge
                            variant="outline"
                            className="
                              border-[#ffde32]
                              bg-[#ffde32]
                              font-semibold
                              text-[#003874]
                            "
                          >
                            Configurado
                          </Badge>
                        )}
                      </div>
                      <CardContent
                        className="
                          flex
                          h-full
                          flex-col
                          overflow-y-auto
                          p-6
                        "
                      >
                        {/* NOMBRE */}
                        <div
                          className="
                            mb-5
                          "
                        >
                          <p
                            className="
                              mb-1
                              text-xs
                              font-semibold
                              uppercase
                              tracking-wider
                              text-gray-400
                            "
                          >
                            Nombre del evento
                          </p>
                          <h4
                            className="
                              text-lg
                              font-bold
                              leading-tight
                              text-[#003874]
                            "
                          >
                            {
                              selectedEventForPreview
                                .eventName
                            }
                          </h4>
                        </div>
                        {/* DATOS */}
                        <div
                          className="
                            mb-6
                            grid
                            grid-cols-2
                            gap-4
                          "
                        >
                          <div>
                            <p
                              className="
                                mb-1
                                text-xs
                                font-semibold
                                uppercase
                                tracking-wider
                                text-gray-400
                              "
                            >
                              Emisor
                            </p>
                            <p
                              className="
                                text-sm
                                font-medium
                                text-gray-700
                              "
                            >
                              {
                                selectedEventForPreview
                                  .issuerName
                              }
                            </p>
                          </div>
                          <div>
                            <p
                              className="
                                mb-1
                                text-xs
                                font-semibold
                                uppercase
                                tracking-wider
                                text-gray-400
                              "
                            >
                              Fecha
                            </p>
                            <p
                              className="
                                flex
                                items-center
                                text-sm
                                font-medium
                                text-gray-700
                              "
                            >
                              <Calendar
                                className="
                                  mr-1
                                  h-3.5
                                  w-3.5
                                  text-[#003874]
                                "
                              />
                              {formatDate(
                                selectedEventForPreview
                                  .date
                              )}
                            </p>
                          </div>
                        </div>
                        {/* IMAGEN PREVIEW */}
                        {certificateImages[
                          selectedEventForPreview
                            .id
                        ] ? (
                          <div
                            className="
                              mb-6
                              mt-2
                              shrink-0
                              overflow-hidden
                              rounded-xl
                              border
                              border-gray-100
                              bg-gray-50
                              shadow-sm
                            "
                          >
                            <Image
                              src={
                                certificateImages[
                                  selectedEventForPreview
                                    .id
                                ]
                              }
                              alt={`Certificado de ${selectedEventForPreview.eventName}`}
                              width={400}
                              height={300}
                              className="
                                max-h-[300px]
                                h-auto
                                w-full
                                object-contain
                              "
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div
                            className="
                              mb-6
                              mt-2
                              flex
                              h-[200px]
                              shrink-0
                              flex-col
                              items-center
                              justify-center
                              rounded-xl
                              border-2
                              border-dashed
                              border-[#003874]/15
                              bg-[#f8fbff]
                              p-8
                              text-center
                            "
                          >
                            <div
                              className="
                                flex
                                h-14
                                w-14
                                items-center
                                justify-center
                                rounded-2xl
                                bg-[#eef5ff]
                              "
                            >
                              <FileText
                                className="
                                  h-7
                                  w-7
                                  text-[#003874]
                                "
                              />
                            </div>
                            <p
                              className="
                                mt-3
                                text-sm
                                font-semibold
                                text-[#003874]
                              "
                            >
                              Sin diseño configurado
                            </p>
                            <p
                              className="
                                mt-1
                                text-xs
                                text-gray-400
                              "
                            >
                              Edite el certificado para
                              agregar un diseño.
                            </p>
                          </div>
                        )}
                        {/* BOTONES */}
                        <div
                          className="
                            mt-auto
                            flex
                            flex-col
                            gap-2
                          "
                        >
                          <Button
                            onClick={() =>
                              handleEditCertificate(
                                selectedEventForPreview
                              )
                            }
                            className="
                              h-11
                              w-full
                              rounded-xl
                              bg-[#003874]
                              font-semibold
                              text-white
                              shadow-sm
                              hover:bg-[#002b59]
                            "
                          >
                            <FileText
                              className="
                                mr-2
                                h-4
                                w-4
                              "
                            />
                            Editar certificado
                          </Button>
                          <div
                            className="
                              grid
                              grid-cols-2
                              gap-2
                            "
                          >
                            {selectedEventForPreview
                              .certificateConfig && (
                              <Button
                                onClick={() =>
                                  handleDownloadSample(
                                    selectedEventForPreview
                                  )
                                }
                                variant="outline"
                                className="
                                  w-full
                                  rounded-xl
                                  border-[#ffde32]
                                  bg-[#fffdf0]
                                  font-semibold
                                  text-[#003874]
                                  hover:bg-[#ffde32]
                                  hover:text-[#003874]
                                "
                              >
                                <Download
                                  className="
                                    mr-2
                                    h-4
                                    w-4
                                  "
                                />
                                Descargar
                              </Button>
                            )}
                            <Button
                              onClick={() =>
                                handleDeleteCertificate(
                                  selectedEventForPreview
                                )
                              }
                              variant="outline"
                              className="
                                w-full
                                rounded-xl
                                border-red-200
                                font-semibold
                                text-red-600
                                hover:bg-red-50
                                hover:text-red-700
                              "
                            >
                              <Trash2
                                className="
                                  mr-2
                                  h-4
                                  w-4
                                "
                              />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    /* SIN SELECCIÓN */
                    <Card
                      className="
                        flex
                        h-full
                        items-center
                        justify-center
                        rounded-2xl
                        border-2
                        border-dashed
                        border-[#003874]/15
                        bg-white
                        text-gray-400
                        shadow-none
                      "
                    >
                      <div
                        className="
                          p-8
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
                            bg-[#eef5ff]
                          "
                        >
                          <TableOfContents
                            className="
                              h-8
                              w-8
                              text-[#003874]
                            "
                          />
                        </div>
                        <h3
                          className="
                            font-semibold
                            text-[#003874]
                          "
                        >
                          Ningún certificado seleccionado
                        </h3>
                        <p
                          className="
                            mt-2
                            text-sm
                            leading-relaxed
                            text-gray-400
                          "
                        >
                          Seleccione un evento de la
                          tabla para ver sus detalles.
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </motion.section>
        </div>
        {/* ==========================================
            MODALES
        ========================================== */}
        <CreateCertificateModal
          open={showCreateModal}
          onClose={() =>
            setShowCreateModal(false)
          }
          onSubmit={
            handleCreateCertificate
          }
        />
        {showEditor &&
          currentEvent && (
          <CertificateEditor
            certificate={{
              id:
                currentEvent.id,
              name:
                currentEvent.eventName,
              event:
                currentEvent.issuerName,
              date:
                formatDate(
                  currentEvent.date
                ),
              image:
                currentCertificateConfig
                  ?.imagePath,
              fields:
                currentCertificateConfig
                  ? convertValidFieldsToEditorFields(
                      currentCertificateConfig
                        .validFields
                    )
                  : {},
            }}
            isEditing={
              isEditing
            }
            onSave={(
              updatedCertificate
            ) => {
              handleSaveCertificate(
                updatedCertificate
              );
            }}
            onClose={() => {
              setShowEditor(false);
              setCurrentEvent(null);
              setCurrentCertificateConfig(
                null
              );
              setIsEditing(false);
            }}
          />
        )}
        <SendCertificatesModal
          open={showSendModal}
          certificates={events
            .filter(
              (event) =>
                event.certificateConfig
            )
            .map((event) => ({
              id:
                event.id,
              name:
                event.eventName,
              event:
                event.issuerName,
              date:
                formatDate(
                  event.date
                ),
              image:
                certificateImages[
                  event.id
                ] ||
                '/placeholder-certificate.jpg',
              fields: {},
            }))}
          onClose={() =>
            setShowSendModal(false)
          }
        />
        <DeleteConfirmationModal
          open={showDeleteModal}
          eventName={
            eventToDelete?.eventName ||
            ''
          }
          onClose={() => {
            setShowDeleteModal(false);
            setEventToDelete(null);
          }}
          onConfirm={
            confirmDeleteCertificate
          }
        />
      </div>
    </ProtectedRoute>
  );
}